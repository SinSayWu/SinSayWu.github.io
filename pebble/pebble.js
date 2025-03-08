var announceToggle = false;
var notificationNumber = 0;

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

        // Max 500 messages
        if (ordered.length > 50) {
            ordered.splice(0,ordered.length-500)
        }
        
        // Now we're done. Simply display the ordered messages
        ordered.forEach(function(data, index) {
            var username = data.display_name;
            var message = data.message;
            let prevIndex = index - 1;
            let prevItem = prevIndex >= 0 ? ordered[prevIndex] : null;
            
            var messageElement = document.createElement("div");
            messageElement.setAttribute("class", "message");
            
            textarea.appendChild(messageElement);

            if (data.name == "[SERVER]") {
                var messageImg = document.createElement("img");
                messageImg.src = "../images/meteorite.png";
                messageImg.setAttribute("class", "profile-img");
                messageElement.appendChild(messageImg);
            }

            var timeElement = document.createElement("div");
            timeElement.setAttribute("class", "time");
            timeElement.innerHTML = data.time;
            messageElement.appendChild(timeElement);

            if (data.name == "[SERVER]") {
                var userElement = document.createElement("div");
                userElement.setAttribute("class", "username");
                userElement.addEventListener("click", function(e) {
                    userElement.innerHTML = username + " @(" + data.name + ")" ;
                })
                userElement.innerHTML = username;
                userElement.style.fontWeight = "bold";
                userElement.style.color = "Yellow";
                messageElement.appendChild(userElement);
            } else if (prevItem == null || prevItem.name != data.name) {
                var userElement = document.createElement("div");
                userElement.setAttribute("class", "username");
                userElement.addEventListener("click", function(e) {
                    userElement.innerHTML = username + " @(" + data.name + ")" ;
                })
                userElement.innerHTML = username;
                userElement.style.fontWeight = "bold";
                timeElement.style.marginTop = "25px";
                messageElement.appendChild(userElement);
            }

            

            var messageContent = document.createElement("div");
            messageContent.setAttribute("class", "message-text");
            messageContent.innerHTML = message;
            if (message.includes("@" + getUsername()) || message.includes("@everyone")) {
                messageContent.setAttribute("id", "ping-text");
            }
            messageElement.appendChild(messageContent);
        });
        textarea.scrollTop = textarea.scrollHeight;

        // Notifications
        if (document.visibilityState === "hidden") {
            var prevMessage = ordered.at(-1)
            var announceNotification = localStorage.getItem("announceNotification") || true;
            var mentionNotification = localStorage.getItem("mentionNotification") || true;
            var messageNotification = localStorage.getItem("messageNotification") || false;
            try {
            if (prevMessage.display_name == "[SERVER]" && JSON.parse(announceNotification)) {
                notificationNumber += 1
            } else if ((prevMessage.message.includes("@" + getUsername()) || prevMessage.message.includes("@everyone")) && JSON.parse(mentionNotification)) {
                notificationNumber += 1
            } else if (JSON.parse(messageNotification)) {
                notificationNumber += 1
            }
            if (notificationNumber != 0) {
                document.title = "Pebble (" + notificationNumber + ")";
            }
        } catch(err) {
            alert(err)
        }
        };
    });
    db.ref("users/null").remove();
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
            ordered.push([usernames[i].display_name, usernames[i].muted, usernames[i].username, usernames[i].active, usernames[i].admin, usernames[i].trapped, usernames[i].sleep]);
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
                } else if (properties[5]) {
                    var mutedElement = document.createElement("span");
                        mutedElement.style.color = "rgb(145, 83, 196)";
                        mutedElement.innerHTML = " [Trapped]";
                        memberElement.appendChild(mutedElement);
                } else if ((Date.now() - (properties[6] || 0) + messageSleep < 0) && properties[4] == 0) {
                    var mutedElement = document.createElement("span");
                    mutedElement.style.color = "rgb(145, 83, 196)";
                    mutedElement.innerHTML = " [Timed Out]";
                    memberElement.appendChild(mutedElement);
                }
            })
            if (properties[1]) {
                var mutedElement = document.createElement("span");
                mutedElement.style.color = "Red";
                mutedElement.innerHTML = " [Muted]";
                memberElement.appendChild(mutedElement);
            } else if (properties[5]) {
                var mutedElement = document.createElement("span");
                    mutedElement.style.color = "rgb(145, 83, 196)";
                    mutedElement.innerHTML = " [Trapped]";
                    memberElement.appendChild(mutedElement);
            } else if ((Date.now() - (properties[6] || 0) + messageSleep < 0) && properties[4] == 0) {
                var mutedElement = document.createElement("span");
                    mutedElement.style.color = "rgb(145, 83, 196)";
                    mutedElement.innerHTML = " [Timed Out]";
                    memberElement.appendChild(mutedElement);
            }
            members.appendChild(memberElement);
        });
        // members.scrollTop = members.scrollHeight;
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
        })
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
                if (muted_user == 'everyone' && mutingUser.admin > 0) {
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
                if (unmuted_user == 'everyone' && unmutingUser.admin > 0) {
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
    } else if (message.startsWith("!reveal @")) {
        var revealed_user = message.substring(9).toLowerCase();
        db.ref("users/" + revealed_user).once('value', function(revealedUser) {
            db.ref("users/" + getUsername()).once("value", function(revealingUser) {
                revealedUser = revealedUser.val();
                revealingUser = revealingUser.val();
                if (revealedUser.admin >=  revealingUser.admin && revealedUser.username != revealingUser.username) {
                    alert("Real Name: " + revealedUser.name + "\nAdmin Level: " + revealedUser.admin);
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
            if (removingUser.admin > 0) {
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
            }
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
                db.ref("users/" + removedUser.username).remove();
                return;
            })
        })
        document.getElementById("text-box").value = "";
        return;
    } else if (message.startsWith("!trap @")){
        var trapped_user = message.substring(7).toLowerCase();
        db.ref("users/" + trapped_user).once('value', function(trappedUser) {
            if (!trappedUser.exists()) {
                alert("User cannot be trapped, " + trapped_user + " does not exist!");
                return;
            }
            db.ref("users/" + getUsername()).once("value", function(trappingUser) {
                trappedUser = trappedUser.val();
                trappingUser = trappingUser.val()
                if (trappingUser.admin > trappedUser.admin) {
                    sendServerMessage(trappingUser.display_name + " trapped @" + trappedUser.username + "!");
                    db.ref("users/" + trappedUser.username).update({
                        trapped: true,
                        reload: true,
                    })
                }
                return;
            })
        })
        document.getElementById("text-box").value = "";
        return;
    } else if (message.startsWith("!release @")){
        var untrapped_user = message.substring(10).toLowerCase();
        db.ref("users/" + untrapped_user).once('value', function(untrappedUser) {
            if (!untrappedUser.exists() && untrapped_user != 'everyone') {
                alert("User cannot be released, " + untrapped_user + " does not exist!");
                return;
            }
            db.ref("users/" + getUsername()).once("value", function(untrappingUser) {
                untrappedUser = untrappedUser.val();
                untrappingUser = untrappingUser.val()
                if (untrapped_user == 'everyone' && untrappingUser.admin > 0) {
                    sendServerMessage(untrappingUser.display_name + " released @everyone! Thank the Lord!");
                    db.ref("users/").once('value', function(usrObj) {
                        var obj = Object.values(usrObj.val());
                        var usernames = obj;
                        usernames.forEach(function(usr) {
                            if (usr.trapped && (usr.admin < untrappingUser.admin)) {
                                db.ref("users/" + usr.username).update({
                                    trapped: false,
                                })
                            }
                        })
                    })
                    document.getElementById("text-box").value = "";
                    return;
                }
                if (untrappingUser.admin > untrappedUser.admin) {
                    sendServerMessage(untrappingUser.display_name + " released @" + untrappedUser.username + "!");
                    db.ref("users/" + untrappedUser.username).update({
                        trapped: false,
                        reload: true,
                    })
                }
                return;
            })
        })
        document.getElementById("text-box").value = "";
        return;
    } else if (message.startsWith("!timeout @")){
        var timed_user = message.split(" ")[1].substring(1).toLowerCase();
        var timeout_time = message.split(" ")[2];
        db.ref("users/" + timed_user).once('value', function(timedUser) {
            if (!timedUser.exists()) {
                alert("User cannot be timed out, " + timed_user + " does not exist!");
                return;
            }
            db.ref("users/" + getUsername()).once("value", function(timingUser) {
                timedUser = timedUser.val();
                timingUser = timingUser.val()
                if (timingUser.admin > timedUser.admin) {
                    sendServerMessage(timingUser.display_name + " timed out @" + timedUser.username + " for " + timeout_time + " seconds!");
                    db.ref("users/" + timedUser.username).update({
                        sleep: Date.now() + ((timeout_time * 1000) - messageSleep),
                    })
                }
                return;
            })
        })
        document.getElementById("text-box").value = "";
        return;
    } else if (message.startsWith("!removetimeout @")){
        var removetimed_user = message.split(" ")[1].substring(1).toLowerCase();
        db.ref("users/" + removetimed_user).once('value', function(removetimedUser) {
            if (!removetimedUser.exists()) {
                alert("User's timeout cannot be removed, " + timed_user + " does not exist!");
                return;
            }
            db.ref("users/" + getUsername()).once("value", function(removetimingUser) {
                removetimedUser = removetimedUser.val();
                removetimingUser = removetimingUser.val()
                if (removetimingUser.admin > removetimedUser.admin) {
                    sendServerMessage(removetimingUser.display_name + " removed the timeout for @" + removetimedUser.username + "!");
                    db.ref("users/" + removetimedUser.username).update({
                        sleep: 0,
                    })
                }
                return;
            })
        })
        document.getElementById("text-box").value = "";
        return;
    } else if (message.startsWith("!lockdown")) {
        db.ref("users/" + getUsername()).once("value", function(lockdownUser) {
            lockdownUser = lockdownUser.val()
            if (lockdownUser.admin > 0) {
                sendServerMessage(lockdownUser.display_name + " has locked down the server!");
                db.ref("other/").update({
                    lockdown: true,
                })
            }
            return;
        })
        document.getElementById("text-box").value = "";
        return;
    } else if (message.startsWith("!removelockdown")) {
        db.ref("users/" + getUsername()).once("value", function(lockdownUser) {
            lockdownUser = lockdownUser.val()
            if (lockdownUser.admin > 0) {
                sendServerMessage(lockdownUser.display_name + " has removed the lock down for the server!");
                db.ref("other/").update({
                    lockdown: false,
                })
            }
            return;
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
                db.ref("users/" + username).update({
                    sleep: Date.now(),
                })
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
            sendServerMessage(localStorage.getItem("display") + " has joined the chat<span style='visibility: hidden;'>@" + getUsername() + "</span>");
        })
    })
}
            
