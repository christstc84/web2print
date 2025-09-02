import { Router } from 'express';
import { PrintService } from '../services/database';

const router = Router();

// GET /api/colors - Get all colors
router.get('/', async (req, res) => {
  try {
    const colors = await PrintService.getAllColors();
    res.json(colors);
  } catch (error) {
    console.error('Error fetching colors:', error);
    res.status(500).json({ error: 'Failed to fetch colors' });
  }
});

// GET /api/colors/:id - Get color by ID
router.get('/:id', async (req, res) => {
  try {
    const colorId = parseInt(req.params.id);
    if (isNaN(colorId)) {
      return res.status(400).json({ error: 'Invalid color ID' });
    }

    const color = await PrintService.getColorById(colorId);
    if (!color) {
      return res.status(404).json({ error: 'Color not found' });
    }

    res.json(color);
  } catch (error) {
    console.error('Error fetching color:', error);
    res.status(500).json({ error: 'Failed to fetch color' });
  }
});

// POST /api/colors - Create new color
router.post('/', async (req, res) => {
  try {
    const {
      name,
      display_name,
      rgb_r,
      rgb_g,
      rgb_b,
      cmyk_c,
      cmyk_m,
      cmyk_y,
      cmyk_k,
      spot_color
    } = req.body;

    // Validation
    if (!name || !display_name) {
      return res.status(400).json({ error: 'Name and display name are required' });
    }

    // Validate RGB values
    if (rgb_r < 0 || rgb_r > 255 || rgb_g < 0 || rgb_g > 255 || rgb_b < 0 || rgb_b > 255) {
      return res.status(400).json({ error: 'RGB values must be between 0-255' });
    }

    // Validate CMYK values
    if (cmyk_c < 0 || cmyk_c > 100 || cmyk_m < 0 || cmyk_m > 100 || 
        cmyk_y < 0 || cmyk_y > 100 || cmyk_k < 0 || cmyk_k > 100) {
      return res.status(400).json({ error: 'CMYK values must be between 0-100' });
    }

    const colorId = await PrintService.createColor({
      name,
      display_name,
      rgb_r: parseInt(rgb_r),
      rgb_g: parseInt(rgb_g),
      rgb_b: parseInt(rgb_b),
      cmyk_c: parseInt(cmyk_c),
      cmyk_m: parseInt(cmyk_m),
      cmyk_y: parseInt(cmyk_y),
      cmyk_k: parseInt(cmyk_k),
      spot_color: spot_color || null
    });

    res.status(201).json({ id: colorId });
  } catch (error) {
    console.error('Error creating color:', error);
    res.status(500).json({ error: 'Failed to create color' });
  }
});

// PUT /api/colors/:id - Update color
router.put('/:id', async (req, res) => {
  try {
    const colorId = parseInt(req.params.id);
    if (isNaN(colorId)) {
      return res.status(400).json({ error: 'Invalid color ID' });
    }

    const {
      name,
      display_name,
      rgb_r,
      rgb_g,
      rgb_b,
      cmyk_c,
      cmyk_m,
      cmyk_y,
      cmyk_k,
      spot_color
    } = req.body;

    // Validation
    if (!name || !display_name) {
      return res.status(400).json({ error: 'Name and display name are required' });
    }

    // Validate RGB values
    if (rgb_r < 0 || rgb_r > 255 || rgb_g < 0 || rgb_g > 255 || rgb_b < 0 || rgb_b > 255) {
      return res.status(400).json({ error: 'RGB values must be between 0-255' });
    }

    // Validate CMYK values
    if (cmyk_c < 0 || cmyk_c > 100 || cmyk_m < 0 || cmyk_m > 100 || 
        cmyk_y < 0 || cmyk_y > 100 || cmyk_k < 0 || cmyk_k > 100) {
      return res.status(400).json({ error: 'CMYK values must be between 0-100' });
    }

    const success = await PrintService.updateColor(colorId, {
      name,
      display_name,
      rgb_r: parseInt(rgb_r),
      rgb_g: parseInt(rgb_g),
      rgb_b: parseInt(rgb_b),
      cmyk_c: parseInt(cmyk_c),
      cmyk_m: parseInt(cmyk_m),
      cmyk_y: parseInt(cmyk_y),
      cmyk_k: parseInt(cmyk_k),
      spot_color: spot_color || null
    });

    if (!success) {
      return res.status(404).json({ error: 'Color not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating color:', error);
    res.status(500).json({ error: 'Failed to update color' });
  }
});

// DELETE /api/colors/:id - Delete color
router.delete('/:id', async (req, res) => {
  try {
    const colorId = parseInt(req.params.id);
    if (isNaN(colorId)) {
      return res.status(400).json({ error: 'Invalid color ID' });
    }

    const success = await PrintService.deleteColor(colorId);
    if (!success) {
      return res.status(404).json({ error: 'Color not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting color:', error);
    res.status(500).json({ error: 'Failed to delete color' });
  }
});

export default router;
