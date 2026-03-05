document.addEventListener("DOMContentLoaded", function () {
  const mainEl = document.querySelector("main");
  if (!mainEl) return;

  // Added common abbreviations to the books array
  const books = [
    "Genesis","Gen","Ex", "Exodus","Leviticus","Lev","Numbers","Num","Deuteronomy","Deut",
    "Joshua","Jos","Judges","Jdg","Ruth","Rut","1 Samuel","1 Sam","2 Samuel","2 Sam",
    "1 Kings","1 Kgs","2 Kings","2 Kgs","1 Chronicles","1 Chr","2 Chronicles","2 Chr",
    "Ezra","Ezr","Nehemiah","Neh","Esther","Est","Job","Psalms","Psa","Proverbs","Pro",
    "Ecclesiastes","Ecc","Song of Solomon","Sng","Isaiah","Isa","Jeremiah","Jer",
    "Lamentations","Lam","Ezekiel","Ezk","Daniel","Dan","Hosea","Hos","Joel","Joe",
    "Amos","Amo","Obadiah","Oba","Jonah","Jon","Micah","Mic","Nahum","Nah","Habakkuk","Hab",
    "Zephaniah","Zep","Haggai","Hag","Zechariah","Zec","Malachi","Mal","Matthew","Mat",
    "Mark","Mrk","Luke","Luk","John","Jhn","Jn","Acts","Act",
    "Romans","Rom","1 Corinthians","1 Cor","2 Corinthians","2 Cor","Galatians","Gal",
    "Ephesians","Eph","Philippians","Php","Colossians","Col","1 Thessalonians","1 Ths",
    "2 Thessalonians","2 Ths","1 Timothy","1 Tim","2 Timothy","2 Tim","Titus","Tit",
    "Philemon","Phm","Hebrews","Heb","James","Jas","1 Peter","1 Pe","2 Peter","2 Pe",
    "1 John","1 Jn","2 John","2 Jn","3 John","3 Jn","Jude","Revelation","Rev"
  ];

  const bookBLBMap = {
    "Genesis": "gen", "Gen": "gen", "Exodus": "exo", "Ex": "exo", "John": "jhn", "Jn": "jhn", "Jhn": "jhn" 
    /* ... you can expand this map as needed for BLB links ... */
  };

  function wrapBibleReferences(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      // REVISED REGEX:
      // 1. (books)
      // 2. \s+ (space)
      // 3. (\d+) (Chapter)
      // 4. (?::(\d+)(?:-(\d+))?)? (Optional colon + verse + optional range)
      const pattern = new RegExp("\\b(" + books.join("|") + ")\\s+(\\d+)(?::(\\d+)(?:-(\\d+))?)?\\b", "gi");
      
      const content = node.textContent;
      if (!pattern.test(content)) return;

      pattern.lastIndex = 0; 
      const frag = document.createDocumentFragment();
      let lastIndex = 0;
      let match;

      while ((match = pattern.exec(content)) !== null) {
        frag.appendChild(document.createTextNode(content.slice(lastIndex, match.index)));

        const span = document.createElement("cite");
        span.className = "bibleref";
        span.style.cssText = "cursor:help; border-bottom:1px dotted #888;";
        
        span.dataset.book = match[1];
        span.dataset.chapter = match[2];
        
        // If match[3] exists, we have a verse. If not, it's a whole chapter.
        if (match[3]) {
          span.dataset.verse = match[4] ? `${match[3]}-${match[4]}` : match[3];
        } else {
          span.dataset.verse = ""; 
        }
        
        span.textContent = match[0];
        frag.appendChild(span);
        lastIndex = pattern.lastIndex;
      }

      frag.appendChild(document.createTextNode(content.slice(lastIndex)));
      node.replaceWith(frag);

    } else if (
      node.nodeType === Node.ELEMENT_NODE && 
      !["SCRIPT", "STYLE", "CITE", "A", "PRE"].includes(node.tagName) &&
      !node.classList.contains("noTag")
    ) {
      Array.from(node.childNodes).forEach(child => wrapBibleReferences(child));
    }
  }

  wrapBibleReferences(mainEl);

  // Tooltip & Fetch Logic
  const tooltip = document.createElement("div");
  Object.assign(tooltip.style, {
    position: "absolute", background: "#fff", color: "#333", border: "1px solid #ccc",
    padding: "12px", fontSize: "14px", display: "none", zIndex: "10000",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)", borderRadius: "4px"
  });
  document.body.appendChild(tooltip);

  mainEl.addEventListener("mouseover", async function(e) {
    const ref = e.target.closest(".bibleref");
    if (!ref) return;

    const rect = ref.getBoundingClientRect();
    tooltip.style.left = (window.scrollX + rect.left) + "px";
    tooltip.style.top = (window.scrollY + rect.bottom + 8) + "px";
    tooltip.style.display = "block";
    tooltip.innerHTML = "Loading...";

    const { book, chapter, verse } = ref.dataset;
    // Build query: "John 2" or "John 2:1-5"
    const query = verse ? `${book} ${chapter}:${verse}` : `${book} ${chapter}`;
    const apiURL = `https://bible-api.com/${encodeURIComponent(query)}?translation=bbe`;

    try {
      const response = await fetch(apiURL);
      const data = await response.json();
      tooltip.innerHTML = data.text ? `<strong>${data.reference}</strong><br>${data.text}` : "Not found";
    } catch {
      tooltip.innerHTML = "Error loading preview.";
    }
  });

  mainEl.addEventListener("mouseout", () => { tooltip.style.display = "none"; });
});
