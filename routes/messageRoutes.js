const express = require("express");

const router = express.Router();

const { sessions } = require("../services/sessionService");
const { sendText } = require("../services/whatsappService");

router.post("/instances/:instanceId/send", async (req, res) => {
  try {
    const { instanceId } = req.params;
    const { phone, message } = req.body;

    const session = sessions[instanceId];

    if (!session || session.status !== "connected") {
      return res.status(400).json({
        success: false,
        error: "WhatsApp não conectado"
      });
    }

    await sendText(session.sock, phone, message);

    res.json({
      success: true
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message
    });

  }
});

module.exports = router;
