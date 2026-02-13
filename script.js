// ============ KEAMANAN LANJUTAN ============
// Disable console & semua debugging
(function() {
    // TEMPORARILY ENABLE CONSOLE FOR DEBUGGING
    // Uncomment next lines to disable console in production
    // const noop = function() {};
    // console.log = noop;
    // console.warn = noop;
    // console.error = noop;
    // console.debug = noop;
    // console.info = noop;
    // console.table = noop;
    // console.time = noop;
    // console.timeLog = noop;
    // console.trace = noop;
    
    // Override toString untuk functions
    Function.prototype.toString = function() {
        if (this.name === 'initLivestream' || this.name === 'switchQuality') {
            return 'function() { [native code] }';
        }
        return Function.prototype.toString.call(this);
    };
})();

// Cegah akses ke window properties
Object.defineProperty(window, 'SOURCE_WEBSITE', {
    get: () => undefined,
    set: () => false,
    configurable: false
});

// Deteksi DevTools dengan berbagai cara
setInterval(() => {
    const threshold = 160;
    if ((window.outerWidth - window.innerWidth > threshold) || 
        (window.outerHeight - window.innerHeight > threshold)) {
        window.location.href = '/404.html';
    }
}, 300);

// Block network tab inspection
Object.defineProperty(window, 'fetch', {
    value: window.fetch,
    writable: false,
    configurable: false
});

// ============ KEAMANAN DASAR ============
// Cegah klik kanan (right-click)
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    return false;
});

// Cegah copy
document.addEventListener('copy', function(e) {
    e.preventDefault();
    return false;
});

// Cegah paste
document.addEventListener('paste', function(e) {
    e.preventDefault();
    return false;
});

// Cegah drag
document.addEventListener('dragstart', function(e) {
    e.preventDefault();
    return false;
});

// Cegah select
document.addEventListener('selectstart', function(e) {
    e.preventDefault();
    return false;
});

// Block all DevTools shortcuts - REDIRECT TO 404
document.addEventListener('keydown', function(e) {
    // F12
    if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        e.stopPropagation();
        window.location.href = '/404.html';
        return false;
    }
    
    // Ctrl+Shift+I (Inspect)
    if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
        e.preventDefault();
        e.stopPropagation();
        window.location.href = '/404.html';
        return false;
    }
    
    // Ctrl+Shift+J (Console)
    if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
        e.preventDefault();
        e.stopPropagation();
        window.location.href = '/404.html';
        return false;
    }
    
    // Ctrl+Shift+C (Inspect Element)
    if (e.ctrlKey && e.shiftKey && e.keyCode === 67) {
        e.preventDefault();
        e.stopPropagation();
        window.location.href = '/404.html';
        return false;
    }
    
    // Ctrl+U (View Source)
    if (e.ctrlKey && e.keyCode === 85) {
        e.preventDefault();
        e.stopPropagation();
        window.location.href = '/404.html';
        return false;
    }
    
    // Ctrl+S (Save)
    if (e.ctrlKey && e.keyCode === 83) {
        e.preventDefault();
        e.stopPropagation();
        window.location.href = '/404.html';
        return false;
    }
}, true);

// ============ END KEAMANAN ===========

// ============ KONFIG M3U8 AUTO-DETECT ============

/* ⚠️ CARA MENGUBAH LINK NGIDOLIHUB:
   
   1. COPY link ngidolihub Anda (contoh):
      https://play.ngidolihub.my.id/?slug=nama-film-xxx
   
   2. PASTE di DECODED_URL dibawah (ganti yang lama):
      const DECODED_URL = 'https://play.ngidolihub.my.id/?slug=nama-film-xxx';
   
   3. SELESAI! Script otomatis encrypt
   
   Jangan ubah section encoding dibawah!
*/

// EDIT DISINI SAJA - PASTE LINK NGIDOLIHUB ANDA:
const DECODED_URL = 'https://play.ngidolihub.my.id/?slug=sambil-menggandeng-erat-tanganku-2026-02-14-260201200541';

// Obfuscate URL parts to prevent exposure in network tab
const urlParts = DECODED_URL.split('/');
const obfuscatedDomain = urlParts[2];

// ============ DYNAMIC USER-AGENT CONFIGURATION ============
const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0',
    'Mozilla/5.0 (X11; Linux x86_64; rv:122.0) Gecko/20100101 Firefox/122.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15'
];

let userAgentIndex = 0;

function getRandomUserAgent() {
    userAgentIndex = (userAgentIndex + 1) % USER_AGENTS.length;
    return USER_AGENTS[userAgentIndex];
}

// ============ CORS BYPASS CONFIGURATION ============
// Pilih method CORS bypass (ganti CORS_METHOD dengan salah satu):
// 1. 'proxy' - gunakan CORS proxy (default - paling reliable)
// 2. 'no-cors' - fetch tanpa CORS (respon opaque, hanya bisa intercept)
// 3. 'headers' - modifikasi headers (kadang work)
const CORS_METHOD = 'proxy';

// CORS Proxies (jika method = 'proxy', pilih salah satu):
const CORS_PROXIES = [
    'https://api.allorigins.win/raw?url=',       // Lebih reliable
    'https://thingproxy.freeboard.io/fetch/',    // Alternative
    'https://cors-anywhere.herokuapp.com/',      // Fallback
];
const SELECTED_CORS_PROXY = CORS_PROXIES[0]; // Gunakan proxy pertama

