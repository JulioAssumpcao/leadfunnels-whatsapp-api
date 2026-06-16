const express = require("express");

const router = express.Router();

const { sessions } = require("../services/sessionService");

router.get("/instances/:instanceId/groups", async (req, res) => {

  try {

    const { instanceId } = req.params;

    const session = sessions[instanceId];

    if (!session || session.status !== "connected") {
      return res.status(400).json({
        success: false,
        error: "WhatsApp não conectado"
      });
    }

    const groups = await session.sock.groupFetchAllParticipating();

    res.json({
      success: true,
      groups: Object.values(groups)
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message
    });

  }

});

router.post("/instances/:instanceId/groups/send", async (req, res) => {

  try {

    const { instanceId } = req.params;
    const { groupId, message } = req.body;

    const session = sessions[instanceId];

    await session.sock.sendMessage(groupId, {
      text: message
    });

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
