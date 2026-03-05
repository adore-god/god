document.addEventListener("DOMContentLoaded", function () {
  const mainEl = document.querySelector("main");
  if (!mainEl) return;

  const books = [
    "Genesis","Exodus","Leviticus","Numbers","Deuteronomy",
    "Joshua","Judges","Ruth","1 Samuel","2 Samuel","1 Kings","2 Kings",
    "1 Chronicles","2 Chronicles","Ezra","Nehemiah","Esther","Job",
    "Psalms","Proverbs","Ecclesiastes","Song of Solomon","Isaiah",
    "Jeremiah","Lamentations","Ezekiel","Daniel","Hosea","Joel","Amos",
    "Obadiah","Jonah","Micah","Nahum","Habakkuk","Zephaniah","Haggai",
    "Zechariah","Malachi","Matthew","Mark","Luke","John","Acts",
    "Romans","1 Corinthians","2 Corinthians","Galatians","Ephesians",
    "Philippians","Colossians","1 Thessalonians","2 Thessalonians",
    "1 Timothy","2 Timothy","Titus","Philemon","Hebrews","James",
    "1 Peter","2 Peter","1 John","2 John","3 John","Jude","Revelation"
  ];

  const bookBLBMap = {
    "Genesis": "gen", "Exodus": "exo", "Leviticus": "lev", "Numbers": "num",
    "Deuteronomy": "deut", "Joshua": "jos", "Judges": "jdg", "Ruth": "rut",
    "1 Samuel": "1-sam", "2 Samuel": "2-sam", "1 Kings": "1-kgs", "2 Kings": "2-kgs",
    "1 Chronicles": "1-chr", "2 Chronicles": "2-chr", "Ezra": "ezr", "Nehemiah": "neh",
    "Esther": "est", "Job": "job", "Psalms": "psa", "Proverbs": "pro", "Ecclesiastes": "ecc",
    "Song of Solomon": "sng", "Isaiah": "isa", "Jeremiah": "jer", "Lamentations": "lam",
    "Ezekiel": "ezk", "Daniel": "dan", "Hosea": "hos", "Joel": "joe", "Amos": "amo",
    "Obadiah": "oba", "Jonah": "jon", "Micah": "mic", "Nahum": "nah", "Habakkuk": "hab",
    "Zephaniah": "zep", "Haggai": "hag", "Zechariah": "zec", "Malachi": "mal",
    "Matthew": "mat", "Mark": "mrk", "Luke": "luk", "John": "jhn", "Acts": "act",
    "Romans": "rom", "1 Corinthians": "1-cor", "2 Corinthians": "2-cor", "Galatians": "gal",
    "Ephesians": "eph", "Philippians": "php", "Colossians": "col", "1 Thessalonians": "1-ths",
    "2 Thessalonians": "2-ths", "1 Timothy": "1-tim", "2 Timothy": "2-tim", "Titus": "tit",
    "Philemon": "phm", "Hebrews": "heb", "James": "jas", "1 Peter": "1-pe", "2 Peter": "2-pe",
    "1 John": "1-jn", "2 John": "2-jn", "3 John": "3-jn", "Jude": "jude", "Revelation": "rev"
  };

  function wrapBibleReferences(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      // Regex updated to handle book names with numbers correctly
      const pattern = new RegExp("\\b(" + books.join("|") + ")\\s(\\d+):(\\d+)\\b", "g");
      const content = node.textContent;
      if (!pattern.test(content)) return;

      pattern.lastIndex = 0; // reset regex state
      const frag = document.createDocumentFragment();
      let lastIndex = 0;
      let match;

      while ((match = pattern.exec(content)) !== null) {
        // Append text before the match
        frag.appendChild(document.createTextNode(content.slice(lastIndex, match.index)));

        const span = document.createElement("cite");
        span.className = "bibleref";
        span.style.cursor = "help";
        span.style.borderBottom = "1px dotted #888";
        span.dataset.book = match[1];
        span.dataset.chapter = match[2];
        span.dataset.verse = match[3];
        span.textContent = match[0];

        frag.appendChild(span);
        lastIndex = pattern.lastIndex;
      }

      frag.appendChild(document.createTextNode(content.slice(lastIndex)));
      node.replaceWith(frag);

    } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== "SCRIPT" && node.tagName !== "STYLE" && node.tagName !== "CITE") {
      // Convert childNodes to a static array so the loop isn't broken by DOM changes
      Array.from(node.childNodes).forEach(child => wrapBibleReferences(child));
    }
  }

  // 1. Run the wrapper
  wrapBibleReferences(mainEl);

  // 2. Setup Tooltip
  const tooltip = document.createElement("div");
  Object.assign(tooltip.style, {
    position: "absolute",
    background: "#f7f7f7",
    color: "#000",
    border: "1px solid #000",
    padding: "12px",
    fontSize: "14px",
    maxWidth: "300px",
    display: "none",
    zIndex: "9999",
    boxShadow: "2px 2px 10px rgba(0,0,0,0.2)",
    fontFamily: "sans-serif"
  });
  document.body.appendChild(tooltip);

  let hideTimeout;

  // 3. Use Event Delegation (Better for dynamic elements)
  mainEl.addEventListener("mouseover", async function(e) {
    const ref = e.target.closest(".bibleref");
    if (!ref) return;

    clearTimeout(hideTimeout);
    
    // Positioning
    const rect = ref.getBoundingClientRect();
    tooltip.style.left = (window.scrollX + rect.left) + "px";
    tooltip.style.top = (window.scrollY + rect.bottom + 5) + "px";
    tooltip.style.display = "block";
    tooltip.innerHTML = "<em>Loading verse...</em>";

    const { book, chapter, verse } = ref.dataset;
    const apiURL = `https://bible-api.com/${book}+${chapter}:${verse}?translation=bbe`;
    const blbBook = bookBLBMap[book] || book.toLowerCase().replace(/\s/g, '-');
    const siteURL = `https://www.blueletterbible.org/kjv/${blbBook}/${chapter}/${verse}/`;

    try {
      const response = await fetch(apiURL);
      const data = await response.json();
      tooltip.innerHTML = `<strong>${data.reference} (BBE)</strong><p style="margin:5px 0">${data.text}</p>`;
    } catch {
      tooltip.innerHTML = "Verse preview unavailable.";
    }

    const link = document.createElement("a");
    link.href = siteURL;
    link.target = "_blank";
    link.textContent = "View on Blue Letter Bible →";
    link.style.cssText = "display:block; font-size:11px; color:#0066cc; text-decoration:none; margin-top:8px; border-top:1px solid #ddd; padding-top:5px;";
    tooltip.appendChild(link);
  });

  mainEl.addEventListener("mouseout", function(e) {
    if (e.target.closest(".bibleref")) {
      hideTimeout = setTimeout(() => {
        if (!tooltip.matches(":hover")) tooltip.style.display = "none";
      }, 300);
    }
  });

  tooltip.addEventListener("mouseenter", () => clearTimeout(hideTimeout));
  tooltip.addEventListener("mouseleave", () => tooltip.style.display = "none");
});