// CORS Bypass Helper
function getCORSUrl(url) {
    if (CORS_METHOD === 'proxy') {
        return SELECTED_CORS_PROXY + encodeURIComponent(url);
    }
    return url;
}

// Enhanced fetch dengan CORS bypass & dynamic user-agent
const corsAwareFetch = async (url, options = {}) => {
    const dynamicUserAgent = getRandomUserAgent();
    
    try {
        // Method 1: Via CORS Proxy
        if (CORS_METHOD === 'proxy') {
            const corsUrl = getCORSUrl(url);
            const response = await window.fetch(corsUrl, {
                ...options,
                headers: {
                    ...options.headers,
                    'User-Agent': dynamicUserAgent,
                    'Accept': '*/*',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache',
                    'Sec-Fetch-Dest': 'video',
                    'Sec-Fetch-Mode': 'no-cors',
                    'Sec-Fetch-Site': 'cross-site'
                }
            });
            return response;
        }
        
        // Method 2: no-cors mode
        if (CORS_METHOD === 'no-cors') {
            return await window.fetch(url, {
                ...options,
                mode: 'no-cors',
                headers: {
                    'User-Agent': dynamicUserAgent,
                    ...options.headers
                }
            });
        }
        
        // Method 3: Custom headers
        return await window.fetch(url, {
            ...options,
            headers: {
                'User-Agent': dynamicUserAgent,
                'Referer': window.location.origin,
                'Accept': '*/*',
                'Accept-Language': 'en-US,en;q=0.9',
                ...options.headers
            }
        });
    } catch (error) {
        // Fallback tries
        if (CORS_METHOD !== 'no-cors') {
            return await window.fetch(url, {
                mode: 'no-cors',
                headers: {
                    'User-Agent': dynamicUserAgent,
                    ...options.headers
                }
            });
        }
        throw error;
    }
};

// Auto-encrypt & protect
const _0x = (function() {
    const encoded = btoa(DECODED_URL); // Auto-encode
    const decoded = atob(encoded);     // Auto-decode
    return { url: decoded };
})();
const SOURCE_WEBSITE = _0x.url;

const videoElement = document.getElementById('livestreamVideo');
const videoSource = document.getElementById('videoSource');
const deviceInfo = document.getElementById('deviceInfo');
const landingPage = document.getElementById('landingPage');
const playerContainer = document.getElementById('playerContainer');
const playButton = document.getElementById('playButton');
const iframeContainer = document.getElementById('iframeContainer');
const leftSeekHint = document.querySelector('.seek-hint.left-hint');
const rightSeekHint = document.querySelector('.seek-hint.right-hint');

let currentM3U8URL = '';
let detectedQualities = [];
let m3u8UrlMap = {}; // Map untuk menyimpan URL dengan metadata-nya
let hlsKeyMap = {}; // Map untuk menyimpan encryption keys
let m3u8extractedUrl = null; // M3U8 yang sudah di-extract dari slug
let isAutoM3U8Extracted = false; // Flag untuk tracking ekstraksi

let hlsInstance = null; // Global HLS instance reference
let retryCount = 0; // Track retry attempts
let maxRetries = 5; // Max retry attempts
let urlRefreshInterval = null; // For periodic URL refresh
let lastValidM3U8URL = null; // Backup URL jika current expires

// ============ PLAYER UI MANAGEMENT ============

// Extract slug dari DECODED_URL (ngidoli URL)
function extractSlugFromUrl(url) {
    try {
        const urlObj = new URL(url);
        const slug = urlObj.searchParams.get('slug');
        return slug;
    } catch (e) {
        // Fallback: parse manual
        const match = url.match(/[?&]slug=([^&]+)/);
        return match ? match[1] : null;
    }
}

// AUTO-EXTRACT M3U8 dari slug Ngidoli (SERVER-SIDE)
async function autoExtractM3U8FromSlug() {
    try {
        // Extract slug dari DECODED_URL
        const slug = extractSlugFromUrl(DECODED_URL);
        
        if (!slug) {
            console.warn('Tidak bisa extract slug dari URL');
            return false;
        }
        
        console.log('Auto-extracting M3U8 from slug:', slug);
        
        // Call Vercel API untuk extract m3u8
        const extractEndpoint = `${window.location.origin}/api/extract-m3u8?slug=${encodeURIComponent(slug)}`;
        
        const response = await fetch(extractEndpoint);
        const data = await response.json();
        
        if (!data.success || !data.m3u8_url) {
            console.error('Extract M3U8 failed:', data.error);
            showErrorNotification('Gagal extract M3U8: ' + (data.error || 'Unknown error'));
            return false;
        }
        
        // Simpan m3u8 URL yang sudah di-extract
        m3u8extractedUrl = data.m3u8_url;
        isAutoM3U8Extracted = true;
        
        console.log('✅ M3U8 extracted successfully:', m3u8extractedUrl);
        console.log('Found ' + data.count + ' alternative URLs');
        
        return true;
        
    } catch (error) {
        console.error('Auto-extract M3U8 error:', error);
        showErrorNotification('Error extracting M3U8: ' + error.message);
        return false;
    }
}

