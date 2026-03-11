// Environmental Quiz Questions Seed Data for EcoKids India

export const quizzes = [
  {
    id: 1,
    title: "Water Conservation Quiz",
    titleHi: "जल संरक्षण प्रश्नोत्तरी",
    slug: "water-conservation-quiz",
    category: "water",
    difficulty: "beginner",
    timeLimit: 300, // 5 minutes
    passingScore: 70,
    description: "Test your knowledge about water conservation methods and their importance in India.",
    descriptionHi: "भारत में जल संरक्षण विधियों और उनके महत्व के बारे में अपनी जानकारी का परीक्षण करें।",
    questions: [
      {
        id: 101,
        type: "multiple-choice",
        question: "Which state in India receives the highest annual rainfall?",
        questionHi: "भारत में किस राज्य में सबसे अधिक वार्षिक वर्षा होती है?",
        options: [
          { id: "a", text: "Rajasthan", textHi: "राजस्थान" },
          { id: "b", text: "Kerala", textHi: "केरल" },
          { id: "c", text: "Meghalaya", textHi: "मेघालय" },
          { id: "d", text: "Punjab", textHi: "पंजाब" }
        ],
        correctAnswer: "c",
        explanation: "Meghalaya receives the highest rainfall in India, with Cherrapunji and Mawsynram being among the wettest places on Earth.",
        explanationHi: "मेघालय में भारत में सबसे अधिक वर्षा होती है, चेरापूंजी और मावसिनराम पृथ्वी के सबसे गीले स्थानों में से हैं।",
        difficulty: "easy",
        points: 10
      },
      {
        id: 102,
        type: "multiple-choice",
        question: "What is the traditional water harvesting structure called in Rajasthan?",
        questionHi: "राजस्थान में पारंपरिक जल संचयन संरचना को क्या कहते हैं?",
        options: [
          { id: "a", text: "Bawdi", textHi: "बावड़ी" },
          { id: "b", text: "Kund", textHi: "कुंड" },
          { id: "c", text: "Johad", textHi: "जोहड़" },
          { id: "d", text: "All of the above", textHi: "उपरोक्त सभी" }
        ],
        correctAnswer: "d",
        explanation: "Rajasthan uses various traditional water harvesting methods including Bawdi (stepwells), Kund (underground tanks), and Johads (earthen check dams).",
        explanationHi: "राजस्थान में विभिन्न पारंपरिक जल संचयन विधियों का उपयोग होता है जिसमें बावड़ी (सीढ़ीदार कुएं), कुंड (भूमिगत टैंक), और जोहड़ (मिट्टी के चेक डैम) शामिल हैं।",
        difficulty: "medium",
        points: 15
      },
      {
        id: 103,
        type: "true-false",
        question: "Rainwater harvesting can help recharge groundwater levels.",
        questionHi: "वर्षा जल संचयन भूजल स्तर को बढ़ाने में मदद कर सकता है।",
        correctAnswer: true,
        explanation: "Rainwater harvesting not only provides water for immediate use but also helps recharge underground aquifers, improving groundwater levels.",
        explanationHi: "वर्षा जल संचयन न केवल तत्काल उपयोग के लिए पानी प्रदान करता है बल्कि भूमिगत जलभृतों को भी रिचार्ज करने में मदद करता है।",
        difficulty: "easy",
        points: 10
      },
      {
        id: 104,
        type: "fill-in-blank",
        question: "The average Indian uses approximately _____ liters of water per day for domestic purposes.",
        questionHi: "औसत भारतीय घरेलू कार्यों के लिए प्रतिदिन लगभग _____ लीटर पानी का उपयोग करता है।",
        correctAnswers: ["135", "130-140", "135 liters"],
        explanation: "The average water consumption in Indian households is about 135 liters per person per day, which varies by region and income level.",
        explanationHi: "भारतीय घरों में औसत जल खपत प्रति व्यक्ति प्रति दिन लगभग 135 लीटर है, जो क्षेत्र और आय स्तर के अनुसार भिन्न होती है।",
        difficulty: "medium",
        points: 15
      },
      {
        id: 105,
        type: "multiple-choice",
        question: "Which Indian city is famous for its successful rainwater harvesting program?",
        questionHi: "कौन सा भारतीय शहर अपने सफल वर्षा जल संचयन कार्यक्रम के लिए प्रसिद्ध है?",
        options: [
          { id: "a", text: "Mumbai", textHi: "मुंबई" },
          { id: "b", text: "Chennai", textHi: "चेन्नई" },
          { id: "c", text: "Delhi", textHi: "दिल्ली" },
          { id: "d", text: "Kolkata", textHi: "कोलकाता" }
        ],
        correctAnswer: "b",
        explanation: "Chennai implemented mandatory rainwater harvesting for all buildings, which significantly improved the city's groundwater levels.",
        explanationHi: "चेन्नई ने सभी भवनों के लिए अनिवार्य वर्षा जल संचयन लागू किया, जिससे शहर के भूजल स्तर में काफी सुधार हुआ।",
        difficulty: "medium",
        points: 15
      }
    ],
    hints: [
      "Think about the monsoon patterns in India",
      "Consider traditional architecture and water systems",
      "Remember the water cycle and groundwater connection",
      "Think about daily water usage activities",
      "Consider major Indian cities and their water challenges"
    ],
    tags: ["water", "conservation", "india", "traditional", "modern"],
    grade: [6, 7, 8, 9],
    estimatedTime: 5,
    createdAt: "2024-01-15T12:00:00Z"
  },

  {
    id: 2,
    title: "Indian Wildlife and Biodiversity Quiz",
    titleHi: "भारतीय वन्यजीव और जैव विविधता प्रश्नोत्तरी",
    slug: "indian-wildlife-biodiversity-quiz",
    category: "biodiversity",
    difficulty: "intermediate",
    timeLimit: 480, // 8 minutes
    passingScore: 75,
    description: "Test your knowledge about India's rich biodiversity, wildlife conservation, and national parks.",
    descriptionHi: "भारत की समृद्ध जैव विविधता, वन्यजीव संरक्षण और राष्ट्रीय उद्यानों के बारे में अपने ज्ञान का परीक्षण करें।",
    questions: [
      {
        id: 201,
        type: "multiple-choice",
        question: "Which is India's largest national park?",
        questionHi: "भारत का सबसे बड़ा राष्ट्रीय उद्यान कौन सा है?",
        options: [
          { id: "a", text: "Jim Corbett National Park", textHi: "जिम कॉर्बेट राष्ट्रीय उद्यान" },
          { id: "b", text: "Hemis National Park", textHi: "हेमिस राष्ट्रीय उद्यान" },
          { id: "c", text: "Kaziranga National Park", textHi: "काजीरंगा राष्ट्रीय उद्यान" },
          { id: "d", text: "Sundarbans National Park", textHi: "सुंदरबन राष्ट्रीय उद्यान" }
        ],
        correctAnswer: "b",
        explanation: "Hemis National Park in Ladakh is India's largest national park, covering 4,400 square kilometers and home to snow leopards.",
        explanationHi: "लद्दाख में हेमिस राष्ट्रीय उद्यान भारत का सबसे बड़ा राष्ट्रीय उद्यान है, जो 4,400 वर्ग किलोमीटर में फैला है और हिम तेंदुओं का घर है।",
        difficulty: "medium",
        points: 15
      },
      {
        id: 202,
        type: "multiple-choice",
        question: "The one-horned rhinoceros is primarily found in which Indian state?",
        questionHi: "एक सींग वाला गैंडा मुख्यतः भारत के किस राज्य में पाया जाता है?",
        options: [
          { id: "a", text: "West Bengal", textHi: "पश्चिम बंगाल" },
          { id: "b", text: "Assam", textHi: "असम" },
          { id: "c", text: "Odisha", textHi: "ओडिशा" },
          { id: "d", text: "Madhya Pradesh", textHi: "मध्य प्रदेश" }
        ],
        correctAnswer: "b",
        explanation: "The Greater One-Horned Rhinoceros is primarily found in Kaziranga National Park, Assam, which houses about 70% of the world's population.",
        explanationHi: "वृहत्तर एक सींग वाला गैंडा मुख्य रूप से असम के काजीरंगा राष्ट्रीय उद्यान में पाया जाता है, जहाँ विश्व की लगभग 70% आबादी निवास करती है।",
        difficulty: "easy",
        points: 10
      },
      {
        id: 203,
        type: "true-false",
        question: "The Western Ghats are older than the Himalayas.",
        questionHi: "पश्चिमी घाट हिमालय से पुराने हैं।",
        correctAnswer: true,
        explanation: "The Western Ghats are much older than the Himalayas, formed about 150 million years ago, while the Himalayas formed about 50 million years ago.",
        explanationHi: "पश्चिमी घाट हिमालय से काफी पुराने हैं, लगभग 150 मिलियन वर्ष पहले बने थे, जबकि हिमालय लगभग 50 मिलियन वर्ष पहले बना था।",
        difficulty: "hard",
        points: 20
      },
      {
        id: 204,
        type: "multiple-choice",
        question: "Which project was launched to save the tiger in India?",
        questionHi: "भारत में बाघ को बचाने के लिए कौन सी परियोजना शुरू की गई थी?",
        options: [
          { id: "a", text: "Project Elephant", textHi: "प्रोजेक्ट एलिफेंट" },
          { id: "b", text: "Project Tiger", textHi: "प्रोजेक्ट टाइगर" },
          { id: "c", text: "Project Rhino", textHi: "प्रोजेक्ट राइनो" },
          { id: "d", text: "Project Leopard", textHi: "प्रोजेक्ट लेपर्ड" }
        ],
        correctAnswer: "b",
        explanation: "Project Tiger was launched in 1973 to protect the endangered Bengal tiger and has been successful in increasing tiger populations.",
        explanationHi: "प्रोजेक्ट टाइगर 1973 में लुप्तप्राय बंगाल टाइगर की सुरक्षा के लिए शुरू किया गया था और बाघों की आबादी बढ़ाने में सफल रहा है।",
        difficulty: "easy",
        points: 10
      },
      {
        id: 205,
        type: "fill-in-blank",
        question: "India is home to approximately _____ % of the world's known species despite covering only 2.4% of land area.",
        questionHi: "भारत केवल 2.4% भूमि क्षेत्र को कवर करने के बावजूद विश्व की ज्ञात प्रजातियों का लगभग _____% घर है।",
        correctAnswers: ["7", "7%", "seven"],
        explanation: "India hosts about 7-8% of all recorded species globally, making it one of the 17 megadiverse countries in the world.",
        explanationHi: "भारत विश्व स्तर पर सभी दर्ज प्रजातियों का लगभग 7-8% हिस्सा है, जो इसे दुनिया के 17 मेगाडाइवर्स देशों में से एक बनाता है।",
        difficulty: "medium",
        points: 15
      },
      {
        id: 206,
        type: "multiple-choice",
        question: "The endangered Gangetic dolphin is the national aquatic animal of India. In which river system is it primarily found?",
        questionHi: "लुप्तप्राय गंगा डॉल्फिन भारत का राष्ट्रीय जलीय जंतु है। यह मुख्यतः किस नदी तंत्र में पाई जाती है?",
        options: [
          { id: "a", text: "Ganga-Brahmaputra river system", textHi: "गंगा-ब्रह्मपुत्र नदी तंत्र" },
          { id: "b", text: "Indus river system", textHi: "सिंधु नदी तंत्र" },
          { id: "c", text: "Godavari river system", textHi: "गोदावरी नदी तंत्र" },
          { id: "d", text: "Narmada river system", textHi: "नर्मदा नदी तंत्र" }
        ],
        correctAnswer: "a",
        explanation: "The Gangetic river dolphin is found in the Ganga, Brahmaputra, and their tributaries. It's also called 'Susu' locally.",
        explanationHi: "गांगेय नदी डॉल्फिन गंगा, ब्रह्मपुत्र और उनकी सहायक नदियों में पाई जाती है। स्थानीय रूप से इसे 'सुसु' भी कहते हैं।",
        difficulty: "medium",
        points: 15
      }
    ],
    hints: [
      "Consider India's diverse geographical regions",
      "Think about flagship species and conservation programs",
      "Remember India's geological history",
      "Consider major wildlife conservation initiatives",
      "Think about India's global biodiversity significance",
      "Consider aquatic ecosystems and river systems"
    ],
    tags: ["wildlife", "biodiversity", "conservation", "national-parks", "endangered-species"],
    grade: [7, 8, 9, 10],
    estimatedTime: 8,
    createdAt: "2024-01-15T12:30:00Z"
  },

  {
    id: 3,
    title: "Climate Change and India Quiz",
    titleHi: "जलवायु परिवर्तन और भारत प्रश्नोत्तरी",
    slug: "climate-change-india-quiz",
    category: "climate",
    difficulty: "advanced",
    timeLimit: 600, // 10 minutes
    passingScore: 80,
    description: "Test your understanding of climate change impacts on India and mitigation strategies.",
    descriptionHi: "भारत पर जलवायु परिवर्तन के प्रभावों और शमन रणनीतियों की अपनी समझ का परीक्षण करें।",
    questions: [
      {
        id: 301,
        type: "multiple-choice",
        question: "Which Indian city is most vulnerable to sea-level rise according to climate projections?",
        questionHi: "जलवायु पूर्वानुमान के अनुसार कौन सा भारतीय शहर समुद्री जल स्तर वृद्धि के लिए सबसे अधिक संवेदनशील है?",
        options: [
          { id: "a", text: "Chennai", textHi: "चेन्नई" },
          { id: "b", text: "Mumbai", textHi: "मुंबई" },
          { id: "c", text: "Kolkata", textHi: "कोलकाता" },
          { id: "d", text: "Kochi", textHi: "कोच्चि" }
        ],
        correctAnswer: "b",
        explanation: "Mumbai is highly vulnerable due to its low-lying areas, dense population, and rapid urbanization, making it susceptible to flooding from sea-level rise.",
        explanationHi: "मुंबई अपने निचले इलाकों, घने जनसंख्या और तेजी से शहरीकरण के कारण अत्यधिक संवेदनशील है, जो इसे समुद्री जल स्तर की वृद्धि से बाढ़ के लिए संवेदनशील बनाता है।",
        difficulty: "medium",
        points: 15
      },
      {
        id: 302,
        type: "true-false",
        question: "India is the world's third-largest greenhouse gas emitter by total emissions.",
        questionHi: "भारत कुल उत्सर्जन के हिसाब से दुनिया का तीसरा सबसे बड़ा ग्रीनहाउस गैस उत्सर्जक है।",
        correctAnswer: true,
        explanation: "India ranks third globally in total GHG emissions after China and the USA, but has much lower per capita emissions.",
        explanationHi: "भारत चीन और अमेरिका के बाद कुल GHG उत्सर्जन में विश्व में तीसरे स्थान पर है, लेकिन प्रति व्यक्ति उत्सर्जन बहुत कम है।",
        difficulty: "medium",
        points: 15
      },
      {
        id: 303,
        type: "multiple-choice",
        question: "What is India's commitment under the Paris Climate Agreement for renewable energy capacity?",
        questionHi: "नवीकरणीय ऊर्जा क्षमता के लिए पेरिस जलवायु समझौते के तहत भारत की क्या प्रतिबद्धता है?",
        options: [
          { id: "a", text: "175 GW by 2022", textHi: "2022 तक 175 GW" },
          { id: "b", text: "450 GW by 2030", textHi: "2030 तक 450 GW" },
          { id: "c", text: "500 GW by 2030", textHi: "2030 तक 500 GW" },
          { id: "d", text: "Both B and C", textHi: "B और C दोनों" }
        ],
        correctAnswer: "c",
        explanation: "India has committed to 500 GW of renewable energy capacity by 2030, updated from the earlier target of 450 GW.",
        explanationHi: "भारत ने 2030 तक 500 GW नवीकरणीय ऊर्जा क्षमता की प्रतिबद्धता की है, जो पहले के 450 GW के लक्ष्य से अपडेट की गई है।",
        difficulty: "hard",
        points: 20
      },
      {
        id: 304,
        type: "fill-in-blank",
        question: "The average temperature in India has increased by approximately _____ degrees Celsius since 1901.",
        questionHi: "1901 से भारत में औसत तापमान लगभग _____ डिग्री सेल्सियस बढ़ा है।",
        correctAnswers: ["0.7", "0.62", "0.6-0.7"],
        explanation: "India's average temperature has risen by about 0.62°C since 1901, with accelerated warming in recent decades.",
        explanationHi: "1901 से भारत का औसत तापमान लगभग 0.62°C बढ़ा है, हाल के दशकों में तेजी से वार्मिंग के साथ।",
        difficulty: "hard",
        points: 20
      },
      {
        id: 305,
        type: "multiple-choice",
        question: "Which Indian state has been most affected by glacier melting in the Himalayas?",
        questionHi: "हिमालय में ग्लेशियर पिघलने से कौन सा भारतीय राज्य सबसे अधिक प्रभावित हुआ है?",
        options: [
          { id: "a", text: "Himachal Pradesh", textHi: "हिमाचल प्रदेश" },
          { id: "b", text: "Uttarakhand", textHi: "उत्तराखंड" },
          { id: "c", text: "Jammu & Kashmir", textHi: "जम्मू और कश्मीर" },
          { id: "d", text: "All of the above", textHi: "उपरोक्त सभी" }
        ],
        correctAnswer: "d",
        explanation: "All Himalayan states are affected by glacier melting, leading to flash floods, GLOFs (Glacial Lake Outburst Floods), and water security issues.",
        explanationHi: "सभी हिमालयी राज्य ग्लेशियर पिघलने से प्रभावित हैं, जिससे अचानक बाढ़, GLOFs (ग्लेशियल लेक आउटबर्स्ट फ्लड्स), और जल सुरक्षा की समस्याएं हैं।",
        difficulty: "easy",
        points: 10
      },
      {
        id: 306,
        type: "multiple-choice",
        question: "India's National Action Plan on Climate Change (NAPCC) includes how many missions?",
        questionHi: "जलवायु परिवर्तन पर भारत की राष्ट्रीय कार्य योजना (NAPCC) में कितने मिशन शामिल हैं?",
        options: [
          { id: "a", text: "6 missions", textHi: "6 मिशन" },
          { id: "b", text: "8 missions", textHi: "8 मिशन" },
          { id: "c", text: "10 missions", textHi: "10 मिशन" },
          { id: "d", text: "12 missions", textHi: "12 मिशन" }
        ],
        correctAnswer: "b",
        explanation: "NAPCC includes 8 missions: Solar, Enhanced Energy Efficiency, Sustainable Habitat, Water, Sustaining Himalayan Ecosystem, Green India, Sustainable Agriculture, and Strategic Knowledge.",
        explanationHi: "NAPCC में 8 मिशन शामिल हैं: सोलर, बेहतर ऊर्जा दक्षता, टिकाऊ आवास, जल, हिमालयी पारिस्थितिकी तंत्र का रखरखाव, हरित भारत, टिकाऊ कृषि, और रणनीतिक ज्ञान।",
        difficulty: "medium",
        points: 15
      },
      {
        id: 307,
        type: "true-false",
        question: "The monsoon patterns in India have become more unpredictable due to climate change.",
        questionHi: "जलवायु परिवर्तन के कारण भारत में मानसून के पैटर्न अधिक अप्रत्याशित हो गए हैं।",
        correctAnswer: true,
        explanation: "Climate change has made monsoons more erratic with delayed onset, early withdrawal, and extreme precipitation events.",
        explanationHi: "जलवायु परिवर्तन ने मानसून को देरी से आने, जल्दी चले जाने और अत्यधिक वर्षा की घटनाओं के साथ अधिक अनियमित बना दिया है।",
        difficulty: "easy",
        points: 10
      }
    ],
    hints: [
      "Consider coastal cities and their vulnerability",
      "Think about India's emission ranking globally",
      "Remember recent updates to India's climate commitments",
      "Consider historical temperature data",
      "Think about all Himalayan regions",
      "Remember the structure of India's climate policy",
      "Consider changes in weather patterns over decades"
    ],
    tags: ["climate-change", "global-warming", "paris-agreement", "renewable-energy", "adaptation"],
    grade: [9, 10, 11, 12],
    estimatedTime: 10,
    createdAt: "2024-01-15T13:00:00Z"
  },

  {
    id: 4,
    title: "Renewable Energy in India Quiz",
    titleHi: "भारत में नवीकरणीय ऊर्जा प्रश्नोत्तरी",
    slug: "renewable-energy-india-quiz",
    category: "energy",
    difficulty: "intermediate",
    timeLimit: 420, // 7 minutes
    passingScore: 75,
    description: "Test your knowledge about renewable energy sources, projects, and policies in India.",
    descriptionHi: "भारत में नवीकरणीय ऊर्जा स्रोतों, परियोजनाओं और नीतियों के बारे में अपने ज्ञान का परीक्षण करें।",
    questions: [
      {
        id: 401,
        type: "multiple-choice",
        question: "Which is the world's largest solar power plant located in India?",
        questionHi: "भारत में स्थित दुनिया की सबसे बड़ी सोलर पावर प्लांट कौन सी है?",
        options: [
          { id: "a", text: "Bhadla Solar Park, Rajasthan", textHi: "भड़ला सोलर पार्क, राजस्थान" },
          { id: "b", text: "Kurnool Ultra Mega Solar Park, Andhra Pradesh", textHi: "कुर्नूल अल्ट्रा मेगा सोलर पार्क, आंध्र प्रदेश" },
          { id: "c", text: "Pavagada Solar Park, Karnataka", textHi: "पावागड़ा सोलर पार्क, कर्नाटक" },
          { id: "d", text: "Rewa Solar Park, Madhya Pradesh", textHi: "रीवा सोलर पार्क, मध्य प्रदेश" }
        ],
        correctAnswer: "a",
        explanation: "Bhadla Solar Park in Rajasthan is currently the world's largest operational solar power plant with a capacity of 2,245 MW.",
        explanationHi: "राजस्थान में भड़ला सोलर पार्क वर्तमान में 2,245 MW की क्षमता के साथ दुनिया का सबसे बड़ा परिचालित सोलर पावर प्लांट है।",
        difficulty: "medium",
        points: 15
      },
      {
        id: 402,
        type: "true-false",
        question: "India is among the top 5 countries globally in wind energy capacity.",
        questionHi: "भारत पवन ऊर्जा क्षमता में वैश्विक रूप से शीर्ष 5 देशों में है।",
        correctAnswer: true,
        explanation: "India ranks 4th globally in wind power capacity with over 70 GW installed, after China, USA, and Germany.",
        explanationHi: "भारत 70 GW से अधिक स्थापित क्षमता के साथ पवन ऊर्जा में चीन, अमेरिका और जर्मनी के बाद वैश्विक स्तर पर 4वें स्थान पर है।",
        difficulty: "medium",
        points: 15
      },
      {
        id: 403,
        type: "multiple-choice",
        question: "Which state in India has the highest solar energy potential?",
        questionHi: "भारत में किस राज्य में सबसे अधिक सौर ऊर्जा क्षमता है?",
        options: [
          { id: "a", text: "Gujarat", textHi: "गुजरात" },
          { id: "b", text: "Rajasthan", textHi: "राजस्थान" },
          { id: "c", text: "Maharashtra", textHi: "महाराष्ट्र" },
          { id: "d", text: "Karnataka", textHi: "कर्नाटक" }
        ],
        correctAnswer: "b",
        explanation: "Rajasthan has the highest solar potential in India with excellent solar irradiation levels and vast available land.",
        explanationHi: "राजस्थान में उत्कृष्ट सौर विकिरण स्तर और विशाल उपलब्ध भूमि के साथ भारत में सबसे अधिक सौर क्षमता है।",
        difficulty: "easy",
        points: 10
      },
      {
        id: 404,
        type: "fill-in-blank",
        question: "India's current renewable energy capacity is approximately _____ GW (as of 2024).",
        questionHi: "भारत की वर्तमान नवीकरणीय ऊर्जा क्षमता लगभग _____ GW है (2024 तक)।",
        correctAnswers: ["180", "175-185", "180 GW"],
        explanation: "India's renewable energy capacity reached approximately 180 GW by 2024, including solar, wind, hydro, and biomass.",
        explanationHi: "2024 तक भारत की नवीकरणीय ऊर्जा क्षमता सौर, पवन, जल और बायोमास सहित लगभग 180 GW तक पहुंच गई।",
        difficulty: "medium",
        points: 15
      },
      {
        id: 405,
        type: "multiple-choice",
        question: "The 'One Sun One World One Grid' (OSOWOG) initiative was launched by which country?",
        questionHi: "'वन सन वन वर्ल्ड वन ग्रिड' (OSOWOG) पहल किस देश द्वारा शुरू की गई थी?",
        options: [
          { id: "a", text: "USA", textHi: "अमेरिका" },
          { id: "b", text: "China", textHi: "चीन" },
          { id: "c", text: "India", textHi: "भारत" },
          { id: "d", text: "Germany", textHi: "जर्मनी" }
        ],
        correctAnswer: "c",
        explanation: "OSOWOG was launched by India to create a global network of solar power generation and distribution.",
        explanationHi: "OSOWOG भारत द्वारा सौर ऊर्जा उत्पादन और वितरण का एक वैश्विक नेटवर्क बनाने के लिए शुरू किया गया था।",
        difficulty: "medium",
        points: 15
      }
    ],
    hints: [
      "Consider major solar installations in desert regions",
      "Think about India's global renewable energy ranking",
      "Consider geographical factors for solar potential",
      "Look at recent renewable energy statistics",
      "Remember India's international energy initiatives"
    ],
    tags: ["renewable-energy", "solar-power", "wind-energy", "sustainable-development"],
    grade: [8, 9, 10, 11],
    estimatedTime: 7,
    createdAt: "2024-01-15T13:30:00Z"
  }
];

