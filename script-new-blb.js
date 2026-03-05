document.addEventListener("DOMContentLoaded", function () {

  const mainEl = document.querySelector("main");
  if (!mainEl) return; // just in case

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

  // function to wrap references safely within <main>
  function wrapBibleReferences(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const pattern = new RegExp("\\b(" + books.join("|") + ")\\s(\\d+):(\\d+)\\b", "g");
      const frag = document.createDocumentFragment();
      let lastIndex = 0;
      let match;

      while ((match = pattern.exec(node.textContent)) !== null) {
        if (match.index > lastIndex) {
          frag.appendChild(document.createTextNode(node.textContent.slice(lastIndex, match.index)));
        }

        const span = document.createElement("span");
        span.className = "bibleref";
        span.dataset.book = match[1];
        span.dataset.chapter = match[2];
        span.dataset.verse = match[3];
        span.textContent = match[0];

        frag.appendChild(span);
        lastIndex = match.index + match[0].length;
      }

      if (lastIndex < node.textContent.length) {
        frag.appendChild(document.createTextNode(node.textContent.slice(lastIndex)));
      }

      node.replaceWith(frag);

    } else if (node.nodeType === Node.ELEMENT_NODE) {
      node.childNodes.forEach(child => wrapBibleReferences(child));
    }
  }

  wrapBibleReferences(mainEl);

  // Tooltip code (same as before)
  const tooltip = document.createElement("div");
  tooltip.style.position = "absolute";
  tooltip.style.background = "#f7f7f7";
  tooltip.style.color = "#000";
  tooltip.style.border = "1px solid #000";
  tooltip.style.padding = "8px";
  tooltip.style.fontSize = "14px";
  tooltip.style.maxWidth = "300px";
  tooltip.style.display = "none";
  tooltip.style.zIndex = "9999";
  tooltip.style.fontFamily = "Arial, sans-serif";
  document.body.appendChild(tooltip);

  let hideTimeout;

  document.querySelectorAll(".bibleref").forEach(ref => {
    ref.addEventListener("mouseenter", async function(e){
      clearTimeout(hideTimeout);

      tooltip.style.left = (e.pageX + 10) + "px";
      tooltip.style.top = (e.pageY + 10) + "px";
      tooltip.style.display = "block";
      tooltip.innerHTML = "Loading verse...";

      const book = this.dataset.book;
      const chapter = this.dataset.chapter;
      const verse = this.dataset.verse;
      const apiURL = `https://bible-api.com/${book}+${chapter}:${verse}?translation=bbe`;
      const siteURL = `https://www.blueletterbible.org/kjv/${bookBLBMap[book]}/${chapter}/${verse}/`;

      try {
        const response = await fetch(apiURL);
        const data = await response.json();
        tooltip.innerHTML = `<strong>${data.reference} (BBE)</strong><br>${data.text}`;
      } catch {
        tooltip.innerHTML = "Verse preview unavailable.";
      }

      const link = document.createElement("a");
      link.href = siteURL;
      link.target = "_blank";
      link.textContent = "Open on Blue Letter Bible";
      link.style.display = "block";
      link.style.marginTop = "6px";
      link.style.color = "#555";
      tooltip.appendChild(link);
    });

    ref.addEventListener("mouseleave", function(){
      hideTimeout = setTimeout(() => {
        if (!tooltip.matches(":hover")) tooltip.style.display = "none";
      }, 200);
    });
  });

  tooltip.addEventListener("mouseenter", () => clearTimeout(hideTimeout));
  tooltip.addEventListener("mouseleave", () => tooltip.style.display = "none");

});