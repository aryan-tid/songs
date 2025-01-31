let page = 1;
let imageUniversalUrl;
let audio = new Audio();
let playlistSongUrl = [];
let playlistSongImg = [];
let playlistSongName = [];
let playlistSongId = [];
let playlistSongArtist = [];
let currentIndexPlaylist = 0;
let randomSongName;
let checkartistId;
let isAdding = false;
let searchQuery;
const songTemplate = document.getElementById('songTemplate');
const songClone = songTemplate.cloneNode(true);
const menuBtn = songClone.querySelector('.menu-btn');

function getAPIBaseURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const isLocal = urlParams.get('local') === 'true';
    return isLocal ? "http://192.168.1.7:3000/api/" : "https://saavn.dev/api/";
}

const APIbaseURL = getAPIBaseURL();


let loop = false; // Default loop state

function toggleLoop() {
    const checkbox = document.getElementById('loopToggle');
    const dot = document.getElementById('switchDot');
    const loopStatus = document.getElementById('loopStatus');
    const switchContainer = document.getElementById('switchContainer');

    // Toggle the checkbox state
    checkbox.checked = !checkbox.checked;

    if (checkbox.checked) {
        dot.style.left = '22px'; // Move dot to the right
        switchContainer.style.background = '#4CAF50'; // Green background for ON state
        loopStatus.innerText = 'On';
        loop = true; // Set loop to true
    } else {
        dot.style.left = '2px'; // Move dot to the left
        switchContainer.style.background = '#ccc'; // Gray background for OFF state
        loopStatus.innerText = 'Off';
        loop = false; // Set loop to false
    }
}


function hideDropdownOnClickOutside() {
    // Listen for clicks on the entire document
    document.addEventListener('click', (event) => {
        // Get all currently visible dropdown menus (including all types)
        const dropdowns = document.querySelectorAll(
            '.dropdown-menu:not(.hidden), .dropdown-menu-album:not(.hidden), .dropdown-menu-artist:not(.hidden)'
        );

        // Loop through each visible dropdown
        dropdowns.forEach((dropdown) => {
            // Check if the click was outside the dropdown or the menu button
            if (!dropdown.contains(event.target) && !dropdown.previousElementSibling.contains(event.target)) {
                dropdown.classList.add('hidden'); // Hide the dropdown
            }
        });
    });
}


// Call this function when your page loads or after creating new dropdown menus
hideDropdownOnClickOutside();


const addToTheQueue = document.getElementById('addToTheQueue');

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

function showHide(showORhide, elementName) {
    if (showORhide === "hide" && elementName === "playlist") {
        playlistShowId.classList.add('hidden');
        playlistImg.classList.add('hidden');
        btnAddPlaylistToQueue.classList.add('hidden');
        playlistName.classList.add('hidden');
        menuBtn.classList.add('hidden');
        playlistMenuBtn.classList.add('hidden');
    } else if (showORhide === "show" && elementName === "playlist") {
        playlistShowId.classList.remove('hidden');
        playlistImg.classList.remove('hidden');
        btnAddPlaylistToQueue.classList.remove('hidden');
        playlistName.classList.remove('hidden');
        menuBtn.classList.remove('hidden');
        playlistMenuBtn.classList.remove('hidden');
    } else if (showORhide === "hide" && elementName === "album") {
        albumShowId.classList.add('hidden');
        albumImg.classList.add('hidden');
        btnAddAlbumToQueue.classList.add('hidden');
        albumName.classList.add('hidden');
        menuBtn.classList.add('hidden');
        albumMenuBtn.classList.add('hidden');
    } else if (showORhide === "show" && elementName === "album") {
        albumShowId.classList.remove('hidden');
        albumImg.classList.remove('hidden');
        btnAddAlbumToQueue.classList.remove('hidden');
        albumName.classList.remove('hidden');
        playlistName.classList.remove('hidden');
        menuBtn.classList.remove('hidden');
        albumMenuBtn.classList.remove('hidden');
    } else if (showORhide === "hide" && elementName === "artist") {
        nextArtistPage.classList.add('hidden');
        previousArtistPage.classList.add('hidden');
        artistShowId.classList.add('hidden');
        artistImg.classList.add('hidden');
        btnAddArtistToQueue.classList.add('hidden');
        artistName.classList.add('hidden');
        menuBtn.classList.add('hidden');
        artistMenuBtn.classList.add('hidden');
    } else if (showORhide === "show" && elementName === "artist") {
        artistShowId.classList.remove('hidden');
        artistImg.classList.remove('hidden');
        btnAddArtistToQueue.classList.remove('hidden');
        artistName.classList.remove('hidden');
        playlistName.classList.remove('hidden');
        artistMenuBtn.classList.remove('hidden');
    } else if (showORhide === "hide" && elementName === "search") {
        h2SearchResults.classList.add('hidden');
        nextPagePlaylist.classList.add('hidden');
        previousPagePlaylist.classList.add('hidden');
        nextPage.classList.add('hidden');
        previousPage.classList.add('hidden');
        previousPageAlbum.classList.add('hidden');
        nextPageAlbum.classList.add('hidden');
        menuBtn.classList.add('hidden');
        playlistMenuBtn.classList.add('hidden');
        albumMenuBtn.classList.add('hidden');
        artistMenuBtn.classList.add('hidden');
    } else if (showORhide === "show" && elementName === "search") {
        browseShowId.classList.remove('hidden');
    } else if (showORhide === "hide" && elementName === "searchAll") {
        browseShowId.classList.add('hidden');
    } else if (showORhide === "show" && elementName === "searchAll") {
        console.log("none");
    }
}

async function playSongByID(songID) {
    const url = `${APIbaseURL}songs/${songID}?lyrics=false`;
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
            playInPlayer(song.name, songPlayUrl.url, song.image[2].url, song.artists.primary.map(artist => artist.name).join(', '))
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

function addSongToQueue(songURL, songIMG, songNAME, songID, songArtist) {

    const index = playlistSongId.indexOf(songID);
    if (index !== -1) {
        showMessage(`'${songNAME}' already exists in Queue`, "negative");
    } else {
        const wasQueueEmpty = playlistSongUrl.length === 0;
        playlistSongUrl.push(songURL);
        playlistSongImg.push(songIMG);
        playlistSongName.push(songNAME);
        playlistSongId.push(songID);
        playlistSongArtist.push(songArtist);
        // If the queue was empty before, play the first song automatically
        if (wasQueueEmpty && playlistSongUrl.length > 0) {
            currentIndexPlaylist = 0;
            loadTrack(currentIndexPlaylist); // Play the first song automatically
        }
    }
}

async function addPlaylistToQueue(playlistID,playSong) {
    if (isAdding) return; // Prevent multiple calls
    isAdding = true;
    const url = `${APIbaseURL}playlists?id=${playlistID}&page=0&limit=100`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        clearQueue();
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
            playlistSongArtist.push(song.artists.primary.map(artist => artist.name).join(', '));
        });
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    } finally {
        // If we don't want to play a specific song, auto-play first song
        if (!playSong) {
            if (wasQueueEmpty && playlistSongUrl.length > 0) {
                currentIndexPlaylist = 0;
                loadTrack(currentIndexPlaylist); // Play the first song automatically
            }
        }
        isAdding = false;
    }
}

