const express = require("express");

const router = express.Router();

const {
processEduzz,
processHotmart,
processKiwify,
processPerfectPay,
processStripe
} = require("../services/webhookService");

// ==========================================
// EDUZZ
// ==========================================

router.post("/webhooks/eduzz", async (req, res) => {

try {

```
await processEduzz(req.body);

return res.status(200).json({
  success: true
});
```

} catch (error) {

```
console.error(error);

return res.status(500).json({
  success: false,
  error: error.message
});
```

}

});

// ==========================================
// HOTMART
// ==========================================

router.post("/webhooks/hotmart", async (req, res) => {

try {

```
await processHotmart(req.body);

return res.status(200).json({
  success: true
});
```

} catch (error) {

```
console.error(error);

return res.status(500).json({
  success: false,
  error: error.message
});
```

}

});

// ==========================================
// KIWIFY
// ==========================================

router.post("/webhooks/kiwify", async (req, res) => {

try {

```
await processKiwify(req.body);

return res.status(200).json({
  success: true
});
```

} catch (error) {

```
console.error(error);

return res.status(500).json({
  success: false,
  error: error.message
});
```

}

});

// ==========================================
// PERFECT PAY
// ==========================================

router.post("/webhooks/perfectpay", async (req, res) => {

try {

```
await processPerfectPay(req.body);

return res.status(200).json({
  success: true
});
```

} catch (error) {

```
console.error(error);

return res.status(500).json({
  success: false,
  error: error.message
});
```

}

});

// ==========================================
// STRIPE
// ==========================================

router.post("/webhooks/stripe", async (req, res) => {

try {

```
await processStripe(req.body);

return res.status(200).json({
  success: true
});
```

} catch (error) {

```
console.error(error);

return res.status(500).json({
  success: false,
  error: error.message
});
```

}

});

// ==========================================
// TESTE
// ==========================================

router.get("/webhooks/test", async (req, res) => {

res.json({
success: true,
message: "Webhook online"
});

});

module.exports = router;