// Show player dan hide landing page

function showPlayer() {
    // Stop auto-polling jika ada
    if (autoPollingInterval) {
        clearInterval(autoPollingInterval);
        autoPollingInterval = null;
        console.log('⏹️ Polling stopped (user action)');
    }
    
    landingPage.style.display = 'none';
    playerContainer.style.display = 'block';
    
    // AUTO-EXTRACT M3U8 dari slug DAN start playback
    (async () => {
        const extracted = await autoExtractM3U8FromSlug();
        if (extracted && m3u8extractedUrl) {
            // ✅ Load video dengan m3u8 yang sudah di-extract
            console.log('✅ Using extracted M3U8:', m3u8extractedUrl);
            updateVideoSource(m3u8extractedUrl);
        } else {
            // Jika extraction gagal, tetap tampilkan player (mungui akan di-fix via polling)
            console.log('⚠️ Extraction failed, player ready - will retry via polling');
            initLivestream();
        }
    })();
}

// Embed ngidolihub player as iframe
function embedNgidolihubPlayer() {
    // REMOVED - No longer embedding Ngidoli iframe
    // Using custom video player instead
    console.log('Using custom video player with extracted M3U8');
}

// Setup double-click seek functionality
function setupDoubleClickSeek() {
    let lastClickTime = 0;
    let clickX = 0;
    
    videoElement.addEventListener('click', (e) => {
        const now = new Date().getTime();
        const delta = now - lastClickTime;
        clickX = e.clientX;
        
        // Double click (within 300ms)
        if (delta < 300) {
            const rect = videoElement.getBoundingClientRect();
            const relativeX = e.clientX - rect.left;
            const isLeftHalf = relativeX < rect.width / 2;
            
            if (isLeftHalf) {
                // Left click - rewind 10s
                videoElement.currentTime = Math.max(0, videoElement.currentTime - 10);
                showSeekHint(leftSeekHint);
            } else {
                // Right click - forward 10s
                videoElement.currentTime = Math.min(videoElement.duration, videoElement.currentTime + 10);
                showSeekHint(rightSeekHint);
            }
        }
        
        lastClickTime = now;
    });
}

// Show seek hint animation
function showSeekHint(hint) {
    hint.classList.add('show');
    setTimeout(() => hint.classList.remove('show'), 600);
}

// Auto-detect stream availability and show player
let autoPollingInterval = null; // Track polling interval

async function checkAndShowStream() {
    try {
        console.log('🔍 Checking stream availability...');
        
        const extracted = await autoExtractM3U8FromSlug();
        
        if (extracted && m3u8extractedUrl) {
            console.log('✅ Stream available! Showing player with extracted M3U8...');
            // Stop polling if it's running
            if (autoPollingInterval) {
                clearInterval(autoPollingInterval);
                autoPollingInterval = null;
            }
            // Show player dengan extracted m3u8
            landingPage.style.display = 'none';
            playerContainer.style.display = 'block';
            updateVideoSource(m3u8extractedUrl);
            offlineCount = 0; // Reset counter
        } else {
            console.log('⚠️ Stream not detected - keeping landing page visible, will retry...');
            // Keep landing page visible, don't show player yet
            // Polling akan handle ini
        }
    } catch (err) {
        console.error('Stream check error:', err);
    }
}

// Auto-polling - coba setiap 10 detik sampai stream aktif
// Track stream status
let offlineCount = 0;
const OFFLINE_THRESHOLD = 3; // After 3 failed attempts, consider stream offline

function startAutoPolling() {
    if (autoPollingInterval) return; // Jangan buat duplicate
    
    console.log('⏱️ Starting auto-polling (check every 10s)...');
    
    autoPollingInterval = setInterval(async () => {
        console.log('🔄 Polling stream status...');
        const extracted = await autoExtractM3U8FromSlug();
        
        if (extracted && m3u8extractedUrl) {
            console.log('✅ Stream detected! Showing player now...');
            offlineCount = 0; // Reset offline counter
            
            // Make sure player is visible
            if (playerContainer.style.display === 'none') {
                landingPage.style.display = 'none';
                playerContainer.style.display = 'block';
            }
            
            // Load video dengan extracted m3u8
            updateVideoSource(m3u8extractedUrl);
        } else {
            offlineCount++;
            console.log(`⚠️ Stream offline (${offlineCount}/${OFFLINE_THRESHOLD})`);
            
            // If stream offline for too long, hide player and show landing
            if (offlineCount >= OFFLINE_THRESHOLD) {
                if (playerContainer.style.display !== 'none') {
                    console.log('📺 Stream offline - hiding player and showing landing page');
                    playerContainer.style.display = 'none';
                    landingPage.style.display = 'block';
                    
                    // Stop polling jika sudah offline lama
                    clearInterval(autoPollingInterval);
                    autoPollingInterval = null;
                    console.log('⏹️ Polling stopped - stream offline');
                }
            }
        }
    }, 10000); // Polling setiap 10 detik
}

// Run auto-detection saat page load
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Page loaded, checking stream...');
    await checkAndShowStream();
    // Jika belum bisa extract, start polling
    if (!isAutoM3U8Extracted) {
        startAutoPolling();
    }
});

