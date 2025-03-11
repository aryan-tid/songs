const songListImg = document.querySelector(".song-list");
// const APIbaseURL = "http://192.168.1.4:3000/api/";
// const APIbaseURL2 = "http://192.168.1.4:3000/api/";
const APIbaseURL2 = "https://home-omega-one.vercel.app/api/";
// const APIbaseURL = "https://saavn.dev/api/";
const APIbaseURL = "https://vercel-jiosaavn.vercel.app/api/";
let page = 1;
let currentPageName = "default";
let currentPage;
let currentPageCategory = "default";
function getSelectedQuality() {
    const selectedOption = document.querySelector(".custom-dropdown .selected");
    return selectedOption ? selectedOption.getAttribute("data-value") : null;
}

function getq() {
    console.log(getSelectedQuality());
}

function hideAll() {
    document.querySelector(".song-list").style.display = "none";
    document.querySelector("#headingOptions").style.display = "none";
    document.querySelector(".search-container").style.display = "none";
    document.querySelector(".main-content").style.display = "none";
    document.querySelector(".settings").style.display = "none";
    document.querySelector(".home").style.display = "none";
    document.querySelector(".popup-overlay").classList.add("hidden");
}
function show(querySelector) {
    document.querySelector(querySelector).style.removeProperty("display");
}
function hide(querySelector) {
    document.querySelector(querySelector).style.display = "none";
}


async function showBrowse() {
    const target = document.querySelector('.search-container');
    target.style.display ? target.style.removeProperty('display') : target.style.setProperty('display', 'none');
}


function pause(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}


document.addEventListener("DOMContentLoaded", () => {
    let selectedCategory = "songs"; // Default category

    // Handle tab switching
    document.querySelectorAll(".tab-btn").forEach(button => {
        button.addEventListener("click", () => {
            document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active-tab"));
            button.classList.add("active-tab");
            selectedCategory = button.dataset.category;
            document.querySelector(".search-box").placeholder = `Search for ${selectedCategory}...`;
        });
    });

    // Handle search form submission
    document.querySelector(".search-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const query = document.getElementById("search-box").value.trim();
        if (!query) return alert("Please enter a search term");

        // Redirect or call function based on selected category
        if (selectedCategory === "songs") {
            searchSong(query, 1); // Call your search function
        } else {
            search(query, selectedCategory, 1); // Call your search function
        }
    });
});


