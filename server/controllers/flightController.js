const axios = require('axios');
const Flight = require('../models/Flight');

// OpenSky Token Cache
let cachedToken = null;
let tokenExpiry = 0;

const getOpenSkyToken = async () => {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && now < tokenExpiry - 60) return cachedToken;

  const clientId = process.env.OPENSKY_USERNAME;
  const clientSecret = process.env.OPENSKY_PASSWORD;
  const tokenUrl = 'https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token';

  if (!clientId || !clientSecret || clientSecret.length < 20) {
      console.log("OpenSky: Missing or invalid credentials in .env, using anonymous access.");
      return null;
  }

  try {
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);

    const res = await axios.post(tokenUrl, params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 10000
    });

    if (res.data && res.data.access_token) {
      cachedToken = res.data.access_token;
      tokenExpiry = now + (res.data.expires_in || 1800);
      console.log("✅ OpenSky: New OAuth2 token obtained.");
      return cachedToken;
    }
  } catch (err) {
    console.error("OpenSky Auth Error:", err.response?.data || err.message);
  }
  return null;
};

// Simulated Indian flights for demo when API is unavailable
const DEMO_FLIGHTS = [
  { icao24: 'aab811', callsign: 'AIC101', originCountry: 'India', longitude: 77.1025, latitude: 28.7041, baroAltitude: 10972, velocity: 234, trueTrack: 220, onGround: false, airline: 'Air India', flightNumber: 'AI101', departure: { iata: 'DEL', airport: 'Indira Gandhi Intl', scheduled: '10:00' }, arrival: { iata: 'BOM', airport: 'Chhatrapati Shivaji Intl', scheduled: '12:15' }, status: 'active' },
  { icao24: 'aab812', callsign: 'IGO456', originCountry: 'India', longitude: 80.2707, latitude: 13.0827, baroAltitude: 9144, velocity: 245, trueTrack: 45, onGround: false, airline: 'IndiGo', flightNumber: '6E456', departure: { iata: 'MAA', airport: 'Chennai Intl', scheduled: '09:30' }, arrival: { iata: 'DEL', airport: 'Indira Gandhi Intl', scheduled: '12:00' }, status: 'active' },
  { icao24: 'aab813', callsign: 'SEJ234', originCountry: 'India', longitude: 72.8777, latitude: 19.0760, baroAltitude: 11277, velocity: 258, trueTrack: 180, onGround: false, airline: 'SpiceJet', flightNumber: 'SG234', departure: { iata: 'BOM', airport: 'Chhatrapati Shivaji Intl', scheduled: '08:00' }, arrival: { iata: 'HYD', airport: 'Rajiv Gandhi Intl', scheduled: '09:30' }, status: 'active' },
  { icao24: 'aab814', callsign: 'AXB789', originCountry: 'India', longitude: 77.5946, latitude: 12.9716, baroAltitude: 8229, velocity: 220, trueTrack: 90, onGround: false, airline: 'Air Asia', flightNumber: 'I5789', departure: { iata: 'BLR', airport: 'Kempegowda Intl', scheduled: '07:00' }, arrival: { iata: 'CCU', airport: 'Netaji Subhash Intl', scheduled: '09:45' }, status: 'active' },
  { icao24: 'aab815', callsign: 'VTI321', originCountry: 'India', longitude: 85.8245, latitude: 20.2961, baroAltitude: 10668, velocity: 262, trueTrack: 310, onGround: false, airline: 'Vistara', flightNumber: 'UK321', departure: { iata: 'BBI', airport: 'Biju Patnaik Intl', scheduled: '11:00' }, arrival: { iata: 'DEL', airport: 'Indira Gandhi Intl', scheduled: '13:30' }, status: 'active' },
  { icao24: 'aab816', callsign: 'AIC202', originCountry: 'India', longitude: 78.4867, latitude: 17.3850, baroAltitude: 9753, velocity: 248, trueTrack: 135, onGround: false, airline: 'Air India', flightNumber: 'AI202', departure: { iata: 'HYD', airport: 'Rajiv Gandhi Intl', scheduled: '06:00' }, arrival: { iata: 'BLR', airport: 'Kempegowda Intl', scheduled: '07:20' }, status: 'active' },
  { icao24: 'aab817', callsign: 'IGO890', originCountry: 'India', longitude: 88.3639, latitude: 22.5726, baroAltitude: 11582, velocity: 255, trueTrack: 275, onGround: false, airline: 'IndiGo', flightNumber: '6E890', departure: { iata: 'CCU', airport: 'Netaji Subhash Intl', scheduled: '15:00' }, arrival: { iata: 'BOM', airport: 'Chhatrapati Shivaji Intl', scheduled: '18:00' }, status: 'active' },
  { icao24: 'aab818', callsign: 'SEJ567', originCountry: 'India', longitude: 76.2711, latitude: 10.8505, baroAltitude: 7620, velocity: 215, trueTrack: 30, onGround: false, airline: 'SpiceJet', flightNumber: 'SG567', departure: { iata: 'COK', airport: 'Cochin Intl', scheduled: '12:30' }, arrival: { iata: 'BLR', airport: 'Kempegowda Intl', scheduled: '14:00' }, status: 'active' },
  { icao24: 'aab819', callsign: 'UAE201', originCountry: 'United Arab Emirates', longitude: 55.3644, latitude: 25.2532, baroAltitude: 12192, velocity: 280, trueTrack: 120, onGround: false, airline: 'Emirates', flightNumber: 'EK201', departure: { iata: 'DXB', airport: 'Dubai Intl', scheduled: '02:00' }, arrival: { iata: 'DEL', airport: 'Indira Gandhi Intl', scheduled: '07:00' }, status: 'active' },
  { icao24: 'aab820', callsign: 'BAW117', originCountry: 'United Kingdom', longitude: 0.4543, latitude: 51.4700, baroAltitude: 11887, velocity: 285, trueTrack: 90, onGround: false, airline: 'British Airways', flightNumber: 'BA117', departure: { iata: 'LHR', airport: 'Heathrow', scheduled: '21:15' }, arrival: { iata: 'DEL', airport: 'Indira Gandhi Intl', scheduled: '11:00' }, status: 'active' }
];

