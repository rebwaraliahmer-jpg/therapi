import React, { useState, useEffect } from 'react';
import HomeView from './components/HomeView.tsx';
import AuthView from './components/AuthView.tsx';
import DashboardView from './components/DashboardView.tsx';
import TherapistProfile from './components/TherapistProfile.tsx';
import ChatView from './components/ChatView.tsx';
import AdminDashboard from './components/AdminDashboard.tsx';
import { Therapist, Chat } from './types.ts';

type ActiveView = 'home' | 'login' | 'register' | 'dashboard' | 'therapist-profile' | 'chat-room' | 'admin';

export default function App() {
  const [lang, setLang] = useState<'en' | 'ku' | 'ar'>('ku'); // Default beautifully to Kurdish (Sorani)
  const [view, setView] = useState<ActiveView>('home');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

  // Restore session from localStorage for seamless refreshing during preview edits
  useEffect(() => {
    const cached = localStorage.getItem('daroon_cur_user');
    if (cached) {
      try {
        setCurrentUser(JSON.parse(cached));
      } catch (e) {
        localStorage.removeItem('daroon_cur_user');
      }
    }
  }, []);

  const handleAuthSuccess = (userData: any) => {
    setCurrentUser(userData);
    localStorage.setItem('daroon_cur_user', JSON.stringify(userData));
    // If client, route directly to simplified dashboard. If admin, go to Admin dashboard pane.
    if (userData.role === 'admin') {
      setView('admin');
    } else {
      setView('dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('daroon_cur_user');
    setView('home');
  };

  const handleStartChatFromProfile = async (therapistId: string) => {
    if (!currentUser) {
      // Force quick sign-up and return here
      setView('register');
      return;
    }

    try {
      const resp = await fetch(`/api/chats/get-or-create?clientId=${currentUser.id}&therapistId=${therapistId}`);
      const chat = await resp.json();
      setSelectedChat(chat);
      setView('chat-room');
    } catch (err) {
      console.error('Error starting chat workflow:', err);
    }
  };

  const handleNavigation = (targetView: string, extraData?: any) => {
    if (targetView === 'therapist-profile' && extraData) {
      setSelectedTherapist(extraData);
    }
    if (targetView === 'chat-room' && extraData) {
      setSelectedChat(extraData);
    }
    setView(targetView as ActiveView);
  };

  return (
    <div className={lang === 'ku' ? 'lang-ku' : ''}>
      {view === 'home' && (
        <HomeView
          lang={lang}
          setLang={setLang}
          onNavigate={handleNavigation}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
      )}

      {(view === 'login' || view === 'register') && (
        <AuthView
          lang={lang}
          setLang={setLang}
          onNavigate={handleNavigation}
          onAuthSuccess={handleAuthSuccess}
          initialMode={view}
        />
      )}

      {view === 'dashboard' && currentUser && (
        <DashboardView
          lang={lang}
          setLang={setLang}
          currentUser={currentUser}
          onNavigate={handleNavigation}
          onLogout={handleLogout}
        />
      )}

      {view === 'therapist-profile' && selectedTherapist && (
        <TherapistProfile
          lang={lang}
          therapist={selectedTherapist}
          onNavigate={handleNavigation}
          currentUser={currentUser}
          onStartChat={handleStartChatFromProfile}
        />
      )}

      {view === 'chat-room' && currentUser && selectedChat && (
        <ChatView
          lang={lang}
          currentUser={currentUser}
          initialChat={selectedChat}
          onNavigate={handleNavigation}
        />
      )}

      {view === 'admin' && currentUser && currentUser.role === 'admin' && (
        <AdminDashboard
          lang={lang}
          currentUser={currentUser}
          onNavigate={handleNavigation}
        />
      )}
    </div>
  );
}
