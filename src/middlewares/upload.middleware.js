const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// Storage cho CCCD
const cccdStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "CCCD",
        allowed_formats: ["jpg", "png", "jpeg", "webp"],
        transformation: [{ width: 800, height: 800, crop: "limit" }],
    },
});

// Storage cho ảnh cá nhân
const avatarStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "Avatar",
        allowed_formats: ["jpg", "png", "jpeg", "webp"],
        transformation: [{ width: 500, height: 500, crop: "limit" }],
    },
});

// Multer middleware
const uploadCCCD = multer({ storage: cccdStorage });
const uploadAvatar = multer({ storage: avatarStorage });

module.exports = { uploadCCCD, uploadAvatar };
