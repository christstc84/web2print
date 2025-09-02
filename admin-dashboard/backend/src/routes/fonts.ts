import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { PrintService } from '../services/database';

const router = express.Router();

// Configure multer for font file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'fonts');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'ttf,otf,woff,woff2').split(',');
    const fileExt = path.extname(file.originalname).toLowerCase().substring(1);
    
    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`));
    }
  }
});

// GET /api/fonts - Get all fonts
router.get('/', async (req, res) => {
  try {
    const fonts = await PrintService.getAllFonts();
    res.json(fonts);
  } catch (error) {
    console.error('Error fetching fonts:', error);
    res.status(500).json({ error: 'Failed to fetch fonts' });
  }
});

// GET /api/fonts/:id - Get font by ID
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid font ID' });
    }

    const font = await PrintService.getFontById(id);
    if (!font) {
      return res.status(404).json({ error: 'Font not found' });
    }

    res.json(font);
  } catch (error) {
    console.error('Error fetching font:', error);
    res.status(500).json({ error: 'Failed to fetch font' });
  }
});

// POST /api/fonts/upload - Upload font file
router.post('/upload', upload.single('font'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No font file provided' });
    }

    const filePath = `/uploads/fonts/${req.file.filename}`;
    
    res.json({
      success: true,
      filePath,
      originalName: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    console.error('Error uploading font:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Upload failed' 
    });
  }
});

// POST /api/fonts - Create new font
router.post('/', async (req, res) => {
  try {
    const {
      name,
      display_name,
      file_name,
      file_path,
      file_size,
      font_format,
      font_family,
      uploaded_by
    } = req.body;

    // Validate required fields
    if (!name || !display_name || !file_name || !file_path || !font_format || !font_family) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const fontId = await PrintService.createFont({
      name,
      display_name,
      file_name,
      file_path,
      file_size: parseInt(file_size) || 0,
      font_format,
      font_family,
      uploaded_by: uploaded_by ? parseInt(uploaded_by) : null
    });

    res.status(201).json({ id: fontId });
  } catch (error) {
    console.error('Error creating font:', error);
    res.status(500).json({ error: 'Failed to create font' });
  }
});

// DELETE /api/fonts/:id - Delete font
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid font ID' });
    }

    // Get font info before deletion for file cleanup
    const font = await PrintService.getFontById(id);
    if (!font) {
      return res.status(404).json({ error: 'Font not found' });
    }

    // Soft delete in database
    const affectedRows = await PrintService.deleteFont(id);
    
    if (affectedRows === 0) {
      return res.status(404).json({ error: 'Font not found' });
    }

    // Optional: Delete physical file
    try {
      const filePath = path.join(process.cwd(), font.file_path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (fileError) {
      console.warn('Could not delete font file:', fileError);
      // Don't fail the API call if file deletion fails
    }

    res.json({ message: 'Font deleted successfully' });
  } catch (error) {
    console.error('Error deleting font:', error);
    res.status(500).json({ error: 'Failed to delete font' });
  }
});

export default router;
