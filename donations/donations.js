var playing = false;

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
    db.ref(`users/${getUsername()}`).once("value", (object) => {
        obj = object.val();
        if (autoclicker === undefined) {
            amount = (obj.money || 0) + (obj.mult || 1);
        } else {
            amount = obj.money + ((obj.mult || 1) * obj.autoclicker);
        }
        db.ref(`users/${getUsername()}/money`).set(
            amount
        )
    })
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
            contentElement.innerHTML = "Auto-Clickers: " + (username.autoclicker || 0) + "<br>Mult: " + (username.mult || 1);

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
    if (localStorage.getItem("autoclicker") != "active") {
        loadAutoclicker();
    }
}

function loadAutoclicker() {
    db.ref("users/" + getUsername()).once("value", (object) => {
        obj = object.val();
        addAmount(true);
        localStorage.setItem("autoclicker", "active");
        setTimeout(() => requestAnimationFrame(loadAutoclicker), 1000);
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
        autonum.innerHTML = `Current auto-clickers: ${obj.autoclicker || 0}<br><hr>"It just plays itself!"<br>(NOTE: Refresh your page if your auto-clickers are not auto-clicking)`;

        // mult prices
        var multcost = document.getElementById("multCost");
        multcost.innerHTML = Math.round(250 * 1.4 ** (obj.mult - 1 || 0));

        // number of current mults
        var multnum = document.getElementById("multDescription");
        multnum.innerHTML = `Current mult: ${obj.mult || 1}<br><hr>"Yo Dawg, we heard you like to click, so we put more clicks in your click so you can click more while you click"`;
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
    db.ref(`users/${getUsername()}`).once("value", (object) => {
        obj = object.val();
        var price = Math.round(100 * 1.2 ** (obj.autoclicker || 0));

        if (obj.money >= price) {
            db.ref(`users/${getUsername()}`).update({
                money: obj.money - price,
            })
            db.ref(`users/${getUsername()}/autoclicker`).set(
                (obj.autoclicker || 0) + 1
            )
        }
    })
}

function buyMult() {
    db.ref(`users/${getUsername()}`).once("value", (object) => {
        obj = object.val();
        var price = Math.round(250 * 1.4 ** (obj.mult - 1 || 0));

        if (obj.money >= price) {
            db.ref(`users/${getUsername()}`).update({
                money: obj.money - price,
            })
            db.ref(`users/${getUsername()}/mult`).set(
                (obj.mult || 1) + 1
            )
        }
    })
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
    const moneyinput = document.getElementById("moneyminusAmount")

    db.ref(`users/${getUsername()}`).once("value", (attacker_object) => {
        db.ref(`users/${moneyselector.value}`).once("value", (victim_object) => {
            attacker = attacker_object.val();
            victim = victim_object.val();

            var price = Math.round(moneyinput.value);
            var money = victim.money || 0;

            if (attacker.money >= price && money != 0 && attacker.username != victim.username && moneyselector.value) {
                db.ref(`users/${getUsername()}`).update({
                    money: attacker.money - price,
                })
                db.ref(`users/${moneyselector.value}`).update({
                    money: victim.money - price,
                })
                if (price >= 1000) {
                    sendNotification(`${attacker.display_name} has just removed $${price} from ${victim.display_name}!`);
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
                db.ref(`users/${getUsername()}/money`).set(
                    attacker.money - price
                )
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
                db.ref(`users/${getUsername()}/money`).set(
                    attacker.money - price
                )
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
    const moneyinput = document.getElementById("moneygiftAmount")

    db.ref(`users/${getUsername()}`).once("value", (attacker_object) => {
        db.ref(`users/${moneyselector.value}`).once("value", (victim_object) => {
            attacker = attacker_object.val();
            victim = victim_object.val();

            var price = Math.round(moneyinput.value);
            var money = victim.money || 0;

            if (attacker.money >= price && money != 0 && attacker.username != victim.username && moneyselector.value) {
                db.ref(`users/${getUsername()}`).update({
                    money: attacker.money - price,
                })
                db.ref(`users/${moneyselector.value}/money`).set(
                    victim.money + price,
                )
                if (price >= 1000) {
                    sendNotification(`${attacker.display_name} has just gifted $${price} to ${victim.display_name}!`);
                }
            }
        })
    })
}

window.onload = function() {
    const music = document.getElementById("bg-music");
    const playlist = ["../images/secret_files/irisu_01.mp3", "../images/secret_files/irisu_02.mp3", "../images/secret_files/irisu_03.mp3", "../images/secret_files/irisu_04.mp3", "../images/secret_files/irisu_05.mp3", "../images/secret_files/irisu_06.mp3", ]
    music.addEventListener("ended", function () {
        music.src = playlist[Math.floor(Math.random() * playlist.length)];
        music.play();
    });

    if (getUsername() == null) {
        document.body.innerHTML = `<h1>Please Log in through Pebble because im too lazy to add the feature here</h1><button onclick="window.location.replace('../pebble/pebble.html')">Pebble</button>`;
        return;
    }
    db.ref(`users/${getUsername()}`).once('value', function(object) {
        if (!object.exists() || object.val().password !== getPassword() || (object.val().muted || false) || (object.val().trapped || false) || Date.now() - (object.val().sleep || 0) < 0) {
            document.body.innerHTML = "<h1>Unknown error occurred. Either you are removed, muted, trapped, timed out, etc</h1>";
            return;
        }
    })

    db.ref(`users/${getUsername()}/admin`).once("value", function(object) {
        if (object.val() > 0) {
            document.getElementById("clear").style.display = "block";
        }
    })

    db.ref(`users/${getUsername()}/money`).on("value", (amount) => {
        document.getElementById('money').innerHTML = (amount.val() || 0);
    })

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
                cost.innerHTML = Math.round(previousmoneyValue);
                previousmoneyValue = previousmoneyValue;
            })
        }
        moneyinput.addEventListener("input", function(object) {
            var cost = document.getElementById("moneyminusCost");
            cost.innerHTML = Math.round(object.target.value);
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
                cost.innerHTML = Math.round(previousmoneyValue);
                previousmoneyValue = previousmoneyValue;
            })
        }
        moneygiftinput.addEventListener("input", function(object) {
            var cost = document.getElementById("moneygiftCost");
            cost.innerHTML = Math.round(object.target.value);
            previousmoneyValue = object.target.value;
        });
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

    loadNotifications();
    loadLeaderboard();
    setTimeout(autoclickerCheck, 2000);
    loadMain();
    loadSelectors();
}

window.addEventListener('beforeunload', function(event) {
    localStorage.removeItem("autoclicker");
});