import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

// Handle ES modules dirnaem/filename pathing
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// IN-MEMORY DATABASE STATE FOR RAPID DEPLOYMENT (Daroon DB arrays)
const db = {
  users: [
    { id: 'usr-1', name: 'Rebwar Ali', email: 'rebwaraliahmer@gmail.com', password: '123', role: 'client' as const, registeredAt: new Date(2026, 4, 1).toISOString() },
    { id: 'usr-admin', name: 'Daroon Admin', email: 'admin@daroon.krd', password: 'admin', role: 'admin' as const, registeredAt: new Date(2026, 0, 1).toISOString() }
  ],
  therapists: [
    {
      id: 'therapist-1',
      name: 'Dr. Zanyar Ako',
      specialty: 'anxiety' as const,
      languages: ['KU', 'EN'],
      experience: '8',
      onlineStatus: 'online' as const,
      priceSession: 25000,
      photo: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=300&q=80',
      rating: 4.9,
      reviewsCount: 142,
      bio: 'Specialized in Cognitive Behavioral Therapy (CBT) for overcoming severe anxiety, panic attacks, stress management, and emotional exhaustion. Based in Erbil.',
      isFeatured: true
    },
    {
      id: 'therapist-2',
      name: 'Dr. Bushra Fawzi',
      specialty: 'depression' as const,
      languages: ['KU', 'AR', 'EN'],
      experience: '12',
      onlineStatus: 'online' as const,
      priceSession: 30000,
      photo: 'https://images.unsplash.com/photo-1594824813573-246434e33963?auto=format&fit=crop&w=300&q=80',
      rating: 5.0,
      reviewsCount: 238,
      bio: 'Clinical experience helping youngsters and adults deal with clinical depression, trauma processing, and grief counselor certification. Fluent in Arabic and Kurdish. Based in Sulaymaniyah.',
      isFeatured: true
    },
    {
      id: 'therapist-3',
      name: 'Dr. Rebin Peshraw',
      specialty: 'family' as const,
      languages: ['KU', 'EN'],
      experience: '6',
      onlineStatus: 'offline' as const,
      priceSession: 20000,
      photo: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80',
      rating: 4.7,
      reviewsCount: 95,
      bio: 'Resolving family conflicts, behavioral issues in children, parent-child communicative strategies. Highly active in Erbil. Over six years of continuous practice.',
      isFeatured: false
    },
    {
      id: 'therapist-4',
      name: 'Dr. Ala Hussein',
      specialty: 'marriage' as const,
      languages: ['KU', 'AR'],
      experience: '15',
      onlineStatus: 'online' as const,
      priceSession: 35000,
      photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&q=80',
      rating: 4.8,
      reviewsCount: 310,
      bio: 'Renowned expert in marriage counseling, conflict resolution, intimacy counseling, and life alignment. Practice since 2011 helping hundreds of couples restore harmony. Based in Duhok.',
      isFeatured: true
    }
  ],
  chats: [] as { id: string; clientId: string; therapistId: string; isPaid: boolean; unlockedAt?: string; messages: any[]; typing?: boolean }[],
  transactions: [
    {
      id: 'tx-101',
      clientId: 'usr-1',
      clientName: 'Rebwar Ali',
      therapistId: 'therapist-1',
      therapistName: 'Dr. Zanyar Ako',
      amount: 25000,
      type: 'session' as const,
      status: 'completed' as const,
      paymentMethod: 'stripe' as const,
      timestamp: new Date(2026, 4, 15, 14, 30).toISOString()
    },
    {
      id: 'tx-102',
      clientId: 'usr-1',
      clientName: 'Rebwar Ali',
      amount: 45000,
      type: 'subscription' as const,
      status: 'completed' as const,
      paymentMethod: 'paypal' as const,
      timestamp: new Date(2026, 4, 20, 10, 15).toISOString()
    }
  ],
  expenses: [
    { id: 'exp-1', description: 'SMS Notification Gateway', category: 'Technology', amount: 80000, date: new Date(2026, 4, 10).toISOString() },
    { id: 'exp-2', description: 'Erbil Office Rent Support', category: 'Rent', amount: 350000, date: new Date(2026, 4, 12).toISOString() },
    { id: 'exp-3', description: 'Local Medical Marketing Kurdish Ads', category: 'Marketing', amount: 150000, date: new Date(2026, 4, 18).toISOString() }
  ],
  payouts: [
    { id: 'pay-1', therapistId: 'therapist-1', therapistName: 'Dr. Zanyar Ako', amount: 200000, status: 'completed', date: new Date(2026, 4, 14).toISOString() },
    { id: 'pay-2', therapistId: 'therapist-2', therapistName: 'Dr. Bushra Fawzi', amount: 450000, status: 'completed', date: new Date(2026, 4, 19).toISOString() }
  ],
  systemConfig: {
    serviceName: 'Daroon Kurdistan',
    commissionPercentage: 20,
    maintenanceMode: false,
    contactPhone: '+964 750 123 4567',
    contactEmail: 'support@daroon.krd'
  }
};

