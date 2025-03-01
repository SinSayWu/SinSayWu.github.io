currAmount = 0;
function updateAmount() {
    document.getElementById('amount').innerHTML = currAmount;
}

function addAmount(amount) {
    currAmount += amount;
    updateAmount();
}