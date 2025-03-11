// Load the next song in the queue
let playlistSongUrl = [];
let playlistSongImg = [];
let playlistSongName = [];
let playlistSongId = [];
let playlistSongArtist = [];
let currentIndexPlaylist = 0;


// Default value
let allowDuplicates = false;

// Get elements
const toggleContainer = document.getElementById("toggleSwitchCont");
const toggleSwitch = document.getElementById("allowDuplicatesToggle");
const toggleStatus = document.getElementById("toggleStatus");

// Set initial state
toggleSwitch.checked = allowDuplicates;
toggleStatus.textContent = allowDuplicates ? "True" : "False";

// Function to toggle the switch
function toggleAllowDuplicates() {
    allowDuplicates = !allowDuplicates;
    toggleSwitch.checked = allowDuplicates;
    toggleStatus.textContent = allowDuplicates ? "True" : "False";
    console.log("Allow Duplicates:", allowDuplicates);
}

// Event listener for the entire container
toggleContainer.addEventListener("click", function (event) {
    // Prevent the event from firing twice if clicking directly on the checkbox
    if (event.target !== toggleSwitch) {
        toggleAllowDuplicates();
    }
});

// Also toggle when clicking the checkbox directly
toggleSwitch.addEventListener("change", toggleAllowDuplicates);

function toggleAutoplay() {
    const autoPlayCheck = document.getElementById("autoPlaySwitch"); // Corrected ID
    autoplay = !autoplay;
    autoPlayCheck.checked = autoplay; // Reflect change in checkbox state
    if (autoplay) {
        autoplaySongs();
    }
}

function clearQueue() {
    playlistSongUrl = [];
    playlistSongArtist = [];
    playlistSongImg = [];
    playlistSongName = [];
    playlistSongId = [];
    currentIndexPlaylist = 0;
    audio1("pause");
    audio1("src", "");
    showMessage("Queue Cleared", "positive");
    populateSongQueue();
}

function findSongIndex(songID) {
    const index = playlistSongId.indexOf(songID);
    return index !== -1 ? index : false;
}

function addSongToQueue(songURL, songIMG, songNAME, songID, songArtist) {
    if (!allowDuplicates) {
        const index = findSongIndex(songID);
        if (index !== false) {
            showMessage(`'${songNAME}' already exists in Queue`, "negative");
            return;
        } else {
            forceAddSongToQueue(songURL, songIMG, songNAME, songID, songArtist);
        }
    } else {
        forceAddSongToQueue(songURL, songIMG, songNAME, songID, songArtist);
    }
    populateSongQueue();
}

function forceAddSongToQueue(songURL, songIMG, songNAME, songID, songArtist) {
    const wasQueueEmpty = playlistSongUrl.length === 0;
    playlistSongUrl.push(songURL);
    playlistSongImg.push(songIMG);
    playlistSongName.push(songNAME);
    playlistSongId.push(songID);
    playlistSongArtist.push(songArtist);

    if (wasQueueEmpty && playlistSongUrl.length > 0) {
        currentIndexPlaylist = 0;
        loadTrack(currentIndexPlaylist);
    }
}

function loadTrack(index) {
    const name = playlistSongName[index];
    const urlencoded = playlistSongUrl[index];
    const Image = playlistSongImg[index];
    const artist = playlistSongArtist[index];
    console.log("Song Name: ", name);
    console.log("Song URL: ", urlencoded);
    console.log("Song Image: ", Image);
    console.log("Song Artist: ", artist);
    playAudio(name, urlencoded, Image, artist);
    currentIndexPlaylist = index;
    audio1("play");
    populateSongQueue();
}

async function nextTrack() {
    if (autoplay) {
        if (currentIndexPlaylist === playlistSongUrl.length - 1) {
            await autoplaySongs();
            currentIndexPlaylist++;
            loadTrack(currentIndexPlaylist);
        } else if (currentIndexPlaylist < playlistSongUrl.length - 1) {
            currentIndexPlaylist++;
            loadTrack(currentIndexPlaylist);
        } else {
            autoplaySongs();
        }
    } else if (currentIndexPlaylist === playlistSongUrl.length - 1) {
        showMessage("End of Queue", "negative");
        audio1("pause");
    } else {
        currentIndexPlaylist++;
        loadTrack(currentIndexPlaylist);
    }

    populateSongQueue();
}