// Also run it immediately if DOM sudah loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
        console.log('🚀 Page loaded (via listener), checking stream...');
        await checkAndShowStream();
        if (!isAutoM3U8Extracted) {
            startAutoPolling();
        }
    });
} else {
    setTimeout(async () => {
        console.log('🚀 Page loaded (via timeout), checking stream...');
        await checkAndShowStream();
        if (!isAutoM3U8Extracted) {
            startAutoPolling();
        }
    }, 1500);
}

// Enhanced error handling untuk m3u8 links (silent mode - no visible notifications)
function showErrorNotification(message, duration = 5000) {
    // Silent logging only - no user notifications
    console.warn('ERROR: ' + message);
}

function showSuccessNotification(message, duration = 3000) {
    // Silent logging only - no user notifications
    console.log('SUCCESS: ' + message);
}

// Add animation styles untuk notifications
function addNotificationStyles() {
    if (!document.getElementById('notificationStyles')) {
        const style = document.createElement('style');
        style.id = 'notificationStyles';
        style.textContent = `
            @keyframes slideInTop {
                from {
                    opacity: 0;
                    transform: translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            @keyframes slideOutTop {
                from {
                    opacity: 1;
                    transform: translateY(0);
                }
                to {
                    opacity: 0;
                    transform: translateY(-20px);
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Store HLS encryption keys dari m3u8 processing
function extractHLSKeys(m3u8Content, baseUrl) {
    const keyMap = {};
    const lines = m3u8Content.split('\n');
    
    for (const line of lines) {
        if (line.includes('#EXT-X-KEY')) {
            // Parse EXT-X-KEY untuk AES-128 encryption
            const methodMatch = line.match(/METHOD=([A-Z0-9-]+)/);
            const uriMatch = line.match(/URI="([^"]+)"/);
            const ivMatch = line.match(/IV=0x([0-9A-Fa-f]+)/);
            
            if (methodMatch && uriMatch) {
                const method = methodMatch[1];
                const keyUri = uriMatch[1];
                const iv = ivMatch ? ivMatch[1] : null;
                
                // Convert relative URL ke absolute jika diperlukan
                let absoluteKeyUri = keyUri;
                if (keyUri.startsWith('http')) {
                    absoluteKeyUri = keyUri;
                } else if (keyUri.startsWith('/')) {
                    const urlObj = new URL(baseUrl);
                    absoluteKeyUri = urlObj.origin + keyUri;
                } else {
                    const urlObj = new URL(baseUrl);
                    const basePath = urlObj.pathname.substring(0, urlObj.pathname.lastIndexOf('/') + 1);
                    absoluteKeyUri = urlObj.origin + basePath + keyUri;
                }
                
                keyMap[method] = {
                    method: method,
                    uri: absoluteKeyUri,
                    iv: iv
                };
            }
        }
    }
    
    return keyMap;
}

// Intercept fetch requests untuk mendeteksi m3u8 URLs
const originalFetch = window.fetch;
window.fetch = function(...args) {
    // Wrapper fetch dengan CORS handling
    let url = args[0];
    let options = args[1] || {};
    
    // Set dynamic user-agent for all requests
    if (!options.headers) options.headers = {};
    if (!options.headers['User-Agent']) {
        options.headers['User-Agent'] = getRandomUserAgent();
    }
    
    // Apply CORS bypass jika diperlukan (check by comparing URL parts instead of plaintext domain)
    if (typeof url === 'string' && (url.includes('.my.id')  || url.includes('play?'))) {
        url = getCORSUrl(url);
    }
    
    const result = originalFetch.apply(this, [url, options]);
    
    result.then(response => {
        // Clone response untuk checking
        const clonedResponse = response.clone();
        
        // Cek jika response URL mengandung .m3u8
        if (response.url && response.url.includes('.m3u8')) {
            const newUrl = response.url.split('?')[0]; // Hapus query params jika ada
            
            // Jika belum dalam collection, tambahkan
            if (!m3u8UrlMap[newUrl]) {
                // Parse M3U8 untuk quality info
                clonedResponse.text().then(data => {
                    const qualityInfo = extractQualityFromM3U8(data);
                    
                    // Extract encryption keys jika ada
                    const encryptionKeys = extractHLSKeys(data, response.url);
                    if (Object.keys(encryptionKeys).length > 0) {
                        hlsKeyMap[newUrl] = encryptionKeys;
                    }
                    
                    // Simpan ke map
                    m3u8UrlMap[newUrl] = qualityInfo;
                    
                    // Tambah ke detectedQualities jika belum ada
                    if (!detectedQualities.some(q => q.url === newUrl)) {
                        detectedQualities.push({
                            name: qualityInfo.name,
                            resolution: qualityInfo.resolution,
                            bandwidth: qualityInfo.bandwidth,
                            url: newUrl
                        });
                        
                        displayQualitySelector();
                        selectPreferredQuality(); // Auto-select preferred quality
                    }
                    
                    // Set sebagai current jika belum ada
                    if (!currentM3U8URL) {
                        updateVideoSource(newUrl);
                    }
                }).catch(err => {
                    // Fallback tanpa parse
                    if (!m3u8UrlMap[newUrl]) {
                        m3u8UrlMap[newUrl] = { name: 'Quality', resolution: '', bandwidth: '' };
                        if (!detectedQualities.some(q => q.url === newUrl)) {
                            detectedQualities.push({
                                name: 'Quality',
                                url: newUrl
                            });
                            displayQualitySelector();
                            selectPreferredQuality(); // Auto-select preferred quality
                        }
                    }
                });
            }
        }
        
        return response;
    }).catch(err => {
        // Silently catch errors
    });
    
    return result;
};

// Deteksi XMLHttpRequest untuk m3u8 URLs
const originalOpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function(method, url, ...rest) {
    if (url && url.includes('.m3u8')) {
        const newUrl = url.split('?')[0];
        
        // Jika belum dalam collection, tambahkan
        if (!m3u8UrlMap[newUrl]) {
            m3u8UrlMap[newUrl] = { name: 'Quality', resolution: '', bandwidth: '' };
            
            if (!detectedQualities.some(q => q.url === newUrl)) {
                detectedQualities.push({
                    name: 'Quality',
                    url: newUrl
                });
                displayQualitySelector();
                selectPreferredQuality(); // Auto-select preferred quality
            }
        }
    }
    return originalOpen.apply(this, [method, url, ...rest]);
};

// ============ END M3U8 AUTO-DETECT ============

// Extract quality info dari M3U8 content
function extractQualityFromM3U8(m3u8Content) {
    let resolution = 'Standard';
    let bandwidth = '';
    let fps = '';
    
    const lines = m3u8Content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Cek jika ada #EXT-X-STREAM-INF untuk master playlist
        if (line.includes('#EXT-X-STREAM-INF')) {
            const resMatch = line.match(/RESOLUTION=(\d+)x(\d+)/);
            const bandwidthMatch = line.match(/BANDWIDTH=(\d+)/);
            const fpsMatch = line.match(/FRAME-RATE=([\d.]+)/);
            
            if (resMatch) {
                const height = resMatch[2];
                resolution = height + 'p';
                
                // Extract fps jika ada
                if (fpsMatch) {
                    const fpsValue = fpsMatch[1];
                    if (fpsValue === '60' || fpsValue === '60.0') {
                        fps = ' 60fps';
                    } else if (fpsValue !== '30' && fpsValue !== '30.0') {
                        fps = ` ${fpsValue}fps`;
                    }
                }
            }
            
            if (bandwidthMatch) {
                const bitrate = parseInt(bandwidthMatch[1]);
                if (bitrate > 1000000) {
                    bandwidth = (bitrate / 1000000).toFixed(1) + 'Mbps';
                } else {
                    bandwidth = (bitrate / 1000).toFixed(0) + 'kbps';
                }
            }
            
            break; // Ambil yang pertama saja
        }
    }
    
    const name = bandwidth ? `${resolution}${fps} (${bandwidth})` : `${resolution}${fps}`;
    
    return {
        name: name,
        resolution: resolution,
        bandwidth: bandwidth,
        fps: fps
    };
}

// Auto-select preferred quality (1080p 60fps > 1080p > highest)
function selectPreferredQuality() {
    if (detectedQualities.length === 0) return;
    
    let preferredIndex = -1;
    
    // Priority 1: 1080p 60fps
    preferredIndex = detectedQualities.findIndex(q => 
        q.resolution === '1080p' && q.name.includes('60fps')
    );
    
    // Priority 2: 1080p
    if (preferredIndex === -1) {
        preferredIndex = detectedQualities.findIndex(q => q.resolution === '1080p');
    }
    
    // Priority 3: Highest resolution
    if (preferredIndex === -1) {
        const sorted = [...detectedQualities].map((q, i) => ({ ...q, originalIndex: i }))
            .sort((a, b) => parseInt(b.resolution) - parseInt(a.resolution));
        if (sorted.length > 0) {
            preferredIndex = sorted[0].originalIndex;
        }
    }
    
    // Auto-select preferred quality
    if (preferredIndex !== -1 && currentM3U8URL !== detectedQualities[preferredIndex].url) {
        switchQuality(preferredIndex);
    }
}

// Tampilkan quality selector UI dengan style lebih baik
function displayQualitySelector() {
    let selector = document.getElementById('qualitySelector');
    
    if (!selector) {
        selector = document.createElement('div');
        selector.id = 'qualitySelector';
        selector.style.cssText = `
            position: absolute;
            top: 15px;
            right: 15px;
            background: linear-gradient(135deg, rgba(0, 0, 0, 0.98) 0%, rgba(30, 30, 30, 0.98) 100%);
            color: white;
            padding: 0;
            border-radius: 12px;
            font-size: 12px;
            z-index: 1000;
            border: 2px solid #64E7D8;
            max-height: 450px;
            overflow-y: auto;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            box-shadow: 0 8px 32px rgba(100, 231, 216, 0.25), 0 4px 16px rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(10px);
            animation: slideInRight 0.3s ease-out;
        `;
        
        if (videoElement && videoElement.parentElement) {
            videoElement.parentElement.style.position = 'relative';
            videoElement.parentElement.insertBefore(selector, videoElement.nextSibling);
        }
        
        // Add CSS animations
        if (!document.getElementById('qualitySelectorStyles')) {
            const style = document.createElement('style');
            style.id = 'qualitySelectorStyles';
            style.textContent = `
                @keyframes slideInRight {
                    from {
                        opacity: 0;
                        transform: translateX(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                
                #qualitySelector::-webkit-scrollbar {
                    width: 6px;
                }
                
                #qualitySelector::-webkit-scrollbar-track {
                    background: rgba(100, 231, 216, 0.1);
                    border-radius: 3px;
                }
                
                #qualitySelector::-webkit-scrollbar-thumb {
                    background: #64E7D8;
                    border-radius: 3px;
                }
                
                #qualitySelector::-webkit-scrollbar-thumb:hover {
                    background: #FFB366;
                }
                
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.6; }
                }
                
                .quality-loading {
                    animation: pulse 1.5s ease-in-out infinite;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    let html = `
        <div style="
            background: linear-gradient(90deg, #FFB366 0%, #FF9D4C 100%);
            padding: 12px 16px;
            border-radius: 10px 10px 0 0;
            font-weight: bold;
            color: white;
            display: flex;
            align-items: center;
            gap: 8px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        ">
            <span style="font-size: 18px;">🎬</span>
            <span>Pilih Kualitas</span>
            <span style="
                margin-left: auto;
                font-size: 10px;
                background: rgba(255, 255, 255, 0.2);
                padding: 2px 8px;
                border-radius: 12px;
            ">${detectedQualities.length} Quality</span>
        </div>
        <div style="padding: 12px; max-height: 380px; overflow-y: auto;">
    `;
    
    if (detectedQualities.length === 0) {
        html += `
            <div style="
                text-align: center;
                padding: 20px 10px;
                color: #aaa;
                font-size: 11px;
            ">
                <div style="font-size: 24px; margin-bottom: 8px;">⏳</div>
                <div>Mendeteksi kualitas...</div>
            </div>
        `;
    } else {
        // Sort qualities by resolution (highest first)
        const sorted = [...detectedQualities].sort((a, b) => {
            const aRes = parseInt(a.resolution) || 0;
            const bRes = parseInt(b.resolution) || 0;
            return bRes - aRes;
        });
        
        sorted.forEach((quality, idx) => {
            const origIndex = detectedQualities.indexOf(quality);
            const isActive = currentM3U8URL === quality.url;
            
            // Get quality icon
            let icon = '○';
            const res = parseInt(quality.resolution);
            if (res >= 1080) icon = '🎞️';
            else if (res >= 720) icon = '🎬';
            else if (res >= 480) icon = '📹';
            else icon = '📺';
            
            // Get fps badge
            const fpsBadge = quality.bandwidth ? `<span style="
                font-size: 9px;
                background: rgba(100, 231, 216, 0.2);
                color: #64E7D8;
                padding: 1px 6px;
                border-radius: 8px;
                margin-left: 4px;
            ">${quality.bandwidth}</span>` : '';
            
            html += `
                <button onclick="switchQuality(${origIndex})" style="
                    display: flex;
                    align-items: center;
                    width: 100%;
                    margin: 6px 0;
                    padding: 10px 12px;
                    background: ${isActive ? 'linear-gradient(90deg, #FFB366 0%, #FF9D4C 100%)' : 'rgba(100, 231, 216, 0.05)'};
                    color: white;
                    border: ${isActive ? '2px solid #FFB366' : '1px solid rgba(100, 231, 216, 0.3)'};
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 12px;
                    text-align: left;
                    transition: all 0.2s ease;
                    font-weight: ${isActive ? '600' : '500'};
                    gap: 8px;
                " onmouseover="this.style.background='${isActive ? 'linear-gradient(90deg, #FFB366 0%, #FF9D4C 100%)' : 'rgba(100, 231, 216, 0.15)'}'; this.style.transform='translateX(2px)'" 
                   onmouseout="this.style.background='${isActive ? 'linear-gradient(90deg, #FFB366 0%, #FF9D4C 100%)' : 'rgba(100, 231, 216, 0.05)'}'; this.style.transform='translateX(0)'">
                    <span style="font-size: 16px;">${icon}</span>
                    <div style="flex: 1; display: flex; flex-direction: column; gap: 2px;">
                        <div style="display: flex; align-items: center; gap: 4px;">
                            ${isActive ? '▶' : ''}
                            <strong style="font-size: 13px;">${quality.resolution}</strong>
                            ${fpsBadge}
                        </div>
                    </div>
                    ${isActive ? '<span style="font-size: 12px; color: #FFB366;">✓</span>' : ''}
                </button>
            `;
        });
    }
    
    html += `</div>`;
    selector.innerHTML = html;
}

