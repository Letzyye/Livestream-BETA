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
        // Strategy 1: Look for m3u8 URLs directly
        const patterns = [
            // Full URLs
            /(https?:\/\/[^\s"'<>]*\.m3u8[^\s"'<>]*)/gi,
            
            // In quotes
            /["']([^"'<>]*\.m3u8[^"'<>]*)["']/g,
            
            // data attributes
            /data-?(?:m3u8|src|url|playlist)\s*[:=]\s*["']?([^"'<>]*\.m3u8[^"'<>]*)["']?/gi,
            
            // In object notation
            /(?:m3u8|source|url|playlist)\s*[:=]\s*["']?([^"'<>]*\.m3u8[^"'<>]*)["']?/gi,
            
            // Inside JSON
            /"(?:m3u8|source|url|playlist)"\s*:\s*"([^"]*\.m3u8[^"]*)"/gi,
        ];
        
        for (const pattern of patterns) {
            let match;
            while ((match = pattern.exec(html)) !== null) {
                let url = match[1] || match[0];
                
                // Clean up and validate
                if (url && url.length > 5 && !m3u8Urls.includes(url)) {
                    // Remove common non-URL characters
                    url = url.split('\\')[0]; // Remove backslashes
                    
                    if (url.includes('m3u8')) {
                        m3u8Urls.push(url);
                    }
                }
            }
        }
        
        // Strategy 2: Search for URL patterns containing m3u8 anywhere
        const allUrls = html.match(/(https?:\/\/[^\s"'<>]*[^\s"'<>,.;:])/g) || [];
        for (const url of allUrls) {
            if (url.includes('m3u8') && !m3u8Urls.includes(url)) {
                m3u8Urls.push(url);
            }
        }
        
        // Strategy 3: Look for encoded or base64 URLs
        const base64Pattern = /"?(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?"?/g;
        let match;
        while ((match = base64Pattern.exec(html)) !== null) {
            try {
                const decoded = atob(match[0]);
                if (decoded.includes('m3u8')) {
                    m3u8Urls.push(decoded);
                }
            } catch (e) {
                // Not base64, skip
            }
        }
        
        return m3u8Urls
            .filter(u => u && u.length > 5 && u.includes('m3u8'))
            .filter((v, i, a) => a.indexOf(v) === i) // Remove duplicates
            .slice(0, 10);
    } catch (error) {
        console.error('[extractM3U8FromHTML] Error:', error.message);
        return [];
    }
}

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
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
            console.warn('[extract-m3u8] No M3U8 found, HTML sample:');
            
            // Log first 2000 chars untuk inspection
            const sample = html.substring(0, 2000);
            console.log(sample);
            
            // Also log any .m3u8 mentions
            const m3u8Mentions = html.match(/[^\s"'<>]*\.m3u8[^\s"'<>]*/g) || [];
            console.log('[extract-m3u8] .m3u8 mentions in HTML:', m3u8Mentions.length);
            
            return res.status(200).json({
                success: false,
                error: 'No M3U8 URL found in HTML',
                debug: {
                    htmlLength: html.length,
                    slug: slug,
                    url: ngidoliUrl,
                    m3u8Count: m3u8Mentions.length,
                    sampleMentions: m3u8Mentions.slice(0, 5)
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
