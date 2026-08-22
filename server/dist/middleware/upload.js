"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const uploadsDir = path_1.default.join(process.cwd(), 'uploads');
const certificatesDir = path_1.default.join(uploadsDir, 'certificates');
const avatarsDir = path_1.default.join(uploadsDir, 'avatars');
const bannersDir = path_1.default.join(uploadsDir, 'banners');
const logosDir = path_1.default.join(uploadsDir, 'logos');
[uploadsDir, certificatesDir, avatarsDir, bannersDir, logosDir].forEach((dir) => {
    if (!fs_1.default.existsSync(dir)) {
        fs_1.default.mkdirSync(dir, { recursive: true });
    }
});
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === 'certificate') {
            cb(null, certificatesDir);
        }
        else if (file.fieldname === 'avatar') {
            cb(null, avatarsDir);
        }
        else if (file.fieldname === 'banner' || file.fieldname === 'cover') {
            cb(null, bannersDir);
        }
        else if (file.fieldname === 'logo') {
            cb(null, logosDir);
        }
        else {
            cb(null, uploadsDir);
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path_1.default.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
});
exports.upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|webp|pdf/;
        const extname = allowed.test(path_1.default.extname(file.originalname).toLowerCase());
        const mimetype = allowed.test(file.mimetype) || file.mimetype === 'application/pdf';
        if (extname && mimetype) {
            cb(null, true);
        }
        else {
            cb(new Error('Only image files (JPG, PNG, WebP) and PDF certificates are supported.'));
        }
    },
});
