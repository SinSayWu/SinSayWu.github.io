var playing = false;
var golden_cookie = false;
var gambled_money = 0;
const channel = new BroadcastChannel('tab-check');
let db;

function play() {
    const music = document.getElementById("bg-music");
    const playlist = ["../images/secret_files/irisu_01.mp3", "../images/secret_files/irisu_02.mp3", "../images/secret_files/irisu_03.mp3", "../images/secret_files/irisu_04.mp3", "../images/secret_files/irisu_05.mp3", "../images/secret_files/irisu_06.mp3", ]
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
                    users.push(object_child.val());
                })

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
                    usernameAmount.innerHTML = shortenNumber(username.money || 0);
                    
                    var usernameImage = document.createElement("img");
                    usernameImage.src = "../images/money.png";
                    
                    usernameElement.appendChild(usernameAmount);
                    usernameElement.appendChild(usernameImage);
        
                    
                    var contentElement = document.createElement("div");
                    contentElement.setAttribute("class", "leader-content");
                    if (username.username == "Casino") {
                        contentElement.innerHTML = `Total Earnings: $${shortenNumber(username.money)}`;
                    } else {
                        contentElement.innerHTML = "Auto-Clickers: " + (username.autoclicker || 0) + "<br>Mult: " + (username.mult || 1) + (username.gambling ? `<br>Gambling: Unlocked` : "") + (username.role ? `<br>Role: ${(username.role == "criminal" || username.role == "gambler") ? "citizen" : username.role}` : "") + (user_object.val().role == "angel" ? `<br>Deeds: ${shortenNumber(username.deeds || 0)}` : "");
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

        if (obj.admin > 0) {
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
        var obj = gambling_object.val();
        // check if gambling has been bought
        if (obj) {
            document.getElementById('gambling-text').innerHTML = "Probability Sim with Cards";
        }
    })

    db.ref(`users/${getUsername()}`).on("child_added", function(role_object) {
        var obj = role_object.val();
        // check if roles have been bought
        if (obj) {
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
            moneyselector.appendChild(moneyoption)

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
                    if (moneyinput >= object.val().money * 0.5) {
                        sendNotification(`${object.val().username} just won $${moneyinput} in Double-or-Nothing!`)
                    }
                    db.ref(`users/${getUsername()}`).update({
                        money: firebase.database.ServerValue.increment(moneyinput),
                    })
                    db.ref(`other/Casino/`).update({
                        money: firebase.database.ServerValue.increment(-moneyinput),
                    })
                } else {
                    if (moneyinput >= object.val().money * 0.5) {
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
                if (moneyinput > object.val().money * 0.5) {
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
                if (moneyinput > object.val().money * 0.5) {
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
                if (moneyinput > object.val().money * 0.5) {
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
                if (moneyinput > object.val().money * 0.5) {
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
                if (moneyinput > object.val().money * 0.5) {
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
                    sendNotification(`${getUsername()} has just won the Ultimate Gamble!`);
                } else {
                    db.ref(`users/${getUsername()}`).update({
                        money: firebase.database.ServerValue.increment(-user_object.val().money),
                    })
                    db.ref(`other/Casino/`).update({
                        money: firebase.database.ServerValue.increment(user_object.val().money),
                    })

                    if (user_object.val().money >= 100000000) {
                        sendNotification(`${getUsername()} has just lost the Ultimate Gamble!`);
                    }
                }
            }
        })
    })
}

function Roles() {
    db.ref("users/").once("value", function(user_objects) {
        db.ref(`users/${getUsername()}`).once("value", function(object) {
            if (object.val().role) {
                var citizens = 0;
                var police = 0;
                var gamblers = 0;
                var angels = 0;
                var tellers = 0;
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
                    <li>dont have to pay taxes</li>
                    <li>confiscate what criminals have stolen</li>
                </ul>
                Cons:<ul>
                    <li>criminals hate you</li>
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
                <button style="font-size:2vh" onclick="angelRole()">Select</button> $20,000,000 and a good heart

                <h3>Bank Teller (${tellers} / 3)</h3><hr>
                Pros:<ul>
                    <li>people can request for loans from you</li>
                    <li>gain the money that would be interest</li>
                    <li>can put people into crippling debt</li>
                </ul>
                Cons:<ul>
                    <li>not many people make loans</li>
                    <li>your wage is dependent on the interest that the loaner is acceptable with</li>
                </ul>
                <button style="font-size:2vh" onclick="bankRole()">Select</button> $15,000,000

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
                </ul>
                <button style="font-size:2vh"  onclick="criminalRole()">Select</button> $2,500,000`);
            } else if (object.val().money >= 10000000) {
                db.ref(`users/${getUsername()}`).update({
                    money: firebase.database.ServerValue.increment(-10000000),
                    role: "citizen",
                })
            }
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
            document.getElementById("loanstatus").innerHTML = object.val().loan[4] ? `Your loan was accepted by ${object.val().loan[4]}` : `Your loan is still waiting to be accepted`;
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
            
            if (object.val().role !== "gambler") {
                document.getElementById("popup").remove();
            }
        }
    })
}

function policeRole() {
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
                <span id="investigatechances">${3 - Math.ceil((((object.val().ability1sleep || date) <= date ? date : object.val().ability1sleep) - date) / 3600000)} chances available</span>
                <span id="investigateresult"></span><br>
                Investigate people to see if they are a criminal before arresting them. Inconclusive investigations may mean that they are a criminal, but it doesn't always mean that they are a criminal. Some investigations on citizens can be inconclusive as well.
                <br><br>
                
                <h2>Arrest</h2>
                <hr>
                <select id="arrestselect"></select>
                <button style="font-size:2vh" onclick="arrest()">Arrest</button>
                <span id="strikecount">${object.val().strike} strikes out of 3</span><br>
                If you are sure that someone is a criminal, select them here and arrest them. Be sure to not arrest an innocent accidentally, the precinct isn't lenient with incompetent police officers`;

                investigateselector = document.getElementById("investigateselect");
                investigateselector.innerHTML = `<option value="" selected disabled>Select an option</option>`;
                arrestselector = document.getElementById("arrestselect");
                arrestselector.innerHTML = `<option value="" selected disabled>Select an option</option>`;

                db.ref("users/").once("value", function(user_objects) {
                    user_objects.forEach(function(username) {
                        investigateoption = document.createElement("option");
                        investigateoption.value = username.key;
                        investigateoption.innerHTML = username.val().username;
                        investigateselector.appendChild(investigateoption);

                        arrestoption = document.createElement("option");
                        arrestoption.value = username.key;
                        arrestoption.innerHTML = username.val().username;
                        arrestselector.appendChild(arrestoption);
                    })
                });
            }
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
                    ability1sleep: (user_object.val().ability1sleep || date) + 3600000
                })
                document.getElementById("investigatechances").innerHTML = `${parseInt(document.getElementById("investigatechances").innerHTML.charAt(0)) - 1} chances available`;

                if (object.val().role == "criminal") {
                    document.getElementById("investigateresult").innerHTML = "Results were inconclusive";
                } else {
                    if (chance >= 0.5) {
                        document.getElementById("investigateresult").innerHTML = "Results were inconclusive";
                    } else {
                        document.getElementById("investigateresult").innerHTML = "They were not a criminal";
                    }
                }
            }
        })
    })
}

