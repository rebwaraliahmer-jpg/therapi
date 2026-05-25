import React, { useState } from 'react';
import { Search, HeartPulse, ChevronRight, Check, ArrowRight, UserCheck, ShieldCheck, HelpCircle, Phone, Globe, Star } from 'lucide-react';
import { Therapist, Specialization, FAQItem } from '../types.ts';
import { translations, sampleTherapists, sampleFAQs } from '../translations.ts';

interface HomeViewProps {
  lang: 'en' | 'ku' | 'ar';
  setLang: (l: 'en' | 'ku' | 'ar') => void;
  onNavigate: (view: string, extra?: any) => void;
  currentUser: any;
  onLogout: () => void;
}

export default function HomeView({ lang, setLang, onNavigate, currentUser, onLogout }: HomeViewProps) {
  const t = translations[lang];
  const isRtl = lang === 'ku' || lang === 'ar';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [faqOpen, setFaqOpen] = useState<Record<string, boolean>>({});
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [contactSuccess, setContactSuccess] = useState(false);

  // Filter therapists
  const filteredTherapists = sampleTherapists.filter(therapist => {
    const matchesSearch = therapist.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          therapist.bio.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSpecialty = selectedSpecialty === 'all' || therapist.specialty === selectedSpecialty;
    
    return matchesSearch && matchesSpecialty;
  });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) return;
    setContactSuccess(true);
    setTimeout(() => {
      setContactForm({ name: '', email: '', message: '' });
      setContactSuccess(false);
    }, 4000);
  };

  const toggleFaq = (id: string) => {
    setFaqOpen(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-gray-800 flex flex-col font-sans" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* LOCAL STICKY NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 flex-shrink-0 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('home')}>
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-200">
              <HeartPulse className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-gray-900 block leading-none">
                {t.brandName} <span className="text-emerald-600 font-medium">.krd</span>
              </span>
              <span className="text-[10px] text-gray-400 font-mono tracking-widest uppercase mt-0.5 block">
                Kurdistan Online
              </span>
            </div>
          </div>

          {/* Nav Right (Languages, Actions) */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Language Picker */}
            <div className="relative inline-flex items-center gap-1.5 p-1 bg-gray-100 rounded-lg">
              {(['en', 'ku', 'ar'] as const).map(l => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                    lang === l ? 'bg-white text-emerald-700 shadow-xs border border-gray-100' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {l === 'en' ? 'EN' : l === 'ku' ? 'کوردی' : 'عربي'}
                </button>
              ))}
            </div>

            {/* Quick Navigation Control */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
                >
                  {t.navDashboard}
                </button>
                {currentUser.role === 'admin' && (
                  <button
                    onClick={() => onNavigate('admin')}
                    className="px-4 py-2 text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 rounded-xl transition-all"
                  >
                    {t.navAdmin}
                  </button>
                )}
                <button
                  onClick={onLogout}
                  className="p-2 text-gray-400 hover:text-red-500 rounded-xl hover:bg-red-50 transition-all font-semibold"
                  title="Logout"
                >
                  {t.navLogout}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('login')}
                  className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-all cursor-pointer"
                >
                  {t.navLogin}
                </button>
                <button
                  onClick={() => onNavigate('register')}
                  className="px-4.5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-750 rounded-xl shadow-sm shadow-emerald-200 transition-all cursor-pointer"
                >
                  {t.navRegister}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Text and Actions Column */}
            <div className={`lg:col-span-7 text-center ${isRtl ? 'lg:text-right lg:items-end' : 'lg:text-left lg:items-start'} flex flex-col items-center`}>
              
              {/* Tag alert */}
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-semibold mb-6 border border-emerald-100">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                {t.tagline}
              </div>

              <h1 id="hero-title" className={`text-3xl sm:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight ${lang === 'ku' ? 'font-droid-naskh' : ''}`}>
                {t.heroTitle}
              </h1>
              
              <p className="mt-6 text-base sm:text-lg text-gray-500 leading-relaxed max-w-2xl">
                {t.heroSub}
              </p>

              <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                <button
                  onClick={() => currentUser ? onNavigate('dashboard') : onNavigate('register')}
                  className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-2xl shadow-sm shadow-emerald-200 hover:shadow-md transition-all hover:-translate-y-0.5"
                >
                  {t.heroBtn}
                </button>
                
                <a
                  href="#therapists-list"
                  className="w-full sm:w-auto px-6 py-4 bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 font-semibold rounded-2xl shadow-xs border border-gray-200 transition-all text-center"
                >
                  {t.searchTherapists}
                </a>
              </div>

              {/* Quick Metrics */}
              <div className="mt-12 pt-10 border-t border-gray-100 grid grid-cols-3 gap-4 w-full text-center font-semibold text-gray-650">
                <div>
                  <span className="block text-2xl font-bold text-gray-900">100%</span>
                  <span className="text-xs text-gray-400 mt-1 block font-medium">Private & Safe</span>
                </div>
                <div className="border-x border-gray-100">
                  <span className="block text-2xl font-bold text-gray-900">4.9/5</span>
                  <span className="text-xs text-gray-400 mt-1 block font-medium">Patient Rating</span>
                </div>
                <div>
                  <span className="block text-2xl font-bold text-gray-900">&lt; 1 min</span>
                  <span className="text-xs text-gray-400 mt-1 block font-medium">Average Connection</span>
                </div>
              </div>
            </div>

            {/* Campaign Flyer/Poster Showcase Column */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative group max-w-sm w-full">
                {/* Visual subtle glow frame backing */}
                <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-[32px] blur-xl opacity-80 group-hover:opacity-100 transition duration-1000"></div>
                <div className="relative bg-[#FAFAFA] border border-gray-150 rounded-[32px] p-2.5 shadow-sm hover:shadow-md transition-all duration-300">
                  <img
                    src="/src/assets/images/therapist_banner_1779708215199.png"
                    alt="Daroon Kurdistan Therapist Service Banner Flyer"
                    referrerPolicy="no-referrer"
                    className="rounded-[22px] w-full object-cover shadow-xs"
                  />
                  {/* Decorative corner flyer campaign tag */}
                  <div className="absolute top-6 right-6 px-3 py-1.5 bg-emerald-900/95 backdrop-blur-md rounded-xl text-[9px] text-white font-black tracking-wider shadow-md uppercase border border-emerald-700/20">
                    Clinical Portal
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Decorative ambient background spots */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-emerald-400/5 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-emerald-300/5 rounded-full blur-3xl -z-10"></div>
      </section>

      {/* CORE SPECIALTY CATEGORIES */}
      <section className="py-16 bg-white border-y border-gray-150">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-950">
              {t.categories}
            </h2>
            <div className="h-1 w-12 bg-emerald-600 mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            
            {[
              { id: 'anxiety', label: t.catAnxiety, color: 'bg-emerald-50/80 text-emerald-800 border-emerald-100', icon: '🍃' },
              { id: 'depression', label: t.catDepression, color: 'bg-indigo-50/80 text-indigo-800 border-indigo-100', icon: '⛈️' },
              { id: 'family', label: t.catFamily, color: 'bg-sky-50/80 text-sky-800 border-sky-100', icon: '🏠' },
              { id: 'marriage', label: t.catMarriage, color: 'bg-pink-50/80 text-pink-800 border-pink-100', icon: '💍' }
            ].map(catalog => (
              <button
                key={catalog.id}
                onClick={() => setSelectedSpecialty(selectedSpecialty === catalog.id ? 'all' : catalog.id)}
                className={`flex flex-col items-center justify-center p-6 rounded-2xl border text-center transition-all cursor-pointer ${
                  selectedSpecialty === catalog.id 
                    ? 'border-emerald-500 bg-emerald-50/60 scale-102 ring-2 ring-emerald-500/15' 
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <span className="text-3xl mb-3 block">{catalog.icon}</span>
                <span className="font-bold text-gray-800 text-sm sm:text-base">{catalog.label}</span>
                <span className="text-[11px] text-gray-400 uppercase font-mono tracking-wider mt-1.5 block">
                  {selectedSpecialty === catalog.id ? 'Active Filter' : 'Click to Filter'}
                </span>
              </button>
            ))}

          </div>
        </div>
      </section>

      {/* SEARCH AND THERAPISTS DIRECTORY */}
      <section id="therapists-list" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header block with search filter */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-950 leading-tight">
                {t.featuredTherapists}
              </h2>
              <p className="text-sm text-gray-400 mt-2">
                All clinicians are fully accredited and verified by Kurdistan medical agencies.
              </p>
            </div>

            {/* Live Search Input */}
            <div className="relative w-full md:w-80 overflow-hidden">
              <Search className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 ${isRtl ? 'right-4' : 'left-4'}`} />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full py-3.5 bg-white border border-gray-200 rounded-2xl text-sm placeholder-gray-400 focus:outline-hidden focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all ${
                  isRtl ? 'pr-11 pl-4' : 'pl-11 pr-4'
                }`}
              />
            </div>
          </div>

          {/* Active Specialty reset */}
          {selectedSpecialty !== 'all' && (
            <div className="mb-6 flex items-center gap-2">
              <span className="text-xs text-gray-500 font-semibold">
                Filtering by: <b className="text-gray-900 uppercase font-bold">{selectedSpecialty}</b>
              </span>
              <button
                onClick={() => setSelectedSpecialty('all')}
                className="px-2.5 py-1 text-[10px] bg-red-50 text-red-700 hover:bg-red-100 font-bold rounded-lg border border-red-200 uppercase transition-colors"
              >
                Reset Filter
              </button>
            </div>
          )}

          {/* Doctors Grid */}
          {filteredTherapists.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredTherapists.map(doctor => (
                <div key={doctor.id} className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row gap-6">
                  
                  {/* Photo and indicators */}
                  <div className="flex-shrink-0 relative mx-auto sm:mx-0">
                    <img
                      src={doctor.photo}
                      alt={doctor.name}
                      referrerPolicy="no-referrer"
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover bg-gray-50 border border-gray-100"
                    />
                    <div className={`absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 shadow-xs ${
                      doctor.onlineStatus === 'online'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-gray-50 text-gray-400 border-gray-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${doctor.onlineStatus === 'online' ? 'bg-emerald-500 animate-ping' : 'bg-gray-400'}`}></span>
                      {doctor.onlineStatus === 'online' ? t.online : t.offline}
                    </div>
                  </div>

                  {/* Bio details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center flex-wrap gap-2 justify-between">
                        <h3 className="text-lg font-bold text-gray-900">{doctor.name}</h3>
                        <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                          <Star className="w-4 h-4 fill-amber-500" />
                          {doctor.rating.toFixed(1)}
                          <span className="text-xs text-gray-400 font-medium">({doctor.reviewsCount})</span>
                        </div>
                      </div>

                      <p className="text-xs text-emerald-700 font-bold uppercase tracking-wider mt-1 block">
                        {doctor.specialty === 'anxiety' ? t.catAnxiety : doctor.specialty === 'depression' ? t.catDepression : doctor.specialty === 'family' ? t.catFamily : t.catMarriage}
                      </p>

                      <p className="text-xs text-gray-500 mt-2 block font-medium">
                        <b>Languages:</b> {doctor.languages.join(' / ')} • <b>Experience:</b> {doctor.experience} {t.experienceYears}
                      </p>

                      <p className="text-gray-650 text-xs sm:text-sm mt-3 leading-relaxed line-clamp-2 italic">
                        "{doctor.bio}"
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between gap-4">
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase block font-mono tracking-wider">{t.sessionPrice}</span>
                        <span className="text-base font-extrabold text-gray-900">{doctor.priceSession.toLocaleString()} IQD</span>
                      </div>
                      
                      <button
                        onClick={() => onNavigate('therapist-profile', doctor)}
                        className="px-4.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 hover:shadow-md hover:shadow-emerald-200/20 text-white text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        {t.startChat}
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-3xl border border-gray-200 shadow-sm animate-fade-in">
              <span className="text-4xl block mb-4">🔍</span>
              <p className="text-gray-600 font-semibold mb-2">No doctors matched your current filter criteria.</p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedSpecialty('all'); }}
                className="text-xs font-bold text-emerald-600 hover:underline"
              >
                Clear all search parameters
              </button>
            </div>
          )}

        </div>
      </section>

      {/* TRANSPARENT PRICING PLANS */}
      <section className="py-20 bg-[#F8F9FA] border-y border-gray-150">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-950">
              {t.pricingTitle}
            </h2>
            <p className="text-gray-400 mt-3 text-sm">
              {t.pricingSub}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            
            {/* Session Purchase card */}
            <div className="bg-white border border-gray-200 rounded-3xl p-8 hover:border-gray-300 transition-all flex flex-col justify-between shadow-xs">
              <div>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold uppercase tracking-wider block w-max">
                  {t.pricingSession}
                </span>
                
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-gray-900">25,000</span>
                  <span className="text-gray-400 font-bold text-sm">IQD</span>
                </div>
                <span className="text-xs text-gray-400 mt-1 block">per unlocked chat channel</span>

                <p className="text-gray-500 text-sm mt-6 leading-relaxed">
                  {t.pricingSessionDetail}
                </p>

                <ul className="mt-8 space-y-3.5 text-sm">
                  {[
                    '24-hours access to primary therapist',
                    'Fully encrypted direct text dialogue',
                    'Media attachment uploading support',
                    'WhatsApp interactive theme support'
                  ].map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-gray-500">
                      <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => currentUser ? onNavigate('dashboard') : onNavigate('register')}
                className="mt-8 w-full py-4 bg-gray-900 hover:bg-gray-800 text-white text-sm font-bold rounded-2xl transition-all cursor-pointer"
              >
                {t.pricingBtn}
              </button>
            </div>

            {/* Dedicated subscription card */}
            <div className="bg-slate-900 text-white rounded-3xl p-8 shadow-md flex flex-col justify-between relative overflow-hidden">
              <div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-450/10 rounded-full blur-2xl"></div>
                
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-slate-800 text-emerald-300 rounded-full text-xs font-bold uppercase tracking-wider block w-max">
                    {t.pricingSubscribe}
                  </span>
                  <span className="px-2.5 py-0.5 bg-amber-400 text-slate-950 rounded-md text-[10px] font-bold uppercase tracking-wider block">
                    Best Value
                  </span>
                </div>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold">45,000</span>
                  <span className="text-emerald-300 font-bold text-sm">IQD</span>
                </div>
                <span className="text-xs text-slate-400 mt-1 block">per calendar Month (Subscription)</span>

                <p className="text-slate-350 text-sm mt-6 leading-relaxed">
                  {t.pricingSubscribeDetail}
                </p>

                <ul className="mt-8 space-y-3.5 text-sm">
                  {[
                    'Secure message logs unlocked with any doctor',
                    'Priority clinical team response times',
                    'Cancel or pause subscription anytime',
                    'Clinical administrative and receipt support'
                  ].map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-slate-300">
                      <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => currentUser ? onNavigate('dashboard') : onNavigate('register')}
                className="mt-8 w-full py-4 bg-white text-slate-950 hover:bg-emerald-50 text-sm font-bold rounded-2xl transition-all cursor-pointer"
              >
                {t.pricingBtn}
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* ACCORDION FAQ */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-950">
              {t.faqTitle}
            </h2>
            <p className="text-gray-400 mt-3 text-sm">
              {t.faqSub}
            </p>
          </div>

          <div className="space-y-4">
            {sampleFAQs.map((faq) => {
              const qText = faq.question[lang] || faq.question['en'];
              const aText = faq.answer[lang] || faq.answer['en'];
              const isOpen = !!faqOpen[faq.id];

              return (
                <div key={faq.id} className="border border-gray-150 rounded-2xl overflow-hidden transition-all bg-gray-50/50 hover:border-gray-250">
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-gray-900 text-sm sm:text-base hover:bg-gray-50 transition-colors"
                    dir={isRtl ? 'rtl' : 'ltr'}
                  >
                    <span>{qText}</span>
                    <HelpCircle className={`w-5 h-5 text-emerald-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="p-5 bg-white border-t border-gray-150 text-xs sm:text-sm text-gray-500 leading-relaxed">
                      {aText}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* FOOTER & CONTACT US */}
      <footer className="mt-auto bg-gray-950 text-white pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pb-12 border-b border-gray-900">
            
            {/* Info and Address */}
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
                  <HeartPulse className="w-6 h-6" />
                </div>
                <span className="text-xl font-bold tracking-tight text-white block">
                  {t.brandName}<span className="text-emerald-400 font-medium">.krd</span>
                </span>
              </div>
              
              <p className="mt-4 text-xs sm:text-sm text-gray-400 max-w-sm leading-relaxed">
                Daroon Kurdistan is an administrative platform for legal mental healthcare clinicians. We bring qualified online practitioners closer to individuals across Kurdistan.
              </p>

              <div className="mt-8 space-y-4 text-xs sm:text-sm text-gray-400">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-emerald-400" />
                  <span>+964 750 123 4567 • support@daroon.krd</span>
                </div>
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>Administrative Office: Erbil, Kurdistan Region, Iraq</span>
                </div>
              </div>
            </div>

            {/* Custom Interactive Contact Form */}
            <div id="contact-team" className="bg-[#111827] p-6 sm:p-8 rounded-3xl border border-gray-850 shadow-sm">
              <h3 className="text-lg font-bold text-white mb-2">{t.contactTitle}</h3>
              <p className="text-xs text-gray-400 mb-6">{t.contactSub}</p>

              {contactSuccess ? (
                <div className="p-4 bg-emerald-950/50 border border-emerald-900 rounded-xl text-xs text-emerald-300">
                  {t.contactSuccess}
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1.5 font-bold">{t.contactName}</label>
                      <input
                        type="text"
                        required
                        value={contactForm.name}
                        onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-3 bg-[#030712] border border-gray-800 rounded-xl text-xs placeholder-gray-600 text-white focus:outline-hidden focus:border-emerald-400 focus:ring-1 focus:ring-emerald-405"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1.5 font-bold">{t.contactEmail}</label>
                      <input
                        type="email"
                        required
                        value={contactForm.email}
                        onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-4 py-3 bg-[#030712] border border-gray-800 rounded-xl text-xs placeholder-gray-600 text-white focus:outline-hidden focus:border-emerald-400 focus:ring-1 focus:ring-emerald-405"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1.5 font-bold">{t.contactMsg}</label>
                    <textarea
                      required
                      rows={3}
                      value={contactForm.message}
                      onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                      className="w-full px-4 py-3 bg-[#030712] border border-gray-800 rounded-xl text-xs placeholder-gray-600 text-white focus:outline-hidden focus:border-emerald-400 focus:ring-1 focus:ring-emerald-405"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    {t.contactSend}
                  </button>
                </form>
              )}
            </div>

          </div>

          {/* Core Footer credits */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-6 text-[11px] text-gray-500">
            <span className="font-medium">
              © {new Date().getFullYear()} Daroon.krd (دارون ده‌روون). All clinical and legal rights reserved.
            </span>
            <div className="flex items-center gap-6">
              <span className="font-semibold text-gray-400">Licensed in KRG, Iraq</span>
              <span>•</span>
              <a href="#privacy" className="hover:text-white transition-colors">HIPAA Complaint Encryption</a>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}
