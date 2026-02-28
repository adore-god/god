
document.addEventListener('DOMContentLoaded', function() {
    // Your settings now wait for the HTML to be ready
    BLB.Tagger.Translation = 'BBE';
    BLB.Tagger.HyperLinks = 'hover';
    BLB.Tagger.HideTranslationAbbrev = true;
    BLB.Tagger.TargetNewWindow = true;
    BLB.Tagger.Style = 'line';
    BLB.Tagger.NoSearchTagNames = 'h1,h2,h3,h4,pre,code';
    BLB.Tagger.NoSearchClassNames = 'noTag doNotTag sidebar';
});
