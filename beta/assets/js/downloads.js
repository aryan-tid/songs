async function requestPersistentStorage() {
    if (navigator.storage && navigator.storage.persist) {
        const granted = await navigator.storage.persist();
        console.log(granted ? "Persistent storage granted" : "Persistent storage denied");
    }
}

async function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("MelodifyDB", 1);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains("songs")) {
                const store = db.createObjectStore("songs", { keyPath: "songID" });
                store.createIndex("name", "songName", { unique: false });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function fetchBlob(url) {
    const response = await fetch(url);
    return response.blob();
}

// ✅ Function to Check if a Song is Already Downloaded
async function isSongDownloaded(songID) {
    const db = await openDatabase();
    return new Promise((resolve) => {
        const transaction = db.transaction("songs", "readonly");
        const store = transaction.objectStore("songs");
        const request = store.get(songID);
        request.onsuccess = () => resolve(!!request.result);
        request.onerror = () => resolve(false);
    });
}

async function downloadSong(songID, songName, songArtists, songURL, songImg) {
    try {
        await requestPersistentStorage();

        // First check if song already exists
        const isDownloaded = await isSongDownloaded(songID);
        if (isDownloaded) {
            showMessage(`"${songName}" is already downloaded.`, "positive");
            return;
        }

        // Show starting message
        showMessage(`Downloading "${songName}": 0%`, "positive");

        // Function to fetch with progress tracking
        async function fetchWithProgress(url, progressCallback) {
            const response = await fetch(url);
            const reader = response.body.getReader();
            const contentLength = +response.headers.get('Content-Length') || 0;

            let receivedLength = 0;
            let chunks = [];

            while (true) {
                const { done, value } = await reader.read();

                if (done) {
                    break;
                }

                chunks.push(value);
                receivedLength += value.length;

                const percentage = contentLength ?
                    Math.round((receivedLength / contentLength) * 100) :
                    'unknown';

                progressCallback(percentage);
            }

            const allChunks = new Uint8Array(receivedLength);
            let position = 0;
            for (const chunk of chunks) {
                allChunks.set(chunk, position);
                position += chunk.length;
            }

            return new Blob([allChunks]);
        }

        // Fetch audio with progress
        const audioBlob = await fetchWithProgress(songURL, (percentage) => {
            if (percentage !== 'unknown') {
                showMessage(`Downloading "${songName}": ${percentage}%`, "positive");
            }
        });

        // Fetch image (usually smaller, so no progress tracking)
        const imageBlob = await fetchBlob(songImg);

        // Now open the database and start a new transaction for writing
        const db = await openDatabase();
        const transaction = db.transaction("songs", "readwrite");
        const store = transaction.objectStore("songs");

        return new Promise((resolve, reject) => {
            showMessage(`Saving "${songName}" to library...`, "positive");

            const putRequest = store.put({
                songID,
                songName,
                songArtists,
                audioBlob,
                imageBlob
            });

            putRequest.onsuccess = () => {
                showMessage(`"${songName}" successfully downloaded!`, "positive");
                resolve();
            };

            putRequest.onerror = (event) => {
                showMessage(`Error saving "${songName}".`, "negative");
                console.error("Error saving song to IndexedDB", event.target.error);
                reject(event.target.error);
            };

            transaction.oncomplete = () => {
                console.log(`Transaction completed for "${songName}".`);
            };

            transaction.onerror = (event) => {
                showMessage(`Transaction error for "${songName}".`, "negative");
                console.error("Transaction error", event.target.error);
                reject(event.target.error);
            };
        });
    } catch (error) {
        showMessage(`Error: ${error.message}`, "negative");
        console.error("Error downloading song:", error);
        throw error; // Re-throw the error to be handled by the caller
    }
}
async function getSongUrl(songID) {
    try {
        const db = await openDatabase();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction("songs", "readonly");
            const store = transaction.objectStore("songs");

            const request = store.get(songID);

            request.onsuccess = () => {
                const songData = request.result;
                if (songData) {
                    const objectUrl = URL.createObjectURL(songData.audioBlob);
                    resolve(objectUrl);
                } else {
                    console.log("Song not found in storage.");
                    resolve(null);
                }
            };

            request.onerror = (event) => {
                console.error("Error getting song from IndexedDB", event.target.error);
                reject(event.target.error);
            };
        });
    } catch (error) {
        console.error("Error in getSongUrl:", error);
        return null;
    }
}

// Example usage
async function playSong(songID) {
    const song = await getSong(songID);
    if (song) {
        document.querySelector("audio").src = song.songURL;
        document.querySelector("img").src = song.songImg;
        console.log(`Now Playing: ${song.songName} by ${song.songArtists}`);
    }
}

