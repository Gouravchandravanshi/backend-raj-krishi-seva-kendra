import Bill from '../models/Bill.js';
import Product from '../models/Product.js';

// Get all bills
export const getAllBills = async (req, res) => {
  try {
    const bills = await Bill.find().sort({ createdAt: -1 });
    res.json(bills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get pending bills
export const getPendingBills = async (req, res) => {
  try {
    const bills = await Bill.find({ status: 'pending' }).sort({ createdAt: -1 });
    res.json(bills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single bill
export const getBillById = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }
    res.json(bill);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create bill
export const createBill = async (req, res) => {
  const {
    billNumber,
    billType,
    customer,
    items,
    paymentMode,
    dueDate,
    subtotal,
    gst,
    total,
  } = req.body;

  try {
    // Validation
    if (!billNumber || !customer || items.length === 0) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if bill number already exists
    const existingBill = await Bill.findOne({ billNumber });
    if (existingBill) {
      return res.status(400).json({ message: 'Bill number already exists' });
    }

    // CRITICAL: Check stock availability for ALL items BEFORE creating bill
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.productName} not found` });
      }
      if (product.quantity < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}. Available: ${product.quantity}, Required: ${item.quantity}`,
          product: product.name,
          available: product.quantity,
          required: item.quantity,
        });
      }
    }

    const bill = new Bill({
      billNumber,
      billType: billType || 'kaccha',
      customer,
      items,
      paymentMode: paymentMode || 'Cash',
      dueDate,
      subtotal,
      gst: gst || 0,
      total,
      status: 'pending',
    });

    // CRITICAL: Deduct stock for ALL bills (both Cash and Udhaar)
    for (const item of items) {
      const product = await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { quantity: -item.quantity } },
        { new: true }
      );

      if (!product) {
        throw new Error(`Failed to update stock for product: ${item.productName}`);
      }
    }

    const newBill = await bill.save();
    res.status(201).json(newBill);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update bill status