function checkMute() {
    db.ref("users/" + getUsername()).on('value', function(user_object) {
        var obj = user_object.val();
        const lastMessageTime = obj.sleep || 0;
        const timePassed = Date.now() - lastMessageTime;
        if (obj.muted) {
            document.getElementById("text-box").disabled = true;
            document.getElementById("text-box").placeholder = "Muted";
        } else if (timePassed < messageSleep && obj.admin == 0) {
            // What does messageSleep represent
            // WHAT IS THIS THING
            if (timePassed + messageSleep < 0) {
                document.getElementById("text-box").disabled = true;
                document.getElementById("text-box").placeholder = "You are timed out";
            } else {
                document.getElementById("text-box").disabled = true;
                document.getElementById("text-box").placeholder = "Slow mode active";
            }
        } else {
            document.getElementById("text-box").disabled = false;
            document.getElementById("text-box").placeholder = "Message"
            document.getElementById("text-box").focus();
        }
    })
}

function regMenu() {
    var register = document.getElementById("register");
    var loginBlock = document.getElementById("login");
    db.ref("other/").once("value", function(obj) {
        var obj = obj.val();
        if (!obj.lockdown) {
            loginBlock.style.display = "none";
            register.style.display = "block";
        }
    })
}

function back() {
    var loginBlock = document.getElementById("login");
    var register = document.getElementById("register")
    register.style.display = "none";
    loginBlock.style.display = "block";
}

