/**
 * Image Optimization Middleware
 * Compresses uploaded images to <100KB using sharp before further processing.
 * Preserves original buffer for hash computation, stores optimized version.
 */

const sharp = require('sharp');

const MAX_SIZE_BYTES = 100 * 1024; // 100KB
const MAX_WIDTH = 1200;
const MAX_HEIGHT = 1200;
const QUALITY_START = 80;
const QUALITY_MIN = 40;

const optimizeImage = async (req, res, next) => {
    if (!req.file || !req.file.buffer) {
        return next();
    }

    // Only process images
    const mimeType = req.file.mimetype;
    if (!mimeType || !mimeType.startsWith('image/')) {
        return next();
    }

    try {
        // Store original buffer for hash computation (fraud detection needs original)
        req.file.originalBuffer = Buffer.from(req.file.buffer);

        const metadata = await sharp(req.file.buffer).metadata();
        const originalSize = req.file.buffer.length;

        // Skip if already small enough
        if (originalSize <= MAX_SIZE_BYTES && metadata.width <= MAX_WIDTH) {
            return next();
        }

        // Progressive compression: try reducing quality until under 100KB
        let quality = QUALITY_START;
        let optimized;

        while (quality >= QUALITY_MIN) {
            let pipeline = sharp(req.file.buffer)
                .resize(MAX_WIDTH, MAX_HEIGHT, {
                    fit: 'inside',
                    withoutEnlargement: true
                });

            // Convert to WebP for best compression, fallback to JPEG
            if (mimeType === 'image/png' || mimeType === 'image/webp') {
                pipeline = pipeline.webp({ quality, effort: 4 });
                req.file.mimetype = 'image/webp';
            } else {
                pipeline = pipeline.jpeg({ quality, progressive: true, mozjpeg: true });
                req.file.mimetype = 'image/jpeg';
            }

            // Strip EXIF but keep orientation
            pipeline = pipeline.rotate(); // auto-rotate based on EXIF then strip

            optimized = await pipeline.toBuffer();

            if (optimized.length <= MAX_SIZE_BYTES) break;
            quality -= 10;
        }

        req.file.buffer = optimized;
        req.file.size = optimized.length;

        // Log compression ratio
        const ratio = ((1 - optimized.length / originalSize) * 100).toFixed(1);
        console.log(`[ImageOpt] ${originalSize}B → ${optimized.length}B (${ratio}% saved, q=${quality})`);
    } catch (err) {
        // If optimization fails, proceed with original image
        console.error('[ImageOpt] Failed, using original:', err.message);
    }

    next();
};

module.exports = optimizeImage;
