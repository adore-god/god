(function initBLBTagger() {
    if (window.BLB && BLB.Tagger) {
        // Apply your settings
        BLB.Tagger.Translation = 'BBE';
        BLB.Tagger.HyperLinks = 'hover'; // 'all', 'none', 'hover'
        BLB.Tagger.HideTranslationAbbrev = true;
        BLB.Tagger.TargetNewWindow = true;
        BLB.Tagger.Style = 'line'; // 'line' or 'par'
        BLB.Tagger.NoSearchTagNames = 'h1,h2'; // HTML element list
        BLB.Tagger.NoSearchClassNames = 'noTag doNotTag sidebar'; // CSS class list

        // Re-init with the new settings
        BLB.Tagger.init();
        console.log('✅ BLB Tagger re-initialised with custom settings.');
    } else {
        // Try again in 200ms until BLB is available
        setTimeout(initBLBTagger, 200);
    }
})();
