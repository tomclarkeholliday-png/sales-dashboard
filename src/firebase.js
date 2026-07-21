import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyDhA1buQL3KR3eEt6_HlUFnoMlXzkHlY8E",
  authDomain: "dashboard-a2968.firebaseapp.com",
  databaseURL: "https://dashboard-a2968-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "dashboard-a2968",
  storageBucket: "dashboard-a2968.firebasestorage.app",
  messagingSenderId: "796304108331",
  appId: "1:796304108331:web:7947014a74a1681c6fb36e"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
