const admin = require('firebase-admin');

module.exports = async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // Check 1: Is the variable even there?
    if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
      throw new Error("Missing FIREBASE_SERVICE_ACCOUNT in Vercel environment variables.");
    }

    // Check 2: Try to initialize
    if (!admin.apps.length) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    }

    const db = admin.firestore();
    const snapshot = await db.collection('products').get();
    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    res.status(200).json(products);

  } catch (error) {
    // This sends the SPECIFIC error message to the browser screen
    res.status(500).json({ 
      error: "Backend Error", 
      message: error.message 
    });
  }
};