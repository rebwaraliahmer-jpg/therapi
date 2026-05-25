import React from 'react';
import { ChevronLeft, Star, ShieldCheck, Clock, Award, Languages, DollarSign, MessageSquare } from 'lucide-react';
import { Therapist } from '../types.ts';
import { translations } from '../translations.ts';

interface TherapistProfileProps {
  lang: 'en' | 'ku' | 'ar';
  therapist: Therapist;
  onNavigate: (view: string, extra?: any) => void;
  currentUser: any;
  onStartChat: (therapistId: string) => void;
}

export default function TherapistProfile({ lang, therapist, onNavigate, currentUser, onStartChat }: TherapistProfileProps) {
  const t = translations[lang];
  const isRtl = lang === 'ku' || lang === 'ar';

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-gray-800 flex flex-col font-sans" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Profiler header navigational trigger */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <button
            onClick={() => onNavigate('home')}
            className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-950 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors border border-gray-200"
          >
            <ChevronLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
            <span>{t.navHome}</span>
          </button>

          <span className="text-xs font-bold text-gray-400 font-mono tracking-widest uppercase">
            Clinician Profile
          </span>
        </div>
      </header>

      {/* Main body profile card */}
      <main className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-12 flex-1">
        
        <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-10 shadow-sm relative overflow-hidden">
          
          {/* Top banner style background */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-emerald-800 opacity-90 -z-0"></div>

          <div className="relative z-10 pt-16 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6 pb-6 border-b border-gray-100">
            
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
              {/* Doctor Headshot Photo */}
              <div className="relative">
                <img
                  src={therapist.photo}
                  alt={therapist.name}
                  referrerPolicy="no-referrer"
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover bg-white p-1 border-4 border-white shadow-md"
                />
                <span className={`absolute bottom-1 right-2 w-4 h-4 rounded-full border-2 border-white ${
                  therapist.onlineStatus === 'online' ? 'bg-emerald-500' : 'bg-gray-300'
                }`}></span>
              </div>

              <div>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-[10px] font-bold uppercase tracking-wider block w-max mx-auto sm:mx-0 border border-emerald-100">
                  {therapist.specialty.toUpperCase()} CONSULTANT
                </span>
                
                <h1 className="text-2xl font-extrabold text-gray-900 mt-2">{therapist.name}</h1>
                
                <div className="flex items-center gap-1.5 mt-2 justify-center sm:justify-start">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span className="text-xs font-bold text-gray-900">{therapist.rating.toFixed(1)}</span>
                  <span className="text-xs text-gray-400 font-medium">({therapist.reviewsCount} verified patient feedback logs)</span>
                </div>
              </div>
            </div>

            {/* Price indicator status tag */}
            <div className="text-center sm:text-right">
              <span className="text-[10px] text-gray-400 font-mono block uppercase tracking-wider">{t.sessionPrice}</span>
              <span className="text-xl font-black text-gray-950 block mt-1">
                {therapist.priceSession.toLocaleString()} IQD
              </span>
              <span className="text-[10px] text-gray-400 block">per unlocked chat dialogue</span>
            </div>

          </div>

          {/* Core Specifications Bento Metadata */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-8 border-b border-gray-100 text-center">
            
            <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
              <Clock className="w-5 h-5 text-emerald-600 mx-auto mb-2" />
              <span className="text-[10px] text-gray-400 font-mono block uppercase">EXPERIENCE</span>
              <span className="text-sm font-extrabold text-gray-800 block mt-1">{therapist.experience} Years active</span>
            </div>

            <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
              <Languages className="w-5 h-5 text-emerald-600 mx-auto mb-2" />
              <span className="text-[10px] text-gray-400 font-mono block uppercase">LANGUAGES</span>
              <span className="text-sm font-extrabold text-gray-800 block mt-1">{therapist.languages.join(' / ')}</span>
            </div>

            <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
              <ShieldCheck className="w-5 h-5 text-emerald-600 mx-auto mb-2" />
              <span className="text-[10px] text-gray-400 font-mono block uppercase">CREDENTIALS</span>
              <span className="text-sm font-extrabold text-gray-800 block mt-1">Clinical certified</span>
            </div>

            <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
              <Award className="w-5 h-5 text-emerald-600 mx-auto mb-2" />
              <span className="text-[10px] text-gray-400 font-mono block uppercase">RATING</span>
              <span className="text-sm font-extrabold text-gray-800 block mt-1">100% Secure</span>
            </div>

          </div>

          {/* Counselor Abstract Biography */}
          <div className="py-8 space-y-4">
            <h2 className="text-base font-bold text-gray-900 uppercase tracking-wider">Clinical Biography</h2>
            <p className="text-gray-650 text-sm sm:text-base leading-relaxed">
              {therapist.bio}
            </p>
            <p className="text-gray-650 text-sm sm:text-base leading-relaxed">
              This therapist is medically certified to help people and couples deal with issues under strict clinical rules. They are practicing actively and can reply in Kurdish Sorani and Arabic, helping you find solutions for psychological distress.
            </p>
          </div>

          {/* Secure details warning */}
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-start gap-3.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-emerald-800 block">End-to-End HIPAA Message Privacy</span>
              <span className="text-[11px] text-emerald-700 block mt-1 leading-relaxed">
                By starting a text chat session, you agree to Daroon Kurdistan privacy laws. No information, conversations, or files are visible to anybody except your treating clinician.
              </span>
            </div>
          </div>

          {/* Start Chat primary call to action */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => onStartChat(therapist.id)}
              className="w-full py-4.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl transition-all shadow-sm shadow-emerald-200/50 hover:shadow-md text-center flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageSquare className="w-5 h-5" />
              {t.startChat} ({therapist.priceSession.toLocaleString()} IQD)
            </button>
          </div>

          <p className="text-center text-[10px] text-gray-400 mt-4 leading-none">
            Clicking Start Chat will instantly fetch or update your secure conversation stream. Complete payment to activate full access.
          </p>

        </div>

      </main>
    </div>
  );
}
