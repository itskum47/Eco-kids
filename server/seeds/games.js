// Environmental Games Seed Data for EcoKids India

export const games = [
  {
    id: 1,
    title: "EcoChain - Food Web Builder",
    titleHi: "इकोचेन - भोजन श्रृंखला निर्माता",
    slug: "ecochain-food-web-builder",
    category: "biodiversity",
    type: "simulation",
    difficulty: "intermediate",
    duration: 20, // minutes
    ageGroup: "10-16",
    description: "Build and balance food webs in different Indian ecosystems. Learn how species depend on each other and what happens when the balance is disturbed.",
    descriptionHi: "विभिन्न भारतीय पारिस्थितिकी तंत्रों में भोजन श्रृंखला बनाएं और संतुलित करें। सीखें कि प्रजातियां एक दूसरे पर कैसे निर्भर हैं और संतुलन बिगड़ने पर क्या होता है।",
    gameplayMechanics: {
      type: "drag-and-drop",
      objective: "Create stable food webs by connecting producers, primary consumers, secondary consumers, and apex predators",
      scoring: "Points awarded for correct connections, bonus for ecosystem balance",
      difficulty_progression: "Start with simple chains, progress to complex webs",
      time_limit: 1200 // 20 minutes in seconds
    },
    ecosystems: [
      {
        name: "Western Ghats Rainforest",
        nameHi: "पश्चिमी घाट वर्षावन",
        description: "Tropical rainforest ecosystem with high biodiversity",
        species: [
          {
            name: "Malabar Giant Squirrel",
            nameHi: "मालाबार विशालकाय गिलहरी",
            type: "primary_consumer",
            diet: ["fruits", "nuts", "bark"],
            role: "seed_disperser",
            endangered_status: "near_threatened"
          },
          {
            name: "King Cobra",
            nameHi: "राज नाग",
            type: "apex_predator",
            diet: ["other_snakes", "monitor_lizards"],
            role: "population_controller",
            endangered_status: "vulnerable"
          },
          {
            name: "Lion-tailed Macaque",
            nameHi: "शेर-पूंछ मकाक",
            type: "primary_consumer",
            diet: ["fruits", "insects", "leaves"],
            role: "seed_disperser",
            endangered_status: "endangered"
          },
          {
            name: "Indian Hornbill",
            nameHi: "भारतीय धनेश",
            type: "primary_consumer",
            diet: ["fruits", "insects"],
            role: "seed_disperser",
            endangered_status: "near_threatened"
          }
        ]
      },
      {
        name: "Thar Desert",
        nameHi: "थार मरुस्थल",
        description: "Arid ecosystem with specialized adaptations",
        species: [
          {
            name: "Desert Fox",
            nameHi: "मरुस्थली लोमड़ी",
            type: "secondary_consumer",
            diet: ["rodents", "insects", "birds"],
            role: "predator",
            endangered_status: "least_concern"
          },
          {
            name: "Great Indian Bustard",
            nameHi: "महान भारतीय सोहन चिड़िया",
            type: "primary_consumer",
            diet: ["insects", "small_reptiles", "plants"],
            role: "pest_controller",
            endangered_status: "critically_endangered"
          },
          {
            name: "Chinkara",
            nameHi: "चिंकारा",
            type: "primary_consumer",
            diet: ["grasses", "shrubs"],
            role: "grazer",
            endangered_status: "least_concern"
          }
        ]
      }
    ],
    learningObjectives: [
      "Understand predator-prey relationships",
      "Learn about energy transfer in ecosystems",
      "Recognize the importance of biodiversity",
      "Understand human impact on food webs",
      "Learn about endangered species conservation"
    ],
    gameFeatures: [
      "Interactive drag-and-drop interface",
      "Real-time ecosystem stability meter",
      "Educational facts about each species",
      "Multiple Indian ecosystems to explore",
      "Challenge mode with disruption scenarios"
    ],
    challenges: [
      {
        level: 1,
        title: "Basic Food Chain",
        titleHi: "बुनियादी भोजन श्रृंखला",
        description: "Create a simple 4-species food chain",
        target_species_count: 4,
        time_limit: 300
      },
      {
        level: 2,
        title: "Rainforest Web",
        titleHi: "वर्षावन जाल",
        description: "Build a complex web with 8+ species",
        target_species_count: 8,
        time_limit: 600
      },
      {
        level: 3,
        title: "Human Impact",
        titleHi: "मानव प्रभाव",
        description: "Restore balance after human interference",
        scenario: "deforestation",
        time_limit: 450
      }
    ],
    educationalContent: {
      concepts: [
        "Trophic levels and energy pyramids",
        "Keystone species importance",
        "Biodiversity and ecosystem stability",
        "Human activities impact",
        "Conservation strategies"
      ],
      facts: [
        "A typical food chain has 3-5 trophic levels",
        "Only 10% of energy transfers between levels",
        "India has 4 biodiversity hotspots",
        "Apex predators are crucial for ecosystem balance"
      ]
    },
    tags: ["food-web", "ecosystem", "biodiversity", "conservation", "simulation"],
    grade: [7, 8, 9, 10],
    skills: ["systems_thinking", "cause_effect", "problem_solving"],
    createdAt: "2024-01-15T14:00:00Z"
  },

  {
    id: 2,
    title: "Water Wise City Planner",
    titleHi: "जल बुद्धिमान शहर योजनाकार",
    slug: "water-wise-city-planner",
    category: "water",
    type: "strategy",
    difficulty: "advanced",
    duration: 25,
    ageGroup: "12-18",
    description: "Design a sustainable city with efficient water management systems. Balance water supply, demand, and conservation for a growing Indian city.",
    descriptionHi: "कुशल जल प्रबंधन प्रणालियों के साथ एक टिकाऊ शहर डिज़ाइन करें। बढ़ते भारतीय शहर के लिए जल आपूर्ति, मांग और संरक्षण को संतुलित करें।",
    gameplayMechanics: {
      type: "city_builder",
      objective: "Create a water-sustainable city for 1 million people while maintaining quality of life",
      scoring: "Based on water efficiency, citizen happiness, and environmental impact",
      resources: ["budget", "water_supply", "land", "technology_points"],
      time_limit: 1500
    },
    cityScenarios: [
      {
        name: "Chennai Model",
        nameHi: "चेन्नई मॉडल",
        description: "Coastal city facing water scarcity and flooding",
        challenges: ["monsoon_flooding", "summer_drought", "groundwater_depletion"],
        starting_resources: {
          budget: 1000000,
          water_supply: 400,
          population: 500000,
          land_area: 100
        }
      },
      {
        name: "Jodhpur Model",
        nameHi: "जोधपुर मॉडल",
        description: "Desert city with limited water resources",
        challenges: ["water_scarcity", "high_temperature", "limited_rainfall"],
        starting_resources: {
          budget: 800000,
          water_supply: 200,
          population: 300000,
          land_area: 120
        }
      }
    ],
    infrastructureOptions: [
      {
        name: "Rainwater Harvesting System",
        nameHi: "वर्षा जल संचयन प्रणाली",
        cost: 50000,
        water_gain: 100,
        maintenance_cost: 5000,
        efficiency: 75,
        environmental_impact: "positive"
      },
      {
        name: "Wastewater Treatment Plant",
        nameHi: "अपशिष्ट जल उपचार संयंत्र",
        cost: 200000,
        water_recycled: 300,
        maintenance_cost: 20000,
        efficiency: 85,
        environmental_impact: "positive"
      },
      {
        name: "Desalination Plant",
        nameHi: "विलवणीकरण संयंत्र",
        cost: 500000,
        water_gain: 500,
        maintenance_cost: 50000,
        efficiency: 90,
        environmental_impact: "negative",
        energy_consumption: "high"
      },
      {
        name: "Smart Water Meters",
        nameHi: "स्मार्ट जल मीटर",
        cost: 100000,
        water_savings: 15, // percentage
        maintenance_cost: 8000,
        efficiency: 95,
        environmental_impact: "neutral"
      }
    ],
    policies: [
      {
        name: "Water Conservation Incentives",
        nameHi: "जल संरक्षण प्रोत्साहन",
        effect: "Reduces citizen water consumption by 20%",
        cost: 25000,
        citizen_approval: 80
      },
      {
        name: "Mandatory Rainwater Harvesting",
        nameHi: "अनिवार्य वर्षा जल संचयन",
        effect: "Increases water supply by 25% during monsoon",
        cost: 15000,
        citizen_approval: 60
      },
      {
        name: "Industrial Water Recycling Mandate",
        nameHi: "औद्योगिक जल पुनर्चक्रण आदेश",
        effect: "Reduces industrial water demand by 40%",
        cost: 30000,
        citizen_approval: 70
      }
    ],
    challenges: [
      {
        event: "Severe Drought",
        eventHi: "गंभीर सूखा",
        description: "Monsoon failure reduces water supply by 50%",
        duration: 3, // turns
        impact: "water_supply_reduction"
      },
      {
        event: "Population Surge",
        eventHi: "जनसंख्या वृद्धि",
        description: "Rapid urbanization increases water demand",
        impact: "demand_increase",
        magnitude: 30
      },
      {
        event: "Pollution Crisis",
        eventHi: "प्रदूषण संकट",
        description: "Industrial pollution contaminates water sources",
        impact: "supply_contamination",
        cleanup_cost: 100000
      }
    ],
    winConditions: [
      "Maintain water security for all citizens",
      "Achieve 80%+ citizen satisfaction",
      "Keep environmental impact below threshold",
      "Balance budget (no deficit exceeding 200,000)"
    ],
    educationalContent: {
      concepts: [
        "Urban water cycle management",
        "Water treatment technologies",
        "Conservation strategies",
        "Policy impact on behavior",
        "Sustainable development goals"
      ],
      real_world_examples: [
        "Singapore's water independence strategy",
        "Chennai's Day Zero crisis and recovery",
        "Cape Town's water crisis management",
        "Traditional Indian water systems (stepwells, tanks)"
      ]
    },
    tags: ["water-management", "urban-planning", "sustainability", "strategy"],
    grade: [9, 10, 11, 12],
    skills: ["strategic_planning", "resource_management", "systems_thinking"],
    createdAt: "2024-01-15T14:30:00Z"
  },

  {
    id: 3,
    title: "Climate Hero Adventure",
    titleHi: "जलवायु हीरो साहसिक यात्रा",
    slug: "climate-hero-adventure",
    category: "climate",
    type: "adventure",
    difficulty: "beginner",
    duration: 15,
    ageGroup: "8-14",
    description: "Embark on an exciting journey across India as a Climate Hero. Complete missions to reduce carbon footprint and spread climate awareness.",
    descriptionHi: "एक जलवायु हीरो के रूप में भारत भर में एक रोमांचक यात्रा पर निकलें। कार्बन पदचिह्न कम करने और जलवायु जागरूकता फैलाने के लिए मिशन पूरे करें।",
    gameplayMechanics: {
      type: "adventure_quest",
      objective: "Complete climate action missions across 5 Indian cities",
      scoring: "Climate points earned through successful mission completion",
      character_progression: "Unlock new abilities and tools",
      time_limit: 900
    },
    cities: [
      {
        name: "Delhi",
        nameHi: "दिल्ली",
        climate_challenge: "Air Pollution",
        climate_challengeHi: "वायु प्रदूषण",
        missions: [
          {
            id: "delhi_1",
            title: "Operation Clean Air",
            titleHi: "ऑपरेशन स्वच्छ हवा",
            description: "Help reduce vehicular emissions by promoting electric vehicles",
            type: "awareness_campaign",
            difficulty: "easy",
            climate_points: 50
          },
          {
            id: "delhi_2",
            title: "Green Transport Challenge",
            titleHi: "हरित परिवहन चुनौती",
            description: "Convince 100 people to use public transport for a week",
            type: "behavior_change",
            difficulty: "medium",
            climate_points: 100
          }
        ]
      },
      {
        name: "Mumbai",
        nameHi: "मुंबई",
        climate_challenge: "Sea Level Rise",
        climate_challengeHi: "समुद्री जल स्तर वृद्धि",
        missions: [
          {
            id: "mumbai_1",
            title: "Mangrove Restoration",
            titleHi: "मैंग्रोव पुनरुद्धार",
            description: "Plant 500 mangrove saplings to protect the coastline",
            type: "restoration",
            difficulty: "medium",
            climate_points: 150
          }
        ]
      },
      {
        name: "Bangalore",
        nameHi: "बैंगलोर",
        climate_challenge: "Urban Heat Island",
        climate_challengeHi: "शहरी ऊष्मा द्वीप",
        missions: [
          {
            id: "bangalore_1",
            title: "Cool Roofs Initiative",
            titleHi: "कूल रूफ पहल",
            description: "Install reflective roofing in 50 buildings",
            type: "technology_deployment",
            difficulty: "hard",
            climate_points: 200
          }
        ]
      }
    ],
    heroAbilities: [
      {
        name: "Solar Boost",
        nameHi: "सौर शक्ति",
        description: "Install solar panels instantly",
        energy_cost: 20,
        unlock_level: 1
      },
      {
        name: "Tree Planter",
        nameHi: "वृक्ष रोपक",
        description: "Plant trees at super speed",
        energy_cost: 15,
        unlock_level: 2
      },
      {
        name: "Pollution Scanner",
        nameHi: "प्रदूषण स्कैनर",
        description: "Identify pollution sources instantly",
        energy_cost: 10,
        unlock_level: 3
      }
    ],
    tools: [
      {
        name: "Carbon Calculator",
        nameHi: "कार्बन कैलकुलेटर",
        description: "Measure carbon footprint of activities",
        usage: "Helps optimize mission strategies"
      },
      {
        name: "Climate Fact Blaster",
        nameHi: "जलवायु तथ्य ब्लास्टर",
        description: "Share climate facts to increase awareness",
        usage: "Earn bonus points in awareness missions"
      }
    ],
    climateActions: [
      {
        action: "Switch to LED bulbs",
        actionHi: "LED बल्ब पर स्विच करें",
        carbon_saved: 50, // kg CO2 per year
        cost: 200, // game currency
        difficulty: "easy"
      },
      {
        action: "Install solar water heater",
        actionHi: "सोलर वाटर हीटर लगाएं",
        carbon_saved: 500,
        cost: 2000,
        difficulty: "medium"
      },
      {
        action: "Start community garden",
        actionHi: "सामुदायिक बगीचा शुरू करें",
        carbon_saved: 200,
        cost: 1000,
        difficulty: "hard",
        additional_benefits: ["food_security", "community_building"]
      }
    ],
    achievements: [
      {
        name: "Carbon Cutter",
        nameHi: "कार्बन कटर",
        description: "Reduce 1000 kg of CO2 emissions",
        reward: "Unlock advanced solar abilities"
      },
      {
        name: "Tree Champion",
        nameHi: "वृक्ष चैंपियन",
        description: "Plant 100 trees",
        reward: "Get super-speed planting ability"
      },
      {
        name: "Awareness Ambassador",
        nameHi: "जागरूकता राजदूत",
        description: "Complete 10 awareness campaigns",
        reward: "Unlock influence multiplier"
      }
    ],
    educationalContent: {
      climate_facts: [
        "India's average temperature has risen by 0.7°C since 1901",
        "Transportation accounts for 13% of India's GHG emissions",
        "Mangroves can store 3-4 times more carbon than tropical forests",
        "Cool roofs can reduce building temperatures by 2-5°C"
      ],
      action_tips: [
        "Use stairs instead of elevators to save energy",
        "Unplug devices when not in use",
        "Choose local, seasonal foods",
        "Use water efficiently to reduce energy consumption"
      ]
    },
    tags: ["climate-action", "adventure", "awareness", "mitigation"],
    grade: [6, 7, 8, 9],
    skills: ["problem_solving", "environmental_awareness", "action_planning"],
    createdAt: "2024-01-15T15:00:00Z"
  },

  {
    id: 4,
    title: "Solar System Engineer",
    titleHi: "सौर सिस्टम इंजीनियर",
    slug: "solar-system-engineer",
    category: "energy",
    type: "puzzle",
    difficulty: "intermediate",
    duration: 18,
    ageGroup: "10-16",
    description: "Design and optimize solar power systems for Indian homes, schools, and businesses. Learn about solar technology while solving engineering challenges.",
    descriptionHi: "भारतीय घरों, स्कूलों और व्यवसायों के लिए सौर ऊर्जा सिस्टम डिज़ाइन और अनुकूलित करें। इंजीनियरिंग चुनौतियों को हल करते हुए सौर तकनीक के बारे में सीखें।",
    gameplayMechanics: {
      type: "engineering_puzzle",
      objective: "Design optimal solar installations within budget and space constraints",
      scoring: "Based on energy efficiency, cost-effectiveness, and environmental impact",
      physics_simulation: true,
      time_limit: 1080
    },
    scenarios: [
      {
        id: "rural_school",
        name: "Rural School in Rajasthan",
        nameHi: "राजस्थान में ग्रामीण स्कूल",
        location: {
          latitude: 26.9124,
          longitude: 75.7873,
          solar_irradiance: 5.5, // kWh/m²/day
          temperature_range: "5-45°C"
        },
        requirements: {
          daily_energy_need: 50, // kWh
          budget: 500000, // INR
          roof_area: 200, // m²
          connection_type: "off_grid"
        },
        challenges: ["dust_storms", "extreme_heat", "limited_maintenance"]
      },
      {
        id: "urban_home",
        name: "Urban Home in Bangalore",
        nameHi: "बैंगलोर में शहरी घर",
        location: {
          latitude: 12.9716,
          longitude: 77.5946,
          solar_irradiance: 4.8,
          temperature_range: "15-35°C"
        },
        requirements: {
          daily_energy_need: 25,
          budget: 300000,
          roof_area: 100,
          connection_type: "grid_tied"
        },
        challenges: ["monsoon_clouds", "space_constraints", "aesthetic_requirements"]
      }
    ],
    solarComponents: [
      {
        name: "Monocrystalline Solar Panel",
        nameHi: "मोनोक्रिस्टलाइन सोलर पैनल",
        type: "panel",
        efficiency: 20, // %
        cost_per_watt: 25, // INR
        size: "2m x 1m",
        power_rating: 400, // watts
        temperature_coefficient: -0.35,
        lifespan: 25 // years
      },
      {
        name: "Polycrystalline Solar Panel",
        nameHi: "पॉलीक्रिस्टलाइन सोलर पैनल",
        type: "panel",
        efficiency: 16,
        cost_per_watt: 20,
        size: "2m x 1m",
        power_rating: 320,
        temperature_coefficient: -0.40,
        lifespan: 25
      },
      {
        name: "Lithium Battery",
        nameHi: "लिथियम बैटरी",
        type: "battery",
        capacity: 10, // kWh
        cost: 80000, // INR
        efficiency: 95,
        depth_of_discharge: 90,
        lifespan: 10
      },
      {
        name: "Lead Acid Battery",
        nameHi: "लेड एसिड बैटरी",
        type: "battery",
        capacity: 10,
        cost: 40000,
        efficiency: 85,
        depth_of_discharge: 50,
        lifespan: 5
      }
    ],
    designChallenges: [
      {
        challenge: "Shading Analysis",
        challengeHi: "छाया विश्लेषण",
        description: "Account for shadows from nearby buildings and trees",
        complexity: "medium",
        impact: "10-30% power loss if not optimized"
      },
      {
        challenge: "Tilt Angle Optimization",
        challengeHi: "झुकाव कोण अनुकूलन",
        description: "Find optimal panel tilt for maximum annual energy",
        complexity: "easy",
        impact: "5-15% efficiency improvement"
      },
      {
        challenge: "String Configuration",
        challengeHi: "स्ट्रिंग कॉन्फ़िगरेशन",
        description: "Configure panels in series/parallel for optimal voltage",
        complexity: "hard",
        impact: "System functionality and safety"
      }
    ],
    calculationTools: [
      {
        tool: "Solar Irradiance Calculator",
        toolHi: "सौर विकिरण कैलकुलेटर",
        function: "Calculate expected solar energy based on location and season"
      },
      {
        tool: "Load Calculator",
        toolHi: "लोड कैलकुलेटर",
        function: "Determine energy requirements based on appliances"
      },
      {
        tool: "Economic Analyzer",
        toolHi: "आर्थिक विश्लेषक",
        function: "Calculate payback period and lifetime savings"
      }
    ],
    learningModules: [
      {
        topic: "Photovoltaic Effect",
        topicHi: "फोटोवोल्टाइक प्रभाव",
        description: "How solar cells convert sunlight to electricity",
        interactive: true
      },
      {
        topic: "System Components",
        topicHi: "सिस्टम घटक",
        description: "Panels, inverters, batteries, and charge controllers",
        interactive: true
      },
      {
        topic: "Grid Integration",
        topicHi: "ग्रिड एकीकरण",
        description: "How solar systems connect to the electricity grid",
        interactive: false
      }
    ],
    achievements: [
      {
        name: "Efficiency Expert",
        nameHi: "दक्षता विशेषज्ञ",
        criteria: "Design system with >95% efficiency rating",
        reward: "Unlock advanced panel types"
      },
      {
        name: "Budget Master",
        nameHi: "बजट मास्टर",
        criteria: "Complete design 20% under budget",
        reward: "Get cost reduction bonuses"
      },
      {
        name: "Green Engineer",
        nameHi: "हरित इंजीनियर",
        criteria: "Design systems preventing 10,000 kg CO2 emissions",
        reward: "Unlock carbon tracking tools"
      }
    ],
    realWorldConnection: {
      indian_solar_policies: [
        "PM-KUSUM scheme for agricultural solar pumps",
        "Rooftop solar subsidy programs",
        "Solar park development initiatives",
        "Net metering regulations by states"
      ],
      career_paths: [
        "Solar system designer",
        "Renewable energy engineer",
        "Energy consultant",
        "Solar project manager"
      ]
    },
    tags: ["solar-energy", "engineering", "renewable", "calculation"],
    grade: [8, 9, 10, 11],
    skills: ["mathematical_thinking", "engineering_design", "optimization"],
    createdAt: "2024-01-15T15:30:00Z"
  }
];

