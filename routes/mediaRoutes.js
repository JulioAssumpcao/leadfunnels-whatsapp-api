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

// ==========================================
// IMAGE / VIDEO / AUDIO / DOCUMENT
// ==========================================

router.post("/instances/:instanceId/send-media", async (req, res) => {

try {

```
const { instanceId } = req.params;

const {
  phone,
  url,
  caption,
  type,
  filename,
  ptt
} = req.body;

const session = sessions[instanceId];

if (!session || session.status !== "connected") {
  return res.status(400).json({
    success: false,
    error: "WhatsApp não conectado"
  });
}

const jid = normalizePhoneToJid(phone);

const buffer = await getBuffer(url);

// IMAGE

if (type === "image") {

  await session.sock.sendMessage(jid, {
    image: buffer,
    caption: caption || ""
  });

}

// VIDEO

else if (type === "video") {

  await session.sock.sendMessage(jid, {
    video: buffer,
    caption: caption || ""
  });

}

// AUDIO

else if (type === "audio") {

  await session.sock.sendMessage(jid, {
    audio: buffer,
    mimetype: "audio/mp4",
    ptt: !!ptt
  });

}

// DOCUMENT

else if (
  type === "document" ||
  type === "pdf"
) {

  await session.sock.sendMessage(jid, {
    document: buffer,
    fileName: filename || "arquivo",
    caption: caption || ""
  });

}

else {

  return res.status(400).json({
    success: false,
    error: "Tipo não suportado"
  });

}

res.json({
  success: true,
  type
});
```

} catch (error) {

```
res.status(500).json({
  success: false,
  error: error.message
});
```

}

});

// ==========================================
// POLL
// ==========================================

router.post("/instances/:instanceId/send-poll", async (req, res) => {

try {

```
const { instanceId } = req.params;

const {
  phone,
  title,
  options
} = req.body;

const session = sessions[instanceId];

if (!session || session.status !== "connected") {
  return res.status(400).json({
    success: false,
    error: "WhatsApp não conectado"
  });
}

if (!options || !Array.isArray(options)) {

  return res.status(400).json({
    success: false,
    error: "options deve ser array"
  });

}

const jid = normalizePhoneToJid(phone);

await session.sock.sendMessage(jid, {
  poll: {
    name: title,
    values: options,
    selectableCount: 1
  }
});

res.json({
  success: true
});
```

} catch (error) {

```
res.status(500).json({
  success: false,
  error: error.message
});
```

}

});

// ==========================================
// SEND BLOCKS
// FUTURO DAS CAMPANHAS
// ==========================================

router.post("/instances/:instanceId/send-blocks", async (req, res) => {

try {

```
const { instanceId } = req.params;

const {
  phone,
  blocks
} = req.body;

const session = sessions[instanceId];

if (!session || session.status !== "connected") {

  return res.status(400).json({
    success: false,
    error: "WhatsApp não conectado"
  });

}

const jid = normalizePhoneToJid(phone);

for (const block of blocks) {

  if (block.type === "text") {

    await session.sock.sendMessage(jid, {
      text: block.text || ""
    });

  }

  else if (
    block.type === "image" ||
    block.type === "video" ||
    block.type === "audio" ||
    block.type === "document"
  ) {

    const buffer = await getBuffer(block.url);

    if (block.type === "image") {

      await session.sock.sendMessage(jid, {
        image: buffer,
        caption: block.caption || ""
      });

    }

    if (block.type === "video") {

      await session.sock.sendMessage(jid, {
        video: buffer,
        caption: block.caption || ""
      });

    }

    if (block.type === "audio") {

      await session.sock.sendMessage(jid, {
        audio: buffer,
        mimetype: "audio/mp4",
        ptt: !!block.ptt
      });

    }

    if (block.type === "document") {

      await session.sock.sendMessage(jid, {
        document: buffer,
        fileName: block.filename || "arquivo",
        caption: block.caption || ""
      });

    }

  }

  const pause = Number(block.pause || 2);

  await new Promise(resolve =>
    setTimeout(resolve, pause * 1000)
  );

}

res.json({
  success: true,
  totalBlocks: blocks.length
});
```

} catch (error) {

```
res.status(500).json({
  success: false,
  error: error.message
});
```

}

});

module.exports = router;
