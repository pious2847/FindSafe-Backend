const admin = require('firebase-admin');

/**
 * Initialize Firebase Admin SDK
 * @returns {Object} Firebase admin instance
 */
function initializeFirebaseAdmin() {
  try {
    
    // Option 1: Using environment variables directly
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        })
      });
    }
    
    console.log('Firebase Admin SDK initialized successfully');
    return admin;
    
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error);
    throw error;
  }
}

module.exports = {
  initializeFirebaseAdmin,
  getAdmin: () => admin
};