// ============ PROXY URL CONVERSION ============
// Convert M3U8 URL ke proxy relay URL
function getProxyM3U8URL(originalUrl) {
    if (!originalUrl) return originalUrl;
    
    // Get base URL untuk proxy (domain Vercel Anda)
    const proxyBase = window.location.origin;
    
    // Encode original URL
    const encodedUrl = encodeURIComponent(originalUrl);
    
    // Return proxy URL
    return `${proxyBase}/api/playlist?url=${encodedUrl}`;
}

// Switch ke quality tertentu
function switchQuality(index) {
    if (detectedQualities[index]) {
        const quality = detectedQualities[index];
        updateVideoSource(quality.url);
    }
}

function updateVideoSource(url) {
    if (!url) return;
    
    // Convert ke proxy URL
    const proxyUrl = getProxyM3U8URL(url);
    
    currentM3U8URL = url;
    lastValidM3U8URL = url; // Backup URL
    retryCount = 0; // Reset retry count on new URL
    
    addNotificationStyles();
    
    if (Hls.isSupported()) {
        const hlsConfig = {
            enableWorker: true,
            lowLatencyMode: true,
            maxBufferLength: 30,
            fragLoadingTimeOut: 20000,
            manifestLoadingTimeOut: 10000,
            levelLoadingTimeOut: 10000,
            progressive: true,
            debug: false
        };
        
        // Setup headers dengan dynamic user-agent
        hlsConfig.fetchSetup = (context, initParams) => {
            initParams.credentials = 'include';
            initParams.headers = {
                'User-Agent': getRandomUserAgent(),
                'Accept': '*/*',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Referer': window.location.origin,
                'Cache-Control': 'no-cache'
            };
            return initParams;
        };
        
        // Destroy previous instance
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
        
        const hls = new Hls(hlsConfig);
        hlsInstance = hls;
        
        // ============ COMPREHENSIVE ERROR HANDLING ============
        
        hls.on(Hls.Events.ERROR, function(event, data) {
            if (!data.fatal) return;
            
            const errorType = data.type;
            const errorDetails = data.details;
            
            switch(errorType) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                    // Network error - bisa karena expired URL atau server down
                    if (data.response?.status === 404 || data.response?.status === 401) {
                        // URL expired atau unauthorized
                        console.warn(`M3U8 link expired (HTTP ${data.response.status}), attempting recovery...`);
                        handleExpiredM3U8();
                    } else if (retryCount < maxRetries) {
                        // General network error - retry
                        retryCount++;
                        const delay = Math.min(1000 * Math.pow(2, retryCount), 10000); // Exponential backoff
                        console.warn(`Network error, retry ${retryCount}/${maxRetries} in ${delay}ms`);
                        setTimeout(() => hls.startLoad(), delay);
                    } else {
                        console.error('Jaringan tidak stabil, gagal memuat stream');
                    }
                    break;
                    
                case Hls.ErrorTypes.MEDIA_ERROR:
                    // Media error - try recovery
                    console.warn('Media error detected, attempting recovery...');
                    hls.recoverMediaError();
                    break;
                    
                case Hls.ErrorTypes.MUX_ERROR:
                    // Mux error - usually unrecoverable
                    console.error('Mux error:', errorDetails);
                    if (retryCount < maxRetries) {
                        retryCount++;
                        console.warn('Error mux, mencoba ulang...');
                        setTimeout(() => tryFallbackQuality(), 2000);
                    }
                    break;
                    
                default:
                    console.error('Unknown fatal error:', data);
                    handleExpiredM3U8();
            }
        });
        
        // Handle manifest parse errors
        hls.on(Hls.Events.MANIFEST_PARSE_ERROR, function(event, data) {
            console.error('Manifest parse error:', data);
            showErrorNotification('Format M3U8 tidak valid');
            handleExpiredM3U8();
        });
        
        // Handle buffer appended - connection successful
        hls.on(Hls.Events.BUFFER_APPENDED, function() {
            if (retryCount > 0) {
                retryCount = 0; // Reset on success
                console.log('Stream berhasil di-restore');
            }
        });
        
        // Handle fragment loaded errors
        hls.on(Hls.Events.FRAG_LOAD_EMERGENCY_ABORTED, function() {
            console.warn('Fragment load emergency abort');
            if (retryCount < maxRetries) {
                retryCount++;
                hls.startLoad();
            }
        });
        
        // Successful manifest parsed
        hls.on(Hls.Events.MANIFEST_PARSED, function() {
            console.log('Manifest successfully loaded');
            videoElement.play().catch(e => console.warn('Play error:', e));
            
            // Start periodic health check
            startPeriodicHealthCheck(hls);
        });
        
        // Load dari proxy URL, bukan original URL
        hls.loadSource(proxyUrl);
        hls.attachMedia(videoElement);
        
    } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari fallback - juga gunakan proxy
        videoSource.src = proxyUrl;
        videoElement.load();
        videoElement.play().catch(e => {});
    }
    
    // Update quality selector UI
    displayQualitySelector();
}

