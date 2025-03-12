function getUsername() {
    if (localStorage.getItem("username") != null) {
        return localStorage.getItem("username");
    } else {
        return null;
    }
}

function submit() {
    var newDisplay = document.getElementById("display-input").value;
    var newName = document.getElementById("name-input").value;
    var newPassword = document.getElementById("new-input").value;
    var newCopyPassword = document.getElementById("copy-input").value;
    var oldPassword = document.getElementById("old-input").value;
    db.ref("users/" + getUsername()).once('value', function(user_object) {
        db.ref("other/").once('value', function(server_object) {
            var obj = user_object.val();
            var server = server_object.val()
            const lastProfileTime = obj.profilesleep || 0;
            const timePassed = Date.now() - lastProfileTime;
            if (timePassed < parseInt(server.profilesleeptime) * 1000 && obj.admin == 0) {
                alert("You are changing your profile details too quickly");
                return;
            } else {
                if (oldPassword != localStorage.getItem("password")) {
                    alert("Incorrect password!");
                    return;
                } else if (newPassword != newCopyPassword) {
                    alert("Passwords do not match!");
                    return;
                } else if (!(checkInput(newDisplay) && checkInput(newName) && checkInput(newPassword))) {
                    alert("Something went wrong...");
                    return;
                }
                var username = getUsername();
                db.ref("users/" + username).update({
                    display_name: newDisplay,
                    password: newPassword,
                    name: newName,
                    profilesleep: Date.now(),
                }).then(() =>{
                    localStorage.setItem("display", newDisplay);
                    localStorage.setItem("name", newName);
                    localStorage.setItem("password", newPassword);
                    document.getElementById("display-input").value = "";
                    document.getElementById("name-input").value = "";
                    document.getElementById("new-input").value = "";
                    document.getElementById("copy-input").value = "";
                    document.getElementById("old-input").value = "";
                    window.location.replace('../pebble/pebble.html');
                })
            }
        })
    })
}

window.onload = function() {
    // alert("god");
    var username = getUsername();
    if (username != null) {
        document.getElementById("username").innerHTML = username;
    } else {
        document.getElementById("username").innerHTML = "Not Logged In";
        return;
    }

    document.getElementById("display-input").value = localStorage.getItem("display");
    document.getElementById("name-input").value = localStorage.getItem("name");
}