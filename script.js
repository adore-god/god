
async function loadLatestPosts() {
    const container = document.getElementById('latest-posts');

    try {
        // Fetch the latest sitemap
        const response = await fetch(' sitemap_latest.xml');
        const text = await response.text();

        // Parse the XML
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, "application/xml");
        const urls = xmlDoc.getElementsByTagName('url');

        // Display only the last 5 modified posts
        const latestPosts = Array.from(urls).slice(0, 5);

        const ul = document.createElement('ul');

        latestPosts.forEach(url => {
            const loc = url.getElementsByTagName('loc')[0].textContent;
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

    } catch (err) {
        console.error("Error loading latest posts:", err);
        container.textContent = "Unable to load latest posts.";
    }
}

// Load posts when page is ready
window.addEventListener('DOMContentLoaded', loadLatestPosts);
