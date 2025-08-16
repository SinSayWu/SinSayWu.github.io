var playing = false;
var golden_cookie = false;
var gambled_money = 0;
const channel = new BroadcastChannel('tab-check');
const policy_list = ["Is Yume 2kki the best game to ever exist?", "Should police officers pay taxes?", "Should bank tellers pay taxes?", "Should stealing autoclickers or mult be a sin?", "Should destroying autolickers, mult, or money be a sin?", "Should arresting the Jester cause police officers to be reset to complete zero?", "Should Council Members pay taxes?", "Should non-Council Members be allowed to see the current policy being voted on and the number of yes and no votes?", "Should Council Members be allowed to change their vote until the last minute?", "Should Council Member votes be anonymous?"];
let db;

function play() {
    const music = document.getElementById("bg-music");
    const playlist = ["../images/secret_files/irisu_01.mp3", "../images/secret_files/irisu_02.mp3", "../images/secret_files/irisu_03.mp3", "../images/secret_files/irisu_04.mp3", "../images/secret_files/irisu_05.mp3", "../images/secret_files/irisu_06.mp3", "../images/secret_files/hc_s2.m4a", "../images/secret_files/hc_hs1.m4a", "../images/secret_files/hc_hs2.m4a"];
    music.volume = 0.2;
    music.src = playlist[Math.floor(Math.random() * playlist.length)];

    if (playing) {
        music.pause();
        document.getElementById("speaker").src = "../images/mute.png"
    } else {
        music.play();
        document.getElementById("speaker").src = "../images/speaker.png"
    }
    playing = !playing;
}

function addAmount(autoclicker) {
    const keys = ["mult", "autoclicker", "stolenauto", "stolenmult", "money"];
    const promises = keys.map((key) =>
        db.ref(`users/${getUsername()}/${key}`).once("value")
    );

    Promise.all(promises).then((snapshots) => {
        const results = {};
        keys.forEach((key, i) => {
            results[key] = snapshots[i].val();
        });

        let amount = ((results.mult || 1) + (results.stolenmult || 0)) * (autoclicker === undefined ? 1 : ((results.autoclicker || 0) + (results.stolenauto || 0)));
        if (golden_cookie) {
            amount *= 2;
        }

        if (results.money && Number.isInteger(results.money)) {
            if (autoclicker) {
                loadLeaderboard();
            }

            db.ref(`users/${getUsername()}`).update({
                money: firebase.database.ServerValue.increment(amount)
            });
        } else {
            db.ref(`users/${getUsername()}`).update({
                money: amount
            });
        }
    });
}

function loadLeaderboard() {
    var leaderboard = document.getElementById('leaderboard');

    db.ref(`users/${getUsername()}`).once("value", function(user_object) {
        db.ref("users/").orderByChild("money").once("value", (object) => {
            db.ref(`other/Casino`).once("value", function(casino_object) {
                leaderboard.innerHTML = "";

                users = [];

                object.forEach((object_child) => {
                    if ((object_child.val().role !== "pacifist" && user_object.val().role !== "pacifist") || user_object.val().username == object_child.val().username) {
                        users.push(object_child.val());
                    }
                })

                users.sort((a, b) => {
                    const getValue = (user) => {
                        if (user.role === "jester" && user.ability1sleep && !Number.isInteger(user.ability1sleep) && user.ability1sleep[0]) {
                            return user.ability1sleep[1];
                        }
                        return user.money;
                    };
                  
                    return getValue(a) - getValue(b);
                });

                users.sort((a, b) => {
                    const timeA = a.timestamp ? Number(a.timestamp) : Infinity;
                    const timeB = b.timestamp ? Number(b.timestamp) : Infinity;
                    return timeA - timeB;
                });

                users.push(casino_object.val());
                users.reverse();

                users.forEach(function(username) {
                    var leader = document.createElement("div");
                    leader.setAttribute("class", "leader");
                    
        
                    var usernameElement = document.createElement("div");
                    usernameElement.setAttribute("class", "leader-header");
                    usernameElement.innerHTML = username.username + ": ";
                    
                    
                    var usernameAmount = document.createElement("span");
                    usernameAmount.setAttribute("id", "leaderNumber");
                    usernameAmount.innerHTML = shortenNumber((username.role == "jester" && username.ability1sleep && !Number.isInteger(username.ability1sleep) && username.ability1sleep[0]) ? username.ability1sleep[1] : username.money || 0);
                    
                    var usernameImage = document.createElement("img");
                    usernameImage.src = "../images/money.png";
                    
                    usernameElement.appendChild(usernameAmount);
                    usernameElement.appendChild(usernameImage);
        
                    
                    var contentElement = document.createElement("div");
                    contentElement.setAttribute("class", "leader-content");
                    if (username.username == "Casino") {
                        contentElement.innerHTML = `Total Earnings: $${shortenNumber(username.money)}`;
                    } else {
                        if (username.role == "jester" && username.ability1sleep && !Number.isInteger(username.ability1sleep) && username.ability1sleep[0]) {
                            contentElement.innerHTML = "Auto-Clickers: " + username.ability1sleep[2] + "<br>Mult: " + username.ability1sleep[3] + (username.ability1sleep[4] ? `<br>Gambling: Unlocked` : "") + (username.ability1sleep[6] !== "none" ? `<br>Role: ${username.ability1sleep[6]}` : "") + (user_object.val().role == "angel" || username.username == user_object.val().username ? `<br>Deeds: ${shortenNumber(username.ability1sleep[5])}` : "");
                        } else {
                            contentElement.innerHTML = "Auto-Clickers: " + (username.autoclicker || 0) + "<br>Mult: " + (username.mult || 1) + (username.gambling ? `<br>Gambling: Unlocked` : "") + (username.role ? `<br>Role: ${(username.role == "criminal" || username.role == "gambler" || username.role == "jester") ? "citizen" : username.role}` : "") + (user_object.val().role == "angel" ? `<br>Deeds: ${shortenNumber(username.deeds || 0)}` : "");
                        }
                    }
        
                    leader.appendChild(usernameElement);
                    leader.appendChild(contentElement);
        
                    leaderboard.appendChild(leader);
                })
            })
        })
    })
}

function loadNotifications() {
    var notifications = document.getElementById("notifications");

    db.ref("other/clickernotifications/").on("value", (object) => { // this one is fine
        notifications.innerHTML = "";
        
        let notifs = [];

        object.forEach((object_child) => {
            notifs.push(object_child.val());
        })

        if (notifs.length > 50) {
            notifs.splice(0,notifs.length-50)
        }

        notifs.reverse();

        notifs.forEach(function(notif) {
            var notifElement = document.createElement("div");
            notifElement.setAttribute("class", "notification");
            notifElement.innerHTML = notif;

            notifications.appendChild(notifElement);
        })
    })
}

function clearNotifs() {
    db.ref(`users/${getUsername()}`).once("value", function(object) {
        obj = object.val();

        if (obj.admin >= 9000) {
            db.ref("other/clickernotifications").remove();
        }
    })
}

function sendNotification(message) {
    db.ref(`other/clickernotifications/`).push(
        message
    )
}

function autoclickerCheck() {
    db.ref(`users/${getUsername()}`).once("value", function(object) {
        if (!object.val().autoactive && Number.isInteger(object.val().money)) {
            loadAutoclicker();
        }
    })
}

function loadAutoclicker() {
    db.ref("users/" + getUsername()).once("value", (object) => {
        obj = object.val();
        if ((obj.role == "angel" ? 0.01 : Math.min((0.004 * Math.log((obj.deeds * 10000) / obj.money) / Math.log(Math.E)), 0.005)) >= Math.random() && !golden_cookie) {
            let overlay = document.createElement("div");
            overlay.setAttribute("id", "overlay");

            overlay.style.position = "fixed";
            overlay.style.top = "0";
            overlay.style.left = "0";
            overlay.style.width = "100vw";
            overlay.style.height = "100vh";
            overlay.style.backgroundColor = "rgba(255, 255, 0, 0.1)";
            overlay.style.zIndex = "9999";
            overlay.style.pointerEvents = "none";

            document.body.appendChild(overlay);

            golden_cookie = true;
            setTimeout(() => {
                golden_cookie = false;
                document.getElementById("overlay").remove();
            }, 60000)
        }
        addAmount(true);
        setTimeout(loadAutoclicker, 1000);
        db.ref(`users/${getUsername()}`).update({
            autoactive: true,
        })
    })
}

function loadMain() {
    db.ref(`users/${getUsername()}/mult`).on("value", function(mult_object) {
        db.ref(`users/${getUsername()}/stolenmult`).once("value", function(stolenmult_object) {
            // clicker mult
            var clicker = document.getElementById("clicky-button");
            clicker.innerHTML = "+" + ((mult_object.val() || 1) + (stolenmult_object.val() || 0));
            var clickerimage = document.createElement("img");
            clickerimage.src = "../images/money.png";
            clicker.appendChild(clickerimage);
        })
    })

    // auto clicker prices
    db.ref(`users/${getUsername()}/autoclicker`).on("value", function(auto_object) {
        var obj = auto_object.val();
        var autocost = document.getElementById("autoCost");
        autocost.innerHTML = shortenNumber(Math.round(100 * 1.2 ** (obj || 0)));

        // number of current auto clickers
        var autonum = document.getElementById("autoDescription");
        autonum.innerHTML = `Current auto-clickers: ${obj || 0}<br><hr>"It just plays itself!"<br>(NOTE: Refresh your page if your auto-clickers are not auto-clicking)<br><button class="sell" id="auto-sell" onclick="autoSell()">Sell</button>`;
    })

    db.ref(`users/${getUsername()}/mult`).on("value", function(mult_object) {
        var obj = mult_object.val();
        // mult prices
        var multcost = document.getElementById("multCost");
        multcost.innerHTML = shortenNumber(Math.round(250 * 1.4 ** ((obj || 1) - 1)));

        // number of current mults
        var multnum = document.getElementById("multDescription");
        multnum.innerHTML = `Current mult: ${obj || 1}<br><hr>"Yo Dawg, we heard you like to click, so we put more clicks in your click so you can click more while you click"<br><button class="sell" id="mult-sell" onclick="multSell()">Sell</button>`;
    })

    db.ref(`users/${getUsername()}`).on("child_added", function(gambling_object) {
        // check if gambling has been bought
        if (gambling_object.key == "gambling" && gambling_object.val()) {
            document.getElementById('gambling-text').innerHTML = "Probability Sim with Cards";
        }
    })

    db.ref(`users/${getUsername()}`).on("child_added", function(role_object) {
        // check if roles have been bought
        if (role_object.key == "role" && role_object.val()) {
            document.getElementById('roles-text').innerHTML = "Roles";
        }
    })
}

function loadSelectors() {
    db.ref("users/").once("value", (object) => {
        autoselector = document.getElementById("autoselect");
        autoselector.innerHTML = `<option value="" selected disabled>Select an option</option>`;
        multselector = document.getElementById("multselect");
        multselector.innerHTML = `<option value="" selected disabled>Select an option</option>`;
        moneyselector = document.getElementById("moneyselect");
        moneyselector.innerHTML = `<option value="" selected disabled>Select an option</option>`;
        autogiftselector = document.getElementById("autogiftselect");
        autogiftselector.innerHTML = `<option value="" selected disabled>Select an option</option>`;
        multgiftselector = document.getElementById("multgiftselect");
        multgiftselector.innerHTML = `<option value="" selected disabled>Select an option</option>`;
        moneygiftselector = document.getElementById("moneygiftselect");
        moneygiftselector.innerHTML = `<option value="" selected disabled>Select an option</option>`;

        object.forEach(function(username) {
            if (username.val().role !== "pacifist") {
                autooption = document.createElement("option");
                autooption.value = username.key;
                autooption.innerHTML = username.val().username;
                autoselector.appendChild(autooption);

                multoption = document.createElement("option");
                multoption.value = username.key;
                multoption.innerHTML = username.val().username;
                multselector.appendChild(multoption);

                moneyoption = document.createElement("option");
                moneyoption.value = username.key;
                moneyoption.innerHTML = username.val().username;
                moneyselector.appendChild(moneyoption);

                autogiftoption = document.createElement("option");
                autogiftoption.value = username.key;
                autogiftoption.innerHTML = username.val().username;
                autogiftselector.appendChild(autogiftoption);

                multgiftoption = document.createElement("option");
                multgiftoption.value = username.key;
                multgiftoption.innerHTML = username.val().username;
                multgiftselector.appendChild(multgiftoption);

                moneygiftoption = document.createElement("option");
                moneygiftoption.value = username.key;
                moneygiftoption.innerHTML = username.val().username;
                moneygiftselector.appendChild(moneygiftoption);
            }
        })
    })
}

