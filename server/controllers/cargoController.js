const Cargo = require('../models/Cargo');

// Seed demo cargo if none exists
const DEMO_CARGO = [
  {
    awb: 'AWB998877665',
    shipper: 'TechCorp India Pvt Ltd',
    consignee: 'Gadget World Delhi',
    origin: { airport: 'Kempegowda Intl', iata: 'BLR', city: 'Bengaluru', country: 'India' },
    destination: { airport: 'Indira Gandhi Intl', iata: 'DEL', city: 'New Delhi', country: 'India' },
    weight: 45.5,
    pieces: 3,
    description: 'Electronic components - Fragile',
    commodity: 'Electronics',
    linkedFlight: 'AI101',
    status: 'in_transit',
    progress: 42,
    events: [
      { timestamp: new Date(Date.now() - 7200000), location: 'BLR', status: 'accepted', description: 'Shipment accepted at origin', airport: 'BLR' },
      { timestamp: new Date(Date.now() - 5400000), location: 'BLR', status: 'loaded', description: 'Loaded onto flight AI101', airport: 'BLR' },
      { timestamp: new Date(Date.now() - 1800000), location: 'In Air', status: 'in_transit', description: 'Aircraft over Nagpur, cruising FL350', airport: 'NAG' }
    ],
    eta: new Date(Date.now() + 5400000)
  },
  {
    awb: 'AWB123456789',
    shipper: 'Mumbai Exports Ltd',
    consignee: 'Chennai Imports Co',
    origin: { airport: 'Chhatrapati Shivaji Intl', iata: 'BOM', city: 'Mumbai', country: 'India' },
    destination: { airport: 'Chennai Intl', iata: 'MAA', city: 'Chennai', country: 'India' },
    weight: 120.0,
    pieces: 10,
    description: 'Garments - General Cargo',
    commodity: 'Textiles',
    linkedFlight: '6E456',
    status: 'loaded',
    progress: 15,
    events: [
      { timestamp: new Date(Date.now() - 3600000), location: 'BOM', status: 'accepted', description: 'Cargo accepted at BOM warehouse', airport: 'BOM' },
      { timestamp: new Date(Date.now() - 1200000), location: 'BOM', status: 'loaded', description: 'Loaded onto IndiGo 6E456', airport: 'BOM' }
    ],
    eta: new Date(Date.now() + 7200000)
  }
];

const seedDemoCargo = async () => {
  const count = await Cargo.countDocuments();
  if (count === 0) {
    await Cargo.insertMany(DEMO_CARGO);
    console.log('📦 Demo cargo seeded');
  }
};

// GET /api/cargo/:awb
const getCargoByAWB = async (req, res) => {
  const { awb } = req.params;
  try {
    await seedDemoCargo();
    let cargo = await Cargo.findOne({ awb: awb.toUpperCase() });

    if (!cargo) {
      // Generate a mock cargo for demo
      return res.status(200).json({
        success: true,
        data: {
          awb: awb.toUpperCase(),
          shipper: 'Demo Shipper',
          consignee: 'Demo Consignee',
          origin: { airport: 'Kempegowda Intl', iata: 'BLR', city: 'Bengaluru', country: 'India' },
          destination: { airport: 'Indira Gandhi Intl', iata: 'DEL', city: 'New Delhi', country: 'India' },
          weight: 25,
          pieces: 1,
          description: 'General Cargo',
          linkedFlight: 'AI101',
          status: 'in_transit',
          progress: Math.floor(Math.random() * 60) + 20,
          events: [
            { timestamp: new Date(Date.now() - 5400000), location: 'BLR', status: 'accepted', description: 'Shipment accepted at origin', airport: 'BLR' },
            { timestamp: new Date(Date.now() - 3600000), location: 'BLR', status: 'loaded', description: 'Loaded onto flight AI101', airport: 'BLR' },
            { timestamp: new Date(Date.now() - 900000), location: 'In Air', status: 'in_transit', description: 'Aircraft in transit', airport: 'NA' }
          ],
          eta: new Date(Date.now() + 7200000)
        }
      });
    }

    res.json({ success: true, data: cargo });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/cargo
const getAllCargo = async (req, res) => {
  try {
    await seedDemoCargo();
    const cargo = await Cargo.find().sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, count: cargo.length, data: cargo });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/cargo
const createCargo = async (req, res) => {
  try {
    const cargo = await Cargo.create(req.body);
    res.status(201).json({ success: true, data: cargo });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// PATCH /api/cargo/:awb/status
const updateCargoStatus = async (req, res) => {
  const { awb } = req.params;
  const { status, location, description, airport } = req.body;
  try {
    const cargo = await Cargo.findOneAndUpdate(
      { awb: awb.toUpperCase() },
      {
        status,
        $push: {
          events: { timestamp: new Date(), location, status, description, airport }
        }
      },
      { new: true }
    );
    if (!cargo) return res.status(404).json({ success: false, message: 'AWB not found' });
    res.json({ success: true, data: cargo });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getCargoByAWB, getAllCargo, createCargo, updateCargoStatus };
