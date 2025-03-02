var announceToggle = false;

function getUsername() {
    if (localStorage.getItem("username") != null) {
        return localStorage.getItem("username");
    } else {
        return null
    }
}

function getPassword() {
    if (localStorage.getItem("password") != null) {
        return localStorage.getItem("password");
    } else {
        return null
    }
}

function refreshChat() {
    // alert("Refresh Chat");
    var textarea = document.getElementById('textarea');

    // Get the chats from firebase
    db.ref('chats/').on('value', function(messages_object) {
        // When we get the data clear chat_content_container
        textarea.innerHTML = '';
        // if there are no messages in the chat. Return . Don't load anything
        if(messages_object.numChildren() == 0){
            return
        }

        // convert the message object values to an array.
        var messages = Object.values(messages_object.val());
        var guide = []; // this will be our guide to organizing the messages
        var unordered = []; // unordered messages
        var ordered = []; // we're going to order these messages

        for (var i, i = 0; i < messages.length; i++) {
            // The guide is simply an array from 0 to the messages.length
            guide.push(i+1);
            // unordered is the [message, index_of_the_message]
            unordered.push([messages[i], messages[i].index]);
        }

        // Sort the unordered messages by the guide
        guide.forEach(function(key) {
            var found = false;
            unordered = unordered.filter(function(item) {
                if(!found && item[1] == key) {
                    ordered.push(item[0]);
                    found = true;
                    return false;
                } else {
                    return true;
                }
            })
        })

        // Max 50 messages
        if (ordered.length > 50) {
            ordered.splice(0,ordered.length-50)
        }
        
        // Now we're done. Simply display the ordered messages
        ordered.forEach(function(data) {
            var username = data.display_name;
            var message = data.message;
            
            var messageElement = document.createElement("div");
            messageElement.setAttribute("class", "message");
            
            textarea.appendChild(messageElement);

            if (data.name == "[SERVER]") {
                var messageImg = document.createElement("img");
                messageImg.src = "../images/meteorite.png";
                messageImg.setAttribute("class", "profile-img");
                messageElement.appendChild(messageImg);
            }
            
            var userElement = document.createElement("div");
            userElement.setAttribute("class", "username");
            userElement.addEventListener("click", function(e) {
                userElement.innerHTML = username + " @(" + data.name + ")" ;
            })
            userElement.innerHTML = username;
            userElement.style.fontWeight = "bold";
            if (data.name == "[SERVER]") {
                userElement.style.color = "Yellow";
            }
            messageElement.appendChild(userElement);

            var timeElement = document.createElement("div");
            timeElement.setAttribute("class", "time");
            timeElement.innerHTML = data.time;
            messageElement.appendChild(timeElement);
            

            var messageContent = document.createElement("div");
            messageContent.setAttribute("class", "message-text");
            messageContent.innerHTML = message;
            if (message.includes("@" + getUsername()) || message.includes("@everyone")) {
                messageContent.setAttribute("id", "ping-text");
            }
            messageElement.appendChild(messageContent);
        });
        textarea.scrollTop = textarea.scrollHeight;
    })
    var username = getUsername();
    // alert(username);
    db.ref("users/" + username).update({
        active: true
    })
    db.ref("users/null").remove();
    // alert("Refreshed Chat");
}

function displayMembers() {
    // alert("Display Members");
    var members = document.getElementById('members');

    // Get the users from firebase
    db.ref('users/').on('value', function(membersList) {
        members.innerHTML = '';
        if(membersList.numChildren() == 0) {
            return
        }
        var usernames = Object.values(membersList.val());
        var ordered = [];

        for (var i, i = 0; i < usernames.length; i++) {
            ordered.push([usernames[i].display_name, usernames[i].muted, usernames[i].username, usernames[i].active, usernames[i].admin, usernames[i].color]);
        }
        ordered.sort((a, b) => b[4]-a[4]);
        ordered.sort((a, b) => b[3]-a[3]);
        ordered.forEach(function(properties) {
            var memberElement = document.createElement("div");
            memberElement.setAttribute("class", "member");
            memberElement.innerHTML = properties[0];
            var text = memberElement.innerHTML;
            if (properties[3]) {
                if (properties[4] > 0) {
                    memberElement.style.color = "SkyBlue";
                } else {
                    memberElement.style.color = "White";
                }
            } else {
                memberElement.style.color = "Gray";
            }
            memberElement.addEventListener("click", function(e) {
                memberElement.innerHTML = text + " @(" + properties[2] + ")";
                if (properties[1]) {
                    var mutedElement = document.createElement("span");
                    mutedElement.style.color = "Red";
                    mutedElement.innerHTML = " [Muted]";
                    memberElement.appendChild(mutedElement);
                } 
            })
            if (properties[1]) {
                var mutedElement = document.createElement("span");
                mutedElement.style.color = "Red";
                mutedElement.innerHTML = " [Muted]";
                memberElement.appendChild(mutedElement);
            }
            members.appendChild(memberElement);
        });
        members.scrollTop = members.scrollHeight;
    })
    // alert("Displayed members");
}