function globalUpdate() {
    checkMute();
}


function setup() {
    // Notification check
    document.addEventListener("visibilitychange", function() {
        if (document.visibilityState === "visible") {
            notificationNumber = 0
            document.title = "Pebble";
        }
    });
    slowMode();
    checkCreds();
    update_name();
    // Login and Register Screens
    var main = document.getElementById("main");
    var loginBlock = document.getElementById("login");
    if (getUsername() != null) {
        main.style.display = "block";
        loginBlock.style.display = "none";
        db.ref("users/" + getUsername()).once('value').then(snapshot => {
            var obj = snapshot.val();
            const lastMessageTime = obj.sleep || 0;
            const timePassed = Date.now() - lastMessageTime;
            if (snapshot.exists()) {
                db.ref("users/" + getUsername()).update({
                    active: true
                })
            }
            if ((!obj.muted && !(timePassed < messageSleep) && !obj.trapped) || obj.admin > 0) {
                sendServerMessage(localStorage.getItem("display") + " has joined the chat<span style='visibility: hidden;'>@" + getUsername() + "</span>");
            }
        })
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
    checkTrapped();
    reloadTrapped();
    refreshChat();
    // alert("Refreshed Chat");
    displayMembers()
    // alert("Displayed Members");
    checkMute()
    setInterval(globalUpdate, 1000);
}

function checkAdmin() {
    db.ref("users/" + getUsername()).once('value', function(user_object) {
        var obj = user_object.val();
        if (obj.admin > 0) {
            document.getElementById("adminControls").style.display = "block";
        } else {
            document.getElementById("admin-controls").style.display = "none";
        }
    })
}

function checkTrapped() {
    db.ref("users/" + getUsername()).on('value', function(user_object) {
        var obj = user_object.val();
        if (!obj.trapped) {
            document.getElementById("logoutButton").style.display = "block";
        } else {
            document.getElementById("logoutButton").style.display = "none";
            document.getElementById("messagebox").style.display = "none";
        }
    })
}


function reloadTrapped() {
    db.ref("users/" + getUsername() +"/reload").on("value", (snapshot) => {
        if (snapshot.val() === true) {
            location.reload();
            db.ref("users/" + getUsername() +"/reload").set(false);
        }
    });
    
}

function toggleMenu() {
    db.ref("users/" + getUsername()).once('value', function(user_object) {
        var obj = user_object.val();
        if (obj.admin > 0) {
            document.getElementById("adminMenu").classList.toggle("show");
        } else {
            document.getElementById("userMenu").classList.toggle("show");
        }
    })
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

function slowmodeToggle() {
    db.ref("other/").once("value", function(obj) {
        var obj = obj.val();
        var slowmode = obj.slowmode;
        slowmode = !slowmode;
        db.ref("other/").update({
            slowmode: slowmode
        });
        if (slowmode) {
            // document.getElementById("slowmode-toggle").innerHTML = ' ✓';
            sendServerMessage("Slowmode has been enabled");
        } else {
            // document.getElementById("slowmode-toggle").innerHTML = '';
            sendServerMessage("Slowmode has been disabled");
        }
    })
}

function slowMode() {
    db.ref("other/").on("value", function(obj) {
        var obj = obj.val();
        if (obj.slowmode) {
            messageSleep = 5000; // 5 seconds
        } else {
            messageSleep = 0; // 0 seconds
        }
    })
}

function checkCommands() {
    alert(commands)
}

function closeWindow() {
    // alert(getUsername());
    db.ref("users/" + getUsername()).once('value').then(snapshot => {
        if (snapshot.exists()) {
            db.ref("users/" + getUsername()).update({
                active: false
            })
        }
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
