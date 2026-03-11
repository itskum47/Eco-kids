const FACT_GROUP_KEYS = ['Primary', 'Junior', 'Middle', 'Senior', 'Higher'];

export const GRADE_GROUPS = {
  Primary: {
    name: 'Primary',
    label: 'Grade 1-2',
    shortLabel: 'Primary',
    ageRange: '6-7',
    grades: [1, 2],
  },
  Junior: {
    name: 'Junior',
    label: 'Grade 3-5',
    shortLabel: 'Junior',
    ageRange: '8-10',
    grades: [3, 4, 5],
  },
  Middle: {
    name: 'Middle',
    label: 'Grade 6-8',
    shortLabel: 'Middle',
    ageRange: '11-13',
    grades: [6, 7, 8],
  },
  Senior: {
    name: 'Senior',
    label: 'Grade 9-10',
    shortLabel: 'Senior',
    ageRange: '14-15',
    grades: [9, 10],
  },
  Higher: {
    name: 'Higher',
    label: 'Grade 11-12',
    shortLabel: 'Higher',
    ageRange: '16-17',
    grades: [11, 12],
  },
};

const createFact = (group, index, text, hiText) => ({
  id: `${group.toLowerCase()}-fact-${index + 1}`,
  textKey: `gameHub.education.facts.${group}.${index}`,
  text,
  hiText,
});

const createQuestion = (group, index, prompt, options, correctIndex, explanation) => ({
  id: `${group.toLowerCase()}-question-${index + 1}`,
  promptKey: `gameHub.education.questions.${group}.${index}.prompt`,
  optionsKey: `gameHub.education.questions.${group}.${index}.options`,
  explanationKey: `gameHub.education.questions.${group}.${index}.explanation`,
  prompt,
  options: options.map((option, optionIndex) => ({
    id: `${group.toLowerCase()}-question-${index + 1}-option-${optionIndex + 1}`,
    textKey: `gameHub.education.questions.${group}.${index}.options.${optionIndex}`,
    text: option,
  })),
  correctIndex,
  explanation,
});

const createVocab = (group, index, term, meaning, extra = {}) => ({
  id: `${group.toLowerCase()}-vocab-${index + 1}`,
  termKey: `gameHub.education.vocab.${group}.${index}.term`,
  meaningKey: `gameHub.education.vocab.${group}.${index}.meaning`,
  term,
  meaning,
  ...extra,
});

