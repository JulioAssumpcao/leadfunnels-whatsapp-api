function normalizePhoneToJid(phone) {
  if (!phone) return null;

  const value = String(phone).trim();

  if (value.includes("@s.whatsapp.net")) return value;
  if (value.includes("@g.us")) return value;
  if (value.includes("@lid")) return value;

  return `${value.replace(/\D/g, "")}@s.whatsapp.net`;
}

module.exports = {
  normalizePhoneToJid
};
