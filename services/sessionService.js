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

  console.log(`====================================`);
  console.log(`Iniciando conexão: ${instanceId}`);
  console.log(`====================================`);

  const { state, saveCreds } = await useMultiFileAuthState(
    `./sessions/${instanceId}`
  );

  console.log("Auth carregado");

  const { version } = await fetchLatestBaileysVersion();

  console.log("Versão Baileys:", version);

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

    console.log("====================================");
    console.log("CONNECTION UPDATE");
    console.log(JSON.stringify(update, null, 2));
    console.log("====================================");

    const {
      connection,
      lastDisconnect,
      qr
    } = update;

    if (qr) {

      sessions[instanceId].qr = qr;
      sessions[instanceId].status = "connecting";

      console.log(`QR CODE GERADO: ${instanceId}`);

      qrcode.generate(qr, {
        small: true
      });

    }

    if (connection === "open") {

      const user = sock.user || {};

      sessions[instanceId].status = "connected";
      sessions[instanceId].phone = cleanPhone(user.id);
      sessions[instanceId].name =
        user.name ||
        user.verifiedName ||
        null;

      sessions[instanceId].qr = null;

      console.log("====================================");
      console.log(`WhatsApp conectado: ${instanceId}`);
      console.log(`Telefone: ${sessions[instanceId].phone}`);
      console.log(`Nome: ${sessions[instanceId].name}`);
      console.log("====================================");

    }

    if (connection === "close") {

      console.log("====================================");
      console.log("CONEXÃO FECHADA");
      console.log(lastDisconnect);
      console.log("====================================");

      const statusCode =
        lastDisconnect?.error?.output?.statusCode;

      console.log("Status Code:", statusCode);

      if (statusCode !== DisconnectReason.loggedOut) {

        console.log(
          `Tentando reconectar ${instanceId} em 3 segundos`
        );

        delete sessions[instanceId];

        setTimeout(() => {
          connectInstance(instanceId);
        }, 3000);

      } else {

        console.log(
          `Instância ${instanceId} foi deslogada`
        );

      }

    }

  });

  return sessions[instanceId];
}

module.exports = {
  sessions,
  connectInstance
};