// Fetch from OpenSky Network (free, real-time)
const fetchFromOpenSky = async () => {
  const username = process.env.OPENSKY_USERNAME;
  const password = process.env.OPENSKY_PASSWORD;

  const config = {
    timeout: 10000,
    params: {
      // Bounding box for Indian subcontinent + nearby
      lamin: 6.0,
      lomin: 68.0,
      lamax: 35.0,
      lomax: 97.0
    }
  };

  const token = await getOpenSkyToken();
  if (token) {
    config.headers = { 'Authorization': `Bearer ${token}` };
  }

  const response = await axios.get('https://opensky-network.org/api/states/all', config);

  if (!response.data || !response.data.states) return [];

  return response.data.states.map(s => ({
    icao24: s[0],
    callsign: (s[1] || '').trim(),
    originCountry: s[2],
    longitude: s[5],
    latitude: s[6],
    baroAltitude: s[7],
    geoAltitude: s[13],
    onGround: s[8],
    velocity: s[9],
    trueTrack: s[10],
    verticalRate: s[11],
    squawk: s[14],
    lastUpdated: new Date(s[4] * 1000)
  })).filter(f => f.latitude && f.longitude && f.callsign);
};

// Fetch specific flight from OpenSky globally (no bounding box)
const fetchSingleFlightFromOpenSky = async (icao24) => {
  const username = process.env.OPENSKY_USERNAME;
  const password = process.env.OPENSKY_PASSWORD;
  const config = { timeout: 10000, params: { icao24 } };

  const token = await getOpenSkyToken();
  if (token) config.headers = { 'Authorization': `Bearer ${token}` };

  try {
    const response = await axios.get('https://opensky-network.org/api/states/all', config);
    if (!response.data || !response.data.states || response.data.states.length === 0) return null;
    
    const s = response.data.states[0];
    return {
      icao24: s[0],
      callsign: (s[1] || '').trim(),
      originCountry: s[2],
      longitude: s[5],
      latitude: s[6],
      baroAltitude: s[7],
      geoAltitude: s[13],
      onGround: s[8],
      velocity: s[9],
      trueTrack: s[10],
      verticalRate: s[11],
      squawk: s[14],
      lastUpdated: new Date(s[4] * 1000)
    };
  } catch (err) {
    console.error("Error fetching single flight from OpenSky:", err.message);
    return null;
  }
};

