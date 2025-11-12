document.addEventListener("DOMContentLoaded", () => {
  const currentURL = window.location.href;

  // Pages to exclude
  const excludeURLs = [
    'https://god.thway.uk/',            // index page
    'https://god.thway.uk/about_13.html',
    'https://god.thway.uk/series-links.html',
    'https://god.thway.uk/search.html',
  ];

  // Exit if current URL is in the exclude list
  if (excludeURLs.includes(currentURL)) return;

  // -------------------- Share Button --------------------
  const button = document.querySelector(".share-button");
  const menu = document.getElementById("share-menu");
  if (button && menu) {
    const pageUrl = encodeURIComponent(currentURL);
    const pageTitle = encodeURIComponent(document.title);

    const twitter = document.getElementById("share-twitter");
    if (twitter) twitter.href = `https://twitter.com/intent/tweet?url=${pageUrl}&text=${pageTitle}`;

    const facebook = document.getElementById("share-facebook");
    if (facebook) facebook.href = `https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`;

    const copyButton = document.getElementById("share-copy");
    if (copyButton) {
      copyButton.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(currentURL);
          alert("Link copied to clipboard!");
        } catch (err) {
          console.error("Failed to copy:", err);
        }
        menu.style.display = "none";
      });
    }

    button.addEventListener("click", () => {
      menu.style.display = menu.style.display === "block" ? "none" : "block";
    });

    document.addEventListener("click", (e) => {
      if (!button.contains(e.target) && !menu.contains(e.target)) {
        menu.style.display = "none";
      }
    });
  }

  // -------------------- Breadcrumb --------------------
  const labelLinks = document.querySelectorAll('.label-links a');
  const mainContent = document.querySelector('main.content');
  if (!mainContent) return;

  const breadcrumb = document.createElement('nav');
  breadcrumb.className = 'breadcrumb';
  breadcrumb.setAttribute('aria-label', 'Breadcrumb');

  function createCrumb(href, text) {
    const a = document.createElement('a');
    a.href = href;
    a.textContent = text;
    a.classList.add('noTag');
    return a;
  }

  breadcrumb.appendChild(createCrumb('https://god.thway.uk', 'Home'));

  const sep1 = document.createElement('span');
  sep1.className = 'breadcrumb-separator';
  sep1.textContent = ' › ';
  breadcrumb.appendChild(sep1);

  const pageTitle = document.querySelector('h1')?.textContent || document.title;
  const currentPage = document.createElement('span');
  currentPage.textContent = pageTitle;
  currentPage.classList.add('noTag');
  breadcrumb.appendChild(currentPage);

  labelLinks.forEach(link => {
    const sep = document.createElement('span');
    sep.className = 'breadcrumb-separator';
    sep.textContent = ' › ';
    breadcrumb.appendChild(sep);

    const crumb = createCrumb(link.href, link.textContent);
    breadcrumb.appendChild(crumb);
  });

  mainContent.insertBefore(breadcrumb, mainContent.firstChild);
});
