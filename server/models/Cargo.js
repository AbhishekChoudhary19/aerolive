const mongoose = require('mongoose');

const cargoSchema = new mongoose.Schema({
  awb: { type: String, required: true, unique: true, uppercase: true },
  shipper: { type: String, default: 'Unknown' },
  consignee: { type: String, default: 'Unknown' },
  origin: {
    airport: String,
    iata: String,
    city: String,
    country: String
  },
  destination: {
    airport: String,
    iata: String,
    city: String,
    country: String
  },
  weight: { type: Number, default: 0 },
  pieces: { type: Number, default: 1 },
  description: String,
  commodity: String,
  linkedFlight: { type: String, default: null },
  status: {
    type: String,
    enum: ['booked', 'accepted', 'loaded', 'in_transit', 'arrived', 'delivered', 'held'],
    default: 'booked'
  },
  progress: { type: Number, default: 0 },
  events: [{
    timestamp: { type: Date, default: Date.now },
    location: String,
    status: String,
    description: String,
    airport: String
  }],
  eta: Date,
  actualDelivery: Date
}, { timestamps: true });

cargoSchema.index({ awb: 1 });

module.exports = mongoose.model('Cargo', cargoSchema);
