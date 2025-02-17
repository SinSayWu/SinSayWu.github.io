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
        var stages = {
            0: "Prehibernation",
            1: "Colonizing Continent",
            2: "Colonizing Planet",
            3: "Solar Civilization",
            4: "Type II Civilization",
            5: "Galactic Civilization",
            6: "Social Civilization",
            7: "Powerful Civilization",
            8: "THE Civilization"
        }
        class Game {
            getName() {
                if (localStorage.getItem('ssUsername') != null) {
                    return localStorage.getItem('ssUsername')
                } else {
                    return null
                }
            }

            login() {
                var loginBlock = document.getElementById("login-block");
                var gameArea = document.getElementById("gameArea");
                var username = document.getElementById("login-username-box").value;
                var password = document.getElementById("login-password-box").value;
                db.ref("SpaceSeizure/"+username).once('value', function(user_object) {
                    if (user_object.exists()) {
                        var obj = user_object.val();
                        if (obj.password == password) {
                            loginBlock.style.display = "none";
                            gameArea.style.display = "block";
                            localStorage.setItem("ssUsername", username);
                            localStorage.setItem("ssPassword", password);
                            localStorage.setItem("ssEmail", obj.email);
                            localStorage.setItem("ssStage", obj.stage);
                            window.location.reload();
                        }
                    } else {
                        alert("Did not work!");
                    }
                })
            }

            stage0() {
                var gameArea = document.getElementById("gameArea");
                gameArea.innerHTML = "";

                var continueButton = document.createElement("button");
                continueButton.innerHTML = "Continue";
                continueButton.setAttribute("class", "continue-button");
                continueButton.onclick = function() {
                    gameArea.innerHTML = "";
                    var warningText = document.createElement("h1");
                    warningText.innerHTML = "WARNING! WARNING! QT(Quantum Tunneling) RAYS WILL CAUSE THE DESTRUCTION OF HUMANITY. ONCE STRUCK, DEATH IS INEVITABLE. KILL TIME IS APPROXIMATELY 10 MINUTES. THERE IS NO CURE. TURN ON YOUR QUANTUM FOAM FORCE FIELDS IMMEDIATELY. ENTER HIBERNATION UNTIL YEAR 100,000,000. THE RAYS WILL HAVE DISSAPATED BY THEN. THIS IS YOUR ONLY CHANCE OF SURVIVAL, AND THE SURVIVAL OF THE HUMAN RACE.";
                    warningText.setAttribute("class", "warning-text");
                    gameArea.appendChild(warningText);

                    function showButtons() {
                        var qActive = false;
                        gameArea.innerHTML = "";
                        var qForceField = document.createElement("button");
                        qForceField.innerHTML = "Activate Quantum Force Field";
                        qForceField.style.marginTop = "2%";
                        qForceField.onclick = function() {
                            alert("Quantum Force Field is active!");
                            qActive = true;
                        }

                        var hibernationTimeInput = document.createElement("input");
                        hibernationTimeInput.type = "number";
                        hibernationTimeInput.placeholder = "Hibernation time in seconds";
                        hibernationTimeInput.setAttribute("class", "login-textbox");
                        hibernationTimeInput.style.marginRight = "1%";
                        var hibernationButton = document.createElement("button");
                        hibernationButton.innerHTML = "Start Hibernation";
                        hibernationButton.onclick = function() {
                            var hibernationTime = hibernationTimeInput.value;
                            if (!qActive) {
                                alert("You have not activated your Quantum Force Feild. You succummed to the QT rays.");
                                gameArea.innerHTML = "";
                                var gameOver = document.createElement("h1");
                                gameOver.innerHTML = "GAME OVER";
                                gameOver.style.color = "red";
                                gameArea.appendChild(gameOver);
                            } else if (hibernationTime < 1826898770880000) {
                                alert("You awoke from hibernation before the QT rays fully dissapated. You died.");
                                gameArea.innerHTML = "";
                                var gameOver = document.createElement("h1");
                                gameOver.innerHTML = "GAME OVER";
                                gameOver.style.color = "red";
                                gameArea.appendChild(gameOver);
                            } else if (hibernationTime > 10000000000000000) {
                                alert("Your body cannot stand hibernation for this long. You died in your sleep.");
                                gameArea.innerHTML = "";
                                var gameOver = document.createElement("h1");
                                gameOver.innerHTML = "GAME OVER";
                                gameOver.style.color = "red";
                                gameArea.appendChild(gameOver);
                            } else {
                                gameArea.innerHTML = "";
                                alert("You have awoken... It is now Year 100,000,000");
                                alert("A new era rises");
                                alert("You have advanced to Stage 1. You're goal is to colonize the continent you are on.");
                                localStorage.setItem("ssStage", 1);
                                db.ref("SpaceSeizure/" + localStorage.getItem("ssUsername")).update({
                                    stage: 1
                                })
                            }
                        }

                        gameArea.appendChild(qForceField);
                        gameArea.appendChild(document.createElement("br"));
                        gameArea.appendChild(document.createElement("br"));
                        gameArea.appendChild(hibernationTimeInput);
                        gameArea.appendChild(hibernationButton);
                    }
                    setTimeout(showButtons, 20000); 
                }

                var prologueBox = document.createElement("div");
                prologueBox.setAttribute("class", "prologue-box");
                var prologueText = document.createElement("h1");
                prologueText.setAttribute("class", "prologue-text");
                prologueText.innerHTML = "Humanity has now colonized the entire universe, making them the supreme rulers of all species. Their central government lies on a rocky planet called RX105. The origin and reason behind making it the most important place in the universe are both unknown and lost to time. With their advanced technology, humans have made fragile truces with numerous alien civilizations, keeping the universe from descending into chaos. Technology now harnesses the power of quantum mechanics and extracts the quantum foam of existence. This quantum foam layers the force fields protecting RX105. Also defending RX105 is a fleet of Supreme Space Warships. The defenses around RX105 are displays of power and supremacy. Delegates represent their galaxies in universal matters. They are among the most important beings in the universe, and are the only other things that qualify for quantum foam protection. The universe is at peace. For now, at least.\nYou are playing as John, the leading delegate of Galaxy 46290.";
                
                var hint1 = document.createElement("p");
                hint1.innerHTML = "Reading prologue is highly recommended."
                hint1.setAttribute("class", "hint");
                
                var hint2 = document.createElement("p");
                hint2.innerHTML = "Don't worry, it'll come, just wait for it."
                hint2.setAttribute("class", "hint");
                hint2.style.top = "90%";

                prologueBox.appendChild(prologueText);
                gameArea.appendChild(prologueBox);
                gameArea.appendChild(continueButton);
                gameArea.appendChild(hint1);
                gameArea.appendChild(hint2);
            }

            

            stage1() {
                var gameArea = document.getElementById("gameArea");
                gameArea.innerHTML = "";
            }

            startGame() {
                var stage = localStorage.getItem("ssStage");
                if (stage == 0) {
                    this.stage0();
                } else if (stage == 1) {
                    this.stage1();
                } else {
                    alert("The code for this stage has not been set. Updates coming soon.")
                }
            }

            setup() {
                var loginBlock = document.getElementById("login-block");
                var registerBlock = document.getElementById("register-block");
                var confirmEmailBlock = document.getElementById("confirm-email-block");
                var gameArea = document.getElementById("gameArea");
                if (this.getName() == null) {
                    var loginButton = document.createElement("button");
                    loginButton.innerHTML = "Login";
                    loginButton.onclick = this.login;
                    loginButton.setAttribute("class", "login-button");
                    loginBlock.appendChild(document.createElement("br"));
                    loginBlock.appendChild(loginButton);
                    loginBlock.appendChild(document.createElement("br"));
                    var regMenu = document.createElement("button");
                    regMenu.innerHTML = "Don't have an account?";
                    regMenu.onclick = function() {
                        var signUp = document.createElement("button");
                        signUp.innerHTML = "Register";
                        signUp.setAttribute("class", "login-button");
                        signUp.onclick = function() {
                            var ssUsername = document.getElementById("register-username-box").value;
                            var ssPassword = document.getElementById("register-password-box").value;
                            var ssPassword2 = document.getElementById("register-password2-box").value;
                            var ssEmail = document.getElementById("register-email-box").value;
                            if (ssPassword != ssPassword2) {
                                alert("Passwords did not match!");
                                return
                            }
                            if (ssUsername == "" || ssPassword == "" || ssEmail == "") {
                                alert("Check your inputs")
                                return
                            }
                            function validifyEmail(email) {
                                if (email.includes(".") && email.indexOf(".") != 0 && email.charAt(email.length - 1) != "@" && email.charAt(email.length - 1) != "." && email.charAt(0) != "." && email.charAt(0) != "@" && email.match("@").length == 1) {
                                    return true
                                }
                                return false
                            }
                            if (!validifyEmail(ssEmail)) {
                                alert("Not valid email");
                                return
                            }
                            db.ref("SpaceSeizure/" + ssUsername).once("value", function(user_obj) {
                                if (user_obj.exists()) {
                                    alert("Username already exists!");
                                } else {
                                    /*
                                    registerBlock.style.display = "none";
                                    confirmEmailBlock.style.display = "block";

                                    var sendEmailButton = document.createElement("a");
                                    sendEmailButton.innerHTML = "Send Confirmation Code";
                                    sendEmailButton.setAttribute("class", "login-button");
                                    sendEmailButton.href = "mailto:" + ssEmail
                                    var backButton = document.createElement("button");
                                    backButton.innerHTML = "Back";
                                    backButton.setAttribute("class", "login-button");
                                    backButton.onclick = function() {
                                        confirmEmailBlock.style.display = "none";
                                        registerBlock.style.display = "block";
                                    }

                                    confirmEmailBlock.appendChild(sendEmailButton);
                                    confirmEmailBlock.appendChild(document.createElement("br"));
                                    confirmEmailBlock.appendChild(backButton);
                                    */
                                    localStorage.setItem("ssRegistered", true);
                                    db.ref("SpaceSeizure/" + ssUsername).set({
                                        username: ssUsername,
                                        password: ssPassword,
                                        email: ssEmail,
                                        stage: 0,
                                    })
                                    localStorage.setItem("ssUsername", ssUsername);
                                    localStorage.setItem("ssPassword", ssPassword);
                                    localStorage.setItem("ssEmail", ssEmail);
                                    localStorage.setItem("ssStage", 0);
                                    registerBlock.style.display = "none";
                                    gameArea.style.display = "block";
                                    window.location.reload();
                                }
                            })
                        }

                        registerBlock.appendChild(signUp);
                        loginBlock.style.display = "none";
                        registerBlock.style.display = "block";
                    }
                    function getRegistered() {
                        if (localStorage.getItem("ssRegistered") != null) {
                            return localStorage.getItem("ssRegistered")
                        } else {
                            return false;
                        }
                    }
                    if (!getRegistered()) {
                        loginBlock.appendChild(regMenu);
                    }
                } else {
                    loginBlock.style.display = "none";
                    gameArea.style.display = "block";
                    this.startGame();
                }
            }
        }

        var app = new Game();
        app.setup();
    } catch(err) {
        alert(err);
    }
}
