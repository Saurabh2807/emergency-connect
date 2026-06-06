// ==========================================================================
// Emergency Connect - React Application (CDN Powered)
// ==========================================================================

const { useState, useEffect, useRef, useMemo } = React;

function App() {
  // --- State Variables ---
  const [currentView, setCurrentView] = useState('#home');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [city, setCity] = useState('Bhopal, MP');
  const [mapCenter, setMapCenter] = useState([23.2599, 77.4126]);
  
  // Data State
  const [listings, setListings] = useState([]);
  const [donors, setDonors] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState({ activeRequests: 0, resourcesAvailable: 0, volunteersOnline: 0, savedLives: 0 });
  const [successStories, setSuccessStories] = useState([]);

  // Mesh & Heatmap States
  const [meshMode, setMeshMode] = useState(false);
  const [syncProgress, setSyncProgress] = useState(null);
  const [heatmapActive, setHeatmapActive] = useState(false);
  const [activeRoute, setActiveRoute] = useState(null);

  // Search & Filters
  const [citySearchInput, setCitySearchInput] = useState('');
  const [resourceSearch, setResourceSearch] = useState('');
  const [resourceTab, setResourceTab] = useState('all'); // 'all', 'request', 'offer'
  const [resourceCategory, setResourceCategory] = useState('All');
  const [bloodSearchGroup, setBloodSearchGroup] = useState('All');
  const [volunteerSearch, setVolunteerSearch] = useState('');

  // Modals and Drawers
  const [isAddResourceOpen, setIsAddResourceOpen] = useState(false);
  const [isAddVolunteerOpen, setIsAddVolunteerOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Active Chats State
  const [chats, setChats] = useState({});
  const [activeChat, setActiveChat] = useState(null); // { recipientId, name, avatar, text }

  // Auth User
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem('currentUser')) || { name: 'Amit Sharma', role: 'responder' }
  );

  // Notifications
  const [toasts, setToasts] = useState([]);

  // --- Refs ---
  const mapContainerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markersGroupRef = useRef(null);
  const routePolylineRef = useRef(null);
  const heatmapCirclesRef = useRef([]);

  // --- Toast Helper ---
  const showToast = (title, message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // --- Initial Seed Load ---
  useEffect(() => {
    const seed = window.emergencySeedData;
    if (seed) {
      setListings(seed.listings);
      setDonors(seed.donors);
      setVolunteers(seed.volunteers);
      setActivities(seed.activities);
      setStats(seed.stats);
      setSuccessStories(seed.successStories);
    }
    
    // Hash Routing
    const handleHash = () => {
      const hash = window.location.hash || '#home';
      setCurrentView(hash);
      setMobileNavOpen(false);
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', handleHash);
    handleHash();

    // Dark Mode Theme Init
    document.documentElement.setAttribute('data-theme', theme);

    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // --- Theme Toggle ---
  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    showToast('Theme Changed', `Switched to ${nextTheme === 'dark' ? 'Dark' : 'Light'} Mode`, 'info');
  };

  // --- dynamic mock data loader on city change ---
  const loadCityData = (lat, lng, cityName) => {
    setMapCenter([lat, lng]);
    setCity(cityName);
    setActiveRoute(null);

    // Call helper function in data.js to generate mock items
    if (window.generateMockDataForCity) {
      const dynamicData = window.generateMockDataForCity(lat, lng, cityName);
      setListings(dynamicData.listings);
      setDonors(dynamicData.donors);
      setVolunteers(dynamicData.volunteers);
      setActivities(dynamicData.activities);
      setStats(dynamicData.stats);
      showToast('Map Relocated', `Loaded relief directory for ${cityName}`, 'success');
      logActivity('CITY_CHANGE', `Map re-centered on ${cityName}`, `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`);
    }
  };

  // --- Nominatim Geocoding Search ---
  const handleCitySearch = async (e) => {
    e.preventDefault();
    if (!citySearchInput.trim()) return;

    showToast('Searching...', `Locating "${citySearchInput}" in India`, 'info');

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&countrycodes=in&limit=1&q=${encodeURIComponent(citySearchInput)}`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        const displayName = result.display_name.split(',')[0] + ", India";
        loadCityData(lat, lng, displayName);
        setCitySearchInput('');
      } else {
        // Fallback search in predefined major cities
        const fallbackCities = {
          "delhi": [28.6139, 77.2090, "New Delhi, DL"],
          "mumbai": [19.0760, 72.8777, "Mumbai, MH"],
          "bangalore": [12.9716, 77.5946, "Bangalore, KA"],
          "pune": [18.5204, 73.8567, "Pune, MH"],
          "kolkata": [22.5726, 88.3639, "Kolkata, WB"],
          "hyderabad": [17.3850, 78.4867, "Hyderabad, TS"],
          "chennai": [13.0827, 80.2707, "Chennai, TN"],
          "indore": [22.7196, 75.8577, "Indore, MP"]
        };

        const queryLower = citySearchInput.toLowerCase().trim();
        let foundFallback = false;
        for (const k in fallbackCities) {
          if (queryLower.includes(k)) {
            const [flat, flng, fname] = fallbackCities[k];
            loadCityData(flat, flng, fname);
            setCitySearchInput('');
            foundFallback = true;
            break;
          }
        }

        if (!foundFallback) {
          showToast('Search Failed', 'Could not locate that city. Showing Bhopal standard view.', 'warning');
        }
      }
    } catch (error) {
      showToast('Search Error', 'Network geocoding failed. Try searching major cities.', 'warning');
    }
  };

  // --- Add System Action Logger ---
  const logActivity = (type, title, message) => {
    const newAct = {
      id: "act-" + Date.now(),
      type,
      title,
      message,
      timestamp: new Date().toISOString()
    };
    setActivities(prev => [newAct, ...prev]);
  };

  // --- Leaflet Map Render & Effect ---
  useEffect(() => {
    // If Map element exists and instance doesn't, initialize
    if (mapContainerRef.current && !leafletMapRef.current) {
      leafletMapRef.current = L.map(mapContainerRef.current, {
        center: mapCenter,
        zoom: 12.5,
        zoomControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(leafletMapRef.current);

      markersGroupRef.current = L.layerGroup().addTo(leafletMapRef.current);

      // Event listener for clicks on popup buttons
      leafletMapRef.current.on('popupopen', (e) => {
        const container = e.popup.getElement();
        const coordBtn = container.querySelector('.coordinate-btn');
        if (coordBtn) {
          coordBtn.onclick = () => {
            const id = coordBtn.getAttribute('data-id');
            const item = listings.find(x => x.id === id);
            if (item) handleCoordinateRoute(item.id, item.title, item.contact, [item.location.lat, item.location.lng]);
          };
        }
        const volBtn = container.querySelector('.contact-vol-btn');
        if (volBtn) {
          volBtn.onclick = () => {
            const id = volBtn.getAttribute('data-id');
            const vol = volunteers.find(x => x.id === id);
            if (vol) handleCoordinateRoute(vol.id, vol.name, vol.contact, [vol.lat, vol.lng]);
          };
        }
      });
    }

    // Update center if it changed
    if (leafletMapRef.current) {
      leafletMapRef.current.setView(mapCenter, 12.5);
    }
  }, [mapCenter]);

  // --- Update Markers, Heatmap, and Polylines on changes ---
  useEffect(() => {
    if (!leafletMapRef.current || !markersGroupRef.current) return;

    // Clear markers
    markersGroupRef.current.clearLayers();

    // Custom Icons
    const createCustomIcon = (color, svgPath) => {
      return L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div style="
            background: ${color};
            color: white;
            width: 38px;
            height: 38px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            transform: translate(-10px, -10px);
            transition: all 0.2s ease;
          ">
            ${svgPath}
          </div>
        `
      });
    };

    const alertIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
    const packageIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><polygon points="12 22.08 12 12 3 6.93 3 17.07 12 22.08"/><polygon points="12 22.08 12 12 21 6.93 21 17.07 12 22.08"/><polygon points="12 12 3 6.93 12 1.86 21 6.93 12 12"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`;
    const userIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;

    // Add Listing Markers
    listings.forEach(item => {
      if (item.status === 'resolved') return;
      const isRequest = item.type === 'request';
      const color = isRequest ? 'var(--color-danger)' : 'var(--color-success)';
      const marker = L.marker([item.location.lat, item.location.lng], {
        icon: createCustomIcon(color, isRequest ? alertIconSvg : packageIconSvg)
      });

      const popupHtml = `
        <div style="font-family: inherit; width: 220px; padding: 4px;">
          <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; padding: 2px 6px; border-radius: 999px; margin-bottom: 6px; display: inline-block; background: ${isRequest ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)'}; color: ${color};">
            ${item.category} (${isRequest ? 'Request' : 'Offer'})
          </span>
          <h4 style="font-size: 13px; margin: 4px 0 6px 0; font-weight: 700; color: var(--text-main);">${item.title}</h4>
          <p style="font-size: 11px; color: var(--text-muted); margin: 0 0 10px 0;">📍 ${item.location.address}</p>
          <button class="btn btn-primary coordinate-btn" data-id="${item.id}" style="font-size: 11px; padding: 6px 12px; width: 100%; font-weight:600;">Coordinate Assistance</button>
        </div>
      `;
      marker.bindPopup(popupHtml);
      markersGroupRef.current.addLayer(marker);
    });

    // Add Volunteer Markers
    volunteers.forEach(vol => {
      if (vol.availability !== 'available') return;
      const marker = L.marker([vol.lat, vol.lng], {
        icon: createCustomIcon('var(--color-primary)', userIconSvg)
      });

      const popupHtml = `
        <div style="font-family: inherit; width: 200px; padding: 4px;">
          <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; padding: 2px 6px; border-radius: 999px; background: rgba(37, 99, 235, 0.15); color: var(--color-primary); margin-bottom: 6px; display: inline-block;">
            Active Responder
          </span>
          <h4 style="font-size: 13px; margin: 4px 0; font-weight: 700; color: var(--text-main);">${vol.name}</h4>
          <p style="font-size: 11px; color: var(--text-muted); margin: 0 0 4px 0;">🛠️ ${vol.skills.slice(0, 2).join(', ')}</p>
          <p style="font-size: 11px; color: var(--text-muted); margin: 0 0 10px 0;">📍 ${vol.serviceArea}</p>
          <button class="btn btn-primary contact-vol-btn" data-id="${vol.id}" style="font-size: 11px; padding: 6px 12px; width: 100%; font-weight:600;">Dispatch to Current Event</button>
        </div>
      `;
      marker.bindPopup(popupHtml);
      markersGroupRef.current.addLayer(marker);
    });

    // Handle Heatmap Overlay Circles
    heatmapCirclesRef.current.forEach(c => leafletMapRef.current.removeLayer(c));
    heatmapCirclesRef.current = [];

    if (heatmapActive) {
      // Draw distress zones around unresolved request items
      listings.forEach(item => {
        if (item.type === 'request' && item.urgency === 'critical' && item.status !== 'resolved') {
          const circle = L.circle([item.location.lat, item.location.lng], {
            color: 'red',
            fillColor: '#f03',
            fillOpacity: 0.35,
            radius: 400
          }).addTo(leafletMapRef.current);
          heatmapCirclesRef.current.push(circle);
        }
      });
    }

    // Trigger Lucide Icon rendering
    setTimeout(() => {
      if (window.lucide) window.lucide.createIcons();
    }, 100);

  }, [listings, volunteers, heatmapActive]);

  // --- Handle active routing ---
  useEffect(() => {
    if (!leafletMapRef.current) return;

    if (routePolylineRef.current) {
      leafletMapRef.current.removeLayer(routePolylineRef.current);
      routePolylineRef.current = null;
    }

    if (activeRoute) {
      routePolylineRef.current = L.polyline(activeRoute.coords, {
        color: 'var(--color-primary)',
        weight: 4.5,
        dashArray: '8, 12',
        opacity: 0.85
      }).addTo(leafletMapRef.current);

      leafletMapRef.current.fitBounds(routePolylineRef.current.getBounds(), { padding: [40, 40] });
    }
  }, [activeRoute]);

  // --- Dispatch Routing Helper ---
  const handleCoordinateRoute = (recipientId, name, contactStr, destCoords) => {
    // Current user location centered mock
    const userLoc = [mapCenter[0], mapCenter[1]];
    setActiveRoute({
      id: recipientId,
      coords: [userLoc, destCoords]
    });

    // Extract names and format
    const nameOnly = name || contactStr.split('(')[1]?.replace(')', '') || 'Dispatcher';
    const initMessage = `Hello! I am dispatched to coordinate emergency support for: "${name}". Mapping routing path now.`;
    
    openChat(recipientId, nameOnly, initMessage);
    showToast('Delivery Path Dispatched', `Polyline route generated on console map.`, 'success');
  };

  // --- Chat Messaging Controllers ---
  const openChat = (recipientId, name, initialMsgText) => {
    const avatar = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    setActiveChat({
      recipientId,
      name,
      avatar,
      status: 'Online via Mesh'
    });

    // Init chat list history if empty
    if (!chats[recipientId]) {
      setChats(prev => ({
        ...prev,
        [recipientId]: [
          { sender: 'received', text: initialMsgText || "Connected to coordination mesh.", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        ]
      }));
    }
  };

  const sendChatMessage = (text) => {
    if (!activeChat || !text.trim()) return;
    const recipientId = activeChat.recipientId;

    const userMsg = {
      sender: 'sent',
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChats(prev => ({
      ...prev,
      [recipientId]: [...(prev[recipientId] || []), userMsg]
    }));

    logActivity('MESSAGE_SENT', `Direct peer communication with ${activeChat.name}`, `Sent message: "${text}"`);

    // Simulated Auto response after 1.5 seconds
    setTimeout(() => {
      const responses = [
        "Received. Initiating logistics transfer.",
        "Understood. Moving vehicle to the target coordinates.",
        "Coordinates synchronized. Secure communication channel established.",
        "Acknowledged. Items have been prepped for staging."
      ];
      const replyText = responses[Math.floor(Math.random() * responses.length)];

      const systemReply = {
        sender: 'received',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChats(prev => ({
        ...prev,
        [recipientId]: [...(prev[recipientId] || []), systemReply]
      }));
      showToast('New Message', `Received reply from ${activeChat.name}`, 'info');
    }, 1500);
  };

  // --- Offline P2P Mesh Mode Simulation ---
  const handleMeshToggle = () => {
    const nextMesh = !meshMode;
    setMeshMode(nextMesh);
    if (nextMesh) {
      showToast('Mesh Link Connected', 'Simulating connection via peer-to-peer RF mesh nodes', 'warning');
      logActivity('MESH_CONNECTED', 'P2P RF Link Activated', 'Local routing tables updated.');
    } else {
      showToast('Cellular Mode Active', 'Switched back to standard internet network grids', 'info');
      logActivity('MESH_DISCONNECTED', 'Cellular Mode Restored', 'Switched off local peer discovery.');
    }
  };

  const runPeerSync = () => {
    if (syncProgress !== null) return;
    setSyncProgress(0);
    showToast('Syncing Databases', 'Syncing peer records from mesh network...', 'info');

    let current = 0;
    const interval = setInterval(() => {
      current += 10;
      setSyncProgress(current);
      if (current >= 100) {
        clearInterval(interval);
        setSyncProgress(null);

        // Add 2 mock localized listings centered in the searched city
        const meshListings = [
          {
            id: "list-mesh-1",
            title: "[Mesh-Node] Food Request in Sector 4",
            category: "Food Packets",
            type: "request",
            description: "Urgent need for 10 water bottles and food packets at community base point.",
            location: { address: `Sector 4, ${city}`, lat: mapCenter[0] + 0.015, lng: mapCenter[1] - 0.01 },
            contact: "+91 94220 99887 (Node-B5)",
            urgency: "high",
            quantity: 10,
            status: "pending",
            timestamp: new Date().toISOString(),
            userId: "mesh-node-b5"
          },
          {
            id: "list-mesh-2",
            title: "[Mesh-Node] Available: Transport Jeep",
            category: "Emergency Transport",
            type: "offer",
            description: "Heavy logistics vehicle with high water clearance, ready to dispatch.",
            location: { address: `Central Area, ${city}`, lat: mapCenter[0] - 0.02, lng: mapCenter[1] + 0.015 },
            contact: "+91 91311 00223 (Node-Sunset-A)",
            urgency: "medium",
            quantity: 1,
            status: "available",
            timestamp: new Date().toISOString(),
            userId: "mesh-node-sunset"
          }
        ];

        setListings(prev => [meshListings[0], meshListings[1], ...prev]);
        setStats(prev => ({
          ...prev,
          activeRequests: prev.activeRequests + 1,
          resourcesAvailable: prev.resourcesAvailable + 1
        }));
        showToast('Sync Complete', 'Successfully integrated 2 new peer records.', 'success');
        logActivity('MESH_SYNC', 'Database Synchronized', 'Merged Node-B5 and Node-Sunset-A records.');
      }
    }, 200);
  };

  // --- Add Resource Form Submission ---
  const handleAddResourceSubmit = (e) => {
    e.preventDefault();
    const dataObj = new FormData(e.target);
    
    // Spread coordinates around mapCenter
    const lat = mapCenter[0] + ((Math.random() - 0.5) * 0.06);
    const lng = mapCenter[1] + ((Math.random() - 0.5) * 0.06);

    const newListing = {
      id: "list-" + Date.now(),
      title: dataObj.get('title'),
      category: dataObj.get('category'),
      type: dataObj.get('type'),
      description: dataObj.get('desc'),
      location: {
        address: dataObj.get('address'),
        lat,
        lng
      },
      contact: dataObj.get('contact'),
      urgency: dataObj.get('urgency') || 'medium',
      quantity: parseInt(dataObj.get('qty')) || 1,
      status: dataObj.get('type') === 'request' ? 'pending' : 'available',
      timestamp: new Date().toISOString(),
      userId: "user-current"
    };

    setListings(prev => [newListing, ...prev]);
    setIsAddResourceOpen(false);
    showToast('Listing Created', `Successfully posted: ${newListing.title}`, 'success');
    logActivity('OFFER_CREATED', 'New Resource Listed', `${newListing.title} published in ${city}.`);
  };

  // --- Add Volunteer Form Submission ---
  const handleAddVolunteerSubmit = (e) => {
    e.preventDefault();
    const dataObj = new FormData(e.target);
    
    // Collect active checked skills
    const skillsChecked = [];
    e.target.querySelectorAll('.vol-skill-chk:checked').forEach(chk => {
      skillsChecked.push(chk.value);
    });

    if (skillsChecked.length === 0) {
      showToast('Validation Error', 'Select at least one response skill.', 'warning');
      return;
    }

    const lat = mapCenter[0] + ((Math.random() - 0.5) * 0.05);
    const lng = mapCenter[1] + ((Math.random() - 0.5) * 0.05);

    const newVol = {
      id: "vol-" + Date.now(),
      name: dataObj.get('name'),
      skills: skillsChecked,
      availability: 'available',
      serviceArea: dataObj.get('area'),
      contact: dataObj.get('phone'),
      lat,
      lng
    };

    setVolunteers(prev => [newVol, ...prev]);
    setIsAddVolunteerOpen(false);
    showToast('Responder Registered', `Welcome to the network, ${newVol.name}!`, 'success');
    logActivity('VOLUNTEER_REGISTERED', 'Responder Node Online', `${newVol.name} registered skills: ${skillsChecked.join(', ')}`);
  };

  // --- SOS Confirmed Trigger ---
  const handleSosConfirm = (e) => {
    e.preventDefault();
    const dataObj = new FormData(e.target);

    // Spawns immediately near mapCenter
    const lat = mapCenter[0] + ((Math.random() - 0.5) * 0.02);
    const lng = mapCenter[1] + ((Math.random() - 0.5) * 0.02);

    const newSos = {
      id: "sos-" + Date.now(),
      title: "🚨 SOS: IMMEDIATE RESCUE NEEDED",
      category: "Volunteers",
      type: "request",
      description: dataObj.get('desc') || 'Critical distress alert. SOS beacon triggered.',
      location: {
        address: `Incident point, ${city}`,
        lat,
        lng
      },
      contact: dataObj.get('phone') || '+91 99999 99999',
      urgency: 'critical',
      quantity: 1,
      status: 'pending',
      timestamp: new Date().toISOString(),
      userId: 'user-critical'
    };

    setListings(prev => [newSos, ...prev]);
    setIsSosOpen(false);
    showToast('SOS Broadcasted', 'Distress beacons transmitted to all local peer nodes.', 'warning');
    logActivity('SOS_ALERT', 'CRITICAL SOS ALERT TRANSMITTED', `Beacon active at coordinates: [${lat.toFixed(4)}, ${lng.toFixed(4)}]`);
  };

  // --- Match Smart Connection Resolve ---
  const handleSmartMatch = (requestId, offerId) => {
    setListings(prev => prev.map(item => {
      if (item.id === requestId || item.id === offerId) {
        return { ...item, status: 'resolved' };
      }
      return item;
    }));

    const reqItem = listings.find(x => x.id === requestId);
    const offerItem = listings.find(x => x.id === offerId);

    if (reqItem && offerItem) {
      // Connect coordinates route
      setActiveRoute({
        id: requestId,
        coords: [
          [reqItem.location.lat, reqItem.location.lng],
          [offerItem.location.lat, offerItem.location.lng]
        ]
      });

      // Trigger chat coordination with offer provider
      const receiverName = offerItem.contact.split('(')[1]?.replace(')', '') || 'Aid Provider';
      openChat(offerId, receiverName, `Smart Match Found! I see your offer matches request: "${reqItem.title}". Generating optimal routing path.`);

      setStats(prev => ({
        ...prev,
        activeRequests: Math.max(0, prev.activeRequests - 1),
        savedLives: prev.savedLives + 3
      }));

      showToast('Smart Match Synced', 'Successfully linked aid request with matching provider!', 'success');
      logActivity('MATCH_RESOLVED', 'Smart Match Connected', `Request: "${reqItem.title}" matched with Offer: "${offerItem.title}". Route is drawn.`);
    }
  };

  // --- Filtering computations ---
  const filteredListings = useMemo(() => {
    return listings.filter(item => {
      // Type Tab Filter
      if (resourceTab === 'request' && item.type !== 'request') return false;
      if (resourceTab === 'offer' && item.type !== 'offer') return false;

      // Category filter
      if (resourceCategory !== 'All' && item.category !== resourceCategory) return false;

      // Search Query filter
      if (resourceSearch.trim()) {
        const query = resourceSearch.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        const matchesArea = item.location.address.toLowerCase().includes(query);
        return matchesTitle || matchesDesc || matchesArea;
      }

      return true;
    });
  }, [listings, resourceTab, resourceCategory, resourceSearch]);

  const filteredDonors = useMemo(() => {
    return donors.filter(d => {
      if (bloodSearchGroup !== 'All' && d.bloodGroup !== bloodSearchGroup) return false;
      return true;
    });
  }, [donors, bloodSearchGroup]);

  const filteredVolunteers = useMemo(() => {
    return volunteers.filter(v => {
      if (volunteerSearch.trim()) {
        const query = volunteerSearch.toLowerCase();
        const nameMatch = v.name.toLowerCase().includes(query);
        const skillMatch = v.skills.some(s => s.toLowerCase().includes(query));
        const areaMatch = v.serviceArea.toLowerCase().includes(query);
        return nameMatch || skillMatch || areaMatch;
      }
      return true;
    });
  }, [volunteers, volunteerSearch]);

  // Find Smart matches for active selected detail items
  const getSmartMatches = (item) => {
    if (item.type !== 'request') return [];
    return listings.filter(x => 
      x.type === 'offer' && 
      x.category === item.category && 
      x.status !== 'resolved'
    );
  };

  return (
    <div className="flex flex-column min-h-screen">
      
      {/* 📡 Offline Mesh Banner */}
      <div className={`mesh-banner ${meshMode ? 'active' : ''}`}>
        <span className="flex align-center gap-sm" style={{ animation: 'pulse-warning 1.5s infinite' }}>
          <i data-lucide="wifi-off" style={{ width: '16px', height: '16px' }}></i>
          <strong>Offline Mesh Network Mode Active</strong> — Operating via local Bluetooth & Wi-Fi direct peers
        </span>
        {syncProgress === null ? (
          <button className="mesh-sync-btn" onClick={runPeerSync}>Sync Peer Nodes</button>
        ) : (
          <div style={{ marginLeft: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px' }}>Syncing: {syncProgress}%</span>
            <div style={{ width: '80px', height: '6px', background: 'rgba(255,255,255,0.2)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${syncProgress}%`, height: '100%', background: '#fff' }}></div>
            </div>
          </div>
        )}
      </div>

      {/* Header navbar */}
      <header className="header-nav flex align-center">
        <div className="container nav-container flex align-center justify-between" style={{ width: '100%' }}>
          <a href="#home" className="logo" onClick={() => setCurrentView('#home')}>
            <i data-lucide="shield-alert" className="logo-icon"></i>
            <div className="logo-text">Emergency<span>Connect</span></div>
          </a>
          
          <nav className="desktop-only">
            <ul className="nav-links flex">
              <li><a href="#home" className={currentView === '#home' ? 'active' : ''}>Home</a></li>
              <li><a href="#dashboard" className={currentView === '#dashboard' ? 'active' : ''}>Dashboard</a></li>
              <li><a href="#resources" className={currentView === '#resources' ? 'active' : ''}>Resources</a></li>
              <li><a href="#blood" className={currentView === '#blood' ? 'active' : ''}>Blood Registry</a></li>
              <li><a href="#volunteers" className={currentView === '#volunteers' ? 'active' : ''}>Volunteers</a></li>
            </ul>
          </nav>

          {/* Quick Header Actions */}
          <div className="flex align-center gap-sm">
            
            {/* Indian City Search (India Wide Map Search Feature) */}
            <form onSubmit={handleCitySearch} className="flex align-center gap-xs desktop-only" style={{ marginRight: '10px' }}>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  placeholder="Search city in India (e.g. Delhi, Mumbai...)" 
                  className="form-input" 
                  style={{ width: '280px', paddingRight: '30px', fontSize: '12px', height: '36px' }}
                  value={citySearchInput} 
                  onChange={(e) => setCitySearchInput(e.target.value)}
                />
                <button type="submit" style={{ position: 'absolute', right: '10px', top: '10px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  <i data-lucide="search" style={{ width: '16px', height: '16px' }}></i>
                </button>
              </div>
            </form>

            <button 
              className={`btn-icon-only ${meshMode ? 'mesh-toggle-active' : ''}`}
              title="Toggle Offline Mesh Link Mode" 
              onClick={handleMeshToggle}
            >
              <i data-lucide={meshMode ? "wifi-off" : "wifi"}></i>
            </button>
            <button className="btn-icon-only" onClick={toggleTheme} title="Toggle Theme">
              <i data-lucide={theme === 'dark' ? "sun" : "moon"}></i>
            </button>
            
            {currentUser ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="user-profile desktop-only">{currentUser.name} ({currentUser.role})</span>
                <button className="btn btn-secondary" onClick={() => { setCurrentUser(null); localStorage.removeItem('currentUser'); showToast('Signed Out', 'Signed out from administrator session.', 'info'); }} style={{ padding: '6px 12px', fontSize: '12px' }}>
                  Logout
                </button>
              </div>
            ) : (
              <button className="btn btn-secondary desktop-only" onClick={() => setIsAuthOpen(true)}>
                <i data-lucide="user"></i> Sign In
              </button>
            )}

            <button className="btn btn-sos" onClick={() => setIsSosOpen(true)}>
              <i data-lucide="alert-octagon"></i> SOS
            </button>

            <button className="btn-icon-only hamburger-menu-btn" onClick={() => setMobileNavOpen(true)}>
              <i data-lucide="menu"></i>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body Render Panel */}
      <main className="flex-grow-1" style={{ paddingTop: '80px' }}>
        
        {/* --- VIEW: HOME (Landing Page with Leaflet Map) --- */}
        <section id="home-view" className={`page-view ${currentView === '#home' ? 'active' : ''}`}>
          
          {/* Mobile search bar */}
          <div className="container mobile-only" style={{ padding: '15px' }}>
            <form onSubmit={handleCitySearch} className="flex gap-sm">
              <input 
                type="text" 
                placeholder="Search city in India (e.g. Pune, Delhi...)" 
                className="form-input" 
                style={{ flex: 1 }}
                value={citySearchInput} 
                onChange={(e) => setCitySearchInput(e.target.value)}
              />
              <button type="submit" className="btn btn-primary"><i data-lucide="search"></i></button>
            </form>
          </div>

          <div className="hero-section text-center">
            <div className="container hero-container" style={{ maxWidth: '800px' }}>
              <span className="badge badge-low" style={{ marginBottom: '16px', textTransform: 'uppercase' }}>🇮🇳 India Disaster Resilience Track</span>
              <h1 className="hero-title">Emergency Resource Mapping & P2P Mesh Linking</h1>
              <p className="hero-subtitle">
                A localized disaster platform configured to run dynamically across any Indian city. Coordinate volunteer logs, search blood compatibility groups, and bridge critical requests.
              </p>
              <div className="flex justify-center gap-sm">
                <a href="#resources" className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '15px' }}>
                  Explore Resources Directory
                </a>
                <button className="btn btn-success" onClick={() => setIsAddResourceOpen(true)} style={{ padding: '14px 28px', fontSize: '15px' }}>
                  Offer Assistance
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Map Section */}
          <div className="container" style={{ marginBottom: '40px' }}>
            <div style={{ position: 'relative', height: '480px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
              
              {/* Actual Map Target */}
              <div ref={mapContainerRef} style={{ width: '100%', height: '100%', zIndex: 10 }}></div>

              {/* Heatmap Layer Control */}
              <button 
                className={`map-heatmap-toggle ${heatmapActive ? 'mesh-toggle-active' : ''}`}
                onClick={() => setHeatmapActive(!heatmapActive)}
              >
                <i data-lucide="flame"></i> Distress Hotspots Map
              </button>

              {/* Overlay display details */}
              <div style={{ position: 'absolute', top: '15px', right: '15px', padding: '10px 14px', borderRadius: '8px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', zIndex: 500, fontSize: '12px', boxShadow: 'var(--shadow-md)' }}>
                <strong>📍 Active Jurisdiction:</strong> {city}
              </div>
            </div>

            {/* Quick Stats Banner */}
            <div className="grid grid-3" style={{ marginTop: '20px', gap: '15px' }}>
              <div className="stat-card glass-card flex align-center gap-md" style={{ padding: '20px' }}>
                <div className="stat-icon red" style={{ width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyCenter: 'center' }}>
                  <i data-lucide="alert-circle" style={{ color: 'var(--color-danger)' }}></i>
                </div>
                <div>
                  <h3 style={{ fontSize: '24px', fontWeight: '800' }}>{stats.activeRequests}</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Distress Requests Pending</p>
                </div>
              </div>
              <div className="stat-card glass-card flex align-center gap-md" style={{ padding: '20px' }}>
                <div className="stat-icon green">
                  <i data-lucide="check-square" style={{ color: 'var(--color-success)' }}></i>
                </div>
                <div>
                  <h3 style={{ fontSize: '24px', fontWeight: '800' }}>{stats.resourcesAvailable}</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Resource Offers Staged</p>
                </div>
              </div>
              <div className="stat-card glass-card flex align-center gap-md" style={{ padding: '20px' }}>
                <div className="stat-icon blue">
                  <i data-lucide="users" style={{ color: 'var(--color-primary)' }}></i>
                </div>
                <div>
                  <h3 style={{ fontSize: '24px', fontWeight: '800' }}>{stats.volunteersOnline}</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Rescuers Linked via Mesh</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Categories Index Grid */}
          <div className="container" style={{ paddingBottom: '60px' }}>
            <h2 className="text-center" style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>Emergency Resource Dispatcher</h2>
            <p className="text-center" style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '30px' }}>Categories for indexing disaster response nodes.</p>
            <div className="grid grid-4" style={{ gap: '15px' }}>
              {[
                { title: 'Blood Donors', icon: 'droplet', desc: 'Find active matches', href: '#blood' },
                { title: 'Medical Kits', icon: 'pill', desc: 'Staged medications', href: '#resources' },
                { title: 'Food & Water', icon: 'shopping-bag', desc: 'Hot meal staging', href: '#resources' },
                { title: 'Emergency Transports', icon: 'truck', desc: '4x4 flood passage vehicles', href: '#resources' }
              ].map((c, i) => (
                <a key={i} href={c.href} className="category-card glass-card" style={{ display: 'block', padding: '20px', borderRadius: '12px', textDecoration: 'none', color: 'inherit' }}>
                  <div className="category-card-icon" style={{ marginBottom: '12px', color: 'var(--color-primary)' }}>
                    <i data-lucide={c.icon}></i>
                  </div>
                  <h4 style={{ fontWeight: '700', fontSize: '16px' }}>{c.title}</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{c.desc}</p>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* --- VIEW: DASHBOARD (Unified Console Logs & Activities) --- */}
        <section id="dashboard-view" className={`page-view ${currentView === '#dashboard' ? 'active' : ''}`}>
          <div className="container" style={{ padding: '30px 0' }}>
            <h1 style={{ fontSize: '32px', marginBottom: '12px' }}>Incident Command Console</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>Unified monitoring console for regional operations centered in {city}.</p>
            
            <div className="grid grid-3" style={{ gap: '20px', alignItems: 'start' }}>
              
              {/* Left Column: Recent Activity Logs */}
              <div className="glass-card" style={{ gridColumn: 'span 2', padding: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '15px' }} className="flex align-center gap-xs">
                  <i data-lucide="terminal"></i> Match Engine Activity Logs
                </h3>
                <div style={{ maxHeight: '420px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {activities.map((a, i) => (
                    <div key={i} style={{ padding: '12px 16px', background: 'var(--bg-card-hover)', borderLeft: `4px solid ${a.type === 'sos_alert' ? 'var(--color-danger)' : a.type === 'match_found' ? 'var(--color-success)' : 'var(--color-primary)'}`, borderRadius: '4px' }}>
                      <div className="flex justify-between" style={{ marginBottom: '4px' }}>
                        <strong>{a.title}</strong>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{new Date(a.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{a.message}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Dynamic Statistics widgets */}
              <div className="glass-card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '15px' }}>Regional Metrics</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {[
                    { label: 'Lives Safely Evacuated', val: stats.savedLives, color: 'var(--color-success)' },
                    { label: 'Unresolved Emergencies', val: stats.activeRequests, color: 'var(--color-danger)' },
                    { label: 'Volunteers Dispatched', val: volunteers.filter(x => x.availability === 'busy').length, color: 'var(--color-primary)' }
                  ].map((stat, i) => (
                    <div key={i} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{stat.label}</span>
                      <h4 style={{ fontSize: '26px', fontWeight: '800', color: stat.color, margin: '4px 0' }}>{stat.val}</h4>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* --- VIEW: RESOURCES (Public Directory with Match Suggestion) --- */}
        <section id="resources-view" className={`page-view ${currentView === '#resources' ? 'active' : ''}`}>
          <div className="container" style={{ padding: '30px 0' }}>
            <div className="flex justify-between align-center" style={{ marginBottom: '24px' }}>
              <div>
                <h1 style={{ fontSize: '30px' }}>Public Aid Directory</h1>
                <p style={{ color: 'var(--text-muted)' }}>Distributing and requesting emergency supplies in {city}</p>
              </div>
              <div className="flex gap-sm">
                <button className="btn btn-primary" onClick={() => setIsAddResourceOpen(true)}>
                  <i data-lucide="plus-circle"></i> File Request / Offer
                </button>
              </div>
            </div>

            {/* Filter Bar & Tabs */}
            <div className="glass-card" style={{ padding: '20px', marginBottom: '20px' }}>
              <div className="flex justify-between align-center flex-wrap gap-md">
                
                {/* Search Bar */}
                <div style={{ position: 'relative', minWidth: '280px' }}>
                  <input 
                    type="text" 
                    placeholder="Search resources by neighborhood..." 
                    className="form-input" 
                    value={resourceSearch}
                    onChange={(e) => setResourceSearch(e.target.value)}
                  />
                </div>

                {/* Tabs */}
                <div className="flex gap-sm">
                  {['all', 'request', 'offer'].map(tab => (
                    <button 
                      key={tab} 
                      className={`btn ${resourceTab === tab ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ textTransform: 'capitalize', padding: '8px 16px' }}
                      onClick={() => setResourceTab(tab)}
                    >
                      {tab}s
                    </button>
                  ))}
                </div>

                {/* Category selector */}
                <select 
                  className="form-input" 
                  value={resourceCategory} 
                  onChange={(e) => setResourceCategory(e.target.value)}
                  style={{ width: '180px' }}
                >
                  <option value="All">All Categories</option>
                  <option value="Food Packets">Food & Water</option>
                  <option value="Medical Equipment">Medical Supplies</option>
                  <option value="Medicines">Medicines</option>
                  <option value="Emergency Transport">Emergency Transport</option>
                  <option value="Temporary Shelter">Temporary Shelter</option>
                  <option value="Volunteers">Volunteers Needed</option>
                </select>

              </div>
            </div>

            {/* Listings Grid */}
            <div className="grid grid-3" style={{ gap: '15px' }}>
              {filteredListings.map((item) => {
                const isRequest = item.type === 'request';
                const smartMatches = getSmartMatches(item);

                return (
                  <div key={item.id} className="listing-card glass-card flex flex-column justify-between" style={{ padding: '20px', borderLeft: `4px solid ${isRequest ? 'var(--color-danger)' : 'var(--color-success)'}` }}>
                    <div>
                      <div className="flex justify-between" style={{ marginBottom: '8px' }}>
                        <span className="badge" style={{ background: isRequest ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)', color: isRequest ? 'var(--color-danger)' : 'var(--color-success)' }}>
                          {item.category}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {item.urgency.toUpperCase()}
                        </span>
                      </div>
                      
                      <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px' }}>{item.title}</h3>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>{item.description}</p>
                      
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        📍 {item.location.address}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                        📞 {item.contact}
                      </div>
                    </div>

                    <div>
                      {item.status === 'resolved' ? (
                        <div style={{ fontSize: '12px', color: 'var(--color-success)', fontWeight: '700', padding: '6px 0' }}>✓ Handled & Resolved</div>
                      ) : (
                        <div className="smart-match-container">
                          {isRequest && smartMatches.length > 0 && (
                            <div style={{ marginTop: '10px' }}>
                              <h5 style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-success)', marginBottom: '6px' }}>🤖 Smart Match Suggested</h5>
                              {smartMatches.slice(0, 1).map(match => (
                                <div key={match.id} className="match-card flex align-center justify-between" style={{ padding: '8px 12px', borderRadius: '4px', background: 'var(--bg-card-hover)', border: '1px dashed var(--color-success)' }}>
                                  <div style={{ fontSize: '11px' }}>
                                    <strong>{match.contact.split('(')[1]?.replace(')', '') || 'Provider'}</strong>
                                    <div style={{ color: 'var(--text-muted)' }}>Staged: {match.location.address.split(',')[0]}</div>
                                  </div>
                                  <button className="btn btn-success" onClick={() => handleSmartMatch(item.id, match.id)} style={{ padding: '4px 8px', fontSize: '10px' }}>
                                    Match
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          <button 
                            className="btn btn-secondary" 
                            style={{ width: '100%', marginTop: '10px', fontSize: '12px' }}
                            onClick={() => handleCoordinateRoute(item.id, item.title, item.contact, [item.location.lat, item.location.lng])}
                          >
                            Coordinate Logistics
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </section>

        {/* --- VIEW: BLOOD REGISTRY (Compatible matching widgets) --- */}
        <section id="blood-view" className={`page-view ${currentView === '#blood' ? 'active' : ''}`}>
          <div className="container" style={{ padding: '30px 0' }}>
            <h1 style={{ fontSize: '30px', marginBottom: '8px' }}>Blood Donor Registry</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Search and compatibility matching for blood donors in {city}</p>

            <div className="grid grid-3" style={{ gap: '20px', alignItems: 'start' }}>
              
              {/* Left Column: Filter and compatibility tool */}
              <div className="glass-card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '15px' }}>Compatibility Engine</h3>
                <div className="form-group">
                  <label className="form-label">Search Target Blood Group</label>
                  <select 
                    className="form-input" 
                    value={bloodSearchGroup} 
                    onChange={(e) => setBloodSearchGroup(e.target.value)}
                  >
                    <option value="All">All Groups</option>
                    <option value="O-">O- (Universal)</option>
                    <option value="O+">O+</option>
                    <option value="A+">A+</option>
                    <option value="B+">B+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
                <div style={{ padding: '12px', background: 'var(--bg-card-hover)', borderRadius: '6px', fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                  <strong>💡 O-Negative (O-)</strong> is compatible with all recipient groups, making it the universal choice for emergency accident trauma dispatch.
                </div>
              </div>

              {/* Right Column: Listing results */}
              <div className="glass-card" style={{ gridColumn: 'span 2', padding: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '15px' }}>Compatible Registered Donors ({city})</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {filteredDonors.map((d) => (
                    <div key={d.id} className="flex align-center justify-between" style={{ padding: '16px', background: 'var(--bg-card-hover)', borderRadius: '6px' }}>
                      <div className="flex align-center gap-md">
                        <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.15)', color: 'var(--color-danger)', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontWeight: '800', fontSize: '15px' }} className="flex align-center justify-center">
                          {d.bloodGroup}
                        </div>
                        <div>
                          <h4 style={{ fontSize: '14px', fontWeight: '700' }}>{d.name}</h4>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>📍 Sector: {d.location}</span>
                        </div>
                      </div>
                      <div className="flex align-center gap-sm">
                        <span style={{ fontSize: '11px', color: d.available ? 'var(--color-success)' : 'var(--text-muted)' }}>
                          {d.available ? '● Available' : '● Ineligible'}
                        </span>
                        <button 
                          className="btn btn-primary" 
                          disabled={!d.available}
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                          onClick={() => handleCoordinateRoute(d.id, d.name, d.phone, [d.lat, d.lng])}
                        >
                          Dispatch Request
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* --- VIEW: VOLUNTEERS (Rescuer Grid & Dispatches) --- */}
        <section id="volunteers-view" className={`page-view ${currentView === '#volunteers' ? 'active' : ''}`}>
          <div className="container" style={{ padding: '30px 0' }}>
            <div className="flex justify-between align-center" style={{ marginBottom: '24px' }}>
              <div>
                <h1 style={{ fontSize: '30px' }}>Rescuer Mesh Network</h1>
                <p style={{ color: 'var(--text-muted)' }}>Registered disaster response volunteers online in {city}</p>
              </div>
              <button className="btn btn-primary" onClick={() => setIsAddVolunteerOpen(true)}>
                <i data-lucide="user-plus"></i> Register as Volunteer
              </button>
            </div>

            {/* Filter Search */}
            <div className="glass-card" style={{ padding: '16px', marginBottom: '20px' }}>
              <input 
                type="text" 
                placeholder="Search rescuers by skill or coverage area..." 
                className="form-input" 
                value={volunteerSearch}
                onChange={(e) => setVolunteerSearch(e.target.value)}
              />
            </div>

            {/* Grid display */}
            <div className="grid grid-4" style={{ gap: '15px' }}>
              {filteredVolunteers.map((v) => (
                <div key={v.id} className="glass-card flex flex-column justify-between" style={{ padding: '20px' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '6px' }}>{v.name}</h3>
                    <span style={{ fontSize: '11px', color: 'var(--color-primary)', display: 'block', marginBottom: '12px' }}>
                      📍 Coverage: {v.serviceArea.split(',')[0]}
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '15px' }}>
                      {v.skills.map((s, i) => (
                        <span key={i} style={{ fontSize: '10px', padding: '2px 6px', background: 'var(--bg-card-hover)', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <button 
                      className="btn btn-secondary" 
                      style={{ width: '100%', fontSize: '12px' }}
                      onClick={() => handleCoordinateRoute(v.id, v.name, v.contact, [v.lat, v.lng])}
                    >
                      Dispatch Node
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

      </main>

      {/* Footer */}
      <footer style={{ marginTop: 'auto', padding: '30px 0', borderTop: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
        <div className="container flex justify-between align-center flex-wrap gap-md" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          <div>
            <strong>Emergency Connect</strong> — Built for Hackathon (Disaster Resilience Track).
          </div>
          <div>
            🇮🇳 Running localized centered in: <strong>{city}</strong>
          </div>
        </div>
      </footer>

      {/* --- MODAL: Add Resource / Staging --- */}
      {isAddResourceOpen && (
        <div className="modal-backdrop active">
          <div className="modal-container glass-card" style={{ padding: '0', background: 'var(--bg-card)' }}>
            <div className="modal-header flex justify-between align-center" style={{ padding: '20px', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ fontWeight: '700', fontSize: '18px' }}>Publish Item / Staging Offer</h3>
              <button className="btn-icon-only" onClick={() => setIsAddResourceOpen(false)} style={{ background: 'none', border: 'none' }}><i data-lucide="x"></i></button>
            </div>
            <form onSubmit={handleAddResourceSubmit}>
              <div className="modal-body" style={{ padding: '20px', maxH: '450px', overflowY: 'auto' }}>
                
                <div className="form-group">
                  <label className="form-label">Resource Staging Title</label>
                  <input type="text" name="title" className="form-input" required placeholder="e.g. 5 Oxygen Concentrators Staged" />
                </div>

                <div className="grid grid-2" style={{ gap: '15px' }}>
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <select name="type" className="form-input">
                      <option value="request">Request Aid</option>
                      <option value="offer">Staging Offer</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select name="category" className="form-input">
                      <option value="Food Packets">Food & Water</option>
                      <option value="Medical Equipment">Medical Supplies</option>
                      <option value="Medicines">Medicines</option>
                      <option value="Emergency Transport">Emergency Transport</option>
                      <option value="Temporary Shelter">Temporary Shelter</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-2" style={{ gap: '15px' }}>
                  <div className="form-group">
                    <label className="form-label">Quantity</label>
                    <input type="number" name="qty" className="form-input" min="1" defaultValue="1" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Urgency</label>
                    <select name="urgency" className="form-input">
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Local Address Sector / LandMark</label>
                  <input type="text" name="address" className="form-input" required placeholder={`e.g. MP Nagar, ${city.split(',')[0]}`} />
                </div>

                <div className="form-group">
                  <label className="form-label">Emergency Callback Contacts</label>
                  <input type="text" name="contact" className="form-input" required placeholder="e.g. +91 99887 76655 (NGO Team)" />
                </div>

                <div className="form-group">
                  <label className="form-label">Additional Instructions</label>
                  <textarea name="desc" className="form-input" style={{ height: '70px' }} placeholder="Include specific instructions for coordination..."></textarea>
                </div>

              </div>
              <div className="modal-footer flex justify-end gap-sm" style={{ padding: '20px', borderTop: '1px solid var(--border-color)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddResourceOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Publish to Directory</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: Register Volunteer Node --- */}
      {isAddVolunteerOpen && (
        <div className="modal-backdrop active">
          <div className="modal-container glass-card" style={{ padding: '0', background: 'var(--bg-card)' }}>
            <div className="modal-header flex justify-between align-center" style={{ padding: '20px', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ fontWeight: '700', fontSize: '18px' }}>Register Responder Node</h3>
              <button className="btn-icon-only" onClick={() => setIsAddVolunteerOpen(false)} style={{ background: 'none', border: 'none' }}><i data-lucide="x"></i></button>
            </div>
            <form onSubmit={handleAddVolunteerSubmit}>
              <div className="modal-body" style={{ padding: '20px' }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input type="text" name="name" className="form-input" required placeholder="e.g. Vikram Rawat" />
                </div>
                <div className="form-group">
                  <label className="form-label">Contact Phone</label>
                  <input type="text" name="phone" className="form-input" required placeholder="e.g. +91 99887 76655" />
                </div>
                <div className="form-group">
                  <label className="form-label">Service Coverage Sector</label>
                  <input type="text" name="area" className="form-input" required placeholder={`e.g. Kolar Road, ${city.split(',')[0]}`} />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ marginBottom: '10px', display: 'block' }}>Response Capabilities</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {['First Aid', 'Search & Rescue', 'Logistics', 'Water Evacuation', 'Medical Help'].map((skill, i) => (
                      <label key={i} className="flex align-center gap-xs" style={{ fontSize: '13px', cursor: 'pointer' }}>
                        <input type="checkbox" className="vol-skill-chk" value={skill} /> {skill}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="modal-footer flex justify-end gap-sm" style={{ padding: '20px', borderTop: '1px solid var(--border-color)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddVolunteerOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Publish Responder Node</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: Trigger SOS Distress Beacon --- */}
      {isSosOpen && (
        <div className="modal-backdrop active">
          <div className="modal-container glass-card" style={{ padding: '0', background: 'var(--bg-card)', borderColor: 'var(--color-danger)' }}>
            <div className="modal-header flex justify-between align-center" style={{ padding: '20px', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ color: 'var(--color-danger)', fontWeight: '800' }} className="flex align-center gap-xs">
                <i data-lucide="alert-octagon"></i> Broadcast SOS Distress Beacon
              </h3>
              <button className="btn-icon-only" onClick={() => setIsSosOpen(false)} style={{ background: 'none', border: 'none' }}><i data-lucide="x"></i></button>
            </div>
            <form onSubmit={handleSosConfirm}>
              <div className="modal-body" style={{ padding: '20px' }}>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '15px' }}>
                  This will broadcast a high-priority distress SOS signal across all local RF mesh nodes and draw an urgent coordinate marker on the live map.
                </p>
                <div className="form-group">
                  <label className="form-label">Nature of Emergency / Situation</label>
                  <textarea name="desc" className="form-input" style={{ height: '80px' }} required placeholder="e.g. Stranded on roof due to local flash flooding..."></textarea>
                </div>
                <div className="form-group">
                  <label className="form-label">Mobile Contact CallBack</label>
                  <input type="text" name="phone" className="form-input" required placeholder="e.g. +91 99887 76655" />
                </div>
              </div>
              <div className="modal-footer flex justify-end gap-sm" style={{ padding: '20px', borderTop: '1px solid var(--border-color)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsSosOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-danger">Transmit Distress SOS</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: Admin Auth Sign-In --- */}
      {isAuthOpen && (
        <div className="modal-backdrop active">
          <div className="modal-container glass-card" style={{ padding: '24px', maxWidth: '380px' }}>
            <div className="flex justify-between align-center" style={{ marginBottom: '15px' }}>
              <h3 style={{ fontWeight: '700' }}>Admin Auth Gate</h3>
              <button className="btn-icon-only" onClick={() => setIsAuthOpen(false)} style={{ background: 'none', border: 'none' }}><i data-lucide="x"></i></button>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '15px' }}>
              Authorizing opens command channels and log resets for regional dispatchers.
            </p>
            <button 
              className="btn btn-primary" 
              style={{ width: '100%' }}
              onClick={() => {
                setCurrentUser({ name: 'Central Dispatch Command', role: 'admin' });
                localStorage.setItem('currentUser', JSON.stringify({ name: 'Central Dispatch Command', role: 'admin' }));
                setIsAuthOpen(false);
                showToast('Authorized Successfully', 'Welcome back, Admin Coordinator.', 'success');
              }}
            >
              Authorize Node as Administrator
            </button>
          </div>
        </div>
      )}

      {/* --- DRAWER: Live Coordination Chat Portal --- */}
      {activeChat && (
        <div className="chat-drawer active">
          <div className="chat-header flex align-center justify-between">
            <div className="flex align-center gap-sm">
              <div className="user-avatar" style={{ background: 'var(--color-primary)', width: '38px', height: '38px', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontWeight: 'bold' }} className="flex align-center justify-center">
                {activeChat.avatar}
              </div>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '700' }}>{activeChat.name}</h4>
                <p style={{ fontSize: '11px', color: 'var(--color-success)' }}>{activeChat.status}</p>
              </div>
            </div>
            <button className="btn-icon-only" onClick={() => setActiveChat(null)} style={{ background: 'none', border: 'none' }}><i data-lucide="x"></i></button>
          </div>

          {/* Messages body */}
          <div className="chat-messages">
            {(chats[activeChat.recipientId] || []).map((msg, i) => (
              <div key={i} className={`chat-bubble ${msg.sender === 'sent' ? 'sent' : 'received'}`}>
                <div>{msg.text}</div>
                <div className="chat-bubble-time">{msg.time}</div>
              </div>
            ))}
          </div>

          {/* Quick Replies Tags */}
          <div className="chat-quick-replies">
            {[
              { emoji: '🚗', txt: 'On my way' },
              { emoji: '🚒', txt: 'Team dispatched' },
              { emoji: '📍', txt: 'Confirm coordinates' },
              { emoji: '📦', txt: 'Aid secured' }
            ].map((reply, i) => (
              <span 
                key={i} 
                className="chat-quick-tag"
                onClick={() => sendChatMessage(`${reply.emoji} ${reply.txt}`)}
              >
                {reply.emoji} {reply.txt}
              </span>
            ))}
          </div>

          {/* Custom Input */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              const inp = e.target.elements.message;
              if (inp.value.trim()) {
                sendChatMessage(inp.value);
                inp.value = '';
              }
            }}
            className="chat-input-area"
          >
            <input 
              type="text" 
              name="message" 
              className="form-input" 
              style={{ flex: 1 }} 
              placeholder="Type message on peer grid..." 
              autoComplete="off" 
            />
            <button type="submit" className="btn btn-primary"><i data-lucide="send"></i></button>
          </form>
        </div>
      )}

      {/* --- DRAWER: Mobile Navigation slide-out --- */}
      <div className={`mobile-nav-backdrop ${mobileNavOpen ? 'active' : ''}`} onClick={() => setMobileNavOpen(false)}></div>
      <div className={`mobile-nav-drawer ${mobileNavOpen ? 'active' : ''}`}>
        <div className="flex align-center justify-between" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '20px', marginBottom: '20px' }}>
          <div className="logo">
            <i data-lucide="shield-alert" className="logo-icon"></i>
            <div className="logo-text">Emergency<span>Connect</span></div>
          </div>
          <button className="btn-icon-only" onClick={() => setMobileNavOpen(false)} style={{ background: 'none', border: 'none' }}><i data-lucide="x"></i></button>
        </div>
        <ul className="mobile-links">
          {['Home', 'Dashboard', 'Resources', 'Blood Registry', 'Volunteers'].map((view) => {
            const h = `#${view.toLowerCase().replace(' ', '')}`;
            return (
              <li key={view}>
                <a 
                  href={h} 
                  className={currentView === h ? 'active' : ''}
                  onClick={() => { setCurrentView(h); setMobileNavOpen(false); }}
                >
                  {view}
                </a>
              </li>
            );
          })}
        </ul>
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginTop: 'auto' }} className="flex flex-column gap-sm">
          {currentUser ? (
            <div className="flex flex-column gap-xs" style={{ marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-main)', fontWeight: '600' }}>👤 {currentUser.name}</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>Role: Coordinator</span>
              <button 
                className="btn btn-secondary" 
                style={{ width: '100%', padding: '8px 12px', fontSize: '12px' }}
                onClick={() => { 
                  setCurrentUser(null); 
                  localStorage.removeItem('currentUser'); 
                  setMobileNavOpen(false);
                  showToast('Signed Out', 'Signed out from administrator session.', 'info'); 
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <button 
              className="btn btn-secondary" 
              style={{ width: '100%', marginBottom: '10px', padding: '10px 14px', fontSize: '13px' }}
              onClick={() => { setMobileNavOpen(false); setIsAuthOpen(true); }}
            >
              <i data-lucide="user"></i> Sign In
            </button>
          )}
          <button className="btn btn-sos" style={{ width: '100%' }} onClick={() => { setMobileNavOpen(false); setIsSosOpen(true); }}>
            <i data-lucide="alert-octagon"></i> SOS Emergency
          </button>
        </div>
      </div>

      {/* --- Toast Overlay Notifications container --- */}
      <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {toasts.map((toast) => (
          <div key={toast.id} className="glass-card" style={{ 
            padding: '12px 18px', 
            borderRadius: '8px', 
            minWidth: '240px', 
            maxWidth: '320px', 
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)', 
            borderLeft: `4px solid ${
              toast.type === 'success' ? 'var(--color-success)' : 
              toast.type === 'warning' ? 'var(--color-warning)' : 
              toast.type === 'danger' ? 'var(--color-danger)' : 'var(--color-primary)'
            }`,
            background: 'var(--bg-card)',
            animation: 'mesh-slide-down 0.2s ease-out'
          }}>
            <h5 style={{ fontWeight: '700', fontSize: '13px', marginBottom: '2px' }}>{toast.title}</h5>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{toast.message}</p>
          </div>
        ))}
      </div>

    </div>
  );
}

// Render the application to DOM
const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(<App />);
