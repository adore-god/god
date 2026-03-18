// ─── Utility: inject one ItemList into the @graph ────────────────────────────

function injectItemListSchema({ listId, listName, links }) {
    const graphScript = Array.from(
        document.querySelectorAll('script[type="application/ld+json"]')
    ).find(s => s.textContent.includes('"@graph"'));
    if (!graphScript) return false;

    let data;
    try {
        data = JSON.parse(graphScript.textContent);
    } catch (e) {
        console.warn("LD+JSON parse failed:", e);
        return false;
    }

    // Avoid double-injection
    if (data["@graph"].some(n => n["@id"] === listId)) return true;

    const seenUrls = new Set();
    const schemaItems = [];
    let position = 1;

    links.forEach(link => {
        const url = link.href;
        if (!url || seenUrls.has(url)) return;
        seenUrls.add(url);
        schemaItems.push({
            "@type": "ListItem",
            "position": position++,
            "url": url,
            "name": link.textContent.trim()
        });
    });

    if (schemaItems.length === 0) return false;

    const pageUrl = window.location.href;

    data["@graph"].push({
        "@type": "ItemList",
        "@id": listId,
        "name": listName,
        "url": pageUrl,
        "numberOfItems": schemaItems.length,
        "itemListElement": schemaItems
    });

    // Link from the primary page node via hasPart
    const targetNode = data["@graph"].find(n =>
        ["BlogPosting", "WebPage", "CollectionPage", "Blog"].includes(n["@type"])
    );

    if (targetNode) {
        const ref = { "@id": listId };
        const existing = targetNode["hasPart"];

        if (!existing) {
            targetNode["hasPart"] = ref;
        } else {
            // Normalise to array and avoid duplicate refs
            const parts = Array.isArray(existing) ? existing : [existing];
            if (!parts.some(p => p["@id"] === listId)) {
                parts.push(ref);
            }
            targetNode["hasPart"] = parts;
        }
    }

    graphScript.textContent = JSON.stringify(data, null, 2);
    return true;
}


// ─── Helper: poll until a condition is met ────────────────────────────────────

function pollUntil(fn, { interval = 200, maxAttempts = 50 } = {}) {
    if (fn()) return;
    let attempts = 0;
    const id = setInterval(() => {
        if (fn() || ++attempts >= maxAttempts) clearInterval(id);
    }, interval);
}


// ─── 1. Latest Posts – fetch, render, then inject schema ─────────────────────

async function loadLatestPosts() {
    const container = document.getElementById('latest-posts');
    if (!container) return;

    try {
        const response = await fetch('https://god.thway.uk/sitemap_latest.xml');
        const text = await response.text();

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, "application/xml");
        const urls = Array.from(xmlDoc.getElementsByTagName('url')).slice(0, 30);

        const ul = document.createElement('ul');

        urls.forEach(url => {
            const loc = url.getElementsByTagName('loc')[0]?.textContent;
            if (!loc) return;
            const titleTag = url.getElementsByTagName('title')[0];
            const title = titleTag ? titleTag.textContent : loc;

            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = loc;
            a.textContent = title;
            li.appendChild(a);
            ul.appendChild(li);
        });

        container.appendChild(ul);

        // Schema injection — DOM is ready now, no polling needed
        injectItemListSchema({
            listId: window.location.href + "#latest-articles",
            listName: "Latest Articles",
            links: container.querySelectorAll('li a')
        });

    } catch (err) {
        console.error("Error loading latest posts:", err);
        container.textContent = "Unable to load latest posts.";
    }
}

window.addEventListener('DOMContentLoaded', loadLatestPosts);


// ─── 2. Article page – More Reading (series links) ───────────────────────────

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
        for (const path in map) {
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
        for (const articlePath in map) {
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

    const titleEl = document.createElement("div");
    titleEl.className = "series-links-title";
    titleEl.textContent = "More Reading";

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

    target.before(titleEl);
    target.before(container);

    injectItemListSchema({
        listId: currentPage + "#more-reading",
        listName: "More Reading",
        links: container.querySelectorAll('a')
    });
})();


// ─── 3. Homepage – Series and Topics schema ───────────────────────────────────

(function initHomepageSeriesSchema() {
    if (window.location.pathname !== "/" && window.location.pathname !== "/index.html") return;

    pollUntil(() => {
        const nav = document.querySelector('.series-links');
        if (!nav) return false;
        const links = nav.querySelectorAll('li a');
        if (links.length === 0) return false;

        return injectItemListSchema({
            listId: window.location.href + "#series-topics",
            listName: "Series and Topics",
            links
        });
    });
})();
