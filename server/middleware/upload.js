const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary with credentials from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Tell multer to upload directly to Cloudinary instead of local disk.
// Files are stored permanently in Cloudinary's cloud storage, so they
// survive backend redeploys/restarts — unlike local disk storage on
// free hosting tiers, which is not guaranteed to persist.
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'lendnest-items', // groups all item photos under one folder in Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 1200, height: 1200, crop: 'limit' }], // caps oversized images
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

module.exports = upload;