// Handle expired M3U8 URLs
function handleExpiredM3U8() {
    console.warn('M3U8 URL expired, attempting recovery...');
    console.warn('Link stream expired, mencari alternatif...');
    
    // Try fallback to other detected qualities
    if (!tryFallbackQuality()) {
        // No backup available - reload from source
        console.warn('No fallback available, attempting full reload...');
        setTimeout(() => {
            initLivestream();
        }, 3000);
    }
}

// Try to switch to fallback quality
function tryFallbackQuality() {
    if (detectedQualities.length === 0) return false;
    
    // Find a different quality to try
    for (let i = detectedQualities.length - 1; i >= 0; i--) {
        const quality = detectedQualities[i];
        if (quality.url !== currentM3U8URL) {
            console.log('Switching to fallback quality:', quality.name);
            updateVideoSource(quality.url);
            showErrorNotification(`Switching ke: ${quality.name}`);
            return true;
        }
    }
    
    return false;
}

// Periodic health check untuk detect jika link expires
function startPeriodicHealthCheck(hlsInstance) {
    // Clear previous interval
    if (urlRefreshInterval) clearInterval(urlRefreshInterval);
    
    // Check setiap 30 detik
    urlRefreshInterval = setInterval(() => {
        if (!videoElement.playing && retryCount === 0) {
            // Video stopped dan no error - mungkin user pause
            return;
        }
        
        // Check jika ada buffer underrun atau stalling
        if (videoElement.buffered.length === 0 && videoElement.currentTime > 0) {
            console.warn('Buffer underrun detected');
            if (retryCount < maxRetries) {
                retryCount++;
                hlsInstance.startLoad();
            }
        }
        
        // Check HLS level state
        if (hlsInstance && hlsInstance.levels) {
            const currentLevel = hlsInstance.currentLevel;
            if (currentLevel === -1) {
                console.warn('No level selected, restarting...');
                hlsInstance.startLoad();
            }
        }
    }, 30000);
}

