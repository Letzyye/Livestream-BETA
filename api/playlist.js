// api/playlist.js - Vercel Serverless Function
// Proxy m3u8 file dan rewrite segment URLs

const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
];

function getRandomUserAgent() {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

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
            let segmentUrl = line;
            
            if (!line.startsWith('http')) {
                try {
                    segmentUrl = new URL(line, baseUrl).href;
                } catch (e) {
                    segmentUrl = line;
                }
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

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    try {
        const { url } = req.query;
        
        if (!url) {
            return res.status(400).json({ error: 'Missing url parameter' });
        }
        
        console.log('[playlist] Fetching:', url);
        
        const response = await fetch(url, {
            headers: {
                'User-Agent': getRandomUserAgent(),
                'Referer': 'https://ngidolihub.or.id/',
                'Accept': 'application/vnd.apple.mpegurl'
            }
        });
        
        if (!response.ok) {
            return res.status(response.status).json({ 
                error: `HTTP ${response.status}`
            });
        }
        
        let m3u8Content = await response.text();
        console.log('[playlist] M3U8 length:', m3u8Content.length);
        
        const m3u8BaseUrl = new URL(url).origin + new URL(url).pathname.substring(0, new URL(url).pathname.lastIndexOf('/'));
        const proto = req.headers['x-forwarded-proto'] || 'https';
        const host = req.headers['x-forwarded-host'] || req.headers.host;
        const proxyBaseUrl = `${proto}://${host}`;
        
        const rewrittenM3U8 = rewriteM3U8(m3u8Content, m3u8BaseUrl, proxyBaseUrl);
        
        res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        
        return res.status(200).send(rewrittenM3U8);
        
    } catch (error) {
        console.error('[playlist] Error:', error.message);
        
        res.setHeader('Content-Type', 'application/json');
        return res.status(500).json({ 
            error: error.message
        });
    }
};
