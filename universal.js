const firebaseConfig = {
    apiKey: "AIzaSyDOAj76E00Rg8Qyc5DQndWXHtCy2umC6vA",
    authDomain: "chatter-97e8c.firebaseapp.com",
    projectId: "chatter-97e8c",
    storageBucket: "chatter-97e8c.appspot.com",
    messagingSenderId: "281722915171",
    appId: "1:281722915171:web:3b136d8a0b79389f2f6b56",
    measurementId: "G-4CGJ1JFX58",
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();


function checkInput(input) {
    if (input == "") {
        alert("Cannot be blank");
        return false;
    }
    if (!/^[a-zA-Z0-9]+$/.test(input)) {
        alert("Invalid Characters. Only alphanumeric characters allowed.")
        return false;
    }
    if (input.includes("everyone")) {
        alert("No mention of everyone allowed.");
        return false;
    }
    if (input.includes("admin")) {
        alert("No impersonating admins");
        return false;
    }
    return true;
}
