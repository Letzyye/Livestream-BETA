// api/segment.js - Vercel Serverless Function
// Proxy .ts segment files

const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
];

function getRandomUserAgent() {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

const segmentCache = new Map();
const MAX_CACHE_SIZE = 20;
const CACHE_TTL = 5 * 60 * 1000;

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    try {
        const { url } = req.query;
        
        if (!url) {
            return res.status(400).json({ error: 'Missing url' });
        }
        
        let segmentUrl;
        try {
            segmentUrl = decodeURIComponent(url);
        } catch (e) {
            return res.status(400).json({ error: 'Invalid URL encoding' });
        }
        
        // Check cache
        let cached = segmentCache.get(segmentUrl);
        if (cached && Date.now() - cached.time < CACHE_TTL) {
            res.setHeader('Content-Type', 'video/MP2T');
            res.setHeader('Content-Length', cached.buffer.length);
            res.setHeader('Cache-Control', 'public, max-age=3600');
            res.setHeader('Accept-Ranges', 'bytes');
            return res.status(206).send(cached.buffer);
        }
        
        console.log('[segment] Fetching:', segmentUrl.substring(0, 80) + '...');
        
        // Fetch segment
        const response = await fetch(segmentUrl, {
            headers: {
                'User-Agent': getRandomUserAgent(),
                'Referer': 'https://ngidolihub.or.id/',
            }
        });
        
        if (!response.ok) {
            return res.status(response.status).json({ 
                error: `HTTP ${response.status}`
            });
        }
        
        // Get buffer
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        // Cache
        if (segmentCache.size >= MAX_CACHE_SIZE) {
            const first = segmentCache.keys().next().value;
            segmentCache.delete(first);
        }
        segmentCache.set(segmentUrl, { buffer, time: Date.now() });
        
        res.setHeader('Content-Type', 'video/MP2T');
        res.setHeader('Content-Length', buffer.length);
        res.setHeader('Cache-Control', 'public, max-age=3600');
        res.setHeader('Accept-Ranges', 'bytes');
        
        return res.status(206).send(buffer);
        
    } catch (error) {
        console.error('[segment] Error:', error.message);
        
        res.setHeader('Content-Type', 'application/json');
        return res.status(500).json({ 
            error: error.message
        });
    }
};