function buyAuto() {
    db.ref(`users/${getUsername()}`).transaction((obj) => {
        var price = Math.round(100 * 1.2 ** (obj.autoclicker || 0));

        if (obj.money >= price) {
            obj.money -= price
            obj.autoclicker = (obj.autoclicker || 0) + 1;
        }
        return obj;
    })
}

function sellAuto() {
    db.ref(`users/${getUsername()}`).transaction((obj) => {
        var price = Math.round((100 * 1.2 ** (obj.autoclicker - 1 || 0)) * 0.9);

        if (obj.autoclicker > 0) {
            obj.money += price
            obj.autoclicker = obj.autoclicker - 1;
        }
        return obj;
    })
}

function buyMult() {
    db.ref(`users/${getUsername()}`).transaction((obj) => {
        var price = Math.round(250 * 1.4 ** (obj.mult - 1 || 0));

        if (obj.money >= price) {
            obj.money -= price;
            obj.mult = (obj.mult || 1) + 1;
        }
        return obj;
    })
}

function sellMult() {
    db.ref(`users/${getUsername()}`).transaction((obj) => {
        var price = Math.round((250 * 1.4 ** (obj.mult - 2 || 0)) * 0.9);

        if (obj.mult > 1) {
            obj.money += price
            obj.mult = obj.mult - 1;
        }
        return obj;
    })
}

function Gambling() {
    db.ref(`users/${getUsername()}`).once("value", function(object) {
        if (object.val().gambling) {
            showPopUp(`Welcome to the Gambling Space! $<span id="gambling-money">${object.val().money}</span>`,`Double or Nothing<hr>$<input type="text" id="double"><br><br>Blackjack<hr>Dealer: <span id="dealer"></span><br>You: <span id="player"></span><br>$<input type="text" id="blackjack"><br><br>The Ultimate Gamble<hr><button onclick="ultimateGamble()">Gamble all my money away</button><span id="ultimatePercentage"></span>`, [["Double-or-Nothing", () => DoubleNothing()], ["Hit", () => blackHit()], ["Stand", () => blackStand()]]);
        } else if (object.val().money >= 100000) {
            db.ref(`users/${getUsername()}`).update({
                money: firebase.database.ServerValue.increment(-100000),
                gambling: true,
            })
        }
    })
}

function DoubleNothing() {
    var moneyinput = document.getElementById("double").value;

    if (/^[0-9]+$/.test(moneyinput)) {
        moneyinput = Math.round(Math.abs(Number(moneyinput)))
        db.ref(`users/${getUsername()}`).once("value", function(object) {
            if (moneyinput <= object.val().money) {
                if (Math.random() < 0.499 + (object.val().role == "gambler" ? 0.001 : 0)) {
                    if (moneyinput >= object.val().money * 0.5 && moneyinput >= 10000000 && object.val().role !== "pacifist") {
                        sendNotification(`${object.val().username} just won $${moneyinput} in Double-or-Nothing!`)
                    }
                    db.ref(`users/${getUsername()}`).update({
                        money: firebase.database.ServerValue.increment(moneyinput),
                    })
                    db.ref(`other/Casino/`).update({
                        money: firebase.database.ServerValue.increment(-moneyinput),
                    })
                } else {
                    if (moneyinput >= object.val().money * 0.5 && moneyinput >= 10000000 && object.val().role !== "pacifist") {
                        sendNotification(`${object.val().username} just lost $${moneyinput} in Double-or-Nothing!`)
                    }
                    db.ref(`users/${getUsername()}`).update({
                        money: firebase.database.ServerValue.increment(-moneyinput),
                    })
                    db.ref(`other/Casino/`).update({
                        money: firebase.database.ServerValue.increment(moneyinput),
                    })
                }
            }
        })
    }
}

function blackHit() {
    var moneyinput = document.getElementById("blackjack").value;

    if (/^[0-9]+$/.test(moneyinput)) {
        moneyinput = Math.round(Math.abs(moneyinput));
        
        db.ref(`users/${getUsername()}`).once("value", function(object) {
            var player_hand = document.getElementById("player");
            var deck = [1,2,3,4,5,6,7,8,9,10,10,10,10];

            if (!document.getElementById('blackjack').disabled && object.val().money >= moneyinput) {
                document.getElementById("dealer").innerHTML = "";
                var card_1 = deck[Math.floor(Math.random()*deck.length)];
                var card_2 = deck[Math.floor(Math.random()*deck.length)];
                if (card_1 == 1) {
                    card_1 = 11;
                } else if (card_2 == 1) {
                    card_1 = 11;
                }

                player_hand.innerHTML = `${card_1} + ${card_2}`
                document.getElementById('blackjack').disabled = true;
                db.ref(`users/${getUsername()}`).update({
                    money: firebase.database.ServerValue.increment(-moneyinput),
                })
            } else {
                var hand = player_hand.innerHTML.split(" + ");
                var sum = 0;
                var card = deck[Math.floor(Math.random()*deck.length)];

                hand.forEach( num => {
                    sum += parseInt(num);
                })

                if (card == 1 && 11 + sum <= 21) {
                    card = 11
                }

                if (hand.includes("11") && sum + card > 21) {
                    hand[hand.indexOf("11")] = "1";
                }

                if (sum <= 21) {
                    player_hand.innerHTML = `${hand.map(item => `${item}`).join(' + ')} + ${card}`
                }
            }
        })
    }
}

function blackStand() {
    var player_hand = document.getElementById("player");
    var moneyinput = document.getElementById("blackjack").value;
    moneyinput = Math.round(Math.abs(moneyinput));
    var deck = [1,2,3,4,5,6,7,8,9,10,10,10,10];
    var dealer = [];
    var hand = 0;

    if (document.getElementById('blackjack').disabled) {
        while (hand < 17) {
            var card = deck[Math.floor(Math.random()*deck.length)];
            if (card == 1 && card + hand <= 21) {
                card = 11;
            }
            if (dealer.includes(11) && hand + card > 21) {
                dealer[dealer.indexOf(11)] = 1;
                hand -= 10;
            }
            hand += card;
            dealer.push(card)
        }

        document.getElementById("dealer").innerHTML = dealer.map(item => `${item}`).join(' + ');

        var player_hand_value = player_hand.innerHTML.split(" + ");
        var sum = 0;
        player_hand_value.forEach( num => {
            sum += parseInt(num);
        })

        db.ref(`users/${getUsername()}`).once("value", function(object) {
            if (hand <= 21 && hand > sum) {
                document.getElementById('blackjack').disabled = false;
                document.getElementById('blackjack').value = "";
                document.getElementById("dealer").innerHTML += " Won";
                document.getElementById("player").innerHTML += " Lost";
                if (moneyinput > object.val().money * 0.5 && moneyinput >= 10000000 && object.val().role !== "pacifist") {
                    sendNotification(`${object.val().username} just lost $${moneyinput} in Blackjack!`)
                }
                db.ref(`other/Casino/`).update({
                    money: firebase.database.ServerValue.increment(moneyinput),
                })
            } else if (sum > 21) {
                document.getElementById('blackjack').disabled = false;
                document.getElementById('blackjack').value = "";
                document.getElementById("dealer").innerHTML += " Won";
                document.getElementById("player").innerHTML += " Lost";
                if (moneyinput > object.val().money * 0.5 && moneyinput >= 10000000 && object.val().role !== "pacifist") {
                    sendNotification(`${object.val().username} just lost $${moneyinput} in Blackjack!`)
                }
                db.ref(`other/Casino/`).update({
                    money: firebase.database.ServerValue.increment(moneyinput),
                })
            } else if (hand == sum) {
                document.getElementById('blackjack').disabled = false;
                db.ref(`users/${getUsername()}`).update({
                    money: firebase.database.ServerValue.increment(moneyinput),
                })
                document.getElementById('blackjack').value = "";
                document.getElementById("dealer").innerHTML += " Tied";
                document.getElementById("player").innerHTML += " Tied";
                if (moneyinput > object.val().money * 0.5 && moneyinput >= 10000000 && object.val().role !== "pacifist") {
                    sendNotification(`${object.val().username} just tied with $${moneyinput} in Blackjack!`)
                }
            } else if (hand <= 21 && sum > hand) {
                document.getElementById('blackjack').disabled = false;
                db.ref(`users/${getUsername()}`).update({
                    money: firebase.database.ServerValue.increment(moneyinput * 2),
                })
                db.ref(`other/Casino/`).update({
                    money: firebase.database.ServerValue.increment(-moneyinput),
                })
                document.getElementById('blackjack').value = "";
                document.getElementById("dealer").innerHTML += " Lost";
                document.getElementById("player").innerHTML += " Won";
                if (moneyinput > object.val().money * 0.5 && moneyinput >= 10000000 && object.val().role !== "pacifist") {
                    sendNotification(`${object.val().username} just won $${moneyinput} in Blackjack!`)
                }
            } else if (hand > 21) {
                document.getElementById('blackjack').disabled = false;
                db.ref(`users/${getUsername()}`).update({
                    money: firebase.database.ServerValue.increment(moneyinput * 2),
                })
                db.ref(`other/Casino/`).update({
                    money: firebase.database.ServerValue.increment(-moneyinput),
                })
                document.getElementById('blackjack').value = "";
                document.getElementById("dealer").innerHTML += " Lost";
                document.getElementById("player").innerHTML += " Won";
                if (moneyinput > object.val().money * 0.5 && moneyinput >= 10000000 && object.val().role !== "pacifist") {
                    sendNotification(`${object.val().username} just won $${moneyinput} in Blackjack!`)
                }
            }
        })
    }
}

function ultimateGamble() {
    db.ref(`users/${getUsername()}`).once("value", function(user_object) {
        db.ref(`other/Casino`).once("value", function(casino_object) {
            if (user_object.val().money >= 0) {
                if (Math.random() <= Math.min(6 ** ((4.9 * (user_object.val().money - casino_object.val().money * 1.05)) / casino_object.val().money), 0.5) && user_object.val().money > 0.0001 * casino_object.val().money) {
                    db.ref(`users/${getUsername()}`).update({
                        money: firebase.database.ServerValue.increment(casino_object.val().money),
                    })
                    db.ref(`other/Casino/`).update({
                        money: firebase.database.ServerValue.increment(-casino_object.val().money),
                    })

                    if (casino_object.val().money >= 10000000 && user_object.val().role !== "pacifist") {
                        sendNotification(`${getUsername()} has just won the Ultimate Gamble!`);
                    }
                } else {
                    db.ref(`users/${getUsername()}`).update({
                        money: firebase.database.ServerValue.increment(-user_object.val().money),
                    })
                    db.ref(`other/Casino/`).update({
                        money: firebase.database.ServerValue.increment(user_object.val().money),
                    })

                    if (user_object.val().money >= 100000000 && user_object.val().role !== "pacifist") {
                        sendNotification(`${getUsername()} has just lost the Ultimate Gamble!`);
                    }
                }
            }
        })
    })
}

