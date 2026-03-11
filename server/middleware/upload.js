const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const allowedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/webp'
];

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG, PNG, and WebP allowed."), false);
  }
};

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB default
  },
  fileFilter: fileFilter
});

const validateMagicBytes = async (req, res, next) => {
  if (!req.file) return next();
  try {
    const fileType = await import('file-type');
    const type = await fileType.fileTypeFromBuffer(req.file.buffer);
    if (!type || !allowedMimeTypes.includes(type.mime)) {
      return res.status(400).json({ success: false, message: 'Invalid file format based on actual content representation.' });
    }
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: 'File magic byte validation failed.' });
  }
};

module.exports = { upload, validateMagicBytes };