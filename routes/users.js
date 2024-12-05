var express = require('express');
var router = express.Router();

require('../models/connection');
const User = require('../models/users');
const { checkBody } = require('../modules/checkBody');
const bcrypt = require('bcrypt');
const uid2 = require('uid2');

router.post('/signup', async (req, res) => {
  console.log('Received body:', req.body);

  // Vérifier les champs manquants
  const missingFields = checkBody(req.body, ['firstName', 'username', 'email', 'password']);
  if (missingFields) {
      return res.status(400).json({ result: false, error: 'Missing or empty fields: ' + missingFields.join(', ') });
  }

  try {
      // Vérifier si l'utilisateur existe déjà
      const userExists = await User.findOne({
          $or: [
              { username: { $regex: new RegExp(req.body.username, 'i') } },
              { email: { $regex: new RegExp(req.body.email, 'i') } },
          ]
      });

      if (userExists) {
          return res.status(409).json({ result: false, error: 'User already exists' });
      }

      // Hachage du mot de passe
      const hash = await bcrypt.hash(req.body.password, 10); // Utilisation de await pour l'opération de hachage

      // Création du nouvel utilisateur
      const newUser = new User({
          firstName: req.body.firstName,
          username: req.body.username,
          email: req.body.email,
          password: hash,
          token: uid2(32),
          canBookmark: true,
      });

      // Enregistrement de l'utilisateur
      const savedUser = await newUser.save();

      // Réponse après succès
      return res.status(201).json({ result: true, token: savedUser.token });

  } catch (error) {
      console.error('Error during signup:', error);
      return res.status(500).json({ result: false, error: 'Server error' });
  }
});


router.post('/signin', async (req, res) => {
  console.log('Received body:', req.body); // Affiche le corps reçu

  // Vérifier les champs manquants
  const missingFields = checkBody(req.body, ['username', 'password']);
  if (missingFields) {
      return res.status(400).json({ result: false, error: 'Missing or empty fields: ' + missingFields.join(', ') });
  }

  try {
      // Trouver l'utilisateur
      const user = await User.findOne({ username: req.body.username });
      if (!user) {
          return res.status(401).json({ result: false, error: 'User not found' });
      }

      // Vérifier le mot de passe
      const isPasswordValid = bcrypt.compareSync(req.body.password, user.password);
      if (!isPasswordValid) {
          return res.status(402).json({ result: false, error: 'Invalid password' });
      }

      // Répondre avec le token de l'utilisateur
      return res.status(200).json({ result: true, token: user.token, username: user.username });

  } catch (error) {
      console.error('Error during signin:', error);
      return res.status(500).json({ result: false, error: 'Server error' });
  }
});

module.exports = router;