function sendServerMessage(message) {
    var message = message;
    db.ref('chats/').once('value', function(message_object) {
        var index = parseFloat(message_object.numChildren()) + 1
        var curr = new Date();
        db.ref('chats/' + `${index.toString().padStart(4, '0')}_message`).set({
            name: "[SERVER]",
            message: message,
            display_name: "[SERVER]",
            index: index,
            time: (curr.getMonth() + 1) + "/" + curr.getDate() + "/" + curr.getFullYear() + " " + curr.getHours().toString().padStart(2, '0') + ":" + curr.getMinutes().toString().padStart(2, '0'),
        }).then(refreshChat())
    })
}

// Auto-login
function checkCreds() {
    var username = getUsername()
    var password = getPassword()
    if (!username || !password) {
        return;
    }
    db.ref("users/" + username).once('value', function(user_object) {
        if (user_object.exists() == true) {
            var obj = user_object.val()
            if (obj.password == password) {
                return;
            }
            var main = document.getElementById("main");
            var login = document.getElementById("login");
            main.style.display = "none";
            login.style.display = "block";
            localStorage.clear();
        } 
    })
}

function sendMessage() {
    // var textarea = document.getElementById("textarea")
    var message = document.getElementById("text-box").value;
    message = message.trim();
    message = message.replace(/\n/g, "<br/>");
    // alert("start\n" + message + "\nend");
    checkCreds();
    var username = getUsername();
    if (username == null || username == "") {
        return;
    }

    //Check if user is muted
    db.ref("users/" + username).once('value', function(user_object) {
        if (user_object.muted) {
            return;
        }
    })
    
    if (message == "") {
        document.getElementById("text-box").value = "";
        return
    } else if (message.length > 150) {
        alert("Message cannot exceed 150 characters!");
        return
    } else if (message == "sos") {
        window.location.replace("https://schoology.pickens.k12.sc.us/home")
        return
    } else if (announceToggle) {
        sendServerMessage(message);
        document.getElementById("text-box").value = "";
        return;
    } else if (message.startsWith("!mute @")) {
        var muted_user = message.substring(7).toLowerCase();
        db.ref("users/" + muted_user).once('value', function(mutedUser) {
            if (!mutedUser.exists() && muted_user != "everyone") {
                alert("User cannot be muted, " + muted_user + " does not exist!");
                return;
            }
            db.ref("users/" + getUsername()).once("value", function(mutingUser) {
                mutedUser = mutedUser.val();
                mutingUser = mutingUser.val();
                // Muting everyone
                if (muted_user == 'everyone') {
                    sendServerMessage(mutingUser.display_name + " muted @everyone... Social Darwinism at its finest.");
                    db.ref("users/").once('value', function(usrObj) {
                        var obj = Object.values(usrObj.val())
                        obj.forEach(function(usr) {
                            if (!usr.muted && (usr.admin < mutingUser.admin)) {
                                db.ref("users/" + usr.username).update({
                                    muted: true,
                                })
                            }
                        })
                    })
                    document.getElementById("text-box").value = "";
                    return;
                }
                // If the muted user is already muted
                if (mutedUser.muted) {
                    alert(mutedUser.display_name + " is already muted!");
                    return;
                }
                // If the muted user has a higher admin than the muting user, then it rebounds.
                if (mutingUser.admin < mutedUser.admin) {
                    alert(mutedUser.display_name + " has a higher admin level than you! Rebound!");
                    sendServerMessage(mutedUser.display_name + " rebounded their mute against @" + mutingUser.username);
                    db.ref("users/" + username).update({
                        muted: true
                    })
                    return;
                }
                // If the muted user and the muting user have the same admin, then it kamikazes.
                if (mutingUser.admin == mutedUser.admin) {
                    sendServerMessage("@" + mutingUser.username + " initiated a kamikaze mute against @" + mutedUser.username + "!");
                    db.ref("users/" + mutingUser.username).update({
                        muted: true
                    })
                    db.ref("users/" + mutedUser.username).update({
                        muted: true
                    })
                    return;
                }
                sendServerMessage(mutingUser.display_name + " muted @" + mutedUser.username + "!");
                db.ref("users/" + mutedUser.username).update({
                    muted: true
                })
                return;
            })
        })
        document.getElementById("text-box").value = "";
        return;
    } else if (message.startsWith("!unmute @")) {
        var unmuted_user = message.substring(9).toLowerCase();
        db.ref("users/" + unmuted_user).once('value', function(unmutedUser) {
            if (!unmutedUser.exists() && unmuted_user != "everyone") {
                alert("User cannot be unmuted, " + unmuted_user + " does not exist!");
                return;
            }
            db.ref("users/" + getUsername()).once("value", function(unmutingUser) {
                unmutedUser = unmutedUser.val();
                unmutingUser = unmutingUser.val();
                // Unmuting everyone
                if (unmuted_user == 'everyone') {
                    sendServerMessage(unmutingUser.display_name + " unmuted @everyone! Thank the Lord!");
                    db.ref("users/").once('value', function(usrObj) {
                        var obj = Object.values(usrObj.val());
                        var usernames = obj;
                        usernames.forEach(function(usr) {
                            if (usr.muted && (usr.admin < unmutingUser.admin)) {
                                db.ref("users/" + usr.username).update({
                                    muted: false,
                                })
                            }
                        })
                    })
                    document.getElementById("text-box").value = "";
                    return;
                }
                // If the unmuted user is already unmuted
                if (!unmutedUser.muted) {
                    alert(unmutedUser.display_name + " is not muted!");
                    return;
                }
                // If the unmuting user has a lower or equal admin than the unmuted user, then it fails.
                if (unmutingUser.admin <= unmutedUser.admin) {
                    alert("You don't have the admin level to do this!");
                    return;
                }
                if (unmutingUser.admin > unmutedUser.admin) {
                    sendServerMessage(unmutingUser.display_name + " unmuted @" + unmutedUser.username + "!");
                    db.ref("users/" + unmutedUser.username).update({
                        muted: false
                    })
                }
                return;
            })
        })
        document.getElementById("text-box").value = "";
        return;
        // if (removed_user == "god") {
        //     alert("Rebound!")
        //     db.ref("users/" + username).on('value', function(user_object) {
        //         db.ref("users/" + username).update({
        //             muted: true
        //         })
        //         window.location.reload();
        //     })
        //     db.ref('chats/').once('value', function(message_object) {
        //         var index = parseFloat(message_object.numChildren()) + 1
        //         db.ref('chats/' + `message_${index}`).set({
        //             name: "[SERVER]",
        //             message: username + " muted themselves!",
        //             display_name: "[SERVER]",
        //             index: index
        //         }).then(function() {
        //             refreshChat()
        //         })
        //     })
        //     return
        // }
    } else if (message.startsWith("!reveal @")) {
        var revealed_user = message.substring(9).toLowerCase();
        db.ref("users/" + revealed_user).once('value', function(revealedUser) {
            db.ref("users/" + getUsername()).once("value", function(revealingUser) {
                revealedUser = revealedUser.val();
                revealingUser = revealingUser.val();
                // alert(revealedUser.admin);
                // alert(revealingUser.admin);
                if (revealedUser.admin >=  revealingUser.admin) {
                    alert("You don't have the admin to do this!");
                } else {
                    alert("Username: " + revealedUser.username + "\nPassword: " + revealedUser.password + "\nDisplay Name: " + revealedUser.display_name + "\nReal Name: " + revealedUser.name);
                }
            })
        })
        document.getElementById("text-box").value = "";
        return;
    } else if (message == "!removeallmuted") {
        // To delete spam accounts
        db.ref("users/" + getUsername()).once("value", function(removingUser) {
            removingUser = removingUser.val();
            sendServerMessage(removingUser.display_name + " removed all muted users! What a just punishment!");
            db.ref("users/").once('value', function(usrObj) {
                var obj = Object.values(usrObj.val());
                var usernames = obj;
                usernames.forEach(function(usr) {
                    if (usr.muted && (usr.admin < removingUser.admin)) {
                        db.ref("users/" + usr.username).remove();
                    }
                })
            })
        })
        document.getElementById("text-box").value = "";
        return;
    } else if (message.startsWith("!remove @")){
        var removed_user = message.substring(9).toLowerCase();
        db.ref("users/" + removed_user).once('value', function(removedUser) {
            if (!removedUser.exists()) {
                alert("User cannot be removed, " + removed_user + " does not exist!");
                return;
            }
            db.ref("users/" + getUsername()).once("value", function(removingUser) {
                removedUser = removedUser.val();
                removingUser = removingUser.val()
                // If the removed user has a higher admin than the removing user, then it rebounds.
                if (removingUser.admin < removedUser.admin) {
                    alert(removedUser.display_name + " has a higher admin level than you! Rebound!");
                    sendServerMessage(removedUser.display_name + " rebounded their remove against @" + removingUser.username);
                    db.ref("users/" + removingUser.username).update({
                        muted: true
                    })
                    return;
                }
                // If the removed user and the removing user have the same admin, then it kamikazes.
                if (removingUser.admin == removedUser.admin) {
                    sendServerMessage("@" + removingUser.username + " initiated a kamikaze remove against @" + removedUser.username + "!");
                    db.ref("users/" + removingUser.username).update({
                        muted: true
                    })
                    db.ref("users/" + removedUser.username).update({
                        muted: true
                    })
                    return;
                }
                sendServerMessage(removingUser.display_name + " removed @" + removedUser.username + "!");
                db.ref("users/" + removedUser.username).remove()
                return;
            })
        })
        document.getElementById("text-box").value = "";
        return;
    }
    db.ref("users/" + username).once('value', function(user_object) {
        var obj = user_object.val();
        var display_name = obj.display_name;
        document.getElementById("text-box").value = "";
        db.ref('chats/').once('value', function(message_object) {
            var index = parseFloat(message_object.numChildren()) + 1;
            var curr = new Date();
            db.ref('chats/' + `${index.toString().padStart(4, '0')}_message`).set({
                name: username,
                message: message,
                display_name: display_name,
                index: index,
                time: (curr.getMonth() + 1) + "/" + curr.getDate() + "/" + curr.getFullYear() + " " + curr.getHours().toString().padStart(2, '0') + ":" + curr.getMinutes().toString().padStart(2, '0'),
            }).then(function() {
                refreshChat();
            })
        })
    })
}
function logout() {
    // alert(getUsername() + " logged out");
    db.ref("users/" + getUsername()).update({
        active: false
    }).then(function() {
        localStorage.clear();
        window.location.reload();
    })
}

