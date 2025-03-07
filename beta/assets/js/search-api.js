const songListImg = document.querySelector(".song-list");
const APIbaseURL = "http://saavn.dev/api/";
let page = 1;
let currentPageName = "default";
let currentPageCategory = "default";
const nextPageBtn = document.querySelector(".next-page");
const prevPageBtn = document.querySelector(".prev-page");


function hideAll() {
    document.querySelector(".song-list").style.display = "none";
    document.querySelector("#headingOptions").style.display = "none";
}
function show(querySelector) {
    document.querySelector(querySelector).style.display = "block";
}

async function searchSong(query, page) {
    hideAll();
    scrollToTop();
    if (!query) {
        alert(`Please enter a song's name`);
        return;
    }
    updateHistory("searchSongs", { type: "searchSongs", query, page }, `?query=${query}&page=${page}`);

    if (currentPageName !== "query") {
        page = 1;
        currentPageName = "query";
    }

    const url = `${APIbaseURL}search/songs?query=${encodeURIComponent(query)}&page=${page}&limit=20`;
    const resultDiv = document.querySelector(".song-card-container");
    const textHeading = document.querySelector(".card-list-header");
    textHeading.textContent = `Search: '${query}'`;
    resultDiv.innerHTML = '';

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();
        const results = data.data.results;

        results.forEach(item => {
            const songName = item.name;
            const songArtists = item.artists.primary.map(artist => artist.name).join(", ");
            const songId = item.id;
            const songUrls = item.downloadUrl?.map(urlObj => ({ quality: urlObj.quality, url: urlObj.url })) || [];
            const songImage = item.image.sort((a, b) => b.quality - a.quality)[2]?.url || "logo.png";

            const card = document.createElement("div");
            card.classList.add("container", "song-card");

            card.innerHTML = `
                <div class="song-card-cont1">
                    <img class="song-card-img" src="${songImage}" />
                    <div class="song-details">
                        <span class="song-card-name">${songName}</span>
                        <span class="song-card-artists">${songArtists}</span>
                        <span class="song-card-song-id hidden">${songId}</span>
                        ${songUrls.map(urlObj => `<span class="song-card-song-url" data-quality="${urlObj.quality}" hidden>${urlObj.url}</span>`).join("")}
                        <span class="song-card-song-imgHD hidden">${songImage}</span>
                    </div>
                </div>
                <div class="song-card-cont1">
                    <button class="btn btn-primary song-card-btn" type="button">
                        <i class="icon ion-android-add"></i>
                    </button>
                    <button class="btn btn-primary song-card-btn" type="button">
                        <i class="icon-options-vertical" style="font-size: 16px;"></i>
                    </button>
                </div>
            `;

            card.addEventListener("click", () => {
                const selectedQuality = document.querySelector(".universal-quality").value;
                const songURL = Array.from(card.querySelectorAll(".song-card-song-url"))
                    .find(el => el.getAttribute("data-quality") === selectedQuality)?.textContent || "";
                firstPlayAudio(songName, songURL, songImage, songArtists, songId);
            });

            resultDiv.appendChild(card);
        });

        nextPageBtn.addEventListener("click", () => {
            page++;
            searchSong(query, page);
        });
        prevPageBtn.addEventListener("click", () => {
            if (page > 1) {
                page--;
                searchSong(query, page);
            }
        });
    } catch (error) {
        console.error('Fetch error:', error);
        resultDiv.textContent = 'Error fetching data';
    }
}

async function search(query, category, page) {
    hideAll();
    scrollToTop();
    if (!query) {
        alert(`Please enter a ${category}'s name`);
        return;
    }
    updateHistory("search", { type: "search", query, category, page }, `?query=${query}&category=${category}&page=${page}`);
    if (currentPageName !== "query" && currentPageCategory !== category) {
        page = 1;
        currentPageName = "query";
        currentPageCategory = category;
    }

    const url = `${APIbaseURL}search/${category}?query=${encodeURIComponent(query)}&page=${page}&limit=20`;
    const resultDiv = document.querySelector(".song-card-container");
    const textHeading = document.querySelector(".card-list-header");
    textHeading.textContent = `Search: '${query}'`;
    resultDiv.innerHTML = '';

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();
        const results = data.data.results;

        results.forEach(item => {
            const songName = item.name;
            const songArtists = "";
            const songId = item.id;
            const songImage = item.image.sort((a, b) => b.quality - a.quality)[2]?.url || "logo.png";

            const card = document.createElement("div");
            card.classList.add("container", "song-card");

            card.innerHTML = `
                <div class="song-card-cont1">
                    <img class="song-card-img" src="${songImage}" />
                    <div class="song-details">
                        <span class="song-card-name">${songName}</span>
                        <span class="song-card-artists">${songArtists}</span>
                        <span class="song-card-song-id hidden">${songId}</span>
                        <span class="song-card-song-imgHD hidden">${songImage}</span>
                    </div>
                </div>
                <div class="song-card-cont1">
                    <button class="btn btn-primary song-card-btn" type="button">
                        <i class="icon ion-android-add"></i>
                    </button>
                    <button class="btn btn-primary song-card-btn" type="button">
                        <i class="icon-options-vertical" style="font-size: 16px;"></i>
                    </button>
                </div>
            `;

            card.addEventListener("click", () => {
                listSongs(category, songId, 1);
            });

            resultDiv.appendChild(card);
        });

        nextPageBtn.addEventListener("click", () => {
            page++;
            search(query, category, page);
        });
        prevPageBtn.addEventListener("click", () => {
            if (page > 1) {
                page--;
                search(query, category, page);
            }
        });
    } catch (error) {
        console.error('Fetch error:', error);
        resultDiv.textContent = 'Error fetching data';
    }
}

