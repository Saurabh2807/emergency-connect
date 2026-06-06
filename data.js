// Emergency Connect - Realistic Seed Data
const initialData = {
  listings: [
    {
      id: "list-1",
      title: "Urgent Need for Oxygen Cylinder",
      category: "Medical Equipment",
      type: "request",
      description: "Critical emergency for an elderly patient with respiratory distress. Requires 10L oxygen concentrator or cylinder immediately.",
      location: {
        address: "1450 Post St, San Francisco, CA",
        lat: 37.7858,
        lng: -122.4278
      },
      contact: "+1 (555) 019-2834 (John Doe)",
      urgency: "critical",
      quantity: 1,
      status: "pending",
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 mins ago
      userId: "user-2"
    },
    {
      id: "list-2",
      title: "Available: 50 Food Packets & Clean Water",
      category: "Food Packets",
      type: "offer",
      description: "Freshly prepared vegetarian food packets and bottled water cases ready for distribution. Can deliver if nearby.",
      location: {
        address: "Mission District, San Francisco, CA",
        lat: 37.7599,
        lng: -122.4148
      },
      contact: "+1 (555) 012-3984 (Hope Kitchen NGO)",
      urgency: "medium",
      quantity: 50,
      status: "available",
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      userId: "user-3"
    },
    {
      id: "list-3",
      title: "Emergency Transport - 4x4 SUV Available",
      category: "Emergency Transport",
      type: "offer",
      description: "All-wheel drive SUV with first-aid kit, available to transport people or supplies through flooded or rough terrain.",
      location: {
        address: "Presidio, San Francisco, CA",
        lat: 37.7988,
        lng: -122.4662
      },
      contact: "+1 (555) 017-4839 (Marcus Vance)",
      urgency: "high",
      quantity: 1,
      status: "available",
      timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      userId: "user-4"
    },
    {
      id: "list-4",
      title: "Need Temporary Shelter for Family of 4",
      category: "Temporary Shelter",
      type: "request",
      description: "Displaced due to local fire damage. Looking for accommodation for 2-3 nights. Family includes two kids.",
      location: {
        address: "Sunset District, San Francisco, CA",
        lat: 37.7479,
        lng: -122.4868
      },
      contact: "+1 (555) 014-9988 (Sarah Jenkins)",
      urgency: "high",
      quantity: 1,
      status: "pending",
      timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      userId: "user-5"
    },
    {
      id: "list-5",
      title: "Donation: Essential Pediatric Medicines",
      category: "Medicines",
      type: "offer",
      description: "Unopened packages of basic pediatric syrup, paracetamol, and rehydration salts. Expiry in 2027.",
      location: {
        address: "Castro, San Francisco, CA",
        lat: 37.7608,
        lng: -122.4358
      },
      contact: "+1 (555) 018-1293 (Dr. Clara Webb)",
      urgency: "medium",
      quantity: 15,
      status: "available",
      timestamp: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
      userId: "user-6"
    },
    {
      id: "list-6",
      title: "Required: CPR Trained Volunteers",
      category: "Volunteers",
      type: "request",
      description: "Need 3 CPR-certified volunteers to assist at the community sports center temporary shelter hub.",
      location: {
        address: "SoMa, San Francisco, CA",
        lat: 37.7785,
        lng: -122.4056
      },
      contact: "+1 (555) 011-2233 (Red Cross local coordinator)",
      urgency: "high",
      quantity: 3,
      status: "pending",
      timestamp: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
      userId: "user-7"
    },
    {
      id: "list-7",
      title: "Available: Wheelchairs and Crutches",
      category: "Medical Equipment",
      type: "offer",
      description: "Two adjustable wheelchairs and three pairs of adult crutches in clean, working condition. Pickup required.",
      location: {
        address: "Richmond District, San Francisco, CA",
        lat: 37.7786,
        lng: -122.4798
      },
      contact: "+1 (555) 019-4820 (Robert Miller)",
      urgency: "low",
      quantity: 5,
      status: "available",
      timestamp: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
      userId: "user-8"
    }
  ],

  donors: [
    {
      id: "donor-1",
      name: "Alex Rivera",
      bloodGroup: "O-",
      phone: "+1 (555) 015-3849",
      location: "Pac Heights, San Francisco",
      lat: 37.7915,
      lng: -122.4351,
      available: true,
      lastDonated: "2026-03-10"
    },
    {
      id: "donor-2",
      name: "Priya Patel",
      bloodGroup: "A+",
      phone: "+1 (555) 013-8822",
      location: "Bernal Heights, San Francisco",
      lat: 37.7397,
      lng: -122.4167,
      available: true,
      lastDonated: "2026-04-18"
    },
    {
      id: "donor-3",
      name: "Marcus Cole",
      bloodGroup: "B+",
      phone: "+1 (555) 016-7744",
      location: "Marina District, San Francisco",
      lat: 37.8037,
      lng: -122.4368,
      available: true,
      lastDonated: "2026-05-01"
    },
    {
      id: "donor-4",
      name: "Jessica Taylor",
      bloodGroup: "O+",
      phone: "+1 (555) 012-9900",
      location: "Noe Valley, San Francisco",
      lat: 37.7516,
      lng: -122.4301,
      available: false,
      lastDonated: "2026-05-28"
    },
    {
      id: "donor-5",
      name: "David Kim",
      bloodGroup: "AB-",
      phone: "+1 (555) 011-4488",
      location: "Chinatown, San Francisco",
      lat: 37.7941,
      lng: -122.4078,
      available: true,
      lastDonated: "2026-02-15"
    },
    {
      id: "donor-6",
      name: "Elena Rostova",
      bloodGroup: "O-",
      phone: "+1 (555) 014-2200",
      location: "Haight-Ashbury, San Francisco",
      lat: 37.7699,
      lng: -122.4468,
      available: true,
      lastDonated: "2026-04-05"
    }
  ],

  volunteers: [
    {
      id: "vol-1",
      name: "Samuel Green",
      skills: ["First Aid", "Search & Rescue", "Logistics"],
      availability: "available",
      serviceArea: "Richmond & Sunset Districts",
      contact: "+1 (555) 012-8877",
      lat: 37.7725,
      lng: -122.4820
    },
    {
      id: "vol-2",
      name: "Aisha Rahman",
      skills: ["Medical (RN)", "Crisis Counseling", "Translation (Arabic)"],
      availability: "available",
      serviceArea: "SoMa & Mission Districts",
      contact: "+1 (555) 019-3388",
      lat: 37.7650,
      lng: -122.4120
    },
    {
      id: "vol-3",
      name: "Carlos Ortega",
      skills: ["Food Distribution", "Translation (Spanish)", "Logistics"],
      availability: "busy",
      serviceArea: "Excelsior & Outer Mission",
      contact: "+1 (555) 013-1122",
      lat: 37.7250,
      lng: -122.4280
    },
    {
      id: "vol-4",
      name: "Emily Watson",
      skills: ["First Aid", "Water Rescue", "Radio Operation"],
      availability: "available",
      serviceArea: "Marina & North Beach",
      contact: "+1 (555) 014-5566",
      lat: 37.8040,
      lng: -122.4250
    }
  ],

  activities: [
    {
      id: "act-1",
      type: "sos_alert",
      title: "CRITICAL: SOS Triggered",
      message: "High-priority rescue request submitted at Post St. Location flagged on live map.",
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString()
    },
    {
      id: "act-2",
      type: "match_found",
      title: "Resource Matched",
      message: "NGO 'Hope Kitchen' matched with temporary shelter project for Food Packet delivery.",
      timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString()
    },
    {
      id: "act-3",
      type: "volunteer_registered",
      title: "New Volunteer",
      message: "Emily Watson registered for First Aid and Water Rescue in Marina district.",
      timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString()
    },
    {
      id: "act-4",
      type: "offer_created",
      title: "Transport Offer",
      message: "Marcus Vance listed a 4x4 SUV available for emergency logistical support.",
      timestamp: new Date(Date.now() - 180 * 60 * 1000).toISOString()
    }
  ],

  stats: {
    activeRequests: 43,
    resourcesAvailable: 128,
    volunteersOnline: 87,
    savedLives: 1204
  },

  successStories: [
    {
      id: "story-1",
      title: "Reunion & Safety in the Flood Crisis",
      story: "When the sudden flash floods cut off power and road access in the Outer Sunset area, a family of four was stranded on their second floor with rising waters. Through Emergency Connect, they posted an urgent request. Volunteer Samuel Green saw the request, coordinated with a neighbor who had a kayak, and evacuated them to the local Sunset Community Shelter within two hours. 'This app literally saved our children's lives,' says Sarah Jenkins.",
      author: "Sarah Jenkins (Displaced Resident)",
      category: "Rescue"
    },
    {
      id: "story-2",
      title: "O- Blood Match in 18 Minutes",
      story: "During a major highway accident response, St. Mary's Hospital faced an acute shortage of O-negative blood. The emergency room coordinator posted a critical request. Within minutes, two nearby registered donors, Alex Rivera and Elena Rostova, received SMS push notifications. Alex was able to walk into the donation clinic within 18 minutes. The patient received the transfusion successfully.",
      author: "Dr. Karen Mitchell (Chief ER Surgeon)",
      category: "Blood Match"
    },
    {
      id: "story-3",
      title: "Warm Meals for 200 Stranded Travelers",
      story: "A severe electrical storm grounded air and rail transit, leaving hundreds stranded at a temporary evacuation center. Red Cross coordinators used Emergency Connect to broadcast a need for prepared meals. Hope Kitchen NGO and three local restaurants collaborated within an hour to prepare and deliver 200 hot food packets. The speed of coordination was remarkable.",
      author: "Red Cross Coordinator",
      category: "Food Distribution"
    }
  ]
};

// Export to window object for browser access
window.emergencySeedData = initialData;
