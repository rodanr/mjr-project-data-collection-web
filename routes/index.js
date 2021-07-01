const express = require('express');
const router = express.Router();
const requestSentence = require('../public/javascripts/getSentence');
var id, gender;
router.post('/collect', (req, res, next) => {
  gender = req.body.gender;
  requestSentence().then((data) => {
    id = data.id;
    res.render('index', {
      title: 'Data Collection for Nepali Speech Processing Project',
      sentence: data.sentence,
      id: id,
      gender: gender,
    });
  });
});

module.exports = router;
