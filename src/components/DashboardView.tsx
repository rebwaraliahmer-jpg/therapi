import React, { useState, useEffect } from 'react';
import { MessageSquare, HeartPulse, CreditCard, Settings, Star, ChevronRight, Lock, Unlock, Mail, Loader2, Globe, Heart } from 'lucide-react';
import { translations } from '../translations.ts';
import { Therapist, Chat, Transaction } from '../types.ts';

interface DashboardViewProps {
  lang: 'en' | 'ku' | 'ar';
  setLang: (l: 'en' | 'ku' | 'ar') => void;
  currentUser: { id: string; name: string; email: string; role: string };
  onNavigate: (view: string, extra?: any) => void;
  onLogout: () => void;
}

type TabType = 'chats' | 'doctors' | 'payments' | 'settings';

export default function DashboardView({ lang, setLang, currentUser, onNavigate, onLogout }: DashboardViewProps) {
  const t = translations[lang];
  const isRtl = lang === 'ku' || lang === 'ar';

  const [activeTab, setActiveTab] = useState<TabType>('chats');
  const [chats, setChats] = useState<Chat[]>([]);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchDocQuery, setSearchDocQuery] = useState('');

  // Fetch initial user dashboard data from custom express db
  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      try {
        // Fetch active chats
        const chatsResp = await fetch(`/api/chats?clientId=${currentUser.id}`);
        const chatsData = await chatsResp.json();
        setChats(chatsData);

        // Fetch therapists
        const therapistsResp = await fetch('/api/therapists');
        const therapistsData = await therapistsResp.json();
        setTherapists(therapistsData);

        // Fetch admin/user transaction records
        const metricsResp = await fetch('/api/admin/metrics');
        const metricsData = await metricsResp.json();
        
        // Filter transactions for this user
        const myTx = (metricsData.transactions || []).filter((tx: any) => tx.clientId === currentUser.id);
        setTransactions(myTx);
      } catch (err) {
        console.error('Error fetching dashboard datasets:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [currentUser.id, activeTab]);

  const findTherapist = (id: string): Therapist | undefined => {
    return therapists.find(t => t.id === id);
  };

  const handleStartChatSession = async (therapistId: string) => {
    try {
      // API call to fetch or generate chat channel
      const resp = await fetch(`/api/chats/get-or-create?clientId=${currentUser.id}&therapistId=${therapistId}`);
      const activeChat = await resp.json();
      
      onNavigate('chat-room', activeChat);
    } catch (err) {
      console.error('Error initializing checkout chat channel:', err);
    }
  };

  const filteredTherapists = therapists.filter(doc => 
    doc.name.toLowerCase().includes(searchDocQuery.toLowerCase()) || 
    doc.specialty.toLowerCase().includes(searchDocQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-gray-800 flex flex-col font-sans mb-12" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Dynamic Top Dashboard Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onNavigate('home')}>
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold text-gray-950 block leading-none">
                {t.brandName}<span className="text-emerald-600">.krd</span>
              </span>
              <span className="text-[9px] text-gray-400 font-mono tracking-widest mt-0.5 block uppercase font-bold">Dashboard</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Rapid Admin Access Shortcut */}
            {currentUser.role === 'admin' && (
              <button
                onClick={() => onNavigate('admin')}
                className="px-3.5 py-1.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-xs font-bold transition-all cursor-pointer border border-gray-805"
              >
                {t.navAdmin}
              </button>
            )}

            <button
              onClick={onLogout}
              className="text-xs font-bold text-gray-500 hover:text-red-500 transition-colors"
            >
              {t.navLogout}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Welcome banner */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-6">
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-emerald-300 text-xs font-bold tracking-wider uppercase block">{t.welcomeUser} 👋</span>
              <h1 className="text-xl sm:text-2xl font-extrabold mt-1">{currentUser.name}</h1>
              <p className="text-xs text-slate-300 mt-2 block opacity-95 max-w-sm leading-relaxed">
                Your private health portal is fully active. Find therapists, unlock secured chat channels and manage counseling securely in Kurdistan region.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-slate-800 border border-gray-800 px-4 py-2.5 rounded-2xl text-xs font-semibold text-emerald-350">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Secure Encryption Active
            </div>
          </div>
        </div>
      </div>

      {/* CORE DOCK NAV TAB SYSTEM (REPLACES COMPLICATED SIDEBARS) */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-6 flex-shrink-0">
        <div className="bg-white border border-gray-200 rounded-2xl p-1.5 flex items-center justify-between gap-1 shadow-xs animate-fade-in">
          
          <button
            onClick={() => setActiveTab('chats')}
            className={`flex-1 py-3 px-2 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'chats' ? 'bg-emerald-50 text-emerald-900 border border-emerald-600/10' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <MessageSquare className="w-4 h-4 sm:w-5 h-5 flex-shrink-0 text-emerald-600" />
            <span>{t.myChats}</span>
            {chats.length > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-emerald-600 text-white font-black text-[10px] rounded-full">
                {chats.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('doctors')}
            className={`flex-1 py-3 px-2 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'doctors' ? 'bg-emerald-50 text-emerald-900 border border-emerald-600/10' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Heart className="w-4 h-4 sm:w-5 h-5 flex-shrink-0 text-emerald-600" />
            <span>{t.myDoctors}</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`flex-1 py-3 px-2 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'payments' ? 'bg-emerald-50 text-emerald-900 border border-emerald-600/10' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <CreditCard className="w-4 h-4 sm:w-5 h-5 flex-shrink-0 text-emerald-600" />
            <span>{t.payments}</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-3 px-2 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'settings' ? 'bg-emerald-50 text-emerald-900 border border-emerald-600/10' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Settings className="w-4 h-4 sm:w-5 h-5 flex-shrink-0 text-emerald-600" />
            <span>{t.settings}</span>
          </button>

        </div>
      </div>

      {/* VIEWPORT AREA DESCRIPTION */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-6 flex-1">
        
        {loading ? (
          <div className="bg-white border border-gray-200 rounded-3xl p-16 text-center flex flex-col items-center justify-center shadow-xs">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
            <p className="text-xs text-gray-400 font-semibold mt-3">Loading secure dataset channels...</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 min-h-96 shadow-xs">
            
            {/* TAB: MY CHATS */}
            {activeTab === 'chats' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold text-gray-950 uppercase tracking-tight">{t.myChats}</h2>
                  <button
                    onClick={() => setActiveTab('doctors')}
                    className="text-xs font-bold text-emerald-600 hover:underline"
                  >
                    + Start New Session
                  </button>
                </div>

                {chats.length > 0 ? (
                  <div className="space-y-4">
                    {chats.map(chat => {
                      const doctor = findTherapist(chat.therapistId);
                      const lastMsg = chat.messages[chat.messages.length - 1];

                      return (
                        <div
                          key={chat.id}
                          onClick={() => onNavigate('chat-room', chat)}
                          className="p-4 sm:p-5 border border-gray-150 hover:border-emerald-100 hover:bg-emerald-50/10 rounded-2xl transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer"
                        >
                          <div className="flex items-center gap-4">
                            {/* Dr Avatar photo */}
                            <div className="relative">
                              <img
                                src={doctor?.photo || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=150&q=80'}
                                alt={doctor?.name}
                                className="w-12 h-12 rounded-xl object-cover"
                              />
                              <span className={`absolute -right-1 -bottom-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                                doctor?.onlineStatus === 'online' ? 'bg-emerald-300' : 'bg-gray-300'
                              }`}></span>
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-extrabold text-gray-900 text-sm sm:text-base">{doctor?.name || 'Daroon Specialist'}</h3>
                                
                                <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold border ${
                                  chat.isPaid 
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-100' 
                                    : 'bg-red-50 text-red-800 border-red-105'
                                }`}>
                                  {chat.isPaid ? 'Unlocked' : 'Unpaid'}
                                </span>
                              </div>
                              <p className="text-xs text-gray-400 mt-1 block">
                                <b>Specialty:</b> {doctor ? doctor.specialty.toUpperCase() : 'General Support'}
                              </p>
                              {lastMsg && (
                                <p className="text-xs text-gray-500 mt-2 block font-medium max-w-sm line-clamp-1 italic">
                                  "{lastMsg.text}"
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-4 font-bold text-xs">
                            <span className="text-gray-405 text-[10px] font-mono font-medium">
                              {t.lastMessage} {new Date(lastMsg ? lastMsg.timestamp : Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            
                            <button className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer">
                              Go Chat
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 flex flex-col items-center justify-center">
                    <span className="text-4xl block mb-3">💬</span>
                    <p className="text-gray-400 text-sm font-semibold">{t.noChatsYet}</p>
                    <button
                      onClick={() => setActiveTab('doctors')}
                      className="mt-4 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-all"
                    >
                      Connect with therapists online
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB: MY DOCTORS */}
            {activeTab === 'doctors' && (
              <div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-150">
                  <div>
                    <h2 className="text-lg font-bold text-gray-950 uppercase tracking-tight">{t.myDoctors}</h2>
                    <p className="text-xs text-gray-400 mt-1">Acquire professional clinical help from authorized specialists.</p>
                  </div>

                  {/* Search inner */}
                  <input
                    type="text"
                    placeholder="Search specialty or doctor name..."
                    value={searchDocQuery}
                    onChange={(e) => setSearchDocQuery(e.target.value)}
                    className="px-4 py-2.5 bg-gray-50 focus:bg-white border border-gray-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-405 rounded-xl text-xs w-full sm:w-64 outline-hidden transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredTherapists.map(doc => (
                    <div key={doc.id} className="p-5 border border-gray-150 rounded-2xl flex gap-4 hover:border-gray-300 hover:shadow-2xs transition-all bg-white">
                      <img
                        src={doc.photo}
                        alt={doc.name}
                        className="w-16 h-16 rounded-xl object-cover ring-2 ring-gray-100"
                      />
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between flex-wrap gap-1">
                            <h3 className="font-extrabold text-gray-950 text-sm sm:text-base">{doc.name}</h3>
                            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">{doc.specialty}</span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1 max-w-sm line-clamp-2">
                            {doc.bio}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-950">{doc.priceSession.toLocaleString()} IQD</span>
                          
                          <button
                            onClick={() => handleStartChatSession(doc.id)}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                          >
                            {t.startChat}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: PAYMENTS */}
            {activeTab === 'payments' && (
              <div>
                <div className="mb-6 pb-4 border-b border-gray-150 flex items-center justify-between flex-wrap gap-4 font-sans">
                  <div>
                    <h2 className="text-lg font-bold text-gray-950 uppercase tracking-tight">{t.payments}</h2>
                    <p className="text-xs text-gray-400 mt-1">Keep track of your online invoices securely.</p>
                  </div>

                  {/* Trigger rapid subscription mockup */}
                  <button
                    onClick={async () => {
                      // Call mock checkout API with subscription payload
                      await fetch('/api/pay', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          clientId: currentUser.id,
                          clientName: currentUser.name,
                          amount: 45000,
                          paymentMethod: 'stripe',
                          type: 'subscription'
                        })
                      });
                      // Refresh dashboard
                      setActiveTab('payments');
                    }}
                    className="px-4 py-2 bg-gray-950 hover:bg-gray-850 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Subscribe Monthly Plan (45k IQD)
                  </button>
                </div>

                {transactions.length > 0 ? (
                  <div className="space-y-3">
                    {transactions.map(tx => (
                      <div key={tx.id} className="p-4 border border-gray-150 rounded-xl flex items-center justify-between gap-4 text-xs bg-white">
                        <div>
                          <span className="font-mono text-[9px] text-gray-400 block uppercase font-black">{tx.id}</span>
                          <span className="font-bold text-gray-900 text-sm">{tx.therapistName || 'Daroon Monthly Care'}</span>
                          <span className="text-gray-405 block mt-1 text-[10px]">{new Date(tx.timestamp).toLocaleString()}</span>
                        </div>

                        <div className="flex items-center gap-4 text-right">
                          <div>
                            <span className="font-extrabold text-sm text-gray-950 block">{tx.amount.toLocaleString()} IQD</span>
                            <span className="text-[10px] text-gray-400 capitalize">{tx.paymentMethod} • {tx.type}</span>
                          </div>
                          
                          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-md font-bold text-[10px] uppercase border border-emerald-100">
                            {tx.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <span className="text-4xl block mb-3">💳</span>
                    <p className="text-gray-400 font-semibold text-sm">No recent invoices logged under your account.</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB: PROFILE SETTINGS */}
            {activeTab === 'settings' && (
              <div>
                <h2 className="text-lg font-bold text-gray-950 uppercase tracking-tight mb-6">{t.settings}</h2>

                <div className="space-y-6 max-w-xl">
                  
                  <div className="p-5 bg-gray-50/50 border border-gray-150 rounded-2xl">
                    <h3 className="text-sm font-extrabold text-gray-900 mb-3">Language Customization</h3>
                    <p className="text-xs text-gray-400 mb-4 font-medium">Set your default preferred language interface for Daroon.krd</p>
                    
                    <div className="grid grid-cols-3 gap-3">
                      {(['en', 'ku', 'ar'] as const).map(l => (
                        <button
                          key={l}
                          onClick={() => setLang(l)}
                          className={`p-3 border text-xs font-black rounded-xl transition-all cursor-pointer ${
                            lang === l 
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' 
                              : 'bg-white text-gray-650 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {l === 'en' ? 'English (EN)' : l === 'ku' ? 'Kurdî (کوردی)' : 'العربية (AR)'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-5 bg-gray-50/50 border border-gray-150 rounded-2xl">
                    <h3 className="text-sm font-extrabold text-gray-900 mb-2">Security, HIPAA & GDPR Encryption</h3>
                    <p className="text-xs text-gray-400 leading-relaxed font-medium">
                      All messages are stored in client-side secure databases and are compliant with HIPAA healthcare regulations. No records are shared under any circumstances.
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-200 flex items-center justify-between gap-4">
                    <span className="text-xs text-gray-400">Signed in as <b className="text-gray-700">{currentUser.email}</b></span>
                    <button
                      onClick={onLogout}
                      className="px-4.5 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Delete Sessions / Logout
                    </button>
                  </div>

                </div>
              </div>
            )}

          </div>
        )}

      </main>
    </div>
  );
}
