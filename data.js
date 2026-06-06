// Emergency Connect - Realistic Seed Data
// Emergency Connect - Realistic Seed Data (Bhopal, MP, India)
const initialData = {
  listings: [
    {
      id: "list-1",
      title: "Urgent Need for Oxygen Cylinder",
      category: "Medical Equipment",
      type: "request",
      description: "Critical emergency for an elderly patient with respiratory distress. Requires 10L oxygen concentrator or cylinder immediately.",
      location: {
        address: "MP Nagar Zone-II, Bhopal, MP",
        lat: 23.2323,
        lng: 77.4318
      },
      contact: "+91 98765 43210 (Amit Sharma)",
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
        address: "Indrapuri Sector-C, Bhopal, MP",
        lat: 23.2530,
        lng: 77.4645
      },
      contact: "+91 87654 32109 (Aahar Foundation NGO)",
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
        address: "Kohefiza, Bhopal, MP",
        lat: 23.2680,
        lng: 77.3890
      },
      contact: "+91 76543 21098 (Rajesh Patel)",
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
        address: "Kolar Road, Bhopal, MP",
        lat: 23.1690,
        lng: 77.4172
      },
      contact: "+91 99887 76655 (Sneha Verma)",
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
        address: "Arera Colony, Bhopal, MP",
        lat: 23.2127,
        lng: 77.4262
      },
      contact: "+91 88990 01122 (Dr. Sandeep Gupta)",
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
        address: "TT Nagar, Bhopal, MP",
        lat: 23.2425,
        lng: 77.4019
      },
      contact: "+91 77665 54433 (Sewa Bharti Coordinator)",
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
        address: "Bairagarh, Bhopal, MP",
        lat: 23.2721,
        lng: 77.3456
      },
      contact: "+91 91234 56789 (Pooja Mishra)",
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
      name: "Vikram Singh",
      bloodGroup: "O-",
      phone: "+91 95432 10987",
      location: "Arera Colony, Bhopal",
      lat: 23.2150,
      lng: 77.4290,
      available: true,
      lastDonated: "2026-03-10"
    },
    {
      id: "donor-2",
      name: "Priya Patel",
      bloodGroup: "A+",
      phone: "+91 91388 22334",
      location: "MP Nagar, Bhopal",
      lat: 23.2310,
      lng: 77.4340,
      available: true,
      lastDonated: "2026-04-18"
    },
    {
      id: "donor-3",
      name: "Manish Sharma",
      bloodGroup: "B+",
      phone: "+91 96774 41122",
      location: "Indrapuri, Bhopal",
      lat: 23.2510,
      lng: 77.4610,
      available: true,
      lastDonated: "2026-05-01"
    },
    {
      id: "donor-4",
      name: "Jyoti Thakur",
      bloodGroup: "O+",
      phone: "+91 92990 05544",
      location: "TT Nagar, Bhopal",
      lat: 23.2410,
      lng: 77.4040,
      available: false,
      lastDonated: "2026-05-28"
    },
    {
      id: "donor-5",
      name: "Devendra Mishra",
      bloodGroup: "AB-",
      phone: "+91 91144 88332",
      location: "Kohefiza, Bhopal",
      lat: 23.2660,
      lng: 77.3860,
      available: true,
      lastDonated: "2026-02-15"
    },
    {
      id: "donor-6",
      name: "Ekta Rawat",
      bloodGroup: "O-",
      phone: "+91 94220 03311",
      location: "Kolar Road, Bhopal",
      lat: 23.1720,
      lng: 77.4140,
      available: true,
      lastDonated: "2026-04-05"
    }
  ],

  volunteers: [
    {
      id: "vol-1",
      name: "Sanjay Mishra",
      skills: ["First Aid", "Search & Rescue", "Logistics"],
      availability: "available",
      serviceArea: "Kolar & Arera Colony, Bhopal",
      contact: "+91 91288 77665",
      lat: 23.1850,
      lng: 77.4200
    },
    {
      id: "vol-2",
      name: "Aisha Rahman",
      skills: ["Medical (RN)", "Crisis Counseling", "Translation (Hindi/English)"],
      availability: "available",
      serviceArea: "MP Nagar & TT Nagar, Bhopal",
      contact: "+91 91933 88776",
      lat: 23.2350,
      lng: 77.4150
    },
    {
      id: "vol-3",
      name: "Chandan Ojha",
      skills: ["Food Distribution", "Translation (Sanskrit/Hindi)", "Logistics"],
      availability: "busy",
      serviceArea: "Bairagarh & Kohefiza, Bhopal",
      contact: "+91 91311 22334",
      lat: 23.2700,
      lng: 77.3600
    },
    {
      id: "vol-4",
      name: "Esha Dwivedi",
      skills: ["First Aid", "Water Rescue", "Radio Operation"],
      availability: "available",
      serviceArea: "Indrapuri & Piplani, Bhopal",
      contact: "+91 91455 66778",
      lat: 23.2550,
      lng: 77.4680
    }
  ],

  activities: [
    {
      id: "act-1",
      type: "sos_alert",
      title: "CRITICAL: SOS Triggered",
      message: "High-priority rescue request submitted at MP Nagar. Location flagged on live map.",
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString()
    },
    {
      id: "act-2",
      type: "match_found",
      title: "Resource Matched",
      message: "Aahar Foundation matched with temporary shelter project for Food Packet delivery.",
      timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString()
    },
    {
      id: "act-3",
      type: "volunteer_registered",
      title: "New Volunteer",
      message: "Esha Dwivedi registered for First Aid and Water Rescue in Indrapuri area.",
      timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString()
    },
    {
      id: "act-4",
      type: "offer_created",
      title: "Transport Offer",
      message: "Rajesh Patel listed a 4x4 SUV available for emergency logistical support.",
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
      story: "When the sudden flash floods cut off power and road access in the Kolar Road area, a family of four was stranded on their second floor with rising waters. Through Emergency Connect, they posted an urgent request. Volunteer Sanjay Mishra saw the request, coordinated with a neighbor who had a boat, and evacuated them to the local Kolar Community Relief Hub within two hours. 'This app literally saved our children\\'s lives,' says Sneha Verma.",
      author: "Sneha Verma (Displaced Resident)",
      category: "Rescue"
    },
    {
      id: "story-2",
      title: "O- Blood Match in 18 Minutes",
      story: "During a major highway accident response, Bhopal Memorial Hospital (BMHRC) faced an acute shortage of O-negative blood. The emergency room coordinator posted a critical request. Within minutes, two nearby registered donors, Vikram Singh and Ekta Rawat, received SMS notifications. Vikram was able to walk into the donation clinic within 18 minutes. The patient received the transfusion successfully.",
      author: "Dr. Karan Mehta (Chief ER Surgeon)",
      category: "Blood Match"
    },
    {
      id: "story-3",
      title: "Warm Meals for 200 Stranded Travelers",
      story: "A severe electrical storm grounded air and rail transit, leaving hundreds stranded at a temporary evacuation center. Red Cross coordinators used Emergency Connect to broadcast a need for prepared meals. Aahar Foundation NGO and three local restaurants collaborated within an hour to prepare and deliver 200 hot food packets. The speed of coordination was remarkable.",
      author: "Red Cross Coordinator",
      category: "Food Distribution"
    }
  ]
};

