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
    const matchedScrollUrls = [];

    allLinks.forEach(link => {
        const linkSlug = link.href.split("/").pop();
        for (let path in map) {
            const seriesList = map[path].series;
            if (Array.isArray(seriesList)) {
                seriesList.forEach(s => {
                    if (s.split("/").pop() === linkSlug && !matchedScrollUrls.includes(s)) {
                        matchedScrollUrls.push(s);
                    }
                });
            }
        }
    });

    if (matchedScrollUrls.length === 0) return;

    const groups = [];

    matchedScrollUrls.forEach(scrollUrl => {
        const groupEntries = [];

        for (let articlePath in map) {
            if (articlePath === currentPage) continue;
            const entry = map[articlePath];
            const seriesList = Array.isArray(entry.series) ? entry.series : [entry.series];
            if (seriesList.includes(scrollUrl)) {
                groupEntries.push([articlePath, entry.title]);
            }
        }

        if (groupEntries.length === 0) return;

        groupEntries.sort((a, b) => a[1].localeCompare(b[1]));

        groups.push({
            scrollUrl,
            entries: groupEntries
        });
    });

    if (groups.length === 0) return;

    const title = document.createElement("div");
    title.className = "series-links-title";
    title.textContent = "More Reading";

    const container = document.createElement("div");
    container.id = "series-links-wrapper";

    groups.forEach(group => {
        group.entries.forEach(([path, linkTitle]) => {
            const a = document.createElement("a");
            a.href = path;
            a.textContent = linkTitle;

            const div = document.createElement("div");
            div.appendChild(a);
            container.appendChild(div);
        });

        const divider = document.createElement("div");
        divider.className = "series-group-divider";
        container.appendChild(divider);
    });

    target.before(title);
    target.before(container);

})();


(function waitForSeriesLinks() {
    const container = document.getElementById('series-links-wrapper');

    if (!container) {
        setTimeout(waitForSeriesLinks, 100);
        return;
    }

    const links = container.querySelectorAll('a');
    if (links.length === 0) return;

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

    if (schemaItems.length === 0) return;

    const pageUrl = window.location.href;
    const listId = pageUrl + "#more-reading";

    const graphScript = Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
        .find(s => s.textContent.includes('"@graph"'));

    if (!graphScript) {
        setTimeout(waitForSeriesLinks, 100);
        return;
    }

    try {
        const data = JSON.parse(graphScript.textContent);

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

    } catch (e) {
        console.warn("Schema injection failed:", e);
    }

})();


(function waitForHomepageSeriesLinks() {
    if (window.location.pathname !== "/" && window.location.pathname !== "/index.html") return;

    const navSeriesLinks = document.querySelector('.series-links');
    if (!navSeriesLinks) {
        setTimeout(waitForHomepageSeriesLinks, 100);
        return;
    }

    const links = navSeriesLinks.querySelectorAll('li a');
    if (links.length === 0) {
        setTimeout(waitForHomepageSeriesLinks, 100);
        return;
    }

    const graphScript = Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
        .find(s => s.textContent.includes('"@graph"'));

    if (!graphScript) {
        setTimeout(waitForHomepageSeriesLinks, 100);
        return;
    }

    try {
        const data = JSON.parse(graphScript.textContent);
        const pageUrl = window.location.href;
        const listId = pageUrl + "#series-topics";

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

    } catch (e) {
        console.warn("Homepage series schema injection failed:", e);
    }
})();


document.addEventListener('latestPostsReady', function() {
    const container = document.getElementById('latest-posts');
    const links = container.querySelectorAll('li a');
    if (links.length === 0) return;

    const graphScript = Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
        .find(s => s.textContent.includes('"@graph"'));
    if (!graphScript) return;

    try {
        const data = JSON.parse(graphScript.textContent);
        const pageUrl = window.location.href;
        const listId = pageUrl + "#latest-articles";

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

    } catch (e) {
        console.warn("Latest posts schema injection failed:", e);
    }
});
