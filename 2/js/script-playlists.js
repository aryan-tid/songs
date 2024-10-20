let page = 1;
let imageUniversalUrl;
let audio = new Audio();
let playlistSongUrl = [];
let playlistSongImg = [];
let playlistSongName = [];
let playlistSongId = [];
let currentIndexPlaylist = 0;
let randomSongName;
let testindexorder = 0;
let isAdding = false;


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

async function playSongByID(songID) {
    const url = `https://saavn.dev/api/songs/${songID}?lyrics=false`;
    try {
        const responseUniqueSongID = await fetch(url);
        if (!responseUniqueSongID.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await responseUniqueSongID.json();
        const song = data.data[0];  // Access the first item in the array
        const globalQuality = document.getElementById('globalQualitySelect').value;
        const songPlayUrl = song.downloadUrl.find(url => url.quality === globalQuality);

        if (song) {
            addSongToQueue(songPlayUrl.url, song.image[2].url, song.name, songID)
            console.log(playlistSongUrl.length);
            playInPlayer(song.name, songPlayUrl.url, song.image[2].url)
        } else {
            console.error('No song data found');
        }
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        const resultDiv = document.getElementById('result');
        if (resultDiv) {
            resultDiv.textContent = 'Error fetching data';
        }
    } finally {
        console.log('End');
        currentIndexPlaylist = playlistSongUrl.length - 1;
    }
}

function addSongToQueue(songURL, songIMG, songNAME, songID) {
    playlistSongUrl.push(songURL);
    playlistSongImg.push(songIMG);
    playlistSongName.push(songNAME);
    playlistSongId.push(songID);
    return;
}

async function addPlaylistToQueue(playlistID) {
    if (isAdding) return; // Prevent multiple calls
    isAdding = true;
    const wasQueueEmpty = playlistSongUrl.length === 0;
    const url = `https://saavn.dev/api/playlists?id=${playlistID}&page=0&limit=100`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        const results = data.data.songs; // Access songs in data.data.songs

        // Loop through the songs and clone the template for each song
        results.forEach((song) => {
            const selectedQuality = document.getElementById('globalQualitySelect').value;
            const songDownloadUrl = song.downloadUrl ? song.downloadUrl.find(url => url.quality === selectedQuality)?.url : null;

            playlistSongUrl.push(songDownloadUrl);
            playlistSongImg.push(song.image[2].url);
            playlistSongName.push(song.name.replace(/&quot;/g, ' '));
            playlistSongId.push(song.id);

            testindexorder++;
            console.log(playlistSongName[testindexorder - 1]);

            // If the queue was empty before, play the first song automatically
            if (wasQueueEmpty && playlistSongUrl.length > 0) {
                currentIndexPlaylist = 0;
                loadTrack(currentIndexPlaylist); // Play the first song automatically
            }
        });
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    } finally {
        isAdding = false;
    }
}



