// api/playlist.js - Vercel Serverless Function
// Proxy m3u8 file dan rewrite segment URLs

const fetch = require('node-fetch');

const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
];

function getRandomUserAgent() {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

// Parse M3U8 dan tulis ulang segment URLs
function rewriteM3U8(m3u8Content, baseUrl, proxyUrl) {
    const lines = m3u8Content.split('\n');
    const rewrittenLines = [];
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (!line || line.startsWith('#')) {
            rewrittenLines.push(lines[i]);
            continue;
        }
        
        if (line.endsWith('.ts') || line.endsWith('.m3u8')) {
            let segmentUrl;
            
            if (line.startsWith('http://') || line.startsWith('https://')) {
                segmentUrl = line;
            } else {
                segmentUrl = new URL(line, baseUrl).href;
            }
            
            const encodedUrl = encodeURIComponent(segmentUrl);
            const proxiedUrl = `${proxyUrl}/api/segment?url=${encodedUrl}`;
            
            rewrittenLines.push(proxiedUrl);
        } else {
            rewrittenLines.push(lines[i]);
        }
    }
    
    return rewrittenLines.join('\n');
}

// Vercel Serverless Function Handler
module.exports = async (req, res) => {
    try {
        const { url } = req.query;
        
        if (!url) {
            return res.status(400).json({ error: 'Missing url parameter' });
        }
        
        // Fetch M3U8 dari source
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'User-Agent': getRandomUserAgent(),
                'Referer': 'https://ngidolihub.or.id/',
                'Accept': 'application/vnd.apple.mpegurl, application/x-mpegURL, */*',
                'Accept-Language': 'id-ID,id;q=0.9,en;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br',
                'DNT': '1',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Sec-Fetch-Dest': 'video',
                'Sec-Fetch-Mode': 'no-cors',
                'Sec-Fetch-Site': 'cross-site',
                'Cache-Control': 'no-cache'
            },
            timeout: 10000
        });
        
        if (!response.ok) {
            return res.status(response.status).json({ 
                error: `Failed to fetch M3U8: ${response.statusText}`
            });
        }
        
        let m3u8Content = await response.text();
        const m3u8BaseUrl = new URL(url).origin + new URL(url).pathname.substring(0, new URL(url).pathname.lastIndexOf('/'));
        
        // Get proxy base URL dari request host
        const proto = req.headers['x-forwarded-proto'] || 'https';
        const host = req.headers['x-forwarded-host'] || req.headers.host;
        const proxyBaseUrl = `${proto}://${host}`;
        
        // Rewrite M3U8
        const rewrittenM3U8 = rewriteM3U8(m3u8Content, m3u8BaseUrl, proxyBaseUrl);
        
        res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range');
        
        return res.status(200).send(rewrittenM3U8);
        
    } catch (error) {
        console.error('Playlist proxy error:', error);
        
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        
        return res.status(500).json({ 
            error: 'Internal server error',
            message: error.message
        });
    }
};
