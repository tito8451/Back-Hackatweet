var express = require('express');
var router = express.Router();

require('../models/connection');
const User = require('../models/users');
const { checkBody } = require('../modules/checkBody');
const bcrypt = require('bcrypt');
const uid2 = require('uid2');

router.post('/signup', async (req, res) => {
  console.log(req.body);
  if (!checkBody(req.body, ['firstName', 'username', 'email','password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  // Check if the user has not already been registered
 await User.findOne({
    $or: [
      { username: { $regex: new RegExp(req.body.username, 'i') } },
      { email: { $regex: new RegExp(req.body.email, 'i') } },
    ]
  }).then(data => {
    if (data === null) {
      const hash = bcrypt.hashSync(req.body.password, 10);

      const newUser = new User({
        firstName: req.body.firstName,
        username: req.body.username,
        email: req.body.email,
        password: hash,
        token: uid2(32),
        canBookmark: true,
      });

      newUser.save().then(newDoc => {
        res.json({ result: true, token: newDoc.token });
      });
    } else {
      // User already exists in database
      res.json({ result: false, error: 'User already exists' });
    }
  });
});

router.post('/signin', async (req, res) => {
  if (!checkBody(req.body, ['username', 'email', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }
await User.findOne({
  $or: [
    { username: { $regex: new RegExp(req.body.username, 'i') } },
    { email: req.body.email }
  ]
}).then(data => {
  if (!data) {
    res.status(401).json({ result: false, error: 'User not found' });
    return; // Ajoutez ce return pour éviter l'exécution ultérieure
  }

  if (bcrypt.compareSync(req.body.password, data.password)) {
    res.json({ result: true, token: data.token, email: data.email, username: data.username, firstName: data.firstName });
  } else {
    res.status(401).json({ result: false, error: 'User not found or wrong password' });

  }
}).catch(error => {
  res.status(500).json({ result: false, error: 'Internal Server Error' });
});

});

module.exports = router;
