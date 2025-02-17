// firebaseAdmin.js
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://chatter-97e8c.firebaseio.com"
});

// Get a reference to your Realtime Database
const db = admin.database();

// Example: Write to the database
db.ref('test').set({ message: 'Hello Firebase!' })
  .then(() => console.log('Data written successfully'))
  .catch((error) => console.error('Failed to write data:', error));

module.exports = db;
