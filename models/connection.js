const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const connectionString = process.env.CONNECTION_STRING;

mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true, connectTimeoutMS: 2000 })
  .then(() => console.log('Database connected'))
  .catch(error => console.error(error));
console.log("Server running on port 3000 ...");