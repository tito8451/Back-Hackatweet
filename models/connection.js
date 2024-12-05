require('dotenv').config(); // Chargez les variables d'environnement

const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const connectionString = process.env.CONNECTION_STRING;

// console.log('Connection string:', connectionString); // Vérifiez que ça ne soit pas undefined

if (!connectionString) {
    console.error('Connection string is undefined. Check your environment variables.');
    process.exit(1); // Arrêtez le serveur si la chaîne est manquante
}

mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true, connectTimeoutMS: 2000 })
    .then(() => console.log('Database connected'))
    .catch(error => console.error('Database connection error:', error));

// console.log("Server running on port 3000 ...");