// Export to window object for browser access
window.emergencySeedData = initialData;

// Predefined neighborhoods for major Indian cities to make mock data look realistic
const cityNeighborhoods = {
  "bhopal": ["MP Nagar", "TT Nagar", "Kohefiza", "Arera Colony", "Kolar Road", "Indrapuri", "Bairagarh", "Ayodhya Bypass"],
  "delhi": ["Connaught Place", "Karol Bagh", "Saket", "Dwarka", "Rohini", "Vasant Kunj", "Lajpat Nagar", "Chandni Chowk"],
  "mumbai": ["Andheri", "Bandra", "Colaba", "Dadar", "Borivali", "Powai", "Juhu", "Ghatkopar"],
  "bangalore": ["Indiranagar", "Jayanagar", "Koramangala", "Whitefield", "HSR Layout", "Yelahanka", "Malleshwaram"],
  "pune": ["Kothrud", "Hinjewadi", "Shivaji Nagar", "Koregaon Park", "Baner", "Viman Nagar", "Hadapsar"],
  "indore": ["Vijay Nagar", "Palasia", "Rajwada", "Bhawarkua", "Khajrana", "Sudama Nagar"],
  "hyderabad": ["Gachibowli", "Madhapur", "Jubilee Hills", "Secunderabad", "Banjara Hills", "Kukatpally"],
  "chennai": ["Adyar", "Velachery", "T. Nagar", "Anna Nagar", "Mylapore", "Tambaram"],
  "kolkata": ["Salt Lake", "New Town", "Park Street", "Garia", "Howrah", "Behala"]
};

