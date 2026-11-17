const cloudinary = require('../config/cloudinary');

/**
 * Uploads a buffer (from multer memoryStorage) to Cloudinary via its
 * upload_stream API, wrapped in a Promise for async/await use in services.
 */
function uploadBufferToCloudinary(buffer, { folder, resourceType = 'auto', publicId }) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        public_id: publicId,
        overwrite: true,
      },
      (error, result) => {
        if (error) return reject(error);
        return resolve(result);
      },
    );
    uploadStream.end(buffer);
  });
}

async function deleteFromCloudinary(publicId, resourceType = 'auto') {
  if (!publicId) return null;
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}

module.exports = { uploadBufferToCloudinary, deleteFromCloudinary };
