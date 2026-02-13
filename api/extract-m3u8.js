// api/extract-m3u8.js - Vercel Serverless Function
// Extract M3U8 dari HTML ngidolihub

const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
];

function getRandomUserAgent() {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

function extractM3U8FromHTML(html) {
    const m3u8Urls = [];
    
    try {
        // Pattern 1: .m3u8 dalam string
        const pattern1 = /"([^"]*\.m3u8[^"]*)"/g;
        let match;
        while ((match = pattern1.exec(html)) !== null) {
            const url = match[1];
            if (url.includes('http') && !m3u8Urls.includes(url)) {
                m3u8Urls.push(url);
            }
        }
        
        // Pattern 2: .m3u8 dengan single quotes
        const pattern2 = /'([^']*\.m3u8[^']*)'/g;
        while ((match = pattern2.exec(html)) !== null) {
            const url = match[1];
            if (url.includes('http') && !m3u8Urls.includes(url)) {
                m3u8Urls.push(url);
            }
        }
    } catch (e) {
        console.error('[extract-m3u8] Parse error:', e.message);
    }
    
    return m3u8Urls;
}

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    
    try {
        const { slug, url } = req.query;
        
        console.log('[extract-m3u8] Request - slug:', slug, 'url:', url ? 'yes' : 'no');
        
        let ngidoliUrl = url || `https://play.ngidolihub.my.id/?slug=${slug}`;
        
        if (!slug && !url) {
            return res.status(400).json({ 
                success: false,
                error: 'Missing slug or url parameter'
            });
        }
        
        console.log('[extract-m3u8] Fetching:', ngidoliUrl);
        
        // Fetch HTML
        let html;
        try {
            const response = await fetch(ngidoliUrl, {
                headers: {
                    'User-Agent': getRandomUserAgent(),
                    'Accept': 'text/html',
                    'Referer': 'https://ngidolihub.or.id/',
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            html = await response.text();
            console.log('[extract-m3u8] HTML fetched, length:', html.length);
        } catch (fetchErr) {
            console.error('[extract-m3u8] Fetch error:', fetchErr.message);
            return res.status(500).json({
                success: false,
                error: 'Failed to fetch: ' + fetchErr.message,
                debug: 'Check if URL is accessible'
            });
        }
        
        // Extract m3u8
        const m3u8URLs = extractM3U8FromHTML(html);
        console.log('[extract-m3u8] Found URLs:', m3u8URLs.length);
        
        if (m3u8URLs.length === 0) {
            console.warn('[extract-m3u8] No M3U8 found, returning mock');
            return res.status(200).json({
                success: false,
                error: 'No M3U8 URL found in HTML',
                debug: {
                    htmlLength: html.length,
                    slug: slug,
                    url: ngidoliUrl
                }
            });
        }
        
        return res.status(200).json({
            success: true,
            m3u8_url: m3u8URLs[0],
            m3u8_urls: m3u8URLs,
            count: m3u8URLs.length
        });
        
    } catch (error) {
        console.error('[extract-m3u8] Exception:', error.message);
        console.error('[extract-m3u8] Stack:', error.stack);
        
        return res.status(500).json({
            success: false,
            error: error.message,
            type: error.constructor.name,
            debug: 'Server error - check logs'
        });
    }
};