function detectDevice() {
    const userAgent = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isTablet = /iPad|Android(?!.*Mobi)/i.test(userAgent);
    
    let deviceType = 'Desktop';
    if (isTablet) {
        deviceType = 'Tablet';
    } else if (isMobile) {
        deviceType = 'Mobile';
    }
    
    // Device info disembunyikan
}

async function initLivestream() {
    addNotificationStyles();
    
    // Fetch dari SOURCE_WEBSITE dengan CORS bypass
    try {
        const corsUrl = getCORSUrl(SOURCE_WEBSITE);
        const response = await originalFetch(corsUrl);
        const html = await response.text();
        
        // Tunggu untuk M3U8 interception dari fetch awal
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Cari dan trigger quality buttons/selectors jika ada di DOM
        triggerQualitySelectors();
        
    } catch (error) {
        showErrorNotification('Gagal memuat sumber stream');
    }
    
    // Smart quality detection - tunggu requests dan monitor
    await triggerSmartQualityDetection();
    
    // Additional wait untuk semua background requests
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Auto-select preferred quality after all detection attempts
    selectPreferredQuality();
    
    // Start auto M3U8 refresh untuk handle expired URLs
    startAutoM3U8Refresh();
    
    // Monitor quality detections untuk new qualities
    let lastCount = 0;
    const monitorInterval = setInterval(() => {
        if (detectedQualities.length > lastCount) {
            lastCount = detectedQualities.length;
            selectPreferredQuality(); // Update selection if new qualities detected
        }
    }, 2000);
}

