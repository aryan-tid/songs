const audio = document.querySelector(".audio-file audio");
const playPauseBtn = document.querySelector(".play-pause-btn");
const playPauseBtn1 = document.querySelector(".play-pause-btn1");
const currentTimeElement = document.querySelector(".currentTime");
const totalTimeElement = document.querySelector(".totalTime");
const currentTimeElement1 = document.querySelector(".currentTime1");
const totalTimeElement1 = document.querySelector(".totalTime1");
const progressBar = document.querySelector(".progress12");
const progressBarContainer = document.querySelector(".progress-bar12");
const progressBar1 = document.querySelector(".progress123");
const progressBarContainer1 = document.querySelector(".progress-bar123");
const expandPlayer = document.querySelector(".expand-player");
const unexpandPlayer = document.querySelector(".unexpand-player");
const audioPlayer1 = document.querySelector(".audio-player11");
const playIcon = '<i class="fas fa-play"></i>';  // Play icon
const pauseIcon = '<i class="fas fa-pause"></i>'; // Pause icon
const volumeSlider = document.getElementById("volumeSlider");
const volumeLevel = document.getElementById("volumeLevel")
const img1 = document.querySelector(".player1-img")
const img2 = document.querySelector(".player2-img")
const songName1 = document.querySelector(".player1-name");
const songName21 = document.querySelector(".player21-name");
const songName22 = document.querySelector(".player22-name");
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



function playAudio(name,url,img,artists) {
    audio.src = url; // Assign the actual URL, not the string "url"
    callMediaSession(img,name);
    img1.src=img;
    img2.src=img;
    songName1.textContent=name;
    songName21.textContent=name;
    songName22.textContent=name;
    songArtists1.textContent=artists;
    songArtists2.textContent=artists;
    audio1("play");

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


function audio1(action) {
    if (action === "play") {  // Compare with string "play"
        audio.play();
        playPauseBtn.innerHTML = pauseIcon; // Change to pause icon
        playPauseBtn1.innerHTML = pauseIcon; // Change to pause icon
    } else if (action === "pause") { // Compare with string "pause"
        audio.pause();
        playPauseBtn.innerHTML = playIcon; // Change to play icon
        playPauseBtn1.innerHTML = playIcon; // Change to play icon
    }
}

// Update button when audio ends (so play button resets)
audio.addEventListener("ended", function () {
    if (loop) {
        audio.currentTime = 0;
        audio.play();
    } else {
        playPauseBtn1.innerHTML = playIcon; // Reset to play icon when audio ends
        playPauseBtn.innerHTML = playIcon; // Reset to play icon when audio ends
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
progressBarContainer.addEventListener("click", function (event) {
    const rect = progressBarContainer.getBoundingClientRect(); // Get position of progress bar
    const offsetX = event.clientX - rect.left; // Get click position relative to progress bar
    const percentage = (offsetX / rect.width) * 100; // Convert to percentage
    const newTime = (percentage / 100) * audio.duration; // Convert percentage to time

    audio.currentTime = newTime; // Seek audio
});
audio.addEventListener("timeupdate", function () {
    const progress = (audio.currentTime / audio.duration) * 100;
    progressBar1.style.width = progress + "%";
});
progressBarContainer1.addEventListener("click", function (event) {
    const rect = progressBarContainer1.getBoundingClientRect(); // Get position of progress bar
    const offsetX = event.clientX - rect.left; // Get click position relative to progress bar
    const percentage = (offsetX / rect.width) * 100; // Convert to percentage
    const newTime = (percentage / 100) * audio.duration; // Convert percentage to time

    audio.currentTime = newTime; // Seek audio
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

async function callMediaSession(urlImage1, SongName) {
    const defaultImage = 'https://aryantidke.me/songs/logo.png'; // Default image
    const artworkUrl = urlImage1 ? urlImage1 : defaultImage;

    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: SongName.replace(/&quot;/g, ' '),
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
            } else {
                audio.pause();
                playPauseBtn.innerHTML = playIcon;
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

        function loadNextTrack() {
            if (currentIndexPlaylist < playlistSongUrl.length - 1) {
                currentIndexPlaylist++;
                loadTrack(currentIndexPlaylist);
            } else {
                showMessage('Last song in Queue', "negative");
            }
        }

        function loadTrack(index) {
            const audioSrc = playlistSongUrl[index];
            const audioName = playlistSongName[index];
            const imageUrl = playlistSongImg[index];
            const artistName = playlistSongArtist[index];

            playInPlayer(audioName, audioSrc, imageUrl, artistName);
            showSongQueueNew();
        }

        // Set Media Session Action Handlers
        try {
            navigator.mediaSession.setActionHandler('play', togglePlayPause);
            navigator.mediaSession.setActionHandler('pause', togglePlayPause);
            navigator.mediaSession.setActionHandler('seekbackward', seekBackward);
            navigator.mediaSession.setActionHandler('seekforward', seekForward);
            navigator.mediaSession.setActionHandler('previoustrack', loadPreviousTrack);
            navigator.mediaSession.setActionHandler('nexttrack', loadNextTrack);
            navigator.mediaSession.setActionHandler('stop', togglePlayPause);
        } catch (error) {
            console.warn('Media Session API handlers not supported:', error);
        }
    }
}


expandPlayer.addEventListener("click", function () {
    audioPlayer1.classList.toggle("hidden");
});
unexpandPlayer.addEventListener("click", function () {
    audioPlayer1.classList.toggle("hidden");
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
 document.addEventListener('contextmenu', function(e) {
   e.preventDefault();
 });
