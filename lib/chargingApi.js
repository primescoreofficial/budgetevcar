/**
 * EV Charging Station Locator API Helper
 */

// Haversine formula to calculate distance in KM between two coordinates
export function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return Math.round(d * 10) / 10;
}

// Rich fallback database of premium EV charging stations across India's key cities
const FALLBACK_STATIONS = [
  // Delhi
  {
    id: "delhi-1",
    name: "Tata Power EZ Charge - Connaught Place",
    address: "Radial Road number 4, Block E, Connaught Place, New Delhi, 110001",
    operator: "Tata Power",
    latitude: 28.6304,
    longitude: 77.2177,
    points: 4,
    chargerTypes: ["CCS Type 2 (60kW Fast)", "AC Type 2 (22kW)"],
  },
  {
    id: "delhi-2",
    name: "Jio-bp pulse Charging Station - Aerocity",
    address: "Asset No. 2, Aerocity Hospitality District, New Delhi, 110037",
    operator: "Jio-bp pulse",
    latitude: 28.5524,
    longitude: 77.1218,
    points: 6,
    chargerTypes: ["CCS Type 2 (120kW Dual Fast)", "CCS Type 2 (60kW Fast)"],
  },
  {
    id: "delhi-3",
    name: "Zeon Charging - Vasant Kunj",
    address: "Ambience Mall Parking, Nelson Mandela Marg, Vasant Kunj, New Delhi, 110070",
    operator: "Zeon Charging",
    latitude: 28.5411,
    longitude: 77.1554,
    points: 2,
    chargerTypes: ["CCS Type 2 (50kW Fast)"],
  },
  {
    id: "delhi-4",
    name: "Ather Grid - Saket",
    address: "Select Citywalk Parking Area, Saket District Centre, New Delhi, 110017",
    operator: "Ather Energy",
    latitude: 28.5287,
    longitude: 77.2193,
    points: 8,
    chargerTypes: ["Ather Fast Connector", "AC Type 2"],
  },

  // Jaipur
  {
    id: "jaipur-1",
    name: "Tata Power EZ Charge - C-Scheme",
    address: "Crystal Palm Mall Parking, Sahdev Marg, C-Scheme, Jaipur, Rajasthan, 302001",
    operator: "Tata Power",
    latitude: 26.9069,
    longitude: 75.7981,
    points: 4,
    chargerTypes: ["CCS Type 2 (60kW Fast)", "AC Type 2 (7kW)"],
  },
  {
    id: "jaipur-2",
    name: "Jio-bp pulse Charging Hub - Mansarovar",
    address: "VT Road Metro Station Parking Area, Mansarovar, Jaipur, 302020",
    operator: "Jio-bp pulse",
    latitude: 26.8725,
    longitude: 75.7629,
    points: 4,
    chargerTypes: ["CCS Type 2 (50kW Fast)", "GB/T (Fast)"],
  },
  {
    id: "jaipur-3",
    name: "Statcon Energia Charging Station - Malviya Nagar",
    address: "GT Central Mall, Malviya Nagar, Jaipur, Rajasthan, 302017",
    operator: "Statcon Energia",
    latitude: 26.8529,
    longitude: 75.8039,
    points: 2,
    chargerTypes: ["CCS Type 2 (30kW Fast)"],
  },

  // Udaipur
  {
    id: "udaipur-1",
    name: "Zeon Charging - Urban Square Mall",
    address: "Urban Square Mall, Gaurav Path, Udiapol, Udaipur, Rajasthan, 313001",
    operator: "Zeon Charging",
    latitude: 24.6014,
    longitude: 73.7088,
    points: 4,
    chargerTypes: ["CCS Type 2 (100kW Ultra Fast)", "CCS Type 2 (50kW Fast)"],
  },
  {
    id: "udaipur-2",
    name: "Tata Power EZ Charge - Fateh Sagar",
    address: "Hotel Lakend Parking, Alkapuri, Fatehsagar Lake, Udaipur, 313001",
    operator: "Tata Power",
    latitude: 24.5959,
    longitude: 73.6764,
    points: 2,
    chargerTypes: ["CCS Type 2 (30kW Fast)"],
  },
  {
    id: "udaipur-3",
    name: "Ather Grid - Sector 4",
    address: "Hiran Magri, Sector 4, Udaipur, Rajasthan, 313002",
    operator: "Ather Energy",
    latitude: 24.5684,
    longitude: 73.7145,
    points: 3,
    chargerTypes: ["Ather Fast Connector"],
  },

  // Mumbai
  {
    id: "mumbai-1",
    name: "Jio-bp pulse Charging Hub - BKC",
    address: "G Block BKC, Bandra Kurla Complex, Bandra East, Mumbai, 400051",
    operator: "Jio-bp pulse",
    latitude: 19.0722,
    longitude: 72.8624,
    points: 12,
    chargerTypes: ["CCS Type 2 (150kW Ultra Fast)", "CCS Type 2 (60kW Fast)", "AC Type 2 (22kW)"],
  },
  {
    id: "mumbai-2",
    name: "Tata Power EZ Charge - Nariman Point",
    address: "CR2 Mall Parking Area, Barrister Rajni Patel Marg, Nariman Point, Mumbai, 400021",
    operator: "Tata Power",
    latitude: 18.9274,
    longitude: 72.8228,
    points: 6,
    chargerTypes: ["CCS Type 2 (60kW Fast)", "AC Type 2 (11kW)"],
  },
  {
    id: "mumbai-3",
    name: "Fortum Charge & Drive - Andheri West",
    address: "Infinity Mall Parking, Link Road, Andheri West, Mumbai, 400053",
    operator: "Fortum",
    latitude: 19.1412,
    longitude: 72.8315,
    points: 4,
    chargerTypes: ["CCS Type 2 (50kW Fast)"],
  },

  // Bengaluru
  {
    id: "bengaluru-1",
    name: "Zeon Charging - Indiranagar",
    address: "Double Road, Stage 2, Indiranagar, Bengaluru, Karnataka, 560038",
    operator: "Zeon Charging",
    latitude: 12.9719,
    longitude: 77.6412,
    points: 4,
    chargerTypes: ["CCS Type 2 (60kW Fast)", "AC Type 2 (22kW)"],
  },
  {
    id: "bengaluru-2",
    name: "Ather Grid HQ - Koramangala",
    address: "100 Feet Rd, 4th Block, Koramangala, Bengaluru, Karnataka, 560034",
    operator: "Ather Energy",
    latitude: 12.9345,
    longitude: 77.6244,
    points: 10,
    chargerTypes: ["Ather Fast Connector", "AC Type 2"],
  },
  {
    id: "bengaluru-3",
    name: "Tata Power EZ Charge - Whitefield",
    address: "Phoenix Marketcity Parking, Mahadevapura, Outer Ring Road, Bengaluru, 560048",
    operator: "Tata Power",
    latitude: 12.9958,
    longitude: 77.6963,
    points: 6,
    chargerTypes: ["CCS Type 2 (50kW Fast)", "CHAdeMO (Fast)"],
  },

  // Pune
  {
    id: "pune-1",
    name: "Tata Power EZ Charge - Shivajinagar",
    address: "ICC Trade Tower Parking, Senapati Bapat Road, Shivajinagar, Pune, 411016",
    operator: "Tata Power",
    latitude: 18.5322,
    longitude: 73.8324,
    points: 4,
    chargerTypes: ["CCS Type 2 (60kW Fast)"],
  },
  {
    id: "pune-2",
    name: "Jio-bp pulse - Viman Nagar",
    address: "Phoenix Marketcity Parking, Viman Nagar, Pune, Maharashtra, 411014",
    operator: "Jio-bp pulse",
    latitude: 18.5621,
    longitude: 73.9168,
    points: 6,
    chargerTypes: ["CCS Type 2 (60kW Fast)", "AC Type 2 (7kW)"],
  }
];