// Auto Responses for Therapist Mock Interactive Flow
const RESPONSES_POOL: Record<string, { en: string; ku: string; ar: string }[]> = {
  anxiety: [
    {
      en: "I hear you, and it is completely natural to feel overwhelmed sometimes. Let us take a deep breath together. Tell me, what triggered this feeling today?",
      ku: "گوێم لێیە، و بە تەواوی ئاساییە هەندێک جار هەست بە ماندووێتی دڵ بکەیت. با پێکەوە هەناسەیەکی قووڵ هەڵکێشین. پێم بڵێ، ئەمڕۆ چی بووە هۆی دروستبوونی ئەم هەستە؟",
      ar: "أنا هنا لأستمع إليك، ومن الطبيعي جداً الشعور بالتوتر والقلق أحياناً. دعنا نأخذ نفساً عميقاً معاً. أخبرني، ما الذي حفز هذا الشعور اليوم؟"
    },
    {
      en: "Thank you for sharing this. Anxiety can feel very physical. Are you experiencing rapid breathing or tension in your body right now?",
      ku: "سوپاس بۆ هاوبەشکردنی ئەمە. دڵەڕاوکێ دەکرێت زۆر جەستەیی بێت. ئایا ئێستا هەست بە نائارامی یان گرژی لە جەستەتدا دەکەیت؟",
      ar: "شكراً لمشاركتي هذا. القلق قد ينعكس بشدة على الجسد. هل تشعر الآن بضيق تنفس أو تشنج في عضلاتك؟"
    }
  ],
  depression: [
    {
      en: "I am really sorry you are experiencing this darkness, but remember you are not alone in it. Let us take things very slowly. How can I best support you in this moment?",
      ku: "زۆر دڵگرانم کە بەم خەمۆکییەدا تێدەپەڕیت، بەڵام لەبیرت بێت تۆ بە تەنیا نیت. با هەنگاو بە هەنگاو بچینە پێش. چۆن بتوانم لەم ساتەدا باشترین پاڵپشتیت بکەم؟",
      ar: "أنا آسف جداً لأنك تمر بهذه الأوقات المظلمة، لكن تذكر دائماً أنك لست وحدك. دعنا نأخذ الأمور ببطء شديد وبخطوات بسيطة. كيف يمكنني مساندتك الآن؟"
    },
    {
      en: "It takes courage to express these feelings. Even a minor discussion is a huge step. Did anything change in your daily routine recently?",
      ku: "دەرربڕینی ئەم هەستانە ئازایەتییەکی زۆری دەوێت. تەنانەت قسەکردنی کەمیش هەنگاوێکی گەورەیە. ئایا لەم دواییانەدا هیچ گۆڕانکارییەک لە ژیانی ڕۆژانەتدا ڕوویداوە؟",
      ar: "التعبير عن هذه المشاعر يتطلب شجاعة كبيرة. الحديث البسيط هو خطوة عظيمة للأمام. هل حدث أي تغيير في روتينك اليومي مؤخراً؟"
    }
  ],
  family: [
    {
      en: "Family dynamics can be incredibly exhausting and complicated. Can you describe who is involved and how this makes you feel?",
      ku: "پەیوەندییەکانی خێزان دەکرێت زۆر ئاڵۆز و هیلاککەر بن. دەتوانیت بۆم ڕوون بکەیتەوە کێ بەشدارە لەم کێشەیەدا و چ هەستێکی بۆت دروست کردووە؟",
      ar: "العلاقات العائلية قد تكون معقدة ومرهقة للغاية في بعض الأحيان. هل يمكنك إطلاعي على أطراف هذه المشكلة وكيف تشعر حيالها؟"
    },
    {
      en: "Every family goes through phases of friction. Setting healthy boundaries is essential. Let us explore some communication practices together.",
      ku: "هەموو خێزانێک قۆناغی ناکۆکی بەڕێ دەکات. دانانی سنووری تەندروست گرنگە. با پێکەوە چەند ڕێگەیەکی گونجاوی گفتوگۆ تاقی بکەینەوە.",
      ar: "كل عائلة تمر بفترات من عدم التفاهم. وضع حدود صحية وسليمة هو أمر أساسي. دعنا نستكشف معاً بعض مهارات التواصل البناء."
    }
  ],
  marriage: [
    {
      en: "Marriage counseling involves understanding different angles of communication. How long have you and your partner felt this distance?",
      ku: "ڕاوێژکاری هاوسەرگیری پێویستی بە تێگەیشتنە لە لایەنە جیاوازەکانی گفتوگۆ. چەند کاتە تۆ و هاوسەرەکەت هەست بەم دوورکەوتنەوەیە دەکەن؟",
      ar: "تتطلب الاستشارات الزوجية فهم زوايا التواصل المختلفة بين الطرفين. منذ متى تشعر أنت وشريكك بهذا التباعد والجفاء؟"
    },
    {
      en: "Restoring mutual trust is a pathway built on validation and understanding. What is the most critical conflict topic between you two lately?",
      ku: "گەڕاندنەوەی متمانەی یەکتر پێویستی بە تێگەیشتن و دانپیانانە. گرنگترین خاڵی ناکۆکی نێوانتان لەم دواییانەدا چی بووە؟",
      ar: "استعادة الثقة المتبادلة تبنى على أسس التفاهم والتقدير. ما هو الموضوع الأكثر إثارة للخلاف بينكما مؤخراً؟"
    }
  ]
};

