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

function addAmount(amount) {
    amount += parseInt(document.getElementById('money').innerHTML);
    db.ref(`users/${getUsername()}`).update({
        money: amount,
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
            usernameElement.innerHTML = username.username + ": ";
            
            
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

    db.ref(`users/${getUsername()}`).on("value", (amount) => {
        document.getElementById('money').innerHTML = amount.val().money;
    })

    loadLeaderboard();
    loadNotifications();
}
