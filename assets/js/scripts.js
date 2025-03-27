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
    if (btn === 'browse') {
        showBrowse();
    }
}
async function showBrowse() {
  const target = document.querySelector('.search-container');
  target.style.display ? target.style.removeProperty('display') : target.style.setProperty('display', 'none');
  scrollToTop();
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



async function showSettings() {
    const settingsDiv = document.querySelector(".settings");
    if (settingsDiv.style.display === "none" || settingsDiv.style.display === "") {
        settingsDiv.style.display = "flex";
        scrollToTop();
    } else {
        settingsDiv.style.display = "none";
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

window.addEventListener("beforeunload", (event) => {
    event.preventDefault();
    event.returnValue = ""; // Necessary for showing the prompt in modern browsers
});


// Add this to your scripts.js or create a new file called app.js

// Current app version - must match the service worker version
const APP_VERSION = '3.1.9';

// Register service worker
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('ServiceWorker registered with scope:', registration.scope);
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('New service worker installed, update available');
                checkForUpdates(true); // Force version check
              }
            });
          });
        })
        .catch(error => {
          console.error('ServiceWorker registration failed:', error);
        });
    });
    
    // Listen for messages from service worker
    navigator.serviceWorker.addEventListener('message', event => {
      if (event.data && event.data.type === 'SHOW_DOWNLOADS') {
        getAllDownloadedSongs();
      }
    });
  }
}

// Check for app updates
function checkForUpdates(force = false) {
  // Only check if we're online
  if (navigator.onLine) {
    // Add cache-busting parameter to avoid getting cached version
    fetch(`/assets/js/version.json?t=${Date.now()}`)
      .then(response => response.json())
      .then(data => {
        console.log(`Current version: ${APP_VERSION}, Server version: ${data.version}`);
        
        if (data.version !== APP_VERSION || force) {
          // New version detected
          if (confirm(`New version (${data.version}) available. Update now?`)) {
            // Clear cache and reload
            if ('caches' in window) {
              caches.keys().then(cacheNames => {
                return Promise.all(
                  cacheNames.map(cacheName => {
                    return caches.delete(cacheName);
                  })
                );
              }).then(() => {
                window.location.reload(true);
              });
            } else {
              window.location.reload(true);
            }
          }
        }
      })
      .catch(err => console.log('Version check failed:', err));
  }
}

// Check online/offline status and redirect to downloads page if offline
function checkConnectivity() {
  const offlineIndicator = document.getElementById('offline-indicator');
  
  if (!navigator.onLine) {
    console.log('App is offline');
    document.body.classList.add('offline-mode');
    
    if (offlineIndicator) {
      offlineIndicator.style.display = 'block';
    }
    
    // Automatically show downloads page when offline
    getAllDownloadedSongs();
    
    // Notify service worker
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'OFFLINE_READY'
      });
    }
  } else {
    console.log('App is online');
    document.body.classList.remove('offline-mode');
    
    if (offlineIndicator) {
      offlineIndicator.style.display = 'none';
    }
    
    // Check for updates when coming online
    checkForUpdates();
  }
}

// Initialize the app
function initApp() {
  // Register service worker
  registerServiceWorker();
  
  // Set up online/offline event listeners
  window.addEventListener('online', checkConnectivity);
  window.addEventListener('offline', checkConnectivity);
  
  // Initial connectivity check
  checkConnectivity();
  
  // Check for parameter to show downloads
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('downloads')) {
    getAllDownloadedSongs();
  }
  
  // Check for updates periodically (every hour)
  setInterval(checkForUpdates, 3600000);
}

// Call initApp when the document is ready
document.addEventListener('DOMContentLoaded', initApp);