document.addEventListener("DOMContentLoaded", async function() {
  const pageTitle = document.title || "Default Headline";
  const currentUrl = window.location.href;
  const siteOrigin = window.location.origin;

  // --- 1. DATA COLLECTION ---
  const firstImg = document.querySelector('main img, body img');
  const imageUrl = firstImg ? new URL(firstImg.src, siteOrigin).href : siteOrigin + "/favicon.png";

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
          return new Date(lastmod).toISOString();
        }
      }
      return new Date().toISOString();
    } catch (e) {
      console.error("Error fetching sitemap lastmod:", e);
      return new Date().toISOString();
    }
  }

  const dateModified = await getLastModifiedFromSitemap();

  // --- 2. BREADCRUMBLIST LOGIC ---
  let breadcrumbLd = null;
  const labelContainer = document.querySelector('p.label-links');

  if (labelContainer) {
    const firstTopicLink = labelContainer.querySelector('a');

    if (firstTopicLink) {
      const topicName = firstTopicLink.textContent.trim();
      const topicRelativeUrl = firstTopicLink.getAttribute('href');
      const topicAbsoluteUrl = new URL(topicRelativeUrl, siteOrigin).href;

      breadcrumbLd = {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": siteOrigin + "/" },
          { "@type": "ListItem", "position": 2, "name": topicName, "item": topicAbsoluteUrl },
          { "@type": "ListItem", "position": 3, "name": pageTitle }
        ]
      };
    }
  }

  // --- 3. SITE-WIDE SCHEMAS ---
  
  // Organization Schema (E-A-T and Entity Definition)
  const organizationLd = {
    "@type": "Organization",
    "name": "God - The Way",
    "url": siteOrigin + "/",
    "logo": {
      "@type": "ImageObject",
      "url": siteOrigin + "/favicon.png"
    },
    "description": "Foundational biblical teaching and spiritual content focused on understanding the true nature of God and Man.",
    "sameAs": [
      siteOrigin + "/",
      "https://www.tiktok.com/@god.thway.uk",
      "https://hnnh.studio/",
      "https://hnnh.studio/about.html" 
    ]
  };

  // WebSite Schema (for Sitelinks Search Box)
  const webSiteLd = {
    "@type": "WebSite",
    "url": siteOrigin + "/",
    "potentialAction": {
      "@type": "SearchAction",
      // IMPORTANT: Verify if your site uses '?q=' for search queries!
      "target": siteOrigin + "/search?q={search_term_string}", 
      "query-input": "required name=search_term_string"
    }
  };
  
  // --- 4. CONCEPT ENTITY DEFINITION ---
  
  // The specific doctrine/theory your content is ABOUT
  const lawOfAssumptionConcept = {
    "@type": ["CreativeWork", "Thing"], 
    "name": "Law of Assumption",
    // Adding the specific context is optional but helps Google understand the entity
    "description": "Biblical doctrine regarding the power of imagination and consciousness, as taught by Neville Goddard."
  };


  // --- 5. ASSEMBLE FINAL JSON-LD (@graph) ---

  const blogPostingLd = {
    "@type": "BlogPosting",
    "mainEntityOfPage": { "@type": "WebPage", "@id": currentUrl },
    "headline": pageTitle,
    "image": imageUrl,
    "dateModified": dateModified, 
    
    // Explicitly link the article to the Law of Assumption concept
    "about": lawOfAssumptionConcept, 
    
    "author": { "@type": "Person", "name": "HNNH", "url": siteOrigin + "/about_13.html" },
    // Use the comprehensive Organization definition
    "publisher": organizationLd 
  };

  const graph = [
    organizationLd,
    webSiteLd,
    blogPostingLd 
  ];
  
  if (breadcrumbLd) {
    graph.push(breadcrumbLd);
  }

  const finalJsonLd = {
    "@context": "https://schema.org",
    "@graph": graph
  };
  
  // --- 6. INJECT JSON-LD ---
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