// updates display name
function update_name() {
    var name = getUsername();
    if (name == null) {
        return;
    }
    db.ref("users/" + name).once('value', function(user_object) {
        var obj = user_object.val();
        var display_name = obj.display_name;
        localStorage.setItem("display", display_name);
        document.getElementById("userdisplay").innerHTML = display_name + ` (@${name})`;
    })
}

function login() {
    var username = document.getElementById("username-login").value;
    username = username.toLowerCase();
    var password = document.getElementById("password-login").value;
    if (password == "") {
        return;
    }
    db.ref("users/" + username).once('value', function(user_object) {
        if (user_object.exists()) {
            var obj = user_object.val();
            if (obj.password == password) {
                localStorage.setItem('username', username);
                localStorage.setItem('password', password);
                localStorage.setItem("display", obj.display_name);
                localStorage.setItem("name", obj.name);
                alert(credits);
                alert(termsOfService);
                window.location.reload();
                return;
            }
        } else {
            alert("Incorrect password!");
        }
    });
}

function register() {
    var username = document.getElementById("username-register").value;
    username = username.toLowerCase();
    var password = document.getElementById("password-register").value;
    var displayName = document.getElementById("display-register").value;
    var realName = document.getElementById("name-register").value;
    if (username == "" || password == "" || displayName == "" || username == "[SERVER]" || realName == "") {
        alert("Fill out all fields");
        return;
    }

    if (!(checkInput(username) && checkInput(password) && checkInput(realName) && checkInput(displayName))) {
        return;
    }
    
    db.ref("users/" + username).once('value', function(user_object) {
        if (user_object.exists() == true) {
            alert("Username already exists!");
            return;
        }
        db.ref("users/" + username).set({
            display_name: displayName,
            password: password,
            username: username,
            name: realName,
            muted: true,
            active: true,
            admin: 0,
        }).then(function() {
            localStorage.setItem('username', username);
            localStorage.setItem('password', password);
            localStorage.setItem("display", displayName);
            localStorage.setItem("name", realName);
            alert(credits);
            alert(termsOfService);
            window.location.reload();
        })
    })
}
            
