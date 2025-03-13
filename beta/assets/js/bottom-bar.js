const buttons = document.querySelectorAll(".bottom-bar-btn");
document.addEventListener("DOMContentLoaded", function () {

    buttons.forEach(button => {
        button.addEventListener("click", function () {
            // Remove the 'selected' class from all buttons
            buttons.forEach(btn => btn.classList.remove("selected"));

            // Add 'selected' class to the clicked button
            this.classList.add("selected");
        });
    });
});

function refreshBottomBar(selectedButton) {
    if (selectedButton === "home") selectedButton = document.querySelector("#bottomBarHome");
    if (selectedButton === "search") selectedButton = document.querySelector("#bottomBarSearch");
    if (selectedButton === "library") selectedButton = document.querySelector("#bottomBarLibrary");
    if (selectedButton === "settings") selectedButton = document.querySelector("#bottomBarSettings");
    if (selectedButton === "downloads") selectedButton = document.querySelector("#bottomBarDownloads");
    if (!selectedButton) return;
    const buttons = document.querySelectorAll(".bottom-bar-btn");
    buttons.forEach(btn => btn.classList.remove("selected"));
    selectedButton.classList.add("selected");
}