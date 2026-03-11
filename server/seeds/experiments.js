// Environmental Experiments Seed Data for EcoKids India

export const experiments = [
  {
    id: 1,
    title: "Solar Water Heater",
    titleHi: "सौर जल तापक",
    slug: "solar-water-heater",
    category: "energy",
    difficulty: "intermediate",
    duration: 120, // minutes
    ageGroup: "10-15",
    supervision: true,
    description: "Build a simple solar water heater using everyday materials and understand how solar energy works.",
    descriptionHi: "रोजमर्रा की सामग्री का उपयोग करके एक सरल सौर जल तापक बनाएं और समझें कि सौर ऊर्जा कैसे काम करती है।",
    objectives: [
      "Understand how solar energy can be converted to heat",
      "Learn about renewable energy applications",
      "Experience hands-on engineering",
      "Measure temperature differences"
    ],
    materials: [
      {
        item: "Plastic water bottle (2L, clear)",
        quantity: 1,
        notes: "Remove labels for better sunlight penetration"
      },
      {
        item: "Black paint or black paper",
        quantity: 1,
        notes: "For better heat absorption"
      },
      {
        item: "Aluminum foil",
        quantity: "2 square feet",
        notes: "For reflection"
      },
      {
        item: "Plastic wrap or clear plastic sheet",
        quantity: "1 square foot",
        notes: "Creates greenhouse effect"
      },
      {
        item: "Cardboard box",
        quantity: 1,
        notes: "Should be larger than the bottle"
      },
      {
        item: "Thermometer",
        quantity: 2,
        notes: "To measure temperature difference"
      },
      {
        item: "Water",
        quantity: "2 liters",
        notes: "Room temperature"
      },
      {
        item: "Tape/Glue",
        quantity: 1,
        notes: "For assembly"
      }
    ],
    safetyGuidelines: [
      "Adult supervision required throughout the experiment",
      "Handle thermometers carefully to avoid breakage",
      "Do not drink water from the experiment",
      "Wear gloves when handling hot materials",
      "Work in a well-ventilated area if using paint"
    ],
    procedure: [
      {
        step: 1,
        title: "Prepare the bottle",
        instruction: "Paint the plastic bottle black or cover it with black paper. This helps absorb more solar energy.",
        image: "bottle-painting.jpg",
        tips: ["Ensure complete coverage for maximum heat absorption", "Let paint dry completely before proceeding"]
      },
      {
        step: 2,
        title: "Prepare the box",
        instruction: "Line the inside of the cardboard box with aluminum foil, shiny side facing inward. This will reflect sunlight onto the bottle.",
        image: "box-lining.jpg",
        tips: ["Smooth out wrinkles in foil", "Cover all inner surfaces"]
      },
      {
        step: 3,
        title: "Position the bottle",
        instruction: "Fill the bottle with water and place it inside the foil-lined box. The bottle should fit comfortably with space around it.",
        image: "bottle-placement.jpg",
        tips: ["Ensure bottle is stable", "Leave space for air circulation"]
      },
      {
        step: 4,
        title: "Create greenhouse effect",
        instruction: "Cover the box opening with plastic wrap, creating a sealed environment. This traps heat like a greenhouse.",
        image: "plastic-covering.jpg",
        tips: ["Seal edges well with tape", "Ensure plastic is tight but not touching the bottle"]
      },
      {
        step: 5,
        title: "Position for sunlight",
        instruction: "Place the solar heater in direct sunlight, tilting the box towards the sun for maximum exposure.",
        image: "sun-positioning.jpg",
        tips: ["Adjust position as sun moves", "Choose location with longest sun exposure"]
      },
      {
        step: 6,
        title: "Monitor temperature",
        instruction: "Record initial water temperature and ambient temperature. Check every 30 minutes for 3 hours.",
        image: "temperature-monitoring.jpg",
        tips: ["Keep a log of all readings", "Note weather conditions"]
      }
    ],
    observations: [
      "Initial water temperature: ___°C",
      "Final water temperature: ___°C",
      "Ambient temperature: ___°C",
      "Maximum temperature reached: ___°C",
      "Time to reach maximum temperature: ___ minutes",
      "Weather conditions: ___",
      "Any condensation observed: Yes/No"
    ],
    expectedResults: [
      "Water temperature should increase by 10-20°C on a sunny day",
      "Maximum temperature typically reached in 2-3 hours",
      "Condensation may form on plastic covering",
      "Black surface will feel much hotter than ambient temperature"
    ],
    scientificExplanation: `
## How It Works

### Solar Energy Absorption
The black surface absorbs solar radiation and converts it to heat energy. Dark colors absorb more wavelengths of light compared to light colors.

### Heat Transfer
Heat is transferred from the black surface to the water through conduction. Water is a good medium for storing thermal energy.

### Greenhouse Effect
The plastic covering traps warm air and prevents heat from escaping, similar to how Earth's atmosphere traps heat.

### Reflection
Aluminum foil reflects additional sunlight onto the bottle, increasing the total energy input.

## Real-World Applications
- Solar water heaters on rooftops
- Solar cooking systems
- Industrial solar heating
- Swimming pool heating
    `,
    extensions: [
      "Compare different bottle colors (black vs. white vs. clear)",
      "Test different covering materials (glass vs. plastic)",
      "Build a larger version for actual hot water use",
      "Add insulation around the box to retain heat longer",
      "Create a solar tracker to follow the sun's movement"
    ],
    assessment: [
      "What role does the black color play in heating?",
      "Why is the plastic covering important?",
      "How does this relate to global warming?",
      "What improvements could make this more efficient?",
      "Where else do we see solar heating in daily life?"
    ],
    relatedTopics: ["Solar Energy in India", "Renewable Energy", "Heat Transfer", "Greenhouse Effect"],
    tags: ["solar", "energy", "renewable", "heat", "experiment"],
    grade: [7, 8, 9, 10],
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z"
  },

  {
    id: 2,
    title: "Rainwater Harvesting Model",
    titleHi: "वर्षा जल संचयन मॉडल",
    slug: "rainwater-harvesting-model",
    category: "water",
    difficulty: "beginner",
    duration: 90,
    ageGroup: "8-14",
    supervision: true,
    description: "Create a working model of rainwater harvesting system to understand water conservation.",
    descriptionHi: "जल संरक्षण को समझने के लिए वर्षा जल संचयन प्रणाली का एक कार्यात्मक मॉडल बनाएं।",
    objectives: [
      "Understand the concept of rainwater harvesting",
      "Learn about water conservation techniques",
      "Observe water flow and collection",
      "Connect with traditional Indian practices"
    ],
    materials: [
      {
        item: "Large plastic container (5L)",
        quantity: 1,
        notes: "Will serve as the main storage tank"
      },
      {
        item: "Small plastic bottles (500ml)",
        quantity: 3,
        notes: "For demonstrating rooftop collection"
      },
      {
        item: "Plastic tubing or straws",
        quantity: "2 meters",
        notes: "For water pipes"
      },
      {
        item: "Fine mesh or cloth",
        quantity: "30cm x 30cm",
        notes: "For filtering debris"
      },
      {
        item: "Gravel/small stones",
        quantity: "1 cup",
        notes: "For filtration layer"
      },
      {
        item: "Sand",
        quantity: "1 cup",
        notes: "For filtration"
      },
      {
        item: "Cotton/cloth pieces",
        quantity: "Few pieces",
        notes: "For additional filtering"
      },
      {
        item: "Cardboard",
        quantity: "50cm x 50cm",
        notes: "For base platform"
      },
      {
        item: "Waterproof tape",
        quantity: "1 roll",
        notes: "For sealing connections"
      },
      {
        item: "Water (colored with food coloring)",
        quantity: "2 liters",
        notes: "To simulate rainwater"
      }
    ],
    safetyGuidelines: [
      "Adult supervision required when cutting plastic",
      "Be careful with sharp edges of cut plastic",
      "Do not drink the water used in the experiment",
      "Ensure all connections are secure to prevent spills",
      "Work on a waterproof surface"
    ],
    procedure: [
      {
        step: 1,
        title: "Create the rooftop",
        instruction: "Cut plastic bottles to create slanted 'rooftops'. Make small holes at the lower end for water drainage.",
        image: "rooftop-creation.jpg",
        tips: ["Ensure proper slope for water flow", "Smooth any sharp edges"]
      },
      {
        step: 2,
        title: "Set up collection pipes",
        instruction: "Connect plastic tubing to the drainage holes. This represents the guttering system that collects rainwater.",
        image: "pipe-connection.jpg",
        tips: ["Seal connections well", "Test for leaks with small amount of water"]
      },
      {
        step: 3,
        title: "Prepare the storage tank",
        instruction: "Cut an opening in the large container lid. This is where the collected water will enter the storage tank.",
        image: "storage-preparation.jpg",
        tips: ["Make opening size appropriate for pipe diameter", "Ensure tight fit"]
      },
      {
        step: 4,
        title: "Create filtration system",
        instruction: "Layer filtration materials in the storage tank: cloth at bottom, then sand, then gravel, then mesh at top.",
        image: "filtration-setup.jpg",
        tips: ["Keep layers separate", "Don't mix materials"]
      },
      {
        step: 5,
        title: "Assemble the system",
        instruction: "Connect all pipes to the storage tank inlet. Position rooftops at different heights on the cardboard base.",
        image: "system-assembly.jpg",
        tips: ["Ensure stable positioning", "Test all connections"]
      },
      {
        step: 6,
        title: "Test the system",
        instruction: "Pour colored water on the 'rooftops' to simulate rainfall. Observe water collection and filtration.",
        image: "system-testing.jpg",
        tips: ["Pour slowly to simulate natural rainfall", "Observe filtration process"]
      }
    ],
    observations: [
      "Amount of water poured: ___ ml",
      "Amount of water collected: ___ ml",
      "Collection efficiency: ____%",
      "Color of filtered water: ___",
      "Time taken for filtration: ___ minutes",
      "Any leakages observed: Yes/No",
      "Quality of filtered water: Clean/Slightly dirty/Dirty"
    ],
    expectedResults: [
      "60-80% of poured water should be collected",
      "Filtered water should be clearer than input",
      "Some water loss due to evaporation and absorption",
      "Filteration should remove visible particles"
    ],
    scientificExplanation: `
## How Rainwater Harvesting Works

### Collection
Rainwater falls on rooftops and is collected through gutters and downpipes. The sloped surface ensures efficient water flow.

### Filtration
Multi-layer filtration removes physical impurities:
1. Mesh removes large debris
2. Gravel removes medium particles
3. Sand removes fine particles
4. Cloth provides final filtering

### Storage
Clean water is stored in tanks for later use. Proper storage prevents contamination and mosquito breeding.

## Benefits
- Reduces dependence on groundwater
- Prevents urban flooding
- Improves groundwater recharge
- Provides water during dry periods

## Traditional Indian Methods
- Stepwells (Baoli) in Rajasthan
- Tank systems in Tamil Nadu
- Kunds in arid regions
- Johads in Rajasthan and Haryana
    `,
    extensions: [
      "Calculate harvesting potential for your school rooftop",
      "Design a first-flush diverter",
      "Test different filtration materials",
      "Build an underground storage model",
      "Create a cost-benefit analysis"
    ],
    assessment: [
      "Why is rainwater harvesting important in India?",
      "What happens to rainwater if not harvested?",
      "How does filtration improve water quality?",
      "What are the traditional methods used in your region?",
      "How can this system be improved?"
    ],
    relatedTopics: ["Water Conservation in India", "Urban Planning", "Traditional Water Systems"],
    tags: ["water", "conservation", "harvesting", "filtration", "sustainability"],
    grade: [6, 7, 8, 9],
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z"
  },

  {
    id: 3,
    title: "Compost Making Experiment",
    titleHi: "खाद बनाने का प्रयोग",
    slug: "compost-making-experiment",
    category: "waste",
    difficulty: "beginner",
    duration: 2160, // 30 days x 72 minutes observation time
    ageGroup: "8-16",
    supervision: false,
    description: "Learn to convert kitchen waste into nutrient-rich compost and understand decomposition process.",
    descriptionHi: "रसोई के कचरे को पोषक तत्वों से भरपूर खाद में बदलना सीखें और अपघटन प्रक्रिया को समझें।",
    objectives: [
      "Understand the decomposition process",
      "Learn about recycling organic waste",
      "Observe microbial activity",
      "Create useful compost for plants"
    ],
    materials: [
      {
        item: "Plastic container with lid (5L)",
        quantity: 1,
        notes: "Should have drainage holes"
      },
      {
        item: "Kitchen waste (vegetable peels, fruit scraps)",
        quantity: "2 cups daily",
        notes: "Avoid meat, dairy, and oily foods"
      },
      {
        item: "Dry leaves or newspaper",
        quantity: "2 cups",
        notes: "Brown/carbon material"
      },
      {
        item: "Garden soil",
        quantity: "1 cup",
        notes: "Contains beneficial microorganisms"
      },
      {
        item: "Water spray bottle",
        quantity: 1,
        notes: "To maintain moisture"
      },
      {
        item: "Gloves",
        quantity: 1,
        notes: "For handling organic matter"
      },
      {
        item: "Small shovel or spoon",
        quantity: 1,
        notes: "For mixing"
      },
      {
        item: "pH strips (optional)",
        quantity: 10,
        notes: "To test compost pH"
      }
    ],
    safetyGuidelines: [
      "Always wear gloves when handling compost",
      "Wash hands thoroughly after handling",
      "Do not add meat, dairy, or pet waste",
      "Keep container away from direct sunlight",
      "Ensure proper ventilation to avoid odors"
    ],
    procedure: [
      {
        step: 1,
        title: "Prepare the container",
        instruction: "Make several small holes in the bottom and sides of the container for drainage and air circulation.",
        image: "container-preparation.jpg",
        tips: ["Holes should be 0.5cm diameter", "Distribute holes evenly"]
      },
      {
        step: 2,
        title: "Create the base layer",
        instruction: "Add a layer of dry leaves or shredded newspaper at the bottom. This provides carbon and improves drainage.",
        image: "base-layer.jpg",
        tips: ["Layer should be 2-3 cm thick", "Mix different brown materials"]
      },
      {
        step: 3,
        title: "Add kitchen waste",
        instruction: "Add kitchen waste (green materials) over the brown layer. Cut into small pieces for faster decomposition.",
        image: "kitchen-waste.jpg",
        tips: ["Smaller pieces decompose faster", "Mix different types of waste"]
      },
      {
        step: 4,
        title: "Add soil layer",
        instruction: "Sprinkle a thin layer of garden soil over the kitchen waste. This introduces beneficial microorganisms.",
        image: "soil-addition.jpg",
        tips: ["Use soil from healthy garden", "Thin layer is sufficient"]
      },
      {
        step: 5,
        title: "Maintain moisture",
        instruction: "Spray water lightly to maintain moisture. The mixture should feel like a wrung-out sponge.",
        image: "moisture-control.jpg",
        tips: ["Not too wet, not too dry", "Check moisture weekly"]
      },
      {
        step: 6,
        title: "Regular maintenance",
        instruction: "Mix the contents weekly, add new waste regularly, and monitor temperature and smell.",
        image: "maintenance.jpg",
        tips: ["Turn contents for air circulation", "Add brown materials if too wet"]
      }
    ],
    observations: [
      "Week 1: Initial appearance and smell: ___",
      "Week 2: Temperature (warm/cool): ___",
      "Week 3: Visible changes: ___",
      "Week 4: Color changes: ___",
      "Week 5: Texture changes: ___",
      "Week 6: Smell description: ___",
      "Week 7: Any insects/worms observed: ___",
      "Week 8: Final compost appearance: ___"
    ],
    weeklyChecklist: [
      "Add kitchen waste (2-3 times per week)",
      "Mix contents thoroughly",
      "Check moisture level",
      "Add brown materials if needed",
      "Record temperature and smell",
      "Look for signs of decomposition"
    ],
    expectedResults: [
      "Initial heating phase (1-2 weeks)",
      "Gradual breakdown of materials",
      "Dark, crumbly texture after 6-8 weeks",
      "Earthy smell when ready",
      "Volume reduction by 50-70%"
    ],
    scientificExplanation: `
## The Composting Process

### Microbial Decomposition
Bacteria, fungi, and other microorganisms break down organic matter into simpler compounds. This process requires:
- Carbon (brown materials like leaves)
- Nitrogen (green materials like kitchen waste)
- Oxygen (through turning and air holes)
- Moisture (40-60% water content)

### Three Phases
1. **Mesophilic Phase**: Moderate temperature, initial breakdown
2. **Thermophilic Phase**: High temperature (50-70°C), pathogen destruction
3. **Curing Phase**: Temperature drops, final decomposition

### Chemical Changes
- Complex organic molecules break into simple compounds
- pH initially drops (acidic) then rises (neutral/alkaline)
- C:N ratio changes from 30:1 to 10:1

## Environmental Benefits
- Reduces landfill waste by 30%
- Prevents methane emissions
- Creates natural fertilizer
- Improves soil health
    `,
    troubleshooting: [
      {
        problem: "Bad smell",
        cause: "Too much moisture or lack of oxygen",
        solution: "Add dry materials and mix more frequently"
      },
      {
        problem: "No decomposition",
        cause: "Too dry or lack of nitrogen",
        solution: "Add water and fresh kitchen waste"
      },
      {
        problem: "Flies or pests",
        cause: "Wrong materials or improper covering",
        solution: "Avoid meat/dairy, bury fresh waste under brown materials"
      }
    ],
    extensions: [
      "Test compost pH and compare with chemical fertilizers",
      "Use finished compost to grow plants and compare with unfertilized soil",
      "Calculate waste reduction percentage",
      "Start vermicomposting with earthworms",
      "Create a school-wide composting program"
    ],
    assessment: [
      "What materials decompose fastest?",
      "Why is the carbon-nitrogen balance important?",
      "How does composting help the environment?",
      "What would happen if we didn't have decomposers?",
      "How can composting be scaled up for cities?"
    ],
    relatedTopics: ["Waste Management", "Soil Health", "Nutrient Cycles", "Sustainable Agriculture"],
    tags: ["composting", "waste", "recycling", "soil", "organic"],
    grade: [6, 7, 8, 9, 10],
    createdAt: "2024-01-15T11:00:00Z",
    updatedAt: "2024-01-15T11:00:00Z"
  }
];

export default experiments;