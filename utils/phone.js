function cleanPhone(phone) {
  if (!phone) return null;

  return String(phone)
    .replace("@s.whatsapp.net", "")
    .replace("@g.us", "")
    .replace("@lid", "")
    .replace(/\D/g, "");
}

module.exports = {
  cleanPhone
};
