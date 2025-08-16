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

    // log out in another window check
    window.addEventListener("storage", function(event) {
        if (event.storageArea === localStorage && event.key === null) {
            location.reload();
        }
    })

    checkChecked();
};

window.onload = function() {
    try {
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