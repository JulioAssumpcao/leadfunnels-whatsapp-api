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

async function sendImage(sock, phone, buffer, caption = "") {

const jid = normalizePhoneToJid(phone);

return sock.sendMessage(jid, {
image: buffer,
caption
});

}

async function sendVideo(sock, phone, buffer, caption = "") {

const jid = normalizePhoneToJid(phone);

return sock.sendMessage(jid, {
video: buffer,
caption
});

}

async function sendAudio(
sock,
phone,
buffer,
ptt = false
) {

const jid = normalizePhoneToJid(phone);

return sock.sendMessage(jid, {
audio: buffer,
mimetype: "audio/mp4",
ptt
});

}

async function sendDocument(
sock,
phone,
buffer,
filename = "arquivo",
caption = ""
) {

const jid = normalizePhoneToJid(phone);

return sock.sendMessage(jid, {
document: buffer,
fileName: filename,
caption
});

}

async function sendPoll(
sock,
phone,
title,
options
) {

const jid = normalizePhoneToJid(phone);

return sock.sendMessage(jid, {
poll: {
name: title,
values: options,
selectableCount: 1
}
});

}

module.exports = {
sendText,
sendGroupText,
sendImage,
sendVideo,
sendAudio,
sendDocument,
sendPoll
};
