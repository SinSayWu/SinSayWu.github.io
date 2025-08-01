var announceToggle = false;
var brainRot = false;
var notificationNumber = 0;
var everyoneRevealed = false;
var joined = true;
var messageSleep = 0;
var imageSleep = 0;
let active_users;
let inactive_users;
var globalMessages = [];
var loadSubsequentMessages = false;
let images
let db;

function getChats() {
    db.ref(`users/${getUsername()}`).once("value", function(user_object) {
        db.ref('chats/').limitToLast(1).once("value", function(last_message) {
            db.ref('chats/').on('child_added', function(message_object) {
                let key = null;

                globalMessages.push(message_object);

                last_message.forEach((childSnapshot) => {
                    key = childSnapshot.key;
                })

                if (message_object.key == key) {
                    loadSubsequentMessages = true;
                }

                if (loadSubsequentMessages) {
                    refreshChat(user_object);
                }
            })
        })
    })
}

function checkDeletion() {
    db.ref(`users/${getUsername()}`).once("value", function(user_object) {
        db.ref('chats/').on('child_removed', function(message_object) {
            const index = globalMessages.findIndex(obj =>
                obj.key === message_object.key
            );

            if (index !== -1) {
                globalMessages.splice(index, 1);
            }

            refreshChat(user_object);
        })
    })
}

function checkEdit() {
    db.ref(`users/${getUsername()}`).once("value", function(user_object) {
        db.ref('chats/').on('child_changed', function(message_object) {
            const index = globalMessages.findIndex(obj =>
                obj.key === message_object.key
            );

            if (index !== -1) {
                globalMessages[index] = message_object;
            }

            refreshChat(user_object);
        })
    })
}

function checkVoting() {
    db.ref('other/vote').on('value', function(vote_object) {
        vote_object.forEach((vote_child) => {
            if (vote_child.key != "message" && vote_child.key != "voters") {
                document.getElementById(vote_child.key).innerHTML = vote_child.val();
            }
        })
        db.ref('other/vote/voters/' + getUsername()).once('value', function(voter_object) {
            if (voter_object.exists()) {
                const buttons = document.querySelectorAll('.votebutton');
                buttons.forEach(button => {
                    button.disabled = true;
                });
            }
        })
    })
}

function refreshChat(user_data, change_channel = false) {
    // alert("Refresh Chat");
    var textarea = document.getElementById('textarea');

    // When we get the data clear chat_content_container
    textarea.innerHTML = '';

    var obj = user_data.val();
    globalMessages.forEach(function(data, index) {
        if ((data.val().whisper == null || data.val().whisper == getUsername() || data.val().name == getUsername() || obj.admin > 0) && (data.val().channel == (sessionStorage.getItem("channel") || "general") || (data.val().name == "[SERVER]" && sessionStorage.getItem("channel") !== "extra"))) {
            if (everyoneRevealed) {
                var username = data.val().real_name || "[SERVER]";
            } else {
                var username = data.val().name;
            }

            // TODO: FIX THIS TO DO SOMETHING IDK WHAT
            if (data.val().removed) {
                var message = data.val().message;
            } else {
                var message = data.val().message;
            }
            
            let prevIndex = index - 1;
            let prevItem = prevIndex >= 0 ? globalMessages[prevIndex] : null;
            
            var messageElement = document.createElement("div");
            messageElement.setAttribute("class", "message");

            if (data.val().name == "[SERVER]") {
                var messageImg = document.createElement("img");
                messageImg.src = "../images/meteorite.png";
                messageImg.setAttribute("class", "profile-img");
                messageElement.appendChild(messageImg);
            }

            var timeElement = document.createElement("div");
            timeElement.setAttribute("id", "time");
            timeElement.innerHTML = data.val().time;
            messageElement.appendChild(timeElement);

            if (data.val().name == "[SERVER]") {
                var userElement = document.createElement("div");
                userElement.setAttribute("class", "username");
                userElement.innerHTML = username;
                userElement.style.fontWeight = "bold";
                userElement.style.color = "Yellow";
                messageElement.appendChild(userElement);
            } else if (prevItem == null || prevItem.val().name != data.val().name || data.val().edited) {
                var userElement = document.createElement("div");
                userElement.setAttribute("class", "username");
                userElement.addEventListener("click", function(e) {
                    if (userElement.innerHTML.includes("@")) {
                        userElement.innerHTML = username;
                    } else {
                        userElement.innerHTML = username + " @(" + data.val().real_name + ")";
                    }
                })
                userElement.innerHTML = username;
                if (data.val().edited) {
                    userElement.innerHTML += " <span style='color: gray; font-size: 60%'>(Edited)</span>";
                }
                userElement.style.fontWeight = "bold";
                timeElement.style.marginTop = "25px";
                messageElement.appendChild(userElement);
            }



            messageElement.addEventListener("mouseover", function(e) {
                messageContent.style.backgroundColor = "gray";
                if ((data.val().name == getUsername() || data.val().admin < obj.admin) && !messageElement.querySelector("#delete-button") && !globalMessages[index].val().removed) {
                    setTimeout(() => {
                        var trashButton = document.createElement("button");
                        timeElement.style.visibility = "hidden";
                        trashButton.innerHTML = "🗑️️";
                        trashButton.setAttribute("id", "delete-button");
                        trashButton.addEventListener("click", function() {
                            db.ref("chats/" + globalMessages[index].key).update({
                                removed: getUsername(),
                                admin: obj.admin,
                            });
                        })
                        messageElement.appendChild(trashButton);
                    }, 100);
                }
                if (data.val().name == getUsername() && !messageElement.querySelector("#edit-button") && !globalMessages[index].val().removed) {
                    var editing_message = localStorage.getItem("editing");
                    var editButton = document.createElement("button");
                    var textBox = document.getElementById("text-box");
                    editButton.setAttribute("id", "edit-button");
                    timeElement.style.visibility = "hidden";
                    if (editing_message == globalMessages[index].key) {
                        editButton.innerHTML = "🗙";
                    } else {
                        editButton.innerHTML = "✏️";
                    }
                    editButton.addEventListener("click", function() {
                        if (editing_message == globalMessages[index].key) {
                            editButton.innerHTML = "✏️";
                            localStorage.removeItem("editing");
                            textBox.value = "";
                            textBox.focus();
                        } else {
                            editButton.innerHTML = "🗙";
                            db.ref(`chats/${globalMessages[index].key}/message`).once("value", function(edit_message) {
                                textBox.value = unsanitize(edit_message.val());
                            })
                            textBox.focus();
                            localStorage.setItem("editing", globalMessages[index].key);
                        }
                    });

                    messageElement.appendChild(editButton);
                }
            })
            messageElement.addEventListener("mouseleave", function(e) {
                messageContent.style.backgroundColor = "";
                timeElement.style.visibility = "visible";

                setTimeout(() => {
                    var buttons = messageElement.querySelectorAll("#delete-button, #edit-button");
                    buttons.forEach(function(button) {
                        button.remove();
                    })
                    timeElement.style.visibility = "visible";
                }, 100)
            })
            

            var messageContent = document.createElement("div");
            messageContent.setAttribute("class", "message-text");
            messageContent.innerHTML = message;

            if (message.includes("@" + getUsername()) || message.includes("@everyone")) {
                messageContent.setAttribute("id", "ping-text");
            }

            if (data.val().edited) {
                messageContent.innerHTML = "edited: " + message;
            }

            if (data.val().removed && data.val().admin >= obj.admin) {
                messageContent.innerHTML = `<i><b>REMOVED BY ${data.val().removed}</b></i><span style="display: none">@${data.val().removed} @${data.val().name}</span>`;
            } else if (data.val().removed && data.val().admin < obj.admin) {
                messageContent.innerHTML = `Removed by ${data.val().removed}: ${message}`;
            }

            if (data.val().effect === 0) {
                var textContent = document.createElement("div");
                messageElement.appendChild(textContent);
                textContent.setAttribute("id", "god-border");
                // messageContent.innerHTML = "";
                textContent.appendChild(messageContent);
                
                messageContent.setAttribute("id", "god-text");
                messageContent.setAttribute("class", "");
                messageElement.appendChild(textContent);
            } else {
                messageElement.appendChild(messageContent);
            }


            textarea.appendChild(messageElement);

            if (data.val().name == "[VOTING]") {
                checkVoting();
            }

            if (globalMessages.at(-1).val().effect === 1 && data.key == globalMessages.at(-1).key) {
                var scrambleText = new ScrambleText(messageContent).start();
            }
        }
    });

    // Notifications
    var prevMessage = globalMessages.at(-1)

    if (document.visibilityState === "hidden") {
        var announceNotification = localStorage.getItem("announceNotification") || true;
        var mentionNotification = localStorage.getItem("mentionNotification") || true;
        var messageNotification = localStorage.getItem("messageNotification") || false;

        if (!(prevMessage.val().channel == "admin" && obj.admin == 0)) {
            if (prevMessage.val().username == "[SERVER]" && JSON.parse(announceNotification)) {
                notificationNumber += 1
            } else if ((prevMessage.val().message.includes("@" + getUsername()) || prevMessage.val().message.includes("@everyone")) && JSON.parse(mentionNotification)) {
                notificationNumber += 1
            } else if (JSON.parse(messageNotification)) {
                notificationNumber += 1
            }
            if (notificationNumber != 0) {
                document.title = "(" + notificationNumber + ") Pebble";
            }
        }
    }
    
    if ((sessionStorage.getItem("channel") || "general") != globalMessages.at(-1).val().channel && !(globalMessages.at(-1).val().channel == "admin" && obj.admin == 0)) {
        if (joined) {
            joined = false;
            return;
        } else if (change_channel) {
            return;
        }

        var notif = document.getElementById(`${globalMessages.at(-1).val().channel}-notif`);

        notif.innerHTML = `(${(parseInt(notif.innerHTML.substring(1,2)) || 0) + 1})`;
    }
    textarea.scrollTop = textarea.scrollHeight;
}