async function searchSong(query, page) {
    loader("show");
    hideAll();
    show(".song-card-list");
    show(".main-content");
    show(".search-container");
    scrollToTop();
    if (!query) {
        alert(`Please enter a song's name`);
        return;
    }
    updateHistory("searchSongs", { type: "searchSongs", query, page }, `?query=${query}&page=${page}`);
    console.log("history state", history.state);
    if (fromUrlParam) {
        fromUrlParam = false;
        currentPage = page;
    } else if (currentPageName !== "query") {
        page = 1;
        currentPageName = "query";
        currentPage = page;
    } else {
        currentPage = page;
    }

    const url = `${APIbaseURL}search/songs?query=${encodeURIComponent(query)}&page=${page}&limit=20`;
    const resultDiv = document.querySelector(".song-card-container");
    const textHeading = document.querySelector(".card-list-header");
    textHeading.textContent = `Search: '${query}'`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();
        const results = data.data.results;

        let newContent = ''; // Store new HTML content

        results.forEach(item => {
            const songName = item.name;
            const songArtists = item.artists.primary.map(artist => artist.name).join(", ");
            const songId = item.id;
            const songUrls = item.downloadUrl?.map(urlObj => ({ quality: urlObj.quality, url: urlObj.url })) || [];
            const songImage = item.image.sort((a, b) => b.quality - a.quality)[2]?.url || "logo.png";

            newContent += `
                <div class="container song-card">
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
                        <button class="btn btn-primary song-card-btn song-card-btn-queue" type="button">
                            <i class="icon ion-android-add"></i>
                        </button>
                        <button class="btn btn-primary song-card-btn-menu" type="button">
                        <i class="icon-options-vertical" style="font-size: 16px;"></i>
                    </button>

                        <!-- Dropdown menu structure (initially hidden) -->
                        <div class="dropdown-menu" style="display: none;">
                            <div class="dropdown-menu-item" data-action="download">
                                <i class="la la-cloud-download"></i>
                                <span>Download</span>
                            </div>
                            <div class="dropdown-menu-item" style="display: none; data-action="add-playlist">
                                <i class="icon ion-android-list"></i>
                                <span>Add to Playlist</span>
                            </div>
                            <div class="dropdown-menu-item" style="display: none; data-action="share">
                                <i class="icon ion-android-share-alt"></i>
                                <span>Share</span>
                            </div>
                            <div class="dropdown-menu-item" style="display: none; data-action="info">
                                <i class="icon ion-information-circled"></i>
                                <span>Song Info</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        // Only update innerHTML after all data is processed
        resultDiv.innerHTML = newContent;

        // Add event listeners after content is updated
        document.querySelectorAll(".song-card").forEach(card => {
            // Play song when clicking on card (but NOT the button)
            card.addEventListener("click", () => {
                const songName = card.querySelector(".song-card-name").textContent;
                const selectedQuality = getSelectedQuality();
                const songURL = Array.from(card.querySelectorAll(".song-card-song-url"))
                    .find(el => el.getAttribute("data-quality") === selectedQuality)?.textContent || "";
                const songImage = card.querySelector(".song-card-img").src;
                const songArtists = card.querySelector(".song-card-artists").textContent;
                const songId = card.querySelector(".song-card-song-id").textContent;
                firstPlayAudio(songName, songURL, songImage, songArtists, songId);
            });
            const addSongToQueueBtn = card.querySelector(".song-card-btn-queue");

            if (addSongToQueueBtn) { // Ensure button exists before adding event listener
                addSongToQueueBtn.addEventListener("click", (event) => {
                    event.stopPropagation(); // Stop the event from bubbling up to the card click event

                    const selectedQuality = getSelectedQuality();
                    const songURL = Array.from(card.querySelectorAll(".song-card-song-url"))
                        .find(el => el.getAttribute("data-quality") === selectedQuality)?.textContent || "";
                    const songImage = card.querySelector(".song-card-img").src;
                    const songName = card.querySelector(".song-card-name").textContent;
                    const songId = card.querySelector(".song-card-song-id").textContent;
                    const songArtists = card.querySelector(".song-card-artists").textContent;

                    addSongToQueue(songURL, songImage, songName, songId, songArtists);
                });
            }
            // Get the menu button in this card
            const songName = card.querySelector(".song-card-name").textContent;
            const selectedQuality = getSelectedQuality();
            const songURL = Array.from(card.querySelectorAll(".song-card-song-url"))
                .find(el => el.getAttribute("data-quality") === selectedQuality)?.textContent || "";
            const songImage = card.querySelector(".song-card-img").src;
            const songArtists = card.querySelector(".song-card-artists").textContent;
            const songId = card.querySelector(".song-card-song-id").textContent;
            const menuBtn = card.querySelector(".song-card-btn-menu");
            if (menuBtn) {

                // Find the dropdown that's a sibling of this button
                const dropdown = menuBtn.nextElementSibling;

                if (dropdown && dropdown.classList.contains("dropdown-menu")) {
                    // Toggle dropdown on button click
                    menuBtn.addEventListener("click", (event) => {
                        event.stopPropagation(); // Prevent card click

                        // Hide all other dropdowns
                        document.querySelectorAll('.dropdown-menu').forEach(menu => {
                            if (menu !== dropdown) {
                                menu.style.display = 'none';
                            }
                        });

                        // Toggle current dropdown
                        const isVisible = dropdown.style.display === 'block';
                        dropdown.style.display = isVisible ? 'none' : 'block';

                        if (!isVisible) {
                            // Position the dropdown
                            const buttonRect = menuBtn.getBoundingClientRect();
                            dropdown.style.position = 'absolute';
                            dropdown.style.top = `${buttonRect.bottom + window.scrollY + 5}px`;
                            dropdown.style.left = `${buttonRect.left + window.scrollX - 120}px`;
                        }
                    });

                    // Add click handlers for dropdown items
                    dropdown.querySelectorAll('.dropdown-menu-item').forEach(item => {
                        item.addEventListener("click", (event) => {
                            event.stopPropagation(); // Prevent event bubbling
                            const action = item.getAttribute('data-action');

                            // Handle different actions
                            switch (action) {
                                case 'download':
                                    event.stopPropagation(); // Stop the event from bubbling up to the card click event

                                    const selectedQuality = getSelectedQuality();
                                    const songURL = Array.from(card.querySelectorAll(".song-card-song-url"))
                                        .find(el => el.getAttribute("data-quality") === selectedQuality)?.textContent || item.url;

                                    downloadSong(songId, songName, songArtists, songURL, songImage);
                                    break;
                                case 'add-playlist':
                                    console.log(`Add to playlist: ${songName}`);
                                    // Add to playlist logic here
                                    break;
                                case 'share':
                                    console.log(`Share song: ${songName}`);
                                    // Share logic
                                    if (navigator.share) {
                                        navigator.share({
                                            title: songName,
                                            text: `Check out ${songName} by ${songArtists}`,
                                            url: `${window.location.origin}`
                                        }).catch(err => console.error('Share failed:', err));
                                    } else {
                                        // Fallback - copy to clipboard
                                        const shareUrl = `${window.location.origin}`;
                                        navigator.clipboard.writeText(shareUrl)
                                            .then(() => alert('Link copied to clipboard!'))
                                            .catch(err => console.error('Failed to copy:', err));
                                    }
                                    break;
                                case 'info':
                                    console.log(`Info for: ${songName}`);
                                    // Show info logic
                                    break;
                            }

                            dropdown.style.display = 'none';
                        });
                    });
                }
            }

        });
        // Create the container div
        const navButtons = document.createElement("div");
        navButtons.classList.add("next-prev-btn");

        // Create the Previous Page button
        const prevButton = document.createElement("button");
        prevButton.classList.add("btn", "prev-page");
        prevButton.type = "button";
        prevButton.style.fontSize = "14px";
        prevButton.textContent = "Previous Page";

        // Create the Next Page button
        const nextButton = document.createElement("button");
        nextButton.classList.add("btn", "next-page");
        nextButton.type = "button";
        nextButton.style.fontSize = "14px";
        nextButton.textContent = "Next Page";

        // Append buttons to the container div
        navButtons.appendChild(prevButton);
        navButtons.appendChild(nextButton);

        // Append the div inside .main-content
        const mainContent = document.querySelector(".page-buttons");
        if (mainContent) {
            mainContent.innerHTML = '';
        }
        if (mainContent) {
            mainContent.appendChild(navButtons);
        } else {
            console.error("Element with class .main-content not found.");
        }

        const nextPageBtn = document.querySelector(".next-page");
        const prevPageBtn = document.querySelector(".prev-page");

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
    loader("hide");
}


async function search(query, category, page) {
    loader("show");
    hideAll();
    show(".song-card-list");
    show(".main-content");
    show(".search-container");
    scrollToTop();

    if (!query) {
        alert(`Please enter a ${category}'s name`);
        return;
    }

    updateHistory("search", { type: "search", query, category, page }, `?query=${query}&category=${category}&page=${page}`);
    console.log("history state", history.state);

    if (fromUrlParam) {
        fromUrlParam = false;
        currentPage = page;
    } else if (currentPageName !== "query" && currentPageCategory !== category) {
        page = 1;
        currentPageName = "query";
        currentPageCategory = category;
        currentPage = page;
    } else {
        currentPage = page;
    }

    const url = `${APIbaseURL}search/${category}?query=${encodeURIComponent(query)}&page=${page}&limit=20`;
    const resultDiv = document.querySelector(".song-card-container");
    const textHeading = document.querySelector(".card-list-header");

    textHeading.textContent = `Search: '${query}'`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();
        const results = data.data.results;

        // ✅ Now clear the existing content AFTER data is successfully fetched
        resultDiv.innerHTML = '';

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
                    <button class="btn btn-primary song-card-btn-queue hidden" type="button">
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

        // ✅ Clear and append pagination buttons only after data is loaded
        const mainContent = document.querySelector(".page-buttons");
        if (mainContent) {
            mainContent.innerHTML = ''; // Clear existing buttons
        }

        // Create and append pagination buttons
        const navButtons = document.createElement("div");
        navButtons.classList.add("next-prev-btn");

        const prevButton = document.createElement("button");
        prevButton.classList.add("btn", "prev-page");
        prevButton.type = "button";
        prevButton.style.fontSize = "14px";
        prevButton.textContent = "Previous Page";

        const nextButton = document.createElement("button");
        nextButton.classList.add("btn", "next-page");
        nextButton.type = "button";
        nextButton.style.fontSize = "14px";
        nextButton.textContent = "Next Page";

        navButtons.appendChild(prevButton);
        navButtons.appendChild(nextButton);

        if (mainContent) {
            mainContent.appendChild(navButtons);
        } else {
            console.error("Element with class .page-buttons not found.");
        }

        // ✅ Pagination event listeners
        const nextPageBtn = document.querySelector(".next-page");
        const prevPageBtn = document.querySelector(".prev-page");

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
    loader("hide");
}

async function listSongs(category, id, page) {
    loader("show");
    updateHistory("lists", { type: "lists", category, id, page }, `?category=${category}&id=${id}&page=${page}`);
    console.log("history state", history.state);


    let url;

    scrollToTop();
    if (fromUrlParam) {
        fromUrlParam = false;
        currentPageName = "id";
        currentPageCategory = category;
        currentPage = page;
        console.log("fromUrlParam", currentPage);
    } else if (currentPageName !== "id" && currentPageCategory !== category) {
        page = 1;
        currentPageName = "id";
        currentPageCategory = category;
        currentPage = page;
        console.log("currentPageName !== id", currentPage);
    } else {
        currentPage = page;
        console.log("currentPage", currentPage);
    }
    console.log(page, currentPage);

    if (category === "artists") {
        url = `${APIbaseURL}${category}/${id}/songs?page=${page}&limit=10`;
    } else {
        url = `${APIbaseURL}${category}?id=${id}&page=0&limit=500`;
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
        let lang;

        results.forEach(item => {
            const songName = item.name;
            lang = item.language;
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
                    <button class="btn btn-primary song-card-btn-queue song-card-btn" type="button">
                        <i class="icon ion-android-add"></i>
                    </button>
                    <button class="btn btn-primary song-card-btn-menu" type="button">
                        <i class="icon-options-vertical" style="font-size: 16px;"></i>
                    </button>

                    <!-- Dropdown menu structure (initially hidden) -->
                    <div class="dropdown-menu" style="display: none;">
                        <div class="dropdown-menu-item" data-action="download">
                            <i class="la la-cloud-download"></i>
                            <span>Download</span>
                        </div>
                        <div class="dropdown-menu-item" style="display: none; data-action="add-playlist">
                            <i class="icon ion-android-list"></i>
                            <span>Add to Playlist</span>
                        </div>
                        <div class="dropdown-menu-item" style="display: none; data-action="share">
                            <i class="icon ion-android-share-alt"></i>
                            <span>Share</span>
                        </div>
                        <div class="dropdown-menu-item" style="display: none; data-action="info">
                            <i class="icon ion-information-circled"></i>
                            <span>Song Info</span>
                        </div>
                    </div>
                </div>
            `;

            card.addEventListener("click", () => {
                const selectedQuality = getSelectedQuality();
                const songURL = Array.from(card.querySelectorAll(".song-card-song-url"))
                    .find(el => el.getAttribute("data-quality") === selectedQuality)?.textContent || item.url;
                firstPlayAudio(songName, songURL, songImage, songArtists, songId);
            });
            const addSongToQueueBtn = card.querySelector(".song-card-btn-queue");
            if (addSongToQueueBtn) { // Ensure button exists before adding event listener
                addSongToQueueBtn.addEventListener("click", (event) => {
                    event.stopPropagation(); // Stop the event from bubbling up to the card click event

                    const selectedQuality = getSelectedQuality();
                    const songURL = Array.from(card.querySelectorAll(".song-card-song-url"))
                        .find(el => el.getAttribute("data-quality") === selectedQuality)?.textContent || item.url;

                    addSongToQueue(songURL, songImage, songName, songId, songArtists);
                });
            }
            // Get the menu button in this card
            const menuBtn = card.querySelector(".song-card-btn-menu");
            if (menuBtn) {
                // Find the dropdown that's a sibling of this button
                const dropdown = menuBtn.nextElementSibling;

                if (dropdown && dropdown.classList.contains("dropdown-menu")) {
                    // Toggle dropdown on button click
                    menuBtn.addEventListener("click", (event) => {
                        event.stopPropagation(); // Prevent card click

                        // Hide all other dropdowns
                        document.querySelectorAll('.dropdown-menu').forEach(menu => {
                            if (menu !== dropdown) {
                                menu.style.display = 'none';
                            }
                        });

                        // Toggle current dropdown
                        const isVisible = dropdown.style.display === 'block';
                        dropdown.style.display = isVisible ? 'none' : 'block';

                        if (!isVisible) {
                            // Position the dropdown
                            const buttonRect = menuBtn.getBoundingClientRect();
                            dropdown.style.position = 'absolute';
                            dropdown.style.top = `${buttonRect.bottom + window.scrollY + 5}px`;
                            dropdown.style.left = `${buttonRect.left + window.scrollX - 120}px`;
                        }
                    });

                    // Add click handlers for dropdown items
                    dropdown.querySelectorAll('.dropdown-menu-item').forEach(item => {
                        item.addEventListener("click", (event) => {
                            event.stopPropagation(); // Prevent event bubbling
                            const action = item.getAttribute('data-action');

                            // Handle different actions
                            switch (action) {
                                case 'download':
                                    event.stopPropagation(); // Stop the event from bubbling up to the card click event

                                    const selectedQuality = getSelectedQuality();
                                    const songURL = Array.from(card.querySelectorAll(".song-card-song-url"))
                                        .find(el => el.getAttribute("data-quality") === selectedQuality)?.textContent || item.url;

                                    downloadSong(songId, songName, songArtists, songURL, songImage);
                                    break;
                                case 'add-playlist':
                                    console.log(`Add to playlist: ${songName}`);
                                    // Add to playlist logic here
                                    break;
                                case 'share':
                                    console.log(`Share song: ${songName}`);
                                    // Share logic
                                    if (navigator.share) {
                                        navigator.share({
                                            title: songName,
                                            text: `Check out ${songName} by ${songArtists}`,
                                            url: `${window.location.origin}`
                                        }).catch(err => console.error('Share failed:', err));
                                    } else {
                                        // Fallback - copy to clipboard
                                        const shareUrl = `${window.location.origin}`;
                                        navigator.clipboard.writeText(shareUrl)
                                            .then(() => alert('Link copied to clipboard!'))
                                            .catch(err => console.error('Failed to copy:', err));
                                    }
                                    break;
                                case 'info':
                                    console.log(`Info for: ${songName}`);
                                    // Show info logic
                                    break;
                            }

                            dropdown.style.display = 'none';
                        });
                    });
                }
            }


            newContent.appendChild(card);
        });
        hideAll();
        show("#headingOptions");
        show(".main-content");
        show(".song-card-list");
        if (lang == "english") {
            console.log("english");
        } else {
            showTrending();
            showRelated(category, id, lang);
        }

        async function showRelated(category, id, lang) {
            if (category === "artists") {
                return;
            } else if (category === "albums") {
                category = "album";
            } else if (category === "playlists") {
                category = "playlist";
            }

            const apiUrl = `${APIbaseURL2}related?lang=${lang}&id=${id}&category=${category}`;
            try {
                const response = await fetch(apiUrl);
                const data = await response.json();
                console.log(data);

                // Display songs and playlists
                const trendingContainer = document.getElementById("related");
                if (!trendingContainer) return; // Avoid errors if the element is missing
                show("#relatedSpan");

                trendingContainer.innerHTML = "";

                Object.values(data).forEach(song => {
                    const songCard = document.createElement("div");
                    songCard.classList.add("card");
                    songCard.innerHTML = `
                            <div class="image-container">
                                <img src="${song.image}" alt="${song.title}">
                                <div class="play-button">▶</div>
                            </div>
                            <h3 class="card-title">${song.title}</h3>
                            <p class="card-subtitle">${song.subtitle}</p>
                        `;

                    // Fix: Access `song.type` instead of `response.type`
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


                // loadNewAlbums(data.new_albums);
                // loadTopCharts(data.charts);

            } catch (error) {
                console.error("Error fetching data:", error);
            }
        }

        async function showTrending() {
            const apiUrl = `${APIbaseURL2}trending?lang=${lang}`;
            try {
                const response = await fetch(apiUrl);
                const data = await response.json();
                console.log(data);

                // Display songs and playlists
                const trendingContainer = document.getElementById("trendingData");
                if (!trendingContainer) return; // Avoid errors if the element is missing
                show("#trendingDataSpan");

                trendingContainer.innerHTML = "";

                Object.values(data).forEach(song => {
                    const songCard = document.createElement("div");
                    songCard.classList.add("card");
                    songCard.innerHTML = `
                            <div class="image-container">
                                <img src="${song.image}" alt="${song.title}">
                                <div class="play-button">▶</div>
                            </div>
                            <h3 class="card-title">${song.title}</h3>
                            <p class="card-subtitle">${song.subtitle}</p>
                        `;

                    // Fix: Access `song.type` instead of `response.type`
                    songCard.addEventListener("click", () => {
                        const selectedQuality = getSelectedQuality();
                        const mediaUrl = getMediaLink(song.more_info.encrypted_media_url, selectedQuality)
                        const songArtists = song.more_info.artistMap.primary_artists.map(artist => artist.name).join(", ");
                        firstPlayAudio(song.title, mediaUrl, song.image, songArtists, song.id);
                        console.log(mediaUrl);

                    });


                    trendingContainer.appendChild(songCard);
                });


                // loadNewAlbums(data.new_albums);
                // loadTopCharts(data.charts);

            } catch (error) {
                console.error("Error fetching data:", error);
            }
        }

        // Now clear old content and replace it with the new content
        resultDiv.innerHTML = '';
        resultDiv.appendChild(newContent);
        document.querySelector(".song-list").style.display = "flex";

        // Only create and append the navigation buttons if category is "artists"
        if (category === "artists") {
            // Create the container div
            const navButtons = document.createElement("div");
            navButtons.classList.add("next-prev-btn");

            // Create the Previous Page button
            const prevButton = document.createElement("button");
            prevButton.classList.add("btn", "prev-page");
            prevButton.type = "button";
            prevButton.style.fontSize = "14px";
            prevButton.textContent = "Previous Page";

            // Create the Next Page button
            const nextButton = document.createElement("button");
            nextButton.classList.add("btn", "next-page");
            nextButton.type = "button";
            nextButton.style.fontSize = "14px";
            nextButton.textContent = "Next Page";

            // Append buttons to the container div
            navButtons.appendChild(prevButton);
            navButtons.appendChild(nextButton);

            // Append the div inside .page-buttons
            const mainContent = document.querySelector(".page-buttons");
            if (mainContent) {
                mainContent.innerHTML = '';
                mainContent.appendChild(navButtons);

                // Now that we've added the buttons, set up their event listeners
                const nextPageBtn = document.querySelector(".next-page");
                const prevPageBtn = document.querySelector(".prev-page");

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
            } else {
                console.error("Element with class .page-buttons not found.");
            }
            const nextPageBtn = document.querySelector(".next-page");
            const prevPageBtn = document.querySelector(".prev-page");
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
        } else {
            // For albums and playlists, clear the page buttons area
            const mainContent = document.querySelector(".page-buttons");
            if (mainContent) {
                mainContent.innerHTML = '';
            }
        }


        const btnAddListToQueue = document.querySelector('.add-list-to-queue');
        btnAddListToQueue.onclick = () => {
            clearQueue();
            btnAddListToQueue.disabled = true;
            results.forEach(song => {
                const selectedQuality = getSelectedQuality();
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
    loader("hide");
    setupOutsideClickListener();

}

// Function to get URL parameter by name
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Get URL parameters
const categoryParam = getUrlParameter('category');
const idParam = getUrlParameter('id');
const pageParam = getUrlParameter('page');
const queryParam = getUrlParameter('query');
const downloadsParam = getUrlParameter('downloads');

// Convert pageParam to a number and use 1 as default if missing or invalid
const pageP = pageParam ? parseInt(pageParam, 10) || 1 : 1;
let fromUrlParam = false;

let allowUrlParameters = true; // Allow URL parameters to be used for once only
urlParameterDataLoad();
function urlParameterDataLoad(type) {
    if (navigator.onLine) {
        if (type === "default") {
            home();
        } else if (allowUrlParameters) {
            allowUrlParameters = false; // Prevent further use of URL parameters
            // Check conditions and execute functions accordingly
            if (categoryParam && idParam) {
                fromUrlParam = true;
                listSongs(categoryParam, idParam, pageP);
            } else if (queryParam && categoryParam) {
                fromUrlParam = true;
                search(queryParam, categoryParam, pageP);
            } else if (queryParam) {
                fromUrlParam = true;
                searchSong(queryParam, pageP);
            } else if (downloadsParam) {
                if (downloadsParam === "songs") {
                    getAllDownloadedSongs();
                    console.log("Getting all downloaded songs");
                } else {
                    home();
                    console.log("Invalid downloads parameter");
                }
            } else {
                home();
            }
        }
    }
}

// Handle back button correctly
window.onpopstate = function (event) {
    console.log("Navigating back:", event.state);

    if (event.state?.type === "previousState") {
        // This means we need to go back once more to reach "hidePlayer"
        history.back(); // Automatically go back again
        console.log("Going back again");
    } else if (event.state?.type === "hidePlayer") {
        // Hide the player when we reach hidePlayer state
        audioPlayer1.classList.add("hidden");
        playerStatePushed = false;
        console.log("Player hidden");
    } else if (event.state?.page === "downloadedSongs") {
        getAllDownloadedSongs();
    } else if (event.state?.type === "home") {
        home();
    } else {
        // Handle other cases normally
        const { type, query, category, id, page, elements } = event.state || {};

        if (type === "searchSongs") {
            searchSong(query, page);
        } else if (type === "search") {
            search(query, category, page);
        } else if (type === "lists") {
            listSongs(category, id, page);
        } else {
            hideAll();
            show(".home");
        }
    }
};

function updateHistory(type, params, url) {
    const currentState = history.state;
    if (currentState && JSON.stringify(currentState) === JSON.stringify(params)) {
        return; // Prevents adding duplicate history states
    }
    history.pushState(params, "", url);
}

function setupOutsideClickListener() {
    document.addEventListener('click', function (event) {
        // Check if the click is outside any dropdown or menu button
        const isDropdown = event.target.closest('.dropdown-menu');
        const isMenuButton = event.target.closest('.song-card-btn-menu');

        // If clicked outside both dropdown and menu button, close all dropdowns
        if (!isDropdown && !isMenuButton) {
            document.querySelectorAll('.dropdown-menu').forEach(dropdown => {
                dropdown.style.display = 'none';
            });
        }
    });
}