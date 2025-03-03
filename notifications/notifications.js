function setup() {
    var announceNotification = localStorage.getItem("announceNotification");
    if (announceNotification === null) {
        announceNotification = true;  // Set a default value
    }
    var mentionNotification = localStorage.getItem("mentionNotification");
    if (mentionNotification === null) {
        mentionNotification = true;  // Set a default value
    }
    var messageNotification = localStorage.getItem("messageNotification");
    if (messageNotification === null) {
        messageNotification = false;  // Set a default value
    }
    alert('works')
    document.getElementById("server-announcements").checked = true;
    document.getElementById("mention").checked = localStorage.getItem("mentionNotification");
    document.getElementById("message").checked = localStorage.getItem("messageNotification");


    document.getElementById("server-announcements").addEventListener("change", function() {
        if (this.checked) {
            localStorage.setItem("announceNotification", true);
        } else {
            localStorage.setItem("announceNotification", false);
        }
    });
    document.getElementById("mention").addEventListener("change", function() {
        if (this.checked) {
            localStorage.setItem("mentionNotification", true);
        } else {
            localStorage.setItem("mentionNotification", false);
        }
    });
    document.getElementById("message").addEventListener("change", function() {
        if (this.checked) {
            localStorage.setItem("messageNotification", true);
        } else {
            localStorage.setItem("messageNotification", false);
        }
    });
}

window.onload() = function() {
    alert('setup')
    setup();
}