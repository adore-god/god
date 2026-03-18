
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





 
(function () {
  "use strict";

  /* ── 1. Collect latest posts ───────────────────────────────────────── */

  function getLatestPosts() {
    const container = document.getElementById("latest-posts");
    if (!container) return [];

    return Array.from(container.querySelectorAll("a")).map((a) => ({
      "@type": "Article",
      name: a.textContent.trim(),
      url: a.href,
    }));
  }

  /* ── 2. Collect series links (optional — may not exist on every page) ─ */

  function getSeriesLinks() {
    const wrapper = document.getElementById("series-links-wrapper");
    if (!wrapper) return [];

    return Array.from(wrapper.querySelectorAll("a")).map((a) => ({
      "@type": "CreativeWorkSeries",
      name: a.textContent.trim(),
      url: a.href,
    }));
  }

  /* ── 3. Locate the existing JSON-LD <script> tag ──────────────────── */

  function getSchemaScript() {
    // Find the first application/ld+json script (assumes one per page, or first is the @graph one)
    return document.querySelector('script[type="application/ld+json"]');
  }

  /* ── 4. Inject into the BlogPosting node ─────────────────────────── */

  function enrichSchema() {
    const schemaScript = getSchemaScript();
    if (!schemaScript) return; // No schema present — nothing to do

    let graph;
    try {
      graph = JSON.parse(schemaScript.textContent);
    } catch (e) {
      console.warn("[schema-enrichment] Could not parse JSON-LD:", e);
      return;
    }

    // Support both a bare object and an @graph array
    const nodes = graph["@graph"] ? graph["@graph"] : [graph];
    const blogPosting = nodes.find((n) => n["@type"] === "BlogPosting");

    if (!blogPosting) {
      console.warn("[schema-enrichment] No BlogPosting node found in schema.");
      return;
    }

    /* hasPart → latest posts
       Using hasPart signals these are constituent parts of the current page/article. */
    const latestPosts = getLatestPosts();
    if (latestPosts.length) {
      blogPosting.hasPart = latestPosts;
    }

    /* mentions → series links (only if present on this page)
       Using mentions signals thematic/topical relationships without implying containment. */
    const seriesLinks = getSeriesLinks();
    if (seriesLinks.length) {
      blogPosting.mentions = seriesLinks;
    }

    // Write the enriched schema back to the <script> tag
    schemaScript.textContent = JSON.stringify(graph, null, 2);
  }

  /* ── 5. Run after DOM is ready ────────────────────────────────────── */

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", enrichSchema);
  } else {
    // DOMContentLoaded already fired (e.g. script loaded deferred/async late)
    enrichSchema();
  }
})();