function arrest() {
    var target = document.getElementById("arrestselect").value;

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
                    })
                    window.location.reload();
                }
            }
        })
    })
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
                if (object.val().money >= 20000000 && object.val().deeds >= 1000) {
                    db.ref(`users/${getUsername()}`).update({
                        role: "angel",
                        money: firebase.database.ServerValue.increment(-20000000),
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
                ability1sleep: (user_object.val().ability1sleep || date) + 86400000
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
                if (object.val().money >= 15000000) {
                    db.ref(`users/${getUsername()}`).update({
                        role: "bank",
                        money: firebase.database.ServerValue.increment(-15000000),
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

                        if (username.val().loan && username.val().loan[4] == getUsername()) {
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
                4: getUsername(),
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
            } else if (customer.val().loan[4] !== getUsername()) {
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
                    autostealoption = document.createElement("option");
                    autostealoption.value = username.key;
                    autostealoption.innerHTML = username.val().username;
                    autostealselector.appendChild(autostealoption);

                    multstealoption = document.createElement("option");
                    multstealoption.value = username.key;
                    multstealoption.innerHTML = username.val().username;
                    multstealselector.appendChild(multstealoption);
                })
            });
        }
    })
}

function stealAuto() {
    var target = document.getElementById("autostealselect").value;

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
                    ability1sleep: (object.val().ability1sleep || Date.now()) + 3600000
                })
                document.getElementById("autostealchances").innerHTML = `${parseInt(document.getElementById("autostealchances").innerHTML.charAt(0)) - 1} chances available`;

                if (chances <= 0.33) {
                    if (object.val().stolenauto >= 3) {
                        db.ref(`users/${getUsername()}`).update({
                            autoclicker: firebase.database.ServerValue.increment(1),
                            deeds: firebase.database.ServerValue.increment(-Math.round(100 * 1.2 ** (user_target.val().autoclicker - 1) * 0.001)),
                        })
                    } else {
                        db.ref(`users/${getUsername()}`).update({
                            stolenauto: ((object.val().stolenauto || 0) + 1),
                            deeds: firebase.database.ServerValue.increment(-Math.round(100 * 1.2 ** (user_target.val().autoclicker - 1) * 0.001)),
                        })
                    }
                    db.ref(`users/${target}`).update({
                        autoclicker: firebase.database.ServerValue.increment(-1),
                    })
                    document.getElementById("stolenauto").innerHTML = parseInt(document.getElementById("stolenauto").innerHTML) + 1;
                    alert(`Successfully stole an autoclicker from ${target}`);
                } else {
                    alert(`Failed to steal an autoclicker from ${target}`);
                }
            }
        })
    })
}

