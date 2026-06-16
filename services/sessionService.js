const qrcode = require("qrcode-terminal");
const pino = require("pino");

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys");

const { cleanPhone } = require("../utils/phone");

const sessions = {};

async function connectInstance(instanceId) {
  if (sessions[instanceId]?.sock) {
    return sessions[instanceId];
  }

  const { state, saveCreds } = await useMultiFileAuthState(
    `./sessions/${instanceId}`
  );

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

      console.log(`QR CODE ${instanceId}`);
      qrcode.generate(qr, { small: true });
    }

    if (connection === "open") {
      const user = sock.user || {};

      sessions[instanceId].status = "connected";
      sessions[instanceId].phone = cleanPhone(user.id);
      sessions[instanceId].name = user.name || user.verifiedName || null;
      sessions[instanceId].qr = null;

      console.log(`WhatsApp conectado: ${instanceId}`);
    }

    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;

      if (statusCode !== DisconnectReason.loggedOut) {
        delete sessions[instanceId];

        setTimeout(() => {
          connectInstance(instanceId);
        }, 3000);
      }
    }
  });

  return sessions[instanceId];
}

module.exports = {
  sessions,
  connectInstance
};
