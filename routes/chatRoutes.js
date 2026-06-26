const express = require("express");

const router = express.Router();

const {
getChats,
getMessages
} = require("../services/chatService");

router.get("/chats", (req, res) => {

res.json({
success: true,
chats: getChats()
});

});

router.get("/chats/:phone", (req, res) => {

res.json({
success: true,
messages: getMessages(
req.params.phone
)
});

});

module.exports = router;
