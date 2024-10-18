// Function to get URL parameters
        function getUrlParameter(name) {
            name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
            var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
            var results = regex.exec(location.search);
            return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
        }

        function redirectTo(url) {
            window.location.href = url;
        }

        // Creating delay function
        function delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        // Function to fetch the latest version from a text file
        async function fetchLatestVersion() {
            try {
                const response = await fetch('https://aryan-tid.github.io/songs/latestVersion.txt'); // Replace with the actual path to latestVersion.txt
                if (response.ok) {
                    const text = await response.text();
                    return text.trim(); // Return the version as a trimmed string
                } else {
                    console.error('Failed to fetch latestVersion.txt');
                    return null;
                }
            } catch (error) {
                console.error('Error fetching latestVersion.txt:', error);
                return null;
            }
        }

        // Function to check version and redirect or show update message
        async function checkVersion() {
            const messageDiv = document.getElementById('message');

            // Fetch the expected version from latestVersion.txt
            const expectedVersion = await fetchLatestVersion();
            if (!expectedVersion) {
                messageDiv.innerHTML = 'Failed to fetch the latest version. Please try again later.';
                return;
            }

            // Get the version parameter from the URL
            const version = getUrlParameter('ver');

            await delay(500);

            if (!version) {
                // Redirect to a specified URL if no version parameter is present
                window.location.href = "#";
            } else if (version === expectedVersion) {
                // Redirect to the desired URL if version matches
                const hiddenButton = document.getElementById('hiddenButton');
                hiddenButton.click();
             //redirectTo("https://www.youtube.com");
            } else {
                // Hide loader
                document.getElementById('loader').style.display = 'none';

                // Show message to update the app
                messageDiv.innerHTML = `Your app version (${version || 'unknown'}) is outdated. Please update to the latest version.<br><a class="update-link" href="https://aryan9019.github.io/redirect_stotra/Stotra.apk" target="_blank">Download New App</a>`;
            }
        }

        // Call checkVersion on page load
        checkVersion();
