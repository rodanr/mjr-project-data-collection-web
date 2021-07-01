var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.render('welcome', {
    title: 'Data Collection for Nepali Speech Processing Project',
  });
});

module.exports = router;
