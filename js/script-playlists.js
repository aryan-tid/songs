let page = 1;
let imageUniversalUrl;

document.getElementById('nextPage').addEventListener('click', () => {
    nextPage.disabled = true;
    page++;
    document.getElementById('searchBtn').click();
});
document.getElementById('previousPage').addEventListener('click', () => {
    previousPage.disabled = true;
    page--;
    document.getElementById('searchBtn').click();
});

document.getElementById('hamburger').addEventListener('click', function () {
    const navbarList = document.getElementById('navbarList');
    navbarList.classList.toggle('show'); // Toggle 'show' class to display menu
});

async function hideMenu() {
    const navbarList = document.getElementById('navbarList');
    if (navbarList.classList.contains('show')) {
        navbarList.classList.remove('show'); // Hide the menu
    }
}

async function browseShow() {
    // Show the browse section
    const browseShowId = document.getElementById('browseShowId');
    browseShowId.classList.remove('hidden');
    hideMenu();

    document.getElementById('searchBtn').addEventListener('click', async () => {
        const songName = document.getElementById('songName').value;
        const nextPageButton = document.getElementById('nextPage');
        const previousPageButton = document.getElementById('previousPage');
        searchBtn.disabled = true;
        document.getElementById('loadingOverlay').style.display = 'flex';

        if (!songName) {
            alert('Please enter a song name');
            document.getElementById('loadingOverlay').style.display = 'none';
            searchBtn.disabled = false;
            return;
        }

        const url = `https://saavn.dev/api/search/songs?query=${encodeURIComponent(songName)}&page=${page}&limit=20`;

        // Clear previous playlist results before fetching new ones
        const resultDiv = document.getElementById('result');
        resultDiv.innerHTML = ''; // Clear the current songs
        const h2SeachResults = document.getElementById('h2SeachResults');
        h2SeachResults.classList.remove('hidden');

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            const results = data.data.results;

            // Clear previous results
            resultDiv.innerHTML = ''; // Ensure the result div is cleared

            // Loop through the songs and clone the template for each song
            results.forEach(song => {
                const songTemplate = document.getElementById('songTemplate');
                const songClone = songTemplate.cloneNode(true); // Deep clone the template
                songClone.style.display = 'block'; // Make it visible

                // Update the content with song data
                songClone.querySelector('.song-img').src = song.image[1].url;
                songClone.querySelector('.song-name span').textContent = song.name;

                songClone.querySelector('.song-artists span').textContent = song.artists.primary.map(artist => artist.name).join(', ');

                const playSong = () => {
                    const globalQuality = document.getElementById('globalQualitySelect').value;
                    const downloadUrl = song.downloadUrl.find(url => url.quality === globalQuality);
                    imageUniversalUrl = song.image[2].url
                    if (downloadUrl) {
                        playInPlayer(song.name, downloadUrl.url);

                    } else {
                        console.error(`No download URL found for quality: ${globalQuality}`);
                    }
                    if ('mediaSession' in navigator) {

                        navigator.mediaSession.metadata = new MediaMetadata({
                            artwork: [
                                { src: imageUniversalUrl, sizes: '512x512', type: 'image/png' },
                            ]
                        });

                        // navigator.mediaSession.setActionHandler('play', function () { });
                        // navigator.mediaSession.setActionHandler('pause', function () { });
                        // navigator.mediaSession.setActionHandler('seekbackward', function () { });
                        // navigator.mediaSession.setActionHandler('seekforward', function () { });
                        // navigator.mediaSession.setActionHandler('previoustrack', function () { });
                        // navigator.mediaSession.setActionHandler('nexttrack', function () { });
                    }
                };

                // Attach click event listener on the entire card
                songClone.addEventListener('click', playSong);

                // Append the clone to the resultDiv
                resultDiv.appendChild(songClone);
            });
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
            resultDiv.textContent = 'Error fetching data';
            document.getElementById('loadingOverlay').style.display = 'none';
        } finally {
            document.getElementById('loadingOverlay').style.display = 'none';
            searchBtn.disabled = false;
            nextPageButton.classList.remove('hidden');
            if (page > 1) {
                previousPageButton.classList.remove('hidden');
            } else {
                previousPageButton.classList.add('hidden');
            };
            nextPageButton.disabled = false;
            previousPageButton.disabled = false;
        }
    });
}

