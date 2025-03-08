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
    playAudio(name, urlencoded, Image, artist);
    currentIndexPlaylist = index;
    audio1("play");
    populateSongQueue();
}
async function nextTrack() {
    if (autoplay) {
        if (currentIndexPlaylist === playlistSongUrl.length - 2) {
            currentIndexPlaylist++;
            const songID = playlistSongId[currentIndexPlaylist];
            loadTrack(currentIndexPlaylist);
            await addRecomendationsToQueue(songID); // Wait for recommendations to be added
        } else if (currentIndexPlaylist < playlistSongUrl.length - 1) {
            currentIndexPlaylist++;
            loadTrack(currentIndexPlaylist);
        } else {
            audio1("pause");
            console.log("current index", currentIndexPlaylist);
            
            await addRecomendationsToQueue(playlistSongId[currentIndexPlaylist]); // Ensure queue is updated before playing
            
            currentIndexPlaylist++;
            loadTrack(currentIndexPlaylist);
            populateSongQueue();
        }
    } else if (currentIndexPlaylist < playlistSongUrl.length - 1) {
        currentIndexPlaylist++;
        loadTrack(currentIndexPlaylist);
    } else {
        showMessage('End of Queue', "negative");
        audio1("pause");
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

    // Check if there are upcoming songs
    if (currentIndexPlaylist + 1 >= playlistSongName.length) {
        const message = document.createElement("div");
        message.classList.add("no-songs-message");
        message.innerText = "No upcoming songs in the queue";
        queueContainer.appendChild(message);
        return; // Stop execution since there's nothing to add
    }

    // Start from the next song after the current index
    for (let index = currentIndexPlaylist + 1; index < playlistSongName.length; index++) {
        const songCard = document.createElement("div");
        songCard.classList.add("container", "song-card-queue2");

        songCard.innerHTML = `
            <div class="song-card-cont1">
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

        // Attach click event to load the song
        songCard.addEventListener("click", () => {
            loadTrack(index);
        });

        queueContainer.appendChild(songCard); // Append to queue container
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
            playlistSongImg.push(song.image?.[0]?.url || "");
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
