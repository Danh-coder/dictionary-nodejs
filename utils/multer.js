const multer = require('multer');
const path = require('path');

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images/uploads/');
  },
  filename: (req, file, cb) => {
    // Extract the file extension
    const ext = path.extname(file.originalname);
    // Use the original file name
    const originalName = path.basename(file.originalname, ext);
    cb(null, `${originalName}${ext}`);
  }
});

// Initialize multer with the storage configuration
const upload = multer({ storage: storage });

module.exports = upload;
