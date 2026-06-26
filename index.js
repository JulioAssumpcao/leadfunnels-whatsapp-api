const express = require("express");
const cors = require("cors");

const instanceRoutes = require("./routes/instanceRoutes");
const messageRoutes = require("./routes/messageRoutes");
const groupRoutes = require("./routes/groupRoutes");
const mediaRoutes = require("./routes/mediaRoutes");
const webhookRoutes = require("./routes/webhookRoutes");

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

const PORT = process.env.PORT || 2401;

app.listen(PORT, "0.0.0.0", () => {

  console.log(`API rodando na porta ${PORT}`);

});
