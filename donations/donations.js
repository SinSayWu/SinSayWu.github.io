function updateAmount(amount) {
    document.getElementById('amount').innerHTML = amount;
}

function addAmount(amount) {
    amount += parseInt(document.getElementById('amount').innerHTML);
    db.ref("other").set({
        amountDonated: amount,
    }).then(() => {
        db.ref("other").once("value").then(function (amount) {
            document.getElementById('amount').innerHTML = amount.val().amountDonated;
        })
    })
}



db.ref("other").on("value", (amount) => {
    document.getElementById('amount').innerHTML = amount.val().amountDonated;
})