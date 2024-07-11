const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Vendor Schema
const vendorSchema = new Schema({
  vendorName: {
    type: String,
    required: true
  },
  vendorID: {
    type: Array,
    required: true,
    unique: true,
  }
});

// DataCenter Schema
const dataCenterSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  index: {
    type: Number,
    required: true,
    unique: true,
  }
});

// Rack Schema
const rackSchema = new Schema({
  dataCenterId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'DataCenter'
  },
  name: {
    type: String,
    required: true
  },
  index: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  }
});

// Custom Field Schema (For components)
const customFieldSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['string', 'number', 'date'],
    required: true
  },
  value: {
    type: Schema.Types.Mixed,
    required: true
  }
});

// Component Schema
const componentSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    // Type of component: 1 - Server , 2 - Storage , 3 - Switch , 4 - Tape Drive , 5 - Others
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },

  vendorId: {
    type: Number,
    required: true,
  },

  specifications: {
    serialNo: {
      type: String,
      required: true
    },
    ram: {
      type: Number,

    },
    hdd: {
      type: Number,

    },
    processor: {
      type: String,

    },
    makeModel: {
      type: String,
      required: true
    },

    slots: {
      type: Number
    },

    drives: {
      type: Number
    },

    ports: {
      type: Number,
    },
    vendorID: {
      type: Schema.Types.ObjectId,
      // required: true,
      ref: 'Vendor'
    }
  },
  size: {
    type: Number,
    required: true
  },
  dataCenterId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'DataCenter'
  },
  rackId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Rack'
  },
  startSlot: {
    type: Number,
    required: true
  },
  customFields: [customFieldSchema]
});

// Enforce Presave hooks example
// componentSchema.pre('save', function(next) {
//   if (!this.specifications.vendorID) {
//     throw new Error('Vendor ID is required within specifications');
//   }
//   next();
// });

const assetSchema = new mongoose.Schema({
  inventoryNo: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  description: { type: String, required: true },
  contractId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Contract'
  }
});

const contractSchema = new mongoose.Schema({
  contractorDetails: {
    type: Schema.Types.ObjectId,
    ref: 'Vendor'
  },
  contractNo: {
    type: Number,
    required:true
  },
  // contractNo. exists in vendorID, if new contract, then contractNo. is added to vendorID
  assetIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Asset'
  }],
  quantity: { type: Number, required: true },
  email: { type: String, required: true },
  mob: { type: String, required: true },
  from: { type: Date, required: true },
  to: { type: Date, required: true },
});

const Asset = mongoose.model('Asset', assetSchema);
const Contract = mongoose.model('Contract', contractSchema);

const Vendor = mongoose.model('Vendor', vendorSchema);
const DataCenter = mongoose.model('DataCenter', dataCenterSchema);
const Rack = mongoose.model('Rack', rackSchema);
const Component = mongoose.model('Component', componentSchema);

module.exports = { Vendor, DataCenter, Rack, Component, Asset , Contract };
