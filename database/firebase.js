// import { initializeApp } from "firebase/app";
// import { getFirestore } from "@firebase/firestore"
// import { getStorage } from "@firebase/storage"


const initializeApp = require("firebase/app").initializeApp;
const getFirestore = require("@firebase/firestore").getFirestore
const getStorage = require("@firebase/storage").getStorage


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// https://firebase.google.com/docs/auth/admin/manage-users

// DOCUMENTATION
// https://firebase.google.com/docs/firestore/query-data/listen

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.CONCEALED_DB_API_KEY,
  authDomain: process.env.CONCEALED_AUTH_DOMAIN,
  projectId: process.env.CONCEALED_PROJECT_ID,
  storageBucket: process.env.CONCEALED_STORAGE_BUCKET,
  messagingSenderId: process.env.CONCEALED_MESSAGING_SENDER_ID,
  appId: process.env.CONCEALED_APP_ID,

  // frontendConnectionKey
  appConnectionKey_DB: process.env.CONCEALED_APP_CONNECTION_KEY
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getFirestore(app)
const storage = getStorage(app)

module.exports = {app, database, storage, config: firebaseConfig}

