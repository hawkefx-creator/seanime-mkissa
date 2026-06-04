var BASE_URL = "https://api.allanime.day/api";

function searchAnime(query) {
    var variables = JSON.stringify({
        search: {
            allowAdult: false,
            allowUnknown: false,
            query: query
        },
        limit: 20,
        page: 1,
        translationType: "sub",
        countryOrigin: "ALL"
    });

    var extensions = JSON.stringify({
        persistedQuery: {
            version: 1,
            sha256Hash: "9343797cc3d9e3f444e2d3b7db9a84d759b816a4d84512ea72d079f85d5858fc"
        }
    });

    var url = BASE_URL + "?variables=" + encodeURIComponent(variables) + "&extensions=" + encodeURIComponent(extensions);

    var res = fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Referer": "https://allmanga.to/",
            "Origin": "https://allmanga.to"
        }
    });

    var data = res.json();
    if (!data || !data.data || !data.data.shows) return [];

    return data.data.shows.edges.map(function(show) {
        return {
            id: show._id,
            title: show.name,
            image: show.thumbnail
        };
    });
}

function getEpisodes(animeId) {
    var variables = JSON.stringify({
        showId: animeId,
        translationType: "sub"
    });

    var extensions = JSON.stringify({
        persistedQuery: {
            version: 1,
            sha256Hash: "73d998d209d6d8de325db91a8e3c363f8db0b4cd0e5e0eb28e939aef6c3c6a29"
        }
    });

    var url = BASE_URL + "?variables=" + encodeURIComponent(variables) + "&extensions=" + encodeURIComponent(extensions);

    var res = fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Referer": "https://allmanga.to/",
            "Origin": "https://allmanga.to"
        }
    });

    var data = res.json();
    if (!data || !data.data || !data.data.show) return [];

    var show = data.data.show;
    var episodes = [];
    var total = show.lastEpisodeInfo && show.lastEpisodeInfo.sub ? show.lastEpisodeInfo.sub.episodeString : "1";
    var count = parseInt(total) || 1;

    for (var i = 1; i <= count; i++) {
        episodes.push({
            id: animeId + "___" + i,
            number: i,
            title: "Episode " + i
        });
    }

    return episodes;
}

function getStreamingLinks(episodeId, dub) {
    var parts = episodeId.split("___");
    var animeId = parts[0];
    var epNum = parts[1];
    var translationType = dub ? "dub" : "sub";

    var variables = JSON.stringify({
        showId: animeId,
        translationType: translationType,
        episodeString: epNum
    });

    var extensions = JSON.stringify({
        persistedQuery: {
            version: 1,
            sha256Hash: "5f1a64b73793cc2234a389cf3a8f93ad82de7043017dd551f38f65b89daa65a0"
        }
    });

    var url = BASE_URL + "?variables=" + encodeURIComponent(variables) + "&extensions=" + encodeURIComponent(extensions);

    var res = fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Referer": "https://allmanga.to/",
            "Origin": "https://allmanga.to"
        }
    });

    var data = res.json();
    if (!data || !data.data || !data.data.episode) return [];

    var sources = data.data.episode.sourceUrls || [];
    var links = [];

    sources.forEach(function(source) {
        if (source.sourceUrl && source.sourceUrl.indexOf("mp4") !== -1) {
            links.push({
                url: source.sourceUrl,
                quality: source.priority ? String(source.priority) : "default",
                isM3U8: false
            });
        }
        if (source.sourceUrl && source.sourceUrl.indexOf("m3u8") !== -1) {
            links.push({
                url: source.sourceUrl,
                quality: source.priority ? String(source.priority) : "default",
                isM3U8: true
            });
        }
    });

    return links;
}

class Provider {
    search(query) {
        return searchAnime(query);
    }

    findEpisodes(id) {
        return getEpisodes(id);
    }

    findEpisodeSources(id, episodeNumber, dub) {
        return getStreamingLinks(id + "___" + episodeNumber, dub);
    }
}
