const songListImg = document.querySelector(".song-list");
const APIbaseURL = "https://vercel-jiosaavn.vercel.app/api/";
let page = 1;
let currentPageName = "default";
let currentPageCategory = "default";
function getSelectedQuality() {
    const selectedOption = document.querySelector(".custom-dropdown .selected");
    return selectedOption ? selectedOption.getAttribute("data-value") : null;
}

function hideAll() {
    document.querySelector(".song-list").style.display = "none";
    document.querySelector("#headingOptions").style.display = "none";
    document.querySelector(".search-container").style.display = "none";
    document.querySelector(".main-content").style.display = "none";
    document.querySelector(".settings").style.display = "none";
    document.querySelector(".popup-overlay").classList.add("hidden");
}
function show(querySelector) {
    document.querySelector(querySelector).style.removeProperty("display");
}
function hide(querySelector) {
    document.querySelector(querySelector).style.display = "none";
}

async function showBrowse() {
    const isSettingsHidden = getComputedStyle(document.querySelector(".settings")).display === "none";
    if (isSettingsHidden) {
        const target = document.querySelector('.search-container');
        target.style.display ? target.style.removeProperty('display') : target.style.setProperty('display', 'none');
    } else {
        loader("show");
        await window.history.back();
        loader("show");
        await pause(1000);
        show(".search-container");
        loader("hide");

    }
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
        console.log(`Searching for "${query}" in category: ${selectedCategory}`);
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
    scrollToTop();
    if (!query) {
        alert(`Please enter a song's name`);
        return;
    }
    updateHistory("searchSongs", { type: "searchSongs", query, page }, `?query=${query}&page=${page}`);
    if (fromUrlParam) {
        fromUrlParam = false;
    } else if (currentPageName !== "query") {
        page = 1;
        currentPageName = "query";
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
                        <button class="btn btn-primary song-card-btn" type="button">
                            <i class="icon-options-vertical" style="font-size: 16px;"></i>
                        </button>
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
    scrollToTop();

    if (!query) {
        alert(`Please enter a ${category}'s name`);
        return;
    }

    updateHistory("search", { type: "search", query, category, page }, `?query=${query}&category=${category}&page=${page}`);

    if (fromUrlParam) {
        fromUrlParam = false;
    } else if (currentPageName !== "query" && currentPageCategory !== category) {
        page = 1;
        currentPageName = "query";
        currentPageCategory = category;
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

    let url;
    scrollToTop();
    if (fromUrlParam) {
        fromUrlParam = false;
    } else if (currentPageName !== "id" && currentPageCategory !== category) {
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
                    <button class="btn btn-primary song-card-btn-queue song-card-btn" type="button">
                        <i class="icon ion-android-add"></i>
                    </button>
                    <button class="btn btn-primary song-card-btn" type="button">
                        <i class="icon-options-vertical" style="font-size: 16px;"></i>
                    </button>
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

            newContent.appendChild(card);
        });
        hideAll();
        show("#headingOptions");
        show(".main-content");
        show(".song-card-list");

        // Now clear old content and replace it with the new content
        resultDiv.innerHTML = '';
        resultDiv.appendChild(newContent);
        document.querySelector(".song-list").style.display = "flex";

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

// Convert pageParam to a number and use 1 as default if missing or invalid
const pageP = pageParam ? parseInt(pageParam, 10) || 1 : 1;
let fromUrlParam = false;

// Check conditions and execute functions accordingly
if (categoryParam && idParam) {
    fromUrlParam = true;
    listSongs(categoryParam, idParam, pageP);
    console.log(categoryParam, idParam, pageP);
} else if (queryParam && categoryParam) {
    fromUrlParam = true;
    search(queryParam, categoryParam, pageP);
    console.log(queryParam, categoryParam, pageP);
} else if (queryParam) {
    fromUrlParam = true;
    searchSong(queryParam, pageP);
    console.log(queryParam, pageP);
} else {
    listSongs("artists", "459320", "1");
}


window.onpopstate = function (event) {
    if (!event.state) return;

    console.log("Navigating back:", event.state);

    const { type, query, category, id, page, elements } = event.state; // Retrieve elements

    if (type === "searchSongs") {
        searchSong(query, page);
    } else if (type === "search") {
        search(query, category, page);
    } else if (type === "lists") {
        listSongs(category, id, page);
    } else if (type === "showHide") {
        hideAll(); // Hide everything first

        if (elements) {
            for (const selector in elements) {
                const el = document.querySelector(selector);
                if (el && elements[selector]) {
                    el.style.display = ""; // Reset to default display (usually block/flex)
                }
            }
        }
    }
};

function saveVisibilityState() {
    const elements = [
        ".song-list",
        "#headingOptions",
        ".search-container",
        ".main-content",
        ".settings",
        ".popup-overlay",
        ".audio-palyer11"
    ];

    const visibilityState = elements.reduce((acc, selector) => {
        const el = document.querySelector(selector);
        if (el) {
            acc[selector] = getComputedStyle(el).display !== "none"; // true if visible
        }
        return acc;
    }, {});

    history.pushState({ type: "showHide", elements: visibilityState }, "");
}


function updateHistory(type, params, url) {
    const currentState = history.state;
    if (currentState && JSON.stringify(currentState) === JSON.stringify(params)) {
        return; // Prevents adding duplicate history states
    }
    history.pushState(params, "", url);
}

function goBackAndWait(nextFunction) {
    return new Promise((resolve) => {
        const onPopState = () => {
            window.removeEventListener("popstate", onPopState); // Remove listener to avoid multiple triggers
            resolve(); // Resolve the promise when the back action completes
        };

        window.addEventListener("popstate", onPopState);
        window.history.back();
    }).then(() => {
        if (typeof nextFunction === "function") {
            nextFunction(); // Execute the next function after going back
        }
    });
}