// Fallback search map for coordinates of major cities
const CITY_COORDINATES = {
  jaipur: { lat: 26.9124, lon: 75.7873, name: "Jaipur, Rajasthan, India" },
  udaipur: { lat: 24.5854, lon: 73.7125, name: "Udaipur, Rajasthan, India" },
  delhi: { lat: 28.6139, lon: 77.2090, name: "New Delhi, Delhi, India" },
  newdelhi: { lat: 28.6139, lon: 77.2090, name: "New Delhi, Delhi, India" },
  mumbai: { lat: 19.0760, lon: 72.8777, name: "Mumbai, Maharashtra, India" },
  bengaluru: { lat: 12.9716, lon: 77.5946, name: "Bengaluru, Karnataka, India" },
  bangalore: { lat: 12.9716, lon: 77.5946, name: "Bengaluru, Karnataka, India" },
  pune: { lat: 18.5204, lon: 73.8567, name: "Pune, Maharashtra, India" },
  hyderabad: { lat: 17.3850, lon: 78.4867, name: "Hyderabad, Telangana, India" },
  chennai: { lat: 13.0827, lon: 80.2707, name: "Chennai, Tamil Nadu, India" },
  kolkata: { lat: 22.5726, lon: 88.3639, name: "Kolkata, West Bengal, India" }
};