function stealMult() {
    var target = document.getElementById("multstealselect").value;

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
                    ability2sleep: (object.val().ability2sleep || Date.now()) + 3600000
                })
                document.getElementById("multstealchances").innerHTML = `${parseInt(document.getElementById("multstealchances").innerHTML.charAt(0)) - 1} chances available`;

                if (chances <= 0.2) {
                    if (object.val().stolenmult >= 3) {
                        db.ref(`users/${getUsername()}`).update({
                            mult: firebase.database.ServerValue.increment(1),
                            deeds: firebase.database.ServerValue.increment(-Math.round(250 * 1.4 ** (user_target.val().mult - 2) * 0.001)),
                        })
                    } else {
                        db.ref(`users/${getUsername()}`).update({
                            stolenmult: ((object.val().stolenmult || 0) + 1),
                            deeds: firebase.database.ServerValue.increment(-Math.round(250 * 1.4 ** (user_target.val().mult - 2) * 0.001)),
                        })
                    }
                    db.ref(`users/${target}`).update({
                        mult: firebase.database.ServerValue.increment(-1),
                    })
                    document.getElementById("stolenmult").innerHTML = parseInt(document.getElementById("stolenmult").innerHTML) + 1;
                    alert(`Successfully stole mult from ${target}`);
                } else {
                    alert(`Failed to steal mult from ${target}`);
                }
            }
        })
    })
}

