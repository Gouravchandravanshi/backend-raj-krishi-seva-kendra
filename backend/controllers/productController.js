import Product from '../models/Product.js';

// Get all products
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single product
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create product
export const createProduct = async (req, res) => {
  const {
    name,
    company,
    category,
    quantity,
    quantityAlert,
    buyingPrice,
    sellingPriceCash,
    sellingPriceUdhaar,
  } = req.body;

  try {
    // Validation
    if (!name || !company || !category) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const product = new Product({
      name,
      company,
      category,
      quantity: quantity || 0,
      quantityAlert: quantityAlert || 10,
      buyingPrice,
      sellingPriceCash,
      sellingPriceUdhaar,
    });

    const newProduct = await product.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update product
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Update fields
    if (req.body.name) product.name = req.body.name;
    if (req.body.company) product.company = req.body.company;
    if (req.body.category) product.category = req.body.category;
    if (req.body.quantity !== undefined) product.quantity = req.body.quantity;
    if (req.body.quantityAlert !== undefined) product.quantityAlert = req.body.quantityAlert;
    if (req.body.buyingPrice !== undefined) product.buyingPrice = req.body.buyingPrice;
    if (req.body.sellingPriceCash !== undefined) product.sellingPriceCash = req.body.sellingPriceCash;
    if (req.body.sellingPriceUdhaar !== undefined) product.sellingPriceUdhaar = req.body.sellingPriceUdhaar;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await Product.deleteOne({ _id: req.params.id });
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get low stock products
export const getLowStockProducts = async (req, res) => {
  try {
    const products = await Product.find({
      $expr: { $lte: ['$quantity', '$quantityAlert'] },
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get product categories
export const getCategories = async (req, res) => {
  try {
    const categories = [
      'Fungicide',
      'Insecticide',
      'Herbicide',
      'PGR',
      'Water Soluble',
      'Chelated Micronutrient',
    ];
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
