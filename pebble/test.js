
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
            
            var messageContent = document.createElement("div");
            messageContent.setAttribute("class", "message-text");
            messageContent.innerHTML = message;
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
        db.ref('chats/' + `message_${index}`).set({
            name: "[SERVER]",
            message: message,
            display_name: "[SERVER]",
            index: index
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

function send_message() {
    // var textarea = document.getElementById("textarea")
    var message = document.getElementById("text-box").value;
    message.replace(/^\s+|\s+$/g, "");
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
        return
    } else if (message == "sos") {
        window.location.replace("https://schoology.pickens.k12.sc.us/home")
        return
    } else if (message.startsWith("!mute ")) {
        var muted_user = message.substring(6).toLowerCase()
        // if (muted_user == "god") {
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
    } else if (message.startsWith("!remove ")) {
        var removed_user = message.substring(8).toLowerCase()
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
    }
    db.ref("users/" + username).once('value', function(user_object) {
        var obj = user_object.val();
        var display_name = obj.display_name;
        document.getElementById("text-box").value = "";
        db.ref('chats/').once('value', function(message_object) {
            var index = parseFloat(message_object.numChildren()) + 1;
            db.ref('chats/' + `message_${index}`).set({
                name: username,
                message: message,
                display_name: display_name,
                index: index,
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
            }
        }
    });
    alert("Incorrect password!");
}

function checkInput(input) {
    if (input == "") return false;
    if (!/^[a-zA-Z0-9]+$/.test(input)) return false;
    return true;
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

    if (!(/^[a-zA-Z0-9]+$/.test(username) && /^[a-zA-Z0-9]+$/.test(password) && /^[a-zA-Z0-9]+$/.test(displayName) && /^[a-zA-Z0-9]+$/.test(realName))) {
        alert("No special characters allowed.");
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
        sendServerMessage(localStorage.getItem("display") + " has joined the chat");
    } else {
        main.style.display = "none";
        loginBlock.style.display = "block";
    }

    // TODO: MAKE SHIFT-ENTER NOT SEND THE MESSAGE
    document.addEventListener('keydown', event => {
        const key = event.key.toLowerCase();
        if (document.getElementById("text-box") == document.activeElement) {
            if (key == "enter") {
                send_message();
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
        db.ref('chats/').once('value', function(message_object) {
            var index = parseFloat(message_object.numChildren()) + 1
            db.ref('chats/' + `message_${index}`).set({
                name: "[SERVER]",
                message: name + " wiped the chat<br/>" + wipeMessage,
                display_name: "[SERVER]",
                index: index
            }).then(function() {
                this.refresh_chat()
            })
        })
    })
    
}

let toggle = false;
function announce() {
    if (toggle) {
        document.getElementById("announce-toggle").innerHTML = '✓';
    }
    
    toggle = !toggle
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
