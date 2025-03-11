let autoplay = false;
const audio = document.querySelector(".audio-file audio");
const playPauseBtn = document.querySelector(".play-pause-btn");
const playPauseBtn1 = document.querySelector(".play-pause-btn1");
const playPauseBtn22 = document.querySelector(".play-pause-btn22");
const currentTimeElement = document.querySelector(".currentTime");
const totalTimeElement = document.querySelector(".totalTime");
const currentTimeElement1 = document.querySelector(".currentTime1");
const totalTimeElement1 = document.querySelector(".totalTime1");
const progressBar = document.querySelector(".progress12");
const progressBarContainer = document.querySelector(".progress-bar12");
const progressBar1 = document.querySelector(".progress123");
const progressBarContainer1 = document.querySelector(".progress-bar123");
const expandPlayer = document.querySelector(".expand-player");
const audioPlayer1 = document.querySelector(".audio-player11");
const playIcon = '<i class="fas fa-play"></i>';  // Play icon
const pauseIcon = '<i class="fas fa-pause"></i>'; // Pause icon
const volumeSlider = document.getElementById("volumeSlider");
const volumeLevel = document.getElementById("volumeLevel")
const img1 = document.querySelector(".player1-img")
const img2 = document.querySelector(".player2-img")
const songName1 = document.querySelector(".player1-name");
const songName21 = document.querySelector(".player21-name");
const songArtists1 = document.querySelector(".player1-artists");
const songArtists2 = document.querySelector(".player2-artists");
const loopElement = document.querySelector('.loop-btn');
let loop = false;

loopElement.addEventListener("click", function () {
    loop = !loop;
    if (loop) {
        loopElement.style.backgroundColor = "#2d8f7a";
        loopElement.style.color = "#f8f9fa";
    } else {
        loopElement.style.backgroundColor = "#f8f9fa";
        loopElement.style.color = "#000000";
    }
})


function firstPlayAudio(name, url, img, artists, id) {
    clearQueue();
    addSongToQueue(url, img, name, id, artists);
    playAudio(name, url, img, artists);
}

function playAudio(name, url, img, artists) {
    loader("show");
    audio.src = url; // Assign the actual URL, not the string "url"
    callMediaSession(img, name, artists);
    img1.src = img;
    img2.src = img;
    songName1.textContent = name;
    songName21.textContent = name;
    songArtists1.textContent = artists;
    songArtists2.textContent = artists;
    audio1("play");
    waitForAudioToPlay(audio, () => {
        loader("hide");
    });
}

function waitForAudioToPlay(audioElement, callback) {
    if (!audioElement) return;

    // Check if audio is already playing
    if (!audioElement.paused && audioElement.readyState > 2) {
        callback();
        return;
    }

    // Wait for the 'playing' event
    audioElement.addEventListener("playing", function onPlay() {
        audioElement.removeEventListener("playing", onPlay); // Remove listener to avoid multiple triggers
        callback();
    });

    // Ensure audio starts playing if not already started
    audioElement.play().catch(() => { }); // Catch potential errors (e.g., user interaction required)
}


// Function to format time (mm:ss)
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

// Update total duration when metadata is loaded
audio.addEventListener("loadedmetadata", function () {
    totalTimeElement.textContent = formatTime(audio.duration);
    totalTimeElement1.textContent = formatTime(audio.duration);
});

// Toggle play/pause on button click
playPauseBtn.addEventListener("click", function () {
    if (audio.paused) {
        audio1("play");  // Pass "play" as a string
    } else {
        audio1("pause"); // Pass "pause" as a string
    }
});
playPauseBtn1.addEventListener("click", function () {
    if (audio.paused) {
        audio1("play");  // Pass "play" as a string
    } else {
        audio1("pause"); // Pass "pause" as a string
    }
});
playPauseBtn22.addEventListener("click", function () {
    if (audio.paused) {
        audio1("play");  // Pass "play" as a string
    } else {
        audio1("pause"); // Pass "pause" as a string
    }
});


function audio1(action) {
    if (action === "play") {  // Compare with string "play"
        audio.play();
    } else if (action === "pause") { // Compare with string "pause"
        audio.pause();
    }
}
audio.addEventListener("play", () => {
    playPauseBtn.innerHTML = pauseIcon; // Change to pause icon
    playPauseBtn1.innerHTML = pauseIcon; // Change to pause icon
    playPauseBtn22.innerHTML = pauseIcon; // Change to pause icon
});

audio.addEventListener("pause", () => {
    playPauseBtn.innerHTML = playIcon; // Change to play icon
    playPauseBtn1.innerHTML = playIcon; // Change to play icon
    playPauseBtn22.innerHTML = playIcon; // Change to play icon
});


// Update button when audio ends (so play button resets)
audio.addEventListener("ended", function () {
    if (loop) {
        audio.currentTime = 0;
        audio.play();
    } else {
        nextTrack();
    }
});

