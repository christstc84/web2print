import express from 'express';
import { PrintService } from '../services/database';

const router = express.Router();

// Get all print option categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await PrintService.getAllPrintOptionCategories();
    
    // Add option count for each category and map fields to camelCase
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category: any) => {
        const optionCount = await PrintService.getPrintOptionCountByCategory(category.id);
        return {
          id: category.id,
          name: category.name,
          type: category.type,
          description: category.description,
          icon: category.icon,
          isActive: Boolean(category.is_active),
          sortOrder: category.sort_order,
          createdAt: category.created_at,
          optionCount
        };
      })
    );
    
    res.json({
      categories: categoriesWithCounts,
      total: categoriesWithCounts.length
    });
  } catch (error) {
    console.error('Error fetching print option categories:', error);
    res.status(500).json({ error: 'Failed to fetch print option categories' });
  }
});

// Get print options for a specific category
router.get('/categories/:categoryId/options', async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { page = 1, limit = 12, search = '' } = req.query;
    
    const category = await PrintService.getPrintOptionCategoryById(categoryId);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 12;
    const searchStr = (search as string) || '';
    
    console.log('Query params:', { categoryId, pageNum, limitNum, searchStr });
    
    const options = await PrintService.getPrintOptionsByCategory(
      categoryId,
      {
        page: pageNum,
        limit: limitNum,
        search: searchStr
      }
    );
    
    const total = await PrintService.getPrintOptionCountByCategory(categoryId, search as string);
    
    res.json({
      options,
      total,
      category,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      totalPages: Math.ceil(total / parseInt(limit as string))
    });
  } catch (error) {
    console.error('Error fetching print options:', error);
    res.status(500).json({ error: 'Failed to fetch print options' });
  }
});

// Get a specific print option category
router.get('/categories/:categoryId', async (req, res) => {
  try {
    const { categoryId } = req.params;
    const category = await PrintService.getPrintOptionCategoryById(categoryId);
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    const optionCount = await PrintService.getPrintOptionCountByCategory(categoryId);
    
    res.json({
      ...category,
      optionCount
    });
  } catch (error) {
    console.error('Error fetching print option category:', error);
    res.status(500).json({ error: 'Failed to fetch print option category' });
  }
});

// Create a new print option
router.post('/categories/:categoryId/options', async (req, res) => {
  try {
    const { categoryId } = req.params;
    const optionData = req.body;
    
    // Verify category exists
    const category = await PrintService.getPrintOptionCategoryById(categoryId);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    const newOption = await PrintService.createPrintOption({
      ...optionData,
      categoryId
    });
    
    res.status(201).json(newOption);
  } catch (error) {
    console.error('Error creating print option:', error);
    res.status(500).json({ error: 'Failed to create print option' });
  }
});

// Update a print option
router.put('/options/:optionId', async (req, res) => {
  try {
    const { optionId } = req.params;
    const updateData = req.body;
    
    const updatedOption = await PrintService.updatePrintOption(optionId, updateData);
    
    if (!updatedOption) {
      return res.status(404).json({ error: 'Print option not found' });
    }
    
    res.json(updatedOption);
  } catch (error) {
    console.error('Error updating print option:', error);
    res.status(500).json({ error: 'Failed to update print option' });
  }
});

// Delete a print option
router.delete('/options/:optionId', async (req, res) => {
  try {
    const { optionId } = req.params;
    
    const deleted = await PrintService.deletePrintOption(optionId);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Print option not found' });
    }
    
    res.json({ message: 'Print option deleted successfully' });
  } catch (error) {
    console.error('Error deleting print option:', error);
    res.status(500).json({ error: 'Failed to delete print option' });
  }
});

// Bulk delete print options
router.delete('/options', async (req, res) => {
  try {
    const { optionIds } = req.body;
    
    if (!Array.isArray(optionIds) || optionIds.length === 0) {
      return res.status(400).json({ error: 'optionIds array is required' });
    }
    
    const deletedCount = await PrintService.bulkDeletePrintOptions(optionIds);
    
    res.json({ 
      message: `${deletedCount} print options deleted successfully`,
      deletedCount 
    });
  } catch (error) {
    console.error('Error bulk deleting print options:', error);
    res.status(500).json({ error: 'Failed to delete print options' });
  }
});

export default router;
