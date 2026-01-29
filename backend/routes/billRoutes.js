import express from 'express';
import {
  getAllBills,
  getPendingBills,
  getBillById,
  createBill,
  updateBillStatus,
  deleteBill,
  getBillStats,
  getSalesReport,
  getUdhaarReport,
  getStockReport,
  getCategorySalesReport,
} from '../controllers/billController.js';

const router = express.Router();

// Specific routes first (before :id parameter)
router.get('/stats/dashboard', getBillStats);
router.get('/pending/list', getPendingBills);
router.get('/report/sales', getSalesReport);
router.get('/report/udhaar', getUdhaarReport);
router.get('/report/stock', getStockReport);
router.get('/report/category-sales', getCategorySalesReport);

// Generic routes
router.get('/', getAllBills);
router.get('/:id', getBillById);
router.post('/', createBill);
router.patch('/:id/status', updateBillStatus);
router.delete('/:id', deleteBill);

export default router;
