const mongoose = require('mongoose');

const purchaseOrderItemSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  },
  brand: {
    type: String,
    trim: true,
  },
  model: {
    type: String,
    trim: true,
  },
  specifications: {
    type: String,
    trim: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  receivedQuantity: {
    type: Number,
    default: 0,
    min: 0,
  },
  createdAssets: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asset',
  }],
});

const purchaseOrderSchema = new mongoose.Schema(
  {
    poNumber: {
      type: String,
      unique: true,
      trim: true,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: [true, 'Vendor is required'],
    },
    orderDate: {
      type: Date,
      default: Date.now,
    },
    expectedDeliveryDate: {
      type: Date,
    },
    deliveryDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['draft', 'pending', 'approved', 'ordered', 'received', 'cancelled'],
      default: 'draft',
    },
    items: [purchaseOrderItemSchema],
    subtotal: {
      type: Number,
      default: 0,
    },
    tax: {
      type: Number,
      default: 0,
    },
    shipping: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate PO number before saving
purchaseOrderSchema.pre('save', async function (next) {
  if (!this.isNew || this.poNumber) {
    return next();
  }

  try {
    const year = new Date().getFullYear();
    const lastPO = await this.constructor
      .findOne({ poNumber: new RegExp(`^MG-PO-${year}-`) })
      .sort({ poNumber: -1 })
      .select('poNumber');

    let nextNumber = 1;

    if (lastPO && lastPO.poNumber) {
      const match = lastPO.poNumber.match(/MG-PO-\d{4}-(\d+)$/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }

    this.poNumber = `MG-PO-${year}-${String(nextNumber).padStart(3, '0')}`;
    next();
  } catch (error) {
    next(error);
  }
});

// Calculate totals before saving
purchaseOrderSchema.pre('save', function (next) {
  this.subtotal = this.items.reduce((sum, item) => sum + item.totalPrice, 0);
  this.totalAmount = this.subtotal + this.tax + this.shipping;
  next();
});

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);