export const gameCategories = [
  {
    id: "water",
    name: "Water Conservation",
    nameHi: "जल संरक्षण",
    description: "Games focused on water management and conservation",
    descriptionHi: "जल प्रबंधन और संरक्षण पर केंद्रित खेल",
    icon: "💧",
    color: "#3B82F6"
  },
  {
    id: "biodiversity",
    name: "Biodiversity & Ecosystems",
    nameHi: "जैव विविधता और पारिस्थितिकी तंत्र",
    description: "Games about wildlife, ecosystems, and biodiversity",
    descriptionHi: "वन्यजीव, पारिस्थितिकी तंत्र और जैव विविधता के बारे में खेल",
    icon: "🌿",
    color: "#10B981"
  },
  {
    id: "climate",
    name: "Climate Action",
    nameHi: "जलवायु कार्रवाई",
    description: "Games about climate change and environmental action",
    descriptionHi: "जलवायु परिवर्तन और पर्यावरणीय कार्रवाई के बारे में खेल",
    icon: "🌍",
    color: "#F59E0B"
  },
  {
    id: "energy",
    name: "Renewable Energy",
    nameHi: "नवीकरणीय ऊर्जा",
    description: "Games about clean energy and sustainable power",
    descriptionHi: "स्वच्छ ऊर्जा और टिकाऊ शक्ति के बारे में खेल",
    icon: "☀️",
    color: "#EF4444"
  },
  {
    id: "waste",
    name: "Waste Management",
    nameHi: "अपशिष्ट प्रबंधन",
    description: "Games about recycling and waste reduction",
    descriptionHi: "पुनर्चक्रण और अपशिष्ट न्यूनीकरण के बारे में खेल",
    icon: "♻️",
    color: "#8B5CF6"
  }
];

export default games;