function Roles() {
    db.ref("other/policy/list").once("value", function(policy_object) {
        db.ref("users/").once("value", function(user_objects) {
            db.ref(`users/${getUsername()}`).once("value", function(object) {
                if (object.val().role) {
                    var citizens = 0;
                    var police = 0;
                    var gamblers = 0;
                    var angels = 0;
                    var tellers = 0;
                    var pacifists = 0;
                    var jesters = 0;
                    var diviners = 0;
                    var councils = 0;
                    user_objects.forEach(function(username) {
                        var role = username.val().role;
                        if (role === "citizen") {
                            citizens++;
                        } else if (role === "police") {
                            police++;
                        } else if (role === "gambler") {
                            gamblers++;
                        } else if (role === "angel") {
                            angels++;
                        } else if (role === "bank") {
                            tellers++;
                        } else if (role === "pacifist") {
                            pacifists++;
                        } else if (role === "jester") {
                            jesters++;
                        } else if (role === "diviner") {
                            diviners++;
                        } else if (role === "council") {
                            councils++;
                        }
                    })

                    showPopUp(`Welcome to the Donationville! Role: <span id="current-role">${object.val().role}</span>`,`
                    <h3>Citizen (${citizens})</h3><hr>
                    Pros:<ul>
                        <li>can take part in society</li>
                        <li>can take out loans</li>
                    </ul>
                    Cons:<ul>
                        <li>pay taxes</li>
                    </ul>
                    <button style="font-size:2vh" onclick="loanRequest()">Select</button>

                    <h3>Police Officer (${police} / 5)</h3><hr>
                    Pros:<ul>
                        ${policy_object.val()[1] ? "" : "<li>don't have to pay taxes</li>"}
                        <li>confiscate what criminals have stolen</li>
                    </ul>
                    Cons:<ul>
                        <li>criminals hate you</li>
                        ${policy_object.val()[5] ? "<li>arresting the jester will cause you to reset back to complete 0</li>" : ""}
                    </ul>
                    <button style="font-size:2vh" onclick="policeRole()">Select</button> $10,000,000

                    <h3>Gambler (${gamblers} / 5)</h3><hr>
                    Pros:<ul>
                        <li>have higher luck when gambling</li>
                        <li>role will show up as citizen for everyone else</li>
                    </ul>
                    Cons:<ul>
                        <li>can no longer buy, gift, or remove autos, mult, or money</li>
                    </ul>
                    <button style="font-size:2vh" onclick="gamblerRole()">Select</button> $5,000,000

                    <h3>Angel (${angels} / 1)</h3><hr>
                    Pros:<ul>
                        <li>can see the good and bad deeds of everyone</li>
                        <li>can give divine retribution to evildoers</li>
                        <li>has a fixed higher chance of getting frenzy every second</li>
                    </ul>
                    Cons:<ul>
                        <li>can no longer destroy auto, mult, or money (but what kind of angel would do that, right?)</li>
                    </ul>
                    <button style="font-size:2vh" onclick="angelRole()">Select</button> $15,000,000 and a good heart

                    <h3>Bank Teller (${tellers} / 3)</h3><hr>
                    Pros:<ul>
                        <li>you can accept loans that people request</li>
                        <li>gain the money that would be interest</li>
                        <li>can put people into crippling debt</li>
                        ${policy_object.val()[2] ? "" : "<li>don't have to pay taxes</li>"}
                    </ul>
                    Cons:<ul>
                        <li>not many people make loans</li>
                        <li>your wage is dependent on the interest that the loaner is acceptable with</li>
                    </ul>
                    <button style="font-size:2vh" onclick="bankRole()">Select</button> $5,000,000

                    <h3>Criminal</h3><hr>
                    Pros:<ul>
                        <li>role will show up as citizen for everyone else</li>
                        <li>can steal autoclickers or mult on a cooldown</li>
                        <li>stealing auto, mult, or money is not notified server-wide</li>
                    </ul>
                    Cons:<ul>
                        <li>EVERYONE IS OUT TO GET YOU:</li>
                        <li>citizens will have a grudge against you and potentially destroy what you gained out of spite if they find out who stole from them</li>
                        <li>police officers will be on a hunt for you as they get to confiscate what you have stolen</li>
                        <li>cannot go back to being a citizen unless arrested</li>
                        <li>your autoclickers, mult, and money will all get halved when you get arrested</li>
                        ${policy_object.val()[3] ? "<li>stealing is considered a sin</li>" : ""}
                    </ul>
                    <button style="font-size:2vh"  onclick="criminalRole()">Select</button> $2,500,000
                    
                    <h3>Pacifist (${pacifists} / 2)</h3><hr>
                    Pros:<ul>
                        <li>other users cannot destroy, steal, or divine retribute you</li>
                        <li>don't have to pay taxes</li>
                        <li>Everyone except diviners have no way of knowing your money, mult, auto, etc</li>
                    </ul>
                    Cons:<ul>
                        <li>other users cannot gift mult, autos, or money to you</li>
                        <li>you cannot gift mult, autos, or money to other users</li>
                        <li>you cannot destroy mult, auto, or money from other users</li>
                        <li>you can no longer take out loans</li>
                        <li>you can no longer see the leaderboard</li>
                    </ul>
                    <button style="font-size:2vh"  onclick="pacifistRole()">Select</button> $10,000,000 and a pacifist mindset
                    
                    <h3>Jester (${jesters} / 2)</h3><hr>
                    Pros:<ul>
                        <li>role will show up as citizen for everyone else on default</li>
                        <li>can send custom notifications</li>
                        <li>can edit the money, auto, mult, gambling, and role of yourself on the leaderboard</li>
                    </ul>
                    Cons:<ul>
                        <li>no one takes you seriously</li>
                    </ul>
                    <button style="font-size:2vh"  onclick="jesterRole()">Select</button> $6,666,666 and a goal to make people laugh
                    
                    <h3>Diviner (${diviners} / 3)</h3><hr>
                    Pros:<ul>
                        <li>on a cooldown, you can reveal everything about one person (true role, abilities, etc)</li>
                    </ul>
                    Cons:<ul>
                        <li>no one believes in "oracles"</li>
                    </ul>
                    <button style="font-size:2vh"  onclick="divinerRole()">Select</button> $5,000,000
                    
                    <h3>Council Member (${councils} / 5)</h3><hr>
                    Pros:<ul>
                        <li>you can change the fundamental rules that govern the universe (donations)</li>
                        ${policy_object.val()[6] ? "" : "<li>don't have to pay taxes</li>"}
                    </ul>
                    Cons:<ul>
                        <li>everyone hates you if you are corrupt</li>
                    </ul>
                    <button style="font-size:2vh"  onclick="councilRole()">Select</button> $20,000,000
                    <button style="font-size:2vh"  onclick="currentPolicies()">See Current Policies</button>`);
                } else if (object.val().money >= 2500000) {
                    db.ref(`users/${getUsername()}`).update({
                        money: firebase.database.ServerValue.increment(-2500000),
                        role: "citizen",
                    })
                }
            })
        })
    })
}

function loanRequest() {
    db.ref(`users/${getUsername()}`).once("value", function(object) {
        document.getElementById("popupHeading").innerHTML = "Loan Menu";
        document.getElementById("popupBody").innerHTML = `
            TAKE INTO ACCOUNT THAT YOUR LOAN REQUEST MUST BE ACCEPTED BY SOMEONE SO IT MUST BE REASONABLE<br>
            Amount of money you request to be loaned to you: $<input type="text" id="loanmoney"><br>
            The interest that you are willing to pay at the deadline: %<input type="text" id="loaninterest"><br>
            The loan term that you are willing to take: <input type="text" id="loantime"> hours<br>
            <button style="font-size:2vh" onclick="takeLoan()">Request Loan</button>
            <span id="loanstatus"></span>`

        if (object.val().loan) {
            document.getElementById("loanmoney").value = object.val().loan[0] || "";
            document.getElementById("loaninterest").value = object.val().loan[1] || "";
            document.getElementById("loantime").value = object.val().loan[2] || "";
            document.getElementById("loanstatus").innerHTML = object.val().loan[4] ? `Your loan was accepted by ${object.val().loan[4][1]}` : `Your loan is still waiting to be accepted`;
        }
    })
}

function takeLoan() {
    db.ref(`users/${getUsername()}`).once("value", function(object) {
        var money = parseInt(document.getElementById("loanmoney").value);
        var interest = parseInt(document.getElementById("loaninterest").value);
        var hours = parseInt(document.getElementById("loantime").value);

        if (/^[0-9]+$/.test(money) && money !== "" && /^[0-9]+$/.test(interest) && interest !== "" && /^[0-9]+$/.test(hours) && hours !== "") {
            if (object.val().loan && Date.now() - (object.val().loan[3] || 0) < 600000) {
                alert("You are requesting loans too quickly");
                return;
            } else if (object.val().loan && object.val().loan[1] < 0) {
                alert("You cannot have a negative interest");
                return;
            }

            db.ref(`users/${getUsername()}`).update({
                loan: [Math.abs(money),Math.abs(interest),Math.abs(hours),Date.now(),false],
            })
            alert("successfully requested loan");
            
            document.getElementById("popup").remove();
        }
    })
}

function policeRole() {
    db.ref("other/policy/list").once("value", function(policy_object) {
        db.ref("users/").once("value", function(user_objects) {
            db.ref(`users/${getUsername()}`).once("value", function(object) {
                var police = 0;
                user_objects.forEach(function(username) {
                    var role = username.val().role;
                    if (role === "police") {
                        police++;
                    }
                })
                if (object.val().role == "citizen") {
                    if (police >= 5) {
                        alert("Max amount of police officers");
                        return;
                    } else if (object.val().barred) {
                        alert("They don't want to hire incompetent police officers");
                        return;
                    }
                    if (object.val().money >= 10000000) {
                        db.ref(`users/${getUsername()}`).update({
                            role: "police",
                            money: firebase.database.ServerValue.increment(-10000000),
                            strike: 0,
                        })
                    }
                } else if (object.val().role == "police") {
                    var date = Date.now();

                    document.getElementById("popupHeading").innerHTML = "Police Menu";
                    document.getElementById("popupBody").innerHTML = `
                    <h2>Investigate</h2>
                    <hr>
                    <select id="investigateselect"></select>
                    <button style="font-size:2vh" onclick="investigate()">Investigate</button>
                    <span id="investigatechances">${3 - Math.ceil((((object.val().ability1sleep || date) <= date ? date : object.val().ability1sleep) - date) / 3600000)} chances available</span><br>
                    Investigate people to see if they are a criminal before arresting them. Inconclusive investigations may mean that they are a criminal, but it doesn't always mean that they are a criminal. Some investigations on citizens can be inconclusive as well.
                    <br><br>
                    
                    <h2>Arrest</h2>
                    <hr>
                    <select id="arrestselect"></select>
                    <button style="font-size:2vh" onclick="arrest()">Arrest</button>
                    <span id="strikecount">${object.val().strike} strikes out of 3</span><br>
                    If you are sure that someone is a criminal, select them here and arrest them. Be sure to not arrest an innocent accidentally, the precinct isn't lenient with incompetent police officers. ${policy_object.val()[5] ? "(NOTE THAT ARRESTING THE JESTER WILL CAUSE YOU TO RESET BACK TO 0: 0 MONEY, 0 AUTOCLICKERS, 0 MULT, ETC.)" : ""}`;

                    investigateselector = document.getElementById("investigateselect");
                    investigateselector.innerHTML = `<option value="" selected disabled>Select an option</option>`;
                    arrestselector = document.getElementById("arrestselect");
                    arrestselector.innerHTML = `<option value="" selected disabled>Select an option</option>`;

                    db.ref("users/").once("value", function(user_objects) {
                        user_objects.forEach(function(username) {
                            if (username.val().role !== "pacifist") {
                                investigateoption = document.createElement("option");
                                investigateoption.value = username.key;
                                investigateoption.innerHTML = username.val().username;
                                investigateselector.appendChild(investigateoption);

                                arrestoption = document.createElement("option");
                                arrestoption.value = username.key;
                                arrestoption.innerHTML = username.val().username;
                                arrestselector.appendChild(arrestoption);
                            }
                        })
                    });
                }
            })
        })
    })
}

