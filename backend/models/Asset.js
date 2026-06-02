const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema(
  {
    assetTag: {
      type: String,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Asset name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    brand: {
      type: String,
      trim: true,
    },
    model: {
      type: String,
      trim: true,
    },
    serialNumber: {
      type: String,
      trim: true,
    },
    purchaseDate: {
      type: Date,
    },
    purchasePrice: {
      type: Number,
      min: 0,
    },
    vendor: {
      type: String,
      trim: true,
    },
    warrantyExpiry: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['available', 'assigned', 'maintenance', 'retired', 'lost', 'damaged'],
      default: 'available',
    },
    condition: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor'],
      default: 'good',
    },
    location: {
      type: String,
      trim: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    assignedDate: {
      type: Date,
    },
    qrCode: {
      type: String,
    },
    specifications: {
      type: Map,
      of: String,
    },
    notes: {
      type: String,
      trim: true,
    },
    images: [{
      type: String,
    }],
    documents: [{
      fileName: String,
      filePath: String,
      uploadDate: {
        type: Date,
        default: Date.now,
      },
    }],
    depreciation: {
      method: {
        type: String,
        enum: ['straight-line', 'declining-balance', 'none'],
        default: 'straight-line',
      },
      usefulLife: {
        type: Number, // in years
        default: 5,
      },
      salvageValue: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate asset tag before saving
assetSchema.pre('save', async function (next) {
  if (!this.isNew || this.assetTag) {
    return next();
  }

  try {
    // Get the current year
    const year = new Date().getFullYear();

    // Find the last asset created this year
    const lastAsset = await this.constructor
      .findOne({ assetTag: new RegExp(`^MG-${year}-`) })
      .sort({ assetTag: -1 })
      .select('assetTag');

    let nextNumber = 1;

    if (lastAsset && lastAsset.assetTag) {
      // Extract the number from the last asset tag (e.g., "MG-2024-005" -> 5)
      const match = lastAsset.assetTag.match(/MG-\d{4}-(\d+)$/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }

    // Generate asset tag: MG-YYYY-NNN (e.g., MG-2024-001)
    this.assetTag = `MG-${year}-${String(nextNumber).padStart(3, '0')}`;
    next();
  } catch (error) {
    next(error);
  }
});

// Calculate current value based on depreciation
assetSchema.methods.getCurrentValue = function () {
  if (!this.purchasePrice || !this.purchaseDate || this.depreciation.method === 'none') {
    return this.purchasePrice || 0;
  }

  const yearsElapsed = (Date.now() - this.purchaseDate) / (365.25 * 24 * 60 * 60 * 1000);

  if (this.depreciation.method === 'straight-line') {
    const annualDepreciation = (this.purchasePrice - this.depreciation.salvageValue) / this.depreciation.usefulLife;
    const currentValue = this.purchasePrice - (annualDepreciation * yearsElapsed);
    return Math.max(currentValue, this.depreciation.salvageValue);
  }

  return this.purchasePrice;
};

module.exports = mongoose.model('Asset', assetSchema);
