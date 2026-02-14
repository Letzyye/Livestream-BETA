// api/extract-m3u8-alt.js - Alternatif M3U8 extraction dengan caching
// Jika primary extraction gagal, endpoint ini bisa digunakan

const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
];

function getRandomUserAgent() {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

// Cache untuk m3u8 URLs dengan timestamp
const m3u8Cache = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30 menit

function isCacheValid(timestamp) {
    return (Date.now() - timestamp) < CACHE_TTL;
}

// Enhanced extraction dengan lebih banyak strategy
async function extractM3U8Advanced(html) {
    const urls = [];
    
    // Strategy 1: Cari semua URLs yang berakhir dengan .m3u8
    const m3u8Regex = /https?:\/\/[^\s"'<>;]*\.m3u8[^\s"'<>;]*/gi;
    let match;
    while ((match = m3u8Regex.exec(html)) !== null) {
        const url = match[0].trim();
        if (url.length > 20 && !urls.includes(url)) {
            urls.push(url);
        }
    }
    
    // Strategy 2: Search untuk streaming URLs yang mungkin dinamis
    const streamVarRegex = /(?:stream|m3u8|master|playlist)['":\s=]*["']([^"']*)['"]/gi;
    while ((match = streamVarRegex.exec(html)) !== null) {
        const potential = match[1];
        if (potential.includes('http') && (potential.includes('m3u8') || potential.includes('.m3u'))) {
            if (!urls.includes(potential)) {
                urls.push(potential);
            }
        }
    }
    
    // Strategy 3: Look for base64 encoded URLs
    try {
        const base64Regex = /['\"]([A-Za-z0-9+/]{60,}={0,2})['\"](?:.*?(?:m3u8|decode|atob))?/g;
        while ((match = base64Regex.exec(html)) !== null) {
            try {
                const decoded = atob(match[1]);
                if ((decoded.includes('http') || decoded.includes('m3u8')) && !urls.includes(decoded)) {
                    urls.push(decoded);
                }
            } catch (e) {
                // Not valid base64, skip
            }
        }
    } catch (e) {}
    
    return urls.filter(u => u && u.length > 20);
}

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    
    try {
        const { slug, url, m3u8_url } = req.query;
        
        // Mode 1: Jika ada m3u8_url, cache dan return
        if (m3u8_url) {
            m3u8Cache.set(slug, {
                url: m3u8_url,
                timestamp: Date.now()
            });
            
            return res.status(200).json({
                success: true,
                m3u8_url: m3u8_url,
                cached: true,
                message: 'M3U8 URL cached'
            });
        }
        
        // Check cache dulu
        if (slug && m3u8Cache.has(slug)) {
            const cached = m3u8Cache.get(slug);
            if (isCacheValid(cached.timestamp)) {
                console.log('[extract-alt] Using cached M3U8 for slug:', slug);
                return res.status(200).json({
                    success: true,
                    m3u8_url: cached.url,
                    cached: true,
                    status: 'live'
                });
            }
        }
        
        // Mode 2: Extract dari slug/url
        if (!slug && !url) {
            return res.status(400).json({
                success: false,
                error: 'Missing slug, url, or m3u8_url parameter'
            });
        }
        
        const targetUrl = url || `https://play.ngidolihub.my.id/?slug=${slug}`;
        console.log('[extract-alt] Fetching:', targetUrl);
        
        try {
            const response = await fetch(targetUrl, {
                headers: {
                    'User-Agent': getRandomUserAgent(),
                    'Accept': 'text/html,application/xhtml+xml',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Referer': 'https://play.ngidolihub.my.id/',
                },
                timeout: 20000
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const html = await response.text();
            console.log('[extract-alt] HTML size:', html.length);
            
            // Advanced extraction
            const m3u8URLs = await extractM3U8Advanced(html);
            console.log('[extract-alt] Found URLs:', m3u8URLs.length);
            
            if (m3u8URLs.length > 0) {
                // Cache the result
                if (slug) {
                    m3u8Cache.set(slug, {
                        url: m3u8URLs[0],
                        timestamp: Date.now()
                    });
                }
                
                return res.status(200).json({
                    success: true,
                    m3u8_url: m3u8URLs[0],
                    m3u8_urls: m3u8URLs.slice(0, 10),
                    count: m3u8URLs.length,
                    status: 'live',
                    cached: false
                });
            }
            
            // No M3U8 found
            const isPending = html.toLowerCase().includes('pending') || 
                             html.toLowerCase().includes('tidak ada') ||
                             html.toLowerCase().includes('belum mulai');
            
            return res.status(200).json({
                success: false,
                error: 'No M3U8 URL extracted',
                status: isPending ? 'pending' : 'offline',
                htmlSize: html.length,
                attempts: 3
            });
            
        } catch (fetchErr) {
            console.error('[extract-alt] Fetch error:', fetchErr.message);
            return res.status(503).json({
                success: false,
                error: 'Failed to fetch: ' + fetchErr.message
            });
        }
        
    } catch (error) {
        console.error('[extract-alt] Error:', error.message);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
