import mongoose from 'mongoose';

const billSchema = new mongoose.Schema(
  {
    billNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    billType: {
      type: String,
      required: true,
      enum: ['kaccha', 'pakka'],
      default: 'kaccha',
    },
    customer: {
      id: String,
      name: {
        type: String,
        required: true,
      },
      mobile: {
        type: String,
        required: true,
      },
      address: String,
    },
    items: [
      {
        productId: String,
        productName: String,
        quantity: Number,
        rate: Number,
        total: Number,
      },
    ],
    paymentMode: {
      type: String,
      enum: ['Cash', 'Udhaar'],
      required: true,
    },
    dueDate: Date,
    subtotal: {
      type: Number,
      required: true,
    },
    gst: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Bill', billSchema);
