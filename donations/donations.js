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
            amount = parseInt(document.getElementById('money').innerHTML) + obj.mult;
        } else {
            amount = parseInt(document.getElementById('money').innerHTML) + (obj.mult * obj.autoclicker);
        }
        db.ref(`users/${getUsername()}`).update({
            money: amount,
        })
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
            if (a.timestamp == null) return 1;
            if (b.timestamp == null) return -1; 
            return a.timestamp - b.timestamp;
        });

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
            contentElement.innerHTML = "testing";

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

        notifs.forEach(function(notif) {
            var notifElement = document.createElement("div");
            notifElement.setAttribute("class", "notification");
            notifElement.innerHTML = notif;

            notifications.appendChild(notifElement);
        })
    })
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
        clicker.innerHTML = "+" + obj.mult;
        var clickerimage = document.createElement("img");
        clickerimage.src = "../images/money.png";
        clicker.appendChild(clickerimage);

        // auto clicker prices
        var autocost = document.getElementById("autoCost");
        autocost.innerHTML = Math.round(100 * 1.2 ** (obj.autoclicker || 0));

        // number of current auto clickers
        var autonum = document.getElementById("autoDescription");
        autonum.innerHTML = `Current auto-clickers: ${obj.autoclicker}<br><hr>"It just plays itself!"`;

        // mult prices
        var multcost = document.getElementById("multCost");
        multcost.innerHTML = Math.round(250 * 1.4 ** (obj.mult - 1 || 0));

        // number of current mults
        var multnum = document.getElementById("multDescription");
        multnum.innerHTML = `Current mult: ${obj.mult}<br><hr>"Yo Dawg, we heard you like to click, so we put more clicks in your click so you can click more while you click"`;
    })
}

function loadSelectors() {
    db.ref("users/").once("value", (object) => {
        autoselector = document.getElementById("autoselect");
        multselector = document.getElementById("multselect");
        object.forEach(function(username) {
            autooption = document.createElement("option");
            autooption.value = username.key;
            autooption.innerHTML = username.key;
            autoselector.appendChild(autooption);

            multoption = document.createElement("option");
            multoption.value = username.key;
            multoption.innerHTML = username.key;
            multselector.appendChild(multoption);
        })
    })
}

function buyAuto() {
    db.ref(`users/${getUsername()}`).once("value", (object) => {
        obj = object.val();
        var price = parseInt(document.getElementById("autoCost").innerHTML);

        if (obj.money >= price) {
            db.ref(`users/${getUsername()}`).update({
                money: obj.money - price,
                autoclicker: obj.autoclicker += 1,
            })
        }
    })
}

function buyMult() {
    db.ref(`users/${getUsername()}`).once("value", (object) => {
        obj = object.val();
        var price = parseInt(document.getElementById("multCost").innerHTML);

        if (obj.money >= price) {
            db.ref(`users/${getUsername()}`).update({
                money: obj.money - price,
                mult: obj.mult += 1,
            })
        }
    })
}

function minusAuto() {
    const autoselector = document.getElementById("autoselect");

    db.ref(`users/${getUsername()}`).once("value", (attacker_object) => {
        db.ref(`users/${autoselector.value}`).once("value", (victim_object) => {
            attacker = attacker_object.val();
            victim = victim_object.val();

            var price = parseInt(document.getElementById("autominusCost").innerHTML);
            var autoclicker = victim.autoclicker || 0;

            if (attacker.money >= price && autoclicker != 0) {
                db.ref(`users/${getUsername()}`).update({
                    money: attacker.money - price,
                })
                db.ref(`users/${autoselector.value}`).update({
                    autoclicker: victim.autoclicker - 1,
                })
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

            var price = parseInt(document.getElementById("multminusCost").innerHTML);
            var mult = victim.mult || 1;

            if (attacker.money >= price && mult != 1) {
                db.ref(`users/${getUsername()}`).update({
                    money: attacker.money - price,
                })
                db.ref(`users/${multselector.value}`).update({
                    mult: victim.mult - 1,
                })
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
        document.body.innerHTML = "<h1>Please Log in through Pebble because im too lazy to add the feature here</h1><button onclick='../pebble/pebble.js'>Pebble</button>";
        return;
    }

    db.ref(`users/${getUsername()}/money`).on("value", (amount) => {
        document.getElementById('money').innerHTML = amount.val();
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

        previousautoValue = autoselector.value;
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

    loadLeaderboard();
    loadNotifications();
    // setTimeout(autoclickerCheck, 2000);
    loadMain();
    loadSelectors();
}

window.addEventListener('beforeunload', function(event) {
    localStorage.removeItem("autoclicker");
});