function investigate() {
    var target = document.getElementById("investigateselect").value;

    db.ref(`users/${getUsername()}`).once("value", function(user_object) {
        db.ref(`users/${target}`).once("value", function(object) {
            if (target !== "") {
                var date = Date.now()

                if (((user_object.val().ability1sleep || date) <= date ? date : user_object.val().ability1sleep) - 7200000 >= date) {
                    alert("Investigating is on cooldown");
                    return;
                }

                var chance = Math.random()
                db.ref(`users/${getUsername()}`).update({
                    ability1sleep: ((user_object.val().ability1sleep || date) <= date ? date : user_object.val().ability1sleep) + 3600000
                }).then(() => {
                    document.getElementById("investigatechances").innerHTML = `${3 - Math.ceil((((object.val().ability1sleep || date) <= date ? date : object.val().ability1sleep) - date) / 3600000)} chances available`;
                })

                if (object.val().role == "criminal") {
                    alert("Results were inconclusive");
                } else {
                    if (chance >= 0.5) {
                        alert("Results were inconclusive");
                    } else {
                        alert("They were not a criminal");
                    }
                }
            }
        })
    })
}

function arrest() {
    var target = document.getElementById("arrestselect").value;

    db.ref(`other/policy/list/5`).once("value", function(policy_object) {
        db.ref(`users/${getUsername()}`).once("value", function(user_object) {
            db.ref(`users/${target}`).once("value", function(object) {
                if (target !== "") {
                    if (object.val().role == "criminal") {
                        db.ref(`users/${getUsername()}`).update({
                            autoclicker: firebase.database.ServerValue.increment(object.val().stolenauto || 0),
                            mult: firebase.database.ServerValue.increment(object.val().stolenmult || 0),
                        })
                        db.ref(`users/${target}`).update({
                            stolenauto: 0,
                            stolenmult: 0,
                            role: "citizen",
                            autoclicker: Math.round(object.val().autoclicker * 0.5),
                            mult: Math.round(object.val().mult * 0.5),
                            money: Math.round(object.val().money * 0.5),
                        })
                        sendNotification(`${getUsername()} arrested ${target} and confiscated ${object.val().stolenauto || 0} autoclicker(s) and ${object.val().stolenmult || 0} mult`);
                        alert(`Successfully arrested ${target}`);
                    } else if (object.val().role == "jester" && policy_object.val()) {
                        const keptKeys = ["active", "admin", "muted", "name", "password", "sleep", "username", "xss", "trapped", "profilesleep", "active_effect", "effects", "id"];

                        user_object.forEach(key => {
                            if (!keptKeys.includes(key.key)) {
                                db.ref(`users/${getUsername()}/${key.key}`).remove();
                            }
                        })

                        sendNotification(`${getUsername()} incorrectly arrested the Jester`);
                        document.getElementById("popup").remove();
                        alert("You arrested the Jester and zenlossed");
                    } else {
                        db.ref(`users/${getUsername()}`).update({
                            strike: firebase.database.ServerValue.increment(1),
                        })

                        if (user_object.val().strike >= 2) {
                            db.ref(`users/${getUsername()}`).update({
                                strike: 0,
                                role: "citizen",
                                barred: true,
                            })
                            db.ref(`users/${getUsername()}/ability1sleep`).remove();
                            document.getElementById("popup").remove();
                            sendNotification(`${getUsername()} was fired as a police officer due to incompetency`);
                            alert("You were fired due to incompetency");
                            return;
                        }

                        document.getElementById("strikecount").innerHTML = `${user_object.val().strike + 1} strikes out of 3`;
                        sendNotification(`${getUsername()} incorrectly arrested ${target}`);
                        alert("Wrong Arrest!");
                    }
                }
            })
        })
    })
}

function gamblerRole() {
    db.ref("users/").once("value", function(user_objects) {
        db.ref(`users/${getUsername()}`).once("value", function(object) {
            var gamblers = 0;
            user_objects.forEach(function(username) {
                var role = username.val().role;
                if (role === "gambler") {
                    gamblers++;
                }
            })
            if (object.val().role == "citizen") {
                if (gamblers >= 5) {
                    alert("Max amount of gamblers");
                    return;
                }
                if (object.val().money >= 5000000) {
                    db.ref(`users/${getUsername()}`).update({
                        role: "gambler",
                        money: firebase.database.ServerValue.increment(-5000000),
                    }).then(() => {
                        window.location.reload();
                    })
                }
            }
        })
    })
}

function gamblerLoader() {
    document.getElementById("attacking").remove();
    document.getElementById("gifting").remove();
    document.getElementById("clicky-button").remove();
    document.getElementById("autobuy").remove();
    document.getElementById("multbuy").remove();
}

function angelRole() {
    db.ref("users/").once("value", function(user_objects) {
        db.ref(`users/${getUsername()}`).once("value", function(object) {
            var angels = 0;
            user_objects.forEach(function(username) {
                var role = username.val().role;
                if (role === "angel") {
                    angels++;
                }
            })
            if (object.val().role == "citizen") {
                if (angels >= 1) {
                    alert("Max amount of angels");
                    return;
                }
                if (object.val().money >= 15000000 && object.val().deeds >= 1000) {
                    db.ref(`users/${getUsername()}`).update({
                        role: "angel",
                        money: firebase.database.ServerValue.increment(-15000000),
                    })
                }
            } else if (object.val().role == "angel") {
                var date = Date.now();

                document.getElementById("popupHeading").innerHTML = "Angel Menu";
                document.getElementById("popupBody").innerHTML = `
                    <h2>Divine Retribution</h2>
                    <hr>
                    <select id="divineselect"></select>
                    <button style="font-size:2vh" onclick="divinePunishment()">Punish</button>
                    <span id="divinecooldown">${Math.ceil((((object.val().ability1sleep || date) <= date ? date : object.val().ability1sleep) - date) / 86400000) == 1 ? "Divine retribution is on cooldown" : ""}</span>`;

                divineselector = document.getElementById("divineselect");
                divineselector.innerHTML = `<option value="" selected disabled>Select an option</option>`;

                db.ref("users/").once("value", function(user_objects) {
                    user_objects.forEach(function(username) {
                        if (username.val().deeds < 0) {
                            divineoption = document.createElement("option");
                            divineoption.value = username.key;
                            divineoption.innerHTML = username.val().username;
                            divineselector.appendChild(divineoption);
                        }
                    })
                });
            }
        })
    })
}

function divinePunishment() {
    var divineselector = document.getElementById("divineselect");
    var roulette = ["autoclicker", "mult", "money"];
    roulette = roulette[Math.floor(Math.random() * roulette.length)]

    db.ref(`users/${getUsername()}`).once("value", function(user_object) {
        db.ref(`users/${divineselector.value}`).once("value", function(sinner) {
            var date = Date.now();

            if (sinner.val().deeds >= 0) {
                alert("The target is not a sinner");
                return;
            } else if (((user_object.val().ability1sleep || date) <= date ? date : user_object.val().ability1sleep) > date) {
                alert("Divine retribution is on cooldown");
                return;
            }

            document.getElementById("divinecooldown").innerHTML = "Divine retribution is on cooldown";
            db.ref(`users/${getUsername()}`).update({
                ability1sleep: ((user_object.val().ability1sleep || date) <= date ? date : user_object.val().ability1sleep) + 86400000
            })
            db.ref(`users/${divineselector.value}`).update({
                [roulette]: Math.round(sinner.val()[roulette] * 0.5)
            })
            sendNotification(`${getUsername()} used Divine Retribution on ${target} and halved their ${roulette}!`);
            alert(`Punished ${divineselector.value}'s ${roulette}`);
        })
    })
}

function bankRole() {
    db.ref("users/").once("value", function(user_objects) {
        db.ref(`users/${getUsername()}`).once("value", function(object) {
            var tellers = 0;
            user_objects.forEach(function(username) {
                var role = username.val().role;
                if (role === "bank") {
                    tellers++;
                }
            })
            if (object.val().role == "citizen") {
                if (tellers >= 3) {
                    alert("Max amount of bank tellers");
                    return;
                }
                if (object.val().money >= 5000000) {
                    db.ref(`users/${getUsername()}`).update({
                        role: "bank",
                        money: firebase.database.ServerValue.increment(-5000000),
                    })
                }
            } else if (object.val().role == "bank") {
                document.getElementById("popupHeading").innerHTML = "Bank Teller Menu";
                document.getElementById("popupBody").innerHTML = `
                    <h2>Available Loan Requests</h2>
                    <hr>
                    <select id="bankselect"></select>
                    <button style="font-size:2vh" onclick="acceptLoan()">Accept</button>
                    <span id="currentcust"></span>
                    
                    <h2>Currently Accepted Loans</h2>
                    <hr>
                    <select id="bankaccept"></select>
                    <button style="font-size:2vh" onclick="collectLoan()">Collect Loan</button>
                    <span id="currentloan"></span>`;

                var bankselector = document.getElementById("bankselect");
                bankselector.innerHTML = `<option value="" selected disabled>Select an option</option>`;
                bankselector.addEventListener("change", function(event) {
                    db.ref(`users/${bankselector.value}`).once("value", function(cust_object) {
                        document.getElementById("currentcust").innerHTML = `
                            ${bankselector.value} is requesting $${cust_object.val().loan[0]} with a ${cust_object.val().loan[1]}% interest after ${cust_object.val().loan[2]} hours`;
                    })
                })

                var loanselector = document.getElementById("bankaccept");
                loanselector.innerHTML = `<option value="" selected disabled>Select an option</option>`;
                loanselector.addEventListener("change", function(event) {
                    db.ref(`users/${loanselector.value}`).once("value", function(cust_object) {
                        document.getElementById("currentloan").innerHTML = `
                            ${loanselector.value} requested $${cust_object.val().loan[0]} with a ${cust_object.val().loan[1]}% interest.
                            ${cust_object.val().loan[2] < Date.now() ? `${loanselector.value}'s loan is ready to be collected` : `${loanselector.value}'s loan cannot be collected yet, but can be in ${Math.round((cust_object.val().loan[2] - Date.now()) / 3600000)} hours`}`;
                    })
                })

                db.ref("users/").once("value", function(user_objects) {
                    user_objects.forEach(function(username) {
                        if (username.val().loan && !username.val().loan[4]) {
                            var bankoption = document.createElement("option");
                            bankoption.value = username.key;
                            bankoption.innerHTML = username.val().username;
                            bankselector.appendChild(bankoption);
                        }

                        if (username.val().loan && username.val().loan[4][0] == object.val().id) {
                            var bankoption = document.createElement("option");
                            bankoption.value = username.key;
                            bankoption.innerHTML = username.val().username;
                            loanselector.appendChild(bankoption);
                        }
                    })
                });
            }
        })
    })
}

function acceptLoan() {
    var bankselector = document.getElementById("bankselect");

    db.ref(`users/${bankselector.value}`).once("value", function(customer) {
        db.ref(`users/${getUsername()}`).once("value", function(object) {
            if (customer.val().loan[0] > object.val().money) {
                alert("You do not have the money to take on this loan");
                return;
            } else if (customer.val().loan[4]) {
                alert("This loan has already been accepted");
                return;
            }

            db.ref(`users/${bankselector.value}/loan`).update({
                2: customer.val().loan[2] * 3600000 + Date.now(),
                4: [object.val().id, getUsername()],
            })
            db.ref(`users/${bankselector.value}`).update({
                money: firebase.database.ServerValue.increment(customer.val().loan[0]),
            })
            db.ref(`users/${getUsername()}`).update({
                money: firebase.database.ServerValue.increment(-customer.val().loan[0]),
            })
            alert("Successfully accepted the loan")
        })
    })
}

