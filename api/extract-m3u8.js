// api/extract-m3u8.js - Vercel Serverless Function
// Extract M3U8 dari HTML ngidolihub dengan improved extraction

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
        // Pattern 1: Direct M3U8 URLs (https://...)
        const directUrls = html.match(/https?:\/\/[^\s"'<>]*\.m3u8[^\s"'<>]*/gi) || [];
        directUrls.forEach(url => {
            url = url.split('"')[0].split("'")[0].split('>')[0].split('<')[0].trim();
            if (url && url.length > 10 && !m3u8Urls.includes(url)) {
                m3u8Urls.push(url);
            }
        });
        
        // Pattern 2: URLs in JSON-like format
        const jsonPattern = /"(?:url|m3u8|master|playlist)":\s*"([^"]*\.m3u8[^"]*)"/gi;
        let match;
        while ((match = jsonPattern.exec(html)) !== null) {
            if (!m3u8Urls.includes(match[1])) {
                m3u8Urls.push(match[1]);
            }
        }
        
        // Pattern 3: data attributes
        const dataPattern = /data-(?:m3u8|url|src)="([^"]*\.m3u8[^"]*)"/gi;
        while ((match = dataPattern.exec(html)) !== null) {
            if (!m3u8Urls.includes(match[1])) {
                m3u8Urls.push(match[1]);
            }
        }
        
        // Pattern 4: HLS.js player config
        const hlsPattern = /src:\s*"([^"]*\.m3u8[^"]*)"|url:\s*"([^"]*\.m3u8[^"]*)"|source:\s*"([^"]*\.m3u8[^"]*)"/gi;
        while ((match = hlsPattern.exec(html)) !== null) {
            const url = match[1] || match[2] || match[3];
            if (url && !m3u8Urls.includes(url)) {
                m3u8Urls.push(url);
            }
        }
        
        console.log('[extractM3U8FromHTML] Found URLs:', m3u8Urls.length);
        
        return m3u8Urls
            .filter(u => u && u.length > 10)
            .filter((v, i, a) => a.indexOf(v) === i);
            
    } catch (error) {
        console.error('[extractM3U8FromHTML] Error:', error.message);
        return [];
    }
}

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    
    try {
        const { slug, url } = req.query;
        
        if (!slug && !url) {
            return res.status(400).json({ 
                success: false,
                error: 'Missing slug or url parameter'
            });
        }
        
        let targetUrl = url || `https://play.ngidolihub.my.id/?slug=${slug}`;
        console.log('[extract-m3u8] Fetching:', targetUrl);
        
        // Fetch HTML
        let html;
        try {
            const response = await fetch(targetUrl, {
                headers: {
                    'User-Agent': getRandomUserAgent(),
                    'Accept': 'text/html,application/xhtml+xml',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Referer': 'https://ngidolihub.or.id/',
                },
                timeout: 15000
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            html = await response.text();
            console.log('[extract-m3u8] HTML fetched, length:', html.length);
        } catch (fetchErr) {
            console.error('[extract-m3u8] Fetch error:', fetchErr.message);
            
            return res.status(503).json({
                success: false,
                error: 'Failed to fetch page: ' + fetchErr.message
            });
        }
        
        // Try extract M3U8
        const m3u8URLs = extractM3U8FromHTML(html);
        console.log('[extract-m3u8] Extracted M3U8 URLs:', m3u8URLs.length);
        
        if (m3u8URLs.length > 0) {
            console.log('[extract-m3u8] ✅ Stream LIVE - Found M3U8 URLs');
            return res.status(200).json({
                success: true,
                m3u8_url: m3u8URLs[0],
                m3u8_urls: m3u8URLs.slice(0, 10),
                count: m3u8URLs.length
            });
        }
        
        // No M3U8 - check if pending
        const isPending = html.toLowerCase().includes('pending') || 
                         html.toLowerCase().includes('sedang dipersiapkan') ||
                         html.toLowerCase().includes('coming soon') ||
                         html.toLowerCase().includes('belum mulai');
        
        if (isPending) {
            console.log('[extract-m3u8] Stream status: PENDING');
            return res.status(200).json({
                success: false,
                error: 'Stream is still pending - not yet live',
                status: 'pending'
            });
        }
        
        // Debug info
        const m3u8Mentions = (html.match(/\.m3u8/gi) || []).length;
        const videoDivs = (html.match(/<video/gi) || []).length;
        
        console.log('[extract-m3u8] Debug - m3u8 mentions:', m3u8Mentions, 'video tags:', videoDivs);
        
        return res.status(200).json({
            success: false,
            error: 'No M3U8 URL found',
            debug: {
                htmlLength: html.length,
                m3u8Mentions: m3u8Mentions,
                videoTags: videoDivs
            }
        });
        
    } catch (error) {
        console.error('[extract-m3u8] Error:', error.message);
        
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
