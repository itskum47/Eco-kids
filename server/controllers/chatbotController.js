const axios = require('axios');

const INVOKE_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';
const STREAM = true;

const SYSTEM_PROMPT = `You are EcoBot, an environmental education assistant for Indian school students aged 10-18. Answer questions about climate change, water conservation, waste management, tree planting, and biodiversity. Keep answers under 80 words. Use Indian examples like Ganga river, Western Ghats, Delhi pollution. Be friendly and encouraging.`;

const LANGUAGE_INSTRUCTIONS = {
  hi: 'IMPORTANT: You must reply ONLY in Hindi language.',
  bn: 'IMPORTANT: You must reply ONLY in Bengali language.',
  ta: 'IMPORTANT: You must reply ONLY in Tamil language.',
  te: 'IMPORTANT: You must reply ONLY in Telugu language.',
  mr: 'IMPORTANT: You must reply ONLY in Marathi language.',
  kn: 'IMPORTANT: You must reply ONLY in Kannada language.',
  gu: 'IMPORTANT: You must reply ONLY in Gujarati language.',
  pa: 'IMPORTANT: You must reply ONLY in Punjabi language.',
  en: 'Reply in English.'
};

const FALLBACKS = {
  en: [
    'Plant trees! Every tree absorbs 21kg CO2 per year 🌳',
    'Save water — turn off taps while brushing 💧',
    'Segregate waste into wet and dry ♻️'
  ],
  hi: [
    'पेड़ लगाएं! हर पेड़ सालाना 21kg CO2 सोखता है 🌳',
    'पानी बचाएं — ब्रश करते समय नल बंद रखें 💧',
    'कचरे को गीला और सूखा अलग करें ♻️'
  ],
  bn: [
    'গাছ লাগান! প্রতিটি গাছ বার্ষিক 21kg CO2 শোষণ করে 🌳',
    'জল বাঁচান — দাঁত মাজার সময় কল বন্ধ রাখুন 💧',
    'ভেজা ও শুকনো আবর্জনা আলাদা করুন ♻️'
  ],
  ta: [
    'மரங்கள் நடுங்கள்! ஒவ்வொரு மரமும் ஆண்டுக்கு 21kg CO2 உறிஞ்சும் 🌳',
    'தண்ணீர் சேமியுங்கள் — பல் துலக்கும்போது குழாயை மூடுங்கள் 💧',
    'கழிவுகளை ஈரம் மற்றும் உலர்ந்ததாக பிரியுங்கள் ♻️'
  ],
  te: [
    'చెట్లు నాటండి! ప్రతి చెట్టు సంవత్సరానికి 21kg CO2 గ్రహిస్తుంది 🌳',
    'నీరు ఆదా చేయండి — పళ్ళు తోముతున్నప్పుడు కుళాయి మూయండి 💧',
    'వ్యర్థాలను తడి మరియు పొడిగా వేరు చేయండి ♻️'
  ],
  mr: [
    'झाडे लावा! प्रत्येक झाड दरवर्षी 21kg CO2 शोषते 🌳',
    'पाणी वाचवा — दात घासताना नळ बंद ठेवा 💧',
    'कचरा ओला आणि सुका वेगळा करा ♻️'
  ],
  kn: [
    'ಮರಗಳನ್ನು ನೆಡಿ! ಪ್ರತಿ ಮರ ವರ್ಷಕ್ಕೆ 21kg CO2 ಹೀರುತ್ತದೆ 🌳',
    'ನೀರು ಉಳಿಸಿ — ಹಲ್ಲು ಉಜ್ಜುವಾಗ ನಲ್ಲಿ ಮುಚ್ಚಿ 💧',
    'ತ್ಯಾಜ್ಯವನ್ನು ಒದ್ದೆ ಮತ್ತು ಒಣಗಿದ್ದಾಗಿ ಬೇರ್ಪಡಿಸಿ ♻️'
  ],
  gu: [
    'વૃક્ષો વાવો! દરેક ઝાડ વાર્ષિક 21kg CO2 શોષે છે 🌳',
    'પાણી બચાવો — દાંત સાફ કરતી વખતે નળ બંધ રાખો 💧',
    'કચરાને ભીનો અને સૂકો અલગ કરો ♻️'
  ],
  pa: [
    'ਰੁੱਖ ਲਗਾਓ! ਹਰ ਰੁੱਖ ਸਾਲਾਨਾ 21kg CO2 ਸੋਖਦਾ ਹੈ 🌳',
    'ਪਾਣੀ ਬਚਾਓ — ਦੰਦ ਸਾਫ਼ ਕਰਦੇ ਸਮੇਂ ਨਲਕਾ ਬੰਦ ਰੱਖੋ 💧',
    'ਕੂੜੇ ਨੂੰ ਗਿੱਲਾ ਅਤੇ ਸੁੱਕਾ ਵੱਖ ਕਰੋ ♻️'
  ]
};

async function collectReplyFromStream(stream) {
  return new Promise((resolve, reject) => {
    let buffer = '';
    let reply = '';

    stream.on('data', (chunk) => {
      buffer += chunk.toString('utf-8');

      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line || !line.startsWith('data:')) continue;

        const payload = line.replace(/^data:\s*/, '');
        if (!payload || payload === '[DONE]') continue;

        try {
          const parsed = JSON.parse(payload);
          const delta = parsed?.choices?.[0]?.delta?.content;
          const full = parsed?.choices?.[0]?.message?.content;
          if (typeof delta === 'string') reply += delta;
          else if (typeof full === 'string') reply += full;
        } catch {
          // Ignore non-JSON stream frames
        }
      }
    });

    stream.on('end', () => resolve(reply.trim()));
    stream.on('error', reject);
  });
}

exports.chat = async (req, res) => {
  const { message, language = 'en' } = req.body;
  const normalizedLanguage = String(language || 'en').split('-')[0].toLowerCase();
  if (!message) return res.status(400).json({ error: 'Message required' });

  try {
    const headers = {
      Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`,
      Accept: STREAM ? 'text/event-stream' : 'application/json',
      'Content-Type': 'application/json'
    };

    const fullPrompt = `${SYSTEM_PROMPT}\n${LANGUAGE_INSTRUCTIONS[normalizedLanguage] || LANGUAGE_INSTRUCTIONS.en}`;

    const payload = {
      model: 'meta/llama-3.1-8b-instruct',
      messages: [
        { role: 'system', content: fullPrompt },
        { role: 'user', content: message }
      ],
      max_tokens: 150,
      temperature: 0.60,
      top_p: 0.95,
      stream: STREAM
    };

    const response = await axios.post(INVOKE_URL, payload, {
      headers,
      responseType: STREAM ? 'stream' : 'json',
      timeout: 8000
    });

    const reply = STREAM
      ? await collectReplyFromStream(response.data)
      : response?.data?.choices?.[0]?.message?.content;

    if (!reply) {
      throw new Error('Empty response from NVIDIA API');
    }

    return res.json({ reply });

  } catch (error) {
    console.error('EcoBot API error:', error.message);
    const bucket = FALLBACKS[normalizedLanguage] || FALLBACKS.en;
    const fallback = bucket[Math.floor(Math.random() * bucket.length)];
    return res.json({ reply: fallback, fallback: true });
  }
};

// Backward-compatible exports for existing routes
exports.postMessage = exports.chat;
exports.getHistory = async (req, res) => res.json({ success: true, data: { messages: [], count: 0 } });
exports.clearHistory = async (req, res) => res.json({ success: true, message: 'Chat history cleared' });