function collectLoan() {
    var loanselector = document.getElementById("bankaccept");

    db.ref(`users/${loanselector.value}`).once("value", function(customer) {
        db.ref(`users/${getUsername()}`).once("value", function(object) {
            if (customer.val().loan[2] > Date.now()) {
                alert(`${loanselector.value}'s loan is not ready to be collected yet`);
                return;
            } else if (customer.val().loan[4][0] !== object.val().id) {
                alert("You are not the one that accepted this loan");
                return;
            }

            db.ref(`users/${loanselector.value}/loan`).remove()
            db.ref(`users/${getUsername()}`).update({
                money: firebase.database.ServerValue.increment(customer.val().loan[0] * (customer.val().loan[1] / 100 + 1)),
            })
            db.ref(`users/${loanselector.value}`).update({
                money: firebase.database.ServerValue.increment(-customer.val().loan[0] * (customer.val().loan[1] / 100 + 1)),
            })
            alert("Successfully collected the loan")
        })
    })
}

function criminalRole() {
    db.ref(`users/${getUsername()}`).once("value", function(object) {
        if (object.val().role == "citizen") {
            if (object.val().money >= 2500000) {
                db.ref(`users/${getUsername()}`).update({
                    role: "criminal",
                    money: firebase.database.ServerValue.increment(-2500000),
                })
            }
        } else if (object.val().role == "criminal") {
            var date = Date.now();

            document.getElementById("popupHeading").innerHTML = "Criminal Menu";
            document.getElementById("popupBody").innerHTML = `
            Stolen autoclickers: <span id="stolenauto">${object.val().stolenauto || 0}</span><br>
            Stolen mult: <span id="stolenmult">${object.val().stolenmult || 0}</span><br>
            Note: autos and mult stolen after 3 will be forever in your posession
            <h2>Steal Autoclickers</h2>
            <hr>
            <select id="autostealselect"></select>
            <button style="font-size:2vh" onclick="stealAuto()">Steal</button>
            <span id="autostealchances">${3 - Math.ceil((((object.val().ability1sleep || date) <= date ? date : object.val().ability1sleep) - date) / 3600000)} chances available</span>
            
            <h2>Steal Mult</h2>
            <hr>
            <select id="multstealselect"></select>
            <button style="font-size:2vh" onclick="stealMult()">Steal</button>
            <span id="multstealchances">${3 - Math.ceil((((object.val().ability2sleep || date) <= date ? date : object.val().ability2sleep) - date) / 3600000)} chances available</span>`;

            autostealselector = document.getElementById("autostealselect");
            autostealselector.innerHTML = `<option value="" selected disabled>Select an option</option>`
            multstealselector = document.getElementById("multstealselect");
            multstealselector.innerHTML = `<option value="" selected disabled>Select an option</option>`;

            db.ref("users/").once("value", function(user_objects) {
                user_objects.forEach(function(username) {
                    if (username.val().role !== "pacifist") {
                        autostealoption = document.createElement("option");
                        autostealoption.value = username.key;
                        autostealoption.innerHTML = username.val().username;
                        autostealselector.appendChild(autostealoption);

                        multstealoption = document.createElement("option");
                        multstealoption.value = username.key;
                        multstealoption.innerHTML = username.val().username;
                        multstealselector.appendChild(multstealoption);
                    }
                })
            });
        }
    })
}

function stealAuto() {
    var target = document.getElementById("autostealselect").value;

    db.ref(`other/policy/list/3`).once("value", function(policy_object) {
        db.ref(`users/${target}`).once("value", function(user_target) {
            db.ref(`users/${getUsername()}`).once("value", function(object) {
                if (target !== "") {
                    var date = Date.now();

                    if (((object.val().ability1sleep || date) <= date ? date : object.val().ability1sleep) - 7200000 >= date) {
                        alert("Stealing autoclickers is on cooldown");
                        return;
                    } else if (!user_target.val().autoclicker || user_target.val().autoclicker <= 0) {
                        alert("You cannot steal from the poor");
                        return;
                    }

                    var chances = Math.random();

                    db.ref(`users/${getUsername()}`).update({
                        ability1sleep: ((object.val().ability1sleep || date) <= date ? date : object.val().ability1sleep) + 3600000
                    }).then(() => {
                        document.getElementById("autostealchances").innerHTML = `${3 - Math.ceil((((object.val().ability1sleep || date) <= date ? date : object.val().ability1sleep) - date) / 3600000)} chances available`;
                    })

                    if (chances <= 0.5) {
                        if (object.val().stolenauto >= 3) {
                            db.ref(`users/${getUsername()}`).update({
                                autoclicker: firebase.database.ServerValue.increment(1),
                                deeds: firebase.database.ServerValue.increment(policy_object.val() ? -Math.round(100 * 1.2 ** (user_target.val().autoclicker - 1) * 0.0003) : 0),
                            })
                        } else {
                            db.ref(`users/${getUsername()}`).update({
                                stolenauto: ((object.val().stolenauto || 0) + 1),
                                deeds: firebase.database.ServerValue.increment(policy_object.val() ? -Math.round(100 * 1.2 ** (user_target.val().autoclicker - 1) * 0.0003) : 0),
                            }).then(() => {
                                document.getElementById("stolenauto").innerHTML = object.val().stolenauto;
                            })
                        }
                        db.ref(`users/${target}`).update({
                            autoclicker: firebase.database.ServerValue.increment(-1),
                        })
                        alert(`Successfully stole an autoclicker from ${target}`);
                    } else {
                        alert(`Failed to steal an autoclicker from ${target}`);
                    }
                }
            })
        })
    })
}

function stealMult() {
    var target = document.getElementById("multstealselect").value;

    db.ref(`other/policy/list/3`).once("value", function(policy_object) {
        db.ref(`users/${target}`).once("value", function(user_target) {
            db.ref(`users/${getUsername()}`).once("value", function(object) {
                if (target !== "") {
                    var date = Date.now();

                    if (((object.val().ability2sleep || date) <= date ? date : object.val().ability2sleep) - 7200000 >= date) {
                        alert("Stealing mult is on cooldown");
                        return;
                    } else if (!user_target.val().mult || user_target.val().mult <= 1) {
                        alert("You cannot steal from the poor");
                        return;
                    }

                    var chances = Math.random();

                    db.ref(`users/${getUsername()}`).update({
                        ability2sleep: ((object.val().ability2sleep || date) <= date ? date : object.val().ability2sleep) + 3600000
                    }).then(() => {
                        document.getElementById("multstealchances").innerHTML = `${3 - Math.ceil((((object.val().ability2sleep || date) <= date ? date : object.val().ability2sleep) - date) / 3600000)} chances available`;
                    })

                    if (chances <= 0.33) {
                        if (object.val().stolenmult >= 3) {
                            db.ref(`users/${getUsername()}`).update({
                                mult: firebase.database.ServerValue.increment(1),
                                deeds: firebase.database.ServerValue.increment(policy_object.val() ? -Math.round(250 * 1.4 ** (user_target.val().mult - 2) * 0.0003) : 0),
                            })
                        } else {
                            db.ref(`users/${getUsername()}`).update({
                                stolenmult: ((object.val().stolenmult || 0) + 1),
                                deeds: firebase.database.ServerValue.increment(policy_object.val() ? -Math.round(250 * 1.4 ** (user_target.val().mult - 2) * 0.0003) : 0),
                            }).then(() => {
                                document.getElementById("stolenmult").innerHTML = object.val().stolenauto;
                            })
                        }
                        db.ref(`users/${target}`).update({
                            mult: firebase.database.ServerValue.increment(-1),
                        })
                        alert(`Successfully stole mult from ${target}`);
                    } else {
                        alert(`Failed to steal mult from ${target}`);
                    }
                }
            })
        })
    })
}

function pacifistRole() {
    db.ref("users/").once("value", function(user_objects) {
        db.ref(`users/${getUsername()}`).once("value", function(object) {
            var pacifist = 0;
            user_objects.forEach(function(username) {
                var role = username.val().role;
                if (role === "pacifist") {
                    pacifist++;
                }
            })
            if (object.val().role == "citizen") {
                if (pacifist >= 2) {
                    alert("Max amount of pacifists");
                    return;
                }

                if (object.val().money >= 10000000 && typeof(object.val().deeds) == "undefined") {
                    db.ref(`users/${getUsername()}`).update({
                        role: "pacifist",
                        money: firebase.database.ServerValue.increment(-10000000),
                    }).then(() => {
                        window.location.reload();
                    })
                }
            }
        })
    })
}

function pacifistLoader() {
    document.getElementById("roles").remove();
    document.getElementById("notifications").remove();
    document.getElementById("attacking").remove();
    document.getElementById("gifting").remove();
}

function jesterRole() {
    db.ref("users/").once("value", function(user_objects) {
        db.ref(`users/${getUsername()}`).once("value", function(object) {
            db.ref(`userimages/${getUsername()}`).once("value", function(image_object) {
                var jesters = 0;
                user_objects.forEach(function(username) {
                    var role = username.val().role;
                    if (role === "jester") {
                        jesters++;
                    }
                })
                if (object.val().role == "citizen") {
                    if (jesters >= 2) {
                        alert("Max amount of jesters");
                        return;
                    }

                    if (object.val().money >= 6666666 && image_object.exists()) {
                        db.ref(`users/${getUsername()}`).update({
                            role: "jester",
                            money: firebase.database.ServerValue.increment(-6666666),
                        })
                    }
                } else if (object.val().role == "jester") {
                    var date = Date.now();

                    document.getElementById("popupHeading").innerHTML = "Jester Menu";
                    document.getElementById("popupBody").innerHTML = `
                        <h2>Leaderboard Manipulation</h2>
                        <hr>
                        Enable Fooling <input type="checkbox" id="leadercheck"><button style="font-size:2vh" onclick="jesterRefresh()">Refresh</button><br>
                        Fool Money<input type="number" id="jestermoney"><br>
                        Fool Autoclickers <input type="number" id="jesterauto"><br>
                        Fool Mult <input type="number" id="jestermult"><br>
                        Fool Gambling <input type="checkbox" id="jestergambling"><br>
                        Fool Deeds <input type="number" id="jesterdeed"><br>
                        Fool Role <select id="rolefool">
                            <option value="" selected disabled>Subject</option>
                            <option id="jestercitizen" value="citizen">Citizen</option>
                            <option id="jesterpolice" value="police">Police</option>
                            <option id="jesterangel" value="angel">Angel</option>
                            <option id="jesterbank" value="bank">Bank Teller</option>
                            <option id="jesterdiviner" value="diviner">Diviner</option>
                            <option id="jesterjester" value="jester">Jester</option>
                            <option id="jesternone" value="none">None</option>
                        </select>`;


                    document.getElementById("leadercheck").addEventListener("change", function(event) {
                        var fool_leaderboard = document.getElementById("leadercheck");
                        var fool_money = document.getElementById("jestermoney");
                        var fool_auto = document.getElementById("jesterauto");
                        var fool_mult = document.getElementById("jestermult");
                        var fool_gambling = document.getElementById("jestergambling");
                        var fool_deeds = document.getElementById("jesterdeed");
                        var fool_role = document.getElementById("rolefool");

                        if (document.getElementById("leadercheck").checked) {
                            if (/^[0-9]+$/.test(fool_money.value) && /^[0-9]+$/.test(fool_auto.value) && /^[0-9]+$/.test(fool_mult.value) && (fool_deeds.value.charAt(0) === "-" ? /^[0-9]+$/.test(fool_deeds.value.substring(1)) : /^[0-9]+$/.test(fool_deeds.value)) && fool_role.value !== "") {
                                db.ref(`users/${getUsername()}/ability1sleep`).update([fool_leaderboard.checked, parseInt(fool_money.value), parseInt(fool_auto.value), parseInt(fool_mult.value), fool_gambling.checked, parseInt(fool_deeds.value), fool_role.value]);
                            } else {
                                fool_leaderboard.checked = false;
                                alert("One of the needed values is not a number or is left blank");
                            }
                        } else {
                            db.ref(`users/${getUsername()}/ability1sleep`).remove();
                        }
                    })

                    db.ref("users/").once("value", function(user_objects) {if (user_objects.val()[getUsername()].ability1sleep) {
                            document.getElementById("leadercheck").checked = user_objects.val()[getUsername()].ability1sleep[0] || false;
                            document.getElementById("jestermoney").value = user_objects.val()[getUsername()].ability1sleep[1] || 0;
                            document.getElementById("jesterauto").value = user_objects.val()[getUsername()].ability1sleep[2] || 0;
                            document.getElementById("jestermult").value = user_objects.val()[getUsername()].ability1sleep[3] || 1;
                            document.getElementById("jestergambling").checked = user_objects.val()[getUsername()].ability1sleep[4] || false;
                            document.getElementById("jesterdeed").value = user_objects.val()[getUsername()].ability1sleep[5] || 0;
                            if (user_objects.val()[getUsername()].ability1sleep[5]) {
                                document.getElementById(`jester${user_objects.val()[getUsername()].ability1sleep[6]}`).selected = true;
                            }
                        }
                    });
                }
            })
        })
    })
}

