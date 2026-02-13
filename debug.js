// Debug script to fetch and inspect HTML
const slug = 'pertaruhan-cinta-2026-02-13-260201200212';
const url = `https://play.ngidolihub.my.id/?slug=${slug}`;

fetch(url, {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/121.0.0.0',
        'Referer': 'https://ngidolihub.or.id/',
    }
})
.then(r => r.text())
.then(html => {
    console.log('HTML Length:', html.length);
    console.log('\n=== Searching for .m3u8 ===');
    
    // Find all .m3u8 mentions
    const m3u8Matches = html.match(/[^\s"'<>]*\.m3u8[^\s"'<>]*/g);
    if (m3u8Matches) {
        console.log('Found .m3u8 matches:', m3u8Matches.length);
        m3u8Matches.slice(0, 10).forEach(m => console.log('  -', m));
    }
    
    // Find context around .m3u8
    console.log('\n=== Context around .m3u8 ===');
    const m3u8Index = html.indexOf('.m3u8');
    if (m3u8Index > -1) {
        const start = Math.max(0, m3u8Index - 200);
        const end = Math.min(html.length, m3u8Index + 200);
        console.log(html.substring(start, end));
        console.log('\n---');
    }
    
    // Search for URLs
    console.log('\n=== URLs in HTML ===');
    const urls = html.match(/https?:\/\/[^\s"'<>]+/g);
    if (urls) {
        console.log('Found URLs:', urls.length);
        urls.filter(u => u.includes('m3u8') || u.includes('stream') || u.includes('play')).forEach(u => {
            console.log('  -', u.substring(0, 100));
        });
    }
    
    // Search for 'src=' or 'url='
    console.log('\n=== src/url attributes ===');
    const srcMatches = html.match(/(?:src|url|href)\s*[=:]\s*["']([^"'<>]+)["']/g);
    if (srcMatches) {
        console.log('Found attributes:', srcMatches.length);
        srcMatches.filter(m => m.includes('m3u8')).forEach(m => {
            console.log('  -', m.substring(0, 100));
        });
    }
    
    // Save snippet for inspection
    const fs = require('fs');
    fs.writeFileSync('html_sample.txt', html.substring(0, 5000));
    console.log('\n✓ Saved first 5000 chars to html_sample.txt');
})
.catch(e => console.error('Error:', e.message));