// Update current time as audio plays
audio.addEventListener("timeupdate", function () {
    currentTimeElement.textContent = formatTime(audio.currentTime);
    currentTimeElement1.textContent = formatTime(audio.currentTime);
});
audio.addEventListener("timeupdate", function () {
    const progress = (audio.currentTime / audio.duration) * 100;
    progressBar.style.width = progress + "%";
});
audio.addEventListener("timeupdate", function () {
    const progress = (audio.currentTime / audio.duration) * 100;
    progressBar1.style.width = progress + "%";
});


let isDraggingTimeline1 = false;
let isDraggingTimeline2 = false;

// Function to update progress bar 1
function updateProgressBar1() {
    const progress = (audio.currentTime / audio.duration) * 100;
    progressBar.style.width = progress + "%";
}

// Function to update progress bar 2
function updateProgressBar2() {
    const progress = (audio.currentTime / audio.duration) * 100;
    progressBar1.style.width = progress + "%";
}

// Function to set timeline position for progressBarContainer
function setTimeline1(event) {
    const rect = progressBarContainer.getBoundingClientRect();
    let offsetX = event.offsetX || event.touches?.[0]?.clientX - rect.left;

    let percentage = Math.max(0, Math.min(1, offsetX / rect.width)); // Ensure range 0-1
    audio.currentTime = percentage * audio.duration; // Seek audio
}

// Function to set timeline position for progressBarContainer1
function setTimeline2(event) {
    const rect = progressBarContainer1.getBoundingClientRect();
    let offsetX = event.offsetX || event.touches?.[0]?.clientX - rect.left;

    let percentage = Math.max(0, Math.min(1, offsetX / rect.width)); // Ensure range 0-1
    audio.currentTime = percentage * audio.duration; // Seek audio
}

// Click event to seek audio position
progressBarContainer.addEventListener("click", setTimeline1);
progressBarContainer1.addEventListener("click", setTimeline2);

// Dragging functionality for progress bar 1
progressBarContainer.addEventListener("mousedown", (event) => {
    isDraggingTimeline1 = true;
    setTimeline1(event);
});
document.addEventListener("mousemove", (event) => {
    if (isDraggingTimeline1) setTimeline1(event);
});
document.addEventListener("mouseup", () => {
    isDraggingTimeline1 = false;
});

// Dragging functionality for progress bar 2
progressBarContainer1.addEventListener("mousedown", (event) => {
    isDraggingTimeline2 = true;
    setTimeline2(event);
});
document.addEventListener("mousemove", (event) => {
    if (isDraggingTimeline2) setTimeline2(event);
});
document.addEventListener("mouseup", () => {
    isDraggingTimeline2 = false;
});

// Touch support for mobile dragging for progress bar 1
progressBarContainer.addEventListener("touchstart", (event) => {
    isDraggingTimeline1 = true;
    setTimeline1(event);
});
document.addEventListener("touchmove", (event) => {
    if (isDraggingTimeline1) setTimeline1(event);
});
document.addEventListener("touchend", () => {
    isDraggingTimeline1 = false;
});

// Touch support for mobile dragging for progress bar 2
progressBarContainer1.addEventListener("touchstart", (event) => {
    isDraggingTimeline2 = true;
    setTimeline2(event);
});
document.addEventListener("touchmove", (event) => {
    if (isDraggingTimeline2) setTimeline2(event);
});
document.addEventListener("touchend", () => {
    isDraggingTimeline2 = false;
});

// Update progress bars on time update
audio.addEventListener("timeupdate", () => {
    updateProgressBar1();
    updateProgressBar2();
});

document.addEventListener("keydown", function (event) {
    // Ignore shortcuts if user is typing in an input field or textarea
    const activeElement = document.activeElement;
    if (activeElement.tagName === "INPUT" || activeElement.tagName === "TEXTAREA") {
        return;
    }

    switch (event.code) {
        case "Space":
            event.preventDefault(); // Prevent page scroll
            if (audio.paused) {
                audio1("play");
            } else {
                audio1("pause");
            }
            break;

        case "ArrowRight": // Seek Forward
            event.preventDefault();
            seekForward();
            break;

        case "ArrowLeft": // Seek Backward
            event.preventDefault();
            seekBackward();
            break;
    }
});


function seekForward() {
    audio.currentTime = Math.min(audio.duration, audio.currentTime + 10);
}

function seekBackward() {
    audio.currentTime = Math.max(0, audio.currentTime - 10);
}

