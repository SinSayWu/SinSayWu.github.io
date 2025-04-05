let db;

function submit() {
    var newUsername = document.getElementById("username-input").value;
    var newPassword = document.getElementById("new-input").value;
    var newCopyPassword = document.getElementById("copy-input").value;
    var oldPassword = document.getElementById("old-input").value;
    try {
            alert(db);
        db.ref("users/" + getUsername()).once('value', function(user_object) {
            db.ref("other/").once('value', function(server_object) {
                var obj = user_object.val();
                var server = server_object.val();
                const lastProfileTime = obj.profilesleep || 0;
                const timePassed = Date.now() - lastProfileTime;
                if (timePassed < parseInt(server.profilesleeptime) * 1000 && obj.admin == 0) {
                    alert("You are changing your profile details too quickly");
                    return;
                } else {
                    if (oldPassword != getPassword()) {
                        alert("Incorrect password!");
                        return;
                    } else if (newPassword != newCopyPassword) {
                        alert("Passwords do not match!");
                        return;
                    } else if (!(checkInput(newUsername) && checkInput(newPassword))) {
                        alert("Something went wrong...");
                        return;
                    } else if (newUsername.length > 20) {
                        alert("New username cannot be longer than 20 characters");
                        return;
                    }
                    var username = getUsername();

                    const oldRef = db.ref("users/" + username);
                    const newRef = db.ref("users/" + newUsername);

                    oldRef.once('value').then((snapshot) => {
                        if (snapshot.exists()) {
                            const data = snapshot.val();

                            return newRef.set(data).then(() => {
                                newRef.update({
                                    profilesleep: Date.now(),
                                }).then(() => {
                                    return oldRef.remove();
                                })
                            })
                        } else {
                            alert("No data found under god");
                        }
                    }).then(() => {
                        localStorage.setItem("username", newUsername);
                        localStorage.setItem("password", newPassword);
                        // document.getElementById("username-input").value = username;
                        // document.getElementById("new-input").value = "";
                        // document.getElementById("copy-input").value = "";
                        // document.getElementById("old-input").value = "";
                        window.location.replace('../pebble/pebble.html');
                    })

                    // db.ref("users/" + username).update({
                    //     display_name: newDisplay,
                    //     password: newPassword,
                    //     name: newName,
                    //     profilesleep: Date.now(),
                    // }).then(() => {
                    // })
                }
            })
        }).catch((error) => {
            alert(error.message);
        });
    } catch (err) {
        alert(err);
    }
}

window.onload = function() {
    getApiKey().then(apiKey => {
        const firebaseConfig = {
            apiKey: apiKey,
            authDomain: "chatter-97e8c.firebaseapp.com",
            databaseURL: "https://chatter-97e8c-default-rtdb.firebaseio.com",
            projectId: "chatter-97e8c",
            storageBucket: "chatter-97e8c.firebasestorage.app",
            messagingSenderId: "281722915171",
            appId: "1:281722915171:web:3b136d8a0b79389f2f6b56",
            measurementId: "G-4CGJ1JFX58"
        };
        firebase.initializeApp(firebaseConfig);
        db = firebase.database();
    })
    
    var username = getUsername();
    if (username != null) {
        document.getElementById("username").innerHTML = username;
    } else {
        document.getElementById("username").innerHTML = "Not Logged In";
        return;
    }

    document.getElementById("username-input").value = username;
}