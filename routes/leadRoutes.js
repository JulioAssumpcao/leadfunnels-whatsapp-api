const express = require("express");

const router = express.Router();

const {
createLead,
findLeadByPhone,
getAllLeads
} = require("../services/leadService");

router.get("/leads", (req, res) => {

res.json({
success: true,
leads: getAllLeads()
});

});

router.get("/leads/:phone", (req, res) => {

const lead = findLeadByPhone(
req.params.phone
);

if (!lead) {

```
return res.status(404).json({
  success: false,
  error: "Lead não encontrado"
});
```

}

res.json({
success: true,
lead
});

});

router.post("/leads", (req, res) => {

try {

```
const lead = createLead(req.body);

res.json({
  success: true,
  lead
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
