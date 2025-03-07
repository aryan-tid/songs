// Load the next song in the queue
let playlistSongUrl = [];
let playlistSongImg = [];
let playlistSongName = [];
let playlistSongId = [];
let playlistSongArtist = [];
let currentIndexPlaylist = 0;
let allowDuplicates = false;


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
}


// Next aim is to adjust currentIndexPlaylist to the index of the song that is currently playing
// This will allow the user to skip to the next song in the queue
// This will also allow the user to skip to the previous song in the queue
// This will also allow the user to remove a song from the queue
// This will also allow the user to shuffle the queue
// This will also allow the user to repeat the queue
// This will also allow the user to repeat a song
// This will also allow the user to play a song from the queue
// This will also allow the user to play a song from the search results
// This will also allow the user to play a song from the playlist
// This will also allow the user to play a song from the album
// This will also allow the user to play a song from the artist
// This will also allow the user to play a song from the genre










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
    populateSongQueue();
}
function nextTrack() {
    index = currentIndexPlaylist;
    if (playlistSongName.length - 1 === index) {
        showMessage("End of Queue", "negative");
        audio1("pause");
    } else {
        currentIndexPlaylist = index + 1;
        loadTrack(currentIndexPlaylist);
    }
}
function previousTrack() {
    index = currentIndexPlaylist;
    if (index === 0) {
        showMessage("Start of Queue", "negative");
    } else {
        currentIndexPlaylist = index - 1;
        loadTrack(currentIndexPlaylist);
    }
}

const queueContainer = document.querySelector(".song-card-container-queue"); // Parent container for song cards

function populateSongQueue() {
    queueContainer.innerHTML = ""; // Clear previous items

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
