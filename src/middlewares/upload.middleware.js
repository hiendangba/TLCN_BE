const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const cccdStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "CCCD",
        allowed_formats: ["jpg", "png", "jpeg", "webp"],
        transformation: [{ width: 800, height: 800, crop: "limit" }],
    },
});

const avatarStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "Avatar",
        allowed_formats: ["jpg", "png", "jpeg", "webp"],
        transformation: [{ width: 500, height: 500, crop: "limit" }],
    },
});

const numberPlateStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "NumberPlate",
        allowed_formats: ["jpg", "png", "jpeg", "webp"],
        transformation: [{ width: 1000, height: 600, crop: "limit" }], // hợp lý cho ảnh biển số
    },
});

const uploadCCCD = multer({ storage: cccdStorage });
const uploadAvatar = multer({ storage: avatarStorage });
const uploadNumberPlate = multer({ storage: numberPlateStorage });

module.exports = { uploadCCCD, uploadAvatar, uploadNumberPlate };
