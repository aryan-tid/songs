let page = 1;
let imageUniversalUrl;
let audio = new Audio();
let playlistSongUrl = [];
let playlistSongImg = [];
let playlistSongName = [];
let playlistSongId = [];
let currentIndexPlaylist = 0;
let randomSongName;
let checkartistId;
let testindexorder = 0;
let isAdding = false;
let searchQuery;
const addToTheQueue = document.getElementById('addToTheQueue');

window.addEventListener('beforeunload', function (e) {
    // Custom message for the confirmation dialog
    var confirmationMessage = 'Are you sure you want to leave?';

    // The standard behavior is to show a generic browser dialog.
    (e || window.event).returnValue = confirmationMessage; // For most browsers
    return confirmationMessage; // For some older browsers
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

function showHide(showORhide, elementName) {
    if (showORhide === "hide" && elementName === "playlist") {
        playlistShowId.classList.add('hidden');
        playlistImg.classList.add('hidden');
        btnAddPlaylistToQueue.classList.add('hidden');
        playlistName.classList.add('hidden');
    } else if (showORhide === "show" && elementName === "playlist") {
        playlistShowId.classList.remove('hidden');
        playlistImg.classList.remove('hidden');
        btnAddPlaylistToQueue.classList.remove('hidden');
        playlistName.classList.remove('hidden');
    } else if (showORhide === "hide" && elementName === "album") {
        albumShowId.classList.add('hidden');
        albumImg.classList.add('hidden');
        btnAddAlbumToQueue.classList.add('hidden');
        albumName.classList.add('hidden');
    } else if (showORhide === "show" && elementName === "album") {
        albumShowId.classList.remove('hidden');
        albumImg.classList.remove('hidden');
        btnAddAlbumToQueue.classList.remove('hidden');
        albumName.classList.remove('hidden');
    } else if (showORhide === "hide" && elementName === "artist") {
        nextArtistPage.classList.add('hidden');
        previousArtistPage.classList.add('hidden');
        artistShowId.classList.add('hidden');
        artistImg.classList.add('hidden');
        btnAddArtistToQueue.classList.add('hidden');
        artistName.classList.add('hidden');
    } else if (showORhide === "show" && elementName === "artist") {
        artistShowId.classList.remove('hidden');
        artistImg.classList.remove('hidden');
        btnAddArtistToQueue.classList.remove('hidden');
        artistName.classList.remove('hidden');
    } else if (showORhide === "hide" && elementName === "search") {
        h2SearchResults.classList.add('hidden');
        nextPagePlaylist.classList.add('hidden');
        previousPagePlaylist.classList.add('hidden');
        nextPage.classList.add('hidden');
        previousPage.classList.add('hidden');
        previousPageAlbum.classList.add('hidden');
        nextPageAlbum.classList.add('hidden');
    } else if (showORhide === "show" && elementName === "search") {
        browseShowId.classList.remove('hidden');
    } else if (showORhide === "hide" && elementName === "searchAll") {
        browseShowId.classList.add('hidden');
    } else if (showORhide === "show" && elementName === "searchAll") {
        console.log("none");
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
    const wasQueueEmpty = playlistSongUrl.length === 0;
    playlistSongUrl.push(songURL);
    playlistSongImg.push(songIMG);
    playlistSongName.push(songNAME);
    playlistSongId.push(songID);
     // If the queue was empty before, play the first song automatically
     if (wasQueueEmpty && playlistSongUrl.length > 0) {
        currentIndexPlaylist = 0;
        loadTrack(currentIndexPlaylist); // Play the first song automatically
    }
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

async function addAlbumToQueue(albumID) {
    if (isAdding) return; // Prevent multiple calls
    isAdding = true;
    const wasQueueEmpty = playlistSongUrl.length === 0;
    const url = `https://saavn.dev/api/albums?id=${albumID}&page=0&limit=100`;

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

async function addArtistToQueue(artistID, page) {
    if (isAdding) return; // Prevent multiple calls
    isAdding = true;
    const wasQueueEmpty = playlistSongUrl.length === 0;
    const url = `https://saavn.dev/api/artists/${artistID}/songs?page=${page}&sortBy=popularity&sortOrder=desc`;

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

function searchForInitiator() {
    // Show the browse section
    showHide("show", "search");
    hideMenu();
    document.getElementById('searchBtn').addEventListener('click', async () => {
        searchQuery = document.getElementById('search').value;
        const searchFor = document.getElementById('searchFor').value;
        if (searchFor === "Songs") {
            page = 1;
            showHide("hide", "search");
            showHide("hide", "playlist");
            showHide("hide", "album");
            showHide("hide", "artist");
            addToTheQueue.classList.remove('hidden');
            searchForSongs();
        } else if (searchFor === "Playlists") {
            showHide("hide", "search");
            showHide("hide", "playlist");
            showHide("hide", "album");
            showHide("hide", "artist");
            addToTheQueue.classList.remove('hidden');
            page = 1;
            searchForPlaylists();
        } else if (searchFor === "Albums") {
            showHide("hide", "search");
            showHide("hide", "playlist");
            showHide("hide", "album");
            showHide("hide", "artist");
            addToTheQueue.classList.remove('hidden');
            page = 1;
            searchForAlbums();
        } else if (searchFor === "Artists") {
            showHide("hide", "search");
            showHide("hide", "playlist");
            showHide("hide", "album");
            showHide("hide", "artist");
            addToTheQueue.classList.add('hidden');
            page = 1;
            searchForArtists();
        } else {
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
    const url = `https://saavn.dev/api/search/playlists?query=${encodeURIComponent(playlistName)}&page=${page}&limit=20`;

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
    const url = `https://saavn.dev/api/search/albums?query=${encodeURIComponent(albumName)}&page=${page}&limit=20`;

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
    const url = `https://saavn.dev/api/search/artists?query=${encodeURIComponent(artistName)}&page=1&limit=40`;

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
    const url = `https://saavn.dev/api/search/songs?query=${encodeURIComponent(songName)}&page=${page}&limit=20`;

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
            const selectedQuality = document.getElementById('globalQualitySelect').value;
            const songPlayUrl = song.downloadUrl.find(url => url.quality === selectedQuality);

            const playSong = () => {
                console.log(song.id);
                playSongByID(song.id);
            };

            // Attach click event listener on the entire card
            songClone.addEventListener('click', playSong);


            // Get the "add to queue" button within the clone
            const addToQueueBtn = songClone.querySelector('.play-btn');

            // Attach click event listener for "add to queue" button
            addToQueueBtn.addEventListener('click', function (event) {
                event.stopPropagation(); // Prevent the playSong function from triggering
                console.log("addToTheQueue triggered for song: " + song.name);
                addSongToQueue(songPlayUrl.url, song.image[1].url, song.name, song.id);
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
    document.getElementById('btnAddArtistToQueue').disabled = false;
    if (checkartistId != artistId) {
        page = 1;
    }
    checkartistId = artistId;
    const nextArtistPageButton = document.getElementById('nextArtistPage');
    const previousArtistPageButton = document.getElementById('previousArtistPage');

    console.log("current page value is: " + artistPage);
    const url = `https://saavn.dev/api/artists/${artistId}/songs?page=${artistPage}&sortBy=popularity&sortOrder=desc`;
    const url2 = `https://saavn.dev/api/artists/${artistId}?songCount=1&page=1&albumCount=1`;

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
        document.getElementById('result').textContent = 'Error fetching data'; // Update to correct element
    }

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        showHide("hide", "playlist");
        showHide("hide", "album");
        showHide("show", "artist");
        showHide("hide", "search");
        showHide("hide", "searchAll");
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
            const selectedQuality = document.getElementById('globalQualitySelect').value;
            const songPlayUrl = song.downloadUrl.find(url => url.quality === selectedQuality);

            songClone.querySelector('.song-card').addEventListener('click', () => {
                playSongByID(song.id);
            });

            // Get the "add to queue" button within the clone
            const addToQueueBtn = songClone.querySelector('.play-btn');

            // Attach click event listener for "add to queue" button
            addToQueueBtn.addEventListener('click', function (event) {
                event.stopPropagation(); // Prevent the playSong function from triggering
                console.log("addToTheQueue triggered for song: " + song.name);
                addSongToQueue(songPlayUrl.url, song.image[1].url, song.name, song.id);
            });
            // Append the clone to the resultDiv
            resultDiv.appendChild(songClone);
        });
        document.getElementById('btnAddArtistToQueue').onclick = () => {
            document.getElementById('btnAddArtistToQueue').disabled = true;
            addArtistToQueue(artistId, artistPage); // Call the addPlaylistToQueue function
        };

    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        document.getElementById('result').textContent = 'Error fetching data'; // Update to correct element
    } finally {
        nextArtistPageButton.classList.remove('hidden');
        if (artistPage > 1) {
            previousArtistPageButton.classList.remove('hidden');
        } else {
            previousArtistPageButton.classList.add('hidden');
        };
        nextArtistPageButton.disabled = false;
        previousArtistPageButton.disabled = false;
    }
}

async function albumShow(albumId) {
    addToTheQueue.classList.remove('hidden');
    document.getElementById('btnAddAlbumToQueue').disabled = false;
    const url = `https://saavn.dev/api/albums?id=${albumId}`;

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
            const selectedQuality = document.getElementById('globalQualitySelect').value;
            const songPlayUrl = song.downloadUrl.find(url => url.quality === selectedQuality);

            const playSong = () => {
                console.log(song.id);
                playSongByID(song.id);
            };

            songClone.addEventListener('click', playSong);

            // Get the "add to queue" button within the clone
            const addToQueueBtn = songClone.querySelector('.play-btn');

            // Attach click event listener for "add to queue" button
            addToQueueBtn.addEventListener('click', function (event) {
                event.stopPropagation(); // Prevent the playSong function from triggering
                console.log("addToTheQueue triggered for song: " + song.name);
                addSongToQueue(songPlayUrl.url, song.image[1].url, song.name, song.id);
            });
            // Append the clone to the resultDiv
            resultDiv.appendChild(songClone);
        });
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
        showHide("show", "playlist");
        showHide("hide", "album");
        showHide("hide", "artist");
        showHide("hide", "search");
        showHide("hide", "searchAll");
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
            const selectedQuality = document.getElementById('globalQualitySelect').value;
            const songPlayUrl = song.downloadUrl.find(url => url.quality === selectedQuality);
            songClone.querySelector('.song-card').addEventListener('click', () => {
                playSongByID(song.id);
            });

            // Get the "add to queue" button within the clone
            const addToQueueBtn = songClone.querySelector('.play-btn');

            // Attach click event listener for "add to queue" button
            addToQueueBtn.addEventListener('click', function (event) {
                event.stopPropagation(); // Prevent the playSong function from triggering
                console.log("addToTheQueue triggered for song: " + song.name);
                addSongToQueue(songPlayUrl.url, song.image[1].url, song.name, song.id);
            });

            // Append the clone to the resultDiv
            resultDiv.appendChild(songClone);
        });

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
        })
        .catch(error => {
            console.error('Error playing audio:', error);
        });
    callMediaSession(imgUrl1, songName)
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

function showSongQueue() {
    const songQueuePopup = document.getElementById('songQueuePopup');
    const songQueueContainer = document.getElementById('songQueue');
    modal.classList.remove('hidden');
    body.classList.add('modal-open'); // Add modal-open class when modal is opened
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
            <button class="Dn-btn-queue">Dn</button>
            <button class="Up-btn-queue">Up</button>
        `;

        // Use querySelector within the songCard to select the current buttons
        const playBtnUp = songCard.querySelector(".Up-btn-queue");
        const playBtnDn = songCard.querySelector(".Dn-btn-queue");

        // Add event listeners for the buttons
        playBtnUp.addEventListener("click", function (event) {
            event.stopPropagation(); // Prevent the click from triggering the song card click event
            const clickedIndex = parseInt(songCard.dataset.index);
            reorderSongs(clickedIndex, clickedIndex - 1); // Move song up by one position
            console.log("Moved song up!");
        });

        playBtnDn.addEventListener("click", function (event) {
            event.stopPropagation(); // Prevent the click from triggering the song card click event
            const clickedIndex = parseInt(songCard.dataset.index);
            reorderSongs(clickedIndex, clickedIndex + 1); // Move song down by one position
            console.log("Moved song down!");
        });

        // Add event listener for playing the song when the card is clicked (but not on buttons)
        songCard.addEventListener('click', (event) => {
            const clickedIndex = event.currentTarget.dataset.index; // Use currentTarget to ensure the card itself is referenced
            currentIndexPlaylist = clickedIndex;
            playInPlayer(playlistSongName[clickedIndex], playlistSongUrl[clickedIndex], playlistSongImg[clickedIndex]);
        });

        // Handle drag events
        songCard.addEventListener('dragstart', dragStart);
        songCard.addEventListener('dragover', dragOver);
        songCard.addEventListener('drop', drop);
        songCard.addEventListener('dragend', dragEnd);
        songCard.addEventListener('dragleave', dragLeave);

        songQueueContainer.appendChild(songCard);
    });

    songQueuePopup.classList.remove('hidden'); // Show the popup
}
// Touch event handlers for mobile
let draggedIndex;
let targetIndex; // Variable to keep track of the target index


// Event listeners for showing and closing the popup
document.getElementById('currentSongName').addEventListener('click', showSongQueue);
document.getElementById('closePopup').addEventListener('click', () => {
    document.getElementById('songQueuePopup').classList.add('hidden');
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
        showSongQueue(); // Refresh the song queue
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

    showSongQueue(); // Refresh the queue display after reordering
}

document.getElementById('btnClearQueue').onclick = () => {
    playlistSongUrl = [];
    playlistSongImg = [];
    playlistSongName = [];
    playlistSongId = [];
    showSongQueue();
};

const modal = document.getElementById('songQueuePopup');
const body = document.body;

document.getElementById('closePopup').addEventListener('click', function () {
    modal.classList.add('hidden');
    body.classList.remove('modal-open'); // Remove modal-open class when modal is closed
});

// Close the modal when clicking outside of the modal content
window.addEventListener('click', function (event) {
    const modal = document.getElementById('songQueuePopup');
    if (event.target === modal) {
        modal.classList.add('hidden');
        body.classList.remove('modal-open');
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
