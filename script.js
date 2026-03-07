

(function() {
    // --- SETTINGS ---
    // Change this to your class name (e.g., '.my-content-class')
    const targetSelector = '.label-links'; 
    const position = 'beforeend'; // Options: 'beforebegin', 'afterbegin', 'beforeend', 'afterend'
    // ----------------

    function injectList() {
        const labelContainer = document.querySelector('.label-links');
        const targetElement = document.querySelector(targetSelector);
        
        // Don't run if already injected or if elements are missing
        if (!labelContainer || !targetElement || document.getElementById('injected-series-list')) return;

        const exclude = ["about-author.html", "god.thway.uk/", "genesis-foundational-principles.html"];
        const map = window.labelMap;
        const container = document.createElement('div');
        container.id = 'injected-series-list';
        
        targetElement.insertAdjacentElement(position, container);

        const allLinks = labelContainer.querySelectorAll('a');
        allLinks.forEach(link => {
            if (exclude.some(ex => link.href.includes(ex))) return;

            let matches = [];
            for (let path in map) {
                if (map[path].series && link.href.endsWith(map[path].series.split('/').pop())) {
                    matches.push({ path: path, title: map[path].title });
                }
            }

            if (matches.length > 0) {
                const section = document.createElement('div');
                section.innerHTML = '<h3>More in ' + link.textContent + '</h3><ul></ul>';
                const ul = section.querySelector('ul');
                matches.forEach(item => {
                    const li = document.createElement('li');
                    const a = document.createElement('a');
                    a.href = item.path;
                    a.textContent = item.title;
                    li.appendChild(a);
                    ul.appendChild(li);
                });
                container.appendChild(section);
            }
        });
    }

    // 1. Try running immediately
    injectList();

    // 2. Observer: Watch for dynamic content changes in case it loads late
    const observer = new MutationObserver(injectList);
    observer.observe(document.body, { childList: true, subtree: true });
})();


 




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
 // Replace your current toggle logic with this:
button.addEventListener("click", (e) => {
  e.stopPropagation(); // Prevents the "click outside" logic from firing immediately
  const isVisible = window.getComputedStyle(menu).display === "block";
  menu.style.display = isVisible ? "none" : "block";
});

  
    // Open sidebar from inline links
  document.querySelectorAll('.open-sidebar').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation(); // 🔑 THIS is the missing piece
      const sidebarToggle = document.getElementById('sidebar-toggle');
      if (sidebarToggle) sidebarToggle.checked = true;
    });
  });
  
});





document.addEventListener('DOMContentLoaded', () => {
  // Find all .label-links containers
  document.querySelectorAll('.share-dropdown').forEach(linkContainer => {

    // Prevent adding multiple buttons/modals
    if (linkContainer.previousElementSibling && linkContainer.previousElementSibling.classList.contains('like-btn')) return;

    // Create Like Button
    const likeBtn = document.createElement('button');
    likeBtn.id = 'openLikeModal';
    likeBtn.className = 'like-btn';
    likeBtn.textContent = 'Like';

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
          src="https://docs.google.com/forms/d/e/1FAIpQLSfKjCBylt6GboFAnEPqZmfH3PmB3yEJqN87RTsBs2_WTxvfBw/viewform?usp=pp_url&entry.1015073811=Like"
          width="100%" 
          height="380" 
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




document.addEventListener("DOMContentLoaded", function () {
    const footer = document.querySelector(".start-here");

    if (footer) {
        footer.insertAdjacentHTML(
            "afterend",
            '<div id="Verse-Link-Container"><img loading="lazy" width="398" height="398" class="key-icon" alt="Lingua Divina Bible Interpreter Key Logo" src="../images/icons/bible-key-lingua-divina-logo.webp"><div id="VerseLinkBox"><a id="translator-link" href="https://god.thway.uk/el/yhvh-ehyeh-linguistic-framework.html">NEW BIBLE PASSAGE AND VERSE TRANSLATOR</a></div></div>'
        );

        const link = document.getElementById("translator-link");

        link.addEventListener("click", function (e) {
            // Prevent immediate navigation
            e.preventDefault();

            const href = link.href;

            // Fire GA4 event
            if (typeof gtag === "function") {
                gtag("event", "Bible_Translator_Link", {
                    event_category: "Button",
                    event_label: "Bible_Translator_Link",
                });
            }

            setTimeout(function () {
                window.location.href = href;
            }, 150); // 150ms is usually enough
        });
    }
});