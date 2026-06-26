const express = require("express");
const axios = require("axios");

const router = express.Router();

const { sessions } = require("../services/sessionService");

async function getBuffer(url) {

const response = await axios.get(url, {
responseType: "arraybuffer"
});

return Buffer.from(response.data);
}

router.get("/instances/:instanceId/groups", async (req, res) => {

try {

```
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

router.post("/instances/:instanceId/groups/send", async (req, res) => {

try {

```
const { groupId } = req.body;
const { instanceId } = req.params;

const session = sessions[instanceId];

await session.sock.sendMessage(groupId, {
  text: req.body.message
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

router.post("/instances/:instanceId/groups/send-media", async (req, res) => {

try {

```
const { instanceId } = req.params;

const {
  groupId,
  url,
  caption,
  type,
  filename
} = req.body;

const session = sessions[instanceId];

if (!session || session.status !== "connected") {
  return res.status(400).json({
    success: false,
    error: "WhatsApp não conectado"
  });
}

const buffer = await getBuffer(url);

if (type === "image") {

  await session.sock.sendMessage(groupId, {
    image: buffer,
    caption: caption || ""
  });

}

else if (type === "video") {

  await session.sock.sendMessage(groupId, {
    video: buffer,
    caption: caption || ""
  });

}

else if (type === "audio") {

  await session.sock.sendMessage(groupId, {
    audio: buffer,
    mimetype: "audio/mp4",
    ptt: true
  });

}

else if (type === "document") {

  await session.sock.sendMessage(groupId, {
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

router.post("/instances/:instanceId/groups/mention-all", async (req, res) => {

try {

```
const { instanceId } = req.params;
const { groupId, message } = req.body;

const session = sessions[instanceId];

if (!session || session.status !== "connected") {
  return res.status(400).json({
    success: false,
    error: "WhatsApp não conectado"
  });
}

const metadata = await session.sock.groupMetadata(groupId);

const mentions = metadata.participants.map(
  participant => participant.id
);

await session.sock.sendMessage(groupId, {
  text: message,
  mentions
});

res.json({
  success: true,
  participants: mentions.length
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
