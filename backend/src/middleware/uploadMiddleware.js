const multer = require('multer');
const ApiError = require('../utils/ApiError');

const ALLOWED_RESUME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const ALLOWED_IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);

const MAX_RESUME_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

/**
 * Buffers the file in memory (never written to local disk) so it can be
 * streamed straight to Cloudinary, satisfying the PRD's "never store
 * files inside the application server" requirement.
 */
const storage = multer.memoryStorage();

function fileFilterFactory(allowedTypes, label) {
  return (req, file, cb) => {
    if (!allowedTypes.has(file.mimetype)) {
      cb(ApiError.badRequest(`Invalid file type for ${label}: ${file.mimetype}`));
      return;
    }
    cb(null, true);
  };
}

const uploadResume = multer({
  storage,
  limits: { fileSize: MAX_RESUME_SIZE_BYTES },
  fileFilter: fileFilterFactory(ALLOWED_RESUME_TYPES, 'resume'),
});

const uploadImage = multer({
  storage,
  limits: { fileSize: MAX_IMAGE_SIZE_BYTES },
  fileFilter: fileFilterFactory(ALLOWED_IMAGE_TYPES, 'image'),
});

module.exports = { uploadResume, uploadImage };
