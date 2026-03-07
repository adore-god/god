(function waitForLabels(){

    const labelContainer = document.querySelector('.label-links');
    const map = window.labelMap;

    if (!labelContainer || !map) {
        setTimeout(waitForLabels, 100);
        return;
    }

    const container = document.createElement("div");
    container.id = "series-links-wrapper";
    document.body.appendChild(container);

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


