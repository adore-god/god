// blb-loader.js
window.addEventListener('load', function() {
    var blbScript = document.createElement('script');
    blbScript.src = 'https://www.blueletterbible.org/assets/scripts/blbToolTip/BLB_ScriptTagger-min.js';
    blbScript.onload = function() {
        // Configure BLB settings
        BLB.Tagger.Translation = 'BBE';
        BLB.Tagger.HyperLinks = 'hover';
        BLB.Tagger.HideTranslationAbbrev = true;
        BLB.Tagger.TargetNewWindow = true;
        BLB.Tagger.Style = 'line';
        BLB.Tagger.NoSearchTagNames = 'h1,h2,h3,h4,pre,code';
        BLB.Tagger.NoSearchClassNames = 'noTag doNotTag sidebar';
    };
    document.body.appendChild(blbScript);
});