async function downloadPlaylist(playlistID) {
    if (isAdding) return; // Prevent multiple calls
    isAdding = true;
    const url = `${APIbaseURL}playlists?id=${playlistID}&page=0&limit=100`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        const results = data.data.songs; // Access songs in data.data.songs
        const selectedQuality = document.getElementById('globalQualitySelect').value;

        results.forEach(async (song) => {
            const songDownloadUrl = song.downloadUrl.find(url => url.quality === selectedQuality);

            if (songDownloadUrl) {
                try {
                    const response = await fetch(songDownloadUrl.url);
                    const blob = await response.blob();
                    const downloadUrl = window.URL.createObjectURL(blob);

                    // Create a hidden link element and click it to download
                    const a = document.createElement('a');
                    a.href = downloadUrl;
                    a.download = `${song.name}.mp3`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();

                    // Revoke the object URL to free memory after download
                    window.URL.revokeObjectURL(downloadUrl);
                } catch (error) {
                    console.error(`Error downloading song "${song.name}":`, error);
                }
            } else {
                console.error(`No download URL found for song "${song.name}" in the selected quality`);
            }
        });

    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    } finally {
        isAdding = false;
    }
}

async function addAlbumToQueue(albumID, playSong) {
    if (isAdding) return; // Prevent multiple calls
    isAdding = true;
    const url = `${APIbaseURL}albums?id=${albumID}&page=0&limit=100`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        clearQueue();
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
            playlistSongArtist.push(song.artists.primary.map(artist => artist.name).join(', '));
        });
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    } finally {
        // If we don't want to play a specific song, auto-play first song
        if (!playSong) {
            if (wasQueueEmpty && playlistSongUrl.length > 0) {
                currentIndexPlaylist = 0;
                loadTrack(currentIndexPlaylist); // Play the first song automatically
            }
        }
        isAdding = false;
    }
}

async function downloadAlbum(albumID) {
    if (isAdding) return; // Prevent multiple calls
    isAdding = true;
    const url = `${APIbaseURL}albums?id=${albumID}&page=0&limit=100`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        const results = data.data.songs; // Access songs in data.data.songs
        const selectedQuality = document.getElementById('globalQualitySelect').value;

        results.forEach(async (song) => {
            const songDownloadUrl = song.downloadUrl.find(url => url.quality === selectedQuality);

            if (songDownloadUrl) {
                try {
                    const response = await fetch(songDownloadUrl.url);
                    const blob = await response.blob();
                    const downloadUrl = window.URL.createObjectURL(blob);

                    // Create a hidden link element and click it to download
                    const a = document.createElement('a');
                    a.href = downloadUrl;
                    a.download = `${song.name}.mp3`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();

                    // Revoke the object URL to free memory after download
                    window.URL.revokeObjectURL(downloadUrl);
                } catch (error) {
                    console.error(`Error downloading song "${song.name}":`, error);
                }
            } else {
                console.error(`No download URL found for song "${song.name}" in the selected quality`);
            }
        });
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    } finally {
        isAdding = false;
    }
}

async function addArtistToQueue(artistID, page, playSong) {
    if (isAdding) return; // Prevent multiple calls
    isAdding = true;
    const wasQueueEmpty = playlistSongUrl.length === 0;
    const url = `${APIbaseURL}artists/${artistID}/songs?page=${page}&sortBy=popularity&sortOrder=desc`;

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
            playlistSongArtist.push(song.artists.primary.map(artist => artist.name).join(', '));
        });
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    } finally {
        // If we don't want to play a specific song, auto-play first song
        if (!playSong) {
            if (wasQueueEmpty && playlistSongUrl.length > 0) {
                currentIndexPlaylist = 0;
                loadTrack(currentIndexPlaylist); // Play the first song automatically
                console.log("False");
            }
        }
        isAdding = false;
    }
}

async function downloadArtist(artistID, page) {
    if (isAdding) return; // Prevent multiple calls
    isAdding = true;
    const url = `${APIbaseURL}artists/${artistID}/songs?page=${page}&sortBy=popularity&sortOrder=desc`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        const results = data.data.songs; // Access songs in data.data.songs
        const selectedQuality = document.getElementById('globalQualitySelect').value;

        results.forEach(async (song) => {
            const songDownloadUrl = song.downloadUrl.find(url => url.quality === selectedQuality);

            if (songDownloadUrl) {
                try {
                    const response = await fetch(songDownloadUrl.url);
                    const blob = await response.blob();
                    const downloadUrl = window.URL.createObjectURL(blob);

                    // Create a hidden link element and click it to download
                    const a = document.createElement('a');
                    a.href = downloadUrl;
                    a.download = `${song.name}.mp3`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();

                    // Revoke the object URL to free memory after download
                    window.URL.revokeObjectURL(downloadUrl);
                } catch (error) {
                    console.error(`Error downloading song "${song.name}":`, error);
                }
            } else {
                console.error(`No download URL found for song "${song.name}" in the selected quality`);
            }
        });

    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    } finally {
        isAdding = false;
    }
}

function searchForInitiator() {
    // Show the browse section
    showHide("show", "search");
    hideMenu();
    document.getElementById('searchBtn').addEventListener('click', async () => {
        searchQuery = document.getElementById('search').value;
        const searchFor = document.getElementById('searchFor').value;
        if (searchFor === "Songs") {
            page = 1;
            menuBtn.classList.remove('hidden');
            showHide("hide", "search");
            showHide("hide", "playlist");
            showHide("hide", "album");
            showHide("hide", "artist");
            addToTheQueue.classList.remove('hidden');
            searchForSongs();
        } else if (searchFor === "Playlists") {
            menuBtn.classList.add('hidden');
            showHide("hide", "search");
            showHide("hide", "playlist");
            showHide("hide", "album");
            showHide("hide", "artist");
            addToTheQueue.classList.remove('hidden');
            page = 1;
            searchForPlaylists();
        } else if (searchFor === "Albums") {
            menuBtn.classList.add('hidden');
            showHide("hide", "search");
            showHide("hide", "playlist");
            showHide("hide", "album");
            showHide("hide", "artist");
            addToTheQueue.classList.remove('hidden');
            page = 1;
            searchForAlbums();
        } else if (searchFor === "Artists") {
            menuBtn.classList.add('hidden');
            showHide("hide", "search");
            showHide("hide", "playlist");
            showHide("hide", "album");
            showHide("hide", "artist");
            addToTheQueue.classList.add('hidden');
            page = 1;
            searchForArtists();
        } else {
            menuBtn.classList.add('hidden');
            page = 1;
            showHide("hide", "search");
            showHide("hide", "playlist");
            showHide("hide", "album");
            showHide("hide", "artist");
            universalSearch();
        }
    });
}

