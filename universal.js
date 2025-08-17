let curr_version = "v6.5"

function getUsername() {
    return localStorage.getItem("username");
}

function getPassword() {
    return localStorage.getItem("password");
}

function checkInput(input) {
    if (input == "") {
        alert("Cannot be blank");
        return false;
    }
    if (!/^[a-zA-Z0-9]+$/.test(input)) {
        alert("Invalid Characters. Only alphanumeric characters allowed.")
        return false;
    }
    if (input.includes("everyone")) {
        alert("No mention of everyone allowed.");
        return false;
    }
    if (input.includes("admin")) {
        alert("No impersonating admins");
        return false;
    }
    return true;
}

function sanitize(string) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        "/": '&#x2F;',
    };
    const reg = /[&<>"'/]/ig;
    return string.replace(reg, (match)=>(map[match]));
}

function convertToHTML(inputString) {
    // Render inline math \( ... \)
    let withInlineMath = inputString.replace(/\\\((.+?)\\\)/g, (_, expr) => {
        return katex.renderToString(expr, { throwOnError: false });
    });

    // Render display math \[ ... \]
    let withDisplayMath = withInlineMath.replace(/\\\[(.+?)\\\]/g, (_, expr) => {
        return katex.renderToString(expr, { displayMode: true, throwOnError: false });
    });

    // Convert Markdown to HTML
    return marked.parse(withDisplayMath);
}

function formatMessage(msg) {
    return msg
        .replace(/\r\n/g, "<br>")  // Windows newlines
        .replace(/\n/g, "<br>")    // Unix newlines
        .replace(/\r/g, "<br>");   // Old Mac newlines
}

function unsanitize(string) {
    const map = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#x27;': "'",
        '&#x2F;': '/',
    };
    const reg = /&amp;|&lt;|&gt;|&quot;|&#x27;|&#x2F;/ig;
    return string.replace(reg, (match) => map[match]);
}

/**
 * Shows a popup window.
 * @param {string} heading - The header element.
 * @param {string} content - The body element.
 * @param {[string, function][]} [buttonList = []] - All the buttons in the bar [label, function]
 * @param {float} [height=800] - The height of the popup
 * @param {float} [width=800] - The width of the popup
 * @returns {null} wow this param feature is kinda cool
 */
function showPopUp(heading, content, buttonList = [], height=640, width=800) {
    parent = document.body;
    
    // Create the overlay
    var overlay = document.createElement("div");
    overlay.setAttribute("class", "overlay");
    overlay.setAttribute("id", "popup");

    // Create the popup
    var popUp = document.createElement("div");
    popUp.setAttribute("class", "popUp");
    popUp.style.height = height + "px";
    popUp.style.width = width + "px";

    // Create the header and body
    var header = document.createElement("h1");
    header.setAttribute("class", "popup-heading");
    header.setAttribute("id", "popupHeading");
    var body = document.createElement("div");
    body.setAttribute("class", "popup-body");
    body.setAttribute("id", "popupBody");

    // Create the buttons
    var buttons = document.createElement("div");
    buttons.setAttribute("class", "popup-buttons");
    buttonList.forEach(([label, action]) => {
        var newButton = document.createElement("button");
        newButton.setAttribute("class", "popup-button");
        newButton.onclick = action;
        newButton.innerHTML = label;
        buttons.appendChild(newButton);
    })
    var closeButton = document.createElement("button");
    closeButton.setAttribute("class", "popup-button");
    closeButton.setAttribute("id", "closePopup")
    closeButton.onclick = () => {
        var popup = document.getElementById("popup");
        popup.remove();
    }
    closeButton.innerHTML = "Close";
    buttons.appendChild(closeButton);

    // Append header and body to popup
    var hr = document.createElement("hr");
    hr.setAttribute("class", "heading-hr");
    header.appendChild(hr);
    popUp.appendChild(header);
    popUp.appendChild(body);
    popUp.appendChild(buttons);
    
    // Append popup to overlay
    overlay.appendChild(popUp);
    
    // Append overlay to the parent element
    parent.appendChild(overlay);

    // Set the content of header and body
    header.innerHTML = heading;
    body.innerHTML = content;
}

const prefixes = ["", "K", "M", "B", "T", "Qu", "Qi"]

function shortenNumber(x) {
    var digits;
    var neg = (x < 0);
    x = Math.abs(x)
    if (x === 0) {
        digits = 1;
    } else {
        // digits = x.toString().length - 1;
        digits = Math.floor(Math.log10(x));
    }
    // console.log(digits);
    
    var threes = Math.floor(digits / 3);
    
    if (threes >= prefixes.length) {
        if (neg) {
            return -x;
        }
        return x;
    }
    x /= (10**(threes * 3));
    if (threes > 0) {
        x = x.toFixed(2);
    }
    
    if (neg) {
        return (-x) + prefixes[threes];
    }
    return x + prefixes[threes];
}