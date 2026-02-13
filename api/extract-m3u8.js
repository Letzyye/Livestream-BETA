// api/extract-m3u8.js - Vercel Serverless Function
// Extract M3U8 dari HTML ngidolihub (server-side parsing)

const fetch = require('node-fetch');

const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
];

function getRandomUserAgent() {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

// Extract m3u8 dari berbagai pattern di HTML
function extractM3U8FromHTML(html) {
    const m3u8Urls = [];
    
    // Pattern 1: Direct m3u8 URL dalam script tag
    const scriptRegex = /"([^"]*\.m3u8[^"]*)"/gi;
    let match;
    while ((match = scriptRegex.exec(html)) !== null) {
        const url = match[1];
        if (url.includes('http') && !m3u8Urls.includes(url)) {
            m3u8Urls.push(url);
        }
    }
    
    // Pattern 2: Dalam player script configuration
    const playerPattern = /\["[^"]*m3u8[^"]*","([^"]*)"\]/gi;
    while ((match = playerPattern.exec(html)) !== null) {
        const url = match[1];
        if (url.includes('http') && !m3u8Urls.includes(url)) {
            m3u8Urls.push(url);
        }
    }
    
    // Pattern 3: Dalam atribut src atau data attributes
    const attrPattern = /(?:src|data-src)="([^"]*\.m3u8[^"]*)"/gi;
    while ((match = attrPattern.exec(html)) !== null) {
        const url = match[1];
        if (url.includes('http') && !m3u8Urls.includes(url)) {
            m3u8Urls.push(url);
        }
    }
    
    // Pattern 4: HLS URL tanpa .m3u8 extension
    const hlsPattern = /["']([^"']*hls[^"']*?)["']/gi;
    while ((match = hlsPattern.exec(html)) !== null) {
        const url = match[1];
        if (url.includes('http') && url.length > 30) {
            m3u8Urls.push(url);
        }
    }
    
    return m3u8Urls;
}

// Fetch HTML dan extract m3u8
async function fetchM3U8FromNgidoli(ngidoliUrl) {
    try {
        const response = await fetch(ngidoliUrl, {
            method: 'GET',
            headers: {
                'User-Agent': getRandomUserAgent(),
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'id-ID,id;q=0.9,en;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br',
                'DNT': '1',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Referer': 'https://ngidolihub.or.id/',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Cache-Control': 'no-cache'
            },
            timeout: 15000
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const html = await response.text();
        const m3u8URLs = extractM3U8FromHTML(html);
        
        if (m3u8URLs.length === 0) {
            throw new Error('No M3U8 URLs found in HTML');
        }
        
        return {
            urls: m3u8URLs,
            count: m3u8URLs.length,
            primary: m3u8URLs[0]
        };
    } catch (error) {
        throw new Error(`Failed to extract M3U8: ${error.message}`);
    }
}

// Vercel Serverless Function Handler
module.exports = async (req, res) => {
    try {
        const { slug, url } = req.query;
        
        let ngidoliUrl;
        
        if (url) {
            ngidoliUrl = url;
        } else if (slug) {
            ngidoliUrl = `https://play.ngidolihub.my.id/?slug=${slug}`;
        } else {
            return res.status(400).json({ 
                error: 'Missing slug or url parameter'
            });
        }
        
        // Fetch dan extract m3u8
        const result = await fetchM3U8FromNgidoli(ngidoliUrl);
        
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        
        return res.status(200).json({
            success: true,
            m3u8_url: result.primary,
            m3u8_urls: result.urls,
            count: result.count,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Extract M3U8 error:', error);
        
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        
        return res.status(500).json({ 
            success: false,
            error: error.message || 'Internal server error'
        });
    }
};
