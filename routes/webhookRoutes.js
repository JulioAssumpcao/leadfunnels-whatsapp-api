const express = require("express");

const router = express.Router();

router.post("/webhooks/eduzz", async (req, res) => {

try {

```
console.log("EDUZZ WEBHOOK");
console.log(JSON.stringify(req.body, null, 2));

return res.status(200).json({
  success: true
});
```

} catch (error) {

```
return res.status(500).json({
  success: false,
  error: error.message
});
```

}

});

router.post("/webhooks/hotmart", async (req, res) => {

try {

```
console.log("HOTMART WEBHOOK");
console.log(JSON.stringify(req.body, null, 2));

return res.status(200).json({
  success: true
});
```

} catch (error) {

```
return res.status(500).json({
  success: false,
  error: error.message
});
```

}

});

router.post("/webhooks/kiwify", async (req, res) => {

try {

```
console.log("KIWIFY WEBHOOK");
console.log(JSON.stringify(req.body, null, 2));

return res.status(200).json({
  success: true
});
```

} catch (error) {

```
return res.status(500).json({
  success: false,
  error: error.message
});
```

}

});

router.post("/webhooks/perfectpay", async (req, res) => {

try {

```
console.log("PERFECT PAY WEBHOOK");
console.log(JSON.stringify(req.body, null, 2));

return res.status(200).json({
  success: true
});
```

} catch (error) {

```
return res.status(500).json({
  success: false,
  error: error.message
});
```

}

});

router.post("/webhooks/stripe", async (req, res) => {

try {

```
console.log("STRIPE WEBHOOK");
console.log(JSON.stringify(req.body, null, 2));

return res.status(200).json({
  success: true
});
```

} catch (error) {

```
return res.status(500).json({
  success: false,
  error: error.message
});
```

}

});

module.exports = router;