// Enrich with AviationStack if API key available
const enrichWithAviationStack = async (input) => {
  const key = process.env.AVIATIONSTACK_KEY;
  if (!key || key === 'your_aviationstack_key_here') return null;

  const trySearch = async (params) => {
    try {
      const res = await axios.get('http://api.aviationstack.com/v1/flights', {
        params: { access_key: key, ...params },
        timeout: 5000
      });
      return res.data && res.data.data && res.data.data.length > 0 ? res.data.data[0] : null;
    } catch (err) {
      if (err.response?.status === 429) {
          console.log("AviationStack: Rate limit reached (429).");
          return null;
      }
      console.error(`AviationStack Error for params ${JSON.stringify(params)}:`, err.message);
      return null;
    }
  };

  const normalized = input.toUpperCase().trim();
  let flightData = null;

  // 1. Try exact ICAO search (most common for callsigns)
  flightData = await trySearch({ flight_icao: normalized });
  
  // 2. Try exact IATA search
  if (!flightData) flightData = await trySearch({ flight_iata: normalized });

  // 3. Handle Radio Callsigns (e.g. IGO625W -> IGO625) 
  // Strip trailing letters only if there's a digit pattern
  const stripped = normalized.replace(/([0-9]+)[A-Z]+$/, '$1');
  if (!flightData && stripped !== normalized) {
      flightData = await trySearch({ flight_icao: stripped }) || await trySearch({ flight_iata: stripped });
  }

  if (flightData) {
    const f = flightData;
    return {
      airline: f.airline?.name,
      flightNumber: f.flight?.iata,
      departure: {
        airport: f.departure?.airport,
        iata: f.departure?.iata,
        scheduled: f.departure?.scheduled,
        actual: f.departure?.actual
      },
      arrival: {
        airport: f.arrival?.airport,
        iata: f.arrival?.iata,
        scheduled: f.arrival?.scheduled,
        estimated: f.arrival?.estimated
      },
      status: f.flight_status,
      aircraft: {
        registration: f.aircraft?.registration,
        model: f.aircraft?.iata,
        icao24: f.aircraft?.icao24?.toLowerCase()
      },
      live: f.live // Include live GPS/Altitude if AviationStack provides it
    };
  }
  return null;
};

let flightCache = [];
let lastFetchTime = 0;
const CACHE_TTL = 15000; // 15 seconds

const fetchAndCacheLiveFlights = async () => {
  const now = Date.now();

  // Return cache if fresh
  if (flightCache.length > 0 && (now - lastFetchTime) < CACHE_TTL) {
    return flightCache;
  }

  try {
    const flights = await fetchFromOpenSky();
    if (flights && flights.length > 0) {
      // Simulate slightly randomised positions for live feel
      flightCache = flights.map(f => ({
        ...f,
        latitude: f.latitude + (Math.random() - 0.5) * 0.01,
        longitude: f.longitude + (Math.random() - 0.5) * 0.01
      }));
      lastFetchTime = now;
      return flightCache;
    }
  } catch (err) {
    console.log('OpenSky unavailable, using demo data:', err.message);
  }

  // Fallback: return demo data with live-ish movement
  flightCache = DEMO_FLIGHTS.map(f => ({
    ...f,
    latitude: f.latitude + (Math.random() - 0.5) * 0.2,
    longitude: f.longitude + (Math.random() - 0.5) * 0.2,
    baroAltitude: f.baroAltitude + Math.floor((Math.random() - 0.5) * 300),
    velocity: f.velocity + Math.floor((Math.random() - 0.5) * 20),
    lastUpdated: new Date()
  }));
  lastFetchTime = now;
  return flightCache;
};

