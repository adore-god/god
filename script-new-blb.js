document.addEventListener("DOMContentLoaded", function () {

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

  const pattern = new RegExp("\\b(" + books.join("|") + ")\\s(\\d+):(\\d+)\\b","g");

  // Wrap references in a span only (no <a>)
  document.body.innerHTML = document.body.innerHTML.replace(pattern, function(match, book, chapter, verse){
    const bookSlug = book.toLowerCase().replace(" ","_");
    return `<span class="bibleref" data-book="${bookSlug}" data-chapter="${chapter}" data-verse="${verse}">${match}</span>`;
  });

  // Create tooltip
  const tooltip = document.createElement("div");
  tooltip.style.position = "absolute";
  tooltip.style.background = "#fff";
  tooltip.style.border = "1px solid #ccc";
  tooltip.style.padding = "10px";
  tooltip.style.maxWidth = "300px";
  tooltip.style.fontSize = "14px";
  tooltip.style.display = "none";
  tooltip.style.zIndex = "9999";
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
      const siteURL = `https://www.blueletterbible.org/kjv/${book}/${chapter}/${verse}`;

      try {
        const response = await fetch(apiURL);
        const data = await response.json();

        tooltip.innerHTML = `<strong>${data.reference} (BBE)</strong><br>${data.text}`;
      } catch {
        tooltip.innerHTML = "Verse preview unavailable.";
      }

      // Add link dynamically
      const link = document.createElement("a");
      link.href = siteURL;
      link.target = "_blank";
      link.textContent = "Open on website";
      link.style.display = "block";
      link.style.marginTop = "8px";
      tooltip.appendChild(link);
    });

    ref.addEventListener("mouseleave", function(){
      hideTimeout = setTimeout(() => {
        if (!tooltip.matches(":hover")) {
          tooltip.style.display = "none";
        }
      }, 200);
    });

  });

  // Keep tooltip visible if hovering over it
  tooltip.addEventListener("mouseenter", () => clearTimeout(hideTimeout));
  tooltip.addEventListener("mouseleave", () => tooltip.style.display = "none");

});