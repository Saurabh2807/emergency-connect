/* ==========================================================================
   Emergency Connect - Main Application Script (Logic & State)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================================================
  // 1. State Management
  // ==========================================================================
  let state = {
    listings: [],
    donors: [],
    volunteers: [],
    activities: [],
    stats: {},
    currentUser: null,
    currentTheme: 'light',
    activeTab: 'home',
    systemLogs: []
  };

  // Maps instances
  let mainMap = null;
  let mapMarkers = [];

  // Helper to save state to LocalStorage
  function saveState() {
    localStorage.setItem('emergency_connect_state', JSON.stringify(state));
  }

  // Load state or load seed data if empty
  function initStore() {
    const localData = localStorage.getItem('emergency_connect_state');
    if (localData) {
      try {
        state = JSON.parse(localData);
      } catch (e) {
        console.error("Error parsing local state, resetting to seed data", e);
        state = JSON.parse(JSON.stringify(window.emergencySeedData));
      }
    } else {
      state = JSON.parse(JSON.stringify(window.emergencySeedData));
    }
    
    // Set default theme
    state.currentTheme = localStorage.getItem('emergency_connect_theme') || 'light';
    document.documentElement.setAttribute('data-theme', state.currentTheme);
    updateThemeToggleUI();

    // Check session
    const sessionUser = sessionStorage.getItem('emergency_connect_user');
    if (sessionUser) {
      state.currentUser = JSON.parse(sessionUser);
    }
  }

  // Log message to Admin panel log simulator
  function logSystemAction(message) {
    const time = new Date().toLocaleTimeString();
    const formattedLog = `[${time}] ${message}`;
    state.systemLogs.unshift(formattedLog);
    if (state.systemLogs.length > 30) state.systemLogs.pop();
    
    // Live update admin console log if active
    const logContainer = document.getElementById('admin-log-panel');
    if (logContainer) {
      logContainer.innerHTML = state.systemLogs.map(log => `<div>${log}</div>`).join('');
    }
  }

  // ==========================================================================
  // 2. Navigation & Router
  // ==========================================================================
  const views = ['home', 'dashboard', 'resources', 'blood', 'volunteers', 'admin'];

  function handleRoute() {
    const hash = window.location.hash.replace('#', '') || 'home';
    
    if (views.includes(hash)) {
      state.activeTab = hash;
      
      // Update Navigation active states
      document.querySelectorAll('.nav-links a').forEach(link => {
        if (link.getAttribute('href') === `#${hash}`) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });

      // Update Sidebar active states (for dashboard subnavigation)
      document.querySelectorAll('.sidebar-link').forEach(link => {
        if (link.getAttribute('data-target') === hash) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });

      // Swap views
      document.querySelectorAll('.page-view').forEach(view => {
        view.classList.remove('active');
        if (view.id === `${hash}-page`) {
          view.classList.add('active');
        }
      });

      // Render view-specific elements
      triggerViewRender(hash);
      
      // Scroll to top
      window.scrollTo(0, 0);
    }
  }

  function triggerViewRender(view) {
    // Shared Leaflet Map setup on Home and Dashboard
    if (view === 'home') {
      setTimeout(() => initLeafletMap('home-map', state.listings), 50);
      renderLandingPageData();
    } else if (view === 'dashboard') {
      renderDashboard();
    } else if (view === 'resources') {
      renderListings();
    } else if (view === 'blood') {
      renderBloodDonors();
    } else if (view === 'volunteers') {
      renderVolunteers();
    } else if (view === 'admin') {
      renderAdmin();
    }
  }

  window.addEventListener('hashchange', handleRoute);

  // ==========================================================================
  // 3. Leaflet Interactive Map Logic
  // ==========================================================================
  function initLeafletMap(elementId, itemsToShow) {
    const mapElement = document.getElementById(elementId);
    if (!mapElement) return;

    // Reset markers and existing instance
    if (mainMap) {
      mainMap.remove();
      mainMap = null;
    }
    mapMarkers = [];

    // Center SF
    mainMap = L.map(elementId, {
      center: [37.7749, -122.4194],
      zoom: 12.5,
      zoomControl: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mainMap);

    // Custom styled icons using SVG wrappers
    const createCustomIcon = (color, iconClass) => {
      let iconSvg = '';
      if (iconClass === 'alert') {
        iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
      } else if (iconClass === 'package') {
        iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><polygon points="12 22.08 12 12 3 6.93 3 17.07 12 22.08"/><polygon points="12 22.08 12 12 21 6.93 21 17.07 12 22.08"/><polygon points="12 12 3 6.93 12 1.86 21 6.93 12 12"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`;
      } else {
        iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
      }

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
            ${iconSvg}
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 38]
      });
    };

    // Render Request & Offer pins
    itemsToShow.forEach(item => {
      if (!item.location || !item.location.lat) return;
      
      const color = item.type === 'request' ? 'var(--color-danger)' : 'var(--color-success)';
      const iconType = item.type === 'request' ? 'alert' : 'package';
      
      const marker = L.marker([item.location.lat, item.location.lng], {
        icon: createCustomIcon(color, iconType)
      }).addTo(mainMap);

      const popupContent = `
        <div style="font-family: var(--font-body); padding: 5px; min-width: 180px;">
          <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; padding: 2px 6px; border-radius: 999px; margin-bottom: 6px; display: inline-block;
            background: ${item.type === 'request' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)'};
            color: ${item.type === 'request' ? 'var(--color-danger)' : 'var(--color-success)'};">
            ${item.type.toUpperCase()} • ${item.urgency.toUpperCase()}
          </span>
          <h4 style="font-size: 14px; margin-bottom: 6px; font-family: var(--font-display);">${item.title}</h4>
          <p style="font-size: 12px; color: #64748B; margin-bottom: 8px;">${item.description}</p>
          <div style="font-size: 11px; margin-bottom: 4px;"><strong>Location:</strong> ${item.location.address}</div>
          <div style="font-size: 11px; margin-bottom: 10px;"><strong>Contact:</strong> ${item.contact}</div>
          <button class="btn btn-primary coordinate-btn" data-id="${item.id}" style="font-size: 11px; padding: 6px 12px; width: 100%; text-transform: none; font-weight:600;">Coordinate Assistance</button>
        </div>
      `;

      marker.bindPopup(popupContent);
      mapMarkers.push(marker);
    });

    // Render Volunteers pins (blue markers)
    state.volunteers.forEach(vol => {
      if (!vol.lat) return;
      const marker = L.marker([vol.lat, vol.lng], {
        icon: createCustomIcon('var(--color-primary)', 'user')
      }).addTo(mainMap);

      const popupContent = `
        <div style="font-family: var(--font-body); padding: 5px; min-width: 180px;">
          <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; padding: 2px 6px; border-radius: 999px; background: rgba(37, 99, 235, 0.15); color: var(--color-primary); margin-bottom: 6px; display: inline-block;">
            VOLUNTEER (${vol.availability.toUpperCase()})
          </span>
          <h4 style="font-size: 14px; margin-bottom: 6px; font-family: var(--font-display);">${vol.name}</h4>
          <p style="font-size: 12px; color: #64748B; margin-bottom: 4px;"><strong>Skills:</strong> ${vol.skills.join(', ')}</p>
          <p style="font-size: 12px; color: #64748B; margin-bottom: 8px;"><strong>Coverage:</strong> ${vol.serviceArea}</p>
          <div style="font-size: 11px; margin-bottom: 10px;"><strong>Contact:</strong> ${vol.contact}</div>
          <button class="btn btn-success contact-vol-btn" data-id="${vol.id}" style="font-size: 11px; padding: 6px 12px; width: 100%;">Dispatch Volunteer</button>
        </div>
      `;
      marker.bindPopup(popupContent);
      mapMarkers.push(marker);
    });
  }

  // Handle Action Clicks Inside Map Popups
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('coordinate-btn')) {
      const listingId = e.target.getAttribute('data-id');
      const item = state.listings.find(x => x.id === listingId);
      if (item) {
        showToast("Coordination Initiated", `Contacted listing dispatcher for: ${item.title}. You have been registered to coordinate.`, "success");
        logSystemAction(`User initiated coordination for listing ID: ${listingId}`);
      }
    }
    if (e.target.classList.contains('contact-vol-btn')) {
      const volId = e.target.getAttribute('data-id');
      const vol = state.volunteers.find(x => x.id === volId);
      if (vol) {
        showToast("Volunteer Alerted", `Dispatched notification to ${vol.name} for current service area.`, "success");
        logSystemAction(`Volunteer ${vol.name} dispatched to current active incident.`);
      }
    }
  });

  // ==========================================================================
  // 4. View Rendering Systems
  // ==========================================================================

  // A. Landing Page Logic
  function renderLandingPageData() {
    // Render Statistics numbers
    document.getElementById('stat-active-req').innerText = state.stats.activeRequests || window.emergencySeedData.stats.activeRequests;
    document.getElementById('stat-res-avail').innerText = state.stats.resourcesAvailable || window.emergencySeedData.stats.resourcesAvailable;
    document.getElementById('stat-vols-online').innerText = state.stats.volunteersOnline || window.emergencySeedData.stats.volunteersOnline;
    document.getElementById('stat-lives-saved').innerText = state.stats.savedLives || window.emergencySeedData.stats.savedLives;

    // Render Nearby Resources list column
    const nearbyList = document.getElementById('nearby-list-container');
    if (nearbyList) {
      const activeListings = state.listings.filter(x => x.status === 'pending' || x.status === 'available').slice(0, 5);
      nearbyList.innerHTML = activeListings.map(item => `
        <div class="nearby-card" data-lat="${item.location.lat}" data-lng="${item.location.lng}">
          <div class="nearby-header flex align-center justify-between">
            <span class="badge ${item.type === 'request' ? 'badge-request' : 'badge-offer'}">${item.type.toUpperCase()}</span>
            <span class="badge badge-${item.urgency}">${item.urgency.toUpperCase()}</span>
          </div>
          <h4 class="nearby-title">${item.title}</h4>
          <div class="nearby-meta flex align-center">
            <span class="flex align-center gap-sm">
              <i data-lucide="map-pin" style="width: 12px; height: 12px;"></i>
              ${item.location.address.split(',')[0]}
            </span>
            <span>Qty: ${item.quantity}</span>
          </div>
        </div>
      `).join('');
      lucide.createIcons();

      // Nearby Card Navigation on Map Click
      nearbyList.querySelectorAll('.nearby-card').forEach(card => {
        card.addEventListener('click', () => {
          const lat = parseFloat(card.getAttribute('data-lat'));
          const lng = parseFloat(card.getAttribute('data-lng'));
          if (mainMap) {
            mainMap.setView([lat, lng], 15);
            // Highlight marker
            mapMarkers.forEach(m => {
              if (m.getLatLng().lat === lat && m.getLatLng().lng === lng) {
                m.openPopup();
              }
            });
          }
        });
      });
    }

    // Render Success Stories
    const storiesContainer = document.getElementById('success-stories-container');
    if (storiesContainer && state.successStories) {
      storiesContainer.innerHTML = state.successStories.map(story => `
        <div class="glass-card story-card">
          <div class="flex flex-column justify-between" style="height: 100%;">
            <div>
              <span class="section-badge badge-primary-soft" style="margin-bottom: 12px;">${story.category}</span>
              <h3 style="font-size: 20px; margin-bottom: 14px;">${story.title}</h3>
              <p class="story-text">"${story.story}"</p>
            </div>
            <div style="border-top: 1px solid var(--border-color); padding-top: 14px; margin-top: 14px;">
              <p class="story-author">${story.author}</p>
            </div>
          </div>
        </div>
      `).join('');
    }
  }

  // B. Emergency Dashboard
  function renderDashboard() {
    // Fill Dashboard stats
    document.getElementById('db-active-req').innerText = state.listings.filter(x => x.type === 'request' && x.status === 'pending').length;
    document.getElementById('db-avail-res').innerText = state.listings.filter(x => x.type === 'offer' && x.status === 'available').length;
    document.getElementById('db-total-vols').innerText = state.volunteers.length;

    // Render mini interactive map for quick monitoring
    setTimeout(() => initLeafletMap('db-mini-map', state.listings), 50);

    // Render Live Activity Logs
    const logFeed = document.getElementById('db-activity-feed');
    if (logFeed) {
      logFeed.innerHTML = state.activities.map(act => {
        let icon = 'alert-triangle';
        let colorClass = 'red';
        if (act.type === 'match_found') { icon = 'check-circle'; colorClass = 'green'; }
        if (act.type === 'volunteer_registered') { icon = 'user-check'; colorClass = 'blue'; }
        if (act.type === 'offer_created') { icon = 'package'; colorClass = 'green'; }
        
        const timeFormatted = new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        return `
          <div class="activity-item">
            <div class="activity-badge-circle" style="background: rgba(var(--color-${colorClass}-rgb), 0.15); color: var(--color-${colorClass});">
              <i data-lucide="${icon}" style="width: 18px; height: 18px;"></i>
            </div>
            <div class="toast-content">
              <p class="activity-title-text">${act.title}</p>
              <p class="activity-desc-text">${act.message}</p>
              <p class="activity-time">${timeFormatted}</p>
            </div>
          </div>
        `;
      }).join('');
      lucide.createIcons();
    }

    // Render dashboard requests summary
    const reqList = document.getElementById('db-active-requests-list');
    if (reqList) {
      const activeRequests = state.listings.filter(x => x.type === 'request' && x.status === 'pending').slice(0, 4);
      if (activeRequests.length === 0) {
        reqList.innerHTML = `<p style="padding: 20px; color: var(--text-muted); text-align: center;">No active requests right now.</p>`;
      } else {
        reqList.innerHTML = activeRequests.map(req => `
          <div class="donor-item flex align-center justify-between" style="padding: 12px 16px;">
            <div>
              <h4 style="font-size: 14px;">${req.title}</h4>
              <p style="font-size: 12px; color: var(--text-muted);">${req.location.address}</p>
            </div>
            <div class="flex align-center gap-md">
              <span class="badge badge-${req.urgency}">${req.urgency.toUpperCase()}</span>
              <button class="btn btn-secondary coordinate-btn" data-id="${req.id}" style="padding: 6px 12px; font-size: 12px;">Coordinate</button>
            </div>
          </div>
        `).join('');
      }
    }
  }

  // C. Resource Directory List view with filters
  function renderListings() {
    const searchVal = document.getElementById('search-resource-input').value.toLowerCase();
    const typeVal = document.getElementById('filter-type-select').value;
    const catVal = document.getElementById('filter-category-select').value;
    const urgencyVal = document.getElementById('filter-urgency-select').value;

    const filtered = state.listings.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchVal) || item.description.toLowerCase().includes(searchVal) || item.location.address.toLowerCase().includes(searchVal);
      const matchesType = typeVal === 'all' || item.type === typeVal;
      const matchesCat = catVal === 'all' || item.category === catVal;
      const matchesUrgency = urgencyVal === 'all' || item.urgency === urgencyVal;
      return matchesSearch && matchesType && matchesCat && matchesUrgency;
    });

    const listingsGrid = document.getElementById('listings-grid-container');
    if (!listingsGrid) return;

    if (filtered.length === 0) {
      listingsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-muted);">
          <i data-lucide="inbox" style="width: 48px; height: 48px; margin-bottom: 16px;"></i>
          <h3>No matching resources found</h3>
          <p>Try modifying your filters or search criteria.</p>
        </div>
      `;
      lucide.createIcons();
      return;
    }

    listingsGrid.innerHTML = filtered.map(item => {
      const isOwner = state.currentUser && (state.currentUser.id === item.userId || state.currentUser.role === 'admin');
      let footerActionBtn = `<button class="btn btn-primary coordinate-btn" data-id="${item.id}" style="font-size: 13px; flex: 1;">Coordinate Help</button>`;
      
      if (isOwner) {
        footerActionBtn = `
          <button class="btn btn-success mark-complete-btn" data-id="${item.id}" style="font-size: 13px; flex: 1;">Mark Fulfilled</button>
          <button class="btn btn-outline delete-listing-btn" data-id="${item.id}" style="padding: 10px; width: 42px;"><i data-lucide="trash-2" style="width: 16px; height: 16px; color: var(--color-danger);"></i></button>
        `;
      }

      return `
        <div class="glass-card listing-card" style="padding: 24px;">
          <div class="flex align-center justify-between" style="margin-bottom: 12px;">
            <span class="badge ${item.type === 'request' ? 'badge-request' : 'badge-offer'}">${item.type.toUpperCase()}</span>
            <span class="badge badge-${item.urgency}">${item.urgency.toUpperCase()}</span>
          </div>
          <div>
            <span style="font-size: 11px; color: var(--text-muted); font-weight:700;">${item.category}</span>
            <h3 class="listing-title" style="margin-top: 4px;">${item.title}</h3>
            <p class="listing-desc">${item.description}</p>
          </div>
          
          <div class="listing-body">
            <div class="listing-meta-item">
              <i data-lucide="map-pin" style="width: 14px; height: 14px;"></i>
              <span title="${item.location.address}">${item.location.address}</span>
            </div>
            <div class="listing-meta-item">
              <i data-lucide="phone" style="width: 14px; height: 14px;"></i>
              <span>${item.contact}</span>
            </div>
            <div class="listing-meta-item">
              <i data-lucide="package" style="width: 14px; height: 14px;"></i>
              <span>Quantity: ${item.quantity} (${item.status})</span>
            </div>
          </div>

          <div class="listing-footer flex gap-sm align-center">
            ${footerActionBtn}
          </div>
        </div>
      `;
    }).join('');
    lucide.createIcons();
    attachListingActionListeners();
  }

  function attachListingActionListeners() {
    document.querySelectorAll('.mark-complete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const listing = state.listings.find(x => x.id === id);
        if (listing) {
          listing.status = 'fulfilled';
          // Move from active requests to analytics stats
          state.stats.savedLives = (state.stats.savedLives || 1204) + 1;
          saveState();
          showToast("Listing Fulfilled", `Resource request for '${listing.title}' has been successfully completed!`, "success");
          logSystemAction(`Listing fulfilled: ${listing.title} (ID: ${id})`);
          renderListings();
        }
      });
    });

    document.querySelectorAll('.delete-listing-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const index = state.listings.findIndex(x => x.id === id);
        if (index > -1) {
          const title = state.listings[index].title;
          state.listings.splice(index, 1);
          saveState();
          showToast("Listing Deleted", `Removed listing '${title}' from system databases.`, "info");
          logSystemAction(`Listing deleted: ${title} (ID: ${id})`);
          renderListings();
        }
      });
    });
  }

  // D. Blood Donation Module
  let selectedBloodGroup = 'O-';
  function renderBloodDonors() {
    const listContainer = document.getElementById('blood-donors-list');
    if (!listContainer) return;

    // Filter donors matching selected group
    const filteredDonors = state.donors.filter(donor => donor.bloodGroup === selectedBloodGroup);

    // Update active visual tags
    document.querySelectorAll('.blood-group-selector').forEach(sel => {
      if (sel.getAttribute('data-group') === selectedBloodGroup) {
        sel.classList.add('active');
      } else {
        sel.classList.remove('active');
      }
    });

    if (filteredDonors.length === 0) {
      listContainer.innerHTML = `
        <div style="text-align: center; padding: 40px; color: var(--text-muted);">
          <p>No available donors listed for ${selectedBloodGroup} at this time.</p>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = filteredDonors.map(donor => `
      <div class="donor-item flex align-center justify-between">
        <div class="flex align-center gap-md">
          <div class="donor-initials">${donor.name.split(' ').map(n=>n[0]).join('')}</div>
          <div>
            <h4 style="font-size: 15px; margin-bottom: 2px;">${donor.name}</h4>
            <p style="font-size: 12px; color: var(--text-muted);">
              <i data-lucide="map-pin" style="width: 12px; height: 12px; display:inline-block; margin-right: 4px;"></i>
              ${donor.location}
            </p>
          </div>
        </div>
        <div class="flex align-center gap-md">
          <span class="badge ${donor.available ? 'badge-success-soft' : 'badge-danger-soft'}">
            ${donor.available ? 'Available Now' : 'Busy'}
          </span>
          <a href="tel:${donor.phone}" class="btn btn-primary" style="padding: 6px 12px; font-size: 12px;">
            <i data-lucide="phone" style="width: 14px; height: 14px;"></i> Call Donor
          </a>
        </div>
      </div>
    `).join('');
    lucide.createIcons();
  }

  // Setup click listeners for blood group selectors
  document.querySelectorAll('.blood-group-selector').forEach(sel => {
    sel.addEventListener('click', () => {
      selectedBloodGroup = sel.getAttribute('data-group');
      renderBloodDonors();
    });
  });

  // E. Volunteer Network View
  function renderVolunteers() {
    const volGrid = document.getElementById('volunteers-grid');
    const searchVal = document.getElementById('search-vol-input').value.toLowerCase();
    
    if (!volGrid) return;

    const filtered = state.volunteers.filter(vol => {
      const matchSearch = vol.name.toLowerCase().includes(searchVal) || 
                          vol.skills.some(s => s.toLowerCase().includes(searchVal)) || 
                          vol.serviceArea.toLowerCase().includes(searchVal);
      return matchSearch;
    });

    if (filtered.length === 0) {
      volGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
          <p>No volunteers found matching your query.</p>
        </div>
      `;
      return;
    }

    volGrid.innerHTML = filtered.map(vol => `
      <div class="glass-card" style="padding: 24px;">
        <div class="flex align-center justify-between" style="margin-bottom: 16px;">
          <div class="flex align-center gap-md">
            <div class="donor-initials" style="background: rgba(37,99,235,0.1); color: var(--color-primary);">
              ${vol.name.split(' ').map(n=>n[0]).join('')}
            </div>
            <div>
              <h4 style="font-size: 16px;">${vol.name}</h4>
              <p style="font-size: 12px; color: var(--text-muted);">${vol.serviceArea}</p>
            </div>
          </div>
          <span class="badge ${vol.availability === 'available' ? 'badge-success-soft' : 'badge-danger-soft'}">
            ${vol.availability}
          </span>
        </div>
        
        <div style="margin-bottom: 16px;">
          <h5 style="font-size: 12px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 6px;">Skills</h5>
          <div class="flex" style="flex-wrap: wrap; gap: 6px;">
            ${vol.skills.map(skill => `<span style="font-size: 11px; background: var(--bg-card-hover); padding: 4px 8px; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">${skill}</span>`).join('')}
          </div>
        </div>

        <div class="flex gap-sm" style="border-top: 1px solid var(--border-color); padding-top: 16px;">
          <a href="tel:${vol.contact}" class="btn btn-primary" style="flex: 1; font-size: 13px;">
            <i data-lucide="phone" style="width: 14px; height: 14px;"></i> Call
          </a>
          <button class="btn btn-outline contact-vol-btn" data-id="${vol.id}" style="flex: 1; font-size: 13px;">Dispatch</button>
        </div>
      </div>
    `).join('');
    lucide.createIcons();
  }

  // Attach volunteer search listeners
  const volSearchInput = document.getElementById('search-vol-input');
  if (volSearchInput) {
    volSearchInput.addEventListener('input', renderVolunteers);
  }

  // F. Admin Dashboard View
  function renderAdmin() {
    // Total numbers
    document.getElementById('adm-total-users').innerText = "142";
    document.getElementById('adm-active-listings').innerText = state.listings.length;
    document.getElementById('adm-active-vols').innerText = state.volunteers.length;
    document.getElementById('adm-flagged-items').innerText = "0";

    // Fill Console Logs
    const logContainer = document.getElementById('admin-log-panel');
    if (logContainer) {
      logContainer.innerHTML = state.systemLogs.map(log => `<div>${log}</div>`).join('');
    }

    // Fill Listings Table
    const listingsTable = document.getElementById('adm-listings-tbody');
    if (listingsTable) {
      listingsTable.innerHTML = state.listings.map(item => `
        <tr>
          <td style="font-weight: 700;">${item.title}</td>
          <td><span class="badge ${item.type === 'request' ? 'badge-request' : 'badge-offer'}">${item.type}</span></td>
          <td>${item.category}</td>
          <td><span class="badge badge-${item.urgency}">${item.urgency}</span></td>
          <td>
            <button class="btn btn-secondary adm-delete-listing" data-id="${item.id}" style="padding: 6px 12px; font-size: 12px;">Delete</button>
          </td>
        </tr>
      `).join('');

      document.querySelectorAll('.adm-delete-listing').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          const index = state.listings.findIndex(x => x.id === id);
          if (index > -1) {
            const title = state.listings[index].title;
            state.listings.splice(index, 1);
            saveState();
            showToast("Admin Action", `Removed listing '${title}' from index databases.`, "warning");
            logSystemAction(`Admin deleted listing: ${title}`);
            renderAdmin();
          }
        });
      });
    }
  }

  // Search input listeners for Resources page
  const searchResInput = document.getElementById('search-resource-input');
  if (searchResInput) {
    searchResInput.addEventListener('input', renderListings);
  }
  const filterTypeSelect = document.getElementById('filter-type-select');
  if (filterTypeSelect) {
    filterTypeSelect.addEventListener('change', renderListings);
  }
  const filterCatSelect = document.getElementById('filter-category-select');
  if (filterCatSelect) {
    filterCatSelect.addEventListener('change', renderListings);
  }
  const filterUrgencySelect = document.getElementById('filter-urgency-select');
  if (filterUrgencySelect) {
    filterUrgencySelect.addEventListener('change', renderListings);
  }

  // ==========================================================================
  // 5. Authentication Simulators
  // ==========================================================================
  const authModal = document.getElementById('auth-modal');
  const userBtn = document.getElementById('user-menu-btn');
  const closeAuthBtn = document.getElementById('close-auth-modal');
  
  function updateAuthHeader() {
    const userContainer = document.getElementById('nav-user-container');
    const guestContainer = document.getElementById('nav-guest-container');
    const adminLink = document.getElementById('admin-nav-link');
    
    if (state.currentUser) {
      guestContainer.style.display = 'none';
      userContainer.style.display = 'flex';
      
      const initials = state.currentUser.name.split(' ').map(n=>n[0]).join('');
      document.getElementById('user-initials-avatar').innerText = initials;
      document.getElementById('user-name-display').innerText = state.currentUser.name;

      if (state.currentUser.role === 'admin') {
        adminLink.style.display = 'inline-block';
      } else {
        adminLink.style.display = 'none';
      }
    } else {
      guestContainer.style.display = 'flex';
      userContainer.style.display = 'none';
      adminLink.style.display = 'none';
    }
  }

  // Open login
  if (userBtn) {
    userBtn.addEventListener('click', () => {
      authModal.classList.add('active');
    });
  }
  if (closeAuthBtn) {
    closeAuthBtn.addEventListener('click', () => {
      authModal.classList.remove('active');
    });
  }

  // Switch Auth Tab
  const signupForm = document.getElementById('auth-signup-form');
  const loginForm = document.getElementById('auth-login-form');
  const tabLogin = document.getElementById('auth-tab-login');
  const tabSignup = document.getElementById('auth-tab-signup');

  if (tabLogin && tabSignup) {
    tabLogin.addEventListener('click', () => {
      tabLogin.style.borderBottom = '2px solid var(--color-primary)';
      tabSignup.style.borderBottom = '2px solid transparent';
      loginForm.style.display = 'block';
      signupForm.style.display = 'none';
    });
    tabSignup.addEventListener('click', () => {
      tabSignup.style.borderBottom = '2px solid var(--color-primary)';
      tabLogin.style.borderBottom = '2px solid transparent';
      loginForm.style.display = 'none';
      signupForm.style.display = 'block';
    });
  }

  // Login execution
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      let name = email.split('@')[0];
      name = name.charAt(0).toUpperCase() + name.slice(1);
      
      const role = email.includes('admin') ? 'admin' : 'user';

      state.currentUser = {
        name: name,
        email: email,
        id: "usr-" + Date.now(),
        role: role
      };

      sessionStorage.setItem('emergency_connect_user', JSON.stringify(state.currentUser));
      authModal.classList.remove('active');
      updateAuthHeader();
      showToast("Signed In Successfully", `Welcome back, ${state.currentUser.name}!`, "success");
      logSystemAction(`User signed in: ${state.currentUser.email} (Role: ${state.currentUser.role})`);
      
      if (role === 'admin') {
        window.location.hash = '#admin';
      } else {
        window.location.hash = '#dashboard';
      }
    });
  }

  // Signup execution
  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('signup-name').value;
      const email = document.getElementById('signup-email').value;

      state.currentUser = {
        name: name,
        email: email,
        id: "usr-" + Date.now(),
        role: 'user'
      };

      sessionStorage.setItem('emergency_connect_user', JSON.stringify(state.currentUser));
      authModal.classList.remove('active');
      updateAuthHeader();
      showToast("Account Created", `Welcome, ${state.currentUser.name}!`, "success");
      logSystemAction(`New user signed up: ${state.currentUser.email}`);
      window.location.hash = '#dashboard';
    });
  }

  // Google Login simulator
  const googleBtn = document.getElementById('google-auth-btn');
  if (googleBtn) {
    googleBtn.addEventListener('click', () => {
      googleBtn.innerHTML = `<i data-lucide="loader" style="animation: spin 1s infinite linear;"></i> Connecting Google...`;
      lucide.createIcons();

      setTimeout(() => {
        state.currentUser = {
          name: "Saurabh Dev",
          email: "saurabh@hackathon.org",
          id: "usr-google-1",
          role: "admin" // Automatically register user as Admin to explore the complete experience!
        };
        sessionStorage.setItem('emergency_connect_user', JSON.stringify(state.currentUser));
        authModal.classList.remove('active');
        googleBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chrome"><circle cx="12" cy="12" r="10"/><path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 1.9c-3.5-.49-11.05 1-11.6 8.56"/></svg> Continue with Google`;
        updateAuthHeader();
        showToast("Google Authentication", "Successfully authorized via Google. Administrator role assigned.", "success");
        logSystemAction("Google Auth completed successfully.");
        window.location.hash = '#admin';
      }, 1200);
    });
  }

  // Log out action
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      logSystemAction(`User logged out: ${state.currentUser.email}`);
      state.currentUser = null;
      sessionStorage.removeItem('emergency_connect_user');
      updateAuthHeader();
      showToast("Signed Out", "You have been logged out of the session.", "info");
      window.location.hash = '#home';
    });
  }

  // ==========================================================================
  // 6. SOS Button Logic
  // ==========================================================================
  const sosTriggerModal = document.getElementById('sos-modal');
  const sosCloseBtn = document.getElementById('close-sos-modal');
  const triggerSosConfirm = document.getElementById('trigger-sos-confirm');

  // Nav/Landing SOS click opens confirmation
  document.querySelectorAll('.trigger-sos-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      sosTriggerModal.classList.add('active');
    });
  });

  if (sosCloseBtn) {
    sosCloseBtn.addEventListener('click', () => {
      sosTriggerModal.classList.remove('remove');
      sosTriggerModal.classList.remove('active');
    });
  }

  // Confirm SOS triggering
  if (triggerSosConfirm) {
    triggerSosConfirm.addEventListener('click', () => {
      const sosDescription = document.getElementById('sos-incident-desc').value || "SOS Alert: Immediate assistance required.";
      const sosContact = document.getElementById('sos-contact-phone').value || "+1 (555) 911-HELP";
      
      // Select mock coordinates in SF centered around the user location to put on the map
      const sfCenters = [
        { address: "Golden Gate Park, San Francisco", lat: 37.7694, lng: -122.4862 },
        { address: "Fisherman's Wharf, San Francisco", lat: 37.8080, lng: -122.4177 },
        { address: "Union Square, San Francisco", lat: 37.7879, lng: -122.4074 },
        { address: "Civic Center, San Francisco", lat: 37.7793, lng: -122.4192 }
      ];
      const selectedLoc = sfCenters[Math.floor(Math.random() * sfCenters.length)];

      const newSos = {
        id: "sos-" + Date.now(),
        title: "SOS: EMERGENCY ALERT DISPATCHED",
        category: "Volunteers",
        type: "request",
        description: sosDescription,
        location: {
          address: selectedLoc.address,
          lat: selectedLoc.lat,
          lng: selectedLoc.lng
        },
        contact: sosContact,
        urgency: "critical",
        quantity: 1,
        status: "pending",
        timestamp: new Date().toISOString(),
        userId: state.currentUser ? state.currentUser.id : "guest-sos"
      };

      // Push to front of listings
      state.listings.unshift(newSos);
      
      // Update stats
      state.stats.activeRequests = (state.stats.activeRequests || 43) + 1;

      // Add to activities
      state.activities.unshift({
        id: "act-sos-" + Date.now(),
        type: "sos_alert",
        title: "CRITICAL SOS ALERT",
        message: `${sosDescription} Near ${selectedLoc.address}`,
        timestamp: new Date().toISOString()
      });

      saveState();
      
      sosTriggerModal.classList.remove('active');
      showToast("SOS Beacon Active", "Emergency requests have been pushed to all volunteer nodes.", "danger");
      logSystemAction(`CRITICAL SOS Alert created in system: ${selectedLoc.address}`);

      // Route to dashboard to see it
      window.location.hash = '#dashboard';
    });
  }

  // ==========================================================================
  // 7. Create Resources Request/Offer Logic
  // ==========================================================================
  const addResourceModal = document.getElementById('add-resource-modal');
  const closeResourceBtn = document.getElementById('close-resource-modal');
  const resourceForm = document.getElementById('create-resource-form');

  document.querySelectorAll('.open-add-resource-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      // Set type based on action button
      const type = btn.getAttribute('data-type') || 'request';
      document.getElementById('res-type-select').value = type;
      addResourceModal.classList.add('active');
    });
  });

  if (closeResourceBtn) {
    closeResourceBtn.addEventListener('click', () => {
      addResourceModal.classList.remove('active');
    });
  }

  if (resourceForm) {
    resourceForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const title = document.getElementById('res-title').value;
      const type = document.getElementById('res-type-select').value;
      const category = document.getElementById('res-category').value;
      const urgency = document.getElementById('res-urgency').value;
      const quantity = parseInt(document.getElementById('res-qty').value);
      const address = document.getElementById('res-address').value;
      const contact = document.getElementById('res-contact').value;
      const description = document.getElementById('res-desc').value;

      // Generate random lat/lng around SF to show on map
      const lat = 37.73 + Math.random() * 0.07;
      const lng = -122.49 + Math.random() * 0.08;

      const newListing = {
        id: "list-" + Date.now(),
        title: title,
        category: category,
        type: type,
        description: description,
        location: { address, lat, lng },
        contact: contact,
        urgency: urgency,
        quantity: quantity,
        status: type === 'request' ? 'pending' : 'available',
        timestamp: new Date().toISOString(),
        userId: state.currentUser ? state.currentUser.id : "guest-user"
      };

      state.listings.unshift(newListing);
      
      // Update statistics
      if (type === 'request') {
        state.stats.activeRequests = (state.stats.activeRequests || 43) + 1;
      } else {
        state.stats.resourcesAvailable = (state.stats.resourcesAvailable || 128) + 1;
      }

      // Record Activity
      state.activities.unshift({
        id: "act-res-" + Date.now(),
        type: type === 'request' ? 'request_created' : 'offer_created',
        title: type === 'request' ? 'Request Published' : 'Resource Offered',
        message: `${title} (${category}) listed in ${address.split(',')[0]}`,
        timestamp: new Date().toISOString()
      });

      saveState();
      addResourceModal.classList.remove('active');
      resourceForm.reset();
      
      showToast("Listing Published", `Your ${type} has been uploaded to the Live Directory.`, "success");
      logSystemAction(`New Listing uploaded: [${type.toUpperCase()}] ${title}`);

      // Refresh pages
      triggerViewRender(state.activeTab);
    });
  }

  // ==========================================================================
  // 8. Register Volunteer Logic
  // ==========================================================================
  const volModal = document.getElementById('volunteer-modal');
  const closeVolBtn = document.getElementById('close-volunteer-modal');
  const volForm = document.getElementById('register-volunteer-form');

  document.querySelectorAll('.open-volunteer-modal-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      volModal.classList.add('active');
    });
  });

  if (closeVolBtn) {
    closeVolBtn.addEventListener('click', () => {
      volModal.classList.remove('active');
    });
  }

  if (volForm) {
    volForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('vol-name').value;
      const contact = document.getElementById('vol-phone').value;
      const serviceArea = document.getElementById('vol-area').value;
      
      // Skills parsing
      const skillsChecked = [];
      document.querySelectorAll('.vol-skill-chk:checked').forEach(chk => {
        skillsChecked.push(chk.value);
      });

      if (skillsChecked.length === 0) {
        showToast("Registration Error", "Please select at least one skill to register.", "warning");
        return;
      }

      // Random position in SF
      const lat = 37.74 + Math.random() * 0.05;
      const lng = -122.48 + Math.random() * 0.06;

      const newVol = {
        id: "vol-" + Date.now(),
        name: name,
        skills: skillsChecked,
        availability: 'available',
        serviceArea: serviceArea,
        contact: contact,
        lat: lat,
        lng: lng
      };

      state.volunteers.unshift(newVol);
      state.stats.volunteersOnline = (state.stats.volunteersOnline || 87) + 1;

      state.activities.unshift({
        id: "act-vol-" + Date.now(),
        type: "volunteer_registered",
        title: "Volunteer Node Online",
        message: `${name} has registered to support ${serviceArea}`,
        timestamp: new Date().toISOString()
      });

      saveState();
      volModal.classList.remove('active');
      volForm.reset();

      showToast("Registration Completed", "You are now active on the Emergency Connect volunteer mesh network.", "success");
      logSystemAction(`Volunteer Registered: ${name} (Skills: ${skillsChecked.join(', ')})`);

      // Refresh views
      triggerViewRender(state.activeTab);
    });
  }

  // ==========================================================================
  // 9. Toast Notification System
  // ==========================================================================
  const toastContainer = document.getElementById('toast-wrapper');
  
  function showToast(title, message, type = 'primary') {
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'bell';
    if (type === 'danger') icon = 'alert-octagon';
    if (type === 'success') icon = 'check-circle';
    if (type === 'warning') icon = 'alert-triangle';

    toast.innerHTML = `
      <div class="toast-icon">
        <i data-lucide="${icon}" style="width: 16px; height: 16px;"></i>
      </div>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
      </div>
    `;

    toastContainer.appendChild(toast);
    lucide.createIcons();

    // Trigger sliding animation
    setTimeout(() => toast.classList.add('active'), 50);

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      toast.classList.remove('active');
      setTimeout(() => toast.remove(), 400);
    }, 4000);
  }

  // Expose toast function to global window so it can be called elsewhere
  window.triggerToast = showToast;

  // ==========================================================================
  // 10. Dynamic Real-Time Simulation Engine (Hackathon Wow Factor)
  // ==========================================================================
  const simulationEvents = [
    {
      title: "Automated Resource Match",
      message: "Emergency Transport listed by Marcus Vance matches 'Need Temporary Shelter' request in Sunset.",
      type: "success"
    },
    {
      title: "New Medicine Offer",
      message: "NGO 'Health Shield' uploaded 10 boxes of first-aid supplies in Richmond.",
      type: "success"
    },
    {
      title: "Blood Donor Update",
      message: "Priya Patel (A+) confirmed availability for emergency dispatch.",
      type: "primary"
    },
    {
      title: "Volunteer Grid Active",
      message: "Volunteer node Carlos Ortega is coordinating food relief kits.",
      type: "primary"
    },
    {
      title: "Urgent: Water Crisis Request",
      message: "FEMA reports shelter sector 3 requires immediate drinking water delivery.",
      type: "warning"
    }
  ];

  function runSimulator() {
    // Fire dynamic events every 45-60 seconds to simulate a live, heavily populated network
    setInterval(() => {
      // Pick random simulated event
      const eventIndex = Math.floor(Math.random() * simulationEvents.length);
      const ev = simulationEvents[eventIndex];
      
      // Update activity logs
      state.activities.unshift({
        id: "act-sim-" + Date.now(),
        type: "match_found",
        title: ev.title,
        message: ev.message,
        timestamp: new Date().toISOString()
      });

      // Save to localStorage
      saveState();

      // Dispatch real-time toast notification
      showToast(ev.title, ev.message, ev.type);
      logSystemAction(`Simulation dispatcher fired: ${ev.title} - ${ev.message}`);

      // Refresh active view to reflect data updates
      if (state.activeTab === 'dashboard') {
        renderDashboard();
      }
    }, 45000); // 45 seconds
  }

  // ==========================================================================
  // 11. Theme Management (Light/Dark Mode)
  // ==========================================================================
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  
  function updateThemeToggleUI() {
    if (!themeToggleBtn) return;
    const isDark = state.currentTheme === 'dark';
    themeToggleBtn.innerHTML = isDark ? 
      `<i data-lucide="sun" style="width: 20px; height: 20px;"></i>` : 
      `<i data-lucide="moon" style="width: 20px; height: 20px;"></i>`;
    lucide.createIcons();
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      state.currentTheme = state.currentTheme === 'light' ? 'dark' : 'light';
      localStorage.setItem('emergency_connect_theme', state.currentTheme);
      document.documentElement.setAttribute('data-theme', state.currentTheme);
      updateThemeToggleUI();
      logSystemAction(`Theme swapped to: ${state.currentTheme}`);
    });
  }

  // ==========================================================================
  // 12. App Bootstrapping
  // ==========================================================================
  initStore();
  updateAuthHeader();
  handleRoute();
  runSimulator();
  logSystemAction("Emergency Connect Network online. Verification checks passed.");
});