const rawFacts = {
  Primary: [
    ['Trees give us clean air to breathe 🌳', 'पेड़ हमें सांस लेने के लिए स्वच्छ हवा देते हैं 🌳'],
    ['Water is precious - always turn off the tap! 💧', 'पानी बहुत कीमती है - नल हमेशा बंद करें! 💧'],
    ['Plants need sunlight, water, and soil to grow 🌱', 'पौधों को बढ़ने के लिए धूप, पानी और मिट्टी चाहिए 🌱'],
    ['Birds eat insects and help our gardens 🐦', 'पक्षी कीड़े खाते हैं और हमारे बगीचों की मदद करते हैं 🐦'],
    ['The Sun gives us light and warmth every day ☀️', 'सूरज हमें हर दिन रोशनी और गर्मी देता है ☀️'],
    ['Flowers help bees make honey 🐝', 'फूल मधुमक्खियों को शहद बनाने में मदद करते हैं 🐝'],
    ['Rain fills our rivers and lakes 🌧️', 'बारिश हमारी नदियों और झीलों को भरती है 🌧️'],
    ['Cows, goats and hens are farm animals 🐄', 'गाय, बकरी और मुर्गियां खेत के जानवर हैं 🐄'],
    ['We should not throw trash on the road 🚯', 'हमें सड़क पर कचरा नहीं फेंकना चाहिए 🚯'],
    ['Recycling means using things again ♻️', 'रीसाइक्लिंग का मतलब चीजों को फिर से उपयोग करना है ♻️'],
    ['Sea turtles live in the ocean 🐢', 'समुद्री कछुए समुद्र में रहते हैं 🐢'],
    ['Forests are homes for many animals 🦁', 'जंगल कई जानवरों के घर होते हैं 🦁'],
    ['We get fruits and vegetables from plants 🥦', 'हमें फल और सब्जियां पौधों से मिलती हैं 🥦'],
    ['Butterflies help flowers grow by carrying pollen 🦋', 'तितलियां पराग ले जाकर फूलों को बढ़ने में मदद करती हैं 🦋'],
    ['Planting a tree is a gift to the earth 🌲', 'एक पेड़ लगाना धरती को दिया गया उपहार है 🌲'],
  ],
  Junior: [
    ['India has over 45,000 species of plants - one of the most diverse countries on Earth 🌍', 'भारत में 45,000 से अधिक पौधों की प्रजातियां हैं - यह पृथ्वी के सबसे विविध देशों में से एक है 🌍'],
    ['The Ganga is India\'s longest river and provides water to over 500 million people 🏞️', 'गंगा भारत की सबसे लंबी नदी है और 50 करोड़ से अधिक लोगों को पानी देती है 🏞️'],
    ['Solar energy comes from the sun and does not pollute the air ☀️', 'सौर ऊर्जा सूरज से आती है और हवा को प्रदूषित नहीं करती ☀️'],
    ['Rainforests cover only 6% of Earth but are home to more than half of all species 🌿', 'वर्षावन पृथ्वी के केवल 6% भाग में हैं, लेकिन आधी से अधिक प्रजातियों का घर हैं 🌿'],
    ['Every year, India plants millions of trees on Van Mahotsav Day 🌳', 'हर साल भारत वन महोत्सव पर लाखों पेड़ लगाता है 🌳'],
    ['Plastic takes over 400 years to break down in the environment 🚯', 'प्लास्टिक को पर्यावरण में टूटने में 400 साल से अधिक लगते हैं 🚯'],
    ['The Western Ghats are one of the world\'s 8 hottest hotspots of biodiversity 🦜', 'पश्चिमी घाट दुनिया के 8 सबसे महत्वपूर्ण जैव विविधता हॉटस्पॉट में से एक हैं 🦜'],
    ['India gets about 70% of its rainfall during the monsoon season ☔', 'भारत को लगभग 70% वर्षा मानसून के दौरान मिलती है ☔'],
    ['Bees pollinate one-third of our food crops and help farms grow 🐝', 'मधुमक्खियां हमारी एक-तिहाई खाद्य फसलों का परागण करती हैं और खेतों की मदद करती हैं 🐝'],
    ['The Bengal Tiger is India\'s national animal and is endangered 🐯', 'बंगाल टाइगर भारत का राष्ट्रीय पशु है और संकटग्रस्त है 🐯'],
    ['Composting kitchen waste creates natural fertilizer for plants ♻️', 'रसोई के कचरे से खाद बनती है जो पौधों के लिए प्राकृतिक उर्वरक है ♻️'],
    ['Oceans cover 71% of Earth and make about half the oxygen we breathe 🌊', 'महासागर पृथ्वी के 71% भाग को ढकते हैं और हमारी आधी सांस की ऑक्सीजन बनाते हैं 🌊'],
    ['India has 18 Biosphere Reserves to protect nature 🏕️', 'प्रकृति की रक्षा के लिए भारत में 18 बायोस्फीयर रिज़र्व हैं 🏕️'],
    ['Wind energy uses moving air to generate electricity with no pollution 💨', 'पवन ऊर्जा चलती हवा से बिना प्रदूषण बिजली बनाती है 💨'],
    ['Deforestation can cause floods because trees hold soil and absorb rainwater 🌧️', 'वन कटाई से बाढ़ आ सकती है क्योंकि पेड़ मिट्टी को पकड़े रखते हैं और वर्षा का पानी सोखते हैं 🌧️'],
  ],
  Middle: [
    ['India is home to 7-8% of all recorded species on Earth despite covering only 2.4% of the land area 🌏', 'भारत केवल 2.4% भूमि क्षेत्र घेरता है, फिर भी पृथ्वी की 7-8% दर्ज प्रजातियों का घर है 🌏'],
    ['The Sundarbans mangrove forest in India and Bangladesh is the largest in the world and home to Royal Bengal Tigers 🐯', 'भारत और बांग्लादेश का सुंदरबन मैंग्रोव वन दुनिया का सबसे बड़ा है और रॉयल बंगाल टाइगर का घर है 🐯'],
    ['India installed over 70 GW of renewable energy capacity by 2023 - fourth largest in the world ⚡', '2023 तक भारत ने 70 गीगावाट से अधिक नवीकरणीय ऊर्जा क्षमता स्थापित की - दुनिया में चौथा स्थान ⚡'],
    ['The Chipko Movement of 1973 in Uttarakhand was one of India\'s first major environmental protests 🌲', '1973 का उत्तराखंड का चिपको आंदोलन भारत के शुरुआती बड़े पर्यावरण आंदोलनों में से एक था 🌲'],
    ['India generates about 26,000 tonnes of plastic waste every day and a large share remains uncollected 🗑️', 'भारत हर दिन लगभग 26,000 टन प्लास्टिक कचरा पैदा करता है और उसका बड़ा हिस्सा बिना संग्रहित रह जाता है 🗑️'],
    ['The Great Indian Bustard in Rajasthan has fewer than 150 birds left in the wild 🦅', 'राजस्थान का ग्रेट इंडियन बस्टर्ड अब जंगली अवस्था में 150 से भी कम बचा है 🦅'],
    ['India\'s National Action Plan on Climate Change has eight missions including Solar, Water, and Green India 📋', 'भारत की राष्ट्रीय जलवायु परिवर्तन कार्य योजना में सौर, जल और ग्रीन इंडिया सहित आठ मिशन हैं 📋'],
    ['One tree can absorb about 22 kg of carbon dioxide in a year and support breathable air 🌳', 'एक पेड़ साल में लगभग 22 किलोग्राम कार्बन डाइऑक्साइड सोख सकता है और सांस लेने योग्य हवा में मदद करता है 🌳'],
    ['Himalayan glaciers are melting faster because of climate change ❄️', 'जलवायु परिवर्तन के कारण हिमालयी हिमनद तेजी से पिघल रहे हैं ❄️'],
    ['India is the third largest emitter of greenhouse gases, but its per-capita emissions are still low 📊', 'भारत ग्रीनहाउस गैस उत्सर्जन में तीसरे स्थान पर है, लेकिन प्रति व्यक्ति उत्सर्जन अभी भी कम है 📊'],
    ['Project Tiger, launched in 1973, helped tiger numbers rise to over 3,000 by 2022 🐅', '1973 में शुरू हुई प्रोजेक्ट टाइगर योजना से 2022 तक बाघों की संख्या 3,000 से अधिक हुई 🐅'],
    ['Urban heat islands make cities 2-3°C hotter than surrounding rural areas 🌡️', 'अर्बन हीट आइलैंड प्रभाव शहरों को आसपास के ग्रामीण क्षेत्रों से 2-3°C अधिक गर्म बनाता है 🌡️'],
    ['India\'s rivers support 1.4 billion people, but around 70% of surface water is polluted 💧', 'भारत की नदियां 1.4 अरब लोगों का सहारा हैं, लेकिन लगभग 70% सतही जल प्रदूषित है 💧'],
    ['The Aravalli Range is one of the oldest mountain systems and helps stop desert spread 🏔️', 'अरावली पर्वतमाला दुनिया की सबसे पुरानी पर्वत श्रंखलाओं में से एक है और रेगिस्तान फैलने से रोकती है 🏔️'],
    ['Electronic waste contains toxic metals like lead and mercury that can poison soil and groundwater ⚠️', 'ई-कचरे में सीसा और पारा जैसे विषैले धातु होते हैं जो मिट्टी और भूजल को जहरीला बना सकते हैं ⚠️'],
  ],
  Senior: [
    ['India committed to achieving Net Zero carbon emissions by 2070 at COP26 in Glasgow 🌐', 'भारत ने ग्लासगो के COP26 में 2070 तक नेट ज़ीरो कार्बन उत्सर्जन का लक्ष्य घोषित किया 🌐'],
    ['The carbon cycle, nitrogen cycle, and water cycle are interconnected - disrupting one affects the others 🔄', 'कार्बन, नाइट्रोजन और जल चक्र आपस में जुड़े हैं - एक में बदलाव बाकी पर असर डालता है 🔄'],
    ['India\'s climate targets aim for 50% electric power capacity from non-fossil sources by 2030 ⚡', 'भारत के जलवायु लक्ष्यों का उद्देश्य 2030 तक 50% विद्युत क्षमता गैर-जीवाश्म स्रोतों से पाना है ⚡'],
    ['Eutrophication happens when fertilizer runoff causes algae blooms that reduce oxygen in water 🔬', 'यूट्रोफिकेशन तब होता है जब उर्वरक का बहाव शैवाल वृद्धि बढ़ाता है और पानी में ऑक्सीजन घटती है 🔬'],
    ['The Biological Diversity Act 2002 guides conservation, sustainable use, and benefit-sharing in India 📜', 'जैव विविधता अधिनियम 2002 भारत में संरक्षण, सतत उपयोग और लाभ-साझेदारी का मार्गदर्शन करता है 📜'],
    ['Per capita water availability in India has fallen sharply since 1951 📉', '1951 के बाद से भारत में प्रति व्यक्ति जल उपलब्धता तेज़ी से घटी है 📉'],
    ['The Environment Protection Act 1986 was passed after the Bhopal Gas Tragedy ⚖️', 'भोपाल गैस त्रासदी के बाद पर्यावरण संरक्षण अधिनियम 1986 पारित किया गया ⚖️'],
    ['Soil erosion makes India lose billions of tonnes of topsoil every year 🌍', 'मृदा अपरदन के कारण भारत हर साल अरबों टन उपजाऊ मिट्टी खो देता है 🌍'],
    ['Coral bleaching starts when sea temperatures rise just 1-2°C above normal 🪸', 'जब समुद्री तापमान सामान्य से केवल 1-2°C बढ़ता है, तब कोरल ब्लीचिंग शुरू हो सकती है 🪸'],
    ['India\'s GRIHA system rates how sustainable a building is 🏢', 'भारत की GRIHA प्रणाली यह मापती है कि कोई भवन कितना टिकाऊ है 🏢'],
    ['Food systems contribute a large share of greenhouse gas emissions, so diet choices matter 🥗', 'खाद्य प्रणालियां ग्रीनहाउस गैस उत्सर्जन का बड़ा हिस्सा बनाती हैं, इसलिए भोजन विकल्प महत्वपूर्ण हैं 🥗'],
    ['Wetlands cover 4.6% of India\'s area and support thousands of species 🦢', 'आर्द्रभूमि भारत के 4.6% क्षेत्र को ढकती हैं और हजारों प्रजातियों का सहारा हैं 🦢'],
    ['The Paris Agreement seeks to limit warming close to 1.5°C above pre-industrial levels 🌡️', 'पेरिस समझौता तापमान वृद्धि को औद्योगिक-पूर्व स्तर से 1.5°C के करीब सीमित करना चाहता है 🌡️'],
    ['India is among the world leaders in installed wind energy capacity 💨', 'भारत स्थापित पवन ऊर्जा क्षमता में दुनिया के अग्रणी देशों में है 💨'],
    ['Phytoremediation uses plants to remove contaminants from polluted soil and water 🌱', 'फाइटोरेमेडिएशन प्रदूषित मिट्टी और पानी से प्रदूषक हटाने के लिए पौधों का उपयोग करता है 🌱'],
  ],
  Higher: [
    ['The IPCC Sixth Assessment Report warns that warming beyond 1.5°C risks irreversible climate tipping points 📄', 'IPCC की छठी आकलन रिपोर्ट चेतावनी देती है कि 1.5°C से अधिक ताप वृद्धि अपरिवर्तनीय मोड़ बिंदुओं का जोखिम बढ़ाती है 📄'],
    ['India\'s Perform, Achieve and Trade scheme has delivered major industrial energy savings since 2012 🏭', 'भारत की Perform, Achieve and Trade योजना ने 2012 से उद्योगों में बड़ी ऊर्जा बचत कराई है 🏭'],
    ['Ecosystem services such as pollination, water purification, and soil fertility have immense economic value 💰', 'परागण, जल शुद्धिकरण और मिट्टी की उर्वरता जैसी पारिस्थितिकी सेवाओं का आर्थिक मूल्य बहुत बड़ा है 💰'],
    ['India\'s Coastal Regulation Zone rules protect 7,516 km of coastline from unchecked development 🏖️', 'भारत के तटीय विनियमन क्षेत्र नियम 7,516 किमी तटरेखा को अनियंत्रित विकास से बचाते हैं 🏖️'],
    ['Carbon sequestration in forests, soils, and oceans helps remove carbon dioxide from the atmosphere 🌳', 'जंगल, मिट्टी और महासागर में कार्बन अवशोषण वायुमंडल से कार्बन डाइऑक्साइड हटाने में मदद करता है 🌳'],
    ['Green Hydrogen is produced using electrolysis powered by renewable energy 🔬', 'ग्रीन हाइड्रोजन नवीकरणीय ऊर्जा से चलने वाली इलेक्ट्रोलिसिस प्रक्रिया से बनती है 🔬'],
    ['Planetary boundaries describe nine Earth-system limits for safe human development 🌏', 'प्लैनेटरी बाउंड्रीज़ पृथ्वी-तंत्र की नौ सीमाओं को बताती हैं जिनके भीतर मानव विकास सुरक्षित माना जाता है 🌏'],
    ['India\'s National Solar Mission and the International Solar Alliance promote rapid solar expansion ☀️', 'भारत का राष्ट्रीय सौर मिशन और अंतरराष्ट्रीय सौर गठबंधन तेज़ सौर विस्तार को बढ़ावा देते हैं ☀️'],
    ['A circular economy keeps materials in use through reuse, repair, remanufacture, and recycling ♻️', 'सर्कुलर इकोनॉमी पुन: उपयोग, मरम्मत, पुनर्निर्माण और रीसाइक्लिंग से सामग्री को उपयोग में बनाए रखती है ♻️'],
    ['The Kunming-Montreal biodiversity framework aims to protect 30% of land and oceans by 2030 🌿', 'कुनमिंग-मॉन्ट्रियल जैव विविधता ढांचा 2030 तक भूमि और महासागरों के 30% संरक्षण का लक्ष्य रखता है 🌿'],
    ['Life Cycle Assessment tracks a product\'s environmental footprint from extraction to disposal 📊', 'लाइफ साइकिल असेसमेंट किसी उत्पाद के पर्यावरणीय प्रभाव को कच्चे माल से निपटान तक मापता है 📊'],
    ['India\'s Extended Producer Responsibility rules make producers answerable for end-of-life waste 📦', 'भारत के Extended Producer Responsibility नियम उत्पादकों को जीवन-चक्र के अंत वाले कचरे के लिए जिम्मेदार बनाते हैं 📦'],
    ['Agroforestry can improve farm resilience, boost yield, and store more carbon in landscapes 🌾', 'एग्रोफॉरेस्ट्री खेती की स्थिरता बढ़ा सकती है, उपज सुधार सकती है और अधिक कार्बन संचित कर सकती है 🌾'],
    ['Air quality remains one of India\'s biggest environmental performance challenges 📉', 'वायु गुणवत्ता भारत की सबसे बड़ी पर्यावरणीय चुनौतियों में से एक बनी हुई है 📉'],
    ['Environmental Impact Assessment is mandatory in India for many major projects before construction 🏗️', 'भारत में निर्माण से पहले कई बड़े प्रोजेक्ट के लिए पर्यावरण प्रभाव आकलन अनिवार्य है 🏗️'],
  ],
};