function previousTrack() {
    index = currentIndexPlaylist;
    if (index === 0) {
        showMessage("Start of Queue", "negative");
    } else {
        currentIndexPlaylist = index - 1;
        loadTrack(currentIndexPlaylist);
    }
    populateSongQueue();
}

const queueContainer = document.querySelector(".song-card-container-queue"); // Parent container for song cards

function populateSongQueue() {
    queueContainer.innerHTML = ""; // Clear previous items

    if (currentIndexPlaylist + 1 >= playlistSongName.length) {
        const message = document.createElement("div");
        message.classList.add("no-songs-message");
        message.innerText = "No upcoming songs in the queue";
        queueContainer.appendChild(message);
        return;
    }

    for (let index = currentIndexPlaylist + 1; index < playlistSongName.length; index++) {
        const songCard = document.createElement("div");
        songCard.classList.add("container", "song-card-queue2");
        songCard.setAttribute("data-index", index - currentIndexPlaylist - 1); // Adjust index for queue position

        // Add a drag handle element
        songCard.innerHTML = `
            <div class="song-card-cont1">
                <div class="drag-handle" style="cursor: move; margin-right: 8px; color: #888;">
                    <i class="icon-menu" style="font-size: 16px;"></i>
                </div>
                <img class="song-card-img" src="${playlistSongImg[index]}" />
                <div class="song-details">
                    <span class="song-card-name">${playlistSongName[index]}</span>
                    <span class="song-card-artists">${playlistSongArtist[index]}</span>
                    <span class="song-card-song-id hidden">${playlistSongId[index]}</span>
                    <span class="song-card-song-index hidden">${index}</span>
                    <span class="song-card-song-imgHD hidden">${playlistSongImg[index]}</span>
                </div>
            </div>
            <div class="song-card-cont1">
                <button class="btn btn-primary song-card-btn" type="button">
                    <i class="icon-options-vertical" style="font-size: 16px;"></i>
                </button>
            </div>
        `;

        // Add tap/click event to the song details area to play the song
        const songDetails = songCard.querySelector(".song-details");
        songDetails.addEventListener("click", (e) => {
            e.stopPropagation(); // Prevent event bubbling
            loadTrack(index);
        });

        queueContainer.appendChild(songCard);
    }

    // Initialize drag and drop after all items are added
    initializeTouchFriendlySortable();
}

function initializeTouchFriendlySortable() {
    const existingInstance = Sortable.get(queueContainer);
    if (existingInstance) {
        existingInstance.destroy();
    }

    new Sortable(queueContainer, {
        // Key animation settings for smooth movement
        animation: 300,
        easing: "cubic-bezier(0.2, 1, 0.2, 1)",

        // Animation classes
        ghostClass: "sortable-ghost",
        chosenClass: "sortable-chosen",
        dragClass: "sortable-drag",

        // Core settings
        handle: ".drag-handle",
        forceFallback: true,
        fallbackOnBody: true,
        fallbackClass: "sortable-fallback",

        // Improved scroll behavior
        bubbleScroll: true,
        scrollSpeed: 40,
        scrollSensitivity: 120,

        // Touch settings
        touchStartThreshold: 5,
        delay: 0,
        delayOnTouchOnly: true,

        // Swap behavior - critical for smooth animations
        animation: 150,  // ms, animation time when item is moved
        swapThreshold: 0.65, // Percentage of the item that has to overlap to trigger swap
        invertSwap: false, // Set to true if you want to invert swap direction
        direction: 'vertical', // Direction of sorting

        // Enable these important options for smooth movement
        setData: function (dataTransfer, dragEl) {
            dataTransfer.setData('Text', dragEl.textContent);
        },

        onChoose: function (evt) {
            evt.item.classList.add('being-dragged');
        },

        onChange: function (evt) {
            // This fires when the order changes during dragging
            // A perfect place to add custom animation for the other elements
            const items = Array.from(queueContainer.children);
            items.forEach(item => {
                if (!item.classList.contains('being-dragged') && !item.classList.contains('sortable-ghost')) {
                    item.style.transition = "transform 0.2s ease-out, opacity 0.2s ease-out";
                }
            });
        },

        onStart: function (evt) {
            document.body.classList.add("disable-scrolling");

            // Add data-index to track original positions
            Array.from(queueContainer.children).forEach((el, i) => {
                el.setAttribute('data-original-index', i);
            });

            // Remove extra clones that might appear
            setTimeout(() => {
                const clones = document.querySelectorAll(".sortable-fallback:not(:first-child)");
                clones.forEach(clone => clone.remove());
            }, 10);
        },

        onEnd: function (evt) {
            document.body.classList.remove("disable-scrolling");
            evt.item.classList.remove('being-dragged');

            // Process the reordering if positions changed
            if (evt.oldIndex !== evt.newIndex) {
                const realOldIndex = evt.oldIndex + currentIndexPlaylist + 1;
                const realNewIndex = evt.newIndex + currentIndexPlaylist + 1;
                processQueueReorder(realOldIndex, realNewIndex);
            }
        }
    });
}

