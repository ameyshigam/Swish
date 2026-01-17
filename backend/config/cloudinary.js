const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        const isPdf = file.mimetype === 'application/pdf';
        return {
            folder: 'swish_uploads',
            resource_type: 'auto',
            transformation: isPdf ? [{ flags: 'attachment' }] : [{ width: 1000, crop: 'limit' }]
        };
    }
});

const upload = multer({ storage: storage });

module.exports = { upload, cloudinary };