const rawQuestions = {
  Primary: [
    ['What do trees give us?', ['🌬️ Clean air', '🍕 Pizza', '🚗 Cars'], 0, 'Trees help clean the air and give us oxygen.'],
    ['What colour is a healthy leaf?', ['🟤 Brown', '🟢 Green', '🔵 Blue'], 1, 'Most healthy leaves are green because they contain chlorophyll.'],
    ['Which animal helps flowers grow?', ['🐝 Bee', '🐟 Fish', '🐘 Elephant'], 0, 'Bees carry pollen from flower to flower.'],
    ['What should we do with trash?', ['🗑️ Put in bin', '🌊 Throw in river', '🔥 Burn it'], 0, 'Putting trash in a bin keeps roads and water clean.'],
    ['Where do fish live?', ['🌲 Forest', '💧 Water', '☁️ Sky'], 1, 'Fish live in ponds, lakes, rivers, and oceans.'],
    ['What does the sun give us?', ['☀️ Light and warmth', '🌧️ Rain', '❄️ Snow'], 0, 'The sun gives Earth light and heat.'],
    ['Which is a way to save water?', ['🚿 Short shower', '🛁 Leave tap running', '💦 Flood the garden'], 0, 'Using less water helps save this precious resource.'],
    ['What animal is India\'s national animal?', ['🐯 Tiger', '🦁 Lion', '🐘 Elephant'], 0, 'The Bengal Tiger is India\'s national animal.'],
    ['What do plants need to grow?', ['☀️ Sun, water, soil', '📺 TV', '🍔 Burgers'], 0, 'Plants need sunlight, water, air, and soil nutrients.'],
    ['What is recycling?', ['Using things again', 'Throwing things away', 'Burning things'], 0, 'Recycling turns used materials into something useful again.'],
    ['Where should paper go?', ['♻️ Recycle bin', '🛣️ Road', '🌊 River'], 0, 'Clean paper can usually be recycled.'],
    ['Which one is a plant?', ['🌱 Tulsi', '🚕 Taxi', '📱 Phone'], 0, 'Tulsi is a plant often grown at home in India.'],
    ['What falls from clouds?', ['🌧️ Rain', '🍫 Chocolate', '🧸 Toys'], 0, 'Clouds bring rain that fills rivers and ponds.'],
    ['Which place is home for many animals?', ['🌲 Forest', '🏢 Office', '🚗 Parking lot'], 0, 'Forests provide food and shelter for wildlife.'],
    ['What do we plant to help Earth?', ['🌳 Tree', '🧱 Brick', '🪑 Chair'], 0, 'Planting trees helps air, soil, and animals.'],
  ],
  Junior: [
    ['What is the national river of India?', ['Yamuna', 'Ganga', 'Brahmaputra', 'Cauvery'], 1, 'The Ganga is recognised as India\'s national river.'],
    ['How long does plastic take to decompose?', ['10 years', '50 years', '400+ years', '1 year'], 2, 'Plastic can stay in the environment for hundreds of years.'],
    ['Which energy source comes from the sun?', ['Coal', 'Solar', 'Nuclear', 'Natural gas'], 1, 'Solar energy is captured from sunlight.'],
    ['What does WWF stand for?', ['World Wildlife Fund', 'World Water Fund', 'World War Fund', 'World Wind Farm'], 0, 'WWF works to protect nature and wildlife.'],
    ['Which gas do plants absorb from air?', ['Oxygen', 'Nitrogen', 'Carbon dioxide', 'Hydrogen'], 2, 'Plants take in carbon dioxide for photosynthesis.'],
    ['What is the name for the layer protecting Earth from UV rays?', ['Atmosphere', 'Ozone layer', 'Stratosphere', 'Troposphere'], 1, 'The ozone layer blocks much of the Sun\'s harmful UV radiation.'],
    ['Where is the Sundarbans forest located?', ['Rajasthan', 'West Bengal and Bangladesh', 'Kerala', 'Assam'], 1, 'The Sundarbans spread across West Bengal and Bangladesh.'],
    ['Which of these is a renewable energy source?', ['Coal', 'Petroleum', 'Wind', 'Natural gas'], 2, 'Wind is a renewable source because nature keeps replacing it.'],
    ['What does deforestation cause?', ['More rain', 'Floods and droughts', 'More animals', 'Cleaner air'], 1, 'Cutting forests can increase floods, droughts, and soil loss.'],
    ['India\'s national bird is?', ['Sparrow', 'Eagle', 'Peacock', 'Parrot'], 2, 'The Indian Peacock is the national bird.'],
    ['Which waste turns into compost?', ['Banana peel', 'Plastic wrapper', 'Battery', 'Glass jar'], 0, 'Kitchen peels break down into compost.'],
    ['What do bees help make possible?', ['Pollination', 'Mining', 'Traffic', 'Painting'], 0, 'Bees pollinate flowers and crops.'],
    ['Which season brings most rain to India?', ['Winter', 'Monsoon', 'Spring', 'Autumn'], 1, 'Most of India\'s annual rainfall comes during the monsoon.'],
    ['Which place is famous for rich biodiversity in India?', ['Western Ghats', 'Thar road', 'Delhi Metro', 'Salt pan only'], 0, 'The Western Ghats are a biodiversity hotspot.'],
    ['What should you carry to avoid single-use plastic?', ['Cloth bag', 'Firecracker', 'Stone', 'Plastic straw'], 0, 'A cloth bag helps reduce plastic waste.'],
  ],
  Middle: [
    ['What percentage of Earth\'s surface is covered by oceans?', ['51%', '61%', '71%', '81%'], 2, 'Oceans cover about 71% of Earth\'s surface.'],
    ['India\'s Project Tiger was launched in which year?', ['1965', '1973', '1980', '1992'], 1, 'Project Tiger began in 1973.'],
    ['Which Indian state has the highest forest cover area?', ['Kerala', 'Uttarakhand', 'Madhya Pradesh', 'Arunachal Pradesh'], 2, 'Madhya Pradesh has the largest forest area in India.'],
    ['What is the main greenhouse gas discussed in climate studies?', ['Methane', 'Carbon dioxide', 'Nitrous oxide', 'CFCs'], 1, 'Carbon dioxide is the most discussed greenhouse gas in school climate science.'],
    ['The Chipko Movement was associated with saving?', ['Rivers', 'Wildlife', 'Trees', 'Wetlands'], 2, 'Villagers hugged trees to stop logging.'],
    ['India was ranked what in installed solar capacity globally in 2023?', ['1st', '2nd', '3rd', '4th'], 3, 'India was among the top four countries in solar capacity.'],
    ['What is eutrophication?', ['A type of soil', 'Algae bloom due to excess nutrients', 'A tree disease', 'Type of pollution-free water'], 1, 'Nutrient-rich runoff can trigger algae blooms and oxygen loss.'],
    ['Which of these is biodegradable?', ['Plastic bottle', 'Thermocol', 'Banana peel', 'Glass'], 2, 'Organic materials such as banana peels decompose naturally.'],
    ['The Silent Valley National Park is in which state?', ['Tamil Nadu', 'Karnataka', 'Kerala', 'Goa'], 2, 'Silent Valley National Park is in Kerala.'],
    ['How much of India\'s surface water is estimated to be polluted?', ['20%', '40%', '50%', '70%'], 3, 'A large share of India\'s surface water is polluted and needs treatment.'],
    ['What is an urban heat island?', ['A cool forest patch', 'A city that stays hotter than nearby rural areas', 'An island in the sea', 'A glacier'], 1, 'Concrete and fewer trees can trap heat in cities.'],
    ['Why are mangroves important?', ['They increase plastic waste', 'They protect coasts and support biodiversity', 'They stop monsoon rains', 'They grow only in deserts'], 1, 'Mangroves protect shorelines and shelter many species.'],
    ['What is e-waste?', ['Food waste', 'Electronic waste', 'Leaf litter', 'Rainwater'], 1, 'Old phones, wires, and computers are e-waste.'],
    ['Why do glaciers matter in India?', ['They decorate mountains', 'They store freshwater for rivers', 'They make sand', 'They stop windmills'], 1, 'Himalayan glaciers feed many rivers used by millions of people.'],
    ['Which range helps check desert expansion in north-west India?', ['Vindhya', 'Nilgiri', 'Aravalli', 'Satpura'], 2, 'The Aravalli Range acts as a natural barrier against desertification.'],
  ],
  Senior: [
    ['India\'s Net Zero target year is?', ['2050', '2060', '2070', '2080'], 2, 'India announced a Net Zero target year of 2070.'],
    ['The Environment Protection Act in India was passed in?', ['1972', '1980', '1986', '1992'], 2, 'The Act was passed in 1986.'],
    ['What does COP stand for?', ['Conference of Parties', 'Council of Pollution', 'Committee on Pollution', 'Carbon Output Protocol'], 0, 'COP refers to the Conference of the Parties to the climate convention.'],
    ['The Paris Agreement aims to limit warming to?', ['2.5°C', '2°C', '1.5°C', '1°C'], 2, 'The 1.5°C goal guides global climate ambition.'],
    ['What is the main cause of ozone depletion?', ['CO₂', 'CFCs', 'Methane', 'Nitrous oxide'], 1, 'CFCs damage ozone molecules in the stratosphere.'],
    ['Biological Diversity Act was passed in India in?', ['1986', '1992', '2002', '2010'], 2, 'The Biological Diversity Act came into force in 2002.'],
    ['What is the GRIHA rating system for?', ['Rivers', 'Green buildings', 'Forests', 'Air quality'], 1, 'GRIHA rates environmental performance of buildings.'],
    ['Which sector contributes the largest share to India\'s greenhouse gas emissions?', ['Agriculture', 'Transport', 'Energy', 'Industry'], 2, 'The energy sector contributes the largest share.'],
    ['What does EIA stand for?', ['Environmental Impact Assessment', 'Energy Impact Analysis', 'Ecological Index Assessment', 'Environmental Integration Act'], 0, 'EIA reviews environmental risks before projects proceed.'],
    ['India\'s coastline is approximately?', ['4,000 km', '5,500 km', '7,516 km', '9,000 km'], 2, 'India\'s coastline is about 7,516 km long.'],
    ['What causes eutrophication in lakes?', ['Extra nutrients from runoff', 'Too many rocks', 'Lack of sunlight only', 'No fish'], 0, 'Fertilizer and sewage runoff add excess nutrients to water bodies.'],
    ['Which law followed the Bhopal disaster and strengthened environmental governance?', ['Forest Act', 'Environment Protection Act', 'Water Act', 'Wildlife Act'], 1, 'The Environment Protection Act 1986 followed the Bhopal disaster.'],
    ['What does per capita water availability measure?', ['Rainfall in one district', 'Water available per person', 'Ocean depth', 'Water price'], 1, 'It estimates how much water is available for each person.'],
    ['Why is phytoremediation useful?', ['It increases mining', 'It uses plants to remove contaminants', 'It adds plastic to soil', 'It blocks sunlight'], 1, 'Some plants absorb pollutants from soil and water.'],
    ['Which agreement guides global climate action after 2015?', ['Kyoto only', 'Paris Agreement', 'Montreal Protocol', 'Basel Convention'], 1, 'The Paris Agreement is the major climate accord adopted in 2015.'],
  ],
  Higher: [
    ['What does the PAT scheme stand for?', ['Perform, Achieve and Trade', 'Pollutant Assessment Test', 'Power and Technology', 'Production and Trade'], 0, 'PAT is a market-based energy efficiency scheme for industry.'],
    ['India\'s climate target aims for what percentage of power capacity from non-fossil sources by 2030?', ['40%', '50%', '60%', '70%'], 1, 'India\'s target is 50% power capacity from non-fossil sources.'],
    ['Kunming-Montreal framework targets protecting what percentage of land and ocean by 2030?', ['20%', '25%', '30%', '40%'], 2, 'The target is commonly called 30 by 30.'],
    ['Green Hydrogen is produced by?', ['Burning biomass', 'Electrolysis using renewable energy', 'Coal gasification', 'Nuclear fission'], 1, 'Electrolysis splits water using electricity from clean sources.'],
    ['What is Life Cycle Assessment?', ['Animal lifespan study', 'Total environmental impact from production to disposal', 'Water usage audit', 'Carbon footprint only'], 1, 'LCA evaluates impact across a product\'s full life cycle.'],
    ['India\'s rank in Environmental Performance Index 2022 was?', ['150th', '160th', '170th', '180th'], 3, 'India ranked 180th in the 2022 EPI.'],
    ['Which Indian scheme saves energy through market mechanisms?', ['NAPCC', 'INDC', 'PAT', 'CRZ'], 2, 'PAT rewards industries that overachieve energy-saving targets.'],
    ['What is the estimated annual value of global ecosystem services?', ['$50 trillion', '$75 trillion', '$100 trillion', '$125 trillion'], 3, 'Ecosystem services are often valued at around $125 trillion annually.'],
    ['Extended Producer Responsibility (EPR) holds who responsible?', ['Consumers', 'Government', 'Manufacturers', 'Retailers'], 2, 'EPR makes producers responsible for end-of-life waste management.'],
    ['Agroforestry primarily helps with?', ['Urban development', 'Carbon sequestration and crop yield', 'Fishing', 'Mining'], 1, 'Trees on farms can improve soil, resilience, and carbon storage.'],
    ['What are planetary boundaries?', ['Only political borders', 'Nine Earth-system limits for safe human operation', 'Forest district maps', 'River basin records'], 1, 'Planetary boundaries define safe operating limits for humanity.'],
    ['Why is circular economy important?', ['It increases waste', 'It keeps materials in use and reduces extraction', 'It ends recycling', 'It replaces science'], 1, 'Circular systems reduce waste by designing for reuse and recovery.'],
    ['What is greenwashing?', ['Tree planting only', 'Misleading environmental claims', 'A water-saving method', 'A type of renewable energy'], 1, 'Greenwashing makes products or companies seem more sustainable than they are.'],
    ['Which document gives the latest scientific consensus on climate risks?', ['IPCC assessment reports', 'A city brochure', 'A product label', 'A tourist map'], 0, 'IPCC reports synthesise current climate science.'],
    ['Why is EIA important before construction?', ['It raises project cost only', 'It checks environmental risks and mitigation', 'It replaces engineering', 'It bans all development'], 1, 'EIA helps identify and manage project impacts before approval.'],
  ],
};

