const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.SERVER_PORT || process.env.PORT || 2401;

app.get("/", (req, res) => {
  res.json({
    status: "online",
    app: "Lead Funnels WhatsApp API",
    message: "Servidor funcionando com sucesso"
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime()
  });
});

app.post("/test-message", (req, res) => {
  const { phone, message } = req.body;

  res.json({
    success: true,
    received: {
      phone,
      message
    },
    note: "Teste recebido. WhatsApp ainda não está conectado."
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Lead Funnels WhatsApp API online na porta ${PORT}`);
});
