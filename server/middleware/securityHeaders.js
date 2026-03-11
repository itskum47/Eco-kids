/**
 * BOOST-7: CERT-In Security Headers
 * Comprehensive security headers for Indian cybersecurity compliance
 */

const securityHeaders = (req, res, next) => {
  // Strict-Transport-Security (HSTS)
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  // Content-Security-Policy (CSP)
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.socket.io",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://api.openai.com wss://ecokids-india.onrender.com ws://localhost:* https://res.cloudinary.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ')
  );

  // X-Frame-Options (Clickjacking protection)
  res.setHeader('X-Frame-Options', 'DENY');

  // X-Content-Type-Options (MIME sniffing protection)
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // X-XSS-Protection (XSS filter for older browsers)
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer-Policy (Privacy protection)
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions-Policy (Feature restriction)
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(self), microphone=(), camera=(), payment=(), usb=()'
  );

  // X-DNS-Prefetch-Control (Privacy)
  res.setHeader('X-DNS-Prefetch-Control', 'off');

  // X-Download-Options (IE8+ download security)
  res.setHeader('X-Download-Options', 'noopen');

  // X-Permitted-Cross-Domain-Policies (Adobe products)
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');

  // Custom CERT-In Compliance Header
  res.setHeader('X-CERT-In-Compliant', 'true');
  res.setHeader('X-Indian-Data-Residency', 'ap-south-1');

  next();
};

module.exports = securityHeaders;
