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
        // Pattern 1: Full URLs with http/https
        const patterns = [
            /(https?:\/\/[^\s"'<>]*\.m3u8[^\s"'<>]*)/g,
            /"([^"]*\.m3u8[^"]*)"/g,
            /'([^']*\.m3u8[^']*)'/g,
            /url:\s*["']?([^\s"'<>]*\.m3u8[^\s"'<>]*)["']?/g,
            /src:\s*["']?([^\s"'<>]*\.m3u8[^\s"'<>]*)["']?/g,
            /href:\s*["']?([^\s"'<>]*\.m3u8[^\s"'<>]*)["']?/g,
        ];
        
        for (const pattern of patterns) {
            let match;
            while ((match = pattern.exec(html)) !== null) {
                let url = match[1] || match[0];
                
                // Skip if too short or already has duplicates
                if (url && url.length > 5 && !m3u8Urls.includes(url)) {
                    m3u8Urls.push(url);
                }
            }
        }
        
        // Additional pattern: split by spaces and find .m3u8 files
        const words = html.split(/[\s"'<>{}[\]()]/);
        for (const word of words) {
            if (word.includes('.m3u8') && word.length > 5) {
                if (!m3u8Urls.includes(word)) {
                    m3u8Urls.push(word);
                }
            }
        }
        
    } catch (e) {
        console.error('[extract-m3u8] Parse error:', e.message);
    }
    
    // Filter valid URLs and limit to 10
    return m3u8Urls.filter(u => u && u.length > 5).slice(0, 10);
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
