

function getGraphScript() {
    return Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
        .find(s => s.textContent.includes('"@graph"')) || null;
}

function injectListSchema({ listId, listName, pageUrl, schemaItems }) {
    const graphScript = getGraphScript();
    if (!graphScript) return false;

    try {
        const data = JSON.parse(graphScript.textContent);

        const alreadyExists = data["@graph"].some(n => n["@id"] === listId);
        if (alreadyExists) return true;

        data["@graph"].push({
            "@type": "ItemList",
            "@id": listId,
            "name": listName,
            "url": pageUrl,
            "numberOfItems": schemaItems.length,
            "itemListElement": schemaItems
        });

        const targetNode = data["@graph"].find(n =>
            ["BlogPosting", "WebPage", "CollectionPage", "Blog"].includes(n["@type"])
        );

        if (targetNode) {
            const ref = { "@id": listId };
            const existing = targetNode["hasPart"];
            if (!existing) {
                targetNode["hasPart"] = ref;
            } else if (Array.isArray(existing)) {
                if (!existing.some(e => e["@id"] === listId)) {
                    existing.push(ref);
                }
            } else {
                if (existing["@id"] !== listId) {
                    targetNode["hasPart"] = [existing, ref];
                }
            }
        }

        graphScript.textContent = JSON.stringify(data, null, 2);
        return true;

    } catch (e) {
        console.warn("Schema injection failed:", e);
        return false;
    }
}

// ─── 1. More Reading (all pages including homepage) ───────────────────────────

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
        groups.push({ scrollUrl, entries: groupEntries });
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
    if (!container) { setTimeout(waitForSeriesLinks, 100); return; }

    const links = container.querySelectorAll('a');
    if (links.length === 0) return;

    if (!getGraphScript()) { setTimeout(waitForSeriesLinks, 100); return; }

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
    injectListSchema({
        listId: pageUrl + "#more-reading",
        listName: "More Reading",
        pageUrl,
        schemaItems
    });
})();

// ─── 2. Series and Topics (homepage only) ────────────────────────────────────

(function waitForHomepageSeriesLinks() {
    if (window.location.pathname !== "/" && window.location.pathname !== "/index.html") return;

    const navSeriesLinks = document.querySelector('.series-links');
    if (!navSeriesLinks) { setTimeout(waitForHomepageSeriesLinks, 100); return; }

    const links = navSeriesLinks.querySelectorAll('li a');
    if (links.length === 0) { setTimeout(waitForHomepageSeriesLinks, 100); return; }

    if (!getGraphScript()) { setTimeout(waitForHomepageSeriesLinks, 100); return; }

    const pageUrl = window.location.href;
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

    injectListSchema({
        listId: pageUrl + "#series-topics",
        listName: "Series and Topics",
        pageUrl,
        schemaItems
    });
})();

// ─── 3. Latest Articles (homepage only) ──────────────────────────────────────

function injectLatestPostsSchema() {
    const container = document.getElementById('latest-posts');
    if (!container) return;

    const links = container.querySelectorAll('li a');
    if (links.length === 0) return;

    if (!getGraphScript()) return;

    const pageUrl = window.location.href;
    const listId = pageUrl + "#latest-articles";

    try {
        const data = JSON.parse(getGraphScript().textContent);
        if (data["@graph"].some(n => n["@id"] === listId)) return;
    } catch(e) { return; }

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

    injectListSchema({
        listId,
        listName: "Latest Articles",
        pageUrl,
        schemaItems
    });
}