const rawVocab = {
  Primary: [
    ['Tree', 'पेड़', { emoji: '🌳' }],
    ['Water', 'पानी', { emoji: '💧' }],
    ['Sun', 'सूरज', { emoji: '☀️' }],
    ['Flower', 'फूल', { emoji: '🌸' }],
    ['Bird', 'पक्षी', { emoji: '🐦' }],
    ['Leaf', 'पत्ता', { emoji: '🍃' }],
    ['Fish', 'मछली', { emoji: '🐟' }],
    ['Rain', 'बारिश', { emoji: '🌧️' }],
    ['Soil', 'मिट्टी', { emoji: '🟫' }],
    ['Seed', 'बीज', { emoji: '🌱' }],
    ['Bee', 'मधुमक्खी', { emoji: '🐝' }],
    ['River', 'नदी', { emoji: '🏞️' }],
    ['Forest', 'जंगल', { emoji: '🌲' }],
    ['Recycle', 'दोबारा उपयोग', { emoji: '♻️' }],
    ['Turtle', 'कछुआ', { emoji: '🐢' }],
  ],
  Junior: [
    ['Pollution', 'प्रदूषण'],
    ['Recycle', 'पुनर्चक्रण'],
    ['Solar', 'सौर'],
    ['Compost', 'खाद'],
    ['Ecosystem', 'पारिस्थितिकी तंत्र'],
    ['Biodiversity', 'जैव विविधता'],
    ['Drought', 'सूखा'],
    ['Monsoon', 'मानसून'],
    ['Wetland', 'आर्द्रभूमि'],
    ['Deforestation', 'वनों की कटाई'],
    ['Habitat', 'आवास'],
    ['Wildlife', 'वन्यजीव'],
    ['River basin', 'नदी बेसिन'],
    ['Wind energy', 'पवन ऊर्जा'],
    ['Conservation', 'संरक्षण'],
  ],
  Middle: [
    ['Photosynthesis', 'How plants make food using sunlight'],
    ['Carbon footprint', 'The total greenhouse gases caused by a person or activity'],
    ['Greenhouse gas', 'A gas that traps heat in the atmosphere'],
    ['Biodegradable', 'Able to decompose naturally'],
    ['Eutrophication', 'Algae growth caused by too many nutrients in water'],
    ['Sustainable', 'Using resources in a way that lasts for the future'],
    ['Conservation', 'Protection of natural resources'],
    ['Renewable', 'A resource that can be replaced naturally'],
    ['Habitat', 'The natural home of an organism'],
    ['Emission', 'Something released into the environment, often gases'],
    ['Mangrove', 'A salt-tolerant coastal tree ecosystem'],
    ['Watershed', 'An area where water drains to the same river or lake'],
    ['Glacier', 'A large mass of slowly moving ice'],
    ['Urban heat island', 'A city area hotter than nearby rural land'],
    ['E-waste', 'Discarded electronic products'],
  ],
  Senior: [
    ['Carbon sequestration', 'Storage of carbon in forests, soils, or oceans'],
    ['Ecosystem services', 'Benefits humans get from nature'],
    ['Eutrophication', 'Oxygen loss in water caused by excess nutrients'],
    ['Phytoremediation', 'Using plants to clean polluted soil or water'],
    ['Biosphere', 'The zone of life on Earth'],
    ['IPCC', 'The UN body that assesses climate science'],
    ['NDC', 'National climate targets under the Paris Agreement'],
    ['CRZ', 'Coastal Regulation Zone rules for India'],
    ['EPR', 'Producer responsibility for post-use waste'],
    ['EIA', 'Assessment of project environmental impacts'],
    ['Mitigation', 'Actions that reduce climate change causes'],
    ['Adaptation', 'Changes that help societies cope with climate impacts'],
    ['Aquifer', 'Underground layer that stores water'],
    ['Topsoil', 'The upper fertile layer of soil'],
    ['GRIHA', 'India\'s green building rating framework'],
  ],
  Higher: [
    ['Anthropocene', 'A proposed epoch shaped strongly by human activity'],
    ['Tipping point', 'A threshold after which change becomes hard to reverse'],
    ['Circular economy', 'An economy designed to eliminate waste and reuse materials'],
    ['Net zero', 'Balancing emissions released with emissions removed'],
    ['Life cycle assessment', 'Analysis of environmental impact from raw material to disposal'],
    ['Planetary boundaries', 'Nine limits that define a safe operating space for humanity'],
    ['Carbon credit', 'A tradeable unit representing one tonne of carbon reduced or removed'],
    ['Greenwashing', 'Misleading claims about environmental performance'],
    ['Biomimicry', 'Design inspired by natural systems'],
    ['Geoengineering', 'Large-scale technological intervention in Earth systems'],
    ['Just transition', 'A fair shift to low-carbon systems for workers and communities'],
    ['Decarbonisation', 'Reducing carbon emissions from an economy or sector'],
    ['Resilience', 'Capacity of systems to recover from shocks'],
    ['Nature-based solutions', 'Actions that work with ecosystems to solve human challenges'],
    ['Materiality', 'The environmental issues most relevant to a product or organisation'],
  ],
};