export const quizCategories = [
  {
    id: "water",
    name: "Water Conservation",
    nameHi: "जल संरक्षण",
    description: "Quizzes about water conservation, harvesting, and management",
    descriptionHi: "जल संरक्षण, संचयन और प्रबंधन के बारे में प्रश्नोत्तरी",
    icon: "💧",
    color: "#3B82F6"
  },
  {
    id: "biodiversity",
    name: "Biodiversity & Wildlife",
    nameHi: "जैव विविधता और वन्यजीव",
    description: "Quizzes about Indian wildlife, conservation, and biodiversity",
    descriptionHi: "भारतीय वन्यजीव, संरक्षण और जैव विविधता के बारे में प्रश्नोत्तरी",
    icon: "🐅",
    color: "#10B981"
  },
  {
    id: "climate",
    name: "Climate Change",
    nameHi: "जलवायु परिवर्तन",
    description: "Quizzes about climate change impacts and mitigation",
    descriptionHi: "जलवायु परिवर्तन के प्रभाव और शमन के बारे में प्रश्नोत्तरी",
    icon: "🌍",
    color: "#F59E0B"
  },
  {
    id: "energy",
    name: "Renewable Energy",
    nameHi: "नवीकरणीय ऊर्जा",
    description: "Quizzes about renewable energy sources and technologies",
    descriptionHi: "नवीकरणीय ऊर्जा स्रोत और प्रौद्योगिकियों के बारे में प्रश्नोत्तरी",
    icon: "☀️",
    color: "#EF4444"
  },
  {
    id: "waste",
    name: "Waste Management",
    nameHi: "अपशिष्ट प्रबंधन",
    description: "Quizzes about waste reduction, recycling, and management",
    descriptionHi: "अपशिष्ट न्यूनीकरण, पुनर्चक्रण और प्रबंधन के बारे में प्रश्नोत्तरी",
    icon: "♻️",
    color: "#8B5CF6"
  }
];

export default quizzes;