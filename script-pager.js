
(function waitForLabels() {
    const labelContainer = document.querySelector('.label-links');
    const map = window.labelMap;
    const target = document.querySelector('.share-dropdown');

    if (!labelContainer || !map || !target) {
        setTimeout(waitForLabels, 100);
        return;
    }

    const currentPage = window.location.href;
    const allLinks = labelContainer.querySelectorAll("a");

    const matchedScrollUrls = new Set();

    allLinks.forEach(link => {
        const linkSlug = link.href.split("/").pop();
        for (let path in map) {
            const seriesList = map[path].series;
            if (Array.isArray(seriesList)) {
                seriesList.forEach(s => {
                    if (s.split("/").pop() === linkSlug) {
                        matchedScrollUrls.add(s);
                    }
                });
            }
        }
    });

    if (matchedScrollUrls.size === 0) return;

    const seenPaths = new Set();
    const allEntries = [];

    matchedScrollUrls.forEach(scrollUrl => {
        for (let articlePath in map) {
            if (articlePath === currentPage) continue;
            if (seenPaths.has(articlePath)) continue;

            const entry = map[articlePath];
            const seriesList = Array.isArray(entry.series) ? entry.series : [entry.series];

            if (seriesList.includes(scrollUrl)) {
                seenPaths.add(articlePath);
                allEntries.push([articlePath, entry.title]);
            }
        }
    });

    if (allEntries.length === 0) return;

    allEntries.sort((a, b) => a[1].localeCompare(b[1]));

    const title = document.createElement("div");
    title.className = "series-links-title";
    title.textContent = "More Reading";

    const container = document.createElement("div");
    container.id = "series-links-wrapper";

    allEntries.forEach(([path, linkTitle]) => {
        const a = document.createElement("a");
        a.href = path;
        a.textContent = linkTitle;

        const div = document.createElement("div");
        div.appendChild(a);
        container.appendChild(div);
    });

    target.before(title);
    target.before(container);

    // Inject schema immediately after building the list
    injectMoreReadingSchema();
})();


function injectMoreReadingSchema() {
    const container = document.getElementById('series-links-wrapper');
    if (!container) return false;

    const links = container.querySelectorAll('a');
    if (links.length === 0) return false;

    // Always re-read the script fresh before writing
    const graphScript = Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
        .find(s => s.textContent.includes('"@graph"'));
    if (!graphScript) return false;

    try {
        const data = JSON.parse(graphScript.textContent);
        const pageUrl = window.location.href;
        const listId = pageUrl + "#more-reading";

        // Avoid double injection
        if (data["@graph"].some(n => n["@id"] === listId)) return true;

        const seenUrls = new Set();
        const schemaItems = [];
        let position = 1;

        links.forEach(link => {
            const url = link.href;
            if (seenUrls.has(url)) return;
            seenUrls.add(url);
            schemaItems.push({
                "@type": "ListItem",
                "position": position++,
                "url": url,
                "name": link.textContent.trim()
            });
        });

        if (schemaItems.length === 0) return false;

        data["@graph"].push({
            "@type": "ItemList",
            "@id": listId,
            "name": "More Reading",
            "url": pageUrl,
            "numberOfItems": schemaItems.length,
            "itemListElement": schemaItems
        });

        const targetNode = data["@graph"].find(n =>
            ["BlogPosting", "WebPage", "CollectionPage", "Blog"].includes(n["@type"])
        );

        if (targetNode) {
            const existing = targetNode["hasPart"];
            if (!existing) {
                targetNode["hasPart"] = { "@id": listId };
            } else if (Array.isArray(existing)) {
                existing.push({ "@id": listId });
            } else {
                targetNode["hasPart"] = [existing, { "@id": listId }];
            }
        }

        graphScript.textContent = JSON.stringify(data, null, 2);
        return true;

    } catch (e) {
        console.warn("More reading schema injection failed:", e);
        return false;
    }
}


