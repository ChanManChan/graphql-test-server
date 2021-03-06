const admin = require('firebase-admin');

const serviceAccount = require('../config/fbServiceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // databaseURL: 'https://graphql-test-109be.firebaseio.com',
});

exports.authCheck = async (req) => {
  try {
    const currentUser = await admin.auth().verifyIdToken(req.headers.authtoken);
    return currentUser;
  } catch (e) {
    console.log('> Auth check error: ', e);
    throw new Error('Invalid or expired token');
  }
};

exports.authCheckMiddleware = async (req, res, next) => {
  if (req.headers.authtoken) {
    try {
      await admin.auth().verifyIdToken(req.headers.authtoken);
      next();
    } catch (e) {
      console.log(e);
    }
  } else {
    res.json({ error: 'Unauthorized' });
  }
};