function displayMembers() {
    var members = document.getElementById('members');

    db.ref(`other/admin_list`).once("value", function(admin_object) {
        db.ref('users/').orderByChild("admin").once('value', function(membersList) {
            active_users = [];
            inactive_users = [];

            membersList.forEach((member_child) => {
                if (!Object.hasOwn(admin_object.val(), member_child.val().id)) {
                    if (member_child.val().active) {
                        active_users.push(member_child.val());
                    } else {
                        inactive_users.push(member_child.val());
                    }

                    db.ref(`users/${member_child.val().username}/active`).on("value", function(active_object) {
                        if (active_users.some(obj => obj.username === member_child.val().username) && !active_object.val()) {
                            const index = active_users.findIndex(obj => obj.username === member_child.val().username);
                            if (index !== -1) {
                                inactive_users.push(active_users.splice(index, 1)[0]);
                                redisplayMembers();
                            }
                        } else if (inactive_users.some(obj => obj.username === member_child.val().username) && active_object.val()) {
                            const index = inactive_users.findIndex(obj => obj.username === member_child.val().username);
                            if (index !== -1) {
                                active_users.push(inactive_users.splice(index, 1)[0]);
                                redisplayMembers();
                            }
                        }
                    })
                }
            })

            active_users.reverse();
            inactive_users.reverse();

            var members = document.getElementById('members');
            members.innerHTML = "";

            active_users.forEach((username) => {
                var mainElement = document.createElement("div");
                var memberElement = document.createElement("div");
                memberElement.setAttribute("class", "member");
                var inner = "";
                if (everyoneRevealed) {
                    inner += username.name;
                } else {
                    inner += username.username;
                }
                memberElement.innerHTML = inner;

                mainElement.appendChild(memberElement);

                if (username.admin > 0) {
                    memberElement.style.color = "SkyBlue";
                } else {
                    memberElement.style.color = "White";
                }

                var adminLevel = document.createElement("div");

                db.ref(`users/${username.username}/admin`).on("value", function(admin_object) {
                    adminLevel.setAttribute("id", "admin-level");
                    adminLevel.setAttribute("class", "member");
                    adminLevel.innerHTML = `(${admin_object.val()})`;

                    if (admin_object.val() > 0) {
                        memberElement.style.color = "SkyBlue";
                    } else {
                        memberElement.style.color = "White";
                    }
                })

                mainElement.appendChild(adminLevel);

                var mutedElement = document.createElement("span");
                var timedElement = document.createElement("span");
                var trappedElement = document.createElement("span");

                db.ref(`users/${username.username}/muted`).on("value", function(muted_object) {
                    if (muted_object.val()) {
                        mutedElement.style.color = "Red";
                        mutedElement.innerHTML = "&nbsp;[Muted]";
                    } else {
                        mutedElement.innerHTML = "";
                    }
                })

                db.ref(`users/${username.username}/trapped`).on("value", function(trapped_object) {
                    if (trapped_object.val()) {
                        trappedElement.style.color = "rgb(145, 83, 196)";
                        trappedElement.innerHTML = "&nbsp;[Trapped]";
                    } else {
                        trappedElement.innerHTML = "";
                    }
                })

                db.ref(`users/${username.username}/sleep`).on("value", function(timed_object) {
                    if ((Date.now() - (timed_object.val() || 0) + messageSleep + 200 < 0) && username.admin == 0) {
                        timedElement.style.color = "rgb(145, 83, 196)";
                        timedElement.innerHTML = "&nbsp;[Timed Out]";
                    } else {
                        timedElement.innerHTML = "";
                    }
                })

                memberElement.appendChild(mutedElement);
                memberElement.appendChild(timedElement);
                memberElement.appendChild(trappedElement);

                members.appendChild(mainElement);
            })

            var hr = document.createElement("hr");
            hr.style.borderColor = "rgb(0, 0, 0)";
            members.appendChild(hr);

            inactive_users.forEach((username) => {
                var mainElement = document.createElement("div");
                var memberElement = document.createElement("div");
                memberElement.setAttribute("class", "member");
                var inner = "";
                if (everyoneRevealed) {
                    inner += username.name;
                } else {
                    inner += username.username;
                }
                memberElement.innerHTML = inner;
                memberElement.style.color = "gray";

                mainElement.appendChild(memberElement);

                var adminLevel = document.createElement("div");

                db.ref(`users/${username.username}/admin`).on("value", function(admin_object) {
                    adminLevel.setAttribute("id", "admin-level");
                    adminLevel.setAttribute("class", "member");
                    adminLevel.innerHTML = `(${admin_object.val()})`;
                })

                mainElement.appendChild(adminLevel);

                var mutedElement = document.createElement("span");
                var timedElement = document.createElement("span");
                var trappedElement = document.createElement("span");

                db.ref(`users/${username.username}/muted`).on("value", function(muted_object) {
                    if (muted_object.val()) {
                        mutedElement.style.color = "Red";
                        mutedElement.innerHTML = "&nbsp;[Muted]";
                    } else {
                        mutedElement.innerHTML = "";
                    }
                })

                db.ref(`users/${username.username}/trapped`).on("value", function(trapped_object) {
                    if (trapped_object.val()) {
                        trappedElement.style.color = "rgb(145, 83, 196)";
                        trappedElement.innerHTML = "&nbsp;[Trapped]";
                    } else {
                        trappedElement.innerHTML = "";
                    }
                })

                db.ref(`users/${username.username}/sleep`).on("value", function(timed_object) {
                    if ((Date.now() - (timed_object.val() || 0) + messageSleep + 200 < 0) && username.admin == 0) {
                        timedElement.style.color = "rgb(145, 83, 196)";
                        timedElement.innerHTML = "&nbsp;[Timed Out]";
                    } else {
                        timedElement.innerHTML = "";
                    }
                })

                memberElement.appendChild(mutedElement);
                memberElement.appendChild(timedElement);
                memberElement.appendChild(trappedElement);

                members.appendChild(mainElement);
            })
        })
    })
}