async function playlistShow(playlistId) {
    const url = `https://saavn.dev/api/playlists?id=${playlistId}&page=0&limit=25`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        const resultsPlaylistName = data.data.name;
        document.getElementById('playlist-name').textContent = resultsPlaylistName;
        const playlistShowId = document.getElementById('playlistShowId');
        playlistShowId.classList.remove('hidden');
        const results = data.data.songs; // Access songs in data.data.songs
        const resultDiv = document.getElementById('result');

        // Clear previous results
        resultDiv.innerHTML = '';

        // Loop through the songs and clone the template for each song
        results.forEach(song => {
            const songTemplate = document.getElementById('songTemplate');
            const songClone = songTemplate.cloneNode(true); // Deep clone the template
            songClone.style.display = 'block'; // Make it visible

            // Update the content with song data
            songClone.querySelector('.song-img').src = song.image[1].url;
            songClone.querySelector('.song-name span').textContent = song.name.replace(/&quot;/g, ' ');
            songClone.querySelector('.song-artists span').textContent = song.artists.primary.map(artist => artist.name).join(', ');

            const playSong = () => {
                const globalQuality = document.getElementById('globalQualitySelect').value;
                const downloadUrl = song.downloadUrl ? song.downloadUrl.find(url => url.quality === globalQuality) : null; // Ensure downloadUrl exists
                imageUniversalUrl = song.image[2].url // Use the medium-quality image at index 1
                if (downloadUrl) {
                    playInPlayer(song.name, downloadUrl.url);
                } else {
                    console.error('No download URL found for the selected quality.');
                }
                if ('mediaSession' in navigator) {

                    navigator.mediaSession.metadata = new MediaMetadata({
                        artwork: [
                            { src: imageUniversalUrl, sizes: '512x512', type: 'image/png' },
                        ]
                    });
                    // // Play/Pause action handler (combined)
                    const togglePlayPause1 = async function () {
                        audio.play()
                        playBtn.classList.remove("play");
                        playBtn.classList.add("pause");
                    };
                    const togglePlayPause2 = async function () {
                        audio.pause()
                        playBtn.classList.remove("pause");
                        playBtn.classList.add("play");
                    };

                    const seekBackward =async function () {
                        const currentTime = audio.currentTime;
                        var audio = document.getElementById('myAudio');
                        audio.currentTime = Math.max(0, currentTime - 10); // Seek backward by 10 seconds
                    }
                    
                    function seekForward() {
                        const currentTime = audio.currentTime;
                        var audio = document.getElementById('myAudio');
                        audio.currentTime = Math.max(0, currentTime + 10); // Seek backward by 10 seconds
                    }
                    // Set play/pause action handlers
                    navigator.mediaSession.setActionHandler('play', togglePlayPause1);
                    navigator.mediaSession.setActionHandler('pause', togglePlayPause2);
                    navigator.mediaSession.setActionHandler('seekbackward', seekForward);
                    navigator.mediaSession.setActionHandler('seekforward', seekBackward);
                    // navigator.mediaSession.setActionHandler('previoustrack', function () { });
                    // navigator.mediaSession.setActionHandler('nexttrack', function () { });
                }
            };

            // Attach click event listener on the entire card
            songClone.addEventListener('click', playSong);

            // Append the clone to the resultDiv
            resultDiv.appendChild(songClone);
        });
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        document.getElementById('result').textContent = 'Error fetching data'; // Update to correct element
    }
}

// Call the init function to execute the code
playlistShow(47599074);

// Play song in the player
function playInPlayer(songName, url) {
    const audioPlayer = document.getElementById('audioPlayer');
    const songNameDisplay = document.getElementById('currentSongName');

    // Set the audio source and play
    audio.src = url; // Set the source to the dynamic URL fetched from API
    audio.play()
        .then(() => {
            songNameDisplay.textContent = songName.replace(/&quot;/g, ' ');
            document.title = `${(songName).replace(/&quot;/g, ' ')} - Melodify`; // Change the title dynamically
            const playBtn = audioPlayer.querySelector(".controls .toggle-play");
            playBtn.classList.remove("play");
            playBtn.classList.add("pause");
            console.log(imageUniversalUrl);
            imageUniversalUrl = null;

        })
        .catch(error => {
            console.error('Error playing audio:', error);
        });
}

// Removed local storage logic
window.addEventListener('DOMContentLoaded', () => {
    const browseLink = document.getElementById('browse-link');

    browseLink.addEventListener('click', function (event) {
        event.preventDefault(); // Prevent the default anchor click behavior
        const playlistShowId = document.getElementById('playlistShowId');
        playlistShowId.classList.add('hidden');
        browseShow();
    });
});

// New player logic
const audioPlayer = document.querySelector(".audio-player");
const audio = new Audio(); // You can update the song file if needed

audio.addEventListener('loadeddata', () => {
    audioPlayer.querySelector(".time .length").textContent = getTimeCodeFromNum(audio.duration);
    audio.volume = 1;
}, false);

const timeline = audioPlayer.querySelector(".timeline");
timeline.addEventListener("click", e => {
    const timelineWidth = window.getComputedStyle(timeline).width;
    const timeToSeek = e.offsetX / parseFloat(timelineWidth) * audio.duration;
    audio.currentTime = timeToSeek;
}, false);

audio.addEventListener("timeupdate", () => {
    const currentTime = audio.currentTime;
    const timelineWidth = window.getComputedStyle(timeline).width;
    const timelineProgress = (currentTime / audio.duration) * parseFloat(timelineWidth);
    timeline.querySelector(".progress").style.width = `${timelineProgress}px`;
    audioPlayer.querySelector(".time .current").textContent = getTimeCodeFromNum(currentTime);
}, false);

const playBtn = audioPlayer.querySelector(".controls .toggle-play");
playBtn.addEventListener("click", () => {
    if (audio.paused) {
        audio.play();
        playBtn.classList.remove("play");
        playBtn.classList.add("pause");
    } else {
        audio.pause();
        playBtn.classList.remove("pause");
        playBtn.classList.add("play");
    }
}, false);



audioPlayer.querySelector(".volume-button").addEventListener("click", () => {
    const volumeEl = audioPlayer.querySelector(".volume-container .volume");
    audio.muted = !audio.muted;
    if (audio.muted) {
        volumeEl.classList.remove("icono-volumeMedium");
        volumeEl.classList.add("icono-volumeMute");
    } else {
        volumeEl.classList.add("icono-volumeMedium");
        volumeEl.classList.remove("icono-volumeMute");
    }
}, false);

// Function to get time code from number
function getTimeCodeFromNum(num) {
    const minutes = Math.floor(num / 60);
    const seconds = Math.floor(num % 60);
    return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
}
