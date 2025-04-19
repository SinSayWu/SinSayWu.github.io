let db;

function submit() {
    var newUsername = document.getElementById("username-input").value;
    var newPassword = document.getElementById("new-input").value;
    var newCopyPassword = document.getElementById("copy-input").value;
    var oldPassword = document.getElementById("old-input").value;
    try {
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
                    } else if (!(checkInput(newUsername) && checkInput(newPassword)) && newUsername == "Casino") {
                        alert("Something went wrong...");
                        return;
                    } else if (newUsername.length > 20) {
                        alert("New username cannot be longer than 20 characters");
                        return;
                    }
                    var username = getUsername();

                    const oldRef = db.ref("users/" + username);
                    const newRef = db.ref("users/" + newUsername);

                    newRef.once("value", function(new_object) {
                        if (newUsername !== username && new_object.exists()) {
                            alert("Username is already used by an existing user");
                            return;
                        }

                        oldRef.once('value').then((snapshot) => {
                            if (snapshot.exists()) {
                                const data = snapshot.val();

                                return newRef.set(data).then(() => {
                                    if (newUsername !== username) {
                                        oldRef.remove();
                                        db.ref(`userimages/${username}`).remove();
                                    }

                                    newRef.update({
                                        profilesleep: Date.now(),
                                        username: newUsername,
                                        password: newPassword,
                                    })
                                })
                            } else {
                                alert("No data found");
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
        firebase.initializeApp(apiKey);
        db = firebase.database();
    })

    // log out in another window check
    window.addEventListener("storage", function(event) {
        if (event.storageArea === localStorage && event.key === null) {
            location.reload();
        }
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