async function callMediaSession(urlImage1, SongName, currentArtist) {
    const defaultImage = 'https://aryantidke.me/songs/logo.png'; // Default image
    const artworkUrl = urlImage1 ? urlImage1 : defaultImage;

    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: SongName.replace(/&quot;/g, ' '),
            artist: currentArtist || "Unknown Artist",
            artwork: [{ src: artworkUrl, sizes: '512x512', type: 'image/png' }],
        });


        // Ensure `audio` is playing before setting action handlers
        if (!audio.src) {
            console.error("No audio source found. MediaSession might not work.");
            return;
        }

        // Play/Pause handler
        function togglePlayPause() {
            if (audio.paused) {
                audio.play();
                playPauseBtn.innerHTML = pauseIcon;
                playPauseBtn1.innerHTML = pauseIcon;
                playPauseBtn22.innerHTML = pauseIcon; // Change to pause icon
            } else {
                audio.pause();
                playPauseBtn.innerHTML = playIcon;
                playPauseBtn1.innerHTML = playIcon;
                playPauseBtn22.innerHTML = playIcon;
            }
        }


        function seekForward() {
            audio.currentTime = Math.min(audio.duration, audio.currentTime + 10);
        }

        function seekBackward() {
            audio.currentTime = Math.max(0, audio.currentTime - 10);
        }

        function loadPreviousTrack() {
            if (audio.currentTime > 9) {
                audio.currentTime = 0;
            } else if (currentIndexPlaylist > 0) {
                currentIndexPlaylist--;
                loadTrack(currentIndexPlaylist);
            }
        }
        async function loadNextTrack() {
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

        function loadTrack(index) {
            const name = playlistSongName[index];
            const urlencoded = playlistSongUrl[index];
            const Image = playlistSongImg[index];
            const artist = playlistSongArtist[index];
            playAudio(name, urlencoded, Image, artist);
        }

        // Set Media Session Action Handlers
        try {
            navigator.mediaSession.setActionHandler('play', togglePlayPause);
            navigator.mediaSession.setActionHandler('pause', togglePlayPause);
            navigator.mediaSession.setActionHandler('seekbackward', seekBackward);
            navigator.mediaSession.setActionHandler('seekforward', seekForward);
            navigator.mediaSession.setActionHandler('seekforward', seekForward);
            navigator.mediaSession.setActionHandler('previoustrack', loadPreviousTrack);
            navigator.mediaSession.setActionHandler('nexttrack', loadNextTrack);
            navigator.mediaSession.setActionHandler('stop', togglePlayPause);
        } catch (error) {
            console.warn('Media Session API handlers not supported:', error);
        }
    }
}

const mainContent = document.querySelector(".main-content");
let playerStatePushed = false;

expandPlayer.addEventListener("click", () => {
    const isHidden = audioPlayer1.classList.toggle("hidden");

    if (!isHidden) {
        populateSongQueue();

        if (!playerStatePushed) {
            history.pushState({ type: "hidePlayer" }, ""); // First push hidePlayer
            history.pushState({ type: "previousState" }, ""); // Push a dummy state
            console.log("Pushed state for hidePlayer");
            playerStatePushed = true;
        }
    } else {
        playerStatePushed = false;
    }
});











// Function to update volume based on click position
function setVolume(event) {
    const sliderWidth = volumeSlider.clientWidth;
    const clickX = event.offsetX; // Get click position
    const newVolume = clickX / sliderWidth; // Convert to range 0.0 - 1.0

    audio.volume = newVolume; // Set volume
    volumeLevel.style.width = `${newVolume * 100}%`; // Update UI
}

// Initialize volume UI on page load
let isDragging = false;

// Function to set volume and update UI
function updateVolume(event) {
    const sliderWidth = volumeSlider.clientWidth;
    let offsetX = event.offsetX || event.touches?.[0]?.clientX - volumeSlider.getBoundingClientRect().left;

    let newVolume = Math.max(0, Math.min(1, offsetX / sliderWidth)); // Ensure value is between 0-1
    audio.volume = newVolume; // Set volume
    volumeLevel.style.width = `${newVolume * 100}%`; // Update UI
}

// Event Listeners
volumeSlider.addEventListener("mousedown", (event) => {
    isDragging = true;
    updateVolume(event);
});

document.addEventListener("mousemove", (event) => {
    if (isDragging) updateVolume(event);
});

document.addEventListener("mouseup", () => {
    isDragging = false;
});

// Touch support for mobile
volumeSlider.addEventListener("touchstart", (event) => {
    isDragging = true;
    updateVolume(event);
});

document.addEventListener("touchmove", (event) => {
    if (isDragging) updateVolume(event);
});

document.addEventListener("touchend", () => {
    isDragging = false;
});

// Update UI when volume changes externally
audio.addEventListener("volumechange", () => {
    volumeLevel.style.width = `${audio.volume * 100}%`;
});

// Set initial volume level
volumeLevel.style.width = `${audio.volume * 100}%`;

// Event Listeners
volumeSlider.addEventListener("click", setVolume);
audio.addEventListener("volumechange", updateVolumeUI);

// Set initial volume level
updateVolumeUI();

// Function to update volume UI
function updateVolumeUI() {
    volumeLevel.style.width = `${audio.volume * 100}%`;
}
// Block text selection
document.body.style.userSelect = 'none';

// Block right-click
document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
});


let element = document.getElementById('trackTitle');
let element2 = document.getElementById('timePausePlay');

let observer = new ResizeObserver(() => {
    let bodyWidth = document.body.clientWidth; // Get current width of the body

    if (bodyWidth > 800) { // Only run the observer logic if body width > 800px
        let computedStyle = window.getComputedStyle(element);
        let width = parseFloat(computedStyle.width); // Convert width from "px" string to number

        if (width > 150) { 
            element2.style.width = computedStyle.width;
        } else {
            element2.style.width = "150px";
        }
    } else {
        element2.style.width = ""; // Reset the width when body width <= 800px
    }
});

// Start observing
observer.observe(element);

