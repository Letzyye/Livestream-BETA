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
        // Strategy 1: Find all .m3u8 mentions and expand context
        const m3u8Positions = [];
        let index = html.indexOf('.m3u8');
        while (index !== -1) {
            m3u8Positions.push(index);
            index = html.indexOf('.m3u8', index + 1);
        }
        
        console.log(`[extract] Found ${m3u8Positions.length} .m3u8 mentions`);
        
        for (const pos of m3u8Positions) {
            // Get surrounding context (look back and forward)
            let start = pos;
            let end = pos + 5; // ".m3u8"
            
            // Expand backwards to find start of URL (look for quotes, spaces, :, /)
            while (start > 0) {
                const char = html[start - 1];
                if (char === '"' || char === "'" || char === ' ' || char === '\n' || char === '\t' || char === ':' || char === '>' || char === '<' || char === '{' || char === '}') {
                    break;
                }
                start--;
                if (start < pos - 500) break; // Limit backwards search
            }
            
            // Expand forwards to find end of URL
            while (end < html.length) {
                const char = html[end];
                if (char === '"' || char === "'" || char === ' ' || char === '\n' || char === '\t' || char === '>' || char === '<' || char === '}' || char === ',' || char === ';') {
                    break;
                }
                end++;
                if (end > pos + 500) break; // Limit forwards search
            }
            
            let potential = html.substring(start, end).trim();
            
            // Clean up: remove leading/trailing non-URL chars
            potential = potential.replace(/^[^a-zA-Z0-9\/\.]/g, '').replace(/[^a-zA-Z0-9\/\.\?&=\-_~:#@!$%'()*+,;]/g, '');
            
            if (potential.length > 5 && potential.includes('.m3u8')) {
                console.log(`[extract] Found potential URL: ${potential.substring(0, 100)}`);
                
                if (!m3u8Urls.includes(potential)) {
                    m3u8Urls.push(potential);
                }
            }
        }
        
        // Strategy 2: Look for URLs with http/https pattern
        const urlPattern = /(https?:\/\/[^\s"'<>]+\.m3u8[^\s"'<>]*)/gi;
        let match;
        while ((match = urlPattern.exec(html)) !== null) {
            if (!m3u8Urls.includes(match[1])) {
                m3u8Urls.push(match[1]);
            }
        }
        
        // Strategy 3: Look in data-playlist or similar attributes
        const attrPattern = /(?:data-playlist|data-src|data-url|playlist|url|src)\s*[:=]\s*["']([^"'<>]*\.m3u8[^"'<>]*)["']/gi;
        while ((match = attrPattern.exec(html)) !== null) {
            if (!m3u8Urls.includes(match[1])) {
                m3u8Urls.push(match[1]);
            }
        }
        
    } catch (e) {
        console.error('[extract] Parse error:', e.message);
    }
    
    // Filter and return
    return m3u8Urls
        .filter(u => u && u.length > 5)
        .slice(0, 10);
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