// Controller: GET /api/flights
const getFlights = async (req, res) => {
  try {
    const flights = await fetchAndCacheLiveFlights();
    res.json({ success: true, count: flights.length, data: flights });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Controller: GET /api/flights/:callsign
const getFlightByCallsign = async (req, res) => {
  const { callsign } = req.params;
  const input = callsign.toUpperCase().trim();
  
  try {
    // 1. Check local bounding box cache first
    const flights = await fetchAndCacheLiveFlights();
    let flight = flights.find(f =>
      f.callsign?.toUpperCase() === input ||
      f.flightNumber?.toUpperCase() === input
    );

    // 2. Try to grab its data via AviationStack (Global Search)
    let enrichedData = await enrichWithAviationStack(input);
    
    if (enrichedData) {
        if (flight) {
            flight = { ...flight, ...enrichedData };
        } else {
            // It's a real flight but not in our Indian bounding box
            // Try to pinpoint live GPS globally via its transponder hex code (ICAO24)
            if (enrichedData.aircraft?.icao24) {
               const liveGlobal = await fetchSingleFlightFromOpenSky(enrichedData.aircraft.icao24);
               if (liveGlobal) {
                   flight = { ...liveGlobal, ...enrichedData };
               }
            }
            
            // If still no GPS, return the schedule data
            if (!flight) {
                flight = { 
                    callsign: input,
                    ...enrichedData,
                    status: enrichedData.status || 'active'
                };
            }
        }
    }

    // 3. Fallback to Demo Data only if all real APIs failed
    if (!flight) {
      const stripped = input.replace(/([0-9]+)[A-Z]+$/, '$1');
      // Case-insensitive inclusion search for better matches
      const demo = DEMO_FLIGHTS.find(f =>
        f.callsign?.toUpperCase() === input ||
        f.callsign?.toUpperCase() === stripped ||
        f.flightNumber?.toUpperCase() === input ||
        f.callsign?.toUpperCase().includes(input)
      );
      if (demo) {
          flight = { ...demo, isDemo: true };
          // Attempt enrichment but ignore if fails
          try {
            const enc = await enrichWithAviationStack(demo.callsign);
            if (enc) flight = { ...flight, ...enc };
          } catch (e) {}
      }
    }

    if (!flight) {
      console.log(`Flight ${input} not found. Returning a generic demo flight.`);
      flight = { ...DEMO_FLIGHTS[0], callsign: input, isDemo: true, status: 'unknown' };
    }

    res.json({ success: true, data: flight });
  } catch (err) {
    console.error(`Search error for ${input}:`, err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Helper for global route search
const searchAviationStackByRoute = async (from, to) => {
  const key = process.env.AVIATIONSTACK_KEY;
  if (!key || key === 'your_aviationstack_key_here') return [];

  try {
    const params = { access_key: key, flight_status: 'active' };
    if (from) params.dep_iata = from.toUpperCase();
    if (to) params.arr_iata = to.toUpperCase();

    const res = await axios.get('http://api.aviationstack.com/v1/flights', { params, timeout: 5000 });
    
    if (res.data && res.data.data) {
      return res.data.data.map(f => ({
        icao24: f.aircraft?.icao24?.toLowerCase() || `fallback-${f.flight?.icao}`,
        callsign: f.flight?.icao,
        flightNumber: f.flight?.iata,
        airline: f.airline?.name,
        departure: {
          iata: f.departure?.iata,
          airport: f.departure?.airport,
          scheduled: f.departure?.scheduled
        },
        arrival: {
          iata: f.arrival?.iata,
          airport: f.arrival?.airport,
          scheduled: f.arrival?.scheduled
        },
        latitude: f.live?.latitude || 0,
        longitude: f.live?.longitude || 0,
        baroAltitude: f.live?.altitude || 0,
        velocity: f.live?.speed || 0,
        trueTrack: f.live?.direction || 0,
        status: f.flight_status,
        isGlobal: true
      })).filter(f => f.latitude !== 0);
    }
  } catch (err) {
    console.error("AviationStack Route Error:", err.message);
  }
  return [];
};

// Controller: GET /api/flights/route?from=DEL&to=BOM
const getFlightsByRoute = async (req, res) => {
  const { from, to } = req.query;
  try {
    // 1. Try local cache first
    const flights = await fetchAndCacheLiveFlights();
    let filtered = flights;
    if (from) filtered = filtered.filter(f => f.departure?.iata?.toUpperCase() === from.toUpperCase());
    if (to) filtered = filtered.filter(f => f.arrival?.iata?.toUpperCase() === to.toUpperCase());

    // 2. If nothing found in cache, try global AviationStack search
    if (filtered.length === 0 && (from || to)) {
        console.log(`No cache hit for ${from}->${to}, trying global search...`);
        filtered = await searchAviationStackByRoute(from, to);
    }

    res.json({ success: true, count: filtered.length, data: filtered });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Controller: GET /api/flights/stats
const getStats = async (req, res) => {
  try {
    const flights = await fetchAndCacheLiveFlights();
    res.json({
      success: true,
      data: {
        total: flights.length,
        airborne: flights.filter(f => !f.onGround).length,
        onGround: flights.filter(f => f.onGround).length,
        countries: [...new Set(flights.map(f => f.originCountry))].length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Controller: GET /api/flights/track/:icao24
const getFlightTrack = async (req, res) => {
  const { icao24 } = req.params;

  try {
    const config = {
      timeout: 15000,
      params: { icao24: icao24.toLowerCase(), time: 0 }
    };

    const token = await getOpenSkyToken();
    if (token) {
      config.headers = { 'Authorization': `Bearer ${token}` };
    }

    const response = await axios.get('https://opensky-network.org/api/tracks/all', config);
    
    if (!response.data || !response.data.path) {
      return res.status(404).json({ success: false, message: 'Track data not found' });
    }

    res.json({ success: true, data: response.data });
  } catch (err) {
    console.error('Error fetching tracks:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getFlights, getFlightByCallsign, getFlightsByRoute, getStats, getFlightTrack, fetchAndCacheLiveFlights };
