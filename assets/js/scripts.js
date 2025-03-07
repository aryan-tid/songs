function showMessage(messageText, messageType) {
    const message = document.getElementById("message");
    message.textContent = messageText;

    // Set color based on message type
    if (messageType === "positive") {
        message.style.backgroundColor = "#157815"; // Dark Green
        message.style.color = "white";
    } else {
        message.style.backgroundColor = "#D20103"; // Red
        message.style.color = "white";
    }

    // Show the message
    message.style.display = "block";

    // Hide message after 5 seconds
    setTimeout(() => {
        message.style.display = "none";
    }, 5000);
}
// Close message immediately on tap
document.getElementById("message").addEventListener("click", () => {
    document.getElementById("message").style.display = "none";
});

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function btnClicked(btn) {
    document.querySelector('.navbar-collapse').classList.remove('show');
    if (btn === 'browse') {
        const target = document.querySelector('.search-container');
        target.style.display ? target.style.removeProperty('display') : target.style.setProperty('display', 'none');
    }
}