export const updateBillStatus = async (req, res) => {
  const { status } = req.body;

  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    // Only allow specific status values
    if (!['pending', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // If cancelling a bill, restore product quantities
    if (status === 'cancelled' && bill.status !== 'cancelled') {
      for (const item of bill.items) {
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { quantity: item.quantity } },
          { new: true }
        );
      }
    }

    bill.status = status;
    const updatedBill = await bill.save();
    res.json(updatedBill);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete bill
export const deleteBill = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    // Restore product quantities when bill is deleted (only if not already cancelled)
    if (bill.status !== 'cancelled') {
      for (const item of bill.items) {
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { quantity: item.quantity } },
          { new: true }
        );
      }
    }

    await Bill.deleteOne({ _id: req.params.id });
    res.json({ message: 'Bill deleted and stock restored' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get bill statistics
export const getBillStats = async (req, res) => {
  try {
    // Calculate today's sales (ALL bills created today, regardless of payment mode)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrowStart = new Date(today);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);

    const todayBills = await Bill.find({
      createdAt: { $gte: today, $lt: tomorrowStart },
      status: { $ne: 'cancelled' },
    });

    const todaySales = todayBills.reduce((sum, bill) => sum + bill.total, 0);

    // Calculate Cash sales today
    const todayCashSales = todayBills
      .filter(b => b.paymentMode === 'Cash')
      .reduce((sum, bill) => sum + bill.total, 0);

    // Calculate Udhaar (Credit) sales today
    const todayUdhaarSales = todayBills
      .filter(b => b.paymentMode === 'Udhaar')
      .reduce((sum, bill) => sum + bill.total, 0);

    // Calculate total pending Udhaar amount (unpaid credit bills)
    const pendingUdhaarBills = await Bill.find({
      paymentMode: 'Udhaar',
      status: { $ne: 'cancelled', $ne: 'completed' },
    });

    const pendingUdhaarAmount = pendingUdhaarBills.reduce((sum, bill) => sum + bill.total, 0);

    // Calculate monthly sales data
    const monthlySalesData = [];
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.getMonth();
      const year = date.getFullYear();

      const monthStart = new Date(year, month, 1);
      const monthEnd = new Date(year, month + 1, 1);

      const monthBills = await Bill.find({
        createdAt: { $gte: monthStart, $lt: monthEnd },
        status: { $ne: 'cancelled' },
      });

      const monthlySales = monthBills.reduce((sum, bill) => sum + bill.total, 0);

      monthlySalesData.push({
        month: monthNames[month],
        sales: Math.round(monthlySales),
      });
    }

    // Get all bills for total count
    const allBills = await Bill.find({ status: { $ne: 'cancelled' } });

    res.json({
      todaySales: Math.round(todaySales),
      todayCashSales: Math.round(todayCashSales),
      todayUdhaarSales: Math.round(todayUdhaarSales),
      pendingUdhaarAmount: Math.round(pendingUdhaarAmount),
      totalBills: allBills.length,
      monthlySalesData,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Sales Report (Date-wise breakdown)
export const getSalesReport = async (req, res) => {
  try {
    const bills = await Bill.find({ status: { $ne: 'cancelled' } }).sort({ createdAt: -1 });

    // Group by date
    const salesByDate = {};
    bills.forEach(bill => {
      const date = new Date(bill.createdAt).toLocaleDateString('en-IN');
      if (!salesByDate[date]) {
        salesByDate[date] = { date, total: 0, count: 0, cash: 0, udhaar: 0 };
      }
      salesByDate[date].total += bill.total;
      salesByDate[date].count += 1;
      if (bill.paymentMode === 'Cash') {
        salesByDate[date].cash += bill.total;
      } else {
        salesByDate[date].udhaar += bill.total;
      }
    });

    const report = Object.values(salesByDate).map(item => ({
      ...item,
      total: Math.round(item.total),
      cash: Math.round(item.cash),
      udhaar: Math.round(item.udhaar),
    }));

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Udhaar Report (Credit bills only)
export const getUdhaarReport = async (req, res) => {
  try {
    const bills = await Bill.find({
      paymentMode: 'Udhaar',
      status: { $ne: 'cancelled' },
    })
      .sort({ dueDate: 1 })
      .select('billNumber customer items total paymentMode dueDate status createdAt');

    const report = bills.map(bill => ({
      billNumber: bill.billNumber,
      customerName: bill.customer.name,
      customerMobile: bill.customer.mobile,
      amount: bill.total,
      dueDate: bill.dueDate ? new Date(bill.dueDate).toLocaleDateString('en-IN') : 'No Due Date',
      status: bill.status,
      createdAt: new Date(bill.createdAt).toLocaleDateString('en-IN'),
      isPending: bill.status !== 'completed' && bill.status !== 'cancelled',
    }));

    // Summary
    const totalUdhaar = bills.reduce((sum, bill) => sum + bill.total, 0);
    const pendingUdhaar = bills
      .filter(b => b.status !== 'completed' && b.status !== 'cancelled')
      .reduce((sum, bill) => sum + bill.total, 0);

    res.json({
      report,
      summary: {
        totalUdhaar: Math.round(totalUdhaar),
        pendingUdhaar: Math.round(pendingUdhaar),
        completedUdhaar: Math.round(totalUdhaar - pendingUdhaar),
        totalBills: bills.length,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Stock Report
export const getStockReport = async (req, res) => {
  try {
    const products = await Product.find().sort({ quantity: 1 });

    const report = products.map(product => ({
      id: product._id,
      name: product.name,
      company: product.company,
      category: product.category,
      currentStock: product.quantity,
      alertLevel: product.quantityAlert,
      status: product.quantity <= product.quantityAlert ? 'Low Stock' : 'In Stock',
      buyingPrice: product.buyingPrice,
      sellingPriceCash: product.sellingPriceCash,
      sellingPriceUdhaar: product.sellingPriceUdhaar,
    }));

    // Summary
    const lowStockProducts = report.filter(p => p.status === 'Low Stock');
    const totalValue = products.reduce((sum, p) => sum + p.quantity * p.buyingPrice, 0);

    res.json({
      report,
      summary: {
        totalProducts: products.length,
        totalStock: products.reduce((sum, p) => sum + p.quantity, 0),
        lowStockProducts: lowStockProducts.length,
        totalValue: Math.round(totalValue),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Category-wise Sales
export const getCategorySalesReport = async (req, res) => {
  try {
    const bills = await Bill.find({ status: { $ne: 'cancelled' } });

    const categorySales = {};

    bills.forEach(bill => {
      bill.items.forEach(item => {
        // We need to get category info - this would require a lookup
        // For now, we'll accumulate by product name
        const key = item.productName;
        if (!categorySales[key]) {
          categorySales[key] = {
            productName: item.productName,
            quantity: 0,
            totalSales: 0,
            billCount: 0,
          };
        }
        categorySales[key].quantity += item.quantity;
        categorySales[key].totalSales += item.total;
        categorySales[key].billCount += 1;
      });
    });

    const report = Object.values(categorySales)
      .sort((a, b) => b.totalSales - a.totalSales)
      .map(item => ({
        ...item,
        totalSales: Math.round(item.totalSales),
      }));

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