// Prepopulate initial messages
let chatCounter = 1;
const getNextChatId = () => `chat-${chatCounter++}`;

// API ENDPOINTS
// 1. Auth routes
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are strictly required.' });
  }
  const exists = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    return res.status(400).json({ error: 'Account with this email already registered.' });
  }
  const newUser = {
    id: `usr-${Date.now()}`,
    name,
    email,
    password,
    role: 'client' as const,
    registeredAt: new Date().toISOString()
  };
  db.users.push(newUser);
  res.status(201).json({ id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email address or passcode.' });
  }
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
});

// 2. Therapists List
app.get('/api/therapists', (req, res) => {
  res.json(db.therapists);
});

app.post('/api/admin/therapists', (req, res) => {
  const { name, specialty, languages, experience, onlineStatus, priceSession, photo, bio } = req.body;
  const newTherapist = {
    id: `therapist-${Date.now()}`,
    name,
    specialty,
    languages: Array.isArray(languages) ? languages : [languages],
    experience,
    onlineStatus: onlineStatus || 'offline',
    priceSession: Number(priceSession) || 25000,
    photo: photo || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&q=80',
    rating: 5.0,
    reviewsCount: 0,
    bio: bio || 'Kurdistan-based certified therapeutic counselor.',
    isFeatured: false
  };
  db.therapists.push(newTherapist);
  res.status(201).json(newTherapist);
});

