
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







document.addEventListener('DOMContentLoaded', () => {
  // Find all .label-links containers
  document.querySelectorAll('.label-links').forEach(linkContainer => {

    // Prevent adding multiple buttons/modals
    if (linkContainer.previousElementSibling && linkContainer.previousElementSibling.classList.contains('like-btn')) return;

    // Create Like Button
    const likeBtn = document.createElement('button');
    likeBtn.id = 'openLikeModal';
    likeBtn.className = 'like-btn';
    likeBtn.textContent = '🧡';

    // Insert button before the .label-links container
    linkContainer.insertAdjacentElement('beforebegin', likeBtn);

    // Create Modal Overlay
    const modal = document.createElement('div');
    modal.id = 'likeModal';
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close-btn" id="closeLikeModal">&times;</span>
        <iframe 
          src="https://docs.google.com/forms/d/e/1FAIpQLSfKjCBylt6GboFAnEPqZmfH3PmB3yEJqN87RTsBs2_WTxvfBw/viewform?embedded=true"
          width="100%" 
          height="330" 
          style="border:none; overflow:hidden; border-radius:8px;"
          scrolling="yes"
          loading="lazy">
        </iframe>
      </div>
    `;
    linkContainer.insertAdjacentElement('beforebegin', modal);

    // Grab references for event handlers
    const openBtn = likeBtn;
    const closeBtn = modal.querySelector('.close-btn');

    openBtn.onclick = () => {
      modal.style.display = 'block';
    };

    closeBtn.onclick = () => {
      modal.style.display = 'none';
    };

    // Close modal if clicking outside content
    window.onclick = (event) => {
      if (event.target === modal) {
        modal.style.display = 'none';
      }
    };
  });
});