function jesterRefresh() {
    var fool_leaderboard = document.getElementById("leadercheck");
    var fool_money = document.getElementById("jestermoney");
    var fool_auto = document.getElementById("jesterauto");
    var fool_mult = document.getElementById("jestermult");
    var fool_gambling = document.getElementById("jestergambling");
    var fool_deeds = document.getElementById("jesterdeed");
    var fool_role = document.getElementById("rolefool");

    if (document.getElementById("leadercheck").checked) {
        if (/^[0-9]+$/.test(fool_money.value) && /^[0-9]+$/.test(fool_auto.value) && /^[0-9]+$/.test(fool_mult.value) && (fool_deeds.value.charAt(0) === "-" ? /^[0-9]+$/.test(fool_deeds.value.substring(1)) : /^[0-9]+$/.test(fool_deeds.value)) && fool_role.value !== "") {
            db.ref(`users/${getUsername()}/ability1sleep`).update([fool_leaderboard.checked, parseInt(fool_money.value), parseInt(fool_auto.value), parseInt(fool_mult.value), fool_gambling.checked, parseInt(fool_deeds.value), fool_role.value]);
        } else {
            alert("One of the needed values is not a number or is left blank");
        }
    } else {
        alert("Cannot refresh fooling if fooling is not on");
    }
}

function divinerRole() {
    db.ref("users/").once("value", function(user_objects) {
        db.ref(`users/${getUsername()}`).once("value", function(object) {
            var diviners = 0;
            user_objects.forEach(function(username) {
                var role = username.val().role;
                if (role === "diviner") {
                    diviners++;
                }
            })
            if (object.val().role == "citizen") {
                if (diviners >= 3) {
                    alert("Max amount of diviners");
                    return;
                }
                if (object.val().money >= 5000000) {
                    db.ref(`users/${getUsername()}`).update({
                        role: "diviner",
                        money: firebase.database.ServerValue.increment(-5000000),
                    })
                }
            } else if (object.val().role == "diviner") {
                var date = Date.now();

                document.getElementById("popupHeading").innerHTML = "Divininator Menu";
                document.getElementById("popupBody").innerHTML = `
                    <h2>Use Your Third-Eye</h2>
                    <hr>
                    <select id="divinerselect"></select>
                    <button style="font-size:2vh" onclick="divinerSight()">Appraisal</button><span id="appraisalchances">${3 - Math.ceil((((object.val().ability1sleep || date) <= date ? date : object.val().ability1sleep) - date) / 3600000)} chances available</span><br>
                    <span id="currentappraisal"></span>`;

                var divinerselector = document.getElementById("divinerselect");
                divinerselector.innerHTML = `<option value="" selected disabled>Select an option</option>`;

                db.ref("users/").once("value", function(user_objects) {
                    user_objects.forEach(function(username) {
                        if (username !== getUsername()) {
                            var divineroption = document.createElement("option");
                            divineroption.value = username.key;
                            divineroption.innerHTML = username.val().username;
                            divinerselector.appendChild(divineroption);
                        }
                    })
                });
            }
        })
    })
}

function divinerSight() {
    var target = document.getElementById("divinerselect").value;

    if (target !== "") {
        db.ref(`users/${getUsername()}`).once("value", function(user_object) {
            db.ref(`users/${target}`).once("value", function(object) {
                var date = Date.now()

                if (((user_object.val().ability1sleep || date) <= date ? date : user_object.val().ability1sleep) - 7200000 >= date) {
                    alert("Third-Eye is on cooldown");
                    return;
                }

                db.ref(`users/${getUsername()}`).update({
                    ability1sleep: ((user_object.val().ability1sleep || date) <= date ? date : user_object.val().ability1sleep) + 3600000
                }).then(() => {
                    document.getElementById("appraisalchances").innerHTML = `${3 - Math.ceil((((user_object.val().ability1sleep || date) <= date ? date : user_object.val().ability1sleep) - date) / 3600000)} chances available`;
                })

                document.getElementById("currentappraisal").innerHTML = `
                    Money: ${object.val().money || 0}<br>
                    Autoclickers: ${object.val().autoclicker || 0}<br>
                    Mult: ${object.val().mult || 1}<br>
                    Gambling: ${object.val().gambling ? "Unlocked" : "Locked"}<br>
                    Deeds: ${object.val().deeds || 0}<br>
                    ${typeof(object.val().role) == "undefined" ? "": "Role: " + object.val().role + "<br>"}`;

                if (object.val().loan) {
                    var creation = new Date(object.val().loan[3])
                    var creationTime = (creation.getMonth() + 1) + "/" + creation.getDate() + "/" + creation.getFullYear() + " " + creation.getHours().toString().padStart(2, '0') + ":" + creation.getMinutes().toString().padStart(2, '0');
                    var acceptanceTime = false;

                    if (object.val().loan[4]) {
                        var acceptance = new Date(object.val().loan[2])
                        acceptanceTime = (acceptance.getMonth() + 1) + "/" + acceptance.getDate() + "/" + acceptance.getFullYear() + " " + acceptance.getHours().toString().padStart(2, '0') + ":" + acceptance.getMinutes().toString().padStart(2, '0');
                    }

                    document.getElementById("currentappraisal").innerHTML += `
                    Loans:<ul>
                        <li>Amount Requested: $${object.val().loan[0]}</li>
                        <li>Interest: ${object.val().loan[1]}%</li>
                        ${acceptanceTime ? `<li>Loan accepted by ${object.val().loan[4][1]}</li>` : ""}
                        <li>${acceptanceTime ? `Loan Deadline: ${acceptanceTime}` : `Hours Requested: ${object.val().loan[2]}`}</li>
                        <li>Loan Creation Time: ${creationTime}</li>
                    </ul>`;
                }

                if (object.val().barred) {
                    document.getElementById("currentappraisal").innerHTML += `${target} was a former police officer but was fired<br>`;
                }

                if (object.val().role == "police") {
                    document.getElementById("currentappraisal").innerHTML += `
                    Strikes: ${object.val().strike}<br>
                    Investigations Available: ${3 - Math.ceil((((object.val().ability1sleep || date) <= date ? date : object.val().ability1sleep) - date) / 3600000)}`;
                } else if (object.val().role == "angel") {
                    document.getElementById("currentappraisal").innerHTML += `Divine Retributions Available: ${Math.ceil((((object.val().ability1sleep || date) <= date ? date : object.val().ability1sleep) - date) / 86400000) == 1 ? "0" : "1"}`;
                } else if (object.val().role == "criminal") {
                    document.getElementById("currentappraisal").innerHTML += `
                    Autoclicker Steal Chances Available: ${3 - Math.ceil((((object.val().ability1sleep || date) <= date ? date : object.val().ability1sleep) - date) / 3600000)}<br>
                    Mult Steal Chances Available: ${3 - Math.ceil((((object.val().ability2sleep || date) <= date ? date : object.val().ability2sleep) - date) / 3600000)}<br>
                    Autoclickers Stolen: ${object.val().stolenauto}<br>
                    Mult Stolen: ${object.val().stolenmult}<br>`;
                } else if (object.val().role == "jester") {
                    document.getElementById("currentappraisal").innerHTML += `
                    Fooling: ${object.val().ability1sleep[0] ? "On" : "Off"}<br>
                    Fooled Money: ${object.val().ability1sleep[1]}<br>
                    Fooled Autoclickers: ${object.val().ability1sleep[2]}<br>
                    Fooled Mult: ${object.val().ability1sleep[3]}<br>
                    Fooled Gambling: ${object.val().ability1sleep[4] ? "Unlocked" : "Locked"}<br>
                    Fooled Deeds: ${object.val().ability1sleep[5]}<br>
                    Fooled Role: ${object.val().ability1sleep[6]}`;
                }
            })
        })
    }
}

function councilRole() {
    db.ref("users/").once("value", function(user_objects) {
        db.ref(`users/${getUsername()}`).once("value", function(object) {
            var councils = 0;
            user_objects.forEach(function(username) {
                var role = username.val().role;
                if (role === "council") {
                    councils++;
                }
            })
            if (object.val().role == "citizen") {
                if (councils >= 3) {
                    alert("Max amount of council members");
                    return;
                }
                if (object.val().money >= 20000000) {
                    db.ref(`users/${getUsername()}`).update({
                        role: "council",
                        money: firebase.database.ServerValue.increment(-20000000),
                    })
                }
            } else if (object.val().role == "council") {
                document.getElementById("popupHeading").innerHTML = "Congress";
                document.getElementById("popupBody").innerHTML = `
                    <h2>Current Policies</h2>
                    <div>
                        <ol id="policy_view">
                        </ol>
                    </div>
                    <hr>

                    <h2>Vote on Policies</h2>
                    <hr>
                    Time remaining until next policy: <span id="policyTimeRemaining"></span><br>
                    <br>
                    <div style="border-style:solid;padding:5px;border-width: 2px" id="policyInfo"></div><br>
                    <br>
                    <div>
                        <div style="float:left">
                            <button style="padding:5px" onclick="policy_vote(true)">YES</button>
                            <ul id="no_voters">
                            </ul>
                        </div>

                        <div style="float:right">
                            <button style="padding:5px" onclick="policy_vote(false)">NO</button>
                            <ul id="yes_voters">
                            </ul>
                        </div>
                    </div`;

                policyClock();

                db.ref(`other/policy`).off();

                db.ref(`other/policy`).on("value", function(policy_object) {
                    document.getElementById("policyInfo").innerHTML = policy_list[policy_object.val().current - 1];

                    document.getElementById("no_voters").innerHTML = "";
                    document.getElementById("yes_voters").innerHTML = "";

                    var index = 0;

                    if (policy_object.val().voters) {
                        Object.values(policy_object.val().voters).forEach(function(voters) {
                            var voter = document.createElement("li");

                            index++;

                            if (voters[0]) {
                                if (policy_object.val().list[9] && voters[1] !== getUsername()) {
                                    voter.innerHTML = `Voter ${index}`;
                                } else {
                                    voter.innerHTML = voters[1];
                                }
                                
                                document.getElementById("no_voters").appendChild(voter);
                            } else {
                                if (policy_object.val().list[9] && voters[1] !== getUsername()) {
                                    voter.innerHTML = `Voter ${index}`;
                                } else {
                                    voter.innerHTML = voters[1];
                                }

                                document.getElementById("yes_voters").appendChild(voter);
                            }
                        })
                    }

                    index = 0;
                    document.getElementById("policy_view").innerHTML = "";
                    policy_list.forEach(function(policies) {
                        var policy = document.createElement("li");

                        policy.innerHTML = policies + (policy_object.val().list[index] ? " ✓" : " ✖");
                        index++;

                        document.getElementById("policy_view").appendChild(policy);
                    })
                })
            }
        })
    })
}

