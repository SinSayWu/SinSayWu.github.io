window.onload = function() {
    try {
        const firebaseConfig = {
            apiKey: "AIzaSyDOAj76E00Rg8Qyc5DQndWXHtCy2umC6vA",
            authDomain: "chatter-97e8c.firebaseapp.com",
            projectId: "chatter-97e8c",
            storageBucket: "chatter-97e8c.appspot.com",
            messagingSenderId: "281722915171",
            appId: "1:281722915171:web:3b136d8a0b79389f2f6b56",
            measurementId: "G-4CGJ1JFX58"
        };
        firebase.initializeApp(firebaseConfig);
        var db = firebase.database();
        var credits = `Credit to Mr. BungoChungo for cooperating with me (at least for a short time) on this project.
        Credit to Mr. WagnerRizzer for the logo of this site, which originated from a school project.`;

        class chatter {
            refresh_chat() {
                var textarea = document.getElementById('textarea');
        
                // Get the chats from firebase
                db.ref('chats/').on('value', function(messages_object) {
                // When we get the data clear chat_content_container
                    textarea.innerHTML = '';
                // if there are no messages in the chat. Return . Don't load anything
                    if(messages_object.numChildren() == 0){
                        return
                    }
        
                // OK! SO IF YOU'RE A ROOKIE CODER. THIS IS GOING TO BE
                // SUPER EASY-ISH! I THINK. MAYBE NOT. WE'LL SEE!
        
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
        
                // Now this is straight up from stack overflow Ã°Å¸Â¤Â£
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
                var username = this.get_name();
                db.ref("users/" + username).update({
                    active: true
                })
            }
            
            display_members() {
                var members = document.getElementById('members');
        
                // Get the users from firebase
                db.ref('users/').on('value', function(membersList) {
                    members.innerHTML = '';
                    if(membersList.numChildren() == 0){
                        return
                    }
                    var usernames = Object.values(membersList.val());
                    var ordered = [];
        
                    for (var i, i = 0; i < usernames.length; i++) {
                        ordered.push([usernames[i].display_name, usernames[i].muted, usernames[i].username, usernames[i].active]);
                    }
                    ordered.forEach(function(properties) {
                        var memberElement = document.createElement("div");
                        memberElement.setAttribute("class", "member");
                        memberElement.innerHTML = properties[0];
                        var text = memberElement.innerHTML;
                        if (properties[3]) {
                            memberElement.style.color = "Green";
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
        
            }
            
            send_server_message(message) {
                try {
                    var textarea = document.getElementById("textarea");
                    var message = message;
                    var username = "[SERVER]";
                    if (message == "" || username == "") {
                        return
                    } else if (message == "sos") {
                        window.location.replace("https://classroom.google.com");
                        return
                    } else {
                        if (message == "rofl") {
                            message = "🤣";
                        } else if (message == "lol") {
                            message = "😂";
                        } else if (message == "k" || message == "ok" || message == "kk" || message == "okay") {
                            message = "👌";
                        }
                        db.ref('chats/').once('value', function(message_object) {
                            var index = parseFloat(message_object.numChildren()) + 1
                            db.ref('chats/' + `message_${index}`).set({
                                name: "[SERVER]",
                                message: message,
                                display_name: "[SERVER]",
                                index: index
                            }).then(this.refresh_chat())
                        })
                    }
                } catch(err) {
                    alert(err);
                }
            }
            
            check_creds() {
                var username = localStorage.getItem('username')
                var password = localStorage.getItem('password')
                db.ref("users/" + username).once('value', function(user_object) {
                    if (user_object.exists() == true) {
                        var obj = user_object.val()
                        if (obj.password == password) {
                            return
                        } else {
                            var main = document.getElementById("main")
                            var login = document.getElementById("login")
                            main.style.display = "none"
                            login.style.display = "block"
                            localStorage.clear()
                        }
                    } 
                })
            }
            
            send_message() {
                try {
                    var textarea = document.getElementById("textarea")
                    var message = document.getElementById("text-box").value
                    this.check_creds
                    var username = localStorage.getItem('username')
                    if (username == null) {
                        return
                    }

                    //Check if user is muted
                    db.ref("users/" + username).once('value', function(user_object) {
                        if (user_object.muted) {
                            return
                        }
                    })
                    
                    if (message == "" || username == "") {
                        return
                    } else if (message == "sos") {
                        window.location.replace("https://classroom.google.com")
                        return
                    } else if (message.startsWith("!mute ")) {
                        var muted_user = message.substring(6).toLowerCase()
                        if (muted_user == "god") {
                            alert("Rebound!")
                            db.ref("users/" + username).on('value', function(user_object) {
                                db.ref("users/" + username).update({
                                    muted: true
                                })
                            })
                            db.ref('chats/').once('value', function(message_object) {
                                var index = parseFloat(message_object.numChildren()) + 1
                                db.ref('chats/' + `message_${index}`).set({
                                    name: "[SERVER]",
                                    message: muted_user + " muted themselves!",
                                    display_name: "[SERVER]",
                                    index: index
                                }).then(function() {
                                    this.refresh_chat()
                                })
                            })
                            return
                        }
                        if (username == "god") {
                            db.ref("users/" + muted_user).once('value', function(user_object) {
                                if (user_object.exists() == false) {
                                    alert("User cannot be muted, " + muted_user + " does not exist!")
                                    return
                                } else if (muted_user == "god") {
                                    alert("Rebound!")
                                    db.ref("users/" + username).on('value', function(user_object) {
                                        db.ref("users/" + username).update({
                                            muted: true
                                        })
                                    })
                                    return
                                }
                                db.ref('chats/').once('value', function(message_object) {
                                    var index = parseFloat(message_object.numChildren()) + 1
                                    db.ref('chats/' + `message_${index}`).set({
                                        name: "[SERVER]",
                                        message: "Muted " + muted_user,
                                        display_name: "[SERVER]",
                                        index: index
                                    }).then(function() {
                                        this.refresh_chat()
                                    })
                                })
                                db.ref("users/" + muted_user).update({
                                    muted: true
                                })
                            })
                        }
                    } else if (message.startsWith("!unmute ")) {
                        if (username == "god") {
                            var unmuted_user = message.substring(8).toLowerCase()
                            db.ref("users/" + unmuted_user).once('value', function(user_object) {
                                if (user_object.exists() == false) {
                                    alert("User cannot be unmuted, " + unmuted_user + " does not exist!")
                                    return
                                }
                                db.ref('chats/').once('value', function(message_object) {
                                    var index = parseFloat(message_object.numChildren()) + 1
                                    db.ref('chats/' + `message_${index}`).set({
                                        name: "[SERVER]",
                                        message: "Unmuted " + unmuted_user,
                                        display_name: "[SERVER]",
                                        index: index
                                    }).then(function() {
                                        this.refresh_chat()
                                    })
                                })
                                db.ref("users/" + unmuted_user).update({
                                    muted: false
                                })
                            })
                        }
                    } else if (message.startsWith("!reveal ") && username == "god") {
                        var revealed_user = message.substring(8).toLowerCase()
                        db.ref("users/" + revealed_user).once('value', function(user_object) {
                            var obj = user_object.val()
                            alert(obj.password)
                        })
                    } else if (message.startsWith("!remove ") && username == "god") {
                        var removed_user = message.substring(8).toLowerCase()
                        db.ref("users/" + removed_user).remove()
                    } else if (message == "!allmutedremove" && username == "god") {
                        db.ref("users/").on('value', function(usrObj) {
                            var obj = Object.values(usrObj.val())
                            obj.forEach(function(usr) {
                                if (usr.muted) {
                                    db.ref("users/" + usr.username).remove();
                                }
                            })
                        })
                    }
                    if (message == "rofl") {
                        message = "🤣"
                    } else if (message == "lol") {
                        message = "😂"
                    } else if (message == "k" || message == "ok" || message == "kk" || message == "okay") {
                        message = "👌"
                    }
                    db.ref("users/" + username).once('value', function(user_object) {
                        var obj = user_object.val()
                        var display_name = obj.display_name
                        document.getElementById("text-box").value = ""
                        db.ref('chats/').once('value', function(message_object) {
                            var index = parseFloat(message_object.numChildren()) + 1
                            db.ref('chats/' + `message_${index}`).set({
                                name: username,
                                message: message,
                                display_name: display_name,
                                index: index
                            }).then(function() {
                                this.refresh_chat()
                            })
                        })
                    })
                } catch(err) {
                    alert(err)
                }
            }

            alertDisclaimer() {
                const fs = require('fs')
                fs.readFile('pebbleCredits.txt', function (err, data) {
                    alert(data)
                })
            }
            
            get_name() {
                if (localStorage.getItem('username') != null) {
                    return localStorage.getItem('username')
                } else {
                    return null
                }
            }
            
            update_name() {
                var name = localStorage.getItem('username')
                db.ref("users/" + name).once('value', function(user_object) {
                    var obj = user_object.val()
                    var display_name = obj.display_name
                    localStorage.setItem("display", display_name)
                    document.getElementById("userdisplay").innerHTML = display_name + ` (@${name})`
                    if (name == "god") {
                        var dash = document.getElementById("profile")
                        
                        var wipebutton = document.createElement("button")
                        wipebutton.onclick = wipechat
                        wipebutton.innerHTML = "Wipe Chat"
                        wipebutton.setAttribute("class", "profile-button")
                        
                        dash.appendChild(wipebutton)
                        
                        function wipechat() {
                            db.ref("chats/").remove()
                            db.ref('chats/').once('value', function(message_object) {
                                var index = parseFloat(message_object.numChildren()) + 1
                                db.ref('chats/' + `message_${index}`).set({
                                    name: "[SERVER]",
                                    message: "GOD wiped the chat",
                                    display_name: "[SERVER]",
                                    index: index
                                }).then(function() {
                                    this.refresh_chat()
                                })
                            })
                        }
                    }
                    var dash = document.getElementById("profile")
                    
                    var logoutButton = document.createElement("button")
                    logoutButton.onclick = logout
                    logoutButton.innerHTML = "Logout"
                    logoutButton.setAttribute("class", "profile-button")
                    dash.appendChild(logoutButton)
                    
                    function logout() {
                        localStorage.clear()
                        window.location.reload()
                        db.ref("users/" + this.get_name()).update({
                            active: false
                        })
                        this.display_members()
                    }
                })
            }
            
            login() {
                var username = document.getElementById("username-login").value
                username = username.toLowerCase()
                var password = document.getElementById("password-login").value
                if (password == "") {
                    return
                }
                if (username != "god") {
                    return
                }
                db.ref("users/" + username).once('value', function(user_object) {
                    if (user_object.exists() == true) {
                        var obj = user_object.val();
                        if (obj.password == password) {
                            var main = document.getElementById("main");
                            var login = document.getElementById("login");
                            main.style.display = "block";
                            login.style.display = "none";
                            localStorage.setItem('username', username);
                            localStorage.setItem('password', password);
                            localStorage.setItem("display", obj.display_name);
                            localStorage.setItem("planets", obj.planets);
                            alert(credits);
                            window.location.reload();
                        }
                    } 
                })
            }
            
            check_mute() {
                db.ref("users/god").on('value', function(user_object) {
                    db.ref("users/god").update({
                        muted: false
                    })
                })
                db.ref("users/" + localStorage.getItem("username")).on('value', function(user_object) {
                    var obj = user_object.val()
                    if (obj.muted) {
                        document.getElementById("text-box").disabled = true
                        document.getElementById("text-box").placeholder = "Muted"
                    } else {
                        document.getElementById("text-box").disabled = false
                        document.getElementById("text-box").placeholder = "Message"
                    }
                })
            }

            setupGame() {
                var message_area = document.getElementById("messagebox");
                var game_area = document.getElementById("gamearea");
                var member_list = document.getElementById("memberlist");
                message_area.style.width = "36%";
                game_area.style.display = "block";
                member_list.style.display = "none";
            }
            
            lunarLunacy() {
                console.log("worked")
                var planets = localStorage.getItem("planets");
                var gameArea = document.getElementById("gamearea");
                gameArea.innerHTML = "";
                var planetImg = document.createElement("img");
                planetImg.src = "../images/planetImg.png";
                planetImg.style.width = "3%";
                gameArea.appendChild(planetImg);
            }

            setup() {
                this.check_creds()
                this.update_name()
                var element = document.createElement("button")
                element.setAttribute("class", "send-message")
                element.innerHTML = "➤"
                element.onclick = this.send_message

                var spaceSeizureButton = document.createElement("button");
                spaceSeizureButton.setAttribute("class", "sidebar-button");
                spaceSeizureButton.title = "Space Seizure";
                var spaceSeizureLogo = document.createElement("img");
                spaceSeizureLogo.src = "../images/spaceseizuremain.png";
                spaceSeizureLogo.setAttribute("class", "sidebar-logo");
                spaceSeizureButton.appendChild(spaceSeizureLogo);
                spaceSeizureButton.onclick = this.setupGame
                document.getElementById("sidebar").appendChild(spaceSeizureButton)
                
                var lunarLunacyButton = document.createElement("button");
                lunarLunacyButton.setAttribute("class", "sidebar-button");
                lunarLunacyButton.title = "Lunar Lunacy";
                var lunarLunacyLogo = document.createElement("img");
                lunarLunacyLogo.src = "../images/lunarlunacy.png";
                lunarLunacyLogo.setAttribute("class", "sidebar-logo");
                lunarLunacyButton.appendChild(lunarLunacyLogo);
                console.log(this)
                lunarLunacyButton.onclick = this.setupGame, this.lunarLunacy;
                document.getElementById("sidebar").appendChild(lunarLunacyButton)
                
                document.getElementById("downbar").appendChild(element)
                document.addEventListener('keydown', event => {
                    const key = event.key.toLowerCase();
                    if (document.getElementById("text-box") == document.activeElement) {
                        if (key == "enter") {
                            this.send_message()
                        }
                    } else if (document.getElementById("password-login") == document.activeElement) {
                        if (key == "enter") {
                            this.login()
                        }
                    }
                })
                this.refresh_chat()
                this.display_members()
                this.check_mute()
                var main = document.getElementById("main")
                var login = document.getElementById("login")
                if (this.get_name() != null) {
                    main.style.display = "block"
                    login.style.display = "none"
                    this.send_server_message(localStorage.getItem("display") + " has joined the chat")
                } else {
                    main.style.display = "none"
                    login.style.display = "block"
                }
                var element = document.createElement("button")
                element.setAttribute("class", "login-button")
                element.innerHTML = "Login"
                element.onclick = this.login

                logincontain.appendChild(element)
            }
        }
        
        var app = new chatter()
        app.setup()
    } catch(err) {
        alert(err)
    }
}