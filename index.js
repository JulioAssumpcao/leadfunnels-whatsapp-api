const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const instanceRoutes = require("./routes/instanceRoutes");
const messageRoutes = require("./routes/messageRoutes");
const groupRoutes = require("./routes/groupRoutes");
const mediaRoutes = require("./routes/mediaRoutes");
const webhookRoutes = require("./routes/webhookRoutes");
const leadRoutes = require("./routes/leadRoutes");
const chatRoutes = require("./routes/chatRoutes");

const { connectInstance } = require("./services/sessionService");

const app = express();

app.use(cors());

app.use(express.json({
  limit: "50mb"
}));

app.use(instanceRoutes);
app.use(messageRoutes);
app.use(groupRoutes);
app.use(mediaRoutes);
app.use(webhookRoutes);
app.use(leadRoutes);
app.use(chatRoutes);

const PORT = process.env.PORT || 2401;

app.listen(PORT, "0.0.0.0", async () => {

  console.log(`API rodando na porta ${PORT}`);

  const sessionsPath = path.join(
    process.cwd(),
    "sessions"
  );

  if (!fs.existsSync(sessionsPath)) {
    return;
  }

  const folders = fs.readdirSync(sessionsPath);

  for (const instanceId of folders) {

    const fullPath = path.join(
      sessionsPath,
      instanceId
    );

    if (!fs.statSync(fullPath).isDirectory()) {
      continue;
    }

    if (
      instanceId.endsWith("_backup")
    ) {
      continue;
    }

    console.log(
      `Reconectando instância: ${instanceId}`
    );

    try {

      await connectInstance(instanceId);

    } catch (error) {

      console.log(
        `Erro ao reconectar ${instanceId}:`,
        error.message
      );

    }

  }

});
