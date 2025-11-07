// Inject JSON-LD for Article + Breadcrumb after DOM is loaded
document.addEventListener("DOMContentLoaded", function() {
    // Grab page title for headline
    const pageTitle = document.title || "Default Headline";

    // Find first image inside main or body
    const firstImg = document.querySelector('main img, body img');
    const imageUrl = firstImg ? firstImg.src : "https://god.thway.uk/images/default-image.webp";

    // Define breadcrumb items
    const breadcrumbItems = [
        { position: 1, name: "Home", item: "https://god.thway.uk" },
        { position: 2, name: "Genesis Foundational Principles", item: "https://god.thway.uk/genesis-foundational-principles.html" },
        { position: 3, name: "God", item: "https://god.thway.uk/elohim-god.html" },
        { position: 4, name: "Timeline", item: "https://god.thway.uk/the-law-timeline.html" },
        { position: 5, name: "Creation", item: "https://god.thway.uk/genesis-1-creation.html" },
        { position: 6, name: "Seed", item: "https://god.thway.uk/genesis-111-seed.html" },
        { position: 7, name: "Man", item: "https://god.thway.uk/genesis-126-man.html" },
        { position: 8, name: "Woman", item: "https://god.thway.uk/genesis-223-woman.html" },
        { position: 9, name: "Love", item: "https://god.thway.uk/genesis-224-love.html" },
        { position: 10, name: "Sin", item: "https://god.thway.uk/genesis-47-sin.html" },
        { position: 11, name: "I AM", item: "https://god.thway.uk/exodus-314-i-am.html" },
        { position: 12, name: "Salvation", item: "https://god.thway.uk/jesus-christ-salvation.html" },
        { position: 13, name: "Ask, Believe, Receive", item: "https://god.thway.uk/ask-believe-receive-catalyst-for-love.html" },
        { position: 14, name: "Teachers of the Law", item: "https://god.thway.uk/teachers-fathers-of-law-assumption.html" },
        { position: 15, name: "Paul: The Mystery", item: "https://god.thway.uk/the-mystery-secret-bible-revealed.html" },
        { position: 16, name: "Series & Collections", item: "https://god.thway.uk/series-links.html" }
    ];

    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Article",
                "headline": pageTitle,
                "image": imageUrl,
                "author": {
                    "@type": "Person",
                    "name": "HNNH",
                    "url": "https://god.thway.uk/about_13.html"
                },
                "publisher": {
                    "@type": "Organization",
                    "name": "God - The Way",
                    "logo": {
                        "@type": "ImageObject",
                        "url": "https://god.thway.uk/favicon.png"
                    }
                }
            },
            {
                "@type": "BreadcrumbList",
                "itemListElement": breadcrumbItems.map(item => ({
                    "@type": "ListItem",
                    "position": item.position,
                    "name": item.name,
                    "item": item.item
                }))
            }
        ]
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(jsonLd, null, 2);
    document.head.appendChild(script);
});






document.addEventListener("DOMContentLoaded", () => {
  const button = document.querySelector(".share-button");
  const menu = document.getElementById("share-menu");

  if (!button || !menu) return; // Exit if the main button or menu is missing

  const pageUrl = encodeURIComponent(window.location.href);
  const pageTitle = encodeURIComponent(document.title);

  // Assign share links safely
  const twitter = document.getElementById("share-twitter");
  if (twitter) {
    twitter.href = `https://twitter.com/intent/tweet?url=${pageUrl}&text=${pageTitle}`;
  }

  const facebook = document.getElementById("share-facebook");
  if (facebook) {
    facebook.href = `https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`;
  }

  // Copy link safely
  const copyButton = document.getElementById("share-copy");
  if (copyButton) {
    copyButton.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      } catch (err) {
        console.error("Failed to copy:", err);
      }
      menu.style.display = "none";
    });
  }

  // Toggle dropdown
  button.addEventListener("click", () => {
    menu.style.display = menu.style.display === "block" ? "none" : "block";
  });

  // Close if clicked outside
  document.addEventListener("click", (e) => {
    if (!button.contains(e.target) && !menu.contains(e.target)) {
      menu.style.display = "none";
    }
  });
});








document.addEventListener('DOMContentLoaded', () => {
  const currentURL = window.location.href;

  // Full URLs to exclude
  const excludeURLs = [
    'https://god.thway.uk/',
    'https://god.thway.uk/about_13.html',
    'https://god.thway.uk/series-links.html',
    'https://god.thway.uk/search.html',
  ];

  // Exit if current URL is in the exclude list
  if (excludeURLs.includes(currentURL)) return;

  const labelLinks = document.querySelectorAll('.label-links a');
  const mainContent = document.querySelector('main.content');
  if (!mainContent) return;

  // Create breadcrumb container
  const breadcrumb = document.createElement('nav');
  breadcrumb.className = 'breadcrumb';
  breadcrumb.setAttribute('aria-label', 'Breadcrumb');

  // Function to create a breadcrumb link (adds only "noTag" class)
  function createCrumb(href, text) {
    const a = document.createElement('a');
    a.href = href;
    a.textContent = text;
    a.classList.add('noTag'); // Only add noTag
    return a;
  }

  // Home link
  breadcrumb.appendChild(createCrumb('https://god.thway.uk', 'Home'));

  // Separator
  const sep1 = document.createElement('span');
  sep1.className = 'breadcrumb-separator';
  sep1.textContent = ' › ';
  breadcrumb.appendChild(sep1);

  // Current page wrapped in a span with noTag class
  const pageTitle = document.querySelector('h1')?.textContent || document.title;
  const currentPage = document.createElement('span');
  currentPage.textContent = pageTitle;
  currentPage.classList.add('noTag'); // Only 'noTag' class
  breadcrumb.appendChild(currentPage);

  // Add series/label links if they exist
  labelLinks.forEach(link => {
    const sep = document.createElement('span');
    sep.className = 'breadcrumb-separator';
    sep.textContent = ' › ';
    breadcrumb.appendChild(sep);

    const crumb = createCrumb(link.href, link.textContent);
    breadcrumb.appendChild(crumb);
  });

  // Insert at the top of main content
  mainContent.insertBefore(breadcrumb, mainContent.firstChild);
});
