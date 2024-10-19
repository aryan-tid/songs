let page = 0;

document.getElementById('hamburger').addEventListener('click', function () {
    const navbarList = document.getElementById('navbarList');
    navbarList.classList.toggle('show'); // Toggle 'show' class to display menu
});
async function hideMenu() {
    if (navbarList.classList.contains('show')) {
        navbarList.classList.remove('show'); // Hide the menu
    }    
}

async function browseShow() {
    // Show the browse section
    browseShowId.classList.remove('hidden');
    hideMenu();
    
    document.getElementById('searchBtn').addEventListener('click', () => {
        const songName = document.getElementById('songName').value;
        nextPage.classList.remove('hidden');
        searchBtn.disabled = true;
        document.getElementById('loadingOverlay').style.display = 'flex';
        
        if (!songName) {
            alert('Please enter a song name');
            return;
        }
        
        const url = `https://saavn.dev/api/search/songs?query=${encodeURIComponent(songName)}&page=${page}&limit=20`;
        
        // Clear previous playlist results before fetching new ones
        const resultDiv = document.getElementById('result');
        resultDiv.innerHTML = ''; // Clear the current songs
        h2SeachResults.classList.remove('hidden');
        
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                const results = data.data.results;
                
                // Clear previous results
                resultDiv.innerHTML = ''; // Ensure the result div is cleared
                
                // Loop through the songs and clone the template for each song
                results.forEach(song => {
                    const songTemplate = document.getElementById('songTemplate');
                    const songClone = songTemplate.cloneNode(true); // Deep clone the template
                    songClone.style.display = 'block'; // Make it visible
                    
                    // Update the content with song data
                    songClone.querySelector('.song-img').src = song.image[2].url;
                    songClone.querySelector('.song-name span').textContent = song.name;
                    songClone.querySelector('.song-artists span').textContent = song.artists.primary.map(artist => artist.name).join(', ');

                    const playSong = () => {
                        const globalQuality = document.getElementById('globalQualitySelect').value;
                        const downloadUrl = song.downloadUrl.find(url => url.quality === globalQuality);
                        if (downloadUrl) {
                            playInPlayer(song.name, downloadUrl.url);
                        }
                    };

                    // Attach click event listener on the entire card
                    songClone.addEventListener('click', playSong);

                    // Append the clone to the resultDiv
                    resultDiv.appendChild(songClone);
                });
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
                resultDiv.textContent = 'Error fetching data';
            })
            .finally(() => {
                document.getElementById('loadingOverlay').style.display = 'none';
                searchBtn.disabled = false;
                nextPage.disabled = false;
            });
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
            songClone.querySelector('.song-img').src = song.image[2].url;
            songClone.querySelector('.song-name span').textContent = song.name.replace(/&quot;/g, ' ');
            songClone.querySelector('.song-artists span').textContent = song.artists.primary.map(artist => artist.name).join(', ');

            const playSong = () => {
                const globalQuality = document.getElementById('globalQualitySelect').value;
                const downloadUrl = song.downloadUrl ? song.downloadUrl.find(url => url.quality === globalQuality) : null; // Ensure downloadUrl exists
                if (downloadUrl) {
                    playInPlayer(song.name, downloadUrl.url);
                } else {
                    console.error('No download URL found for the selected quality.');
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
    const audioPlayer = document.getElementById('persistentAudio');
    const songNameDisplay = document.getElementById('currentSongName');

    audioPlayer.src = url;
    audioPlayer.play();
    songNameDisplay.textContent = songName.replace(/&quot;/g, ' ');
}

// Persist the audio player across page switches
window.addEventListener('beforeunload', () => {
    localStorage.setItem('playerState', JSON.stringify({
        songName: document.getElementById('currentSongName').textContent,
        songUrl: document.getElementById('persistentAudio').src,
        currentTime: document.getElementById('persistentAudio').currentTime
    }));
});

window.addEventListener('DOMContentLoaded', () => {
    const savedState = localStorage.getItem('playerState');
    const browseLink = document.getElementById('browse-link');

    browseLink.addEventListener('click', function (event) {
        event.preventDefault(); // Prevent the default anchor click behavior
        // Sample JavaScript code to run
        console.log('Browse link clicked!');
        playlistShowId.classList.add('hidden');
        browseShow();
    });

    if (savedState) {
        const { songName, songUrl, currentTime } = JSON.parse(savedState);
        const audioPlayer = document.getElementById('persistentAudio');

        audioPlayer.src = songUrl;
        audioPlayer.currentTime = currentTime;
        document.getElementById('currentSongName').textContent = songName;

        if (songUrl) {
            audioPlayer.play();
        }
    }
});
