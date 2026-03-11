import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

const TOPICS = [
  { id: 1, emoji: '🌡️', title: 'What is Climate Change?', titleHi: 'जलवायु परिवर्तन क्या है?', category: 'climate', grade: 6, mins: 8, ep: 40, gradient: 'linear-gradient(135deg,#fff8e1,#fff3e0)', chipBg: '#fff8e1', chipBorder: '#ffe082', chipText: '#e65100', ncert: 'NCERT Class 7 Science', preview: 'Learn how human activities are warming our planet.' },
  { id: 2, emoji: '🦋', title: 'Biodiversity in India', titleHi: 'भारत में जैव विविधता', category: 'biodiversity', grade: 8, mins: 12, ep: 50, gradient: 'linear-gradient(135deg,#e8f5e9,#c8e6c9)', chipBg: '#e8f5e9', chipBorder: '#a5d6a7', chipText: '#1b5e20', ncert: 'NCERT Class 8 Science', preview: 'India is one of 17 megadiverse countries.' },
  { id: 3, emoji: '💧', title: 'Water Conservation', titleHi: 'जल संरक्षण', category: 'water', grade: 7, mins: 6, ep: 35, gradient: 'linear-gradient(135deg,#e1f5fe,#b3e5fc)', chipBg: '#e1f5fe', chipBorder: '#b3e5fc', chipText: '#01579b', ncert: 'NCERT Class 7 Science', preview: 'Only 3% of Earth water is fresh.' },
  { id: 4, emoji: '♻️', title: 'Say No to Plastic', titleHi: 'प्लास्टिक को ना कहो', category: 'waste', grade: 5, mins: 7, ep: 35, gradient: 'linear-gradient(135deg,#fce4ec,#f8bbd0)', chipBg: '#fce4ec', chipBorder: '#f48fb1', chipText: '#880e4f', ncert: 'NCERT Class 6 Science', preview: 'Plastic takes 500 years to decompose.' },
  { id: 5, emoji: '☀️', title: 'Solar Energy in India', titleHi: 'भारत में सौर ऊर्जा', category: 'energy', grade: 9, mins: 10, ep: 55, gradient: 'linear-gradient(135deg,#fff9c4,#fff8e1)', chipBg: '#fff9c4', chipBorder: '#fff176', chipText: '#f57f17', ncert: 'NCERT Class 10 Science', preview: 'India aims for 500 GW renewable energy by 2030.' },
  { id: 6, emoji: '🌲', title: 'Forests: Our Lifeline', titleHi: 'जंगल: हमारी जीवन रेखा', category: 'biodiversity', grade: 7, mins: 9, ep: 45, gradient: 'linear-gradient(135deg,#e8f5e9,#dcedc8)', chipBg: '#e8f5e9', chipBorder: '#a5d6a7', chipText: '#1b5e20', ncert: 'NCERT Class 7 Science', preview: 'Forests cover 33% of India land area.' },
  { id: 7, emoji: '🌧️', title: 'The Water Cycle', titleHi: 'जल चक्र', category: 'water', grade: 3, mins: 5, ep: 25, gradient: 'linear-gradient(135deg,#e3f2fd,#bbdefb)', chipBg: '#e3f2fd', chipBorder: '#90caf9', chipText: '#0d47a1', ncert: 'NCERT Class 3 EVS', preview: 'How does water travel from ocean to clouds to rain?' },
  { id: 8, emoji: '🏭', title: 'Air Pollution in Indian Cities', titleHi: 'भारतीय शहरों में वायु प्रदूषण', category: 'climate', grade: 10, mins: 14, ep: 65, gradient: 'linear-gradient(135deg,#fff8e1,#fff3e0)', chipBg: '#fff8e1', chipBorder: '#ffe082', chipText: '#e65100', ncert: 'NCERT Class 10 Science', preview: 'Delhi AQI regularly crosses 400.' },
  { id: 9, emoji: '🥗', title: 'Food Waste in India', titleHi: 'भारत में खाद्य अपशिष्ट', category: 'waste', grade: 8, mins: 8, ep: 45, gradient: 'linear-gradient(135deg,#f3e5f5,#e1bee7)', chipBg: '#f3e5f5', chipBorder: '#ce93d8', chipText: '#6a1b9a', ncert: 'NCERT Class 8 Science', preview: 'India wastes 40% of its food.' },
  { id: 10, emoji: '🐯', title: 'India Endangered Animals', titleHi: 'भारत के लुप्तप्राय जानवर', category: 'biodiversity', grade: 6, mins: 10, ep: 45, gradient: 'linear-gradient(135deg,#fff3e0,#ffe0b2)', chipBg: '#fff3e0', chipBorder: '#ffcc80', chipText: '#e65100', ncert: 'NCERT Class 8 Science', preview: 'Bengal tiger, snow leopard — India most at-risk species.' },
  { id: 11, emoji: '🌍', title: 'Sustainable Development Goals', titleHi: 'सतत विकास लक्ष्य', category: 'climate', grade: 12, mins: 18, ep: 90, gradient: 'linear-gradient(135deg,#e0f2f1,#b2dfdb)', chipBg: '#e0f2f1', chipBorder: '#80cbc4', chipText: '#004d40', ncert: 'NCERT Class 12 Biology', preview: 'India progress on all 17 UN SDGs.' },
  { id: 12, emoji: '🌧️', title: 'Rainwater Harvesting', titleHi: 'वर्षा जल संचयन', category: 'water', grade: 5, mins: 6, ep: 30, gradient: 'linear-gradient(135deg,#e1f5fe,#b3e5fc)', chipBg: '#e1f5fe', chipBorder: '#b3e5fc', chipText: '#01579b', ncert: 'NCERT Class 7 Science', preview: 'Ancient India mastered rainwater harvesting.' },
];

