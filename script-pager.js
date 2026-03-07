(function waitForLabels(){

    const labelContainer = document.querySelector('.label-links');
    const map = window.labelMap;
    const target = document.querySelector('.share-dropdown');

    if (!labelContainer || !map || !target) {
        setTimeout(waitForLabels, 100);
        return;
    }

    // Create title
    const title = document.createElement("div");
    title.className = "series-links-title";
    title.textContent = "More Reading";

    // Create scrollable wrapper
    const container = document.createElement("div");
    container.id = "series-links-wrapper";

    // Insert BEFORE or AFTER the share-dropdown
    // To place ABOVE:
    target.before(title);
    target.before(container);

    // To place BELOW, comment the above two lines and use:
    // target.after(title);
    // target.after(container);

    const allLinks = labelContainer.querySelectorAll("a");

    allLinks.forEach(link => {

        for (let path in map) {

            if (
                map[path].series &&
                link.href.endsWith(map[path].series.split("/").pop())
            ) {

                const a = document.createElement("a");
                a.href = path;
                a.textContent = map[path].title;

                const div = document.createElement("div");
                div.appendChild(a);

                container.appendChild(div);

            }

        }

    });

})();