import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Fungicide',
        'Insecticide',
        'Herbicide',
        'PGR',
        'Water Soluble',
        'Chelated Micronutrient',
      ],
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    quantityAlert: {
      type: Number,
      required: true,
      default: 10,
      min: 0,
    },
    buyingPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    sellingPriceCash: {
      type: Number,
      required: true,
      min: 0,
    },
    sellingPriceUdhaar: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Product', productSchema);
