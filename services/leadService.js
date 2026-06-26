const leads = new Map();

function createLead(data) {

const phone = String(
data.phone || ""
).replace(/\D/g, "");

if (!phone) {
throw new Error("Telefone obrigatório");
}

const lead = {
id: Date.now().toString(),
nome: data.nome || "Lead",
email: data.email || null,
phone,
origem: data.origem || "manual",
createdAt: new Date().toISOString()
};

leads.set(phone, lead);

return lead;

}

function findLeadByPhone(phone) {

const cleanPhone = String(phone)
.replace(/\D/g, "");

return leads.get(cleanPhone) || null;

}

function updateLead(phone, data) {

const lead = findLeadByPhone(phone);

if (!lead) {
return null;
}

Object.assign(lead, data);

return lead;

}

function getAllLeads() {

return Array.from(
leads.values()
);

}

module.exports = {
createLead,
findLeadByPhone,
updateLead,
getAllLeads
};
