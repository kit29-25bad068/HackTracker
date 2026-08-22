import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadsDir = path.join(process.cwd(), 'uploads');
const certificatesDir = path.join(uploadsDir, 'certificates');
const avatarsDir = path.join(uploadsDir, 'avatars');
const bannersDir = path.join(uploadsDir, 'banners');
const logosDir = path.join(uploadsDir, 'logos');

[uploadsDir, certificatesDir, avatarsDir, bannersDir, logosDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'certificate') {
      cb(null, certificatesDir);
    } else if (file.fieldname === 'avatar') {
      cb(null, avatarsDir);
    } else if (file.fieldname === 'banner' || file.fieldname === 'cover') {
      cb(null, bannersDir);
    } else if (file.fieldname === 'logo') {
      cb(null, logosDir);
    } else {
      cb(null, uploadsDir);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|pdf/;
    const extname = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowed.test(file.mimetype) || file.mimetype === 'application/pdf';

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPG, PNG, WebP) and PDF certificates are supported.'));
    }
  },
});