async function browseShow() {
    // Show the browse section
    const browseShowId = document.getElementById('browseShowId');
    browseShowId.classList.remove('hidden');
    hideMenu();

    document.getElementById('searchBtn').addEventListener('click', async () => {
        const songName = document.getElementById('songName').value;
        //
        if (randomSongName != songName) {
            page = 1;
        }
        randomSongName = songName;
        const nextPageButton = document.getElementById('nextPage');
        const previousPageButton = document.getElementById('previousPage');
        searchBtn.disabled = true;
        document.getElementById('loadingOverlay').style.display = 'flex';

        if (!randomSongName) {
            alert('Please enter a song name');
            document.getElementById('loadingOverlay').style.display = 'none';
            searchBtn.disabled = false;
            return;
        }

        console.log("current page value is: " + page);
        const url = `https://saavn.dev/api/search/songs?query=${encodeURIComponent(songName)}&page=${page}&limit=20`;

        // Clear previous playlist results before fetching new ones
        const resultDiv = document.getElementById('result');
        const h2SeachResults = document.getElementById('h2SeachResults');
        playlistImg.classList.add('hidden');
        btnAddPlaylistToQueue.classList.add('hidden');
        playlistName.classList.add('hidden');
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
                songClone.querySelector('.song-ID span').textContent = song.id;

                // Update the content with song data
                songClone.querySelector('.song-img').src = song.image[1].url;
                songClone.querySelector('.song-name span').textContent = song.name;
                songClone.querySelector('.song-artists span').textContent = song.artists.primary.map(artist => artist.name).join(', ');

                const playSong = () => {
                    console.log(song.id);
                    playSongByID(song.id);
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

document.getElementById('songName').addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        document.getElementById('searchBtn').click();
    }
});

async function playlistShow(playlistId) {
    document.getElementById('btnAddPlaylistToQueue').disabled = false;
    const url = `https://saavn.dev/api/playlists?id=${playlistId}&page=0&limit=100`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        const resultsPlaylistName = data.data.name;
        const resultsPlaylistImg = data.data.image[2].url;
        document.getElementById('playlistName').textContent = resultsPlaylistName;
        document.getElementById('playlistImg').src = resultsPlaylistImg;
        const playlistShowId = document.getElementById('playlistShowId');
        playlistShowId.classList.remove('hidden');
        playlistImg.classList.remove('hidden');
        btnAddPlaylistToQueue.classList.remove('hidden');
        playlistName.classList.remove('hidden');
        const results = data.data.songs; // Access songs in data.data.songs
        const resultDiv = document.getElementById('result');

        // Clear previous results
        resultDiv.innerHTML = '';

        // Loop through the songs and clone the template for each song
        results.forEach((song, index) => {
            const songTemplate = document.getElementById('songTemplate');
            const songClone = songTemplate.cloneNode(true); // Deep clone the template
            songClone.style.display = 'block'; // Make it visible
            songClone.querySelector('.song-ID span').textContent = song.id;

            // Update the content with song data
            songClone.querySelector('.song-img').src = song.image[1].url;
            songClone.querySelector('.song-name span').textContent = song.name.replace(/&quot;/g, ' ');
            songClone.querySelector('.song-artists span').textContent = song.artists.primary.map(artist => artist.name).join(', ');

            songClone.querySelector('.song-card').addEventListener('click', () => {
                playSongByID(song.id);
            });
            // Append the clone to the resultDiv
            resultDiv.appendChild(songClone);
            document.getElementById('btnAddPlaylistToQueue').addEventListener('click', () => {
                document.getElementById('btnAddPlaylistToQueue').disabled = true;
                addPlaylistToQueue(playlistId); // Call the addPlaylistToQueue function
            });
        });
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        document.getElementById('result').textContent = 'Error fetching data'; // Update to correct element
    }
}
// Call the init function to execute the code
playlistShow(47599074);

async function callMediaSession(urlImage1, SongName,) {
    // Update mediaSession with metadata (optional)
    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: SongName.replace(/&quot;/g, ' '),
            artwork: [
                { src: urlImage1, sizes: '512x512', type: 'image/png' },
            ],
        });

        // Play/Pause action handler
        const togglePlayPause1 = async function () {
            audio.play();
            playBtn.classList.remove("play");
            playBtn.classList.add("pause");
        };
        const togglePlayPause2 = async function () {
            audio.pause();
            playBtn.classList.remove("pause");
            playBtn.classList.add("play");
        };

        // Seek forward/backward and next/previous track functions
        function seekForward() {
            audio.currentTime = Math.min(audio.duration, audio.currentTime + 10);
        }

        function seekBackward() {
            audio.currentTime = Math.max(0, audio.currentTime - 10);
        }

        function loadPreviousTrack() {
            if (currentIndexPlaylist > 0) {
                currentIndexPlaylist--;
                loadTrack(currentIndexPlaylist);
            }
        }

        function loadNextTrack() {
            if (currentIndexPlaylist < playlistSongUrl.length - 1) {
                currentIndexPlaylist++;
                loadTrack(currentIndexPlaylist);
            }
        }

        function loadTrack(index) {
            const audioSrc = playlistSongUrl[index];
            const audioName = playlistSongName[index];
            const imageUrl = playlistSongImg[index];
            playInPlayer(audioName, audioSrc, imageUrl);
        }

        // Set mediaSession action handlers
        navigator.mediaSession.setActionHandler('play', togglePlayPause1);
        navigator.mediaSession.setActionHandler('pause', togglePlayPause2);
        navigator.mediaSession.setActionHandler('seekbackward', seekBackward);
        navigator.mediaSession.setActionHandler('seekforward', seekForward);
        navigator.mediaSession.setActionHandler('previoustrack', loadPreviousTrack);
        navigator.mediaSession.setActionHandler('nexttrack', loadNextTrack);
        navigator.mediaSession.setActionHandler('stop', togglePlayPause2);
    }
}

