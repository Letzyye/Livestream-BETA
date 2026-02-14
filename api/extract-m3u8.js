// api/extract-m3u8.js - Extract M3U8 dari ngidolihub
// Lightweight version dengan multiple strategies

const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
];

function getRandomUserAgent() {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

// Strategy 1: Extract dari HTML langsung - dengan pattern matching aggressive
function extractM3U8FromHTML(html) {
    const m3u8Urls = [];
    
    try {
        // Pattern 1: Direct M3U8 URLs (simplest & most reliable)
        const directUrls = html.match(/https?:\/\/[^\s"'<>]*\.m3u8[^\s"'<>]*/gi) || [];
        console.log('[extract] Pattern 1 (direct) found:', directUrls.length);
        directUrls.forEach(url => {
            url = url.split('"')[0].split("'")[0].split('>')[0].split('<')[0].split(';')[0].trim();
            if (url && url.length > 10 && !m3u8Urls.includes(url)) {
                m3u8Urls.push(url);
            }
        });
        
        // Pattern 2: JSON structures
        const jsonPattern = /"(?:url|m3u8|master|playlist|src|source|URI|uri)":\s*"([^"]*\.m3u8[^"]*)"/gi;
        let match;
        let count2 = 0;
        while ((match = jsonPattern.exec(html)) !== null) {
            if (!m3u8Urls.includes(match[1])) {
                m3u8Urls.push(match[1]);
                count2++;
            }
        }
        console.log('[extract] Pattern 2 (JSON) found:', count2);
        
        // Pattern 3: JavaScript variable assignments
        const varPattern = /(?:const|let|var)\s+\w*(?:m3u8|url|source|playlist|stream|master)\w*\s*=\s*['\"]([^'\"]*\.m3u8[^'\"]*)['\"]|(?:m3u8|url|source|playlist|stream|master):\s*['\"]([^'\"]*\.m3u8[^'\"]*)['\"]|['\"]([^'\"]*\.m3u8[^'\"]*)['\"](?:\s*,|\s*\}|\s*;)/gi;
        let count3 = 0;
        while ((match = varPattern.exec(html)) !== null) {
            const url = match[1] || match[2] || match[3];
            if (url && !m3u8Urls.includes(url) && url.length > 10) {
                m3u8Urls.push(url);
                count3++;
            }
        }
        console.log('[extract] Pattern 3 (variables) found:', count3);
        
        // Pattern 4: HTML5 video source tags
        const videoPattern = /<source[^>]*src=['\"]([^'\"]*\.m3u8[^'\"]*)['\"][^>]*>/gi;
        let count4 = 0;
        while ((match = videoPattern.exec(html)) !== null) {
            if (!m3u8Urls.includes(match[1])) {
                m3u8Urls.push(match[1]);
                count4++;
            }
        }
        console.log('[extract] Pattern 4 (video source) found:', count4);
        
        // Pattern 5: Data URLs encoded in HTML/JS
        const dataPattern = /(?:data-src|data-url|data-m3u8)=['\"]([^'\"]*\.m3u8[^'\"]*)['\"]|'([^']*\.m3u8[^'])'\)|\"([^\"]*\.m3u8[^\"]*)\"/gi;
        let count5 = 0;
        while ((match = dataPattern.exec(html)) !== null) {
            const url = match[1] || match[2] || match[3];
            if (url && !m3u8Urls.includes(url) && url.length > 10) {
                m3u8Urls.push(url);
                count5++;
            }
        }
        console.log('[extract] Pattern 5 (data attrs) found:', count5);
        
        // Pattern 6: Base64 encoded URLs (if encoded)
        try {
            const base64Pattern = /(?:atob|decode|base64)?\(?['\"]([A-Za-z0-9+/=]{50,})['\"].*?m3u8/gi;
            // Try to detect base64 patterns but don't decode here (risky)
        } catch(e) {}
        
        console.log('[extract] Total unique URLs before filter:', m3u8Urls.length);
        
        const filtered = m3u8Urls
            .filter(u => u && u.length > 10)
            .filter(u => u.includes('http://') || u.includes('https://'))
            .map(u => u.trim())
            .map(u => {
                // Fix common issues
                if (u.includes('\\')) u = u.replace(/\\\//g, '/');
                return u;
            })
            .filter((v, i, a) => a.indexOf(v) === i); // Remove duplicates
        
        console.log('[extract] After filter:', filtered.length);
        return filtered;
            
    } catch (error) {
        console.error('[extractM3U8FromHTML] Error:', error.message);
        return [];
    }
}

// Strategy 2: Fetch dengan streaming untuk intercept m3u8
async function fetchWithNetworkMonitoring(url) {
    try {
        console.log('[fetch] Getting:', url);
        
        const response = await fetch(url, {
            headers: {
                'User-Agent': getRandomUserAgent(),
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
            },
            timeout: 15000
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        return await response.text();
        
    } catch (error) {
        console.error('[fetch] Error:', error.message);
        return null;
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
            html = await fetchWithNetworkMonitoring(targetUrl);
            
            if (!html) {
                throw new Error('Failed to fetch HTML');
            }
            
            console.log('[extract-m3u8] HTML length:', html.length);
        } catch (fetchErr) {
            console.error('[extract-m3u8] Fetch error:', fetchErr.message);
            
            return res.status(503).json({
                success: false,
                error: 'Failed to fetch: ' + fetchErr.message
            });
        }
        
        // Extract M3U8
        const m3u8URLs = extractM3U8FromHTML(html);
        console.log('[extract-m3u8] Found M3U8 URLs:', m3u8URLs.length);
        
        if (m3u8URLs.length > 0) {
            console.log('[extract-m3u8] ✅ SUCCESS - Found M3U8:', m3u8URLs[0]);
            return res.status(200).json({
                success: true,
                m3u8_url: m3u8URLs[0],
                m3u8_urls: m3u8URLs.slice(0, 10),
                count: m3u8URLs.length,
                status: 'live'
            });
        }
        
        // Check stream status
        const isPending = html.toLowerCase().includes('pending') || 
                         html.toLowerCase().includes('sedang dipersiapkan') ||
                         html.toLowerCase().includes('coming soon') ||
                         html.toLowerCase().includes('belum mulai') ||
                         html.toLowerCase().includes('tidak ada streaming');
        
        if (isPending) {
            console.log('[extract-m3u8] Stream PENDING');
            return res.status(200).json({
                success: false,
                error: 'Stream is pending - not yet live',
                status: 'pending'
            });
        }
        
        // Debug info
        const m3u8Mentions = (html.match(/\.m3u8/gi) || []).length;
        const videoTags = (html.match(/<video/gi) || []).length;
        const iframeTags = (html.match(/<iframe/gi) || []).length;
        const scripts = (html.match(/<script/gi) || []).length;
        
        console.log('[extract-m3u8] Debug:', { m3u8Mentions, videoTags, iframeTags, scripts, htmlLength: html.length });
        
        // Jika masih tidak ada, kemungkinan m3u8 di-load via JavaScript
        // Return dengan debug info untuk investigasi
        return res.status(200).json({
            success: false,
            error: 'No M3U8 URL found in initial HTML load',
            debug: {
                htmlLength: html.length,
                m3u8Mentions: m3u8Mentions,
                videoTags: videoTags,
                iframeTags: iframeTags,
                scriptTags: scripts,
                status: isPending ? 'pending' : 'offline',
                hint: iframeTags > 0 ? 'M3U8 likely in iframe' : 'M3U8 likely loaded via JavaScript'
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
