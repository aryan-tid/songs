function search(query) {
    // fetch(`http://192.168.1.4:3000/api/search/songs?query=${query}`)
    fetch(`https://api-auth-henna.vercel.app/api/proxy?text_api=search/songs?query=${query}`)
        .then(response => response.json())
        .then(apiResponse => generateSongCards(apiResponse))
        .catch(error => console.error("Error fetching data:", error));
        
        const textHeading = document.querySelector(".card-list-header");
        textHeading.textContent = "Search: '"+query+"'";
    }
function generateSongCards(apiResponse) {
    const container = document.querySelector(".song-card-container");
    container.innerHTML = "";

    apiResponse.data.results.forEach(song => {
        const songName = song.name;
        const songArtists = song.artists.primary.map(artist => artist.name).join(", ");
        const songId = song.id;
        const songUrls = song.downloadUrl.map(urlObj => ({ quality: urlObj.quality, url: urlObj.url }));
        const songImage = song.image.sort((a, b) => b.quality - a.quality)[2]?.url || "logo.png";

        const card = document.createElement("div");
        card.classList.add("container", "song-card");

        card.innerHTML = `
            <div class="song-card-cont1">
                <img class="song-card-img" src="${songImage}" />
                <div class="song-details">
                    <span class="song-card-name">${songName}</span>
                    <span class="song-card-artists">${songArtists}</span>
                    <span class="song-card-song-id hidden">${songId}</span>
                    ${songUrls.map((urlObj, index) => `<span class="song-card-song-url" data-quality="${urlObj.quality}" hidden>${urlObj.url}</span>`).join("")}
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
            console.log(songName, songURL, songImage, songArtists);
            playAudio(songName, songURL, songImage, songArtists);
        });

        container.appendChild(card);
    });
}

// Function to get URL parameter by name
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Get the 'search' parameter value from the URL
const query = getUrlParameter('s');

// If 'search' parameter exists, call the search function with the query
if (query) {
    search(query);
}
