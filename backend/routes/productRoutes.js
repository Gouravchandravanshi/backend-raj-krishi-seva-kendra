import express from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
  getCategories,
} from '../controllers/productController.js';

const router = express.Router();

// Specific routes first (before :id parameter)
router.get('/categories/list', getCategories);
router.get('/low-stock', getLowStockProducts);

// Generic routes
router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;
