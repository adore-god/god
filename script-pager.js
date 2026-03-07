(function waitForLabels(){

    const labelContainer = document.querySelector('.label-links');
    const map = window.labelMap;
    const target = document.querySelector('.share-dropdown');

    if (!labelContainer || !map || !target) {
        setTimeout(waitForLabels, 100);
        return;
    }

    // Create title outside the wrapper
    const title = document.createElement("div");
    title.className = "series-links-title";
    title.textContent = "More Reading";
    target.appendChild(title);

    // Create scrollable wrapper for links
    const container = document.createElement("div");
    container.id = "series-links-wrapper";
    target.appendChild(container);

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