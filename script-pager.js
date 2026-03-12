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

})();






// script-schema-inject.js
// Injects a full @graph JSON-LD block into the <head> of scrolls/label pages.
// Matches the schema structure used on BlogPosting pages:
//   Organization + WebSite + ItemList + BreadcrumbList
// Requires window.labelMap to be loaded before this script runs.

(function () {
  if (!window.labelMap) return;

  const currentUrl = window.location.href.split("?")[0].split("#")[0];

  // Collect all posts whose series[] includes this label page URL
  const items = [];
  for (const [postUrl, data] of Object.entries(window.labelMap)) {
    if (data.series && data.series.includes(currentUrl)) {
      items.push({ url: postUrl, title: data.title });
    }
  }

  if (items.length === 0) return;

  // Label name from <h1> or page title
  const h1 = document.querySelector("h1");
  const listName = h1 ? h1.textContent.trim() : document.title;

  const schema = {
    "@context": "https://schema.org",
    "@graph": [

      // ── Site-wide identity (same on every page) ────────────────────────
      {
        "@type": "Organization",
        "name": "God - The Way",
        "url": "https://god.thway.uk/",
        "logo": {
          "@type": "ImageObject",
          "url": "https://god.thway.uk/images/wp/god-theway-uk.webp"
        },
        "description": "Original linguistic framework — Lingua Divina — developed by HNNH, expanding foundational insights into Biblical text as symbolic consciousness mechanics. All interpretations are psychological and non-theological.",
        "sameAs": [
          "https://www.reddit.com/user/GoldStudio2653/",
          "https://www.tiktok.com/@god.thway.uk",
          "https://hnnh.studio/"
        ]
      },
      {
        "@type": "WebSite",
        "url": "https://god.thway.uk/",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://cse.google.com/cse?cx=62434d5e426ae403f&q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      },

      // ── ItemList: the label/series page itself ─────────────────────────
      {
        "@type": "ItemList",
        "@id": currentUrl,
        "name": listName,
        "url": currentUrl,
        "numberOfItems": items.length,
        "itemListElement": items.map((item, i) => ({
          "@type": "ListItem",
          "position": i + 1,
          "url": item.url,
          "name": item.title
        }))
      },

      // ── BreadcrumbList ─────────────────────────────────────────────────
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://god.thway.uk/"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Series and Collections",
            "item": "https://god.thway.uk/series-links.html"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": listName
            // no "item" on the last breadcrumb — it is the current page
          }
        ]
      }

    ]
  };

  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(schema, null, 2);
  document.head.appendChild(script);
})();


