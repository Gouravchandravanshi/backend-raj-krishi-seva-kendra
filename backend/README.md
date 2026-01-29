# Stock Harmony Backend

Node.js/Express.js backend for Stock Harmony agricultural management system with MongoDB.

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Configure your .env file with MongoDB URI and port
# MONGODB_URI=mongodb://localhost:27017/stock-harmony
# PORT=5000

# Seed initial data (optional)
npm run seed

# Start development server
npm run dev
```

### Production

```bash
# Start production server
npm start
```

## 📁 Directory Structure

```
backend/
├── config/
│   └── db.js                    # MongoDB connection configuration
├── controllers/
│   ├── productController.js     # Product CRUD operations
│   └── billController.js        # Bill management and statistics
├── models/
│   ├── Product.js               # Product schema
│   ├── Bill.js                  # Bill schema
│   └── Customer.js              # Customer schema (optional)
├── routes/
│   ├── productRoutes.js         # Product API routes
│   └── billRoutes.js            # Bill API routes
├── scripts/
│   └── seed.js                  # Database seeding script
├── server.js                    # Main application entry point
├── package.json
├── .env.example                 # Environment variables template
└── README.md
```

## 🔌 API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/products/low-stock` - Get low stock products
- `GET /api/products/categories/list` - Get all categories

### Bills
- `GET /api/bills` - Get all bills
- `GET /api/bills/pending/list` - Get pending bills
- `GET /api/bills/:id` - Get bill by ID
- `POST /api/bills` - Create new bill
- `PATCH /api/bills/:id/status` - Update bill status
- `DELETE /api/bills/:id` - Delete bill
- `GET /api/bills/stats/dashboard` - Get dashboard statistics

## 🗂️ Controllers

### productController.js

- **getAllProducts()** - Fetch all products with sorting
- **getProductById()** - Get specific product
- **createProduct()** - Create new product with validation
- **updateProduct()** - Update product fields
- **deleteProduct()** - Remove product from database
- **getLowStockProducts()** - Get products below alert threshold
- **getCategories()** - Return available categories

### billController.js

- **getAllBills()** - Fetch all bills
- **getPendingBills()** - Get pending/unpaid bills
- **getBillById()** - Get specific bill
- **createBill()** - Create bill and update inventory
- **updateBillStatus()** - Change bill status
- **deleteBill()** - Remove bill and restore inventory
- **getBillStats()** - Calculate dashboard statistics

## 🗄️ Database Models

### Product
```javascript
{
  name: String (required),
  company: String (required),
  category: String (enum, required),
  quantity: Number,
  quantityAlert: Number,
  buyingPrice: Number (required),
  sellingPriceCash: Number (required),
  sellingPriceUdhaar: Number (required),
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Bill
```javascript
{
  billNumber: String (unique, required),
  billType: String (kaccha/pakka),
  customer: {
    id: String,
    name: String (required),
    mobile: String (required),
    address: String
  },
  items: [{
    productId: String,
    productName: String,
    quantity: Number,
    rate: Number,
    total: Number
  }],
  paymentMode: String (Cash/Udhaar),
  dueDate: Date,
  subtotal: Number (required),
  gst: Number,
  total: Number (required),
  status: String (pending/completed/cancelled),
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Customer
```javascript
{
  name: String (required),
  mobile: String (required),
  address: String,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## 📋 Product Categories

- Fungicide
- Insecticide
- Herbicide
- PGR (Plant Growth Regulator)
- Water Soluble
- Chelated Micronutrient

## ⚙️ Configuration

### Environment Variables (.env)

```env
# Server Port
PORT=5000

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/stock-harmony

# Environment
NODE_ENV=development

# JWT Secret (for future authentication)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

## 🌱 Database Seeding

Seed initial data with sample products and bills:

```bash
npm run seed
```

This will:
1. Clear existing data
2. Create 6 sample products
3. Create 2 sample bills
4. Log completion status

## 🔄 Inventory Management

### Quantity Updates
- **Udhaar Bills**: Quantities decrease immediately upon bill creation
- **Cash Bills**: Quantities decrease when bill status is marked as "completed"
- **Deleted Bills**: Quantities are restored if bills are deleted

### Low Stock Alerts
- Products are flagged when quantity ≤ quantityAlert
- Available via dedicated endpoint: `/api/products/low-stock`

## 📊 Statistics Calculation

Dashboard statistics include:
- **Today's Sales**: Sum of completed cash bills today
- **Pending Udhaar**: Sum of all pending bills
- **Monthly Sales**: 6-month sales trend data
- **Product Count**: Total and low stock counts

## 🔐 Security Considerations

### Current Implementation
- CORS enabled for all origins (development)
- Input validation on create/update operations
- MongoDB injection prevention through Mongoose

### Production Recommendations
- Restrict CORS origins
- Add authentication/authorization
- Implement rate limiting
- Add request validation middleware
- Use environment secrets securely
- Add logging and monitoring
- Implement API versioning

## 🧪 Testing

No automated tests currently included. Consider adding:
- Unit tests for controllers
- Integration tests for API endpoints
- Database tests with test fixtures

## 📦 Dependencies

- **express** - Web framework
- **mongoose** - MongoDB ODM
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variable management
- **bcryptjs** - Password hashing (for future use)
- **jsonwebtoken** - JWT authentication (for future use)
- **express-validator** - Request validation (for future use)

## 🛠️ Development

### Adding New Routes

1. Create controller function in `controllers/`
2. Define route in `routes/`
3. Register route in `server.js`

### Example:

```javascript
// controllers/newController.js
export const getAll = async (req, res) => {
  // implementation
};

// routes/newRoutes.js
router.get('/', getAll);

// server.js
import newRoutes from './routes/newRoutes.js';
app.use('/api/new', newRoutes);
```

## 📝 Logging

Currently uses `console.log()`. For production, consider:
- Winston
- Morgan
- Pino
- Bunyan

## 🚀 Deployment

### Heroku
```bash
# Ensure Procfile exists or package.json has "start" script
git push heroku main
```

### Railway / Other Platforms
1. Connect MongoDB Atlas database
2. Set environment variables
3. Deploy Node.js application
4. Run seed script if needed

## 🐛 Common Issues

### MongoDB Connection Failed
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
- Ensure MongoDB is running
- Check MONGODB_URI is correct
- Use MongoDB Atlas for cloud database

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
- Change PORT in .env
- Kill process using port: `lsof -ti:5000 | xargs kill -9`

### CORS Errors in Frontend
- Check API_URL in frontend .env matches backend URL
- Ensure backend is running on correct port

## 📚 Resources

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [MongoDB Manual](https://docs.mongodb.com/manual/)
- [RESTful API Best Practices](https://restfulapi.net/)

## 📄 License

MIT

## 💬 Support

For issues, create a GitHub issue with:
- Error message and logs
- Steps to reproduce
- Environment details (Node version, MongoDB version, etc.)