async function getAllDownloadedSongs() {
    loader("show");
    scrollToTop();
    history.pushState("", "", "?downloads=songs");
    const db = await openDatabase();
    const transaction = db.transaction("songs", "readonly");
    const store = transaction.objectStore("songs");

    const request = store.getAll();

    // Create new container before replacing old one
    const newContent = document.createElement("div");
    newContent.classList.add("song-card-container");

    const resultDiv = document.querySelector(".song-card-container");
    if (resultDiv) {
        resultDiv.replaceWith(newContent);
    }

    const textHeading = document.querySelector(".card-list-header");
    if (textHeading) {
        textHeading.innerHTML = "Downloaded Songs";
    }

    const songListImg = document.getElementById("songList");
    if (songListImg) {
        songListImg.src = "./logo.png";
    }

    request.onsuccess = () => {
        const songs = request.result;
        if (songs.length === 0) {
            console.log("No downloaded songs found.");
            // return;
        }

        console.log("Downloaded Songs List:");
        songs.forEach(song => {
            const songID = song.songID;
            const songName = song.songName;
            const songArtists = song.songArtists;
            const songImg = URL.createObjectURL(song.imageBlob); // Convert to viewable image URL

            console.log({ songID, songName, songArtists, songImg });

            const card = document.createElement("div");
            card.classList.add("container", "song-card");

            card.innerHTML = `
                <div class="song-card-cont1">
                    <img class="song-card-img" src="${songImg}" />
                    <div class="song-details">
                        <span class="song-card-name">${songName}</span>
                        <span class="song-card-artists">${songArtists}</span>
                        <span class="song-card-song-id hidden">${songID}</span>
                        <span class="song-card-song-imgHD hidden">${songImg}</span>
                    </div>
                </div>
                <div class="song-card-cont1">
                    <button class="btn btn-primary song-card-btn-queue song-card-btn" type="button">
                        <i class="icon ion-android-add"></i>
                    </button>
                    <button class="btn btn-primary song-card-btn-menu" type="button">
                        <i class="icon-options-vertical" style="font-size: 16px;"></i>
                    </button>
                    <!-- Dropdown menu structure (initially hidden) -->
                        <div class="dropdown-menu" style="display: none;">
                            <div class="dropdown-menu-item" data-action="delete">
                                <i class="icon ion-android-download"></i>
                                <span>Delete</span>
                            </div>
                        </div>
                </div>
            `;

            // Play song on click
            card.addEventListener("click", async () => {
                const songURL = await getSongUrl(songID); // Await song URL
                firstPlayAudio(songName, songURL, songImg, songArtists, songID);
            });

            // Add to queue button
            const addSongToQueueBtn = card.querySelector(".song-card-btn-queue");
            if (addSongToQueueBtn) {
                addSongToQueueBtn.addEventListener("click", async (event) => {
                    event.stopPropagation();
                    const songURL = await getSongUrl(songID); // Await song URL
                    addSongToQueue(songURL, songImg, songName, songID, songArtists);
                });
            }
            const menuBtn = card.querySelector(".song-card-btn-menu");
            if (menuBtn) {

                // Find the dropdown that's a sibling of this button
                const dropdown = menuBtn.nextElementSibling;

                if (dropdown && dropdown.classList.contains("dropdown-menu")) {
                    // Toggle dropdown on button click
                    menuBtn.addEventListener("click", (event) => {
                        event.stopPropagation(); // Prevent card click

                        // Hide all other dropdowns
                        document.querySelectorAll('.dropdown-menu').forEach(menu => {
                            if (menu !== dropdown) {
                                menu.style.display = 'none';
                            }
                        });

                        // Toggle current dropdown
                        const isVisible = dropdown.style.display === 'block';
                        dropdown.style.display = isVisible ? 'none' : 'block';

                        if (!isVisible) {
                            // Position the dropdown
                            const buttonRect = menuBtn.getBoundingClientRect();
                            dropdown.style.position = 'absolute';
                            dropdown.style.top = `${buttonRect.bottom + window.scrollY + 5}px`;
                            dropdown.style.left = `${buttonRect.left + window.scrollX - 120}px`;
                        }
                    });

                    // Add click handlers for dropdown items
                    dropdown.querySelectorAll('.dropdown-menu-item').forEach(item => {
                        item.addEventListener("click", async (event) => {
                            event.stopPropagation(); // Prevent event bubbling
                            const action = item.getAttribute('data-action');

                            // Handle different actions
                            switch (action) {
                                case 'delete':
                                    event.stopPropagation(); // Stop the event from bubbling up to the card click event
                                    const deleted = await deleteSong(songID);

                                    if (deleted) {
                                        // Update your UI as needed
                                        // For example, refresh the downloads list
                                        await getAllDownloadedSongs();
                                    }
                                    break;
                                case 'add-playlist':
                                    console.log(`Add to playlist: ${songName}`);
                                    // Add to playlist logic here
                                    break;
                                case 'share':
                                    console.log(`Share song: ${songName}`);
                                    // Share logic
                                    if (navigator.share) {
                                        navigator.share({
                                            title: songName,
                                            text: `Check out ${songName} by ${songArtists}`,
                                            url: `${window.location.origin}`
                                        }).catch(err => console.error('Share failed:', err));
                                    } else {
                                        // Fallback - copy to clipboard
                                        const shareUrl = `${window.location.origin}`;
                                        navigator.clipboard.writeText(shareUrl)
                                            .then(() => alert('Link copied to clipboard!'))
                                            .catch(err => console.error('Failed to copy:', err));
                                    }
                                    break;
                                case 'info':
                                    console.log(`Info for: ${songName}`);
                                    // Show info logic
                                    break;
                            }

                            dropdown.style.display = 'none';
                        });
                    });
                }
            }


            newContent.appendChild(card);
        });
        hideAll();
        show("#headingOptions");
        show(".main-content");
        show(".song-card-list");
        show("#songList");

        const btnAddListToQueue = document.querySelector('.add-list-to-queue');
        btnAddListToQueue.onclick = async () => {
            clearQueue();
            btnAddListToQueue.disabled = true;

            // Use the songs from your database query
            for (const song of songs) {
                const songURL = await getSongUrl(song.songID);
                addSongToQueue(songURL, URL.createObjectURL(song.imageBlob), song.songName, song.songID, song.songArtists);
            }

            btnAddListToQueue.disabled = false;
        };

    };

    request.onerror = () => {
        console.error("Error retrieving songs from storage.");
    };
    const mainContent = document.querySelector(".page-buttons");
    if (mainContent) {
        mainContent.innerHTML = '';
    }
    loader("hide");
}

