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

window.addEventListener("load", function () {
  setTimeout(function () {
    const schemaScript = document.querySelector('script[type="application/ld+json"]');
    if (!schemaScript) return;

    let graph;
    try {
      graph = JSON.parse(schemaScript.textContent);
    } catch (e) { return; }

    // Identify the main node (BlogPosting or WebPage)
    const nodes = graph["@graph"] ? graph["@graph"] : [graph];
    const mainNode = nodes.find((n) => n["@type"] === "BlogPosting" || n["@type"] === "WebPage");
    if (!mainNode) return;

    // 1. Markup for LATEST UPDATED ARTICLES (Collection/ItemList)
    const postsContainer = document.getElementById("latest-posts");
    if (postsContainer) {
      const postLinks = Array.from(postsContainer.querySelectorAll("a"));
      if (postLinks.length) {
        mainNode.mainEntity = {
          "@type": "ItemList",
          "name": "Latest Updated Articles",
          "itemListElement": postLinks.map((a, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "url": a.href,
            "name": a.textContent.trim()
          }))
        };
      }
    }

    // 2. Markup for TOPIC GROUPS / SERIES (CreativeWorkSeries)
    const seriesWrapper = document.getElementById("series-links-wrapper");
    if (seriesWrapper) {
      const seriesLinks = Array.from(seriesWrapper.querySelectorAll("a"));
      if (seriesLinks.length) {
        // We use 'mentions' to link the current page to the broader topic series
        mainNode.mentions = seriesLinks.map((a) => ({
          "@type": "CreativeWorkSeries",
          "name": a.textContent.trim(),
          "url": a.href
        }));
      }
    }

    schemaScript.textContent = JSON.stringify(graph, null, 2);
  }, 2000);
});
