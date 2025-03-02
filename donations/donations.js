function updateAmount() {
    db.ref("amountDonated").once("value").then(function (amount) {
        document.getElementById('amount').innerHTML = amount.val();
    })
}

function addAmount(amount) {
    db.ref("amountDonated").set(getAmount() + amount);
    updateAmount();
}

window.onload = function() {
    updateAmount();
}