// Add this helper function to enhance the animation behavior
function processQueueReorder(oldIndex, newIndex) {
    console.log(`Reordering from ${oldIndex} to ${newIndex}`);

    // Create temporary copies of arrays
    const tempSongNames = [...playlistSongName];
    const tempSongImgs = [...playlistSongImg];
    const tempSongArtists = [...playlistSongArtist];
    const tempSongIds = [...playlistSongId];
    const tempSongUrls = [...playlistSongUrl];

    // Remove from old position and insert at new position
    const movedName = tempSongNames.splice(oldIndex, 1)[0];
    tempSongNames.splice(newIndex, 0, movedName);

    const movedImg = tempSongImgs.splice(oldIndex, 1)[0];
    tempSongImgs.splice(newIndex, 0, movedImg);

    const movedArtist = tempSongArtists.splice(oldIndex, 1)[0];
    tempSongArtists.splice(newIndex, 0, movedArtist);

    const movedId = tempSongIds.splice(oldIndex, 1)[0];
    tempSongIds.splice(newIndex, 0, movedId);

    const movedUrl = tempSongUrls.splice(oldIndex, 1)[0];
    tempSongUrls.splice(newIndex, 0, movedUrl);

    // Update the original arrays
    playlistSongName = tempSongNames;
    playlistSongImg = tempSongImgs;
    playlistSongArtist = tempSongArtists;
    playlistSongId = tempSongIds;
    playlistSongUrl = tempSongUrls;

    // Refresh the queue UI with a slight delay to allow animations to complete
    setTimeout(() => {
        populateSongQueue();
    }, 300);
}


async function autoplaySongs() {
    if (autoplay) {
        if (currentIndexPlaylist === playlistSongUrl.length - 1) {
            const id = playlistSongId[currentIndexPlaylist];
            await addRecomendationsToQueue(id);
        } else {
            return;
        }
    } else {
        showMessage("Autoplay is disabled", "negative");
    }
}

async function addRecomendationsToQueue(id) {
    try {
        const response = await fetch(`https://jiosavan-api-tawny.vercel.app/api/songs/${id}/suggestions`);
        const data = await response.json();

        if (!data.success || !data.data.length) {
            console.error("No suggestions found");
            return;
        }

        // Function to get selected quality URL
        function getSelectedQuality(downloadUrls) {
            // Define your preferred quality order
            const preferredQualities = ["320kbps", "160kbps", "96kbps"];

            for (let quality of preferredQualities) {
                const match = downloadUrls.find(urlObj => urlObj.quality === quality);
                if (match) return match.url;
            }
            return downloadUrls[0]?.url || ""; // Fallback
        }

        data.data.forEach(song => {
            playlistSongUrl.push(getSelectedQuality(song.downloadUrl));
            playlistSongImg.push(song.image?.[2]?.url || "");
            console.log("song.image", song.image?.[2]?.url);
            playlistSongName.push(song.name || "");
            playlistSongId.push(song.id || "");

            const primaryArtist = song.artists?.primary?.[0]?.name || "Unknown Artist";
            playlistSongArtist.push(primaryArtist);
        });

        console.log("All suggested songs added to queue");
    } catch (error) {
        console.error("Error adding songs to queue:", error);
    }
    populateSongQueue();
    showMessage('Recommendations Added to Queue', "positive");
}