const CATEGORIES = ['all', 'climate', 'biodiversity', 'water', 'waste', 'energy'];
const GRADES = ['all', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

const TOPIC_CONTENT = {
  "What is Climate Change?": {
    en: `Climate change means long-term shifts in global temperature and weather patterns. Since the 1800s, human activities — mainly burning coal, oil and gas — are the main driver.

**Why does it happen?**
Burning fossil fuels releases CO₂ and other greenhouse gases. These act like a blanket around Earth, trapping the sun's heat. This is called the greenhouse effect.

**Effects in India:**
• Monsoons are becoming unpredictable
• Himalayan glaciers are melting, threatening the Ganga
• Sea levels rising — Mumbai and Chennai at risk
• More frequent and severe heat waves

**What YOU can do:**
• Use public transport or cycle instead of cars
• Switch off lights and fans when not needed
• Plant trees in your school or neighbourhood
• Reduce, reuse, and recycle
• Eat less meat — animal farming produces methane

**Key fact:** India's average temperature has risen 0.7°C since 1901. The last decade was the warmest on record.`,

    hi: `जलवायु परिवर्तन का मतलब है वैश्विक तापमान और मौसम के पैटर्न में दीर्घकालिक बदलाव। 1800 के दशक से मानवीय गतिविधियाँ — मुख्य रूप से कोयला, तेल और गैस जलाना — इसका मुख्य कारण हैं।

**यह क्यों होता है?**
जीवाश्म ईंधन जलाने से CO₂ और ग्रीनहाउस गैसें निकलती हैं जो धरती के चारों ओर कंबल की तरह गर्मी को फँसाती हैं।

**भारत में प्रभाव:**
• मानसून अनिश्चित हो रहा है
• हिमालय के ग्लेशियर पिघल रहे हैं
• समुद्र का स्तर बढ़ रहा है — मुंबई और चेन्नई को खतरा
• गर्मी की लहरें अधिक बार

**आप क्या कर सकते हैं:**
• साइकिल या सार्वजनिक परिवहन का उपयोग करें
• बत्ती और पंखे बंद रखें
• पेड़ लगाएं और कचरा कम करें`,
  },

  "Biodiversity in India": {
    en: `India is one of 17 megadiverse countries — home to 8% of all species on Earth despite covering only 2.4% of land.

**India's biodiversity:**
• 45,000+ plant species (11% of world's flora)
• 91,000+ animal species
• 1,300+ bird species, 350+ mammal species

**Key hotspots:**
• Western Ghats — lion-tailed macaque, Nilgiri tahr, found nowhere else
• Eastern Himalayas — red panda, snow leopard, one-horned rhino
• Andaman & Nicobar — unique island ecosystems

**Threats:**
• Deforestation for farming and cities
• Poaching of tigers, elephants, rhinos
• River pollution killing fish
• Climate change bleaching coral reefs

**How India protects it:**
• 106 National Parks, 567 Wildlife Sanctuaries
• Project Tiger — tiger count grew from 1,827 to 3,167
• Project Elephant, Crocodile Breeding Programme`,

    hi: `भारत 17 मेगाडाइवर्स देशों में से एक है — केवल 2.4% भूमि पर पृथ्वी की 8% प्रजातियों का घर।

**भारत की जैव विविधता:**
• 45,000+ पौधों की प्रजातियाँ
• 91,000+ जानवरों की प्रजातियाँ
• 1,300+ पक्षियों की प्रजातियाँ

**प्रमुख हॉटस्पॉट:**
• पश्चिमी घाट — शेर-पूंछ वाला मकाक केवल यहाँ
• पूर्वी हिमालय — लाल पांडा, हिम तेंदुआ
• अंडमान और निकोबार

**भारत कैसे रक्षा करता है:**
• 106 राष्ट्रीय उद्यान, 567 वन्यजीव अभयारण्य
• प्रोजेक्ट टाइगर — बाघ 1,827 से 3,167 हो गए`,
  },

  "Water Conservation": {
    en: `Only 3% of Earth's water is fresh — and only 1% is accessible. India has 18% of the world's population but only 4% of its freshwater.

**Where India's water goes:**
• 80% — Agriculture (irrigation)
• 15% — Industry
• 5% — Homes (drinking, cooking, bathing)

**The groundwater crisis:**
India is the world's largest groundwater extractor. In 2019, Chennai's four reservoirs ran completely dry. Delhi, Bengaluru face severe shortages.

**Ancient Indian solutions:**
• Baoli (stepwells) — Gujarat and Rajasthan, 1,000+ years old
• Johad — earthen ponds in Rajasthan. NGO Tarun Bharat Sangh built 10,000 johads and revived 7 dead rivers!
• Kunds — underground cisterns in desert areas

**What you can do at home:**
• Fix leaky taps — 1 dripping tap wastes 20 litres/day
• Use a bucket instead of shower — saves 100 litres per bath
• Collect rainwater in buckets during monsoon
• Don't leave tap running while brushing — saves 12 litres`,

    hi: `पृथ्वी का केवल 3% पानी मीठा है। भारत के पास दुनिया की 18% आबादी है लेकिन केवल 4% मीठे पानी के संसाधन।

**प्राचीन भारतीय समाधान:**
• बावड़ी — गुजरात और राजस्थान में 1,000+ साल पुरानी
• जोहड़ — तरुण भारत संघ ने 10,000 जोहड़ बनाए और 7 मृत नदियाँ जीवित कीं!

**घर पर क्या करें:**
• टपकते नल ठीक करें — प्रतिदिन 20 लीटर बचाएं
• बाल्टी से नहाएं — प्रति स्नान 100 लीटर बचाएं
• दाँत ब्रश करते समय नल बंद रखें`,
  },

  "Say No to Plastic": {
    en: `Plastic never truly disappears. It only breaks into smaller pieces called microplastics — found in rivers, fish, and even human blood.

**How long plastic lasts:**
• Plastic bag: 20 years
• Straw: 200 years
• Bottle: 450 years
• Fishing net: 600 years

**India's plastic problem:**
• 3.5 million tonnes of plastic waste per year
• Only 30% recycled — rest goes to landfills, rivers, oceans
• Ganga and Yamuna are among world's most plastic-polluted rivers

**India's 2022 plastic ban covers:**
• Bags under 75 microns
• Straws, cups, plates, cutlery
• Plastic sticks for balloons and ear buds

**What YOU can do:**
• Carry a cloth bag — keep one in your school bag!
• Use a steel water bottle
• Say no to plastic straws — use paper or bamboo
• Pick up 5 pieces of plastic litter every day`,

    hi: `प्लास्टिक कभी सच में गायब नहीं होता। यह माइक्रोप्लास्टिक में टूट जाता है — नदियों, मछलियों और मानव रक्त में पाया जाता है।

**भारत की प्लास्टिक समस्या:**
• हर साल 35 लाख टन प्लास्टिक कचरा
• केवल 30% रीसाइकल होता है

**आप क्या कर सकते हैं:**
• कपड़े का थैला रखें — स्कूल बैग में भी!
• स्टील की बोतल का उपयोग करें
• हर दिन 5 प्लास्टिक के टुकड़े उठाएं`,
  },

  "Solar Energy in India": {
    en: `India receives solar energy equal to 5,000 trillion kWh/year — far more than its total energy consumption. Sun shines 300+ days in most of India.

**India's solar achievements:**
• World's 4th largest solar power producer
• Installed capacity: 70+ GW (2023)
• Target: 500 GW by 2030
• Bhadla Solar Park, Rajasthan — world's largest (2,245 MW)

**The economics:**
Solar electricity cost ₹18/unit in 2010. Today: under ₹2.50/unit — cheaper than coal. Solar is now the cheapest electricity in human history.

**Solar in Indian daily life:**
• Solar water heaters — save 60-80% water heating costs
• Solar street lights in villages
• Solar pumps replacing diesel pumps for farmers
• India co-founded International Solar Alliance with France (2015)`,

    hi: `भारत को हर साल 5,000 ट्रिलियन kWh सौर ऊर्जा मिलती है।

**भारत की सौर उपलब्धियाँ:**
• दुनिया का चौथा सबसे बड़ा सौर ऊर्जा उत्पादक
• राजस्थान में भड़ला सोलर पार्क — दुनिया का सबसे बड़ा

**अर्थव्यवस्था:**
2010 में ₹18/यूनिट था। आज ₹2.50/यूनिट से कम — कोयले से भी सस्ता!`,
  },

  "Forests: Our Lifeline": {
    en: `Forests cover 33% of India's land area. They are the lungs of our planet and provide habitat for thousands of species.

**Why forests matter:**
• Provide oxygen and absorb CO₂
• Prevent soil erosion and floods
• Source of medicines and food

**What you can do:**
• Plant native trees
• Avoid wasting paper
• Support forest conservation`,
    hi: `जंगल भारत के 33% भूमि क्षेत्र को कवर करते हैं। वे हमारे ग्रह के फेफड़े हैं।

**जंगल क्यों मायने रखते हैं:**
• ऑक्सीजन देते हैं और CO₂ सोखते हैं
• मिट्टी के कटाव को रोकते हैं

**आप क्या कर सकते हैं:**
• देशी पेड़ लगाएं
• कागज बर्बाद न करें`
  },

  "The Water Cycle": {
    en: `The water cycle describes how water constantly moves on Earth.

**Stages:**
• Evaporation: Sun heats water
• Condensation: Water vapor forms clouds
• Precipitation: Rain falls

**Fun Fact:**
The water you drink today is the same water the dinosaurs drank!`,
    hi: `जल चक्र बताता है कि पानी पृथ्वी पर कैसे घूमता है।

**चरण:**
• वाष्पीकरण: सूरज पानी को गर्म करता है
• संघनन: भाप से बादल बनते हैं
• वर्षा: बारिश होती है`
  },

  "Air Pollution in Indian Cities": {
    en: `Many Indian cities face severe air pollution, affecting millions of people.

**Causes:**
• Vehicle emissions
• Crop burning and industry
• Construction dust

**Solutions:**
• Carpool or use public transport
• Plant air-purifying indoor plants
• Avoid burning garbage`,
    hi: `भारत के कई शहर गंभीर वायु प्रदूषण का सामना कर रहे हैं।

**कारण:**
• वाहनों का धुआँ
• पराली जलाना और कारखाने

**समाधान:**
• सार्वजनिक परिवहन का उपयोग करें
• हवा साफ करने वाले पौधे लगाएं`
  },

  "Food Waste in India": {
    en: `India wastes about 40% of its food, yet millions go hungry.

**How to reduce food waste:**
• Take only what you can eat
• Store leftovers properly
• Compost organic waste

**Impact:**
Food waste in landfills creates methane, a powerful greenhouse gas!`,
    hi: `भारत अपना लगभग 40% भोजन बर्बाद करता है, फिर भी लाखों लोग भूखे सोते हैं।

**भोजन की बर्बादी कैसे कम करें:**
• उतना ही लें जितना खा सकें
• बचा हुआ खाना फ्रिज में रखें
• खाद बनाएं`
  },

  "India Endangered Animals": {
    en: `India is home to many endangered species that need our protection.

**Animals at risk:**
• Bengal Tiger
• Snow Leopard
• One-horned Rhinoceros

**Why are they threatened?**
Habitat loss, poaching, and climate change are the main reasons. We must protect their forests!`,
    hi: `भारत कई लुप्तप्राय प्रजातियों का घर है जिन्हें हमारी सुरक्षा की आवश्यकता है।

**खतरे में जानवर:**
• बंगाल टाइगर
• हिम तेंदुआ
• एक सींग वाला गैंडा`
  },

  "Sustainable Development Goals": {
    en: `The UN's 17 Sustainable Development Goals (SDGs) are a blueprint for a better future.

**Key Goals for EcoKids:**
• Goal 6: Clean Water and Sanitation
• Goal 7: Affordable and Clean Energy
• Goal 13: Climate Action

**India's Progress:**
India is actively working towards these goals to ensure a green future.`,
    hi: `संयुक्त राष्ट्र के 17 सतत विकास लक्ष्य (SDGs) बेहतर भविष्य के लिए हैं।

**मुख्य लक्ष्य:**
• लक्ष्य 6: स्वच्छ जल
• लक्ष्य 13: जलवायु कार्रवाई`
  },

  "Rainwater Harvesting": {
    en: `Rainwater harvesting is the collection and storage of rain.

**Benefits:**
• Replenishes groundwater
• Reduces water bills
• Provides water during summer

**How it works:**
Rain from rooftops is funneled through pipes into a storage tank or underground pit.`,
    hi: `वर्षा जल संचयन बारिश के पानी को इकट्ठा और संरक्षित करने की प्रक्रिया है।

**फायदे:**
• भूजल बढ़ाता है
• पानी के बिल कम करता है
• गर्मियों में पानी देता है`
  }
};

function getTopicContent(topic, lang) {
  const key = topic.title;
  const data = TOPIC_CONTENT[key];
  if (!data) return topic.preview || 'Content coming soon!';
  if (lang === 'hi' && data.hi) return data.hi;
  if (lang === 'bn' && data.bn) return data.bn;
  if (lang === 'ta' && data.ta) return data.ta;
  if (lang === 'te' && data.te) return data.te;
  if (lang === 'mr' && data.mr) return data.mr;
  return data.en;
}

function renderContent(text) {
  return text.split('\n').map((line, i) => {
    if (line.startsWith('**') && line.endsWith('**')) {
      return (
        <p key={i} style={{
          fontWeight: 700, color: '#1b5e20',
          marginTop: 16, marginBottom: 6, fontSize: 15
        }}>
          {line.replace(/\\*\\*/g, '')}
        </p>
      );
    }
    if (line.startsWith('• ')) {
      return (
        <p key={i} style={{
          paddingLeft: 18, color: '#4a6741',
          marginBottom: 5, fontSize: 14
        }}>
          • {line.slice(2)}
        </p>
      );
    }
    if (line.trim() === '') return <div key={i} style={{ height: 8 }} />;
    return (
      <p key={i} style={{
        color: '#4a6741', marginBottom: 7,
        fontSize: 14, lineHeight: 1.75
      }}>
        {line}
      </p>
    );
  });
}

export default function Topics() {
  const { t, i18n } = useTranslation();
  const { user } = useSelector((state) => state.auth);
  const [selected, setSelected] = useState(null);
  const [grade, setGrade] = useState('all');
  const [cat, setCat] = useState('all');

  // Set initial grade filter based on student's profile grade
  useEffect(() => {
    if (user?.profile?.grade) {
      const studentGrade = String(user.profile.grade);
      setGrade(studentGrade);
    }
  }, [user?.profile?.grade]);

  const filtered = TOPICS.filter(tp => {
    const gm = grade === 'all' || tp.grade === Number(grade);
    const cm = cat === 'all' || tp.category === cat;
    return gm && cm;
  });

  const catEmoji = { all: '🌿', climate: '🌡️', biodiversity: '🦋', water: '💧', waste: '♻️', energy: '⚡' };

  return (
    <div style={{ minHeight: '100vh', background: '#f9fffe', fontFamily: 'sans-serif' }}>

      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid #e8f5e9', padding: '48px 24px 32px', textAlign: 'center', marginTop: '64px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, justifyContent: 'center' }}>
          <button
            onClick={() => window.history.back()}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#e8f5e9', border: '1px solid #a5d6a7',
              color: '#1b5e20', padding: '6px 14px', borderRadius: 100,
              fontSize: 13, fontWeight: 700, cursor: 'pointer'
            }}>
            ← Back
          </button>
          <span style={{ fontSize: 12, color: '#7a9b72' }}>Home / Topics</span>
        </div>
        <h1 style={{ fontSize: 48, fontWeight: 900, color: '#1b5e20', margin: '0 0 8px' }}>📚 Eco-Topics</h1>
        <p style={{ fontSize: 18, color: '#4a6741' }}>NCERT-aligned lessons for Class 1 to 12</p>
        {user?.profile?.grade && (
          <p style={{ fontSize: 16, color: '#2e7d32', fontWeight: 'bold', marginTop: 8 }}>
            📌 Showing content for Class {user.profile.grade} • <button onClick={() => setGrade('all')} style={{ background: 'none', border: 'none', color: '#2e7d32', textDecoration: 'underline', cursor: 'pointer', fontSize: 16 }}>View All Classes</button>
          </p>
        )}
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>

        {/* Grade filter */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          {GRADES.map(g => (
            <button key={g} onClick={() => setGrade(g)} style={{
              padding: '6px 16px', borderRadius: 100, border: '2px solid',
              borderColor: grade === g ? '#2e7d32' : '#c8e6c9',
              background: grade === g ? '#2e7d32' : 'white',
              color: grade === g ? 'white' : '#2e7d32',
              fontWeight: 700, fontSize: 13, cursor: 'pointer'
            }}>
              {g === 'all' ? 'All Grades' : `Class ${g}`}
            </button>
          ))}
        </div>

        {/* Category filter */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 32 }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCat(c)} style={{
              padding: '6px 16px', borderRadius: 100, border: '2px solid',
              borderColor: cat === c ? '#2e7d32' : '#c8e6c9',
              background: cat === c ? '#e8f5e9' : 'white',
              color: '#1b5e20', fontWeight: 700, fontSize: 13, cursor: 'pointer'
            }}>
              {catEmoji[c]} {c === 'all' ? 'All' : c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          ))}
        </div>

        {/* Cards grid */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80, color: '#7a9b72' }}>
            <div style={{ fontSize: 48 }}>🔍</div>
            <p style={{ fontSize: 18, marginTop: 12 }}>No topics found. Try a different filter.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 20 }}>
            {filtered.map(tp => (
              <div key={tp.id} onClick={() => setSelected(tp)} style={{
                background: 'white', borderRadius: 20, border: '2px solid #e8f5e9',
                overflow: 'hidden', boxShadow: '0 3px 16px rgba(0,0,0,.07)',
                transition: 'all .2s', cursor: 'pointer',
                display: 'flex', flexDirection: 'column'
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = '#a5d6a7'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,.12)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#e8f5e9'; e.currentTarget.style.boxShadow = '0 3px 16px rgba(0,0,0,.07)'; }}
              >
                {/* Emoji cover — NO image */}
                <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 72, background: tp.gradient }}>
                  {tp.emoji}
                </div>

                {/* Body */}
                <div style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100, border: `1px solid ${tp.chipBorder}`, background: tp.chipBg, color: tp.chipText, marginBottom: 10 }}>
                    {tp.category.charAt(0).toUpperCase() + tp.category.slice(1)}
                  </span>

                  <div style={{ display: 'flex', gap: 8, fontSize: 11, color: '#7a9b72', marginBottom: 8 }}>
                    <span>Class {tp.grade}</span>
                    <span>·</span>
                    <span>🕐 {tp.mins} min</span>
                    <span>·</span>
                    <span style={{ color: '#f59e0b', fontWeight: 700 }}>+{tp.ep} EP</span>
                  </div>

                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1a2e1c', margin: '0 0 6px', lineHeight: 1.4 }}>
                    {i18n.language === 'hi' ? tp.titleHi : tp.title}
                  </h3>

                  <p style={{ fontSize: 12, color: '#4a6741', lineHeight: 1.6, marginBottom: 10, flex: 1 }}>
                    {tp.preview}
                  </p>

                  <p style={{ fontFamily: 'monospace', fontSize: 10, color: '#7a9b72', marginBottom: 12 }}>
                    {tp.ncert}
                  </p>

                  <button
                    onClick={(e) => { e.stopPropagation(); setSelected(tp); }}
                    style={{
                      width: '100%', padding: '9px 0', borderRadius: 12,
                      background: '#e8f5e9', border: '1px solid #a5d6a7',
                      color: '#1b5e20', fontWeight: 700, fontSize: 14, cursor: 'pointer'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#2e7d32'; e.currentTarget.style.color = 'white'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#e8f5e9'; e.currentTarget.style.color = '#1b5e20'; }}
                  >
                    Read Now →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div
          onClick={() => setSelected(null)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,.6)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            padding: '32px 16px',
            overflowY: 'auto'
          }}>

          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: 24,
              maxWidth: 720,
              width: '100%',
              overflow: 'hidden',
              boxShadow: '0 24px 80px rgba(0,0,0,.3)',
              marginBottom: 40
            }}>

            {/* ── Modal header (gradient from card) ── */}
            <div style={{
              background: selected.gradient || '#e8f5e9',
              padding: '32px 32px 24px', position: 'relative'
            }}>

              {/* Close button */}
              <button
                onClick={() => setSelected(null)}
                style={{
                  position: 'absolute', top: 14, right: 14,
                  background: 'rgba(0,0,0,.15)', border: 'none',
                  borderRadius: '50%', width: 36, height: 36,
                  fontSize: 18, cursor: 'pointer', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>✕</button>

              {/* Emoji */}
              <div style={{ fontSize: 60, marginBottom: 12 }}>
                {selected.emoji || '📖'}
              </div>

              {/* Category chip */}
              <span style={{
                display: 'inline-block', fontSize: 11, fontWeight: 700,
                padding: '3px 12px', borderRadius: 100, marginBottom: 12,
                border: `1px solid ${selected.chipBorder || '#a5d6a7'}`,
                background: selected.chipBg || '#e8f5e9',
                color: selected.chipText || '#1b5e20'
              }}>
                {selected.category}
              </span>

              {/* Title */}
              <h2 style={{
                fontSize: 'clamp(20px, 4vw, 28px)',
                fontWeight: 900, color: '#1b5e20',
                margin: '0 0 10px', lineHeight: 1.2
              }}>
                {i18n.language === 'hi' ? selected.titleHi : selected.title}
              </h2>

              {/* Meta row */}
              <div style={{
                display: 'flex', gap: 16, fontSize: 13,
                color: '#4a6741', flexWrap: 'wrap'
              }}>
                <span>📚 Class {selected.grade}</span>
                <span>🕐 {selected.readingTimeMinutes || selected.mins} min read</span>
                <span style={{ color: '#f59e0b', fontWeight: 700 }}>
                  +{selected.ecoPointsReward || selected.ep} EP
                </span>
                <span style={{
                  fontFamily: 'monospace', fontSize: 11,
                  color: '#7a9b72'
                }}>
                  {selected.ncertRef || selected.ncert}
                </span>
              </div>
            </div>

            {/* ── Language switcher bar ── */}
            <div style={{
              padding: '10px 28px',
              background: '#f9fffe',
              borderBottom: '1px solid #e8f5e9',
              display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center'
            }}>
              <span style={{ fontSize: 11, color: '#7a9b72', marginRight: 4 }}>
                🌐 Read in:
              </span>
              {[
                ['en', 'English'], ['hi', 'हिंदी'], ['bn', 'বাংলা'],
                ['ta', 'தமிழ்'], ['te', 'తెలుగు'], ['mr', 'मराठी'],
                ['kn', 'ಕನ್ನಡ'], ['gu', 'ગુજરાતી'], ['pa', 'ਪੰਜਾਬੀ'], ['ml', 'മലയാളം']
              ].map(([code, label]) => (
                <button
                  key={code}
                  onClick={() => i18n.changeLanguage(code)}
                  style={{
                    padding: '4px 12px', borderRadius: 100,
                    border: '1px solid',
                    borderColor: i18n.language === code ? '#2e7d32' : '#c8e6c9',
                    background: i18n.language === code ? '#2e7d32' : 'white',
                    color: i18n.language === code ? 'white' : '#2e7d32',
                    fontSize: 12, fontWeight: 700, cursor: 'pointer'
                  }}>
                  {label}
                </button>
              ))}
            </div>

            {/* ── Lesson content ── */}
            <div style={{ padding: '24px 32px 16px' }}>
              {renderContent(getTopicContent(selected, i18n.language))}
            </div>

            {/* ── EP reward button ── */}
            <div style={{
              margin: '0 32px 32px',
              padding: 20,
              background: '#e8f5e9',
              borderRadius: 16,
              textAlign: 'center'
            }}>
              <p style={{ fontSize: 13, color: '#4a6741', marginBottom: 10 }}>
                Finished reading? Claim your points!
              </p>
              <button
                onClick={() => setSelected(null)}
                style={{
                  background: '#2e7d32', color: 'white',
                  border: 'none', borderRadius: 100,
                  padding: '12px 32px',
                  fontWeight: 900, fontSize: 15, cursor: 'pointer'
                }}>
                ✓ Mark as Read · +{selected.ecoPointsReward || selected.ep} EP
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}