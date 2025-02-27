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
        var termsOfService = `TERMS OF SERVICE:
Please note that these Terms of Service will hold until ... forever.
1. By clicking the button below, or exiting out of this alert in any way, shape, or form, but continuing to use this chat room, you, the user, are agreeing to the following terms.

2. I, the creator of this chat room, or anybody who I cooperated with to create this chatroom, are not responsible for anything that occurs in this chatroom, or its uses. This includes anything that goes against these terms.

3. No hate speech or slurs. Any hate speech or slurs will not be accepted in this chatroom. The consequences include being banned (for an indefinite amount of time), and notifying the police if necessary.

4. No illegal activites. Planning or carrying out illegal activities, including world domination, is not permitted in this chatroom. If this does happen, the police WILL be notified.

5. Hacking is not permitted. If you are caught hacking this chatroom, then you will be be banned (the length of time varies depending on the severity).

6. No doxxing. Doxers will be evicted.

7. As long as you, the user, have seen these Terms, you may not claim ignorance of these terms for your actions.

P.S. These terms apply to all of the webpages I own"`

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
                        window.location.replace("https://schoology.pickens.k12.sc.us/home");
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
                        if (obj.password == password && obj.username != "god") {
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
                    if (username == "god") {
                        localStorage.clear();
                        window.location.reload();
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
                        window.location.replace("https://schoology.pickens.k12.sc.us/home")
                        return
                    } else if (message.startsWith("!mute ")) {
                        var muted_user = message.substring(6).toLowerCase()
                        if (muted_user == "god") {
                            alert("Rebound!")
                            db.ref("users/" + username).on('value', function(user_object) {
                                db.ref("users/" + username).update({
                                    muted: true
                                })
                                window.location.reload();
                            })
                            db.ref('chats/').once('value', function(message_object) {
                                var index = parseFloat(message_object.numChildren()) + 1
                                db.ref('chats/' + `message_${index}`).set({
                                    name: "[SERVER]",
                                    message: username + " muted themselves!",
                                    display_name: "[SERVER]",
                                    index: index
                                }).then(function() {
                                    this.refresh_chat()
                                })
                            })
                            return
                        }
                    } else if (message.startsWith("!remove ")) {
                        var removed_user = message.substring(6).toLowerCase()
                        if (removed_user == "god") {
                            alert("Rebound!")
                            db.ref("users/" + username).on('value', function(user_object) {
                                db.ref("users/" + username).update({
                                    muted: true
                                })
                                window.location.reload();
                            })
                            db.ref('chats/').once('value', function(message_object) {
                                var index = parseFloat(message_object.numChildren()) + 1
                                db.ref('chats/' + `message_${index}`).set({
                                    name: "[SERVER]",
                                    message: username + " muted themselves!",
                                    display_name: "[SERVER]",
                                    index: index
                                }).then(function() {
                                    this.refresh_chat()
                                })
                            })
                            return
                        }
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
                        localStorage.clear();
                        window.location.reload();
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
                if (username == "god") {
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
                            alert(termsOfService);
                            window.location.reload();
                        }
                    } 
                })
            }
            
            register() {
                var username = document.getElementById("username-register").value
                username = username.toLowerCase()
                var password = document.getElementById("password-register").value
                var displayName = document.getElementById("display-register").value
                var realName = document.getElementById("name-register").value
                if (username == "" || password == "" || displayName == "" || username == "[SERVER]" || realName == "") {
                    alert("Fill out all fields")
                    return
                }
                if (displayName.toLowerCase().includes("god") || username.includes("god")) {
                    alert("No impersonating God, you are being culturally insensitive.");
                    return
                }
                var format = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
                if (format.test(username) || format.test(password) || format.test(displayName) || format.test(realName)) {
                    alert("No special characters allowed.")
                    return
                }
                
                var main = document.getElementById("main")
                var login = document.getElementById("login")
                var register = document.getElementById("register")
                db.ref("users/" + username).once('value', function(user_object) {
                    if (user_object.exists() == true) {
                        alert("Username already exists!")
                    } else {
                        db.ref("users/" + username).set({
                            display_name: displayName,
                            password: password,
                            username: username,
                            name: realName,
                            muted: true,
                            active: true,
                        }).then(function() {
                            main.style.display = "block"
                            login.style.display = "none"
                            register.style.display = "none"
                            localStorage.setItem('username', username)
                            localStorage.setItem('password', password)
                            localStorage.setItem("display", displayName)
                            alert(credits);
                            alert(termsOfService);
                            window.location.reload()
                        })
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

            /*setupGame() {
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
            }*/

            setup() {
                if (!("Notification" in window)) {
                    // Check if the browser supports notifications
                    alert("This browser does not support desktop notification");
                } else if (Notification.permission === "granted") {
                    // Check whether notification permissions have already been granted;
                    // if so, create a notification
                    var notification = new Notification("Hi there!", {body: "test"});
                } else if (Notification.permission !== "denied") {
                    // We need to ask the user for permission
                    Notification.requestPermission().then((permission) => {
                        console.log(permission);
                        // If the user accepts, let's create a notification
                        if (permission === "granted") {
                            var notification = new Notification("Hi there!", {
                                body: "Test"
                            });
                        }
                    });
                }
                this.check_creds()
                this.update_name()
                var element = document.createElement("button")
                element.setAttribute("class", "send-message")
                element.innerHTML = "➤"
                element.onclick = this.send_message

                var returnHomeButton = document.createElement("button");
                returnHomeButton.setAttribute("class", "sidebar-button");
                returnHomeButton.title = "Return to HomePage";
                var returnHomeLogo = document.createElement("img");
                returnHomeLogo.src = "../images/lunarlunacy.png";
                returnHomeLogo.setAttribute("class", "sidebar-logo");
                returnHomeButton.appendChild(returnHomeLogo);
                returnHomeButton.addEventListener("click", function(e) {
                    window.location.replace("../index.html");
                })
                document.getElementById("sidebar").appendChild(returnHomeButton)
                document.getElementById("sidebar").appendChild(document.createElement("hr"))

                var spaceSeizureButton = document.createElement("button");
                spaceSeizureButton.setAttribute("class", "sidebar-button");
                spaceSeizureButton.title = "Space Seizure";
                var spaceSeizureLogo = document.createElement("img");
                spaceSeizureLogo.src = "../images/spaceseizuremain.png";
                spaceSeizureLogo.setAttribute("class", "sidebar-logo");
                spaceSeizureButton.appendChild(spaceSeizureLogo);
                spaceSeizureButton.addEventListener("click", function(e) {
                    window.open("SpaceSeizure/spaceSeizure.html", "_blank");
                })
                spaceSeizureButton.onclick = this.setupGame
                document.getElementById("sidebar").appendChild(spaceSeizureButton)
                
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

                //Login and Register Screens
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
                
                var reg = document.createElement("button")
                reg.setAttribute("class", "login-button")
                reg.innerHTML = "Register"
                reg.style.marginTop = "5px"
                reg.onclick = regMenu
                
                function regMenu() {
                    var register = document.getElementById("register")
                    register.style.display = "block"
                    login.style.display = "none"
                }
                
                logincontain.appendChild(element)
                logincontain.appendChild(reg)
                
                var registercontain = document.getElementById("registercontain")
                
                var regbutton = document.createElement("button")
                regbutton.setAttribute("class", "login-button")
                regbutton.innerHTML = "Register"
                regbutton.onclick = this.register
                
                var backbutton = document.createElement("button");
                backbutton.setAttribute("class", "login-button");
                backbutton.innerHTML = "Back";
                backbutton.style.marginTop = "5px";
                backbutton.onclick = function() {
                    register.style.display = "none";
                    login.style.display = "block";
                }
                
                registercontain.appendChild(regbutton)
                registercontain.appendChild(backbutton);
            }
        }
        
        var app = new chatter()
        app.setup()
    } catch(err) {
        alert(err)
    }
}