// Indian names pool for dynamic generation
const indianNames = [
  "Amit Sharma", "Priya Patel", "Rajesh Patel", "Sneha Verma", "Dr. Sandeep Gupta",
  "Sanjay Mishra", "Aisha Rahman", "Chandan Ojha", "Esha Dwivedi", "Vikram Singh",
  "Jyoti Thakur", "Devendra Mishra", "Ekta Rawat", "Manish Sharma", "Rahul Verma",
  "Sunita Rao", "Karan Mehta", "Ananya Deshmukh", "Rohan Joshi", "Kriti Nair"
];

// Helper to generate dynamic mock data for any city in India
window.generateMockDataForCity = function(lat, lng, cityName) {
  const normCity = cityName.toLowerCase().trim();
  let neighborhoods = ["Central Zone", "Sector-3", "Station Road", "Civil Lines", "Green Park", "Subhash Nagar", "Airport Road", "Ring Road"];
  
  // Find matching city neighborhoods
  for (const key in cityNeighborhoods) {
    if (normCity.includes(key)) {
      neighborhoods = cityNeighborhoods[key];
      break;
    }
  }

  const getRandomLoc = (idx) => {
    const area = neighborhoods[idx % neighborhoods.length];
    // Spread markers in a 4-8 km radius around the center coordinate
    const latOffset = (Math.sin(idx * 1.5) * 0.025) + ((Math.random() - 0.5) * 0.01);
    const lngOffset = (Math.cos(idx * 1.5) * 0.025) + ((Math.random() - 0.5) * 0.01);
    return {
      address: `${area}, ${cityName}`,
      lat: lat + latOffset,
      lng: lng + lngOffset
    };
  };

  const getContact = (idx) => {
    const name = indianNames[idx % indianNames.length];
    const phone = "+91 " + (9000000000 + Math.floor(Math.random() * 999999999));
    return `${phone} (${name})`;
  };

  // Generate 7 listings
  const listings = [
    {
      id: "list-1",
      title: "Urgent Need for Oxygen Cylinder",
      category: "Medical Equipment",
      type: "request",
      description: "Critical emergency for an elderly patient with respiratory distress. Requires 10L oxygen concentrator or cylinder immediately.",
      location: getRandomLoc(1),
      contact: getContact(1),
      urgency: "critical",
      quantity: 1,
      status: "pending",
      timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
      userId: "user-2"
    },
    {
      id: "list-2",
      title: "Available: 50 Food Packets & Clean Water",
      category: "Food Packets",
      type: "offer",
      description: "Freshly prepared vegetarian food packets and bottled water cases ready for distribution. Can deliver if nearby.",
      location: getRandomLoc(2),
      contact: "Aahar Foundation NGO (" + getContact(2).split('(')[1],
      urgency: "medium",
      quantity: 50,
      status: "available",
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      userId: "user-3"
    },
    {
      id: "list-3",
      title: "Emergency Transport - 4x4 SUV Available",
      category: "Emergency Transport",
      type: "offer",
      description: "All-wheel drive SUV with first-aid kit, available to transport people or supplies through flooded or rough terrain.",
      location: getRandomLoc(3),
      contact: getContact(3),
      urgency: "high",
      quantity: 1,
      status: "available",
      timestamp: new Date(Date.now() - 1.5 * 3600 * 1000).toISOString(),
      userId: "user-4"
    },
    {
      id: "list-4",
      title: "Need Temporary Shelter for Family of 4",
      category: "Temporary Shelter",
      type: "request",
      description: "Displaced due to local structural fire. Looking for accommodation for 2-3 nights. Family includes two kids.",
      location: getRandomLoc(4),
      contact: getContact(4),
      urgency: "high",
      quantity: 1,
      status: "pending",
      timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      userId: "user-5"
    },
    {
      id: "list-5",
      title: "Donation: Essential Pediatric Medicines",
      category: "Medicines",
      type: "offer",
      description: "Unopened packages of basic pediatric syrup, paracetamol, and rehydration salts. Expiry in 2027.",
      location: getRandomLoc(5),
      contact: "Dr. Sandeep Gupta (" + getContact(5).split('(')[1],
      urgency: "medium",
      quantity: 15,
      status: "available",
      timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
      userId: "user-6"
    },
    {
      id: "list-6",
      title: "Required: CPR Trained Volunteers",
      category: "Volunteers",
      type: "request",
      description: "Need 3 CPR-certified volunteers to assist at the community sports center temporary shelter hub.",
      location: getRandomLoc(6),
      contact: "Sewa Bharti Coordinator (" + getContact(6).split('(')[1],
      urgency: "high",
      quantity: 3,
      status: "pending",
      timestamp: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
      userId: "user-7"
    },
    {
      id: "list-7",
      title: "Available: Wheelchairs and Crutches",
      category: "Medical Equipment",
      type: "offer",
      description: "Two adjustable wheelchairs and three pairs of adult crutches in clean, working condition. Pickup required.",
      location: getRandomLoc(7),
      contact: getContact(7),
      urgency: "low",
      quantity: 5,
      status: "available",
      timestamp: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
      userId: "user-8"
    }
  ];

  // Generate 6 donors
  const donors = [
    {
      id: "donor-1",
      name: indianNames[0],
      bloodGroup: "O-",
      phone: "+91 " + (9000000000 + Math.floor(Math.random() * 999999999)),
      location: getRandomLoc(1).address.split(',')[0] + `, ${cityName}`,
      lat: getRandomLoc(1).lat,
      lng: getRandomLoc(1).lng,
      available: true,
      lastDonated: "2026-03-10"
    },
    {
      id: "donor-2",
      name: indianNames[1],
      bloodGroup: "A+",
      phone: "+91 " + (9000000000 + Math.floor(Math.random() * 999999999)),
      location: getRandomLoc(2).address.split(',')[0] + `, ${cityName}`,
      lat: getRandomLoc(2).lat,
      lng: getRandomLoc(2).lng,
      available: true,
      lastDonated: "2026-04-18"
    },
    {
      id: "donor-3",
      name: indianNames[2],
      bloodGroup: "B+",
      phone: "+91 " + (9000000000 + Math.floor(Math.random() * 999999999)),
      location: getRandomLoc(3).address.split(',')[0] + `, ${cityName}`,
      lat: getRandomLoc(3).lat,
      lng: getRandomLoc(3).lng,
      available: true,
      lastDonated: "2026-05-01"
    },
    {
      id: "donor-4",
      name: indianNames[3],
      bloodGroup: "O+",
      phone: "+91 " + (9000000000 + Math.floor(Math.random() * 999999999)),
      location: getRandomLoc(4).address.split(',')[0] + `, ${cityName}`,
      lat: getRandomLoc(4).lat,
      lng: getRandomLoc(4).lng,
      available: false,
      lastDonated: "2026-05-28"
    },
    {
      id: "donor-5",
      name: indianNames[4],
      bloodGroup: "AB-",
      phone: "+91 " + (9000000000 + Math.floor(Math.random() * 999999999)),
      location: getRandomLoc(5).address.split(',')[0] + `, ${cityName}`,
      lat: getRandomLoc(5).lat,
      lng: getRandomLoc(5).lng,
      available: true,
      lastDonated: "2026-02-15"
    },
    {
      id: "donor-6",
      name: indianNames[5],
      bloodGroup: "O-",
      phone: "+91 " + (9000000000 + Math.floor(Math.random() * 999999999)),
      location: getRandomLoc(6).address.split(',')[0] + `, ${cityName}`,
      lat: getRandomLoc(6).lat,
      lng: getRandomLoc(6).lng,
      available: true,
      lastDonated: "2026-04-05"
    }
  ];

  // Generate 4 volunteers
  const volunteers = [
    {
      id: "vol-1",
      name: indianNames[6],
      skills: ["First Aid", "Search & Rescue", "Logistics"],
      availability: "available",
      serviceArea: `${neighborhoods[0]} & ${neighborhoods[1]}, ${cityName}`,
      contact: "+91 " + (9000000000 + Math.floor(Math.random() * 999999999)),
      lat: getRandomLoc(1).lat - 0.005,
      lng: getRandomLoc(1).lng + 0.005
    },
    {
      id: "vol-2",
      name: indianNames[7],
      skills: ["Medical (RN)", "Crisis Counseling", "Translation (Hindi/English)"],
      availability: "available",
      serviceArea: `${neighborhoods[2]} & ${neighborhoods[3]}, ${cityName}`,
      contact: "+91 " + (9000000000 + Math.floor(Math.random() * 999999999)),
      lat: getRandomLoc(2).lat + 0.005,
      lng: getRandomLoc(2).lng - 0.005
    },
    {
      id: "vol-3",
      name: indianNames[8],
      skills: ["Food Distribution", "Logistics"],
      availability: "busy",
      serviceArea: `${neighborhoods[4]} & ${neighborhoods[5]}, ${cityName}`,
      contact: "+91 " + (9000000000 + Math.floor(Math.random() * 999999999)),
      lat: getRandomLoc(3).lat - 0.002,
      lng: getRandomLoc(3).lng + 0.002
    },
    {
      id: "vol-4",
      name: indianNames[9],
      skills: ["First Aid", "Water Rescue", "Radio Operation"],
      availability: "available",
      serviceArea: `${neighborhoods[6]} & ${neighborhoods[7]}, ${cityName}`,
      contact: "+91 " + (9000000000 + Math.floor(Math.random() * 999999999)),
      lat: getRandomLoc(4).lat + 0.002,
      lng: getRandomLoc(4).lng - 0.002
    }
  ];

  const activities = [
    {
      id: "act-1",
      type: "sos_alert",
      title: "CRITICAL: SOS Triggered",
      message: `High-priority rescue request submitted at ${neighborhoods[0]}. Location flagged on live map.`,
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString()
    },
    {
      id: "act-2",
      type: "match_found",
      title: "Resource Matched",
      message: `Aahar Foundation matched with temporary shelter project for Food Packet delivery in ${cityName}.`,
      timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString()
    },
    {
      id: "act-3",
      type: "volunteer_registered",
      title: "New Volunteer",
      message: `${indianNames[9]} registered for First Aid and Water Rescue in ${neighborhoods[6]}.`,
      timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString()
    },
    {
      id: "act-4",
      type: "offer_created",
      title: "Transport Offer",
      message: `${indianNames[2]} listed a 4x4 SUV available for emergency logistical support.`,
      timestamp: new Date(Date.now() - 180 * 60 * 1000).toISOString()
    }
  ];

  return {
    listings,
    donors,
    volunteers,
    activities,
    stats: {
      activeRequests: 12 + Math.floor(Math.random() * 20),
      resourcesAvailable: 45 + Math.floor(Math.random() * 50),
      volunteersOnline: 18 + Math.floor(Math.random() * 30),
      savedLives: 342 + Math.floor(Math.random() * 1000)
    }
  };
};
