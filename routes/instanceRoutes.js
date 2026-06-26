const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const {
  sessions,
  connectInstance
} = require("../services/sessionService");

router.get("/connect", async (req, res) => {
  try {
    const session = await connectInstance("principal");

    res.json({
      success: true,
      instanceId: "principal",
      status: session.status,
      qr: session.qr,
      phone: session.phone,
      name: session.name
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.post("/instances/:instanceId/connect", async (req, res) => {
  try {
    const { instanceId } = req.params;

    const session = await connectInstance(instanceId);

    res.json({
      success: true,
      instanceId,
      status: session.status,
      qr: session.qr,
      phone: session.phone,
      name: session.name
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.post("/instances/:instanceId/disconnect", async (req, res) => {
  try {
    const { instanceId } = req.params;

    const session = sessions[instanceId];

    if (!session) {
      return res.json({
        success: true,
        instanceId,
        status: "disconnected"
      });
    }

    try {
      await session.sock.logout();
    } catch (e) {
      console.log("Erro logout:", e.message);
    }

    session.qr = null;
    session.phone = null;
    session.name = null;
    session.status = "disconnected";

    delete sessions[instanceId];

    const sessionPath = path.join(
      process.cwd(),
      "sessions",
      instanceId
    );

    if (fs.existsSync(sessionPath)) {
      fs.rmSync(sessionPath, {
        recursive: true,
        force: true
      });
    }

    res.json({
      success: true,
      instanceId,
      status: "disconnected"
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message
    });

  }
});

router.get("/instances", (req, res) => {
  res.json(
    Object.keys(sessions).map((id) => ({
      instanceId: id,
      status: sessions[id].status,
      phone: sessions[id].phone,
      name: sessions[id].name,
      hasQr: !!sessions[id].qr
    }))
  );
});

router.get("/instances/:instanceId/status", (req, res) => {
  const { instanceId } = req.params;

  const session = sessions[instanceId];

  if (!session) {
    return res.json({
      instanceId,
      status: "not_created"
    });
  }

  res.json({
    instanceId,
    status: session.status,
    qr: session.qr,
    phone: session.phone,
    name: session.name
  });
});

module.exports = router;
