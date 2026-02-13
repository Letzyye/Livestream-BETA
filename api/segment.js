// api/segment.js - Vercel Serverless Function
// Proxy .ts segment files

const fetch = require('node-fetch');

const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
];

function getRandomUserAgent() {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

// Simple segment cache
const segmentCache = new Map();
const MAX_CACHE_SIZE = 50;
const CACHE_TTL = 5 * 60 * 1000;

// Vercel Serverless Function Handler
module.exports = async (req, res) => {
    try {
        const { url } = req.query;
        const range = req.headers.range;
        
        if (!url) {
            return res.status(400).json({ error: 'Missing url parameter' });
        }
        
        let segmentUrl;
        try {
            segmentUrl = decodeURIComponent(url);
        } catch (e) {
            return res.status(400).json({ error: 'Invalid URL encoding' });
        }
        
        // Check cache
        let cachedData = segmentCache.get(segmentUrl);
        if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
            res.setHeader('Content-Type', 'video/MP2T');
            res.setHeader('Content-Length', cachedData.data.length);
            res.setHeader('Cache-Control', 'public, max-age=3600');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Accept-Ranges', 'bytes');
            res.setHeader('Content-Range', `bytes 0-${cachedData.data.length - 1}/${cachedData.data.length}`);
            
            return res.status(206).send(cachedData.data);
        }
        
        // Fetch segment
        const fetchOptions = {
            method: 'GET',
            headers: {
                'User-Agent': getRandomUserAgent(),
                'Referer': 'https://ngidolihub.or.id/',
                'Accept': '*/*',
                'Accept-Language': 'id-ID,id;q=0.9,en;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br',
                'DNT': '1',
                'Connection': 'keep-alive',
                'Sec-Fetch-Dest': 'video',
                'Sec-Fetch-Mode': 'no-cors',
                'Sec-Fetch-Site': 'cross-site'
            },
            timeout: 15000
        };
        
        if (range) {
            fetchOptions.headers['Range'] = range;
        }
        
        const response = await fetch(segmentUrl, fetchOptions);
        
        if (!response.ok) {
            return res.status(response.status).json({ 
                error: `Failed to fetch segment: ${response.statusText}`
            });
        }
        
        const contentLength = response.headers.get('content-length');
        const contentType = response.headers.get('content-type') || 'video/MP2T';
        const buffer = await response.buffer();
        
        // Cache segment
        if (segmentCache.size >= MAX_CACHE_SIZE) {
            const firstKey = segmentCache.keys().next().value;
            segmentCache.delete(firstKey);
        }
        segmentCache.set(segmentUrl, {
            data: buffer,
            timestamp: Date.now()
        });
        
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Length', contentLength || buffer.length);
        res.setHeader('Cache-Control', 'public, max-age=3600');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS, HEAD');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range');
        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('Content-Range', response.headers.get('content-range') || `bytes 0-${buffer.length - 1}/${buffer.length}`);
        
        return res.status(206).send(buffer);
        
    } catch (error) {
        console.error('Segment proxy error:', error);
        
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        
        return res.status(500).json({ 
            error: 'Internal server error',
            message: error.message
        });
    }
};
