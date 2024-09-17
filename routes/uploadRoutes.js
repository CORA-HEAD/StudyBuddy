const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const uploadController = require('../controllers/uploadController'); // Import the controller
const router = express.Router();
const admin_authenticated = require('../middlewares/admin_authenticated');

// Set up storage for multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../public/uploads/');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueFileName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueFileName);
    }
});

const upload = multer({ storage });

// Routes
router.get('/upload', admin_authenticated, uploadController.renderUploadForm);
router.post(
    '/upload', admin_authenticated,
    upload.fields([
        { name: 'video_file', maxCount: 1 },
        { name: 'course_image', maxCount: 1 }
    ]),
    uploadController.uploadVideo
);
router.get('/success/:id', admin_authenticated, uploadController.uploadSuccess);
router.get('/all', admin_authenticated, uploadController.getAllVideos);
module.exports = router;