/**
 * Deletes a downloaded song from IndexedDB storage by its ID
 * @param {string} songID - The unique ID of the song to delete
 * @returns {Promise<boolean>} - Resolves to true if deletion was successful, false otherwise
 */
async function deleteSong(songID) {
    try {
        // First check if song exists
        const isDownloaded = await isSongDownloaded(songID);
        if (!isDownloaded) {
            showMessage(`Song not found in downloads.`, "negative");
            return false;
        }

        const db = await openDatabase();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction("songs", "readwrite");
            const store = transaction.objectStore("songs");

            // Get song info for the deletion message
            const getRequest = store.get(songID);

            getRequest.onsuccess = () => {
                const songData = getRequest.result;
                const songName = songData ? songData.songName : "Song";

                // Delete the song
                const deleteRequest = store.delete(songID);

                deleteRequest.onsuccess = () => {
                    showMessage(`"${songName}" removed from downloads.`, "positive");

                    // If you have an object URL for this song in memory, revoke it
                    // This is important to prevent memory leaks
                    if (songData && songData.objectUrl) {
                        URL.revokeObjectURL(songData.objectUrl);
                    }

                    resolve(true);
                };

                deleteRequest.onerror = (event) => {
                    showMessage(`Error removing "${songName}".`, "negative");
                    console.error("Error deleting song from IndexedDB", event.target.error);
                    reject(event.target.error);
                };
            };

            getRequest.onerror = (event) => {
                console.error("Error getting song info before deletion", event.target.error);

                // Still try to delete even if we couldn't get the song info
                const deleteRequest = store.delete(songID);

                deleteRequest.onsuccess = () => {
                    showMessage("Song removed from downloads.", "positive");
                    resolve(true);
                };

                deleteRequest.onerror = (event) => {
                    showMessage("Error removing song.", "negative");
                    console.error("Error deleting song from IndexedDB", event.target.error);
                    reject(event.target.error);
                };
            };

            transaction.oncomplete = () => {
                console.log(`Delete transaction completed for song ID: ${songID}`);
            };

            transaction.onerror = (event) => {
                showMessage("Transaction error while deleting song.", "negative");
                console.error("Transaction error", event.target.error);
                reject(event.target.error);
            };
        });
    } catch (error) {
        showMessage(`Error: ${error.message}`, "negative");
        console.error("Error deleting song:", error);
        return false;
    }
}