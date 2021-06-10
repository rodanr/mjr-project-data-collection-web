const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.send("<h3>Thanks for your contribution</h3>");
});

module.exports = router;