function minusAuto() {
    const autoselector = document.getElementById("autoselect");

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
                    deeds: (attacker.deeds || 0) - Math.round(price * 0.001),
                })
                db.ref(`users/${autoselector.value}`).update({
                    autoclicker: victim.autoclicker - 1,
                })

                if (price >= attacker.money * 0.5) {
                    sendNotification(`${attacker.username} has just removed an Auto-Clicker from ${victim.username}!`);
                }
            }
        })
    })
}

function minusMult() {
    const multselector = document.getElementById("multselect");

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
                    deeds: (attacker.deeds || 0) - Math.round(price * 0.001),
                })
                db.ref(`users/${multselector.value}`).update({
                    mult: victim.mult - 1,
                })

                if (price >= attacker.money * 0.5) {
                    sendNotification(`${attacker.username} has just removed one Mult from ${victim.username}!`);
                }
            }
        })
    })
}

function minusMoney() {
    const moneyselector = document.getElementById("moneyselect");
    const moneyinput = document.getElementById("moneyminusAmount");

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
                    deeds: (attacker.deeds || 0) - Math.round(moneyinput.value * 0.001),
                })
                db.ref(`users/${moneyselector.value}/money`).set(
                    (money - Math.abs(Math.round(moneyinput.value)) < 0 ? 0 : money - Math.abs(Math.round(moneyinput.value)))
                )
                if (price >= attacker.money * 0.5) {
                    sendNotification(`${attacker.username} has just removed $${Math.abs(Math.round(moneyinput.value))} from ${victim.username}!`);
                }
            }
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

                if (price >= attacker.money * 0.5) {
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

                if (price >= attacker.money * 0.5) {
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
                if (price >= attacker.money * 0.5) {
                    sendNotification(`${attacker.username} has just gifted $${price} to ${victim.username}!`);
                }
            }
        })
    })
}

function showInstructions() {
    showPopUp(
        "Welcome to PvP Donations!",
        `
            <h2><b>ROLES</b></h2>that are in progress...
            <ul>
            <li>Police Officers: can arrest criminals</li>
            <li>Gamblers: have higher luck in gambling</li>
            <li>Bank Tellers: can give loans to people</li>
            <li>Angel: can give divine retribution</li>
            </ul>
            Currently, roles are only here because there is a limited amount of people that can be in one role so get the one you want quick!!
            <b>ROLES CURRENTLY ARE NOT FUNCTIONAL. THEY WILL PROBABLY ALL BE DONE TOMORROW.</b>
            <h3>Also congratulations to last week's winner, bobmcboberstein who won with around $2,000,000,000!</h3>
            <h2>Warning: Do not try to HACK</h2>
            It ruins the game for everyone
        `,
    );
}

