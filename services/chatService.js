const chats = new Map();

function saveMessage(data) {

const phone = String(
data.phone || ""
).replace(/\D/g, "");

if (!phone) {
return null;
}

if (!chats.has(phone)) {
chats.set(phone, []);
}

chats.get(phone).push({
id: Date.now().toString(),
direction: data.direction || "inbound",
message: data.message || "",
createdAt: new Date().toISOString()
});

return true;
}

function getMessages(phone) {

const cleanPhone = String(phone)
.replace(/\D/g, "");

return chats.get(cleanPhone) || [];
}

function getChats() {

const result = [];

chats.forEach((messages, phone) => {

```
result.push({
  phone,
  lastMessage:
    messages[messages.length - 1] || null,
  totalMessages: messages.length
});
```

});

return result;
}

module.exports = {
saveMessage,
getMessages,
getChats
};