// 3. User Active Chats
app.get('/api/chats', (req, res) => {
  const clientId = req.query.clientId as string;
  if (!clientId) {
    return res.json([]);
  }
  const activeChats = db.chats.filter(c => c.clientId === clientId);
  res.json(activeChats);
});

// Create/Fetch specific chat with a doctor
app.get('/api/chats/get-or-create', (req, res) => {
  const { clientId, therapistId } = req.query;
  if (!clientId || !therapistId) {
    return res.status(400).json({ error: 'Missing clientId or therapistId' });
  }

  let chat = db.chats.find(c => c.clientId === clientId && c.therapistId === therapistId);
  if (!chat) {
    const therapist = db.therapists.find(t => t.id === therapistId);
    chat = {
      id: getNextChatId(),
      clientId: clientId as string,
      therapistId: therapistId as string,
      isPaid: false, // Starts locked if unpaid
      messages: [
        {
          id: `msg-welcome-${Date.now()}`,
          chatId: '', // Added later
          senderId: therapistId as string,
          senderRole: 'therapist',
          text: `Assalamu Alaikum. This is ${therapist ? therapist.name : 'your doctor'} clinical channel. How can I help support your emotional well-being today? Click below to unlock our secure chat.`,
          timestamp: new Date().toISOString(),
          seen: true
        }
      ]
    };
    chat.messages[0].chatId = chat.id;
    db.chats.push(chat);
  }
  res.json(chat);
});

// Trigger payments for a chat
app.post('/api/pay', (req, res) => {
  const { clientId, clientName, chatId, therapistId, amount, paymentMethod, type } = req.body;
  
  // Track system transactions
  const tx = {
    id: `tx-${Date.now()}`,
    clientId,
    clientName,
    therapistId,
    therapistName: db.therapists.find(t => t.id === therapistId)?.name || 'Daroon general subscription',
    amount: Number(amount) || 25000,
    type: type || 'session',
    status: 'completed' as const,
    paymentMethod: paymentMethod || 'stripe',
    timestamp: new Date().toISOString()
  };
  db.transactions.push(tx);

  // Unlock the associated chat if session payment type
  if (chatId) {
    const chatIndex = db.chats.findIndex(c => c.id === chatId);
    if (chatIndex !== -1) {
      db.chats[chatIndex].isPaid = true;
      db.chats[chatIndex].unlockedAt = new Date().toISOString();
    }
  } else if (therapistId && clientId) {
    // Or find any locked chat with that doctor
    const chatIndex = db.chats.findIndex(c => c.clientId === clientId && c.therapistId === therapistId);
    if (chatIndex !== -1) {
      db.chats[chatIndex].isPaid = true;
      db.chats[chatIndex].unlockedAt = new Date().toISOString();
    }
  }

  res.json({ success: true, transaction: tx });
});

// Post message into chat and schedule reply
app.post('/api/chats/:id/message', (req, res) => {
  const chatId = req.params.id;
  const { senderId, senderRole, text, fileUrl, fileName, lang = 'ku' } = req.body;

  const chat = db.chats.find(c => c.id === chatId);
  if (!chat) {
    return res.status(404).json({ error: 'Mental therapy room not found.' });
  }

  // Double check if subscription payed or individual session unlocked
  if (!chat.isPaid && senderRole === 'client') {
    return res.status(403).json({ error: 'Chat session locked. Complete billing to send messages.' });
  }

  const newMessage = {
    id: `msg-${Date.now()}`,
    chatId,
    senderId,
    senderRole,
    text: text || '',
    timestamp: new Date().toISOString(),
    seen: false,
    fileUrl,
    fileName
  };

  chat.messages.push(newMessage);

  // 4. Trigger therapist typing status and caring interactive response simulated nicely
  if (senderRole === 'client') {
    chat.typing = true;

    // Simulate doctor responding after 2.5 seconds
    setTimeout(() => {
      chat.typing = false;
      const therapist = db.therapists.find(t => t.id === chat.therapistId);
      const specialty = therapist ? therapist.specialty : 'anxiety';
      const pool = RESPONSES_POOL[specialty] || RESPONSES_POOL['anxiety'];
      const responseIndex = Math.floor(Math.random() * pool.length);
      const template = pool[responseIndex];
      
      let localizedMsg = template.ku;
      if (lang === 'en') localizedMsg = template.en;
      else if (lang === 'ar') localizedMsg = template.ar;

      const responseMessage = {
        id: `msg-reply-${Date.now()}`,
        chatId,
        senderId: chat.therapistId,
        senderRole: 'therapist' as const,
        text: localizedMsg,
        timestamp: new Date().toISOString(),
        seen: false
      };

      chat.messages.push(responseMessage);
    }, 2500);
  }

  res.json(newMessage);
});

