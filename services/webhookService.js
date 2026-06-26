const { sessions } = require("./sessionService");

async function sendWebhookMessage(
instanceId,
phone,
message
) {

const session = sessions[instanceId];

if (!session) {
throw new Error("Instância não encontrada");
}

if (session.status !== "connected") {
throw new Error("WhatsApp não conectado");
}

const jid = phone.includes("@")
? phone
: `${phone.replace(/\D/g, "")}@s.whatsapp.net`;

await session.sock.sendMessage(jid, {
text: message
});

return true;
}

async function processEduzz(data) {

console.log("PROCESSANDO EDUZZ");

const nome =
data.customer_name ||
data.name ||
"Cliente";

const telefone =
data.phone ||
data.customer_phone ||
null;

const produto =
data.product_name ||
data.product ||
"Produto";

if (!telefone) {
console.log("Compra sem telefone");
return;
}

const mensagem =
`Olá ${nome}!

Recebemos sua compra do produto:

${produto}

Seu acesso será liberado em instantes.

Equipe LeadFunnels`;

await sendWebhookMessage(
"principal",
telefone,
mensagem
);
}

async function processHotmart(data) {

console.log("PROCESSANDO HOTMART");

return true;
}

async function processKiwify(data) {

console.log("PROCESSANDO KIWIFY");

return true;
}

async function processPerfectPay(data) {

console.log("PROCESSANDO PERFECTPAY");

return true;
}

async function processStripe(data) {

console.log("PROCESSANDO STRIPE");

return true;
}

module.exports = {
processEduzz,
processHotmart,
processKiwify,
processPerfectPay,
processStripe
};