function redisplayMembers() {
    active_users.sort((a, b) => b.admin - a.admin);
    inactive_users.sort((a, b) => b.admin - a.admin);

    var members = document.getElementById('members');
    members.innerHTML = "";

    active_users.forEach((username) => {
        var mainElement = document.createElement("div");
        var memberElement = document.createElement("div");
        memberElement.setAttribute("class", "member");
        var inner = "";
        if (everyoneRevealed) {
            inner += username.name;
        } else {
            inner += username.username;
        }
        memberElement.innerHTML = inner;

        mainElement.appendChild(memberElement);

        if (username.admin > 0) {
            memberElement.style.color = "SkyBlue";
        } else {
            memberElement.style.color = "White";
        }

        var adminLevel = document.createElement("div");

        db.ref(`users/${username.username}/admin`).once("value", function(admin_object) {
            adminLevel.setAttribute("id", "admin-level");
            adminLevel.setAttribute("class", "member");
            adminLevel.innerHTML = `(${admin_object.val()})`;
        })

        mainElement.appendChild(adminLevel);

        var mutedElement = document.createElement("span");
        var timedElement = document.createElement("span");
        var trappedElement = document.createElement("span");

        db.ref(`users/${username.username}/muted`).once("value", function(muted_object) {
            if (muted_object.val()) {
                mutedElement.style.color = "Red";
                mutedElement.innerHTML = "&nbsp;[Muted]";
            } else {
                mutedElement.innerHTML = "";
            }
        })

        db.ref(`users/${username.username}/trapped`).once("value", function(trapped_object) {
            if (trapped_object.val()) {
                trappedElement.style.color = "rgb(145, 83, 196)";
                trappedElement.innerHTML = "&nbsp;[Trapped]";
            } else {
                trappedElement.innerHTML = "";
            }
        })

        db.ref(`users/${username.username}/sleep`).once("value", function(timed_object) {
            if ((Date.now() - (timed_object.val() || 0) + messageSleep + 200 < 0) && username.admin == 0) {
                timedElement.style.color = "rgb(145, 83, 196)";
                timedElement.innerHTML = "&nbsp;[Timed Out]";
            } else {
                timedElement.innerHTML = "";
            }
        })

        memberElement.appendChild(mutedElement);
        memberElement.appendChild(timedElement);
        memberElement.appendChild(trappedElement);

        members.appendChild(mainElement);
    })

    var hr = document.createElement("hr");
    hr.style.borderColor = "rgb(0, 0, 0)";
    members.appendChild(hr);

    inactive_users.forEach((username) => {
        var mainElement = document.createElement("div");
        var memberElement = document.createElement("div");
        memberElement.setAttribute("class", "member");
        var inner = "";
        if (everyoneRevealed) {
            inner += username.name;
        } else {
            inner += username.username;
        }
        memberElement.innerHTML = inner;
        memberElement.style.color = "gray";

        mainElement.appendChild(memberElement);

        var adminLevel = document.createElement("div");

        db.ref(`users/${username.username}/admin`).once("value", function(admin_object) {
            adminLevel.setAttribute("id", "admin-level");
            adminLevel.setAttribute("class", "member");
            adminLevel.innerHTML = `(${admin_object.val()})`;
        })

        mainElement.appendChild(adminLevel);

        var mutedElement = document.createElement("span");
        var timedElement = document.createElement("span");
        var trappedElement = document.createElement("span");

        db.ref(`users/${username.username}/muted`).once("value", function(muted_object) {
            if (muted_object.val()) {
                mutedElement.style.color = "Red";
                mutedElement.innerHTML = "&nbsp;[Muted]";
            } else {
                mutedElement.innerHTML = "";
            }
        })

        db.ref(`users/${username.username}/trapped`).once("value", function(trapped_object) {
            if (trapped_object.val()) {
                trappedElement.style.color = "rgb(145, 83, 196)";
                trappedElement.innerHTML = "&nbsp;[Trapped]";
            } else {
                trappedElement.innerHTML = "";
            }
        })

        db.ref(`users/${username.username}/sleep`).once("value", function(timed_object) {
            if ((Date.now() - (timed_object.val() || 0) + messageSleep + 200 < 0) && username.admin == 0) {
                timedElement.style.color = "rgb(145, 83, 196)";
                timedElement.innerHTML = "&nbsp;[Timed Out]";
            } else {
                timedElement.innerHTML = "";
            }
        })

        memberElement.appendChild(mutedElement);
        memberElement.appendChild(timedElement);
        memberElement.appendChild(trappedElement);

        members.appendChild(mainElement);
    })
}

