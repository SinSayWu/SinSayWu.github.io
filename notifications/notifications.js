function checkChecked() {
    document.getElementById("server-announcements").addEventListener("change", function() {
        localStorage.setItem("announceNotification", this.checked);
    });
    document.getElementById("mention").addEventListener("change", function() {
        localStorage.setItem("mentionNotification", this.checked);
    });
    document.getElementById("message").addEventListener("change", function() {
        localStorage.setItem("messageNotification", this.checked);
    });
};

function setup() {
    var announceNotification = localStorage.getItem("announceNotification") || true;
    var mentionNotification = localStorage.getItem("mentionNotification") || true;
    var messageNotification = localStorage.getItem("messageNotification") || false;
    document.getElementById("server-announcements").checked = JSON.parse(announceNotification);
    document.getElementById("mention").checked = JSON.parse(mentionNotification);
    document.getElementById("message").checked = JSON.parse(messageNotification);

    checkChecked();
};

window.onload = function() {
    try {
        setup();
    } catch(err) {
        alert(err);
    }
};