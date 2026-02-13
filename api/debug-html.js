// api/debug-html.js - Return HTML sample for debugging m3u8 extraction

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    
    try {
        const { slug } = req.query;
        
        if (!slug) {
            return res.status(400).json({ error: 'Missing slug' });
        }
        
        const url = `https://play.ngidolihub.my.id/?slug=${slug}`;
        
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/121.0.0.0',
                'Referer': 'https://ngidolihub.or.id/',
            }
        });
        
        const html = await response.text();
        
        // Extract all .m3u8 mentions with context
        const m3u8Matches = [];
        let index = html.indexOf('.m3u8');
        while (index !== -1 && m3u8Matches.length < 10) {
            const start = Math.max(0, index - 150);
            const end = Math.min(html.length, index + 150);
            const context = html.substring(start, end);
            m3u8Matches.push({
                index,
                context,
                before: html.substring(start, index),
                after: html.substring(index + 5, end)
            });
            index = html.indexOf('.m3u8', index + 1);
        }
        
        // Extract URLs
        const urlPattern = /(https?:\/\/[^\s"'<>]+)/g;
        const urls = [...html.matchAll(urlPattern)]
            .map(m => m[1])
            .filter(u => u.includes('m3u8') || u.includes('stream') || u.includes('play'))
            .slice(0, 20);
        
        return res.status(200).json({
            success: true,
            slug,
            htmlLength: html.length,
            m3u8Mentions: m3u8Matches.length,
            m3u8Contexts: m3u8Matches,
            urlsFound: urls,
            htmlSample: html.substring(0, 3000)
        });
        
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