document.getElementById('nextPagePlaylist').addEventListener('click', () => {
    nextPage.disabled = true;
    page++;
    searchForPlaylists();
});
document.getElementById('previousPagePlaylist').addEventListener('click', () => {
    previousPage.disabled = true;
    page--;
    searchForPlaylists();
});

async function searchForPlaylists(params) {
    const playlistName = searchQuery
    //
    if (randomSongName != playlistName) {
        page = 1;
    }
    randomSongName = playlistName;
    const nextPageButton = document.getElementById('nextPagePlaylist');
    const previousPageButton = document.getElementById('previousPagePlaylist');
    searchBtn.disabled = true;
    document.getElementById('loadingOverlay').style.display = 'flex';

    if (!randomSongName) {
        alert('Please enter a playlist name');
        document.getElementById('loadingOverlay').style.display = 'none';
        searchBtn.disabled = false;
        return;
    }

    console.log("current page value is: " + page);
    const url = `${APIbaseURL}search/playlists?query=${encodeURIComponent(playlistName)}&page=${page}&limit=20`;

    // Clear previous playlist results before fetching new ones
    const resultDiv = document.getElementById('result');
    const h2SearchResults = document.getElementById('h2SearchResults');
    showHide("hide", "playlist");
    showHide("hide", "album");
    showHide("hide", "artist");
    h2SearchResults.classList.remove('hidden');

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

            const playSong = () => {
                console.log(song.id);
                playlistShow(song.id);
            };

            // Attach click event listener on the entire card
            songClone.addEventListener('click', playSong);

            // Get the "add to queue" button within the clone
            const addToQueueBtn = songClone.querySelector('.play-btn');

            // Attach click event listener for "add to queue" button
            addToQueueBtn.addEventListener('click', function (event) {
                event.stopPropagation(); // Prevent the playSong function from triggering
                console.log("addToTheQueue triggered for song: " + song.name);
                addPlaylistToQueue(song.id);
            });
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
}

document.getElementById('nextPageAlbum').addEventListener('click', () => {
    nextPage.disabled = true;
    page++;
    searchForAlbums();
});
document.getElementById('previousPageAlbum').addEventListener('click', () => {
    previousPage.disabled = true;
    page--;
    searchForAlbums();
});

async function searchForAlbums(params) {
    const albumName = searchQuery
    //
    if (randomSongName != albumName) {
        page = 1;
    }
    randomSongName = albumName;
    const nextPageButton = document.getElementById('nextPageAlbum');
    const previousPageButton = document.getElementById('previousPageAlbum');
    searchBtn.disabled = true;
    document.getElementById('loadingOverlay').style.display = 'flex';

    if (!randomSongName) {
        alert('Please enter a album name');
        document.getElementById('loadingOverlay').style.display = 'none';
        searchBtn.disabled = false;
        return;
    }

    console.log("current Albums page value is: " + page);
    const url = `${APIbaseURL}search/albums?query=${encodeURIComponent(albumName)}&page=${page}&limit=20`;

    // Clear previous playlist results before fetching new ones
    const resultDiv = document.getElementById('result');
    const h2SearchResults = document.getElementById('h2SearchResults');
    showHide("hide", "playlist");
    showHide("hide", "album");
    showHide("hide", "artist");
    h2SearchResults.classList.remove('hidden');

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

            const playSong = () => {
                console.log(song.id);
                albumShow(song.id);
            };

            // Attach click event listener on the entire card
            songClone.addEventListener('click', playSong);

            // Get the "add to queue" button within the clone
            const addToQueueBtn = songClone.querySelector('.play-btn');

            // Attach click event listener for "add to queue" button
            addToQueueBtn.addEventListener('click', function (event) {
                event.stopPropagation(); // Prevent the playSong function from triggering
                console.log("addToTheQueue triggered for song: " + song.id);
                addAlbumToQueue(song.id);
            });
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

}

async function searchForArtists(params) {
    const artistName = searchQuery
    //
    if (randomSongName != artistName) {
        page = 1;
    }
    randomSongName = artistName;
    searchBtn.disabled = true;
    document.getElementById('loadingOverlay').style.display = 'flex';

    if (!randomSongName) {
        alert('Please enter a artist name');
        document.getElementById('loadingOverlay').style.display = 'none';
        searchBtn.disabled = false;
        return;
    }
    const url = `${APIbaseURL}search/artists?query=${encodeURIComponent(artistName)}&page=1&limit=40`;

    // Clear previous playlist results before fetching new ones
    const resultDiv = document.getElementById('result');
    const h2SearchResults = document.getElementById('h2SearchResults');
    showHide("hide", "playlist");
    showHide("hide", "album");
    showHide("hide", "artist");
    h2SearchResults.classList.remove('hidden');

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

            const playSong = () => {
                console.log(song.id);
                artistShowSongs(song.id);
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
    }
}

async function universalSearch(params) {
    alert("Comming Soon...");
}


document.getElementById('nextPage').addEventListener('click', () => {
    nextPage.disabled = true;
    page++;
    searchForSongs();
});
document.getElementById('previousPage').addEventListener('click', () => {
    previousPage.disabled = true;
    page--;
    searchForSongs();
});

