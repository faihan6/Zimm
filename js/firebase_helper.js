// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import  {getFirestore, collection , doc, addDoc, setDoc, onSnapshot} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";


// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCS-eBlcLj7oH0E9yIGlKXr61LwSByc3_I",
    authDomain: "sharedmusicplayer-d9430.firebaseapp.com",
    projectId: "sharedmusicplayer-d9430",
    storageBucket: "sharedmusicplayer-d9430.appspot.com",
    messagingSenderId: "651266267353",
    appId: "1:651266267353:web:e545c61c318c1ab4af06c8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const syncCollection = collection(db, "syncCollection")


function listenToChangesInDoc(documentID, callback){
    console.log("listening to changes in doc", documentID)
    const docRef = doc(syncCollection, documentID);
    onSnapshot(docRef, (doc) => {
        callback(doc.data());
    })
}

function writeToDoc(documentID, data){
    console.log("writing to doc", documentID, data)
    const docRef = doc(syncCollection, documentID);
    setDoc(docRef, data)
}

function createDoc(documentID){
    const docRef = doc(syncCollection, documentID);
    setDoc(docRef, {dummy: 2})

}

export {listenToChangesInDoc, writeToDoc, createDoc}


