(function waitForLabels(){

    const labelContainer = document.querySelector('.label-links');
    const map = window.labelMap;
    const target = document.querySelector('.share-dropdown');

    if (!labelContainer || !map || !target) {
        setTimeout(waitForLabels, 100);
        return;
    }

    const title = document.createElement("div");
    title.className = "series-links-title";
    title.textContent = "More Reading";

    const container = document.createElement("div");
    container.id = "series-links-wrapper";

    target.before(title);
    target.before(container);

    const currentPage = window.location.href;

    // Find the current page's entry in the map
    const entry = map[currentPage];
    if (!entry || !entry.groups) return;

    // Loop through each group (1 or 2 scroll lists)
    entry.groups.forEach(group => {
        group.links.forEach(link => {
            // Skip if this link is the current page
            const fullHref = new URL(link.href, window.location.href).href;
            if (fullHref === currentPage) return;

            const a = document.createElement("a");
            a.href = link.href;
            a.textContent = link.title;

            const div = document.createElement("div");
            div.appendChild(a);

            container.appendChild(div);
        });
    });

})();