async function searchForSongs() {
    const songName = searchQuery
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
    const url = `${APIbaseURL}search/songs?query=${encodeURIComponent(songName)}&page=${page}&limit=20`;

    // Clear previous playlist results before fetching new ones
    const resultDiv = document.getElementById('result');
    const h2SearchResults = document.getElementById('h2SearchResults');
    showHide("hide", "playlist");
    showHide("hide", "album");
    showHide("hide", "artist");
    h2SearchResults.classList.remove('hidden');

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

            // Get the "add to queue" button within the clone
            const addToQueueBtn = songClone.querySelector('.play-btn');
            addToQueueBtn.addEventListener('click', function (event) {
                event.stopPropagation(); // Prevent the playSong function from triggering
                const selectedQuality = document.getElementById('globalQualitySelect').value;
                const songPlayUrl = song.downloadUrl.find(url => url.quality === selectedQuality);
                console.log("addToTheQueue triggered for song: " + song.name);
                addSongToQueue(songPlayUrl.url, song.image[2].url, song.name, song.id, song.artists.primary.map(artist => artist.name).join(', '));
            });

            // Three dots menu button logic
            const menuBtn = songClone.querySelector('.menu-btn');
            const dropdownMenu = songClone.querySelector('.dropdown-menu');

            // Show or hide the dropdown when the menu button is clicked
            menuBtn.addEventListener('click', (event) => {
                event.stopPropagation(); // Stop it from triggering other click events
                dropdownMenu.classList.toggle('hidden');
            });

            // Download song button logic
            const downloadBtn = dropdownMenu.querySelector('.download-btn');
            downloadBtn.addEventListener('click', async (event) => {
                event.stopPropagation(); // Prevent closing of the menu
                dropdownMenu.classList.add('hidden'); // Hide the menu after click

                const selectedQuality = document.getElementById('globalQualitySelect').value;
                const songDownloadUrl = song.downloadUrl.find(url => url.quality === selectedQuality);

                if (songDownloadUrl) {
                    try {
                        const response = await fetch(songDownloadUrl.url);
                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);

                        // Create a hidden link element and click it to download
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${song.name}.mp3`;
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                    } catch (error) {
                        console.error('Error downloading the song:', error);
                    }
                } else {
                    console.error('No download URL found for this quality');
                }
            });

            // Append the clone to the resultDiv
            resultDiv.appendChild(songClone);
        });
        // Handle clicks outside of the dropdown to close it
        window.addEventListener('click', (event) => {
            document.querySelectorAll('.dropdown-menu').forEach(menu => {
                if (!menu.classList.contains('hidden')) {
                    menu.classList.add('hidden');
                }
            });
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

}

document.getElementById('search').addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        document.getElementById('searchBtn').click();
    }
});

let artistPage = 1;
let tempArtistID;

document.getElementById('nextArtistPage').addEventListener('click', () => {
    nextArtistPage.disabled = true;
    artistPage++;
    artistShowSongs(tempArtistID);
});
document.getElementById('previousArtistPage').addEventListener('click', () => {
    previousArtistPage.disabled = true;
    artistPage--;
    artistShowSongs(tempArtistID);
});

async function artistShowSongs(artistId) {
    addToTheQueue.classList.remove('hidden');
    tempArtistID = artistId;
    scrollToTop()
    document.getElementById('btnAddArtistToQueue').disabled = false;
    if (checkartistId != artistId) {
        artistPage = 1;
    }
    checkartistId = artistId;

    const nextArtistPageButton = document.getElementById('nextArtistPage');
    const previousArtistPageButton = document.getElementById('previousArtistPage');
    console.log("current page value is: " + artistPage);

    const url = `${APIbaseURL}artists/${artistId}/songs?page=${artistPage}&sortBy=popularity&sortOrder=desc`;
    const url2 = `${APIbaseURL}artists/${artistId}?songCount=1&page=1&albumCount=1`;

    try {
        const response = await fetch(url2);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        const resultsArtistName = data.data.name;
        const resultsArtistImg = data.data.image[2].url;
        document.getElementById('artistName').textContent = resultsArtistName;
        document.getElementById('artistImg').src = resultsArtistImg;
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        document.getElementById('result').textContent = 'Error fetching artist data'; // Update to correct element
    }

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        showHide("hide", "playlist");
        showHide("hide", "album");
        showHide("hide", "search");
        showHide("hide", "searchAll");
        showHide("show", "artist");

        const results = data.data.songs; // Access songs in data.data.songs
        const resultDiv = document.getElementById('result');

        // Clear previous results
        resultDiv.innerHTML = '';

        // Loop through the songs and clone the template for each song
        results.forEach((song) => {
            const songTemplate = document.getElementById('songTemplate');
            const songClone = songTemplate.cloneNode(true); // Deep clone the template
            songClone.style.display = 'block'; // Make it visible
            songClone.querySelector('.song-ID span').textContent = song.id;

            // Update the content with song data
            songClone.querySelector('.song-img').src = song.image[1].url;
            songClone.querySelector('.song-name span').textContent = song.name.replace(/&quot;/g, ' ');
            songClone.querySelector('.song-artists span').textContent = song.artists.primary.map(artist => artist.name).join(', ');

            const playSong = async () => {
                clearQueue();
                await addArtistToQueue(artistId, artistPage, true); // Wait for this to complete
                playQueueSongByID(song.id); // Now this runs only after addArtistToQueue finishes
            };


            songClone.addEventListener('click', playSong);

            // Get the "add to queue" button within the clone
            const addToQueueBtn = songClone.querySelector('.play-btn');

            // Attach click event listener for "add to queue" button
            addToQueueBtn.addEventListener('click', function (event) {
                event.stopPropagation(); // Prevent the playSong function from triggering
                const selectedQuality = document.getElementById('globalQualitySelect').value;
                const songPlayUrl = song.downloadUrl.find(url => url.quality === selectedQuality);
                console.log("addToTheQueue triggered for song: " + song.name);
                addSongToQueue(songPlayUrl.url, song.image[2].url, song.name, song.id, song.artists.primary.map(artist => artist.name).join(', '));
            });

            // Three dots menu button logic
            const menuBtn = songClone.querySelector('.menu-btn');
            const dropdownMenu = songClone.querySelector('.dropdown-menu');

            // Show or hide the dropdown when the menu button is clicked
            menuBtn.addEventListener('click', (event) => {
                event.stopPropagation(); // Stop it from triggering other click events
                dropdownMenu.classList.toggle('hidden');
            });

            // Download song button logic
            const downloadBtn = dropdownMenu.querySelector('.download-btn');
            downloadBtn.addEventListener('click', (event) => {
                event.stopPropagation(); // Prevent closing of the menu
                dropdownMenu.classList.add('hidden'); // Hide the menu after click
            });

            // Append the clone to the resultDiv
            resultDiv.appendChild(songClone);
        });

        // Artist dropdown menu logic
        const artistMenuBtn = document.getElementById('artistMenuBtn');
        const artistDropdownMenu = document.getElementById('artistDropdownMenu');

        // Remove any existing event listeners before adding new ones
        const newArtistMenuBtn = artistMenuBtn.cloneNode(true);
        artistMenuBtn.parentNode.replaceChild(newArtistMenuBtn, artistMenuBtn);

        newArtistMenuBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            artistDropdownMenu.classList.toggle('hidden');
        });

        // Download Artist button logic
        const downloadArtistBtn = artistDropdownMenu.querySelector('.download-artist-btn');
        const newDownloadArtistBtn = downloadArtistBtn.cloneNode(true);
        downloadArtistBtn.parentNode.replaceChild(newDownloadArtistBtn, downloadArtistBtn);

        newDownloadArtistBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            artistDropdownMenu.classList.add('hidden');
            downloadArtist(artistId, artistPage); // Trigger downloadArtist function
        });

        // Add artist to queue button logic
        document.getElementById('btnAddArtistToQueue').onclick = () => {
            document.getElementById('btnAddArtistToQueue').disabled = true;
            addArtistToQueue(artistId, artistPage, false); // Call the addArtistToQueue function
        };

    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        document.getElementById('result').textContent = 'Error fetching artist songs'; // Update to correct element
    } finally {
        nextArtistPageButton.classList.remove('hidden');
        if (artistPage > 1) {
            previousArtistPageButton.classList.remove('hidden');
        } else {
            previousArtistPageButton.classList.add('hidden');
        }
        nextArtistPageButton.disabled = false;
        previousArtistPageButton.disabled = false;
    }
}


async function albumShow(albumId) {
    addToTheQueue.classList.remove('hidden');
    document.getElementById('btnAddAlbumToQueue').disabled = false;
    const url = `${APIbaseURL}albums?id=${albumId}`;
    scrollToTop()

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        const resultsAlbumName = data.data.name;
        const resultsAlbumImg = data.data.image[2].url;
        document.getElementById('albumName').textContent = resultsAlbumName;
        document.getElementById('albumImg').src = resultsAlbumImg;
        console.log(resultsAlbumName, resultsAlbumImg);
        showHide("hide", "playlist");
        showHide("hide", "artist");
        showHide("hide", "search");
        showHide("hide", "searchAll");
        showHide("show", "album");
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

            const playSong = async () => {
                clearQueue();
                await addAlbumToQueue(albumId, true); // Wait for this to complete
                playQueueSongByID(song.id);
            };

            songClone.addEventListener('click', playSong);

            // Get the "add to queue" button within the clone
            const addToQueueBtn = songClone.querySelector('.play-btn');

            // Attach click event listener for "add to queue" button
            addToQueueBtn.addEventListener('click', function (event) {
                event.stopPropagation(); // Prevent the playSong function from triggering
                const selectedQuality = document.getElementById('globalQualitySelect').value;
                const songPlayUrl = song.downloadUrl.find(url => url.quality === selectedQuality);
                console.log("addToTheQueue triggered for song: " + song.name);
                addSongToQueue(songPlayUrl.url, song.image[2].url, song.name, song.id, song.artists.primary.map(artist => artist.name).join(', '));
            });

            // Three dots menu button logic
            const menuBtn = songClone.querySelector('.menu-btn');
            const dropdownMenu = songClone.querySelector('.dropdown-menu');

            // Show or hide the dropdown when the menu button is clicked
            menuBtn.addEventListener('click', (event) => {
                event.stopPropagation(); // Stop it from triggering other click events
                dropdownMenu.classList.toggle('hidden');
            });

            // Append the clone to the resultDiv
            resultDiv.appendChild(songClone);
        });

        // Playlist dropdown menu logic
        const playlistMenuBtn = document.getElementById('albumMenuBtn');
        const playlistDropdownMenu = document.getElementById('albumDropdownMenu');

        // Remove any existing event listeners before adding new ones
        const newPlaylistMenuBtn = playlistMenuBtn.cloneNode(true);
        playlistMenuBtn.parentNode.replaceChild(newPlaylistMenuBtn, playlistMenuBtn);

        newPlaylistMenuBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            playlistDropdownMenu.classList.toggle('hidden');
        });

        // Download Playlist button logic
        const downloadPlaylistBtn = playlistDropdownMenu.querySelector('.download-album-btn');
        const newDownloadPlaylistBtn = downloadPlaylistBtn.cloneNode(true);
        downloadPlaylistBtn.parentNode.replaceChild(newDownloadPlaylistBtn, downloadPlaylistBtn);

        newDownloadPlaylistBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            playlistDropdownMenu.classList.add('hidden');
            downloadAlbum(albumId); // Trigger downloadPlaylist function
        });

        // Add album to queue button logic
        document.getElementById('btnAddAlbumToQueue').onclick = () => {
            document.getElementById('btnAddAlbumToQueue').disabled = true;
            addAlbumToQueue(albumId); // Call the addPlaylistToQueue function
        };
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        document.getElementById('result').textContent = 'Error fetching data'; // Update to correct element
    }
}


async function playlistShow(playlistId) {
    addToTheQueue.classList.remove('hidden');
    document.getElementById('btnAddPlaylistToQueue').disabled = false;
    const url = `${APIbaseURL}playlists?id=${playlistId}&page=0&limit=100`;
    scrollToTop()

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
        showHide("hide", "album");
        showHide("hide", "artist");
        showHide("hide", "search");
        showHide("hide", "searchAll");
        showHide("show", "playlist");
        const results = data.data.songs; // Access songs in data.data.songs
        const resultDiv = document.getElementById('result');

        // Clear previous results
        resultDiv.innerHTML = '';

        // Loop through the songs and clone the template for each song
        results.forEach((song) => {
            const songTemplate = document.getElementById('songTemplate');
            const songClone = songTemplate.cloneNode(true); // Deep clone the template
            songClone.style.display = 'block'; // Make it visible
            songClone.querySelector('.song-ID span').textContent = song.id;

            // Update the content with song data
            songClone.querySelector('.song-img').src = song.image[1].url;
            songClone.querySelector('.song-name span').textContent = song.name.replace(/&quot;/g, ' ');
            songClone.querySelector('.song-artists span').textContent = song.artists.primary.map(artist => artist.name).join(', ');

            const playSong = async () => {
                clearQueue();
                await addPlaylistToQueue(playlistId, true); // Wait for this to complete
                playQueueSongByID(song.id);
            };

            songClone.addEventListener('click', playSong);

            // Get the "add to queue" button within the clone
            const addToQueueBtn = songClone.querySelector('.play-btn');

            // Attach click event listener for "add to queue" button
            addToQueueBtn.addEventListener('click', function (event) {
                event.stopPropagation(); // Prevent the playSong function from triggering
                const selectedQuality = document.getElementById('globalQualitySelect').value;
                const songPlayUrl = song.downloadUrl.find(url => url.quality === selectedQuality);
                console.log("addToTheQueue triggered for song: " + song.name);
                addSongToQueue(songPlayUrl.url, song.image[2].url, song.name, song.id, song.artists.primary.map(artist => artist.name).join(', '));
            });

            // Three dots menu button logic
            const menuBtn = songClone.querySelector('.menu-btn');
            const dropdownMenu = songClone.querySelector('.dropdown-menu');

            // Show or hide the dropdown when the menu button is clicked
            menuBtn.addEventListener('click', (event) => {
                event.stopPropagation(); // Stop it from triggering other click events
                dropdownMenu.classList.toggle('hidden');
            });

            // Append the clone to the resultDiv
            resultDiv.appendChild(songClone);
        });

        // Playlist dropdown menu logic
        const playlistMenuBtn = document.getElementById('playlistMenuBtn');
        const playlistDropdownMenu = document.getElementById('playlistDropdownMenu');

        // Remove any existing event listeners before adding new ones
        const newPlaylistMenuBtn = playlistMenuBtn.cloneNode(true);
        playlistMenuBtn.parentNode.replaceChild(newPlaylistMenuBtn, playlistMenuBtn);

        newPlaylistMenuBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            playlistDropdownMenu.classList.toggle('hidden');
        });

        // Download Playlist button logic
        const downloadPlaylistBtn = playlistDropdownMenu.querySelector('.download-playlist-btn');
        const newDownloadPlaylistBtn = downloadPlaylistBtn.cloneNode(true);
        downloadPlaylistBtn.parentNode.replaceChild(newDownloadPlaylistBtn, downloadPlaylistBtn);

        newDownloadPlaylistBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            playlistDropdownMenu.classList.add('hidden');
            downloadPlaylist(playlistId); // Trigger downloadPlaylist function
        });

        // Add playlist to queue button logic
        document.getElementById('btnAddPlaylistToQueue').onclick = () => {
            document.getElementById('btnAddPlaylistToQueue').disabled = true;
            addPlaylistToQueue(playlistId); // Call the addPlaylistToQueue function
        };

    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        document.getElementById('result').textContent = 'Error fetching data'; // Update to correct element
    }
}

// Call the init function to execute the code
// playlistShow(47599074);
artistShowSongs(459320);

// Play song in the player
function playInPlayer(songName, url, imgUrl1, songArtist) {
    const audioPlayer = document.getElementById('audioPlayer');
    const songNameDisplay = document.getElementById('currentSongName');
    document.getElementById('newPlayerImg').src = imgUrl1;
    document.getElementById('newPlayerName').textContent = songName;
    document.getElementById('newPlayerArtist').textContent = songArtist;
    // Set the audio source and play
    audio.src = url; // Set the source to the dynamic URL fetched from API
    audio.play()
        .then(() => {
            songNameDisplay.textContent = songName.replace(/&quot;/g, ' ');
            document.title = `${(songName).replace(/&quot;/g, ' ')} - Melodify`; // Change the title dynamically
            const playBtn = audioPlayer.querySelector(".controls .toggle-play");
            playBtn.classList.remove("play");
            playBtn.classList.add("pause");
            const playButton = document.querySelector(".play svg path");
            // Change to Pause Icon
            playButton.setAttribute("d", "M8 5h5v20H8V5zm9 0h5v20h-5V5z");

        })
        .catch(error => {
            console.error('Error playing audio:', error);
        });
    callMediaSession(imgUrl1, songName);
    showSongQueueNewSize();
}

// Removed local storage logic
window.addEventListener('DOMContentLoaded', () => {
    const browseLink = document.getElementById('browse-link');
    prefillPage();

    browseLink.addEventListener('click', function (event) {
        event.preventDefault(); // Prevent the default anchor click behavior
        const playlistShowId = document.getElementById('playlistShowId');
        playlistShowId.classList.add('hidden');
        searchForInitiator();
    });
});

// New player logic
const audioPlayer = document.querySelector(".audio-player");
const audioPlayer2 = document.querySelector("#player02"); // New Player
audio = new Audio(); // You can update the song file if needed

audio.addEventListener('loadeddata', () => {
    audioPlayer.querySelector(".time .length").textContent = getTimeCodeFromNum(audio.duration);
    audioPlayer2.querySelector(".total-time").textContent = getTimeCodeFromNum(audio.duration);
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
    audioPlayer2.querySelector(".current-time").textContent = getTimeCodeFromNum(currentTime);
}, false);

const progressContainer = document.getElementById('progress-container');
const progress = document.getElementById('progress');

// Update progress bar as audio plays
audio.addEventListener('timeupdate', updateProgress);

// Click on progress bar to seek
progressContainer.addEventListener('click', setProgress);

function updateProgress(e) {
    const { duration, currentTime } = e.srcElement;
    const progressPercent = (currentTime / duration) * 100;
    progress.style.width = `${progressPercent}%`;
}

function setProgress(e) {
    const width = this.clientWidth;
    const clickX = e.offsetX;
    const duration = audio.duration;
    audio.currentTime = (clickX / width) * duration;
}

const playBtn = audioPlayer.querySelector(".controls .toggle-play");
playBtn.addEventListener("click", () => {
    togglePlayPause2();
}, false);

function togglePlayPause2() {
    const playButton = document.querySelector(".play svg path");
    if (audio.paused) {
        audio.play();
        playBtn.classList.remove("play");
        playBtn.classList.add("pause");
        // Change to Pause Icon
        playButton.setAttribute("d", "M8 5h5v20H8V5zm9 0h5v20h-5V5z");
    } else {
        audio.pause();
        playBtn.classList.remove("pause");
        playBtn.classList.add("play");
        // Change to Play Icon
        playButton.setAttribute("d", "M8.32137 25.586C7.9759 25.5853 7.63655 25.4948 7.33669 25.3232C6.66148 24.9406 6.24173 24.1978 6.24173 23.3915V7.07398C6.24173 6.26542 6.66148 5.52494 7.33669 5.14232C7.64369 4.96589 7.99244 4.87516 8.3465 4.87961C8.70056 4.88407 9.04692 4.98354 9.34938 5.16764L23.2952 13.5155C23.5859 13.6977 23.8255 13.9508 23.9916 14.251C24.1577 14.5511 24.2448 14.8886 24.2448 15.2316C24.2448 15.5747 24.1577 15.9121 23.9916 16.2123C23.8255 16.5125 23.5859 16.7655 23.2952 16.9478L9.34713 25.2979C9.0376 25.485 8.68307 25.5846 8.32137 25.586V25.586Z");
    }
}

// Function to get time code from number
function getTimeCodeFromNum(num) {
    const minutes = Math.floor(num / 60);
    const seconds = Math.floor(num % 60);
    return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
}

// This event triggers when the song ends, and it automatically plays the next one.
audio.addEventListener("ended", () => {
    loadNextTrack(); // Automatically play the next song
}, false);
function loadNextTrack() {
    if(loop) {
        audio.currentTime = 0;
        audio.play();
    } else if (currentIndexPlaylist < playlistSongUrl.length - 1) {
        currentIndexPlaylist++;
        loadTrack(currentIndexPlaylist);
    } else {
        audio.pause(); // Stop playback
        playBtn.classList.remove("pause");
        playBtn.classList.add("play");
    }
}

function loadNextTrack2() {
    if (currentIndexPlaylist < playlistSongUrl.length - 1) {
        currentIndexPlaylist++;
        loadTrack(currentIndexPlaylist);
    }  else {
        showMessage('Last song in Queue',"negative")
    }
}

function loadPreviousTrack2() {
    if (audio.currentTime > 8) {
        audio.currentTime = 0;
    } else if (currentIndexPlaylist > 0) {
        currentIndexPlaylist--;
        loadTrack(currentIndexPlaylist);
    }
}


function loadTrack(index) {
    const audioSrc = playlistSongUrl[index];
    const audioName = playlistSongName[index];
    const imageUrl = playlistSongImg[index];
    const artistName = playlistSongArtist[index];
    playInPlayer(audioName, audioSrc, imageUrl, artistName);
    showSongQueueNewSize();
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

let songQueueOpen = false;

// Function to highlight the current song card
function highlightCurrentSongCard() {
    const allSongCards = document.querySelectorAll('#songQueue .song-card'); // Target only cards inside #songQueue

    // Remove highlight from all song cards and reset text color
    allSongCards.forEach(card => {
        card.style.backgroundColor = ''; // Reset background color
        card.style.color = ''; // Reset text color
    });

    // Highlight the current song card
    const currentCard = allSongCards[currentIndexPlaylist];
    if (currentCard) {
        currentCard.style.backgroundColor = '#2D8F7A'; // Set background color to highlight the current song
        currentCard.style.color = 'white'; // Change text color to white for the current song
    }
}

// Touch event handlers for mobile
let draggedIndex;
let targetIndex; // Variable to keep track of the target index


// Event listeners for showing and closing the popup
document.getElementById('currentSongName').addEventListener('click', showSongQueueNew);
document.getElementById('closePopup').addEventListener('click', () => {
    document.getElementById('songQueuePopup').classList.add('hiddenNew');
    songQueueOpen = false;
});

// Drag and drop functions
function dragStart(event) {
    draggedIndex = event.target.closest('.song-card').dataset.index;
    event.dataTransfer.setData('text/plain', draggedIndex);
    event.target.closest('.song-card').classList.add('dragging'); // Add class for animation
}

function dragOver(event) {
    event.preventDefault(); // Allow dropping
    const target = event.target.closest('.song-card');
    if (target && target !== event.target) {
        target.classList.add('hover'); // Add a hover class for animation
    }
}

function dragLeave(event) {
    const target = event.target.closest('.song-card');
    if (target) {
        target.classList.remove('hover'); // Remove hover class
    }
}

function drop(event) {
    event.preventDefault();
    const targetIndex = event.target.closest('.song-card').dataset.index;

    if (draggedIndex !== targetIndex) {
        reorderSongs(draggedIndex, targetIndex); // Reorder songs
        showSongQueueNew();
    }
    event.target.closest('.song-card').classList.remove('hover'); // Remove hover class on drop
}

function dragEnd(event) {
    const songCards = document.querySelectorAll('.song-card');
    songCards.forEach(card => {
        card.classList.remove('hover'); // Remove hover class from all cards
        card.classList.remove('dragging'); // Remove dragging class
    });
}

// Function to reorder songs based on dragged and target indices
function reorderSongs(draggedIndex, targetIndex) {
    if (targetIndex < 0 || targetIndex >= playlistSongName.length) {
        return; // Prevent out-of-bounds reordering
    }

    // Convert string indices to integers
    const fromIndex = parseInt(draggedIndex);
    const toIndex = parseInt(targetIndex);

    const songIdToFind = playlistSongId[currentIndexPlaylist];

    // Move the song from the dragged index to the target index
    const movedSongUrl = playlistSongUrl[fromIndex];
    const movedSongImg = playlistSongImg[fromIndex];
    const movedSongName = playlistSongName[fromIndex];
    const movedSongId = playlistSongId[fromIndex];

    // Remove the song from the original position
    playlistSongUrl.splice(fromIndex, 1);
    playlistSongImg.splice(fromIndex, 1);
    playlistSongName.splice(fromIndex, 1);
    playlistSongId.splice(fromIndex, 1);

    // Insert the song at the target position
    playlistSongUrl.splice(toIndex, 0, movedSongUrl);
    playlistSongImg.splice(toIndex, 0, movedSongImg);
    playlistSongName.splice(toIndex, 0, movedSongName);
    playlistSongId.splice(toIndex, 0, movedSongId);

    const index = playlistSongId.indexOf(songIdToFind);

    if (index !== -1) {
        currentIndexPlaylist = index;
        console.log(`Song ID found at index: ${index}`);
    } else {
        console.log("Song ID not found in the playlist.");
    }

    showSongQueueNew();
}

document.getElementById('btnClearQueue').onclick = () => {
    clearQueue();
    showSongQueueNew();
};

function clearQueue() {
    playlistSongUrl = [];
    playlistSongImg = [];
    playlistSongName = [];
    playlistSongId = [];
}

const modal = document.getElementById('songQueuePopup');
const body = document.body;

document.getElementById('closePopup').addEventListener('click', function () {
    modal.classList.add('hiddenNew');
    body.classList.remove('modal-open'); // Remove modal-open class when modal is closed
});

// Close the modal when clicking outside of the modal content
window.addEventListener('click', function (event) {
    const modal2 = document.getElementById('songQueuePopup');
    if (event.target === modal) {
        modal.classList.add('hiddenNew');
        body.classList.remove('modal-open');
        songQueueOpen = false;
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const elements = document.querySelectorAll('body *'); // Select all elements inside body
    elements.forEach((element) => {
        element.style.userSelect = 'none'; // Disable text selection
    });
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

function prefillPage() {
    const urlParams = getUrlParams();

    if (urlParams['playlist']) {
        const playlist = urlParams['playlist']; // Get the actual playlist value from URL
        playlistShow(playlist); // Pass it to the function
    }

    if (urlParams['album']) {
        const album = urlParams['album']; // Get the actual album value from URL
        albumShow(album); // Pass it to the function
    }

    if (urlParams['artist']) {
        const artist = urlParams['artist']; // Get the actual album value from URL
        artistShowSongs(artist); // Pass it to the function
    }
}

function showMessage(messageText, messageType) {
    const message = document.getElementById("message");
    message.textContent = messageText;

    // Set color based on message type
    if (messageType === "positive") {
        message.style.backgroundColor = "#006400"; // Dark Green
        message.style.color = "white";
    } else {
        message.style.backgroundColor = "#D20103"; // Red
        message.style.color = "white";
    }

    // Show the message
    message.style.display = "block";

    // Hide message after 5 seconds
    setTimeout(() => {
        message.style.display = "none";
    }, 5000);
}

// Close message immediately on tap
document.getElementById("message").addEventListener("click", () => {
    document.getElementById("message").style.display = "none";
});

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}
function playQueueSongByID(songID){
    const index = playlistSongId.indexOf(songID);
    if (index !== -1) {
        currentIndexPlaylist=index;
        loadTrack(currentIndexPlaylist);
    } else {
        showMessage(`Unkown Error Occured!!!`, "negative")
    }
}

/*
window.addEventListener('beforeunload', function (e) {
    // Custom message for the confirmation dialog
    var confirmationMessage = 'Are you sure you want to leave?';

    // The standard behavior is to show a generic browser dialog.
    (e || window.event).returnValue = confirmationMessage; // For most browsers
    return confirmationMessage; // For some older browsers
}); */
async function callMediaSession(urlImage1, SongName) {
    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: SongName.replace(/&quot;/g, ' '),
            artwork: [{ src: urlImage1, sizes: '512x512', type: 'image/png' }],
        });

        function togglePlayPause() {
            const playButton = document.querySelector(".play svg path");
            if (audio.paused) {
                audio.play();
                playBtn.classList.remove("play");
                playBtn.classList.add("pause");
                // Change to Pause Icon
                playButton.setAttribute("d", "M8 5h5v20H8V5zm9 0h5v20h-5V5z");
            } else {
                audio.pause();
                playBtn.classList.remove("pause");
                playBtn.classList.add("play");
                // Change to Play Icon
                playButton.setAttribute("d", "M8.32137 25.586C7.9759 25.5853 7.63655 25.4948 7.33669 25.3232C6.66148 24.9406 6.24173 24.1978 6.24173 23.3915V7.07398C6.24173 6.26542 6.66148 5.52494 7.33669 5.14232C7.64369 4.96589 7.99244 4.87516 8.3465 4.87961C8.70056 4.88407 9.04692 4.98354 9.34938 5.16764L23.2952 13.5155C23.5859 13.6977 23.8255 13.9508 23.9916 14.251C24.1577 14.5511 24.2448 14.8886 24.2448 15.2316C24.2448 15.5747 24.1577 15.9121 23.9916 16.2123C23.8255 16.5125 23.5859 16.7655 23.2952 16.9478L9.34713 25.2979C9.0376 25.485 8.68307 25.5846 8.32137 25.586V25.586Z");
            }
        }

        function seekForward() {
            audio.currentTime = Math.min(audio.duration, audio.currentTime + 10);
        }

        function seekBackward() {
            audio.currentTime = Math.max(0, audio.currentTime - 10);
        }

        function loadPreviousTrack() {
            if (audio.currentTime > 8) {
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
            }  else {
                showMessage('Last song in Queue',"negative")
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

        // Media session action handlers
        navigator.mediaSession.setActionHandler('play', togglePlayPause);
        navigator.mediaSession.setActionHandler('pause', togglePlayPause);
        navigator.mediaSession.setActionHandler('seekbackward', seekBackward);
        navigator.mediaSession.setActionHandler('seekforward', seekForward);
        navigator.mediaSession.setActionHandler('previoustrack', loadPreviousTrack);
        navigator.mediaSession.setActionHandler('nexttrack', loadNextTrack);
        navigator.mediaSession.setActionHandler('stop', togglePlayPause);
    }
}




function showSongQueueNew() {
    const songQueueContainer = document.getElementById('songQueueNew');
    const songQueuePopup = document.getElementById('songQueuePopup');
    const modal = document.getElementById('songQueuePopup');
    modal.classList.remove('hiddenNew');
    const body = document.body;
    body.classList.add('modal-open'); // Add modal-open class when modal is opened
    songQueueOpen = true;

    songQueueContainer.innerHTML = ''; // Clear previous content

    // Create song cards for each song in the playlist
    playlistSongName.forEach((songName, index) => {
        const songCard = document.createElement('div');
        songCard.className = 'song-card';
        songCard.dataset.index = index; // Store index for drag-and-drop
        songCard.draggable = true; // Make the card draggable
        songCard.innerHTML = `
            <img src="${playlistSongImg[index]}" alt="${songName}" class="song-img" />
            <div class="song-info">
                <span class="song-name">${songName}</span>
                <span class="song-id">${playlistSongId[index]}</span>
            </div>
            <button class="del-song">x</button>
        `;
        // Use querySelector within the songCard to select the current buttons
        const deleteSong = songCard.querySelector(".del-song");

        // Add event listeners for the buttons
        deleteSong.addEventListener("click", function (event) {
            const songIdToFind = playlistSongId[currentIndexPlaylist];
            event.stopPropagation(); // Prevent the click from triggering the song card click event
            const clickedIndex = parseInt(songCard.dataset.index);

            // Remove song from the arrays
            playlistSongName.splice(clickedIndex, 1);
            playlistSongUrl.splice(clickedIndex, 1);
            playlistSongImg.splice(clickedIndex, 1);
            playlistSongId.splice(clickedIndex, 1);

            // If the current song was deleted, stop playing or play the next song
            if (currentIndexPlaylist === clickedIndex) {
                if (playlistSongUrl.length > 0) {
                    currentIndexPlaylist = (clickedIndex === playlistSongUrl.length) ? clickedIndex - 1 : clickedIndex; // Ensure we don't go out of bounds
                    playInPlayer(playlistSongName[currentIndexPlaylist], playlistSongUrl[currentIndexPlaylist], playlistSongImg[currentIndexPlaylist],artistName = playlistSongArtist[currentIndexPlaylist]);
                } else {
                    loadNextTrack();
                }
            } else {
                const index = playlistSongId.indexOf(songIdToFind);

                if (index !== -1) {
                    currentIndexPlaylist = index;
                    console.log(`Song ID found at index: ${index}`);
                } else {
                    console.log("Song ID not found in the playlist.");
                }
            }
            showSongQueueNew(); // Refresh the queue display after reordering
        });

        // Add event listener for playing the song when the card is clicked (but not on buttons)
        songCard.addEventListener('click', (event) => {
            const clickedIndex = event.currentTarget.dataset.index; // Use currentTarget to ensure the card itself is referenced
            currentIndexPlaylist = clickedIndex;
            playInPlayer(playlistSongName[clickedIndex], playlistSongUrl[clickedIndex], playlistSongImg[clickedIndex], playlistSongArtist[clickedIndex]);

            // Highlight the current playing song card
            highlightCurrentSongCard();
        });

        // Handle drag events
        songCard.addEventListener('dragstart', dragStart);
        songCard.addEventListener('dragover', dragOver);
        songCard.addEventListener('drop', drop);
        songCard.addEventListener('dragend', dragEnd);
        songCard.addEventListener('dragleave', dragLeave);

        songQueueContainer.appendChild(songCard);
    });

    // Call to highlight the currently playing song card (in case the playlist is being shown after a song is already playing)
    highlightCurrentSongCards();

    console.log("refresh");
}
// Function to highlight the current song card
function highlightCurrentSongCards() {
    const allSongCards = document.querySelectorAll('.song-card'); // Target only cards inside #songQueue

    // Remove highlight from all song cards and reset text color
    allSongCards.forEach(card => {
        card.style.backgroundColor = ''; // Reset background color
        card.style.color = ''; // Reset text color
    });

    // Highlight the current song card
    const currentCard = allSongCards[currentIndexPlaylist];
    if (currentCard) {
        currentCard.style.backgroundColor = '#2D8F7A'; // Set background color to highlight the current song
        currentCard.style.color = 'white'; // Change text color to white for the current song
    }
}
function checkScreenWidth() {
    const modal = document.querySelector('.modal'); // Select the modal
    if (window.innerWidth < 921) {
        modal.classList.add('hiddenNew'); // Hide modal
    } else {
        modal.classList.remove('hiddenNew'); // Show modal if width is 900 or more
    }
}

function showSongQueueNewSize() {
    if (window.innerWidth < 921) {
        if(songQueueOpen){
            showSongQueueNew();
        }
    } else {
            showSongQueueNew();
    }
}

// Run on page load
checkScreenWidth();

// Run on window resize
window.addEventListener('resize', checkScreenWidth);
