import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Product from './models/Product.js';
import Bill from './models/Bill.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Product.deleteMany({});
    await Bill.deleteMany({});

    console.log('Creating mock products...');

    const mockProducts = [
      {
        name: 'Carbendazim 50% WP',
        company: 'Dhanuka Agritech',
        category: 'Fungicide',
        quantity: 45,
        quantityAlert: 20,
        buyingPrice: 320,
        sellingPriceCash: 380,
        sellingPriceUdhaar: 400,
      },
      {
        name: 'Imidacloprid 17.8% SL',
        company: 'Bayer CropScience',
        category: 'Insecticide',
        quantity: 12,
        quantityAlert: 15,
        buyingPrice: 850,
        sellingPriceCash: 950,
        sellingPriceUdhaar: 1000,
      },
      {
        name: 'Glyphosate 41% SL',
        company: 'Excel Crop Care',
        category: 'Herbicide',
        quantity: 8,
        quantityAlert: 10,
        buyingPrice: 520,
        sellingPriceCash: 620,
        sellingPriceUdhaar: 650,
      },
      {
        name: 'Gibberellic Acid 0.001% L',
        company: 'Syngenta India',
        category: 'PGR',
        quantity: 30,
        quantityAlert: 10,
        buyingPrice: 180,
        sellingPriceCash: 220,
        sellingPriceUdhaar: 240,
      },
      {
        name: 'NPK 19:19:19',
        company: 'IFFCO',
        category: 'Water Soluble',
        quantity: 100,
        quantityAlert: 25,
        buyingPrice: 450,
        sellingPriceCash: 520,
        sellingPriceUdhaar: 550,
      },
      {
        name: 'Zinc EDTA 12%',
        company: 'Aries Agro',
        category: 'Chelated Micronutrient',
        quantity: 5,
        quantityAlert: 15,
        buyingPrice: 680,
        sellingPriceCash: 780,
        sellingPriceUdhaar: 820,
      },
    ];

    const products = await Product.insertMany(mockProducts);
    console.log(`✓ Created ${products.length} products`);

    console.log('Creating mock bills...');

    const product1 = products[0];
    const product4 = products[3];

    const mockBills = [
      {
        billNumber: 'KB-2024-001',
        billType: 'kaccha',
        customer: {
          id: 'c1',
          name: 'Ramesh Kumar',
          mobile: '9876543210',
          address: 'Village Khanpur, Block Sadar',
        },
        items: [
          {
            productId: product1._id.toString(),
            productName: 'Carbendazim 50% WP',
            quantity: 5,
            rate: 400,
            total: 2000,
          },
          {
            productId: product4._id.toString(),
            productName: 'Gibberellic Acid 0.001% L',
            quantity: 10,
            rate: 240,
            total: 2400,
          },
        ],
        paymentMode: 'Udhaar',
        dueDate: new Date('2024-02-15'),
        subtotal: 4400,
        gst: 0,
        total: 4400,
        status: 'pending',
      },
      {
        billNumber: 'KB-2024-002',
        billType: 'kaccha',
        customer: {
          id: 'c2',
          name: 'Suresh Patel',
          mobile: '9988776655',
          address: 'Gram Panchayat Mohanpur',
        },
        items: [
          {
            productId: products[1]._id.toString(),
            productName: 'Imidacloprid 17.8% SL',
            quantity: 3,
            rate: 1000,
            total: 3000,
          },
        ],
        paymentMode: 'Udhaar',
        dueDate: new Date('2024-02-10'),
        subtotal: 3000,
        gst: 0,
        total: 3000,
        status: 'pending',
      },
    ];

    const bills = await Bill.insertMany(mockBills);
    console.log(`✓ Created ${bills.length} bills`);

    console.log('\n✓ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