function checkAutoclickerActive() {
    db.ref(".info/connected").on("value", (snapshot) => {
        db.ref(`users/${getUsername()}`).once("value", function(object) {
            if (snapshot.val()) {
                var time = Date.now() - object.val().autosleep
                days = Math.floor(time / 86400000)
                hours = Math.floor((time - days * 86400000) / 3600000)
                minutes = Math.floor((time - days * 86400000 - hours * 3600000) / 60000)
                seconds = Math.floor((time - days * 86400000 - hours * 3600000 - minutes * 60000) / 1000)
                money = Math.floor(time / 1000) * (object.val().autoclicker * (object.val().mult || 1))
                if (time > 600000 && object.val().autoclicker > 0) { // 10 minutes
                    if (object.val().role && object.val().role !== "police") {
                        if (object.val().role !== "gambler") {
                            showPopUp(
                                "Welcome Back!",
                                `While you were away for ${days} days, ${hours} hours, ${minutes} minutes, and ${seconds} seconds, you gained $${money}. However, you had to pay $${Math.round(money * 0.1)} due to taxes`
                            )
                        }
                        db.ref(`users/${getUsername()}`).update({
                            money: firebase.database.ServerValue.increment(money - Math.round(money * 0.1)),
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
    const playlist = ["../images/secret_files/irisu_01.mp3", "../images/secret_files/irisu_02.mp3", "../images/secret_files/irisu_03.mp3", "../images/secret_files/irisu_04.mp3", "../images/secret_files/irisu_05.mp3", "../images/secret_files/irisu_06.mp3", ]
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
        if (object.val() > 0) {
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
    setTimeout(checkAutoclickerActive, 3000);
    setTimeout(autoclickerCheck, 2000);
    loadMain();
    loadSelectors();

    db.ref(`users/${getUsername()}`).once("value", function(object) {
        if (object.val().role == "gambler") {
            showPopUp(`Welcome to the Gambling Space! $<span id="gambling-money">${object.val().money}</span>`,`
            Double or Nothing<hr>
            $<input type="text" id="double">
            <button style="font-size:2vh" onclick="DoubleNothing()">Double-or-Nothing</button><br><br>

            Blackjack<hr>
            Dealer: <span id="dealer"></span><br>
            You: <span id="player"></span><br>
            $<input type="text" id="blackjack">
            <button style="font-size:2vh" onclick="blackHit()">Hit</button>
            <button style="font-size:2vh" onclick="blackStand()">Stand</button><br><br>

            The Ultimate Gamble<hr>
            <button style="font-size:2vh" onclick="ultimateGamble()">Gamble all my money away</button>
            <span id="ultimatePercentage"></span>`, [["Navigate to Loans", () => {
                db.ref(`users/${getUsername()}`).once("value", function(object) {
                    document.getElementById("popupHeading").innerHTML = "Loan Menu";
                    document.getElementById("popupBody").innerHTML = `
                        TAKE INTO ACCOUNT THAT YOUR LOAN REQUEST MUST BE ACCEPTED BY SOMEONE SO IT MUST BE REASONABLE<br>
                        Amount of money you request to be loaned to you: $<input type="text" id="loanmoney"><br>
                        The interest that you are willing to pay at the deadline: %<input type="text" id="loaninterest"><br>
                        The loan term that you are willing to take: <input type="text" id="loantime"> hours<br>
                        <button style="font-size:2vh" onclick="takeLoan()">Request Loan</button>`
                    document.getElementById("loanmoney").value = object.val().loan[0] || "";
                    document.getElementById("loaninterest").value = object.val().loan[1] || "";
                    document.getElementById("loantime").value = object.val().loan[2] || "";
                })
            }], ["Navigate to Gambling", () => {
                db.ref(`users/${getUsername()}`).once("value", function(object) {
                    document.getElementById("popupHeading").innerHTML = `Welcome to the Gambling Space! $<span id="gambling-money">${object.val().money}</span>`;
                    document.getElementById("popupBody").innerHTML = `
                        Double or Nothing<hr>
                        $<input type="text" id="double">
                        <button style="font-size:2vh" onclick="DoubleNothing()">Double-or-Nothing</button><br><br>

                        Blackjack<hr>
                        Dealer: <span id="dealer"></span><br>
                        You: <span id="player"></span><br>
                        $<input type="text" id="blackjack">
                        <button style="font-size:2vh" onclick="blackHit()">Hit</button>
                        <button style="font-size:2vh" onclick="blackStand()">Stand</button><br><br>

                        The Ultimate Gamble<hr>
                        <button style="font-size:2vh" onclick="ultimateGamble()">Gamble all my money away</button>
                        <span id="ultimatePercentage"></span>`
                })
            }]]);
            document.getElementById("closePopup").remove();
        }
    })

    db.ref(`users/${getUsername()}`).once("value", (amount) => {
        if ((amount.val().money || 0) <= 500 && (amount.val().autoclicker || 0) == 0) {
            showInstructions();
        }
    })
}

window.onload = function() {
    try {
        getApiKey().then(apiKey => {
            firebase.initializeApp(apiKey);
            db = firebase.database();

            setup();
        });
    } catch(err) {
        alert(err);
    }
};
