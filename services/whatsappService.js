const { normalizePhoneToJid } = require("../utils/jid");

async function sendText(sock, phone, message) {
  const jid = normalizePhoneToJid(phone);

  return sock.sendMessage(jid, {
    text: message
  });
}

async function sendGroupText(sock, groupId, message) {
  return sock.sendMessage(groupId, {
    text: message
  });
}

module.exports = {
  sendText,
  sendGroupText
};