(function waitForHomepageSeriesLinks() {
    if (window.location.pathname !== "/" && window.location.pathname !== "/index.html") return;

    function injectHomepageSeriesSchema() {
        const navSeriesLinks = document.querySelector('.series-links');
        if (!navSeriesLinks) return false;

        const links = navSeriesLinks.querySelectorAll('li a');
        if (links.length === 0) return false;

        // Always re-read fresh before writing
        const graphScript = Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
            .find(s => s.textContent.includes('"@graph"'));
        if (!graphScript) return false;

        try {
            const data = JSON.parse(graphScript.textContent);
            const pageUrl = window.location.href;
            const listId = pageUrl + "#series-topics";

            if (data["@graph"].some(n => n["@id"] === listId)) return true;

            const schemaItems = [];
            let position = 1;
            links.forEach(link => {
                schemaItems.push({
                    "@type": "ListItem",
                    "position": position++,
                    "url": link.href,
                    "name": link.textContent.trim()
                });
            });

            data["@graph"].push({
                "@type": "ItemList",
                "@id": listId,
                "name": "Series and Topics",
                "url": pageUrl,
                "numberOfItems": schemaItems.length,
                "itemListElement": schemaItems
            });

            const targetNode = data["@graph"].find(n =>
                ["BlogPosting", "WebPage", "CollectionPage", "Blog"].includes(n["@type"])
            );

            if (targetNode) {
                const existing = targetNode["hasPart"];
                if (!existing) {
                    targetNode["hasPart"] = { "@id": listId };
                } else if (Array.isArray(existing)) {
                    existing.push({ "@id": listId });
                } else {
                    targetNode["hasPart"] = [existing, { "@id": listId }];
                }
            }

            graphScript.textContent = JSON.stringify(data, null, 2);
            return true;

        } catch (e) {
            console.warn("Homepage series schema injection failed:", e);
            return false;
        }
    }

    if (!injectHomepageSeriesSchema()) {
        let attempts = 0;
        const poll = setInterval(() => {
            if (injectHomepageSeriesSchema() || ++attempts > 50) {
                clearInterval(poll);
            }
        }, 200);
    }
})();


(function initLatestPostsSchema() {
    function injectLatestPostsSchema() {
        const container = document.getElementById('latest-posts');
        if (!container) return false;

        const links = container.querySelectorAll('li a');
        if (links.length === 0) return false;

        // Always re-read fresh before writing
        const graphScript = Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
            .find(s => s.textContent.includes('"@graph"'));
        if (!graphScript) return false;

        try {
            const data = JSON.parse(graphScript.textContent);
            const pageUrl = window.location.href;
            const listId = pageUrl + "#latest-articles";

            if (data["@graph"].some(n => n["@id"] === listId)) return true;

            const schemaItems = [];
            let position = 1;
            links.forEach(link => {
                schemaItems.push({
                    "@type": "ListItem",
                    "position": position++,
                    "url": link.href,
                    "name": link.textContent.trim()
                });
            });

            data["@graph"].push({
                "@type": "ItemList",
                "@id": listId,
                "name": "Latest Articles",
                "url": pageUrl,
                "numberOfItems": schemaItems.length,
                "itemListElement": schemaItems
            });

            const targetNode = data["@graph"].find(n =>
                ["BlogPosting", "WebPage", "CollectionPage", "Blog"].includes(n["@type"])
            );

            if (targetNode) {
                const existing = targetNode["hasPart"];
                if (!existing) {
                    targetNode["hasPart"] = { "@id": listId };
                } else if (Array.isArray(existing)) {
                    existing.push({ "@id": listId });
                } else {
                    targetNode["hasPart"] = [existing, { "@id": listId }];
                }
            }

            graphScript.textContent = JSON.stringify(data, null, 2);
            return true;

        } catch (e) {
            console.warn("Latest posts schema injection failed:", e);
            return false;
        }
    }

    if (!injectLatestPostsSchema()) {
        document.addEventListener('latestPostsReady', injectLatestPostsSchema);

        let attempts = 0;
        const poll = setInterval(() => {
            if (injectLatestPostsSchema() || ++attempts > 50) {
                clearInterval(poll);
            }
        }, 200);
    }
})();

(function waitForHomepageMoreReading() {
    if (window.location.pathname !== "/" && window.location.pathname !== "/index.html") return;

    function tryInject() {
        const container = document.getElementById('series-links-wrapper');
        if (!container) return false;
        return injectMoreReadingSchema();
    }

    if (!tryInject()) {
        let attempts = 0;
        const poll = setInterval(() => {
            if (tryInject() || ++attempts > 50) clearInterval(poll);
        }, 200);
    }
})();