export const GRADE_CONTENT = FACT_GROUP_KEYS.reduce((accumulator, group) => {
  accumulator[group] = {
    facts: rawFacts[group].map(([text, hiText], index) => createFact(group, index, text, hiText)),
    questions: rawQuestions[group].map(([prompt, options, correctIndex, explanation], index) =>
      createQuestion(group, index, prompt, options, correctIndex, explanation)
    ),
    vocab: rawVocab[group].map(([term, meaning, extra], index) => createVocab(group, index, term, meaning, extra)),
  };

  return accumulator;
}, {});

export const parseGrade = (grade) => {
  if (typeof grade === 'number' && Number.isFinite(grade)) {
    return grade;
  }

  if (typeof grade === 'string') {
    const match = grade.match(/\d+/);
    if (match) {
      return Number.parseInt(match[0], 10);
    }
  }

  return null;
};

export const getGradeGroup = (grade) => {
  const parsedGrade = parseGrade(grade);

  if (parsedGrade === 1 || parsedGrade === 2) {
    return 'Primary';
  }

  if (parsedGrade >= 3 && parsedGrade <= 5) {
    return 'Junior';
  }

  if (parsedGrade >= 6 && parsedGrade <= 8) {
    return 'Middle';
  }

  if (parsedGrade >= 9 && parsedGrade <= 10) {
    return 'Senior';
  }

  if (parsedGrade >= 11 && parsedGrade <= 12) {
    return 'Higher';
  }

  return 'Middle';
};

export const getFactsForGrade = (grade) => GRADE_CONTENT[getGradeGroup(grade)].facts;

export const getQuestionsForGrade = (grade) => GRADE_CONTENT[getGradeGroup(grade)].questions;

export const getVocabForGrade = (grade) => GRADE_CONTENT[getGradeGroup(grade)].vocab;

export const getGradeGroupMeta = (grade) => GRADE_GROUPS[getGradeGroup(grade)];
