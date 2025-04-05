var playing = false;
var golden_cookie = false;
var gambled_money = 0;
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
    db.ref(`users/${getUsername()}`).once("value", function(snapshot) {
        let data = snapshot.val() || {};
        let amount = (data.mult || 1) * (autoclicker === undefined ? 1 : (data.autoclicker || 0));
        if (golden_cookie) {
            amount = amount * 2
        }

        if (data.money !== undefined && data.money !== null) {
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

    db.ref("users/").orderByChild("money").on("value", (object) => {
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

        users.reverse();

        users.forEach(function(username) {
            var leader = document.createElement("div");
            leader.setAttribute("class", "leader");
            

            var usernameElement = document.createElement("div");
            usernameElement.setAttribute("class", "leader-header");
            usernameElement.innerHTML = username.display_name + ": ";
            
            
            var usernameAmount = document.createElement("span");
            usernameAmount.setAttribute("id", "leaderNumber");
            usernameAmount.innerHTML = username.money || 0;
            
            var usernameImage = document.createElement("img");
            usernameImage.src = "../images/money.png";
            
            usernameElement.appendChild(usernameAmount);
            usernameElement.appendChild(usernameImage);

            
            var contentElement = document.createElement("div");
            contentElement.setAttribute("class", "leader-content");
            contentElement.innerHTML = "Auto-Clickers: " + (username.autoclicker || 0) + "<br>Mult: " + (username.mult || 1) + (username.gambling ? `<br>Gambling: Unlocked` : "");

            leader.appendChild(usernameElement);
            leader.appendChild(contentElement);

            leaderboard.appendChild(leader);
        })
    })
}

function loadNotifications() {
    var notifications = document.getElementById("notifications");

    db.ref("other/clickernotifications/").on("value", (object) => {
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
        if (Math.min((0.004 * Math.log((obj.deeds * 10000) / obj.money) / Math.log(Math.E)), 0.005) >= Math.random() && !golden_cookie) {
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
            autosleep: Date.now(),
        })
    })
}

function loadMain() {
    db.ref("users/" + getUsername()).on("value", (object) => {
        obj = object.val();

        // clicker mult
        var clicker = document.getElementById("clicky-button")
        clicker.innerHTML = "+" + (obj.mult || 1);
        var clickerimage = document.createElement("img");
        clickerimage.src = "../images/money.png";
        clicker.appendChild(clickerimage);

        // auto clicker prices
        var autocost = document.getElementById("autoCost");
        autocost.innerHTML = Math.round(100 * 1.2 ** (obj.autoclicker || 0));

        // number of current auto clickers
        var autonum = document.getElementById("autoDescription");
        autonum.innerHTML = `Current auto-clickers: ${obj.autoclicker || 0}<br><hr>"It just plays itself!"<br>(NOTE: Refresh your page if your auto-clickers are not auto-clicking)<br><button class="sell" id="auto-sell" onclick="autoSell()">Sell</button>`;

        // mult prices
        var multcost = document.getElementById("multCost");
        multcost.innerHTML = Math.round(250 * 1.4 ** (obj.mult - 1 || 0));

        // number of current mults
        var multnum = document.getElementById("multDescription");
        multnum.innerHTML = `Current mult: ${obj.mult || 1}<br><hr>"Yo Dawg, we heard you like to click, so we put more clicks in your click so you can click more while you click"<br><button class="sell" id="mult-sell" onclick="multSell()">Sell</button>`;

        // check if gambling has been bought
        if (obj.gambling) {
            document.getElementById('gambling-text').innerHTML = "Gambling";
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
            autooption.innerHTML = username.val().display_name;
            autoselector.appendChild(autooption);

            multoption = document.createElement("option");
            multoption.value = username.key;
            multoption.innerHTML = username.val().display_name;
            multselector.appendChild(multoption);

            moneyoption = document.createElement("option");
            moneyoption.value = username.key;
            moneyoption.innerHTML = username.val().display_name;
            moneyselector.appendChild(moneyoption)

            autogiftoption = document.createElement("option");
            autogiftoption.value = username.key;
            autogiftoption.innerHTML = username.val().display_name;
            autogiftselector.appendChild(autogiftoption);

            multgiftoption = document.createElement("option");
            multgiftoption.value = username.key;
            multgiftoption.innerHTML = username.val().display_name;
            multgiftselector.appendChild(multgiftoption);

            moneygiftoption = document.createElement("option");
            moneygiftoption.value = username.key;
            moneygiftoption.innerHTML = username.val().display_name;
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
            showPopUp(`Welcome to the Gambling Space! $<span id="gambling-money">${object.val().money}</span>`,`Double or Nothing<hr>$<input type="text" id="double"><br><br>Blackjack<hr>Dealer: <span id="dealer"></span><br>You: <span id="player"></span><br>$<input type="text" id="blackjack">`, [["Double-or-Nothing", () => DoubleNothing()], ["Hit", () => blackHit()], ["Stand", () => blackStand()]]);
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
                if (Math.random() < 0.5) {
                    if (moneyinput >= 1000000) {
                        sendNotification(`${object.val().display_name} just won $${moneyinput} in Double-or-Nothing!`)
                    }
                    db.ref(`users/${getUsername()}`).update({
                        money: firebase.database.ServerValue.increment(moneyinput),
                    })
                } else {
                    if (moneyinput >= 1000000) {
                        sendNotification(`${object.val().display_name} just lost $${moneyinput} in Double-or-Nothing!`)
                    }
                    db.ref(`users/${getUsername()}`).update({
                        money: firebase.database.ServerValue.increment(-moneyinput),
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
                if (moneyinput > 1000000) {
                    sendNotification(`${object.val().display_name} just lost $${moneyinput} in Blackjack!`)
                }
            } else if (sum > 21) {
                document.getElementById('blackjack').disabled = false;
                document.getElementById('blackjack').value = "";
                document.getElementById("dealer").innerHTML += " Won";
                document.getElementById("player").innerHTML += " Lost";
                if (moneyinput > 1000000) {
                    sendNotification(`${object.val().display_name} just lost $${moneyinput} in Blackjack!`)
                }
            } else if (hand == sum) {
                document.getElementById('blackjack').disabled = false;
                db.ref(`users/${getUsername()}`).update({
                    money: firebase.database.ServerValue.increment(moneyinput),
                })
                document.getElementById('blackjack').value = "";
                document.getElementById("dealer").innerHTML += " Tied";
                document.getElementById("player").innerHTML += " Tied";
                if (moneyinput > 1000000) {
                    sendNotification(`${object.val().display_name} just tied with $${moneyinput} in Blackjack!`)
                }
            } else if (hand <= 21 && sum > hand) {
                document.getElementById('blackjack').disabled = false;
                db.ref(`users/${getUsername()}`).update({
                    money: firebase.database.ServerValue.increment(moneyinput * 2),
                })
                document.getElementById('blackjack').value = "";
                document.getElementById("dealer").innerHTML += " Lost";
                document.getElementById("player").innerHTML += " Won";
                if (moneyinput > 1000000) {
                    sendNotification(`${object.val().display_name} just won $${moneyinput} in Blackjack!`)
                }
            } else if (hand > 21) {
                document.getElementById('blackjack').disabled = false;
                db.ref(`users/${getUsername()}`).update({
                    money: firebase.database.ServerValue.increment(moneyinput * 2),
                })
                document.getElementById('blackjack').value = "";
                document.getElementById("dealer").innerHTML += " Lost";
                document.getElementById("player").innerHTML += " Won";
                if (moneyinput > 1000000) {
                    sendNotification(`${object.val().display_name} just won $${moneyinput} in Blackjack!`)
                }
            }
        })
    }
}

function minusAuto() {
    const autoselector = document.getElementById("autoselect");

    db.ref(`users/${getUsername()}`).once("value", (attacker_object) => {
        db.ref(`users/${autoselector.value}`).once("value", (victim_object) => {
            attacker = attacker_object.val();
            victim = victim_object.val();

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
                sendNotification(`${attacker.display_name} has just removed an Auto-Clicker from ${victim.display_name}!`);
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
                sendNotification(`${attacker.display_name} has just removed one Mult from ${victim.display_name}!`);
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

            var price = Math.abs(Math.round(moneyinput.value * 3));
            var money = victim.money || 0;

            if (attacker.money >= price && attacker.username != victim.username && moneyselector.value) {
                db.ref(`users/${getUsername()}`).update({
                    money: attacker.money - price,
                    deeds: (attacker.deeds || 0) - Math.round(moneyinput.value * 0.001),
                })
                db.ref(`users/${moneyselector.value}/money`).set(
                    money - Math.abs(Math.round(moneyinput.value))
                )
                if (Math.abs(Math.round(moneyinput.value)) >= 5000) {
                    sendNotification(`${attacker.display_name} has just removed $${Math.abs(Math.round(moneyinput.value))} from ${victim.display_name}!`);
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
                sendNotification(`${attacker.display_name} has just gifted an Auto-Clicker to ${victim.display_name}!`);
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
                sendNotification(`${attacker.display_name} has just gifted one Mult to ${victim.display_name}!`);
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
                if (price >= 5000) {
                    sendNotification(`${attacker.display_name} has just gifted $${price} to ${victim.display_name}!`);
                }
            }
        })
    })
}

function showInstructions() {
    showPopUp(
        "Welcome to PvP Donations!",
        `
            <h2><b>NEW FEATURES</b></h2>
            <ul>
            <li>Offline Autoclickers: your autoclickers will now "run" even when you're not on this page</li>
            <li>Selling: You can now sell your mult and autoclickers but they will be at 90% of the price that you bought them at!</li>
            <li>Gambling: Self-explanatory, this is the endgame. New gambling games will be added mid-campaign.</li>
            <li>Frenzy: Every second, there is a small chance for you to be able to double all money output (except gambling) by 2x for 60 seconds. You can increase the chances of this happening, but I won't say what affects it!</li>
            </ul>
            <h3>Also congratulations to last week's winner, DinoShark who won with around $350,000,000! Now that there are offline autoclickers, I hope everything will be more fair to those that don't have much free-time</h3>
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
                    showPopUp(
                        "Welcome Back!",
                        `While you were away for ${days} days, ${hours} hours, ${minutes} minutes, and ${seconds} seconds, you gained $${money}`
                    )
                    db.ref(`users/${getUsername()}`).update({
                        money: firebase.database.ServerValue.increment(money),
                        autosleep: Date.now(),
                    })
                }
                db.ref("users/" + getUsername()).onDisconnect().update({
                    autoactive: false,
                    autosleep: Date.now(),
                })
            }
        })
    })
}

function selectorListeners() {
    const autoselector = document.getElementById("autoselect");

    autoselector.addEventListener("change", function(event) {
        if (typeof previousautoValue !== 'undefined') {
            db.ref(`users/${previousautoValue}`).off("value", previousautoListener);
        }
        previousautoListener = db.ref(`users/${autoselector.value}`).on("value", function(object) {
            var obj = object.val();
            var cost = document.getElementById("autominusCost");
            cost.innerHTML = Math.round(1000 + (0.2 * (obj.money || 0)) + (100 * 1.2 ** (obj.autoclicker || 0)))
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
            cost.innerHTML = Math.round(1000 + (0.2 * (obj.money || 0)) + (250 * 1.4 ** (obj.mult - 1 || 0)))
        });

        previousmultValue = multselector.value;
    })

    const moneyselector = document.getElementById("moneyselect");
    const moneyinput = document.getElementById("moneyminusAmount");

    moneyselector.addEventListener("change", function(event) {
        if (typeof previousmoneyValue !== 'undefined') {
            moneyinput.removeEventListener("input", function(object) {
                var cost = document.getElementById("moneyminusCost");
                cost.innerHTML = Math.abs(Math.round(previousmoneyValue * 3));
                previousmoneyValue = previousmoneyValue;
            })
        }
        moneyinput.addEventListener("input", function(object) {
            var cost = document.getElementById("moneyminusCost");
            cost.innerHTML = Math.abs(Math.round(object.target.value * 3));
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
            cost.innerHTML = Math.round(100 * 1.2 ** (obj.autoclicker || 0));
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
            cost.innerHTML = Math.round(250 * 1.4 ** (obj.mult - 1 || 0));
        });

        previousmultgiftValue = multgiftselector.value;
    })

    const moneygiftselector = document.getElementById("moneygiftselect");
    const moneygiftinput = document.getElementById("moneygiftAmount");

    moneygiftselector.addEventListener("change", function(event) {
        if (typeof previousmoneyValue !== 'undefined') {
            moneygiftinput.removeEventListener("input", function(object) {
                var cost = document.getElementById("moneygiftCost");
                cost.innerHTML = Math.abs(Math.round(previousmoneyValue));
                previousmoneyValue = previousmoneyValue;
            })
        }
        moneygiftinput.addEventListener("input", function(object) {
            var cost = document.getElementById("moneygiftCost");
            cost.innerHTML = Math.abs(Math.round(object.target.value));
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
    const music = document.getElementById("bg-music");
    const playlist = ["../images/secret_files/irisu_01.mp3", "../images/secret_files/irisu_02.mp3", "../images/secret_files/irisu_03.mp3", "../images/secret_files/irisu_04.mp3", "../images/secret_files/irisu_05.mp3", "../images/secret_files/irisu_06.mp3", ]
    music.addEventListener("ended", function () {
        music.src = playlist[Math.floor(Math.random() * playlist.length)];
        music.play();
    });

    if (getUsername() == null) {
        document.body.innerHTML = `<h1>Please Log in through Pebble because im too lazy to add the feature here</h1><button onclick="window.location.replace('../pebble/pebble.html?ignore=true')">Pebble</button>`;
        return;
    }

    db.ref(`users/${getUsername()}`).once('value', function(object) {
        if (!object.exists() || object.val().password !== getPassword() || (object.val().muted || false) || (object.val().trapped || false) || Date.now() - (object.val().sleep || 0) < 0) {
            document.body.innerHTML = `<h1>Unknown error occurred. Either you are removed, muted, trapped, timed out, etc</h1><button onclick="window.location.replace('../pebble/pebble.html?ignore=true')">Pebble</button>`;
            return;
        }
    })

    db.ref(`other/campaign`).on("value", function(object) {
        if (!object.val()) {
            db.ref(`users`).orderByChild("money").limitToLast(1).once("value", function(user_object) {
                user_object.forEach(snapshot => {
                    topUser = snapshot.val();
                });

                document.body.innerHTML = `<h1>This week's donation campaign has ended with the winner being ${topUser.display_name} at $${topUser.money}, please participate again in next week's campaign as well</h1><button onclick="window.location.replace('../pebble/pebble.html?ignore=true')">Pebble</button>`;
                loadAutoclicker = function() {};
                return;
            })
        }
    })

    db.ref(`users/${getUsername()}/admin`).once("value", function(object) {
        if (object.val() > 0) {
            document.getElementById("clear").style.display = "block";
        }
    })

    db.ref(`users/${getUsername()}/money`).on("value", (amount) => {
        document.getElementById('money').innerHTML = (amount.val() || 0);
        if (document.getElementById('gambling-money')) {
            document.getElementById('gambling-money').innerHTML = (amount.val() || 0)
        }
    })

    selectorListeners();
    clickExclusion();
    loadNotifications();
    loadLeaderboard();
    checkAutoclickerActive();
    setTimeout(autoclickerCheck, 2000);
    loadMain();
    loadSelectors();

    db.ref(`users/${getUsername()}`).once("value", (amount) => {
        if ((amount.val().money || 0) <= 500 && (amount.val().autoclicker || 0) == 0) {
            showInstructions();
        }
    })
}

window.onload = function() {
    try {
        getApiKey().then(apiKey => {
            const firebaseConfig = apiKey;
            firebase.initializeApp(firebaseConfig);
            db = firebase.database();

            setup();
        });
    } catch(err) {
        alert(err);
    }
};