function policy_vote(vote) {
    db.ref(`other/policy/list/8`).once("value", function(policy_object) {
        db.ref(`users/${getUsername()}/id`).once("value", function(user_id) {
            const time = new Date();
            let m = time.getMinutes();

            if (policy_object.val() || ((59 - m) >= 15 && m > 0)) { // m > 0 done to account for backend function delays. This function immediately allows for the user to vote once it turns 00 minutes, but it might take ~10 seconds or so for the backend function to start and finish running.
                db.ref(`other/policy/voters`).update({
                    [user_id.val()]: [vote, getUsername()]
                })
            } else {
                alert("Cannot vote 15 minutes before the end of the policy");
            }
        })
    })
}

function currentPolicies() {
    db.ref(`other/policy`).off();
    
    db.ref(`other/policy`).on("value", function(policy_object) {
        document.getElementById("popupHeading").innerHTML = "View Policies";
        document.getElementById("popupBody").innerHTML = `
            <h2>Current Policies</h2>
            <div>
                <ol id="policy_view">
                </ol>
            </div>
            <hr>

            <h2>Current Votes</h2>
            <hr>
            Time remaining until next policy: <span id="policyTimeRemaining"></span><br>
            <br>
            <div style="border-style:solid;padding:5px;border-width: 2px" id="policyInfo"></div><br>
            <br>
            <div>
                <div style="float:left">
                    <ul id="no_voters">
                    </ul>
                </div>

                <div style="float:right">
                    <ul id="yes_voters">
                    </ul>
                </div>
            </div`;

        policyClock();


        var index = 0;

        if (policy_object.val().list[7] && policy_object.val().voters) {
            document.getElementById("policyInfo").innerHTML = policy_list[policy_object.val().current - 1];
            Object.values(policy_object.val().voters).forEach(function(voters) {
                var voter = document.createElement("li");

                index++;

                if (voters[0]) {
                    if (policy_object.val().list[9] && voters[1] !== getUsername()) {
                        voter.innerHTML = `Voter ${index}`;
                    } else {
                        voter.innerHTML = voters[1];
                    }
                    
                    document.getElementById("no_voters").appendChild(voter);
                } else {
                    if (policy_object.val().list[9] && voters[1] !== getUsername()) {
                        voter.innerHTML = `Voter ${index}`;
                    } else {
                        voter.innerHTML = voters[1];
                    }

                    document.getElementById("yes_voters").appendChild(voter);
                }
            })
        }

        index = 0;
        document.getElementById("policy_view").innerHTML = "";
        policy_list.forEach(function(policies) {
            var policy = document.createElement("li");

            policy.innerHTML = policies + (policy_object.val().list[index] ? " ✓" : " ✖");
            index++;

            document.getElementById("policy_view").appendChild(policy);
        })
    })

}

function policyClock() {
    if (document.getElementById('policyTimeRemaining')) {
        const time = new Date();
        let m = time.getMinutes();
        let s = time.getSeconds();
        document.getElementById('policyTimeRemaining').innerHTML =  ((59 - m) < 10 ? "0" + (59 - m) : 59 - m) + ":" + ((59 - s) < 10 ? "0" + (59 - s) : 59 - s);
        setTimeout(policyClock, 1000);
    }
}

function minusAuto() {
    const autoselector = document.getElementById("autoselect");

    db.ref(`other/policy/list/4`).once("value", function(policy_object) {
        db.ref(`users/${getUsername()}`).once("value", (attacker_object) => {
            db.ref(`users/${autoselector.value}`).once("value", (victim_object) => {
                attacker = attacker_object.val();
                victim = victim_object.val();

                if (attacker.role == "angel") {
                    alert("Angels should not sin");
                    return;
                }

                var price = Math.round(1000 + (0.2 * (victim.money || 0)) + (100 * 1.2 ** (victim.autoclicker || 0)));
                var autoclicker = victim.autoclicker || 0;

                if (attacker.money >= price && autoclicker != 0 && attacker.username != victim.username) {
                    db.ref(`users/${getUsername()}`).update({
                        money: attacker.money - price,
                        deeds: firebase.database.ServerValue.increment(policy_object.val() ? -Math.round(price * 0.001) : 0),
                    })
                    db.ref(`users/${autoselector.value}`).update({
                        autoclicker: firebase.database.ServerValue.increment(-1),
                    })

                    if (price >= attacker.money * 0.5 && price >= 10000000) {
                        sendNotification(`${attacker.username} has just removed an Auto-Clicker from ${victim.username}!`);
                    }
                }
            })
        })
    })
}

function minusMult() {
    const multselector = document.getElementById("multselect");

    db.ref(`other/policy/list/4`).once("value", function(policy_object) {
        db.ref(`users/${getUsername()}`).once("value", (attacker_object) => {
            db.ref(`users/${multselector.value}`).once("value", (victim_object) => {
                attacker = attacker_object.val();
                victim = victim_object.val();

                if (attacker.role == "angel") {
                    alert("Angels should not sin");
                    return;
                }

                var price = Math.round(1000 + (0.2 * (victim.money || 0)) + (250 * 1.4 ** (victim.mult - 1 || 0)));
                var mult = victim.mult || 1;

                if (attacker.money >= price && mult != 1 && attacker.username != victim.username) {
                    db.ref(`users/${getUsername()}`).update({
                        money: attacker.money - price,
                        deeds: firebase.database.ServerValue.increment(policy_object.val() ? -Math.round(price * 0.001) : 0),
                    })
                    db.ref(`users/${multselector.value}`).update({
                        mult: firebase.database.ServerValue.increment(-1),
                    })

                    if (price >= attacker.money * 0.5 && price >= 10000000) {
                        sendNotification(`${attacker.username} has just removed one Mult from ${victim.username}!`);
                    }
                }
            })
        })
    })
}

function minusMoney() {
    const moneyselector = document.getElementById("moneyselect");
    const moneyinput = document.getElementById("moneyminusAmount");

    db.ref(`other/policy/list/4`).once("value", function(policy_object) {
        db.ref(`users/${getUsername()}`).once("value", (attacker_object) => {
            db.ref(`users/${moneyselector.value}`).once("value", (victim_object) => {
                attacker = attacker_object.val();
                victim = victim_object.val();

                if (attacker.role == "angel") {
                    alert("Angels should not sin");
                    return;
                }

                var price = Math.abs(Math.round(moneyinput.value * 3));
                var money = victim.money || 0;

                if (attacker.money >= price && attacker.username != victim.username && moneyselector.value) {
                    db.ref(`users/${getUsername()}`).update({
                        money: firebase.database.ServerValue.increment(price > money ? -money : -price),
                        deeds: firebase.database.ServerValue.increment(policy_object.val() ? -Math.round(price * 0.001) : 0),
                    })
                    db.ref(`users/${moneyselector.value}`).update({
                        money: firebase.database.ServerValue.increment(money - Math.abs(Math.round(moneyinput.value)) < 0 ? -money : -Math.abs(Math.round(moneyinput.value)))
                    })
                    if (price >= attacker.money * 0.5 && price >= 10000000) {
                        sendNotification(`${attacker.username} has just removed $${Math.abs(Math.round(moneyinput.value))} from ${victim.username}!`);
                    }
                }
            })
        })
    })
}

function giftAuto() {
    const autoselector = document.getElementById("autogiftselect");

    db.ref(`users/${getUsername()}`).once("value", (attacker_object) => {
        db.ref(`users/${autoselector.value}`).once("value", (victim_object) => {
            attacker = attacker_object.val();
            victim = victim_object.val();

            var price = Math.round(100 * 1.2 ** (victim.autoclicker || 0));

            if (attacker.money >= price && attacker.username != victim.username && autoselector.value) {
                db.ref(`users/${getUsername()}`).update({
                    money: attacker.money - price,
                    deeds: (attacker.deeds || 0) + Math.round(price * 0.001),
                })
                db.ref(`users/${autoselector.value}/autoclicker`).set(
                    (victim.autoclicker || 0) + 1,
                )

                if (price >= attacker.money * 0.5 && price >= 10000000) {
                    sendNotification(`${attacker.username} has just gifted an Auto-Clicker to ${victim.username}!`);
                }
            }
        })
    })
}

function giftMult() {
    const multselector = document.getElementById("multgiftselect");

    db.ref(`users/${getUsername()}`).once("value", (attacker_object) => {
        db.ref(`users/${multselector.value}`).once("value", (victim_object) => {
            attacker = attacker_object.val();
            victim = victim_object.val();

            var price = Math.round(250 * 1.4 ** (victim.mult - 1 || 0));

            if (attacker.money >= price && attacker.username != victim.username && multselector.value) {
                db.ref(`users/${getUsername()}`).update({
                    money: attacker.money - price,
                    deeds: (attacker.deeds || 0) + Math.round(price * 0.001),
                })
                db.ref(`users/${multselector.value}/mult`).set(
                    (victim.mult || 1) + 1
                )

                if (price >= attacker.money * 0.5 && price >= 10000000) {
                    sendNotification(`${attacker.username} has just gifted one Mult to ${victim.username}!`);
                }
            }
        })
    })
}

function giftMoney() {
    const moneyselector = document.getElementById("moneygiftselect");
    const moneyinput = document.getElementById("moneygiftAmount");

    db.ref(`users/${getUsername()}`).once("value", (attacker_object) => {
        db.ref(`users/${moneyselector.value}`).once("value", (victim_object) => {
            attacker = attacker_object.val();
            victim = victim_object.val();

            var price = Math.abs(Math.round(moneyinput.value));
            var money = victim.money || 0;

            if (attacker.money >= price && attacker.username != victim.username && moneyselector.value) {
                db.ref(`users/${getUsername()}`).update({
                    money: attacker.money - price,
                    deeds: (attacker.deeds || 0) + Math.round(price * 0.001),
                })
                db.ref(`users/${moneyselector.value}/money`).set(
                    money + price,
                )
                if (price >= attacker.money * 0.5 && price >= 10000000) {
                    sendNotification(`${attacker.username} has just gifted $${price} to ${victim.username}!`);
                }
            }
        })
    })
}

function showInstructions() {
    showPopUp(`PVP Donations`, `
        <h2>Update Log</h2>
        <ul>
            <li>Added new role: Council Member</li>
            <li>Lowered price of Citizen $10,000,000 ---> $2,500,000</li>
            <li>Lowered price of Angel $20,000,000 ---> $15,000,000</li>
            <li>Bank tellers will now potentially pay taxes</li>
        </ul><br>
        <h3><b>READ THIS IF YOU WANT TO CATCH UP WITH THE LATEST META: if you're wondering why bank tellers will "potentially" pay taxes, that is because the new role, Council Member, can decide if certain roles will pay taxes. With the introduction of roles such as Diviner, Jester, and Council Member, communication in PVP Donations has become more important than ever. I am saying this because I also want to promote the Pebble side of this website. In conclusion, please use Pebble to sell your services as a Diviner, talk amongst yourselves and sus out who the Jester is, advocate for certain policies, etc.</b></h3>`)
}

