let modules = [];

async function home() {
    history.pushState({ type: "home" }, "", "?type=home");
    if (modules.length === 0) {
        loader("show");
        const apiUrl = "https://home-omega-one.vercel.app/api/jiosaavn";
        // const apiUrl = "http://192.168.1.4:3000/api/jiosaavn";
        try {
            const response = await fetch(apiUrl);
            const data = await response.json();
            console.log(data);

            // Display songs and playlists
            getModules(data);
            if (isModulePresent("new_trending")) {
                loadTrending(data.new_trending);
            } else {
                document.getElementById("trendingSpan").style.display = "none";
            }
            if (isModulePresent("top_playlists")) {
                displayPlaylists(data.top_playlists);
            } else {
                document.getElementById("playlistsSpan").style.display = "none";
            }
            if (isModulePresent("new_albums")) {
                loadNewAlbums(data.new_albums);
            } else {
                document.getElementById("albumsSpan").style.display = "none";
            }
            if (isModulePresent("charts")) {
                loadTopCharts(data.charts);
            } else {
                document.getElementById("topChartsSpan").style.display = "none";
            }
            if (isModulePresent("artist_recos")) {
                loadArtists(data.artist_recos);
            } else {
                document.getElementById("artistsSpan").style.display = "none";

            }

            // loadNewAlbums(data.new_albums);
            // loadTopCharts(data.charts);

        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }
    hideAll();
    show("#home");
    loader("hide");
}

function getModules(data) {
    modules = Object.keys(data);
}
function isModulePresent(moduleName) {
    return modules.includes(moduleName);
}

function loadTrending(response) {
    const trendingContainer = document.getElementById("trending");
    if (!trendingContainer) return; // Avoid errors if the element is missing

    trendingContainer.innerHTML = "";

    Object.values(response).forEach(song => {
        const songCard = document.createElement("div");
        songCard.classList.add("card");
        songCard.innerHTML = `
                <div class="image-container">
                    <img src="${song.image}" alt="${song.title}">
                    <div class="play-button">▶</div>
                </div>
                <h3 class="card-title">${song.title}</h3>
            `;

        // Fix: Access `song.type` instead of `response.type`
        if (song.type === "playlist" || song.type === "album") {
            const id = song.id;
            let category = "";

            if (song.type === "playlist") {
                category = "playlists";
            } else if (song.type === "album") {
                category = "albums";
            }

            if (category) {
                songCard.addEventListener("click", () => {
                    listSongs(category, id, "1");
                });
            }
        } else if (song.type === "song") {
            songCard.addEventListener("click", () => {
                const selectedQuality = getSelectedQuality();
                const mediaUrl = getMediaLink(song.more_info.encrypted_media_url, selectedQuality)
                const songArtists = song.more_info.artistMap.primary_artists.map(artist => artist.name).join(", ");
                firstPlayAudio(song.title, mediaUrl, song.image, songArtists, song.id);
                console.log(mediaUrl);

            });
        }

        trendingContainer.appendChild(songCard);
    });
}


function displayPlaylists(playlists) {
    const playlistContainer = document.getElementById("playlists");
    if (!playlistContainer) return;

    playlistContainer.innerHTML = "";

    Object.values(playlists).forEach(playlist => {
        const playlistCard = document.createElement("div");
        playlistCard.classList.add("card");
        playlistCard.innerHTML = `
                <div class="image-container">
                    <img src="${playlist.image}" alt="${playlist.title}">
                    <div class="play-button">▶</div>
                </div>
                <h3 class="card-title">${playlist.title}</h3>
                <p class="card-subtitle">${playlist.subtitle}</p>
            `;

        // Add click event to the card
        playlistCard.addEventListener("click", () => {
            listSongs("playlists", playlist.id, "1");
        });

        playlistContainer.appendChild(playlistCard);
    });
}

function loadNewAlbums(albums) {
    const albumsContainer = document.getElementById("albums");
    if (!albumsContainer) return;

    albumsContainer.innerHTML = "";

    Object.values(albums).forEach(album => {
        const albumsCard = document.createElement("div");
        albumsCard.classList.add("card");
        albumsCard.innerHTML = `
                <div class="image-container">
                    <img src="${album.image}" alt="${album.title}">
                    <div class="play-button">▶</div>
                </div>
                <h3 class="card-title">${album.title}</h3>
                <p class="card-subtitle">${album.subtitle}</p>
            `;

        if (album.type === "playlist" || album.type === "album") {
            const id = album.id;
            let category = "";

            if (album.type === "playlist") {
                category = "playlists";
            } else if (album.type === "album") {
                category = "albums";
            }

            if (category) {
                albumsCard.addEventListener("click", () => {
                    listSongs(category, id, "1");
                });
            }
        } else if (album.type === "song") {
            albumsCard.addEventListener("click", () => {
                const selectedQuality = getSelectedQuality();
                const mediaUrl = getMediaLink(album.more_info.encrypted_media_url, selectedQuality);

                // Ensure artistMap and primary_artists exist
                const songArtists = album.more_info.artistMap?.primary_artists
                    ? album.more_info.artistMap.primary_artists.map(artist => artist.name).join(", ")
                    : "Unknown Artist";

                firstPlayAudio(album.title, mediaUrl, album.image, songArtists, album.id);
                console.log(mediaUrl);
            });
        }

        albumsContainer.appendChild(albumsCard);
    });
}
function loadTopCharts(playlists) {
    const chartsContainer = document.getElementById("topCharts");
    if (!chartsContainer) return;

    chartsContainer.innerHTML = "";

    Object.values(playlists).forEach(playlist => {
        const playlistCard = document.createElement("div");
        playlistCard.classList.add("card");
        playlistCard.innerHTML = `
                <div class="image-container">
                    <img src="${playlist.image}" alt="${playlist.title}">
                    <div class="play-button">▶</div>
                </div>
                <h3 class="card-title">${playlist.title}</h3>
            `;

        // Add click event to the card
        playlistCard.addEventListener("click", () => {
            listSongs("playlists", playlist.id, "1");
        });

        chartsContainer.appendChild(playlistCard);
    });
}
function loadArtists(artists) {
    const artistsContainer = document.getElementById("artists");
    if (!artistsContainer) return;

    artistsContainer.innerHTML = "";

    Object.values(artists).forEach(artists => {
        const artistsCard = document.createElement("div");
        artistsCard.classList.add("card");
        artistsCard.innerHTML = `
                <div class="image-container">
                    <img src="${artists.image}" alt="${artists.title}">
                    <div class="play-button">▶</div>
                </div>
                <h3 class="card-title">${artists.title}</h3>
                <p class="card-subtitle">${artists.subtitle}</p>
            `;

        // Add click event to the card
        artistsCard.addEventListener("click", () => {
            listSongs("artists", artists.id, "1");
        });

        artistsContainer.appendChild(artistsCard);
    });
}


