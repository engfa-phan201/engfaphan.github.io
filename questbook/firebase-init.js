// firebase-init.js
// Đặt file này cùng folder với indexbook.html

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  setDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadString,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-storage.js";

// ── CONFIG CỦA BẠN ──
const firebaseConfig = {
  apiKey: "AIzaSyAj2k3JdpJJ0whhjY5eyJDsrkd6xGOCu6o",
  authDomain: "engfa-questbook.firebaseapp.com",
  projectId: "engfa-questbook",
  storageBucket: "engfa-questbook.firebasestorage.app",
  messagingSenderId: "997136803890",
  appId: "1:997136803890:web:19adf8473b75a0cdec342b",
  measurementId: "G-TYHZ5KQW5F",
};

// ── KHỞI TẠO ──
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// ── EXPORT ra window để sprict.js dùng được ──
window.fbDb = db;
window.fbStorage = storage;
window.fbRef = ref;
window.fbUploadString = uploadString;
window.fbGetDownloadURL = getDownloadURL;
window.fbSetDoc = setDoc;
window.fbGetDoc = getDoc;
window.fbDoc = doc;
window.fbCollection = collection;
window.fbAddDoc = addDoc;
window.fbGetDocs = getDocs;

console.log("✅ Firebase connected!");