/**
 * Resolves a city name query to coordinates (lat, lon) using Nominatim,
 * falling back to local pre-defined coordinates for offline/failsafe operations.
 */
export async function geocodeCity(query) {
  const cleanQuery = query.trim().toLowerCase().replace(/\s+/g, "");
  
  try {
    // Attempt Nominatim geocoding
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=1`,
      {
        headers: {
          "User-Agent": "BudgetEVDekho-Charging-Locator-App"
        }
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon),
          displayName: data[0].display_name
        };
      }
    }
  } catch (error) {
    console.warn("Geocoding API error, using fallback coordinates:", error);
  }

  // Fallback map check
  const fallback = CITY_COORDINATES[cleanQuery];
  if (fallback) {
    return {
      lat: fallback.lat,
      lon: fallback.lon,
      displayName: fallback.name
    };
  }

  // Final fallback (India Center)
  return {
    lat: 20.5937,
    lon: 78.9629,
    displayName: "India (Central)"
  };
}

/**
 * Fetches EV Charging stations near the given latitude and longitude.
 * Attempts to call OpenChargeMap API if a key is available or falls back to simulated/mock POIs.
 */
export async function fetchChargingStations(lat, lon) {
  const apiKey = process.env.NEXT_PUBLIC_OPENCHARGEMAP_API_KEY;
  let useFallback = true;
  let stationsData = [];

  // Check if we are searching near Jodhpur (Jodhpur coords: 26.2389, 73.0243)
  const isJodhpur = getDistanceKm(lat, lon, 26.2389, 73.0243) < 30;

  if (apiKey) {
    try {
      // OpenChargeMap API call (50km radius)
      const response = await fetch(
        `https://api.openchargemap.org/v3/poi/?output=json&latitude=${lat}&longitude=${lon}&distance=50&distanceunit=KM&maxresults=40&key=${apiKey}`
      );
      
      if (response.ok) {
        const data = await response.json();
        
        if (isJodhpur) {
          console.log(`Raw station count returned for Jodhpur: ${data ? data.length : 0}`);
        }

        console.log("Data source: OpenChargeMap (live)");
        useFallback = false;
        
        if (data && data.length > 0) {
          // Parse OpenChargeMap POIs into simplified app structure
          stationsData = data.map((poi) => {
            const operator = poi.OperatorInfo?.Title || "Independent Operator";
            const chargerTypes = (poi.Connections || []).map((conn) => {
              const power = conn.PowerKW ? ` (${conn.PowerKW}kW)` : "";
              const type = conn.ConnectionType?.Title || "Unknown Connection";
              return `${type}${power}`;
            });

            return {
              id: poi.ID.toString(),
              name: poi.AddressInfo?.Title || "Charging Station",
              address: poi.AddressInfo?.AddressLine1 || "Address not available",
              operator: operator,
              latitude: poi.AddressInfo?.Latitude,
              longitude: poi.AddressInfo?.Longitude,
              points: poi.NumberOfPoints || poi.Connections?.length || 2,
              chargerTypes: chargerTypes.length > 0 ? chargerTypes : ["Standard Charger"],
              distance: getDistanceKm(lat, lon, poi.AddressInfo?.Latitude, poi.AddressInfo?.Longitude),
            };
          });
        }
      } else {
        if (isJodhpur) {
          console.log("Raw station count returned for Jodhpur: 0 (API response not ok)");
        }
      }
    } catch (error) {
      console.warn("OpenChargeMap API failed, falling back to mock data:", error);
      if (isJodhpur) {
        console.log("Raw station count returned for Jodhpur: 0 (API failed/threw error)");
      }
    }
  }

  if (useFallback) {
    console.log("Data source: Fallback dataset");
    // Failsafe & default simulation logic:
    // Generate/retrieve stations from local mock database and calculate their distances
    return FALLBACK_STATIONS.map((station) => ({
      ...station,
      distance: getDistanceKm(lat, lon, station.latitude, station.longitude)
    }))
      .filter((station) => station.distance <= 100) // Include up to 100km away
      .sort((a, b) => a.distance - b.distance);
  }

  return stationsData;
}
