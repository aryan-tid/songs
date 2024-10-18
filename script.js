document.getElementById('searchBtn').addEventListener('click', () => {
    const songName = document.getElementById('songName').value;

    if (!songName) {
        alert('Please enter a song name');
        return;
    }

    const url = `https://saavn.dev/api/search/songs?query=${encodeURIComponent(songName)}`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const results = data.data.results;
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
            document.getElementById('result').textContent = 'Error fetching data';
        });
});

function playInPlayer(songName, url) {
    const audioPlayer = document.getElementById('persistentAudio');
    const songNameDisplay = document.getElementById('currentSongName');
    
    audioPlayer.src = url;
    audioPlayer.play();
    
    songNameDisplay.textContent = songName;
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
// Function to retrieve URL parameters
function getUrlParams() {
    const params = {};
    const queryString = window.location.search.substring(1);
    const queryArray = queryString.split("&");

    queryArray.forEach(param => {
        const [key, value] = param.split("=");
        params[decodeURIComponent(key)] = decodeURIComponent(value || "");
    });

    return params;
}

// Call prefillForm when the page loads to auto-fill the form
document.addEventListener('DOMContentLoaded', prefillForm);

// Function to prefill the form based on URL parameters
function prefillForm() {
    const urlParams = getUrlParams();

    // Prefill the form inputs with values from the URL if available
    if (urlParams['songName']) {
        songName.value = urlParams['songName'];
    }

    // If all required fields are prefilled, trigger a form submission
    if (urlParams['songName']) {
        searchBtn.click();
    }
}