async function listSongs(category, id, page) {
    updateHistory("lists", { type: "lists", category, id, page }, `?category=${category}&id=${id}&page=${page}`);

    let url;
    scrollToTop();
    if (currentPageName !== "id" && currentPageCategory !== category) {
        page = 1;
        currentPageName = "id";
        currentPageCategory = category;
    }
    if (category === "artists") {
        url = `${APIbaseURL}${category}/${id}/songs?page=${page}&limit=10`;
    } else {
        url = `${APIbaseURL}${category}?id=${id}&page=0&limit=100`;
    }

    const resultDiv = document.querySelector(".song-card-container");
    const textHeading = document.querySelector(".card-list-header");
    const songListImg = document.getElementById("songList");

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();
        if (category !== "artists") {
            textHeading.textContent = data.data.name;
            songListImg.src = data.data.image[2].url;
        }

        const results = data.data.songs;
        if (category === "artists") {
            url = `${APIbaseURL}${category}?id=${id}&page=0&limit=1`;
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error('Network response was not ok');

                const data = await response.json();
                textHeading.textContent = data.data.name;
                songListImg.src = data.data.image[2].url;
            } catch (error) { };
        }
        // Wait until new data is fetched before clearing the old content
        const newContent = document.createDocumentFragment(); // Use fragment for better performance

        results.forEach(item => {
            const songName = item.name;
            const songArtists = item.artists.primary.map(artist => artist.name).join(", ");
            const songId = item.id;
            const songUrls = item.downloadUrl?.map(urlObj => ({ quality: urlObj.quality, url: urlObj.url })) || [];
            const songImage = item.image.find(img => img.quality === "500x500")?.url || "logo.png";

            const card = document.createElement("div");
            card.classList.add("container", "song-card");

            card.innerHTML = `
                <div class="song-card-cont1">
                    <img class="song-card-img" src="${songImage}" />
                    <div class="song-details">
                        <span class="song-card-name">${songName}</span>
                        <span class="song-card-artists">${songArtists}</span>
                        <span class="song-card-song-id hidden">${songId}</span>
                        ${songUrls.map(urlObj => `<span class="song-card-song-url" data-quality="${urlObj.quality}" hidden>${urlObj.url}</span>`).join("")}
                        <span class="song-card-song-imgHD hidden">${songImage}</span>
                    </div>
                </div>
                <div class="song-card-cont1">
                    <button class="btn btn-primary song-card-btn" type="button">
                        <i class="icon ion-android-add"></i>
                    </button>
                    <button class="btn btn-primary song-card-btn" type="button">
                        <i class="icon-options-vertical" style="font-size: 16px;"></i>
                    </button>
                </div>
            `;

            card.addEventListener("click", () => {
                const selectedQuality = document.querySelector(".universal-quality").value;
                const songURL = Array.from(card.querySelectorAll(".song-card-song-url"))
                    .find(el => el.getAttribute("data-quality") === selectedQuality)?.textContent || item.url;
                firstPlayAudio(songName, songURL, songImage, songArtists, songId);
            });

            newContent.appendChild(card);
        });

        // Now clear old content and replace it with the new content
        resultDiv.innerHTML = '';
        resultDiv.appendChild(newContent);

        hideAll();
        document.querySelector(".song-list").style.display = "flex";

        nextPageBtn.addEventListener("click", async () => {
            page++;
            await listSongs(category, id, page);
        });
        prevPageBtn.addEventListener("click", async () => {
            if (page > 1) {
                page--;
                await listSongs(category, id, page);
            }
        });

        const btnAddListToQueue = document.querySelector('.add-list-to-queue');
        btnAddListToQueue.onclick = () => {
            clearQueue();
            btnAddListToQueue.disabled = true;
            results.forEach(song => {
                const selectedQuality = document.querySelector(".universal-quality").value;
                const songPlayUrl = song.downloadUrl ? song.downloadUrl.find(url => url.quality === selectedQuality)?.url : null;
                addSongToQueue(songPlayUrl, song.image[2].url, song.name, song.id, song.artists.primary.map(artist => artist.name).join(', '));
            });
            btnAddListToQueue.disabled = false;
        };

        show("#headingOptions");

    } catch (error) {
        console.error('Fetch error:', error);
        resultDiv.textContent = 'Error fetching data';
    }
}





// Function to get URL parameter by name
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Get the 'search' parameter value from the URL
const query = getUrlParameter('s');
const query2 = getUrlParameter('all');

// If 'search' parameter exists, call the search function with the query
if (query) {
    searchSong(query, "1");
} else if (query2) {
    search(query2, "albums", "1");
} else {
    listSongs("artists", "459320", "1");
}




window.onpopstate = function (event) {
    if (!event.state) return;

    console.log("Navigating back:", event.state);

    const { type, query, category, id, page } = event.state;

    if (type === "searchSongs") {
        searchSongs(query, page);
    } else if (type === "search") {
        search(query, category, page);
    } else if (type === "lists") {
        listSongs(category, id, page);
    }
};

function updateHistory(type, params, url) {
    const currentState = history.state;
    if (currentState && JSON.stringify(currentState) === JSON.stringify(params)) {
        return; // Prevents adding duplicate history states
    }
    history.pushState(params, "", url);
}