// Update messages as seen
app.post('/api/chats/:id/read', (req, res) => {
  const chatId = req.params.id;
  const { readerRole } = req.body;
  const chat = db.chats.find(c => c.id === chatId);
  if (chat) {
    chat.messages.forEach(m => {
      if (m.senderRole !== readerRole) {
        m.seen = true;
      }
    });
  }
  res.json({ success: true });
});

// Admin Metrics API
app.get('/api/admin/metrics', (req, res) => {
  // Aggregate revenue stats in IQD/USD
  const totalRevenue = db.transactions.reduce((sum, tx) => sum + tx.amount, 0);
  const commissionRatio = db.systemConfig.commissionPercentage / 100;
  const adminShare = Math.round(totalRevenue * commissionRatio);
  const payoutShare = totalRevenue - adminShare;

  // Aggregate user profiles count
  const clientsCount = db.users.filter(u => u.role === 'client').length;
  const therapistsCount = db.therapists.length;

  res.json({
    totalRevenue,
    adminShare,
    payoutShare,
    clientsCount,
    therapistsCount,
    transactions: db.transactions,
    expenses: db.expenses,
    payouts: db.payouts,
    allChats: db.chats,
    systemConfig: db.systemConfig
  });
});

app.post('/api/admin/expenses', (req, res) => {
  const { description, category, amount } = req.body;
  const newExp = {
    id: `exp-${Date.now()}`,
    description,
    category,
    amount: Number(amount) || 10000,
    date: new Date().toISOString()
  };
  db.expenses.push(newExp);
  res.json(newExp);
});

app.put('/api/admin/expenses/:id', (req, res) => {
  const { id } = req.params;
  const { description, category, amount } = req.body;
  const expIndex = db.expenses.findIndex(e => e.id === id);
  if (expIndex !== -1) {
    db.expenses[expIndex] = {
      ...db.expenses[expIndex],
      description,
      category: category || 'Technology',
      amount: Number(amount) || 0
    };
    return res.json(db.expenses[expIndex]);
  }
  res.status(404).json({ error: 'Expense not found' });
});

app.delete('/api/admin/expenses/:id', (req, res) => {
  const { id } = req.params;
  const expIndex = db.expenses.findIndex(e => e.id === id);
  if (expIndex !== -1) {
    const deleted = db.expenses.splice(expIndex, 1);
    return res.json({ success: true, deleted });
  }
  res.status(404).json({ error: 'Expense not found' });
});

app.post('/api/admin/payouts', (req, res) => {
  const { therapistId, amount } = req.body;
  const therapist = db.therapists.find(t => t.id === therapistId);
  const newPayout = {
    id: `pay-${Date.now()}`,
    therapistId,
    therapistName: therapist ? therapist.name : 'Unknown Practitioner',
    amount: Number(amount) || 50000,
    status: 'completed',
    date: new Date().toISOString()
  };
  db.payouts.push(newPayout);
  res.json(newPayout);
});

// VITE MIDDLEWARE INTERFACE INTEGRATION
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Daroon Server] Listening on http://localhost:${PORT}`);
  });
}

startServer();
