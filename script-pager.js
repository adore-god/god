
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

    // Safety pass: fix any accidental /scrolls/scrolls/ in rendered links
    container.querySelectorAll('a').forEach(a => {
        if (a.href.includes('/scrolls/scrolls/')) {
            a.href = a.href.replace(/\/scrolls\/scrolls\//g, '/scrolls/');
        }
    });

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

    const schema = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "More Reading",
        "url": window.location.href,
        "numberOfItems": schemaItems.length,
        "itemListElement": schemaItems
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schema, null, 2);
    document.head.appendChild(script);

})();



(function waitForLatestPosts() {
    const container = document.getElementById('latest-posts');
    if (!container) return;

    const links = container.querySelectorAll('li a');
    if (links.length === 0) {
        setTimeout(waitForLatestPosts, 100);
        return;
    }

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

    const schema = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "Latest Articles",
        "url": window.location.href,
        "numberOfItems": schemaItems.length,
        "itemListElement": schemaItems
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schema, null, 2);
    document.head.appendChild(script);
})();
