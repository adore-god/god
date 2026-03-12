(function waitForLabels() {

    const labelContainer = document.querySelector('.label-links');
    const map = window.labelMap;
    const target = document.querySelector('.share-dropdown');

    if (!labelContainer || !map || !target) {
        setTimeout(waitForLabels, 100);
        return;
    }

    const currentPage = window.location.href;

    // Collect all scroll page URLs referenced by labels on this article
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

    // For each scroll group, collect its articles (excluding current page)
    // preserving group order but sorting articles within each group alphabetically
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

        // Sort alphabetically by title within the group
        groupEntries.sort((a, b) => a[1].localeCompare(b[1]));

        groups.push({
            scrollUrl,
            entries: groupEntries
        });
    });

    if (groups.length === 0) return;

    // Build UI
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

        // Optional visual divider between groups
        const divider = document.createElement("div");
        divider.className = "series-group-divider";
        container.appendChild(divider);
    });

    target.before(title);
    target.before(container);


    // ── Inject ItemList schema for each series this article belongs to ──

    const injectedSchemas = new Set();

    matchedScrollUrls.forEach(scrollUrl => {

        if (injectedSchemas.has(scrollUrl)) return;
        injectedSchemas.add(scrollUrl);

        // Get the scroll page title from the label link text
        let seriesName = scrollUrl.split("/").pop().replace(/^label-/, "").replace(/-/g, " ");
        allLinks.forEach(link => {
            if (link.href.split("/").pop() === scrollUrl.split("/").pop()) {
                seriesName = link.textContent.trim();
            }
        });

        // Get all posts in this series from the map
        const seriesItems = [];
        for (let articlePath in map) {
            const entry = map[articlePath];
            const seriesList = Array.isArray(entry.series) ? entry.series : [entry.series];
            if (seriesList.includes(scrollUrl)) {
                seriesItems.push({ url: articlePath, title: entry.title });
            }
        }

        if (seriesItems.length === 0) return;

        const schema = {
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": seriesName,
            "url": scrollUrl,
            "@id": scrollUrl,
            "numberOfItems": seriesItems.length,
            "itemListElement": seriesItems.map((item, i) => ({
                "@type": "ListItem",
                "position": i + 1,
                "url": item.url,
                "name": item.title
            }))
        };

        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.textContent = JSON.stringify(schema, null, 2);
        document.head.appendChild(script);
    });

})();
 