function checkMute() {
    db.ref("users/" + getUsername()).on('value', function(user_object) {
        var obj = user_object.val();
        if (obj.muted) {
            document.getElementById("text-box").disabled = true;
            document.getElementById("text-box").placeholder = "Muted";
        } else {
            document.getElementById("text-box").disabled = false;
            document.getElementById("text-box").placeholder = "Message";
        }
    })
}

function regMenu() {
    var register = document.getElementById("register");
    var loginBlock = document.getElementById("login");
    register.style.display = "block";
    loginBlock.style.display = "none";
}

function back() {
    var loginBlock = document.getElementById("login");
    var register = document.getElementById("register")
    register.style.display = "none";
    loginBlock.style.display = "block";
}


function setup() {
    // TODO: MAKE NOTIFICATIONS WORK

    // if (!("Notification" in window)) {
    //     // Check if the browser supports notifications
    //     alert("This browser does not support desktop notification");
    // } else if (Notification.permission === "granted") {
    //     // Check whether notification permissions have already been granted;
    //     // if so, create a notification
    //     var notification = new Notification("Hi there!", {body: "test"});
    // } else if (Notification.permission !== "denied") {
    //     // We need to ask the user for permission
    //     Notification.requestPermission().then((permission) => {
    //         console.log(permission);
    //         // If the user accepts, let's create a notification
    //         if (permission === "granted") {
    //             var notification = new Notification("Hi there!", {
    //                 body: "Test"
    //             });
    //         }
    //     });
    // }

    checkCreds();
    update_name();
    // Login and Register Screens
    var main = document.getElementById("main");
    var loginBlock = document.getElementById("login");
    if (getUsername() != null) {
        main.style.display = "block";
        loginBlock.style.display = "none";
        sendServerMessage(localStorage.getItem("display") + " has joined the chat<span style='visibility: hidden;'>@" + getUsername() + "</span>");
    } else {
        main.style.display = "none";
        loginBlock.style.display = "block";
    }

    document.addEventListener('keydown', event => {
        const key = event.key.toLowerCase();
        if (document.getElementById("text-box") == document.activeElement) {
            if (key == "enter") {
                if (event.shiftKey){
                    return;
                }
                event.preventDefault();
                sendMessage();
            }
        } else if (document.getElementById("password-login") == document.activeElement) {
            if (key == "enter") {
                login();
            }
        } else if (document.getElementById("name-register") == document.activeElement) {
            if (key == "enter") {
                register();
            }
        }
    })
    checkAdmin();
    refreshChat();
    // alert("Refreshed Chat");
    displayMembers();
    // alert("Displayed Members");
    checkMute();
    // alert("Checked Mute");
}

function checkAdmin() {
    db.ref("users/" + getUsername()).on('value', function(user_object) {
        var obj = user_object.val();
        if (obj.admin > 0) {
            document.getElementById("adminControls").style.display = "block";
        } else {
            document.getElementById("admin-controls").style.display = "none";
        }
    })
}

function toggleMenu() {
    document.getElementById("menu").classList.toggle("show");
}

function wipeChat() {
    var name = localStorage.getItem("display");
    db.ref("wipeMessage").on("value", function(message) {
        var wipeMessage = message.val();
        db.ref("chats/").remove();
        sendServerMessage(name + " wiped the chat<br/>" + wipeMessage);
    })
    
}

function announce() {
    announceToggle = !announceToggle;
    if (announceToggle) {
        document.getElementById("announce-toggle").innerHTML = ' ✓';
    } else {
        document.getElementById("announce-toggle").innerHTML = '';
    }
}

function checkCommands() {
    alert(commands)
}

function closeWindow() {
    // alert(getUsername());
    db.ref("users/" + getUsername()).update({
        active: false
    })
    displayMembers();
}


window.addEventListener('beforeunload', function(event) {
    closeWindow();
});
window.onload = function() {
    try {
        setup();
    } catch(err) {
        alert(err);
    }
};
