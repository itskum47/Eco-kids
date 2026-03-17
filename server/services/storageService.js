const streamifier = require('streamifier');
const cloudinary = require('../config/cloudinary');

async function uploadImage(buffer, originalname = 'upload', mimetype = 'application/octet-stream') {
  if (!buffer) {
    throw new Error('Image buffer is required');
  }

  const folder = process.env.CLOUDINARY_UPLOAD_FOLDER || 'ecokids/activity-evidence';
  const extension = originalname.includes('.') ? originalname.split('.').pop() : '';
  const publicIdBase = extension ? originalname.slice(0, -(extension.length + 1)) : originalname;

  return new Promise((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        public_id: publicIdBase,
        overwrite: false,
        format: mimetype === 'image/png' ? 'png' : undefined
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve({
          url: result.secure_url,
          fileId: result.asset_id,
          publicId: result.public_id
        });
      }
    );

    streamifier.createReadStream(buffer).pipe(upload);
  });
}

module.exports = {
  uploadImage
};