function checkAutoclickerActive() {
    db.ref(".info/connected").on("value", (snapshot) => {
        db.ref(`other/policy/list`).once("value", function(policy_object) {
            db.ref(`users/${getUsername()}`).once("value", function(object) {
                if (snapshot.val()) {
                    var time = Date.now() - object.val().autosleep
                    days = Math.floor(time / 86400000)
                    hours = Math.floor((time - days * 86400000) / 3600000)
                    minutes = Math.floor((time - days * 86400000 - hours * 3600000) / 60000)
                    seconds = Math.floor((time - days * 86400000 - hours * 3600000 - minutes * 60000) / 1000)
                    money = Math.floor(time / 1000) * (object.val().autoclicker * (object.val().mult || 1))
                    if (time > 600000 && object.val().autoclicker > 0) { // 10 minutes
                        if (object.val().role && ((object.val().role !== "bank" || policy_object.val()[2]) && (object.val().role !== "police" || policy_object.val()[1]) && (object.val().role !== "council" || policy_object.val()[6]) && object.val().role !== "pacifist")) {
                            showPopUp(
                                "Welcome Back!",
                                `While you were away for ${days} days, ${hours} hours, ${minutes} minutes, and ${seconds} seconds, you gained $${money}. However, you had to pay $${Math.round(money * 0.1)} due to taxes`
                            )
                            db.ref(`users/${getUsername()}`).update({
                                money: firebase.database.ServerValue.increment(money - Math.round(money * 0.1)),
                                autosleep: firebase.database.ServerValue.TIMESTAMP,
                            })
                            db.ref(`other/Casino/`).update({
                                money: firebase.database.ServerValue.increment(Math.round(money * 0.1)),
                            })
                        } else {
                            showPopUp(
                                "Welcome Back!",
                                `While you were away for ${days} days, ${hours} hours, ${minutes} minutes, and ${seconds} seconds, you gained $${money}`
                            )
                            db.ref(`users/${getUsername()}`).update({
                                money: firebase.database.ServerValue.increment(money),
                                autosleep: firebase.database.ServerValue.TIMESTAMP,
                            })
                        }
                    }
                    db.ref("users/" + getUsername()).onDisconnect().update({
                        autoactive: false,
                        autosleep: firebase.database.ServerValue.TIMESTAMP,
                    })
                }
            })
        })
    })
}

function selectorListeners() { // these are all a problem
    const autoselector = document.getElementById("autoselect");

    autoselector.addEventListener("change", function(event) {
        if (typeof previousautoValue !== 'undefined') {
            db.ref(`users/${previousautoValue}`).off("value", previousautoListener);
        }
        previousautoListener = db.ref(`users/${autoselector.value}`).on("value", function(object) {
            var obj = object.val();
            var cost = document.getElementById("autominusCost");
            cost.innerHTML = shortenNumber(Math.round(1000 + (0.2 * (obj.money || 0)) + (100 * 1.2 ** (obj.autoclicker || 0))));
        });

        previousautoValue = autoselector.value;
    })

    const multselector = document.getElementById("multselect");

    multselector.addEventListener("change", function(event) {
        if (typeof previousmultValue !== 'undefined') {
            db.ref(`users/${previousmultValue}`).off("value", previousmultListener);
        }
        previousmultListener = db.ref(`users/${multselector.value}`).on("value", function(object) {
            var obj = object.val();
            var cost = document.getElementById("multminusCost");
            cost.innerHTML = shortenNumber(Math.round(1000 + (0.2 * (obj.money || 0)) + (250 * 1.4 ** (obj.mult - 1 || 0))));
        });

        previousmultValue = multselector.value;
    })

    const moneyselector = document.getElementById("moneyselect");
    const moneyinput = document.getElementById("moneyminusAmount");

    moneyselector.addEventListener("change", function(event) {
        if (typeof previousmoneyValue !== 'undefined') {
            moneyinput.removeEventListener("input", function(object) {
                var cost = document.getElementById("moneyminusCost");
                cost.innerHTML = shortenNumber(Math.abs(Math.round(previousmoneyValue * 3)));
                previousmoneyValue = previousmoneyValue;
            })
        }
        moneyinput.addEventListener("input", function(object) {
            var cost = document.getElementById("moneyminusCost");
            cost.innerHTML = shortenNumber(Math.abs(Math.round(object.target.value * 3)));
            previousmoneyValue = object.target.value;
        });
    })

    const autogiftselector = document.getElementById("autogiftselect");

    autogiftselector.addEventListener("change", function(event) {
        if (typeof previousautogiftValue !== 'undefined') {
            db.ref(`users/${previousautogiftValue}`).off("value", previousautogiftListener);
        }
        previousautogiftListener = db.ref(`users/${autogiftselector.value}`).on("value", function(object) {
            var obj = object.val();
            var cost = document.getElementById("autogiftCost");
            cost.innerHTML = shortenNumber(Math.round(100 * 1.2 ** (obj.autoclicker || 0)));
        });

        previousautogiftValue = autogiftselector.value;
    })

    const multgiftselector = document.getElementById("multgiftselect");

    multgiftselector.addEventListener("change", function(event) {
        if (typeof previousmultgiftValue !== 'undefined') {
            db.ref(`users/${previousmultgiftValue}`).off("value", previousmultgiftListener);
        }
        previousmultgiftListener = db.ref(`users/${multgiftselector.value}`).on("value", function(object) {
            var obj = object.val();
            var cost = document.getElementById("multgiftCost");
            cost.innerHTML = shortenNumber(Math.round(250 * 1.4 ** (obj.mult - 1 || 0)));
        });

        previousmultgiftValue = multgiftselector.value;
    })

    const moneygiftselector = document.getElementById("moneygiftselect");
    const moneygiftinput = document.getElementById("moneygiftAmount");

    moneygiftselector.addEventListener("change", function(event) {
        if (typeof previousmoneyValue !== 'undefined') {
            moneygiftinput.removeEventListener("input", function(object) {
                var cost = document.getElementById("moneygiftCost");
                cost.innerHTML = shortenNumber(Math.abs(Math.round(previousmoneyValue)));
                previousmoneyValue = previousmoneyValue;
            })
        }
        moneygiftinput.addEventListener("input", function(object) {
            var cost = document.getElementById("moneygiftCost");
            cost.innerHTML = shortenNumber(Math.abs(Math.round(object.target.value)));
            previousmoneyValue = object.target.value;
        });
    })
}

function clickExclusion() {
    document.getElementById('autobuy').addEventListener('click', function(event) {
        if (event.target.id == "auto-sell") {
            sellAuto();
        } else {
            buyAuto();
        }
    })

    document.getElementById('multbuy').addEventListener('click', function(event) {
        if (event.target.id == "mult-sell") {
            sellMult();
        } else {
            buyMult();
        }
    })

    document.getElementById('autominus').addEventListener('click', function(event) {
        if (event.target.closest("select")) {
            return;
        } else {
            minusAuto();
        }
    })

    document.getElementById('multminus').addEventListener('click', function(event) {
        if (event.target.closest("select")) {
            return;
        } else {
            minusMult();
        }
    })

    document.getElementById('moneyminus').addEventListener('click', function(event) {
        if (event.target.closest("select") || event.target.id == "moneyminusAmount") {
            return;
        } else {
            minusMoney();
        }
    })

    document.getElementById('autogift').addEventListener('click', function(event) {
        if (event.target.closest("select")) {
            return;
        } else {
            giftAuto();
        }
    })

    document.getElementById('multgift').addEventListener('click', function(event) {
        if (event.target.closest("select")) {
            return;
        } else {
            giftMult();
        }
    })

    document.getElementById('moneygift').addEventListener('click', function(event) {
        if (event.target.closest("select") || event.target.id == "moneygiftAmount") {
            return;
        } else {
            giftMoney();
        }
    })
}

function setup() {
    channel.onmessage = () => {
        document.body.innerHTML = `<h1>Duplicate tabs are not allowed</h1><button onclick="window.location.replace('../pebble/pebble.html?ignore=true')">Pebble</button>`;
        checkAutoclickerActive = function() {};
        loadAutoclicker = function() {};
        db.goOffline();
    };
    channel.postMessage('call');
    
    const music = document.getElementById("bg-music");
    const playlist = ["../images/secret_files/irisu_01.mp3", "../images/secret_files/irisu_02.mp3", "../images/secret_files/irisu_03.mp3", "../images/secret_files/irisu_04.mp3", "../images/secret_files/irisu_05.mp3", "../images/secret_files/irisu_06.mp3", "../images/secret_files/hc_s2.m4a", "../images/secret_files/hc_hs1.m4a", "../images/secret_files/hc_hs2.m4a"];
    music.addEventListener("ended", function () {
        music.src = playlist[Math.floor(Math.random() * playlist.length)];
        music.play();
    });

    // log out in another window check
    window.addEventListener("storage", function(event) {
        if (event.storageArea === localStorage && event.key === null) {
            location.reload();
        }
    })

    if (getUsername() == null) {
        document.body.innerHTML = `<h1>Please Log in through Pebble because im too lazy to add the feature here</h1><button onclick="window.location.replace('../pebble/pebble.html?ignore=true')">Pebble</button>`;
        db.goOffline();
        return;
    }

    db.ref(`users/${getUsername()}`).once('value', function(object) {
        if (!object.exists() || object.val().password !== getPassword() || (object.val().muted || false) || (object.val().trapped || false) || Date.now() - (object.val().sleep || 0) < 0) {
            document.body.innerHTML = `<h1>Unknown error occurred. Either you are removed, muted, trapped, timed out, etc</h1><button onclick="window.location.replace('../pebble/pebble.html?ignore=true')">Pebble</button>`;
            db.goOffline();
            return;
        }
    })

    db.ref(`other/campaign`).on("value", function(object) {
        if (!object.val()) {
            db.ref(`users`).orderByChild("money").limitToLast(1).once("value", function(user_object) {
                user_object.forEach(snapshot => {
                    topUser = snapshot.val();
                });

                document.body.innerHTML = `<h1>This week's donation campaign has ended with the winner being ${topUser.username} at $${topUser.money}, please participate again in next week's campaign as well</h1><button onclick="window.location.replace('../pebble/pebble.html?ignore=true')">Pebble</button>`;
                loadAutoclicker = function() {};
                db.goOffline();
                return;
            })
        }
    })

    db.ref(`users/${getUsername()}`).on("child_removed", function(object) {
        db.ref("users/" + getUsername()).onDisconnect().cancel();
    })

    db.ref(`users/${getUsername()}/admin`).once("value", function(object) {
        if (object.val() >= 9000) {
            document.getElementById("clear").style.display = "block";
        }
    })

    db.ref(`users/${getUsername()}/money`).on("value", (amount) => {
        document.getElementById('money').innerHTML = shortenNumber(amount.val() || 0);
        if (document.getElementById('gambling-money')) {
            db.ref(`other/Casino/money`).once("value", function(casino_amount) {
                document.getElementById('gambling-money').innerHTML = (amount.val() || 0);
                document.getElementById('ultimatePercentage').innerHTML = `Gamble all your money away to have a ${amount.val() == 0 ? 0 : Math.min(6 ** ((4.9 * (amount.val() - casino_amount.val() * 1.05)) / casino_amount.val()), 0.5) * 100}% chance to win $${shortenNumber(casino_amount.val())}`;
            })
        }
    })

    selectorListeners();
    clickExclusion();
    loadNotifications();
    loadLeaderboard();
    setTimeout(checkAutoclickerActive, 1000);
    setTimeout(autoclickerCheck, 2000);
    loadMain();
    loadSelectors();

    db.ref(`users/${getUsername()}`).once("value", function(object) {
        if (object.val().role == "gambler") {
            gamblerLoader();
        } else if (object.val().role == "pacifist") {
            pacifistLoader();
        }

        if ((object.val().money || 0) <= 500 && (object.val().autoclicker || 0) == 0) {
            showInstructions();
        }
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

        fetch('https://us-central1-pebble-rocks.cloudfunctions.net/api/getInfo', {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain'
            },
            body: typeof(window.APPCHECK) !== "undefined" ? window.APPCHECK : null
        })
        .then(response => response.json())
        .then(data => {
            if (data.version === curr_version) {
                setup();
            } else {
                document.body.innerHTML = `An error has occured. You are most likely using an outdated version of the site. Fetch a new version by pressing "ctrl + shift + R" or "ctrl + f5<br>
                Newest Version: ${data.version}<br>
                Your Version: ${curr_version}`;
            }
        })
    } catch(err) {
        alert(err);
    }
};