function sendServerMessage(message, join=false) {
    var message = message;
    db.ref(`other/admin_list`).once("value", function(admin_object) {
        db.ref(`users/${getUsername()}`).once('value', function(user_object) {
            var curr = new Date();
            if (announceToggle || !Object.hasOwn(admin_object.val(), user_object.val().id)) {
                db.ref('chats/').push({
                    name: "[SERVER]",
                    message: message,
                    admin: 9998,
                    channel: (sessionStorage.getItem("channel") || "general"),
                    removed: false,
                    edited: false,
                    time: (curr.getMonth() + 1) + "/" + curr.getDate() + "/" + curr.getFullYear() + " " + curr.getHours().toString().padStart(2, '0') + ":" + curr.getMinutes().toString().padStart(2, '0'),
                    effect: typeof(user_object.val().active_effect) == "undefined" || !join ? false : user_object.val().active_effect,
                })
            }
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
        if (user_object.exists() && user_object.val().password == password) {
            return;
        }
        var main = document.getElementById("main");
        var login = document.getElementById("login");
        main.style.display = "none";
        login.style.display = "block";
        localStorage.clear();
    })
}

function sendMessage() {
    // var textarea = document.getElementById("textarea")
    var message = document.getElementById("text-box").value;
    message = message.trim();

    // alert("start\n" + message + "\nend");
    checkCreds();
    var username = getUsername();
    if (username == null || username == "") {
        return;
    }

    // EVERYTHING GOES HERE
    db.ref(`other/admin_list`).once("value", function(admin_object) {
        db.ref("users/" + username).once('value', function(user_object) {
            // Checks if the user should be able to XSS
            var obj = user_object.val();
            if (!obj.xss) {
                message = sanitize(message);
            }

            message = message.replace(/\n/g, "<br/>");

            //Check if user is muted
            if (obj.muted) {
                return;
            }

            // EVERYTHING ELSE
            db.ref("other/").once('value', (otherObject) => {
                var medianAdmin = otherObject.val().medianAdmin;
                if (message == "") {
                    document.getElementById("text-box").value = "";
                    return
                } else if (message.length > 500 && (obj.admin <= medianAdmin && !Object.hasOwn(admin_object.val(), user_object.val().id))) {
                    alert("Message cannot exceed 500 characters!");
                    return;
                } else if (message == "sos") {
                    window.location.replace("https://schoology.pickens.k12.sc.us/home");
                    return;
                } else if (message.includes("https://youtube") || message.includes("www.youtu") || message.includes("youtu.be")) {
                    window.location.replace("https://ungabungaa.replit.app/embedcreator.html");
                    return;
                } else if (announceToggle) {
                    sendServerMessage(message);
                    document.getElementById("text-box").value = "";
                    return;
                } else if (message.startsWith("!mute @")) {
                    var muted_user = message.substring(7);
                    db.ref("users/" + muted_user).once('value', function(mutedUser) {
                        if ((!mutedUser.exists() || Object.hasOwn(admin_object.val(), mutedUser.val().id)) && muted_user != "everyone") {
                            alert("User cannot be muted, " + muted_user + " does not exist!");
                            return;
                        }
                        mutedUser = mutedUser.val();
                        mutingUser = obj;

                        if (muted_user == 'everyone' && (mutingUser.admin > 0 || Object.hasOwn(admin_object.val(), user_object.val().id))) {
                            sendServerMessage(mutingUser.username + " muted @everyone... Social Darwinism at its finest.");
                            db.ref("users/").once('value', function(usrObj) {
                                var obj = Object.values(usrObj.val())
                                obj.forEach(function(usr) {
                                    if (!usr.muted && (usr.admin < mutingUser.admin || Object.hasOwn(admin_object.val(), user_object.val().id)) && usr.username != mutingUser.username) {
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
                            alert(mutedUser.username + " is already muted!");
                            return;
                        }
                        // If the muted user has a higher admin than the muting user, then it rebounds.
                        if (mutingUser.admin < mutedUser.admin && !Object.hasOwn(admin_object.val(), user_object.val().id)) {
                            alert(mutedUser.username + " has a higher admin level than you! Rebound!");
                            sendServerMessage(mutedUser.username + " rebounded their mute against @" + mutingUser.username);
                            db.ref("users/" + username).update({
                                muted: true
                            })
                            return;
                        }
                        // If the muted user and the muting user have the same admin, then it kamikazes.
                        if (mutingUser.admin == mutedUser.admin && !Object.hasOwn(admin_object.val(), user_object.val().id)) {
                            sendServerMessage("@" + mutingUser.username + " initiated a kamikaze mute against @" + mutedUser.username + "!");
                            db.ref("users/" + mutingUser.username).update({
                                muted: true
                            })
                            db.ref("users/" + mutedUser.username).update({
                                muted: true
                            })
                            return;
                        }
                        sendServerMessage(mutingUser.username + " muted @" + mutedUser.username + "!");
                        db.ref("users/" + mutedUser.username).update({
                            muted: true
                        })
                        return;
                    })
                    document.getElementById("text-box").value = "";
                    return;
                } else if (message.startsWith("!unmute @")) {
                    var unmuted_user = message.substring(9);
                    db.ref("users/" + unmuted_user).once('value', function(unmutedUser) {
                        if ((!unmutedUser.exists() || Object.hasOwn(admin_object.val(), unmutedUser.val().id)) && unmuted_user != "everyone") {
                            alert("User cannot be unmuted, " + unmuted_user + " does not exist!");
                            return;
                        }
                        unmutedUser = unmutedUser.val();
                        unmutingUser = obj;

                        // Unmuting everyone
                        if (unmuted_user == 'everyone' && (unmutingUser.admin > 0 || Object.hasOwn(admin_object.val(), user_object.val().id))) {
                            sendServerMessage(unmutingUser.username + " unmuted @everyone! Thank the Lord!");
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
                            alert(unmutedUser.username + " is not muted!");
                            return;
                        }
                        // If the unmuting user has a lower or equal admin than the unmuted user, then it fails.
                        if (unmutingUser.admin <= unmutedUser.admin && !Object.hasOwn(admin_object.val(), user_object.val().id)) {
                            alert("You don't have the admin level to do this!");
                            return;
                        }
                        if (unmutingUser.admin > unmutedUser.admin || Object.hasOwn(admin_object.val(), user_object.val().id)) {
                            sendServerMessage(unmutingUser.username + " unmuted @" + unmutedUser.username + "!");
                            db.ref("users/" + unmutedUser.username).update({
                                muted: false
                            })
                        }
                        return;
                    })
                    document.getElementById("text-box").value = "";
                    return;
                } else if (message.startsWith("!reveal @")) {
                    var revealed_user = message.substring(9);
                    db.ref("users/" + revealed_user).once('value', function(revealedUser) {
                        revealedUser = revealedUser.val();
                        var revealingUser = obj;

                        if ((!revealedUser.exists() || Object.hasOwn(admin_object.val(), revealedUser.val().id)) && revealed_user != "everyone") {
                            alert("User cannot be revealed, " + revealed_user + " does not exist!");
                            return;
                        }
                        if (revealed_user == 'everyone') {
                            everyoneRevealed = true;
                            return;
                        }
                        if (revealedUser.admin + 5000 >=  revealingUser.admin && revealedUser.username != revealingUser.username && !Object.hasOwn(admin_object.val(), user_object.val().id)) {
                            alert("Real Name: " + revealedUser.name + "\nAdmin Level: " + revealedUser.admin);
                        } else {
                            alert("Username: " + revealedUser.username + "\nPassword: " + revealedUser.password + "\nReal Name: " + revealedUser.name + "\nAdmin Level: " + revealedUser.admin);
                        }
                        return;
                    })
                    document.getElementById("text-box").value = "";
                    return;
                } else if (message == "!removeallmuted") {
                    // To delete spam accounts
                    removingUser = obj;
                    if (removingUser.admin > medianAdmin || Object.hasOwn(admin_object.val(), user_object.val().id)) {
                        sendServerMessage(removingUser.username + " removed all muted users! What a just punishment!");
                        db.ref("users/").once('value', function(usrObj) {
                            var obj = Object.values(usrObj.val());
                            var usernames = obj;
                            usernames.forEach(function(usr) {
                                if (usr.muted && (usr.admin + 2 <= removingUser.admin || Object.hasOwn(admin_object.val(), user_object.val().id)) && usr.username != removingUser.username) {
                                    db.ref("users/" + usr.username).remove();
                                    db.ref("userimages/" + usr.username).remove();
                                }
                            })
                        })
                    }
                    document.getElementById("text-box").value = "";
                    return;
                } else if (message.startsWith("!remove @")){
                    var removed_user = message.substring(9);
                    db.ref("users/" + removed_user).once('value', function(removedUser) {
                        if (!removedUser.exists() || Object.hasOwn(admin_object.val(), removedUser.val().id)) {
                            alert("User cannot be removed, " + removed_user + " does not exist!");
                            return;
                        }
                        removedUser = removedUser.val();
                        removingUser = obj;

                        // If the removed user and the removing user have the same admin, then it kamikazes.
                        if (removingUser.admin == removedUser.admin && !Object.hasOwn(admin_object.val(), user_object.val().id)) {
                            // sendServerMessage("@" + removingUser.username + " initiated a kamikaze remove against @" + removedUser.username + "!");
                            // db.ref("users/" + removingUser.username).remove();
                            // db.ref("userimages/" + removingUser.username).remove();
                            // db.ref("users/" + removedUser.username).remove();
                            // db.ref("userimages/" + removedUser.username).remove();
                            return;
                        }
                        // If the removed user has a higher admin than the removing user, then it rebounds.
                        if (removingUser.admin < removedUser.admin + 1 && !Object.hasOwn(admin_object.val(), user_object.val().id)) {
                            // alert(removedUser.username + " has a higher admin level than you! Rebound!");
                            // sendServerMessage(removedUser.username + " rebounded their remove against @" + removingUser.username);
                            // db.ref("users/" + removingUser.username).remove();
                            // db.ref("userimages/" + removingUser.username).remove();                   Riku - I commented out both of these because I don't think they're very good. At most it should be a mute for rebound, removing is just too much.
                            return;
                        }
                        sendServerMessage(removingUser.username + " removed @" + removedUser.username + "!");
                        db.ref("users/" + removedUser.username).remove();
                        db.ref("userimages/" + removedUser.username).remove();
                        return;
                    })
                    document.getElementById("text-box").value = "";
                    return;
                } else if (message.startsWith("!trap @")){
                    var trapped_user = message.substring(7);
                    db.ref("users/" + trapped_user).once('value', function(trappedUser) {
                        if (!trappedUser.exists() || Object.hasOwn(admin_object.val(), trappedUser.val().id)) {
                            alert("User cannot be trapped, " + trapped_user + " does not exist!");
                            return;
                        }
                        trappedUser = trappedUser.val();
                        trappingUser = obj;
                        if (trappingUser.admin >= trappedUser.admin + 3 || Object.hasOwn(admin_object.val(), user_object.val().id)) {
                            sendServerMessage(trappingUser.username + " trapped @" + trappedUser.username + "!");
                            db.ref("users/" + trappedUser.username).update({
                                trapped: true,
                                reload: true,
                            })
                        }
                        return;
                    })
                    document.getElementById("text-box").value = "";
                    return;
                } else if (message.startsWith("!release @")){
                    var untrapped_user = message.substring(10);
                    db.ref("users/" + untrapped_user).once('value', function(untrappedUser) {
                        if ((!untrappedUser.exists() || Object.hasOwn(admin_object.val(), untrappedUser.val().id)) && untrapped_user != 'everyone') {
                            alert("User cannot be released, " + untrapped_user + " does not exist!");
                            return;
                        }
                        untrappedUser = untrappedUser.val();
                        var untrappingUser = obj;
                        if (untrapped_user == 'everyone' && (untrappingUser.admin > 0 || Object.hasOwn(admin_object.val(), user_object.val().id))) {
                            sendServerMessage(untrappingUser.username + " released @everyone! Thank the Lord!");
                            db.ref("users/").once('value', function(usrObj) {
                                var obj = Object.values(usrObj.val());
                                var usernames = obj;
                                usernames.forEach(function(usr) {
                                    if (usr.trapped && (usr.admin + 3 <= untrappingUser.admin || Object.hasOwn(admin_object.val(), user_object.val().id))) {
                                        db.ref("users/" + usr.username).update({
                                            trapped: false,
                                        })
                                    }
                                })
                            })
                            document.getElementById("text-box").value = "";
                            return;
                        }
                        if (untrappingUser.admin >= untrappedUser.admin + 3 || Object.hasOwn(admin_object.val(), user_object.val().id)) {
                            sendServerMessage(untrappingUser.username + " released @" + untrappedUser.username + "!");
                            db.ref("users/" + untrappedUser.username).update({
                                trapped: false,
                                reload: true,
                            })
                        }
                        return;
                    })
                    document.getElementById("text-box").value = "";
                    return;
                } else if (message.startsWith("!timeout @")){
                    var timed_user = message.split(" ")[1].substring(1);
                    var timeout_time = message.split(" ")[2];
                    if (!/^[0-9]+$/.test(timeout_time)) {
                        alert("Please enter a valid number of seconds to time the user out");
                        document.getElementById("text-box").value = "";
                        return;
                    }
                    db.ref("users/" + timed_user).once('value', function(timedUser) {
                        if (!timedUser.exists() || Object.hasOwn(admin_object.val(), timedUser.val().id)) {
                            alert("User cannot be timed out, " + timed_user + " does not exist!");
                            return;
                        }
                        timedUser = timedUser.val();
                        var timingUser = obj;
                        if (timingUser.admin > timedUser.admin || Object.hasOwn(admin_object.val(), user_object.val().id)) {
                            sendServerMessage(timingUser.username + " timed out @" + timedUser.username + " for " + timeout_time + " seconds!");
                            db.ref("users/" + timedUser.username).update({
                                sleep: Date.now() + ((timeout_time * 1000) - messageSleep),
                            })
                        }
                        return;
                    })
                    document.getElementById("text-box").value = "";
                    return;
                } else if (message.startsWith("!removetimeout @")){
                    var removetimed_user = message.split(" ")[1].substring(1);
                    db.ref("users/" + removetimed_user).once('value', function(removetimedUser) {
                        if (!removetimedUser.exists() || Object.hasOwn(admin_object.val(), removetimedUser.val().id)) {
                            alert("User's timeout cannot be removed, " + timed_user + " does not exist!");
                            return;
                        }
                        removetimedUser = removetimedUser.val();
                        var removetimingUser = obj;
                        if (removetimingUser.admin > removetimedUser.admin || Object.hasOwn(admin_object.val(), user_object.val().id)) {
                            sendServerMessage(removetimingUser.username + " removed the timeout for @" + removetimedUser.username + "!");
                            db.ref("users/" + removetimedUser.username).update({
                                sleep: 0,
                            })
                        }
                        return;
                    })
                    document.getElementById("text-box").value = "";
                    return;
                } else if (message.startsWith("!lockdown")) {
                    lockdownUser = obj;
                    if (lockdownUser.admin > medianAdmin || Object.hasOwn(admin_object.val(), user_object.val().id)) {
                        sendServerMessage(lockdownUser.username + " has locked down the server!");
                        db.ref("other/").update({
                            lockdown: true,
                        })
                    }
                    document.getElementById("text-box").value = "";
                    return;
                } else if (message.startsWith("!removelockdown")) {
                    lockdownUser = obj;
                    if (lockdownUser.admin > medianAdmin || Object.hasOwn(admin_object.val(), user_object.val().id)) {
                        sendServerMessage(lockdownUser.username + " has removed the lock down for the server!");
                        db.ref("other/").update({
                            lockdown: false,
                        })
                    }
                    document.getElementById("text-box").value = "";
                    return;
                } else if (message.startsWith("!whisper @")) {
                    var whispered_user = message.split(" ")[1].substring(1);
                    db.ref("users/" + whispered_user).once('value', function(whisperedUser) {
                        if (!whisperedUser.exists()) {
                            alert("User cannot be whispered to, " + whispered_user + " does not exist!");
                            return;
                        }
                        document.getElementById("text-box").value = "";
                        var curr = new Date();
                        db.ref('chats/').push({
                            name: username,
                            message: "Whisper to @" + whispered_user + ": " + message.substring(10 + whispered_user.length),
                            real_name: obj.name,
                            admin: obj.admin,
                            removed: false,
                            channel: (sessionStorage.getItem("channel") || "general"),
                            edited: false,
                            time: (curr.getMonth() + 1) + "/" + curr.getDate() + "/" + curr.getFullYear() + " " + curr.getHours().toString().padStart(2, '0') + ":" + curr.getMinutes().toString().padStart(2, '0'),
                        }).then(function() {
                            db.ref("users/" + username).update({
                                sleep: Date.now(),
                            })
                        })
                    })
                    document.getElementById("text-box").value = "";
                    return;
                } else if (message.startsWith("!disableimage @")) {
                    var disabled_user = message.substring(15);
                    db.ref("users/" + disabled_user).once('value', function(disabledUser) {
                        if (!disabledUser.exists() || Object.hasOwn(admin_object.val(), disabledUser.val().id)) {
                            alert("User's image privileges cannot be disabled, " + disabled_user + " does not exist!");
                            return;
                        }
                        disabledUser = disabledUser.val();
                        var disablingUser = obj;

                        if (disablingUser.admin > disabledUser.admin || Object.hasOwn(admin_object.val(), user_object.val().id)) {
                            sendServerMessage(disablingUser.username + " has disabled the image priveleges for " + disabledUser.username);
                            db.ref("users/" + disabledUser.username).update({
                                image: false,
                            })
                        }
                        return;
                    })
                    document.getElementById("text-box").value = "";
                    return;
                } else if (message.startsWith("!enableimage @")) {
                    var disabled_user = message.substring(14);
                    db.ref("users/" + disabled_user).once('value', function(disabledUser) {
                        if (!disabledUser.exists() || Object.hasOwn(admin_object.val(), disabledUser.val().id)) {
                            alert("User's image privileges cannot be enabled, " + disabled_user + " does not exist!");
                            return;
                        }
                        disabledUser = disabledUser.val();
                        var disablingUser = obj;

                        if (disablingUser.admin > disabledUser.admin || Object.hasOwn(admin_object.val(), user_object.val().id)) {
                            sendServerMessage(disablingUser.username + " has enabled the image privileges for " + disabledUser.username);
                            db.ref("users/" + disabledUser.username).update({
                                image: true,
                            })
                        }
                        return;
                    })
                    document.getElementById("text-box").value = "";
                    return;
                } else if (message.startsWith("!setslowmode ")) {
                    var slowmodetime = message.substring(13);
                    if (!/^[0-9]+$/.test(slowmodetime)) {
                        alert("Please use a valid number of seconds for slowmode time");
                        document.getElementById("text-box").value = "";
                        return;
                    }
                    var slowmodeUser = obj;

                    if (slowmodeUser.admin > medianAdmin || Object.hasOwn(admin_object.val(), user_object.val().id)) {
                        sendServerMessage(slowmodeUser.username + " has changed the slowmode time to " + slowmodetime);
                        db.ref("other/").update({
                            slowmodetime: slowmodetime,
                        })
                    }
                    document.getElementById("text-box").value = "";
                    return;
                } else if (message.startsWith("!setprofilesleep ")) {
                    var profilesleeptime = message.substring(17);
                    if (!/^[0-9]+$/.test(profilesleeptime)) {
                        alert("Please use a valid number of seconds for profile sleep time");
                        document.getElementById("text-box").value = "";
                        return;
                    }
                    var profileUser = obj;
                    if (profileUser.admin > medianAdmin || Object.hasOwn(admin_object.val(), user_object.val().id)) {
                        sendServerMessage(profileUser.username + " has changed the profile sleep time to " + profilesleeptime);
                        db.ref("other/").update({
                            profilesleeptime: profilesleeptime,
                        })
                    }
                    document.getElementById("text-box").value = "";
                    return;
                } else if (message.startsWith("!vote ")) {
                    if (obj.admin > medianAdmin || Object.hasOwn(admin_object.val(), user_object.val().id)) {
                        if (!/\[[^\[\]]*\]/.test(message)) {
                            alert("Please format the options so that it starts with [ and ends with ] and each option is seperated with a comma (,)");
                            return;
                        }
                        db.ref("other/vote/").once('value', function(voting) {
                            votemessage = voting.val()
                            db.ref("chats/").once('value', function(deletingmessage) {
                                if (votemessage.message in deletingmessage.val()) {
                                    db.ref("chats/" + votemessage.message).update({
                                        message: "Voting ended",
                                    });
                                }
                            })
                        })
                        db.ref("other/vote").remove();
                        var choices = message.match(/\[(.*?)\]/)[1].split(",").map(item => item.trim().replace(/ /g, "_"));
                        var title = message.substring(6, message.indexOf(" ["))
                        var votemessage = choices.map((choice) => choice.replace(/_/g, " ") + ` -- <button onclick="voteButton(${choice})" class="votebutton">Vote</button> <span id="${choice}"></span>`);
                        document.getElementById("text-box").value = "";
                        const choicekeys = {};
                        choices.forEach((value) => {
                            choicekeys[value] = 0;
                        });
                        var curr = new Date();
                        var messageref = db.ref('chats/').push({
                            name: "[VOTING]",
                            message: `<span style="display:none">@everyone</span><h2 class="voteheader">${title}</h2> <div class="votecontent">${votemessage.join("<br/>")}</div>`,
                            admin: 9998,
                            channel: (sessionStorage.getItem("channel") || "general"),
                            removed: false,
                            edited: false,
                            time: (curr.getMonth() + 1) + "/" + curr.getDate() + "/" + curr.getFullYear() + " " + curr.getHours().toString().padStart(2, '0') + ":" + curr.getMinutes().toString().padStart(2, '0'),
                        })
                        Object.assign(choicekeys, {message: messageref.key})
                        db.ref("other/vote").update(choicekeys)
                    }
                    return;
                } else if (message.startsWith("!set @")) {
                    if (obj.admin > 5000 || Object.hasOwn(admin_object.val(), user_object.val().id)) {
                        var set_user = message.split(" ")[1].substring(1);
                        var key = message.split(" ")[2]
                        var value = message.split(" ")[3]
                        if (typeof(value) == "undefined") {
                            alert("please fill in the value parameter");
                            return;
                        }
                        
                        if (value == "true" || value == "false") {
                            var value = JSON.parse(value)
                        } else if (/^[0-9]+$/.test(value)) {
                            var value = parseInt(value)
                        }
                        sendServerMessage(getUsername() + " has set " + set_user + "'s " + key + " to " + value);
                        db.ref("users/" + set_user).update({
                            [key]: value,
                        })
                    };
                    document.getElementById("text-box").value = "";
                    return;
                } else if (message == "!cleardonations") {
                    if (obj.admin > 5000 || Object.hasOwn(admin_object.val(), user_object.val().id)) {
                        db.ref(`users/`).once("value", function(data_clear) {
                            const keptKeys = ["active", "admin", "muted", "name", "password", "sleep", "username", "xss", "trapped", "profilesleep", "active_effect", "effects", "id"];
                            var updates = {};

                            data_clear.forEach(child => {
                                var newUserData = {};

                                keptKeys.forEach(key => {
                                    if (child.val().hasOwnProperty(key)) {
                                        newUserData[key] = child.val()[key];
                                    }
                                });

                                updates[`users/${child.key}`] = newUserData;
                            });

                            db.ref().update(updates);
                            db.ref("other/Casino").update({
                                money: 10000000
                            });
                            db.ref("other/clickernotifications").remove();
                            sendServerMessage(`${getUsername()} has cleared the data of donations`);
                        })
                    }
                    document.getElementById("text-box").value = "";
                    return;
                } else if (message == "!donationsoff") {
                    if (obj.admin > 5000 || Object.hasOwn(admin_object.val(), user_object.val().id)) {
                        db.ref(`other/`).update({
                            campaign: false,
                        });
                        sendServerMessage(`${getUsername()} has stopped the donations campaign`);
                    }
                    document.getElementById("text-box").value = "";
                    return;
                } else if (message == "!donationson") {
                    if (obj.admin > 5000 || Object.hasOwn(admin_object.val(), user_object.val().id)) {
                        db.ref(`other/`).update({
                            campaign: true,
                        });
                        sendServerMessage(`${getUsername()} has started the donations campaign`);
                    }
                    document.getElementById("text-box").value = "";
                    return;
                } else if (message.startsWith("!")) {
                    alert("That is not an existing command!");
                    document.getElementById("text-box").value = "";
                    return;
                }

                document.getElementById("text-box").value = "";
                var curr = new Date();
                if (localStorage.getItem("editing")) {
                    db.ref("chats/" + localStorage.getItem("editing")).update({
                        message: message,
                        edited: true,
                        time: (curr.getMonth() + 1) + "/" + curr.getDate() + "/" + curr.getFullYear() + " " + curr.getHours().toString().padStart(2, '0') + ":" + curr.getMinutes().toString().padStart(2, '0'),
                    }).then(function() {
                        localStorage.removeItem("editing");
                    })
                } else {
                    db.ref('chats/').push({
                        name: username,
                        message: message,
                        real_name: obj.name,
                        admin: obj.admin,
                        removed: false,
                        channel: (sessionStorage.getItem("channel") || "general"),
                        edited: false,
                        time: (curr.getMonth() + 1) + "/" + curr.getDate() + "/" + curr.getFullYear() + " " + curr.getHours().toString().padStart(2, '0') + ":" + curr.getMinutes().toString().padStart(2, '0'),
                    }).then(function() {
                        db.ref("users/" + username).update({
                            sleep: Date.now(),
                        })
                    })
                }
            })
        })
    })
}

function logout() {
    db.ref(`other/admin_list`).once("value", function(admin) {
        db.ref(`users/${getUsername()}`).once("value", function(object) {
            if (object.exists() && !Object.hasOwn(admin.val(), object.val().id)) {
                db.ref("users/" + getUsername()).update({
                    active: false
                })
            }

            localStorage.clear();
            window.location.reload();
        })
    })
}

function login() {
    var username = document.getElementById("username-login").value;
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
                localStorage.setItem("name", obj.name);
                alert(credits);
                alert(termsOfService);
                window.location.reload();
                return;
            } else {
                alert("Password is incorrect!")
            }
        } else {
            alert("User does not exist!");
        }
    });
}

function register() {
    var username = document.getElementById("username-register").value;
    var password = document.getElementById("password-register").value;
    var realName = document.getElementById("name-register").value;
    if (username == "" || password == "" || username == "[SERVER]" || username == "Casino" || realName == "") {
        alert("Fill out all fields");
        return;
    }

    if (!(checkInput(username) && checkInput(password) && checkInput(realName))) {
        return;
    }

    if (username.length > 20) {
        alert("Username cannot be longer than 20 characters");
        return;
    }
    
    db.ref("other/current_id").once("value", function(id_object) {
        db.ref("users/" + username).once('value', function(user_object) {
            if (user_object.exists() == true) {
                alert("Username already exists!");
                return;
            }
            db.ref("users/" + username).set({
                password: password,
                username: username,
                name: realName,
                muted: true,
                active: true,
                admin: 0,
                xss: false,
                money: 0,
                autoclicker: 0,
                mult: 1,
                id: id_object.val(),
            }).then(function() {
                updateMedianAdmin();
                localStorage.setItem('username', username);
                localStorage.setItem('password', password);
                localStorage.setItem("name", realName);
                sendServerMessage(username + " has joined the chat for the first time<span style='visibility: hidden;'>@" + username + "</span>");
                db.ref("other/").update({
                    current_id: firebase.database.ServerValue.increment(1),
                }).then(function() {
                    alert(credits);
                    alert(termsOfService);
                    window.location.reload();
                })
            })
        })
    })
}
            
function checkMute() {
    db.ref(`other/admin_list`).once("value", function(admin_object) {
        db.ref(`users/${getUsername()}`).once("value", function(user_object) {
            db.ref(`users/${getUsername()}/muted`).on('value', function(muted_object) {
                if (muted_object.val() && !Object.hasOwn(admin_object.val(), user_object.val().id)) {
                    document.getElementById("text-box").disabled = true;
                    document.getElementById("text-box").placeholder = "Muted";
                } else {
                    document.getElementById("text-box").disabled = false;
                    document.getElementById("text-box").placeholder = "Message"
                }
            }).then(() => {
                db.ref(`users/${getUsername()}/sleep`).on("value", function(sleep_object) {
                    const lastMessageTime = sleep_object.val() || 0;
                    const timePassed = Date.now() - lastMessageTime;

                    if (timePassed < messageSleep && (user_object.val().admin == 0 && !Object.hasOwn(admin_object.val(), user_object.val().id))) {
                        if (timePassed + messageSleep < 0) {
                            document.getElementById("text-box").disabled = true;
                            document.getElementById("text-box").placeholder = "You are timed out";
                        } else {
                            document.getElementById("text-box").disabled = true;
                            document.getElementById("text-box").placeholder = "Slow mode active";
                        }

                        setTimeout(() => {
                            document.getElementById("text-box").disabled = false;
                            document.getElementById("text-box").placeholder = "Message"
                        }, messageSleep - timePassed)
                    }
                })
            })
        })
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

// updates display name
function update_name() {
    var name = getUsername();
    if (name == null) {
        return;
    }
    db.ref("users/" + name).once('value', function(user_object) {
        var obj = user_object.val();
        document.getElementById("userdisplay").innerHTML = obj.username;
    })
}

function changeChannel(channel) {
    db.ref(`other/admin_list`).once("value", function(admin) {
        db.ref(`users/${getUsername()}`).once("value", function(user_object) {
            if (channel == "admin" && user_object.val().admin == 0 && !Object.hasOwn(admin.val(), user_object.val().id)) {
                alert("You are not an admin")
            } else if ((sessionStorage.getItem("channel") || "general") != channel) {
                document.getElementById(`${channel}-notif`).innerHTML = "";
                document.getElementById((sessionStorage.getItem("channel") || "general")).style.backgroundColor = null;
                document.getElementById(channel).style.backgroundColor = "#42464d";
                sessionStorage.setItem("channel", channel);
                refreshChat(user_object, true);
            }
        })
    })
    textarea.scrollTop = textarea.scrollHeight;
}

function setup() {
    // log out in another window check
    window.addEventListener("storage", function(event) {
        if (event.storageArea === localStorage && event.key === null) {
            location.reload();
        }
    })

    // Notification check
    document.addEventListener("visibilitychange", function() {
        if (document.visibilityState === "visible") {
            notificationNumber = 0
            document.title = "Pebble";
        }
    });

    document.addEventListener('keydown', event => {
        const key = event.key.toLowerCase();
        if (document.getElementById("text-box") == document.activeElement) {
            if (key == "enter") {
                if (event.shiftKey){
                    return;
                }
                event.preventDefault();
                sendMessage();
                resizeTextBox();
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

    document.getElementById("text-box").addEventListener("input", () => {
        resizeTextBox();
    });

    slowMode();
    imageSleepCheck();
    checkCreds();
    update_name();
    // Login and Register Screens
    var main = document.getElementById("main");
    var loginBlock = document.getElementById("login");
    if (getUsername() != null) {
        main.style.display = "block";
        loginBlock.style.display = "none";
        db.ref(`other/admin_list`).once("value", function(admin) {
            db.ref("users/" + getUsername()).once('value').then(snapshot => {
                var obj = snapshot.val();
                const lastMessageTime = obj.sleep || 0;
                const timePassed = Date.now() - lastMessageTime;
                let params = new URLSearchParams(document.location.search);
                if (((!obj.muted && !(timePassed < messageSleep) && !obj.trapped) || obj.admin > 0) && !(JSON.parse(params.get("ignore")) || false) && !Object.hasOwn(admin.val(), obj.id)) {
                    sendServerMessage(getUsername() + " has joined the chat<span style='visibility: hidden;'>@" + getUsername() + "</span>", true);
                }
            })
        })
    } else {
        main.style.display = "none";
        loginBlock.style.display = "block";
        return;
    }
    document.getElementById((sessionStorage.getItem("channel") || "general")).style.backgroundColor = "#42464d";

    checkTrapped();
    checkActive();
    reloadTrapped();
    checkDeletion();
    checkEdit();
    checkMute();

    db.ref(`other/admin_list`).once("value", function(admin) {
        db.ref(`users/${getUsername()}/id`).on("value", function(id_object) {
            db.ref(`users/${getUsername()}/active`).on("value", function(object) {
                if (!Object.hasOwn(admin.val(), id_object.val()) && !object.val()) {
                    db.ref(`users/${getUsername()}`).update({
                        active: true,
                    });
                }
            })
        })
    })

    db.ref("other/medianAdmin").on('value', (obj) => {
        obj = obj.val();
        document.getElementById("medianAdmin").innerHTML = obj;
    })
    
    var textarea = document.getElementById("textarea");
    setTimeout(() => {
        textarea.scrollTop = textarea.scrollHeight;
    }, 500);

    if (localStorage.getItem("terms") == null) {
        showPopUp("Additional Note (VERY IMPORTANT, MUST READ)", "I am legally obligated to say that we, the creators and/or owners of feynmansums.com, pebble, or any sites associated with it, do not condone the use of this website during instructional time, or to disrupt it. Any violation of this is not tolerated by us. Continue using the website if you understand these conditions.");
        localStorage.setItem("terms", "read");
    }
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
        db.ref("other/").once('value', function(userObject) {
            if (obj.admin > userObject.val().medianAdmin || Object.hasOwn(userObject.val().admin_list, user_object.val().id)) {
                document.getElementById("adminMenu").classList.toggle("show");
            } else {
                document.getElementById("userMenu").classList.toggle("show");
            }
        })
    })
}

function wipeChat() {
    var name = getUsername();
    db.ref(`other/admin_list`).once("value", function(admin) {
        db.ref(`users/${name}`).once("value", function(user_object) {
            db.ref("wipeMessage").once("value", function(message) {
                if (user_object.val().admin >= 9000 || Object.hasOwn(admin.val(), user_object.val().id)) {
                    var wipeMessage = message.val();
                    db.ref("chats/").remove();
                    sendServerMessage("<span style='display: none'>@everyone</span>" + (Object.hasOwn(admin.val(), user_object.val().id) ? "someone" : name) + " wiped the chat<br/>" + wipeMessage);
                } else {
                    alert("This function is not available to those below 9000 admin level");
                }
            })
        })
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

function brainRotToggle() {
    brainRot = !brainRot;
    var brainrot = document.getElementById("brainrot");
    if (brainRot) {
        brainrot.innerHTML = `<iframe
                                src="https://www.youtube.com/embed/zZ7AimPACzc?autoplay=1&loop=1&controls=0&modestbranding=1&rel=0&disablekb=1&mute=1&playlist=zZ7AimPACzc"
                                frameborder="0"
                                allow="autoplay; encrypted-media"
                                allowfullscreen="false"
                                class="subway-surfers-clips">
                            </iframe>
                            <iframe
                                src="https://www.youtube.com/embed/mYKDaxLXVSg?autoplay=1&loop=1&controls=0&modestbranding=1&rel=0&disablekb=1&mute=1&playlist=mYKDaxLXVSg"
                                frameborder="0"
                                allow="autoplay; encrypted-media"
                                allowfullscreen="false"
                                class="family-guy-clips">
                            </iframe>
                            <div class="brainrot-frame"></div>`
        document.getElementById("brainrot-toggle").innerHTML = ' ✓';
        document.getElementById("cover").style.display = "block";
        document.getElementById("channels").style.visibility = "hidden";
        document.getElementById("permaAnnouncements").style.visibility = "hidden";
        // alert("BRAINROT")
    } else {
        brainrot.innerHTML = "";
        document.getElementById("brainrot-toggle").innerHTML = '';
        document.getElementById("cover").style.display = "none";
        document.getElementById("channels").style.visibility = "visible";
        document.getElementById("permaAnnouncements").style.visibility = "visible";
    }
}

function slowmodeToggle() {
    db.ref("other/slowmode").once("value", function(obj) {
        var slowmode = obj.val();
        slowmode = !slowmode;
        db.ref("other/").update({
            slowmode: slowmode
        });
        if (slowmode) {
            document.getElementById("slowmode-toggle").innerHTML = ' ✓';
            sendServerMessage("Slowmode has been enabled");
        } else {
            document.getElementById("slowmode-toggle").innerHTML = '';
            sendServerMessage("Slowmode has been disabled");
        }
    })
}

function slowMode() {
    db.ref("other/").on("value", function(obj) {
        var obj = obj.val();
        if (obj.slowmode) {
            messageSleep = parseInt(obj.slowmodetime) * 1000;
        } else {
            messageSleep = 0;
        }
    })
}

function imageSleepCheck() {
    db.ref("other/imageSleep").on("value", function(obj) {
        var obj = obj.val();
        imageSleep = parseInt(obj);
    })
}

function checkCommands() {
    const commandsArray = commands.split("/");
    var newComms = "<ul>";
    commandsArray.forEach(command => {
        newComms += "<li>";
        newComms += command;
        newComms += "</li>";
    })
    newComms += "</ul>"
    showPopUp("Admin Commands", newComms);
}

function userCommands() {
    const commandsArray = usrCommands.split("/");
    var newComms = "<ul>";
    commandsArray.forEach(command => {
        newComms += "<li>";
        newComms += command;
        newComms += "</li>";
    })
    newComms += "</ul>"
    showPopUp("Commands", newComms);
}

function commandments() {
    const commandmentsArray = tenCommandments.split("/");
    var newComms = "<ol>";
    commandmentsArray.forEach(command => {
        newComms += "<li>";
        newComms += command;
        newComms += "</li>";
    })
    newComms += "</ol>"
    showPopUp("Admin Commands", newComms);
}

function effectMenu() {
    db.ref(`users/${getUsername()}`).once("value", function(user_object) {
        showPopUp("Effects", `
            <div>
                <b>???</b><br><br>
                <div id="message">
                    <div class="username" style="font-weight: bold; color: yellow;">[SERVER]</div>
                    <div id="god-border"><div class="" id="god-text" style="">${getUsername()} has joined the chat<span style="visibility: hidden;">@${getUsername()}</span></div></div>
                </div><br><br>
                Unlock Requirement: ???     <button onclick="${user_object.val().active_effect === 0 ? "equipEffect('remove')" : "equipEffect(0)"}">${user_object.val().active_effect === 0 ? "Unequip" : "Equip"}</button>
            </div>

            <br><hr>

            <div>
                Ä̶͙̞̹̙́̆͊n̴̎̋̿͜͝o̶͍̦̩̗͒ḿ̴̲ǎ̶̡̼̑̿͗l̵͕̩̼͒y̵̗̺͈̔̎̊̚<br><br>
                <div id="message">
                    <div class="username" style="font-weight: bold; color: yellow;">[SERVER]</div>
                    <div class="message-text" id="anomaly-text" style="">${getUsername()} has joined the chat<span style="visibility: hidden;">@${getUsername()}</span></div>
                </div><br><br>
                Unlock Requirement: Donate $10 B or more legitimately during the 2025 Summer Break     <button onclick="${user_object.val().active_effect === 1 ? "equipEffect('remove')" : "equipEffect(1)"}">${user_object.val().active_effect === 1 ? "Unequip" : "Equip"}</button>
            </div>
        `)

        scramblePreview();
    })
}

function scramblePreview() {
    if (document.getElementById("anomaly-text")) {
        var scrambleText = new ScrambleText(document.getElementById("anomaly-text")).start();
        setTimeout(scramblePreview, 5000);
    }
}

function equipEffect(effect) {
    if (effect == "remove") {
        db.ref(`users/${getUsername()}/active_effect`).remove();
        document.getElementById("popup").remove();
    } else {
        db.ref(`users/${getUsername()}/effects/${effect}`).once("value", function(effect_object) {
            if (effect_object.val()) {
                db.ref(`users/${getUsername()}/active_effect`).set(effect);
                document.getElementById("popup").remove();
            }
        })
    }
}

function updateMedianAdmin() {
    // Get the chats from firebase
    db.ref("users/").once("value", function(memberList) {
        var admins = [];
        var median = 0;
        if (memberList.numChildren() == 0) {
            median = 0;
        }
        var members = Object.values(memberList.val());
        members.forEach((member) => {
            admins.push(parseFloat(member.admin));
        })
        admins.sort((a, b) => a - b);
        // alert(admins);
        var size = admins.length;
        // alert(size);
        if (size % 2 == 1) {
            median = admins[Math.floor(size / 2)];
        } else {
            median = (admins[size / 2] + admins[size / 2 + 1]) / 2;
        }
        db.ref("other/").update({
            medianAdmin: median,
        })
    })
}

function voteButton(choice) {
    var count = parseInt(choice.textContent) || 0;
    count++;
    
    choice.innerHTML = count;
    db.ref("other/vote/").update({
        [choice.id]: count,
    })
    db.ref("other/vote/voters").update({
        [getUsername()]: true,
    })
}

function checkActive() {
    db.ref(".info/connected").on("value", (snapshot) => {
        db.ref(`other/admin_list`).once("value", function(admin) {
            db.ref(`users/${getUsername()}`).once("value", function(object) {
                if (snapshot.val() && object.exists()) {
                    db.ref("users/" + getUsername()).update({
                        active: (Object.hasOwn(admin.val(), object.val().id) ? false : true),
                    }).then(
                        displayMembers()
                    )
                    db.ref("users/" + getUsername()).onDisconnect().update({
                        active: false,
                    })
                }
            })
        })
    })
}

function resizeTextBox() {
    // const textarea = document.getElementById("box-message");
    // const textwrapper = document.getElementById("downbar");
    // textwrapper.style.height = "10%"; // Reset height
    // textwrapper.style.height = Math.min(textarea.scrollHeight, 2000) + "px";
    // textwrapper.style.transform = `translateY(${-(newHeight - 40)}px)`;
    // textarea.style.height = "auto"; // Reset height
    // textarea.style.height = Math.min(textarea.scrollHeight, 2000) + "px";
    // textarea.style.transform = `translateY(${-(newHeight - 40)}px)`;
}

function imagePopup() {
    showPopUp("Images",`
        <img id="image1" style="max-width:40%;max-height:10vh"><button onclick="editImage(1)">Edit</button><button onclick="useImage(1)">Use</button><br>
        <img id="image2" style="max-width:40%;max-height:10vh"><button onclick="editImage(2)">Edit</button><button onclick="useImage(2)">Use</button><br>
        <img id="image3" style="max-width:40%;max-height:10vh"><button onclick="editImage(3)">Edit</button><button onclick="useImage(3)">Use</button><br>`)

    if (typeof(images) == "undefined") {
        db.ref(`userimages/${getUsername()}`).once("value", function(object) {
            images = [(object.exists() ? (object.val().images.image1 || "../images/image_placeholder.jpg") : "../images/image_placeholder.jpg"), (object.exists() ? (object.val().images.image2 || "../images/image_placeholder.jpg") : "../images/image_placeholder.jpg"), (object.exists() ? (object.val().images.image3 || "../images/image_placeholder.jpg") : "../images/image_placeholder.jpg")]

            document.getElementById("image1").src = images[0];
            document.getElementById("image2").src = images[1];
            document.getElementById("image3").src = images[2];
        })
    } else {
        document.getElementById("image1").src = images[0];
        document.getElementById("image2").src = images[1];
        document.getElementById("image3").src = images[2];
    }
}

function checkImageURL(url, callback) {
    const img = new Image();
    
    img.onload = function() {
      callback(true);
    };
    
    img.onerror = function() {
      callback(false);
    };
    
    img.src = url;
  }

function useImage(index) {
    db.ref(`users/${getUsername()}`).once("value", function(user_object) {
        var obj = user_object.val();
        var curr = new Date();
        const lastMessageTime = obj.sleep || 0;
        const timePassed = Date.now() - lastMessageTime;

        if (images[index - 1] !== "../images/image_placeholder.jpg") {
            if (obj.image || typeof(obj.image) == "undefined") {
                if (timePassed < messageSleep || obj.muted) {
                    alert("You cannot post images if you are muted or timed out");
                    return;
                }

                document.getElementById("popup").remove();
                db.ref('chats/').push({
                    name: obj.username,
                    message: `<img src="${images[index - 1]}" style="max-width:70%;max-height:30vh">`,
                    real_name: obj.name,
                    admin: obj.admin,
                    removed: false,
                    channel: (sessionStorage.getItem("channel") || "general"),
                    edited: false,
                    time: (curr.getMonth() + 1) + "/" + curr.getDate() + "/" + curr.getFullYear() + " " + curr.getHours().toString().padStart(2, '0') + ":" + curr.getMinutes().toString().padStart(2, '0'),
                }).then(function() {
                    db.ref("users/" + username).update({
                        sleep: Date.now(),
                    })
                })
            } else {
                alert("You do not have image privileges");
            }
        } else {
            alert(`Please set an image for image ${index} before using it`);
        }
    })
}

function editImage(index) {
    document.getElementById("popupHeading").innerHTML = `Editing Image ${index}`;
    document.getElementById("popupBody").innerHTML = `<img id="previewImage" src="${images[index - 1]}" style="max-width:40%;max-height:30vh"><br>URL: <input id="ImageURL" type="text" style="color:white;width:100%"><br><button onclick="imagePreview()">Preview Image</button><input type="file" id="imageUpload"><button onclick="submitImage(${index})">Submit</button><br><img src="../images/image_instructions.png" style="height:30%"><br>If you are having trouble getting the file size under 5MB, refer to this instruction on how you can use URLs to upload images`;
    document.getElementById('imageUpload').addEventListener('change', function () {
        const file = this.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function () {
        const base64 = reader.result;
            document.getElementById('ImageURL').value = base64;
            imagePreview();
        };
        reader.readAsDataURL(file);
    })
}

function imagePreview() {
    document.getElementById("previewImage").src = document.getElementById("ImageURL").value;
}

function submitImage(index) {
    db.ref(`userimages/${getUsername()}/images/image${index}sleep`).once("value", function(object) {
        db.ref(`users/${getUsername()}`).once("value", function(user_object) {
            checkImageURL(document.getElementById("ImageURL").value, function(isValid) {
                const lastMessageTime = user_object.val().sleep || 0;
                const timePassed = Date.now() - lastMessageTime;

                if (!isValid) {
                    alert(`Please use a valid URL for an image`);
                    return;
                }

                let base64 = document.getElementById("ImageURL").value.split(',')[1] || document.getElementById("ImageURL").value;
                let padding = (base64.match(/=+$/) || [''])[0].length;
                let sizeInBytes = (base64.length * 3) / 4 - padding;

                if ((!object.exists() || Date.now() - (object.val() || 0) > imageSleep || user_object.val().admin > 0) && (user_object.val().image || typeof(user_object.val().image) == "undefined")) {
                    if (sizeInBytes > 3 * 1024 * 1024) {
                        alert("Image cannot be larger than 3 MB");
                        return;
                    } else if (timePassed < messageSleep || user_object.val().muted) {
                        alert("You cannot submit images if you are muted or timed out");
                        return;
                    }
                    
                    db.ref(`userimages/${getUsername()}`).update({
                        [`images/image${index}`]: document.getElementById("ImageURL").value,
                        [`images/image${index}sleep`]: Date.now(),
                    }).then(() => {
                        images[index - 1] = document.getElementById("ImageURL").value;
                        document.getElementById("popup").remove();
                    })
                } else {
                    alert(`You are changing image ${index} too quickly`);
                }
            })
        })
    })
}

window.onload = function() {
    try {
        const config = {
            apiKey: "AIzaSyAsp44iKOav3dbHrViABHETRmAnRtQnVwA",
            authDomain: "chatter-97e8c.firebaseapp.com",
            databaseURL: "https://chatter-97e8c-default-rtdb.firebaseio.com",
            projectId: "chatter-97e8c",
            storageBucket: "chatter-97e8c.firebasestorage.app",
            messagingSenderId: "281722915171",
            appId: "1:281722915171:web:3b136d8a0b79389f2f6b56",
            measurementId: "G-4CGJ1JFX58"
        };

        firebase.initializeApp(config);
        db = firebase.database();

        const script = document.createElement('script');
        script.src = '../config.js';
        if (typeof(window.APPCHECK) !== "undefined") {
            self.FIREBASE_APPCHECK_DEBUG_TOKEN = window.APPCHECK;
        }

        const appCheck = firebase.appCheck();
        appCheck.activate('6LdCtT0rAAAAAMLtV7TbvgzemnHKbw28Ev8IzXyA', true, { provider: firebase.appCheck.ReCaptchaV3Provider });

        fetch('https://us-central1-pebble-rocks.cloudfunctions.net/api/checkVersion')
        .then(response => response.json())
        .then(data => {
            if (data.value === curr_version) {
                setup();
            } else {
                document.body.innerHTML = `An error has occured. You are most likely using an outdated version of the site. Fetch a new version by pressing "ctrl + shift + R" or "ctrl + f5<br>
                Newest Version: ${data.value}<br>
                Your Version: ${curr_version}`;
            }
        })
    } catch(err) {
        alert(err);
    }
};
