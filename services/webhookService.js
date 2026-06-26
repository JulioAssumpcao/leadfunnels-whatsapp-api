const { sessions } = require("./sessionService");

function normalizePhone(phone) {

if (!phone) return null;

return String(phone)
.replace(/\D/g, "")
.replace(/^55/, "");

}

async function sendWebhookMessage(
instanceId,
phone,
message
) {

const session = sessions[instanceId];

if (!session) {
throw new Error(`Instância ${instanceId} não encontrada`);
}

if (session.status !== "connected") {
throw new Error(`WhatsApp ${instanceId} não conectado`);
}

const cleanPhone = normalizePhone(phone);

if (!cleanPhone) {
throw new Error("Telefone inválido");
}

const jid = `${cleanPhone}@s.whatsapp.net`;

await session.sock.sendMessage(jid, {
text: message
});

console.log(
`[WEBHOOK] Mensagem enviada para ${cleanPhone}`
);

return true;

}

async function processEduzz(data) {

console.log("========== EDUZZ ==========");
console.log(JSON.stringify(data, null, 2));

const nome =
data.customer_name ||
data.name ||
data.buyer_name ||
"Cliente";

const telefone =
data.phone ||
data.customer_phone ||
data.buyer_phone ||
null;

const produto =
data.product_name ||
data.product ||
data.product_title ||
"Produto";

if (!telefone) {

```
console.log(
  "[EDUZZ] Compra recebida sem telefone"
);

return false;
```

}

const mensagem =
`Olá ${nome}!

Recebemos sua compra com sucesso ✅

Produto:
${produto}

Seu acesso será liberado em instantes.

Se precisar de ajuda, responda esta mensagem.

Equipe LeadFunnels`;

await sendWebhookMessage(
"principal",
telefone,
mensagem
);

return true;

}

async function processHotmart(data) {

console.log("========== HOTMART ==========");
console.log(JSON.stringify(data, null, 2));

return true;

}

async function processKiwify(data) {

console.log("========== KIWIFY ==========");
console.log(JSON.stringify(data, null, 2));

return true;

}

async function processPerfectPay(data) {

console.log("========== PERFECTPAY ==========");
console.log(JSON.stringify(data, null, 2));

return true;

}

async function processStripe(data) {

console.log("========== STRIPE ==========");
console.log(JSON.stringify(data, null, 2));

return true;

}

module.exports = {
processEduzz,
processHotmart,
processKiwify,
processPerfectPay,
processStripe,
sendWebhookMessage
};
