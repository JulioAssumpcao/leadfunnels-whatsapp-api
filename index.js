const express = require("express");
const cors = require("cors");
const qrcode = require("qrcode-terminal");
const pino = require("pino");

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys");

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

const PORT = process.env.SERVER_PORT || process.env.PORT || 2401;
const sessions = {};

function normalizePhoneToJid(phone) {
  if (!phone) return null;

  const cleanPhone = String(phone).trim();

  if (cleanPhone.includes("@s.whatsapp.net")) return cleanPhone;
  if (cleanPhone.includes("@g.us")) return cleanPhone;
  if (cleanPhone.includes("@lid")) return cleanPhone;

  const onlyNumbers = cleanPhone.replace(/\D/g, "");
  return `${onlyNumbers}@s.whatsapp.net`;
}

function cleanPhone(phoneOrJid) {
  if (!phoneOrJid) return null;

  return String(phoneOrJid)
    .replace("@s.whatsapp.net", "")
    .replace("@g.us", "")
    .replace("@lid", "")
    .replace(/\D/g, "");
}

async function connectInstance(instanceId) {
  if (sessions[instanceId]?.sock) {
    return sessions[instanceId];
  }

  const { state, saveCreds } = await useMultiFileAuthState(`./sessions/${instanceId}`);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false,
    logger: pino({ level: "silent" }),
    browser: ["Lead Funnels", "Chrome", "1.0.0"]
  });

  sessions[instanceId] = {
    sock,
    status: "connecting",
    qr: null,
    phone: null,
    name: null
  };

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      sessions[instanceId].qr = qr;
      sessions[instanceId].status = "connecting";

      console.log(`QR CODE DA INSTÂNCIA: ${instanceId}`);
      qrcode.generate(qr, { small: true });
    }

    if (connection === "open") {
      const user = sock.user || {};

      sessions[instanceId].status = "connected";
      sessions[instanceId].qr = null;
      sessions[instanceId].phone = cleanPhone(user.id);
      sessions[instanceId].name = user.name || user.verifiedName || null;

      console.log(`WhatsApp conectado: ${instanceId}`);
    }

    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

      sessions[instanceId].status = "disconnected";

      if (shouldReconnect) {
        console.log(`Reconectando instância: ${instanceId}`);
        delete sessions[instanceId];

        setTimeout(() => {
          connectInstance(instanceId);
        }, 3000);
      } else {
        console.log(`Instância deslogada: ${instanceId}`);
      }
    }
  });

  return sessions[instanceId];
}

app.get("/", (req, res) => {
  res.json({
    status: "online",
    app: "Lead Funnels WhatsApp API",
    version: "1.1.0"
  });
});

app.get("/connect", async (req, res) => {
  try {
    const session = await connectInstance("principal");

    res.json({
      success: true,
      instanceId: "principal",
      status: session.status,
      qr: session.qr,
      phone: session.phone,
      name: session.name
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Erro ao conectar instância principal",
      details: error.message
    });
  }
});

app.post("/instances/:instanceId/connect", async (req, res) => {
  try {
    const { instanceId } = req.params;
    const session = await connectInstance(instanceId);

    res.json({
      success: true,
      instanceId,
      status: session.status,
      qr: session.qr,
      phone: session.phone,
      name: session.name
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Erro ao conectar instância",
      details: error.message
    });
  }
});

app.get("/instances", (req, res) => {
  res.json(
    Object.keys(sessions).map((id) => ({
      instanceId: id,
      status: sessions[id].status,
      hasQr: !!sessions[id].qr,
      phone: sessions[id].phone,
      name: sessions[id].name
    }))
  );
});

app.get("/instances/:instanceId/status", (req, res) => {
  const { instanceId } = req.params;
  const session = sessions[instanceId];

  if (!session) {
    return res.json({
      instanceId,
      status: "not_created",
      qr: null,
      phone: null,
      name: null
    });
  }

  res.json({
    instanceId,
    status: session.status,
    qr: session.qr,
    phone: session.phone,
    name: session.name
  });
});

app.post("/instances/:instanceId/send", async (req, res) => {
  const { instanceId } = req.params;
  const { phone, message } = req.body;

  const session = sessions[instanceId];

  if (!session || session.status !== "connected") {
    return res.status(400).json({
      success: false,
      error: "WhatsApp não conectado"
    });
  }

  if (!phone || !message) {
    return res.status(400).json({
      success: false,
      error: "Informe phone e message"
    });
  }

  try {
    const jid = normalizePhoneToJid(phone);

    await session.sock.sendMessage(jid, {
      text: message
    });

    res.json({
      success: true,
      instanceId,
      to: phone,
      jid,
      message
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Erro ao enviar mensagem individual",
      details: error.message
    });
  }
});

app.get("/instances/:instanceId/groups", async (req, res) => {
  const { instanceId } = req.params;
  const session = sessions[instanceId];

  if (!session || session.status !== "connected") {
    return res.status(400).json({
      success: false,
      error: "WhatsApp não conectado"
    });
  }

  try {
    const groups = await session.sock.groupFetchAllParticipating();

    res.json({
      success: true,
      groups: Object.values(groups).map((group) => ({
        id: group.id,
        name: group.subject,
        participants: group.participants?.length || 0
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Erro ao buscar grupos",
      details: error.message
    });
  }
});

app.get("/instances/:instanceId/groups/:groupId/participants", async (req, res) => {
  const { instanceId, groupId } = req.params;
  const session = sessions[instanceId];

  if (!session || session.status !== "connected") {
    return res.status(400).json({
      success: false,
      error: "WhatsApp não conectado"
    });
  }

  try {
    const metadata = await session.sock.groupMetadata(groupId);

    const participants = metadata.participants.map((participant) => ({
      id: participant.id,
      phone: cleanPhone(participant.id),
      is_hidden_number: participant.id.endsWith("@lid"),
      admin: participant.admin || null
    }));

    res.json({
      success: true,
      groupId,
      name: metadata.subject,
      participants_count: participants.length,
      participants
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Erro ao buscar participantes do grupo",
      details: error.message
    });
  }
});

app.post("/instances/:instanceId/groups/send", async (req, res) => {
  const { instanceId } = req.params;
  const { groupId, message } = req.body;

  const session = sessions[instanceId];

  if (!session || session.status !== "connected") {
    return res.status(400).json({
      success: false,
      error: "WhatsApp não conectado"
    });
  }

  if (!groupId || !message) {
    return res.status(400).json({
      success: false,
      error: "Informe groupId e message"
    });
  }

  try {
    await session.sock.sendMessage(groupId, {
      text: message
    });

    res.json({
      success: true,
      instanceId,
      groupId,
      message
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Erro ao enviar mensagem para grupo",
      details: error.message
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Lead Funnels WhatsApp API online na porta ${PORT}`);
});
