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

function check() {
    username = localStorage.getItem("username")
    if (username == "jesus" || username == "hbrfan" || true) {
        document.getElementById("irisu").style.display = "block";
    }
}

function addAmount(amount) {
    amount += parseInt(document.getElementById('money').innerHTML);
    alert(amount);
    db.ref(`users/${getUsername()}`).update({
        money: amount,
    })
}

window.onload = function() {
    const music = document.getElementById("bg-music");
    const playlist = ["../images/secret_files/irisu_01.mp3", "../images/secret_files/irisu_02.mp3", "../images/secret_files/irisu_03.mp3", "../images/secret_files/irisu_04.mp3", "../images/secret_files/irisu_05.mp3", "../images/secret_files/irisu_06.mp3", ]
    music.addEventListener("ended", function () {
        music.src = playlist[Math.floor(Math.random() * playlist.length)];
        music.play();
    });
    check();
    if (getUsername() == null) {
        document.body.innerHTML = "<h1>Please Log in through Pebble because im too lazy to add the feature here</h1><button onclick='../pebble/pebble.js'>Pebble</button>";
        return;
    }

    db.ref(`users/${getUsername()}`).on("value", (amount) => {
        document.getElementById('money').innerHTML = amount.val().money;
    })
}
