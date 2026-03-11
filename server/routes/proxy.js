const express = require('express');
const router = express.Router();
const https = require('https');
const http = require('http');
const { protect } = require('../middleware/auth');

// ── #13 SSRF Protection ───────────────────────────────────────────────────────
// Only allow proxying requests to explicitly approved external hostnames.
// All others receive a 403 to prevent Server-Side Request Forgery attacks,
// which could allow attackers to reach internal services (Redis, MongoDB, etc.)
const ALLOWED_PROXY_HOSTS = process.env.ALLOWED_PROXY_HOSTS
    ? process.env.ALLOWED_PROXY_HOSTS.split(',').map(h => h.trim().toLowerCase())
    : [
        'ecokids.net',
        'www.ecokids.net',
        'ncert.nic.in',
        'www.ncert.nic.in',
        'cbse.gov.in',
        'www.cbse.gov.in'
    ];

const NORMALIZED_ALLOWED_PROXY_HOSTS = ALLOWED_PROXY_HOSTS
    .map((host) => host.replace(/^www\./, ''))
    .filter(Boolean);

const validateProxyUrl = (req, res, next) => {
    const { url } = req.query;
    if (!url) return res.status(400).send('URL parameter is required');

    let parsed;
    try {
        parsed = new URL(url);
    } catch {
        return res.status(400).send('Invalid URL format');
    }

    if (!['http:', 'https:'].includes(parsed.protocol)) {
        return res.status(400).json({ success: false, message: 'Only HTTP(S) proxy targets are allowed' });
    }

    // Block private/loopback addresses regardless of hostname
    const hostname = parsed.hostname.toLowerCase();
    const blockedPatterns = [/^localhost$/i, /^127\./, /^10\./, /^172\.(1[6-9]|2\d|3[01])\./, /^192\.168\./, /^::1$/, /^0\.0\.0\.0$/];
    if (blockedPatterns.some(p => p.test(hostname))) {
        return res.status(403).json({ success: false, message: 'Loopback/private addresses are not permitted' });
    }

    // Allowlist check
    if (!NORMALIZED_ALLOWED_PROXY_HOSTS.includes(hostname.replace(/^www\./, ''))) {
        return res.status(403).json({ success: false, message: `Proxy target not permitted: ${hostname}` });
    }

    req.validatedProxyUrl = url;
    next();
};

// All proxy routes require authentication (prevent open proxy abuse)
router.use(protect);


router.get('/', validateProxyUrl, async (req, res) => {
    try {
        const url = req.validatedProxyUrl;
        const client = url.startsWith('https') ? https : http;

        client.get(url, (proxyRes) => {
            // Forward status code
            res.status(proxyRes.statusCode);

            // Forward headers, but strip X-Frame-Options and CSP
            Object.keys(proxyRes.headers).forEach((key) => {
                if (
                    key.toLowerCase() !== 'x-frame-options' &&
                    key.toLowerCase() !== 'content-security-policy' &&
                    key.toLowerCase() !== 'frame-options'
                ) {
                    res.setHeader(key, proxyRes.headers[key]);
                }
            });

            // Handle redirects manually if needed, or let the browser handle them if we forward 3xx
            // But typically for an iframe proxy we want to follow redirects on the server
            // For simplicity in this v1, we'll pipe. If redirects happen, the browser might try to follow them 
            // relative to our proxy which could contain the proxy param again? 
            // Actually, if we pipe a 301, the browser sees a 301 from /api/proxy?url=... to Location. 
            // If Location is absolute, browser goes there (outside proxy).
            // So we should really follow redirects on the server.

            let data = '';

            proxyRes.on('data', (chunk) => {
                data += chunk;
            });

            proxyRes.on('end', () => {
                // Simple content rewriting to inject base tag
                // This ensures relative links (images, css) resolve against the original URL
                let html = data.toString();

                // Only rewrite HTML content
                const contentType = proxyRes.headers['content-type'] || '';
                if (contentType.includes('text/html')) {
                    const baseUrl = new URL(url).origin;
                    const lang = req.query.lang || 'en';

                    // Inject base tag
                    html = html.replace('<head>', `<head><base href="${url}" />`);

                    // Inject Google Translate script and cookie setting logic
                    // We use the 'googtrans' cookie which the Google Translate Element reads to auto-translate
                    // Format: /source/target (e.g., /auto/hi)
                    const translateInjection = `
                     <script type="text/javascript">
                       // Set the cookie for Google Translate to auto-pick the language
                       document.cookie = "googtrans=/auto/${lang}; path=/; domain=" + window.location.hostname;
                       document.cookie = "googtrans=/auto/${lang}; path=/";
                       
                       function googleTranslateElementInit() {
                         new google.translate.TranslateElement({
                           pageLanguage: 'auto', 
                           includedLanguages: '${lang}', 
                           layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
                           autoDisplay: false
                         }, 'google_translate_element');
                       }
                     </script>
                     <script type="text/javascript" src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"></script>
                     <style>
                       body { top: 0 !important; } /* Fix Google Translate bar pushing body down */
                       .goog-te-banner-frame { display: none !important; } /* Hide the top banner */
                       #google_translate_element { display: none; } /* Hide the widget selector (since we auto-translate) */
                     </style>
                     <div id="google_translate_element"></div>
                   `;

                    html = html.replace('</body>', `${translateInjection}</body>`);
                }

                res.send(html);
            });

        }).on('error', (err) => {
            console.error('Proxy Error:', err);
            res.status(500).send('Proxy Request Failed');
        });

    } catch (error) {
        console.error('Proxy Route Error:', error);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
