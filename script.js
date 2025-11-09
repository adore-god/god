document.addEventListener("DOMContentLoaded", async function() {
  const pageTitle = document.title || "Default Headline";
  const currentUrl = window.location.href;
  const siteOrigin = window.location.origin;

  // Define the fixed "Genesis Foundational Principles" link and URL for easy comparison
  const genesisName = "Genesis Foundational Principles";
  const genesisUrl = siteOrigin + "/genesis-foundational-principles.html"; 
  
  // --- 1. DATA COLLECTION (UNCHANGED) ---
  const firstImg = document.querySelector('main.content img');
  const imageUrl = firstImg ? new URL(firstImg.src, siteOrigin).href : siteOrigin + "/images/wp/god-theway-uk.webp";

  // Function to get lastmod from sitemap.xml (UNCHANGED)
  async function getLastModifiedFromSitemap() {
    try {
      const sitemapUrl = siteOrigin + "/sitemap.xml";
      const response = await fetch(sitemapUrl);
      const text = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, "application/xml");
      
      const urls = xmlDoc.getElementsByTagName("url");
      for (let i = 0; i < urls.length; i++) {
        const loc = urls[i].getElementsByTagName("loc")[0]?.textContent;
        const lastmod = urls[i].getElementsByTagName("lastmod")[0]?.textContent;
        if (loc === currentUrl && lastmod) {
          return lastmod; // Return string for direct use
        }
      }
      return new Date().toISOString();
    } catch (e) {
      console.error("Error fetching sitemap lastmod:", e);
      return new Date().toISOString();
    }
  }

  const dateModified = await getLastModifiedFromSitemap();

  // --- NEW STEP: INJECT THE DATE INTO THE HEAD (UNCHANGED) ---
  const dateMeta = document.createElement('meta');
  dateMeta.setAttribute('name', 'content-last-modified');
  dateMeta.setAttribute('content', dateModified);
  document.head.appendChild(dateMeta);
  // --- END NEW STEP ---
  
  // --- 2. BREADCRUMBLIST LOGIC - **UPDATED** ---
  let breadcrumbLd = null;
  const labelContainer = document.querySelector('p.label-links');

  // **NEW LOGIC START: Check if the current page IS the Genesis Foundational Principles page**
  if (currentUrl === genesisUrl) {
    // 2-LEVEL BREADCRUMB: Home -> Genesis Foundational Principles
    breadcrumbLd = {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": siteOrigin + "/" },
        { "@type": "ListItem", "position": 2, "name": genesisName } // Current page (no item URL needed)
      ]
    };
  } else if (labelContainer) {
  // **NEW LOGIC END: Continue with existing 4-level logic for child pages**
  // This runs ONLY if the current page is NOT the main Genesis page.

    const firstTopicLink = labelContainer.querySelector('a');

    if (firstTopicLink) {
      const topicName = firstTopicLink.textContent.trim();
      const topicRelativeUrl = firstTopicLink.getAttribute('href');
      const topicAbsoluteUrl = new URL(topicRelativeUrl, siteOrigin).href;

      // 4-LEVEL BREADCRUMB: Home -> Genesis Parent -> Dynamic Topic -> Current Page
      breadcrumbLd = {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": siteOrigin + "/" },
          { "@type": "ListItem", "position": 2, "name": genesisName, "item": genesisUrl }, // Fixed Parent
          { "@type": "ListItem", "position": 3, "name": topicName, "item": topicAbsoluteUrl }, // Dynamic Topic
          { "@type": "ListItem", "position": 4, "name": pageTitle } // Current Page
        ]
      };
    }
  }
  // --- END BREADCRUMBLIST LOGIC ---

  // --- 3. SITE-WIDE SCHEMAS - UNCHANGED ---
  
  const organizationLd = { 
    "@type": "Organization", 
    "name": "God - The Way", 
    "url": siteOrigin + "/", 
    "logo": { "@type": "ImageObject", "url": siteOrigin + "/images/wp/god-theway-uk.webp" },
    "description": "Foundational biblical teaching and spiritual content focused on understanding the nature and relationship between God and Man in Scripture.",
    "sameAs": [ siteOrigin + "/", "https://www.tiktok.com/@god.thway.uk", "https://hnnh.studio/", "https://hnnh.studio/about.html" ]
  };

  const webSiteLd = {
    "@type": "WebSite",
    "url": siteOrigin + "/",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://www.google.com/search?q=site:god.thway.uk+{search_term_string}", 
      "query-input": "required name=search_term_string"
    }
  };
  
  // --- 4. CONCEPT ENTITY DEFINITION - UNCHANGED ---
  const lawOfAssumptionConcept = {
    "@type": ["CreativeWork", "Thing"], 
    "name": "Law of Assumption",
    "description": "Biblical doctrine regarding the power of imagination and consciousness, as taught by Neville Goddard."
  };

  const holyBibleSource = {
      "@type": "CreativeWork",
      "@id": siteOrigin + "/source/holy-bible", 
      "name": "The Holy Bible", 
      "author": { "@type": "Person", "name": "Various Prophets and Apostles" },
      "inLanguage": "en",
      "description": "The foundational religious and spiritual text used as the primary source for all teaching on this site."
  };
  // ------------------------------------------------------------------

  // --- 5. ASSEMBLE FINAL JSON-LD (@graph) - UNCHANGED ---

  const blogPostingLd = {
    "@type": "BlogPosting",
    "mainEntityOfPage": { "@type": "WebPage", "@id": currentUrl },
    "headline": pageTitle,
    "image": imageUrl,
    "dateModified": dateModified, 
    "about": lawOfAssumptionConcept, 
    "isBasedOn": { "@id": siteOrigin + "/source/holy-bible" },
    "author": { "@type": "Person", "name": "HNNH", "url": siteOrigin + "/about_13.html" },
    "publisher": organizationLd 
  };

  const graph = [ organizationLd, webSiteLd, holyBibleSource, blogPostingLd ];
  
  if (breadcrumbLd) {
    graph.push(breadcrumbLd);
  }

  const finalJsonLd = {
    "@context": "https://schema.org",
    "@graph": graph
  };
  
  // --- 6. INJECT JSON-LD - UNCHANGED ---
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.text = JSON.stringify(finalJsonLd, null, 2);
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
