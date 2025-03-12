function updateAmount(amount) {
    document.getElementById('amount').innerHTML = amount;
}

function addAmount(amount) {
    amount += parseInt(document.getElementById('amount').innerHTML);
    db.ref("amountDonated/").set({
        amountDonated: amount,
    }).then(() => {
        db.ref("amountDonated/").once("value").then(function (amount) {
            document.getElementById('amount').innerHTML = amount.val().amountDonated;
        })
    })
}



db.ref("amountDonated/").on("value", (amount) => {
    document.getElementById('amount').innerHTML = amount.val().amountDonated;
})