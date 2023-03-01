// Wait for the page to finish loading before fetching metadata and redirecting
window.addEventListener("load", () => {
    // Get the selected platform choice from local storage
    let platform = null;
    chrome.storage.local.get('platformChoice', async function (storage) {
        switch (storage.platformChoice) {
            case 'deezer':
                platform = 'deezer';
                break;
            case 'youtube-music':
                platform = 'youtube-music';
                break;
            case 'amazon-music':
                platform = 'amazon-music';
                break;
            case 'spotify':
                platform = 'spotify';
                break;
            default:
                platform = 'deezer';
                break;
        }
        await redirect(platform);
    });
});

async function redirect(platform) {
    let ogTitle = "";
    let description = "";
    let searchUrl = "";
    // Spotify link handling
    if (platform !== "spotify" && window.location.href.indexOf('https://open.spotify.com/') !== -1) {
        // Fetch the og:title and og:description meta tags
        ogTitle = document.querySelector("meta[property='og:title']")?.content;
        const ogDescription = document.querySelector("meta[property='og:description']")?.content;

        // Build the search URL based on the selected platform choice and the metadata values
        const delimiterIndex = ogDescription.indexOf("·");
        description = delimiterIndex > -1 ? ogDescription.substring(0, delimiterIndex).trim() : ogDescription.trim();
    }
    // Youtube-music link handling
    if (platform !== "youtube-music" && window.location.href.indexOf('https://music.youtube.com/') !== -1) {
        await waitForElm('ytmusic-player-queue-item .song-info');
        ogTitle = document.querySelector('ytmusic-player-queue-item .song-info yt-formatted-string').innerText;
        description = document
            .querySelector('ytmusic-player-queue-item .song-info .byline-wrapper yt-formatted-string')
            .innerText;
    }
    // Deezer link handling
    if (platform !== "deezer" && window.location.href.indexOf('https://www.deezer.com/') !== -1) {
        const headTitle = document.querySelector("title").innerText;
        const splitWords = headTitle.split(' - ');
        const splitArtist = splitWords[1].split(' : ');
        ogTitle = splitWords[0];
        description = splitArtist[0];
    }

    // Redirect handling
    if (platform === "deezer" && window.location.href.indexOf('https://www.deezer.com/') === -1) {
        // Concatenate the og:title and first substring of og:description up to the first "·" character
        const titleAndDescription = `${ogTitle} - ${description}`;
        // Encode the resulting string and build the Deezer search URL
        const encodedTitleAndDescription = encodeURIComponent(titleAndDescription);
        searchUrl = `https://www.deezer.com/search/${encodedTitleAndDescription}`;
    } else if (platform === "youtube-music" && window.location.href.indexOf('https://music.youtube.com/') === -1 ) {
        // Build the YouTube Music search URL using the og:title and og:description
        const titleAndDescription = `${ogTitle} ${description}`;
        // Encode the special characters in the resulting string and replace encoded spaces with "+"
        const encodedTitleAndDescription = encodeURIComponent(titleAndDescription).replace(/%20/g, "+");
        searchUrl = `https://music.youtube.com/search?q=${encodedTitleAndDescription}`;
    } else if (platform === 'amazon-music' && window.location.href.indexOf('https://music.amazon.com/') === -1) {
        // Build the YouTube Music search URL using the og:title and og:description
        const titleAndDescription = `${ogTitle} ${description}`;
        // Encode the special characters in the resulting string and replace encoded spaces with "+"
        const encodedTitleAndDescription = encodeURIComponent(titleAndDescription).replace(/%20/g, "+");
        searchUrl = `https://music.amazon.fr/search/${encodedTitleAndDescription}`;
    } else if (platform === 'spotify' && window.location.href.indexOf('https://open.spotify.com/') === -1) {
        // Concatenate the og:title and first substring of og:description up to the first "·" character
        const titleAndDescription = `${ogTitle} - ${description}`;
        // Encode the resulting string and build the Deezer search URL
        const encodedTitleAndDescription = encodeURIComponent(titleAndDescription);
        searchUrl = `https://open.spotify.com/search/${encodedTitleAndDescription}`;
    }

    // Redirect the user to the search page
    if (searchUrl.length > 0) {
        window.location.href = searchUrl;
    }
}

function waitForElm(selector) {
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                resolve(document.querySelector(selector));
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}