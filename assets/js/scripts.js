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

const dropdownBtn = document.querySelector(".dropdown-btn");
const dropdownContent = document.querySelector(".dropdown-content");
const selectElement = document.querySelector(".universal-quality");

dropdownBtn.addEventListener("click", () => {
    dropdownContent.classList.toggle("hidden");

    if (!dropdownContent.classList.contains("hidden")) {
        dropdownContent.style.opacity = "1";
        dropdownContent.style.transform = "translateY(0)";
    } else {
        dropdownContent.style.opacity = "0";
        dropdownContent.style.transform = "translateY(-10px)";
    }
});

// Handle selection
document.querySelectorAll(".dropdown-content div").forEach(item => {
    item.addEventListener("click", () => {
        dropdownBtn.textContent = item.textContent + " ▾";
        selectElement.value = item.getAttribute("data-value"); // Update hidden select
        dropdownContent.classList.add("hidden");
        dropdownContent.style.opacity = "0";
        dropdownContent.style.transform = "translateY(-10px)";
    });
});

// Close dropdown when clicking outside
document.addEventListener("click", (event) => {
    if (!dropdownBtn.contains(event.target) && !dropdownContent.contains(event.target)) {
        dropdownContent.classList.add("hidden");
        dropdownContent.style.opacity = "0";
        dropdownContent.style.transform = "translateY(-10px)";
    }
});


const themeDropdownBtn = document.querySelector(".theme-dropdown-btn");
const themeDropdownContent = document.querySelector(".theme-dropdown-content");

themeDropdownBtn.addEventListener("click", () => {
    themeDropdownContent.classList.toggle("hidden");

    if (!themeDropdownContent.classList.contains("hidden")) {
        themeDropdownContent.style.opacity = "1";
        themeDropdownContent.style.transform = "translateY(0)";
    } else {
        themeDropdownContent.style.opacity = "0";
        themeDropdownContent.style.transform = "translateY(-10px)";
    }
});

// Handle selection
document.querySelectorAll(".theme-dropdown-content div").forEach(item => {
    item.addEventListener("click", () => {
        themeDropdownBtn.textContent = "Theme: " + item.textContent + " ▾";
        document.documentElement.setAttribute("data-bs-theme", item.getAttribute("data-bs-theme-value"));
        themeDropdownContent.classList.add("hidden");
        themeDropdownContent.style.opacity = "0";
        themeDropdownContent.style.transform = "translateY(-10px)";
    });
});

// Close dropdown when clicking outside
document.addEventListener("click", (event) => {
    if (!themeDropdownBtn.contains(event.target) && !themeDropdownContent.contains(event.target)) {
        themeDropdownContent.classList.add("hidden");
        themeDropdownContent.style.opacity = "0";
        themeDropdownContent.style.transform = "translateY(-10px)";
    }
});

document.querySelectorAll(".theme-dropdown-btn, .dropdown-btn").forEach(btn => {
    btn.addEventListener("click", function () {
        let dropdownContent = this.nextElementSibling;
        dropdownContent.classList.toggle("show");
    });
});

// Close dropdown when clicking outside
document.addEventListener("click", (event) => {
    document.querySelectorAll(".theme-dropdown-content, .dropdown-content").forEach(dropdown => {
        if (!dropdown.previousElementSibling.contains(event.target) && !dropdown.contains(event.target)) {
            dropdown.classList.remove("show");
        }
    });
});

function showSettings() {
    const settingsDiv = document.querySelector(".settings");
    if (settingsDiv) {
        if (settingsDiv.style.display === "none" || settingsDiv.style.display === "") {
            saveVisibilityState();
            hideAll();
            settingsDiv.style.display = "flex"; // Show settings
        }
    }
}

function loader(action) {
    const loader = document.querySelector(".loading-container");
    if (action === "show") {
        loader.style.display = "flex";
    } else if (action === "hide") {
        loader.style.display = "none";
    }  else {
        console.error("Invalid action");
        loader.style.display = "none";
    }
}