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
  measurementId: process.env.CONCEALED_APP_MEASUREMENT_ID
};
// console.log("thedd");
const firebasePlaygroundConfig = {
  apiKey: process.env.CONCEALED_PLAYGROUND_DB_API_KEY,
  authDomain: process.env.CONCEALED_PLAYGROUND_AUTH_DOMAIN,
  projectId: process.env.CONCEALED_PLAYGROUND_PROJECT_ID,
  storageBucket: process.env.CONCEALED_PLAYGROUND_STORAGE_BUCKET,
  messagingSenderId: process.env.CONCEALED_PLAYGROUND_MESSAGING_SENDER_ID,
  appId: process.env.CONCEALED_PLAYGROUND_APP_ID,
  measurementId: process.env.CONCEALED_PLAYGROUND_APP_MEASUREMENT_ID
};

// console.log(firebasePlaygroundConfig);
// Initialize Firebase
function discernDB(){
  if(process.env.CONCEALED_ENV==='production'){
    return firebaseConfig
  } else if(process.env.CONCEALED_ENV==='production-development'){
    return firebasePlaygroundConfig
  } else if(process.env.CONCEALED_ENV==='local-development'){
    return firebasePlaygroundConfig
  }else{
    return firebasePlaygroundConfig
  }
}

const app = initializeApp(discernDB());
const database = getFirestore(app)
const storage = getStorage(app)

module.exports = {app, database, storage, config: firebaseConfig, playgroundConfig: firebasePlaygroundConfig}