// Play song in the player
function playInPlayer(songName, url, imgUrl1) {
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
            // Add event listener to open popup on song name click
            songNameDisplay.addEventListener('click', () => {
                openSongQueuePopup();
            });

        })
        .catch(error => {
            console.error('Error playing audio:', error);
        });
    callMediaSession(imgUrl1, songName)
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
audio = new Audio(); // You can update the song file if needed

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

// This event triggers when the song ends, and it automatically plays the next one.
audio.addEventListener("ended", () => {
    loadNextTrack(); // Automatically play the next song
}, false);

// Function to load and play the next track
function loadNextTrack() {
    if (currentIndexPlaylist < playlistSongUrl.length - 1) {
        currentIndexPlaylist++;
        loadTrack(currentIndexPlaylist);
    } else {
        console.log("End of playlist");
    }
}

function loadTrack(index) {
    const audioSrc = playlistSongUrl[index];
    const audioName = playlistSongName[index];
    const imageUrl = playlistSongImg[index];
    playInPlayer(audioName, audioSrc, imageUrl);
}


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

// Function to show the song queue in a popup
function showSongQueue() {
    const songQueuePopup = document.getElementById('songQueuePopup');
    const songQueueContainer = document.getElementById('songQueue');
    songQueueContainer.innerHTML = ''; // Clear previous content

    // Create song cards for each song in the playlist
    playlistSongName.forEach((songName, index) => {
        const songCard = document.createElement('div');
        songCard.className = 'song-card'; // Add your existing class
        songCard.draggable = true; // Make the card draggable
        songCard.innerHTML = `
            <img src="${playlistSongImg[index]}" alt="${songName}" />
            <div class="song-info">
                <span class="song-name">${songName}</span>
                <span class="song-id">${playlistSongId[index]}</span>
            </div>
        `;

        // Handle drag events
        songCard.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', index); // Store index of the dragged item
        });

        songCard.addEventListener('dragover', (e) => {
            e.preventDefault(); // Allow dropping
        });

        songCard.addEventListener('drop', (e) => {
            e.preventDefault();
            const draggedIndex = e.dataTransfer.getData('text/plain');
            if (draggedIndex !== index.toString()) {
                // Swap the songs in the array
                const tempUrl = playlistSongUrl[draggedIndex];
                const tempImg = playlistSongImg[draggedIndex];
                const tempName = playlistSongName[draggedIndex];
                const tempId = playlistSongId[draggedIndex];

                playlistSongUrl[draggedIndex] = playlistSongUrl[index];
                playlistSongImg[draggedIndex] = playlistSongImg[index];
                playlistSongName[draggedIndex] = playlistSongName[index];
                playlistSongId[draggedIndex] = playlistSongId[index];

                playlistSongUrl[index] = tempUrl;
                playlistSongImg[index] = tempImg;
                playlistSongName[index] = tempName;
                playlistSongId[index] = tempId;

                showSongQueue(); // Refresh the song queue
            }
        });

        songQueueContainer.appendChild(songCard);
    });

    songQueuePopup.classList.remove('hidden'); // Show the popup
}

// Add event listener to the song name in the player
document.getElementById('currentSongName').addEventListener('click', showSongQueue);

// Add event listener to close the popup
document.getElementById('closePopup').addEventListener('click', () => {
    document.getElementById('songQueuePopup').classList.add('hidden');
});

function dragStart(event) {
    event.dataTransfer.setData('text/plain', event.target.dataset.index);
}

function dragOver(event) {
    event.preventDefault(); // Prevent default to allow drop
}

function drop(event) {
    event.preventDefault();
    const draggedIndex = event.dataTransfer.getData('text/plain');
    const targetIndex = event.target.dataset.index;

    if (draggedIndex !== targetIndex) {
        // Swap the songs in the playlist arrays
        const tempUrl = playlistSongUrl[draggedIndex];
        const tempImg = playlistSongImg[draggedIndex];
        const tempName = playlistSongName[draggedIndex];
        const tempId = playlistSongId[draggedIndex];

        playlistSongUrl[draggedIndex] = playlistSongUrl[targetIndex];
        playlistSongImg[draggedIndex] = playlistSongImg[targetIndex];
        playlistSongName[draggedIndex] = playlistSongName[targetIndex];
        playlistSongId[draggedIndex] = playlistSongId[targetIndex];

        playlistSongUrl[targetIndex] = tempUrl;
        playlistSongImg[targetIndex] = tempImg;
        playlistSongName[targetIndex] = tempName;
        playlistSongId[targetIndex] = tempId;

        // Refresh the popup to reflect the new order
        openSongQueuePopup();
    }
}