// Function untuk trigger quality selector buttons di page ngidolihub
function triggerQualitySelectors() {
    const qualityButtons = document.querySelectorAll(
        '[class*="quality"], [class*="resolution"], [data-quality], button[title*="quality"], button[title*="resolution"]'
    );
    
    // Trigger click pada setiap quality button
    qualityButtons.forEach((btn, idx) => {
        setTimeout(() => {
            try {
                btn.click();
            } catch (e) {}
        }, idx * 800);
    });
}

// Smart quality detection - tunggu dan monitor requests
async function triggerSmartQualityDetection() {
    // Since ngidolihub uses unique ID system, we don't brute force
    // Instead, we rely on network interception and monitoring
    // Multiple attempts to trigger quality detection
    
    const qualitySelectors = document.querySelectorAll(
        '[class*="quality"], [class*="resolution"], [data-quality], ' +
        'button[title*="quality"], button[title*="resolution"], ' +
        '[class*="bitrate"], [class*="stream"]'
    );
    
    qualitySelectors.forEach((element, idx) => {
        setTimeout(() => {
            try {
                // Try clicking various quality triggers
                if (element.click) element.click();
                if (element.onchange) element.onchange();
            } catch (e) {}
        }, idx * 600);
    });
    
    // Wait for any quality selections to propagate through fetch
    for (let i = 0; i < 5; i++) {
        await new Promise(r => setTimeout(r, 800));
        // If we got new qualities, mission accomplished
        if (detectedQualities.length > 0) break;
    }
}

// ============ AUTO M3U8 REFRESH MECHANISM ============
// Fungsi untuk secara berkala fetch M3U8 baru (dalam case URL lama expired)
let autoRefreshInterval = null;
const M3U8_REFRESH_INTERVAL = 5 * 60 * 1000; // Refresh setiap 5 menit

function startAutoM3U8Refresh() {
    if (autoRefreshInterval) clearInterval(autoRefreshInterval);
    
    autoRefreshInterval = setInterval(async () => {
        console.log('Auto-refreshing M3U8 URLs...');
        
        try {
            const corsUrl = getCORSUrl(SOURCE_WEBSITE);
            await originalFetch(corsUrl, {
                headers: {
                    'User-Agent': getRandomUserAgent()
                }
            }).then(r => r.text()).catch(() => {});
            
            // Fetch akan trigger m3u8 interception otomatis
            await new Promise(r => setTimeout(r, 1500));
            
            // Log new qualities if any
            if (detectedQualities.length > 0) {
                console.log(`M3U8 refresh: found ${detectedQualities.length} qualities`);
            }
        } catch (error) {
            console.warn('M3U8 auto-refresh failed:', error);
        }
    }, M3U8_REFRESH_INTERVAL);
}

document.addEventListener('DOMContentLoaded', function() {
    detectDevice();
    setupDoubleClickSeek();
});

