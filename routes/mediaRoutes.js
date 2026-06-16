const express = require("express");
const axios = require("axios");

const router = express.Router();

const { sessions } = require("../services/sessionService");
const { normalizePhoneToJid } = require("../utils/jid");

async function getBuffer(url) {

  const response = await axios.get(url, {
    responseType: "arraybuffer"
  });

  return Buffer.from(response.data);
}

router.post("/instances/:instanceId/send-media", async (req, res) => {

  try {

    const { instanceId } = req.params;

    const {
      phone,
      url,
      caption,
      type,
      filename
    } = req.body;

    const session = sessions[instanceId];

    if (!session || session.status !== "connected") {
      return res.status(400).json({
        success: false
      });
    }

    const jid = normalizePhoneToJid(phone);

    const buffer = await getBuffer(url);

    if (type === "image") {

      await session.sock.sendMessage(jid, {
        image: buffer,
        caption: caption || ""
      });

    }

    else if (type === "video") {

      await session.sock.sendMessage(jid, {
        video: buffer,
        caption: caption || ""
      });

    }

    else if (type === "audio") {

      await session.sock.sendMessage(jid, {
        audio: buffer,
        mimetype: "audio/mp4",
        ptt: true
      });

    }

    else if (type === "document") {

      await session.sock.sendMessage(jid, {
        document: buffer,
        fileName: filename || "arquivo",
        caption: caption || ""
      });

    }

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
