function goToHome() {
    // Replace the current state with a clean one (removes all parameters)
    history.replaceState(null, "", window.location.origin + window.location.pathname);
    console.log("Navigated to Home");
    urlParameterDataLoad("default");
}


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
        showBrowse();
    }
}
// Function to handle dropdown toggling using `.show` class
function setupDropdown(dropdownBtnSelector, dropdownContentSelector) {
    const dropdownBtns = document.querySelectorAll(dropdownBtnSelector);
    const dropdownContents = document.querySelectorAll(dropdownContentSelector);

    dropdownBtns.forEach((btn, index) => {
        const content = dropdownContents[index];

        btn.addEventListener("click", () => {
            const isHidden = content.classList.toggle("show");

            if (!isHidden) {
                content.classList.remove("hidden");
            } else {
                content.classList.add("hidden");
            }
        });

        // Handle selection inside the dropdown
        content.querySelectorAll("div").forEach(item => {
            item.addEventListener("click", () => {
                btn.textContent = item.textContent + " ▾";

                // If it's the quality dropdown, update hidden select value and manage `.selected` class
                if (content.classList.contains("universal-quality")) {
                    document.querySelector(".universal-quality").value = item.getAttribute("data-value");

                    // Remove previous `selected` class
                    content.querySelectorAll(".selected").forEach(selectedItem => {
                        selectedItem.classList.remove("selected");
                    });

                    // Add `selected` class to the new selection
                    item.classList.add("selected");
                } else {
                    document.documentElement.setAttribute("data-bs-theme", item.getAttribute("data-bs-theme-value"));
                }

                // Close dropdown after selection
                content.classList.remove("show");
                content.classList.add("hidden");
            });
        });
    });

    // Close dropdowns when clicking outside
    document.addEventListener("click", (event) => {
        dropdownBtns.forEach((btn, index) => {
            const content = dropdownContents[index];

            if (!btn.contains(event.target) && !content.contains(event.target)) {
                content.classList.remove("show");
                content.classList.add("hidden");
            }
        });
    });
}

// Initialize dropdowns
setupDropdown(".theme-dropdown-btn", ".theme-dropdown-content");
setupDropdown(".dropdown-btn", ".dropdown-content");


let settingsStatePushed = false;

function showSettings() {
    const isSearchBoxHidden = getComputedStyle(document.querySelector(".search-container")).display === "none"
    const settingsDiv = document.querySelector(".settings");
    if (!settingsDiv) return;
    if (isSearchBoxHidden) {
        if (settingsDiv.style.display === "none" || settingsDiv.style.display === "") {
            settingsDiv.style.display = "flex"; // Show settings

            if (!settingsStatePushed) {
                history.pushState({ type: "hideSettings" }, ""); // Push hideSettings state
                history.pushState({ type: "previousState" }, ""); // Push dummy state
                console.log("Pushed state for hideSettings");
                settingsStatePushed = true;
            }
        } else {
            window.history.back(); // Go back
            settingsStatePushed = false;
        }
    } else {
        hide(".search-container");
    }
}


function loader(action) {
    const loader = document.querySelector(".loading-container");
    if (action === "show") {
        loader.style.display = "flex";
    } else if (action === "hide") {
        loader.style.display = "none";
    } else {
        console.error("Invalid action");
        loader.style.display = "none";
    }
}