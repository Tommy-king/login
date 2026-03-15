// Firebase Configuration
// Replace the values below with your Firebase project config

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";

import {
getDatabase,
ref,
set,
get,
child,
update,
remove,
onValue
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-database.js";


// YOUR FIREBASE CONFIG
// (copy this from Firebase Console)

export const firebaseConfig = {
    apiKey: "AIzaSyDvBg3NjojMJyfwS2ekhe6KnXjcgmV5qGQ",
    authDomain: "anil-rentala.firebaseapp.com",
    databaseURL: "https://anil-rentala-default-rtdb.firebaseio.com",
    projectId: "anil-rentala",
    storageBucket: "anil-rentala.firebasestorage.app",
    messagingSenderId: "94163866842",
    appId: "1:94163866842:web:12caea0e85572c37e341e3",
    measurementId: "G-YXJ6HLSVBE"
  };


// INITIALIZE FIREBASE

const app = initializeApp(firebaseConfig);


// DATABASE INSTANCE

const db = getDatabase(app);


// EXPORT DATABASE + FUNCTIONS

export {

db,
ref,
set,
get,
child,
update,
remove,
onValue

};

