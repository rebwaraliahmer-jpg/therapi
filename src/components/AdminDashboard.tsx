import React, { useState, useEffect } from 'react';
import { Users, User, Landmark, DollarSign, Activity, FileText, ArrowRight, ShieldCheck, Plus, Trash, Globe, Settings, BarChart3, PieChart, Volume2, HelpCircle, Eye, BadgeAlert, Coins, TrendingUp, Loader2, Download } from 'lucide-react';
import { Therapist, Transaction } from '../types.ts';

interface AdminDashboardProps {
  lang: 'en' | 'ku' | 'ar';
  currentUser: any;
  onNavigate: (view: string) => void;
}

type AdminTab = 
  | 'users' 
  | 'therapists' 
  | 'payments' 
  | 'revenue' 
  | 'bookings' 
  | 'chats' 
  | 'expenses' 
  | 'payouts' 
  | 'notifications' 
  | 'cms' 
  | 'settings';

export default function AdminDashboard({ lang, currentUser, onNavigate }: AdminDashboardProps) {

  const [activeTab, setActiveTab] = useState<AdminTab>('revenue');
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // CMS forms
  const [newTherapist, setNewTherapist] = useState({
    name: '', specialty: 'anxiety', languages: 'KU, EN', experience: '5', priceSession: 25000, bio: '', photo: ''
  });
  
  // Expenses form
  const [newExpense, setNewExpense] = useState({ description: '', category: 'Technology', amount: 50000 });
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [newPayout, setNewPayout] = useState({ therapistId: 'therapist-1', amount: 150000 });

  const fetchAdminMetrics = async () => {
    try {
      const resp = await fetch('/api/admin/metrics');
      const data = await resp.json();
      setMetrics(data);
    } catch (err) {
      console.error('Error fetching admin datasets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminMetrics();
  }, [activeTab]);

  const handleAddTherapist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTherapist.name) return;

    try {
      const resp = await fetch('/api/admin/therapists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTherapist.name,
          specialty: newTherapist.specialty,
          languages: newTherapist.languages.split(',').map(s => s.trim()),
          experience: newTherapist.experience,
          onlineStatus: 'online',
          priceSession: Number(newTherapist.priceSession),
          bio: newTherapist.bio,
          photo: newTherapist.photo
        })
      });
      if (resp.ok) {
        setNewTherapist({ name: '', specialty: 'anxiety', languages: 'KU, EN', experience: '5', priceSession: 25000, bio: '', photo: '' });
        fetchAdminMetrics();
        alert('Therapist saved successfully under CMS!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.description || !newExpense.amount) return;

    try {
      if (editingExpenseId) {
        const resp = await fetch(`/api/admin/expenses/${editingExpenseId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newExpense)
        });
        if (resp.ok) {
          setNewExpense({ description: '', category: 'Technology', amount: 50000 });
          setEditingExpenseId(null);
          fetchAdminMetrics();
        }
      } else {
        const resp = await fetch('/api/admin/expenses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newExpense)
        });
        if (resp.ok) {
          setNewExpense({ description: '', category: 'Technology', amount: 50000 });
          fetchAdminMetrics();
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      const resp = await fetch(`/api/admin/expenses/${id}`, {
        method: 'DELETE'
      });
      if (resp.ok) {
        fetchAdminMetrics();
        if (editingExpenseId === id) {
          setEditingExpenseId(null);
          setNewExpense({ description: '', category: 'Technology', amount: 50000 });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadChatLogs = (chat: any) => {
    const doctor = metrics?.therapists?.find((t: any) => t.id === chat.therapistId);
    const chatLogData = {
      chatId: chat.id,
      therapistId: chat.therapistId,
      therapistName: doctor?.name || 'Unassigned',
      timestamp: new Date().toISOString(),
      messagesCount: chat.messages?.length || 0,
      messages: chat.messages || []
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(chatLogData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `chat_log_${chat.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleAddPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPayout.amount) return;

    try {
      const resp = await fetch('/api/admin/payouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPayout)
      });
      if (resp.ok) {
        setNewPayout({ therapistId: 'therapist-1', amount: 150000 });
        fetchAdminMetrics();
        alert('Payout processed successfully!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Safe variables
  const getExpensesTotal = () => metrics?.expenses?.reduce((s: number, e: any) => s + e.amount, 0) || 0;
  const getPayoutsTotal = () => metrics?.payouts?.reduce((s: number, p: any) => s + p.amount, 0) || 0;
  const getNetBalance = () => {
    const rev = metrics?.totalRevenue || 0;
    const exp = getExpensesTotal();
    const pay = getPayoutsTotal();
    return rev - exp - pay;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex font-sans leading-relaxed">
      
      {/* 1. SaaS Side navigation panel */}
      <aside className="w-64 border-r border-slate-800 bg-slate-950 flex flex-col justify-between p-6 flex-shrink-0">
        <div>
          <div className="flex items-center gap-3 cursor-pointer mb-8" onClick={() => onNavigate('home')}>
            <div className="w-9 h-9 bg-emerald-600 text-white rounded-lg flex items-center justify-center font-bold">
              K
            </div>
            <div>
              <span className="text-base font-extrabold text-white block">Daroon Admin</span>
              <span className="text-[9px] text-emerald-400 font-mono block">SaaS KRG v2.2</span>
            </div>
          </div>

          <nav className="space-y-1.5 text-xs font-semibold">
            {[
              { id: 'revenue', label: 'Financial Revenue & Analytics', icon: TrendingUp },
              { id: 'users', label: 'Users & Patient List', icon: Users },
              { id: 'therapists', label: 'Therapists accredited', icon: User },
              { id: 'payments', label: 'Payment transactions', icon: DollarSign },
              { id: 'bookings', label: 'Bookings & Planners', icon: FileText },
              { id: 'chats', label: 'Chat Monitoring', icon: Eye },
              { id: 'expenses', label: 'Operating Expenses', icon: Landmark },
              { id: 'payouts', label: 'Therapist Payouts', icon: Coins },
              { id: 'cms', label: 'SaaS CMS content', icon: ShieldCheck },
              { id: 'settings', label: 'System Settings', icon: Globe }
            ].map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as AdminTab)}
                  className={`w-full py-2.5 px-3 rounded-lg text-left flex items-center gap-3 transition-colors cursor-pointer ${
                    activeTab === item.id ? 'bg-emerald-600 text-white font-extrabold shadow-sm shadow-emerald-600/10' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-850'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-800">
          <button
            onClick={() => onNavigate('dashboard')}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            ← Patient Dashboard
          </button>
        </div>
      </aside>

      {/* 2. Main Active Work space */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="h-18 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-30 px-8 flex items-center justify-between">
          <h1 className="text-lg font-black tracking-tight uppercase text-emerald-405">
            Administrative Space: <span className="text-white">{activeTab.toUpperCase()}</span>
          </h1>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="px-2.5 py-1 bg-emerald-950 text-emerald-300 rounded-md border border-emerald-900">
              ● Online Server Active
            </span>
            <span className="text-slate-400">Secured SSH</span>
          </div>
        </header>

        {/* Content area */}
        <main className="p-8 flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-16 text-center flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
              <p className="text-xs text-slate-400 mt-2">Loading SaaS data streams...</p>
            </div>
          ) : (
            <div>
              
              {/* TAB: REVENUE & GENERAL ANALYTICS */}
              {activeTab === 'revenue' && (
                <div className="space-y-8">
                  
                  {/* Aggregates row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-slate-950 border border-slate-850 p-6 rounded-2xl">
                      <TrendingUp className="w-6 h-6 text-emerald-500 mb-2" />
                      <span className="text-[10px] text-slate-400 font-mono uppercase">Gross income</span>
                      <span className="text-xl font-black text-white block mt-1">{(metrics?.totalRevenue || 0).toLocaleString()} IQD</span>
                      <span className="text-[10px] text-slate-500">100% completed payments</span>
                    </div>

                    <div className="bg-slate-950 border border-slate-850 p-6 rounded-2xl">
                      <Landmark className="w-6 h-6 text-red-500 mb-2" />
                      <span className="text-[10px] text-slate-400 font-mono uppercase">Operation Expenses</span>
                      <span className="text-xl font-black text-white block mt-1">{getExpensesTotal().toLocaleString()} IQD</span>
                      <span className="text-[10px] text-slate-500">SMS, rent, ads</span>
                    </div>

                    <div className="bg-slate-950 border border-slate-850 p-6 rounded-2xl">
                      <Coins className="w-6 h-6 text-sky-500 mb-2" />
                      <span className="text-[10px] text-slate-400 font-mono uppercase">Payouts Processed</span>
                      <span className="text-xl font-black text-white block mt-1">{getPayoutsTotal().toLocaleString()} IQD</span>
                      <span className="text-[10px] text-slate-500">Shared with doctors</span>
                    </div>

                    <div className="bg-slate-950 border border-slate-850 p-6 rounded-2xl">
                      <Activity className="w-6 h-6 text-emerald-500 mb-2" />
                      <span className="text-[10px] text-slate-400 font-mono uppercase">Net Profit balance</span>
                      <span className="text-xl font-black text-white block mt-1">{getNetBalance().toLocaleString()} IQD</span>
                      <span className="text-[10px] text-slate-500">SaaS commissions</span>
                    </div>
                  </div>

                  {/* SVG Chart */}
                  <div className="bg-slate-950 border border-slate-850 p-6 rounded-2xl">
                    <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">Clinical Earnings Chart (IQD)</h3>
                    
                    <div className="h-48 w-full flex items-end gap-2 border-b border-l border-slate-800 pb-2 pl-2">
                      <div className="flex-1 bg-emerald-500/20 hover:bg-emerald-550 h-[20%] rounded-t-xs transition-all relative group cursor-pointer">
                        <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 px-2 py-0.5 rounded text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Jan (45k)</span>
                      </div>
                      <div className="flex-1 bg-emerald-500/30 hover:bg-emerald-550 h-[35%] rounded-t-xs transition-all relative group cursor-pointer">
                        <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 px-2 py-0.5 rounded text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Feb (90k)</span>
                      </div>
                      <div className="flex-1 bg-emerald-500/40 hover:bg-emerald-550 h-[55%] rounded-t-xs transition-all relative group cursor-pointer">
                        <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 px-2 py-0.5 rounded text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Mar (150k)</span>
                      </div>
                      <div className="flex-1 bg-emerald-500/60 hover:bg-emerald-550 h-[70%] rounded-t-xs transition-all relative group cursor-pointer">
                        <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 px-2 py-0.5 rounded text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Apr (210k)</span>
                      </div>
                      <div className="flex-1 bg-emerald-500 h-[90%] rounded-t-xs transition-all relative group cursor-pointer">
                        <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 px-2 py-0.5 rounded text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">May (450k)</span>
                      </div>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 mt-2 font-mono">
                      <span>JANUARY</span>
                      <span>FEBRUARY</span>
                      <span>MARCH</span>
                      <span>APRIL</span>
                      <span>MAY (CURRENT)</span>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB: USERS */}
              {activeTab === 'users' && (
                <div className="bg-slate-950 border border-slate-850 rounded-2xl p-6">
                  <h3 className="text-base font-bold text-white mb-4 uppercase tracking-wider">Registered Patient Index</h3>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-400">
                      <thead className="bg-slate-900 text-slate-300 font-bold uppercase text-[10px] border-b border-slate-800">
                        <tr>
                          <th className="p-4">Patient Name</th>
                          <th className="p-4">Email</th>
                          <th className="p-4">Role Permission</th>
                          <th className="p-4">Creation Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850">
                        {metrics?.allChats?.map((chat: any) => {
                          const clientNode = metrics?.transactions?.find((tx: any) => tx.clientId === chat.clientId);
                          return (
                            <tr key={chat.id} className="hover:bg-slate-900/50">
                              <td className="p-4 font-extrabold text-white">{clientNode?.clientName || 'Rebwar Ali'}</td>
                              <td className="p-4 font-mono">rebwaraliahmer@gmail.com</td>
                              <td className="p-4">
                                <span className="px-2 py-0.5 bg-blue-950 text-blue-400 rounded-md border border-blue-900">Patient</span>
                              </td>
                              <td className="p-4 font-mono">{new Date(chat.unlockedAt || Date.now()).toLocaleDateString()}</td>
                            </tr>
                          );
                        })}
                        {/* Default demo arrays */}
                        <tr className="hover:bg-slate-900/50">
                          <td className="p-4 font-extrabold text-white">Rebwar Ali</td>
                          <td className="p-4 font-mono">rebwaraliahmer@gmail.com</td>
                          <td className="p-4"><span className="px-2 py-0.5 bg-blue-950 text-blue-300 rounded-md border border-blue-900">Patient</span></td>
                          <td className="p-4 font-mono">05/01/2026</td>
                        </tr>
                        <tr className="hover:bg-slate-900/50">
                          <td className="p-4 font-extrabold text-white">Daroon Admin</td>
                          <td className="p-4 font-mono">admin@daroon.krd</td>
                          <td className="p-4"><span className="px-2 py-0.5 bg-purple-950 text-purple-300 rounded-md border border-purple-900">SaaS Admin</span></td>
                          <td className="p-4 font-mono">01/01/2026</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB: THERAPISTS */}
              {activeTab === 'therapists' && (
                <div className="bg-slate-950 border border-slate-850 rounded-2xl p-6">
                  <h3 className="text-base font-bold text-white mb-6 uppercase tracking-wider">Active Accredited Clinicians</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {metrics?.therapists?.map((doc: Therapist) => (
                      <div key={doc.id} className="p-5 border border-slate-850 rounded-xl bg-slate-900 flex gap-4">
                        <img src={doc.photo} alt={doc.name} className="w-14 h-14 rounded-xl object-cover" />
                        <div>
                          <h4 className="font-extrabold text-white">{doc.name}</h4>
                          <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider mt-1">{doc.specialty}</p>
                          <p className="text-[11px] text-slate-400 mt-2"><b>Pricing:</b> {doc.priceSession.toLocaleString()} IQD/session</p>
                          <p className="text-[11px] text-slate-500 mt-1"><b>Languages:</b> {doc.languages.join(', ')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB: PAYMENTS */}
              {activeTab === 'payments' && (
                <div className="bg-slate-950 border border-slate-850 rounded-2xl p-6">
                  <h3 className="text-base font-bold text-white mb-4 uppercase tracking-wider">Gross Payment Registry</h3>
                  
                  <div className="space-y-3">
                    {metrics?.transactions?.map((tx: any) => (
                      <div key={tx.id} className="p-4 border border-slate-850 rounded-xl bg-slate-900 flex items-center justify-between text-xs font-semibold">
                        <div>
                          <span className="text-[10px] text-slate-500 font-mono block font-black uppercase">{tx.id}</span>
                          <span className="text-white text-sm block mt-0.5">{tx.clientName}</span>
                          <span className="text-slate-400">Paid to: {tx.therapistName}</span>
                        </div>

                        <div className="text-right">
                          <span className="text-sm font-black text-white block">{tx.amount.toLocaleString()} IQD</span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] uppercase bg-emerald-950 text-emerald-400 mt-1 block w-max ml-auto">
                            {tx.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB: BOOKINGS */}
              {activeTab === 'bookings' && (
                <div className="bg-slate-950 border border-slate-850 rounded-2xl p-6">
                  <h3 className="text-base font-bold text-white mb-4 uppercase tracking-wider">Clinical Booking schedules</h3>
                  
                  <div className="p-8 text-center text-slate-500 text-xs font-semibold">
                    <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                    All bookings are routed directly into text chat dialogues for instant support. Patients do not have to book schedules via calendar boards.
                  </div>
                </div>
              )}

              {/* TAB: CHAT MONITORING */}
              {activeTab === 'chats' && (
                <div className="bg-slate-950 border border-slate-850 rounded-2xl p-6">
                  <h3 className="text-base font-bold text-white mb-6 uppercase tracking-wider">HIPAA secure Chat Administrative Overlook</h3>
                  
                  <p className="text-xs text-slate-400 leading-relaxed mb-6 block bg-slate-900 p-4 border border-slate-850 rounded-xl">
                    ⚠ <b>Legal notice:</b> For safety monitoring, administrators can overlook active channels to verify clinician accuracy. Text logs are encrypted and stored in cloud secure memory caches.
                  </p>

                  <div className="space-y-4">
                    {metrics?.allChats?.length > 0 ? (
                      metrics.allChats.map((c: any) => {
                        const doctor = metrics.therapists.find((t: any) => t.id === c.therapistId);
                        return (
                          <div key={c.id} className="p-4 border border-slate-850 rounded-xl bg-slate-900">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-3">
                              <div>
                                <span className="text-xs font-bold text-white uppercase font-black block">Channel: {c.id}</span>
                                <span className="text-[10px] text-slate-400 mt-0.5">Doctor: {doctor?.name || 'Unassigned'}</span>
                              </div>
                              <button
                                onClick={() => handleDownloadChatLogs(c)}
                                className="px-3 py-1.5 bg-slate-800 hover:bg-emerald-600 hover:text-white text-emerald-400 font-bold rounded-lg text-xs cursor-pointer transition-colors flex items-center gap-1.5 shadow-xs whitespace-nowrap"
                              >
                                <Download className="w-3.5 h-3.5" />
                                Download Chat Logs
                              </button>
                            </div>
                            <div className="space-y-2 mt-2 font-sans">
                              {c.messages.map((m: any, idx: number) => (
                                <p key={idx} className="text-[11px] leading-relaxed block text-slate-400">
                                  <b className="text-slate-200 capitalize">{m.senderRole}:</b> "{m.text}"
                                </p>
                              ))}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-center py-8 text-slate-500 text-xs">No active chat sessions created.</p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB: EXPENSES */}
              {activeTab === 'expenses' && (
                <div className="space-y-6">
                  
                  {/* Create Expense Form */}
                  <form onSubmit={handleAddExpense} className="bg-slate-950 border border-slate-850 p-6 rounded-2xl space-y-4 max-w-lg font-sans">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      {editingExpenseId ? "Edit operating billing Expense" : "Log operating billing Expense"}
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-xs font-bold text-slate-400">
                      <div>
                        <label className="block mb-1.5 uppercase">Description</label>
                        <input
                           type="text" required placeholder="SMS API bundle"
                          value={newExpense.description}
                          onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                          className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white"
                        />
                      </div>
                      <div>
                        <label className="block mb-1.5 uppercase">Amount (IQD)</label>
                        <input
                          type="number" required placeholder="50000"
                          value={newExpense.amount}
                          onChange={(e) => setNewExpense({ ...newExpense, amount: Number(e.target.value) })}
                          className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white"
                        />
                      </div>
                    </div>
                    <div className="flex items-center">
                      <button type="submit" className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs cursor-pointer transition-colors">
                        {editingExpenseId ? "Update Expense" : "Log Expense"}
                      </button>
                      {editingExpenseId && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingExpenseId(null);
                            setNewExpense({ description: '', category: 'Technology', amount: 50000 });
                          }}
                          className="ml-3 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg text-xs cursor-pointer transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
 
                  {/* Expense Indexes */}
                  <div className="bg-slate-950 border border-slate-850 rounded-2xl p-6">
                    <h3 className="text-sm font-bold text-white uppercase mb-4 block">Operation Expenses records</h3>
                    <div className="space-y-2 text-xs">
                      {metrics?.expenses && metrics.expenses.length > 0 ? (
                        metrics.expenses.map((e: any) => (
                          <div key={e.id} className="p-3.5 border border-slate-850 rounded-xl bg-slate-900 flex justify-between items-center pr-6 hover:border-slate-800 transition-all">
                            <div>
                              <span className="font-bold text-white block">{e.description}</span>
                              <span className="text-[10px] text-slate-500 uppercase">{e.category || 'Technology'} • {new Date(e.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="font-black text-rose-400 font-mono">-{e.amount.toLocaleString()} IQD</span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => {
                                    setEditingExpenseId(e.id);
                                    setNewExpense({ description: e.description, category: e.category || 'Technology', amount: e.amount });
                                  }}
                                  className="py-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 rounded-lg transition-colors cursor-pointer text-[10px] font-bold uppercase tracking-wider"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteExpense(e.id)}
                                  className="py-1 px-2.5 bg-slate-800 hover:bg-rose-950/40 text-rose-450 hover:text-rose-400 rounded-lg transition-colors cursor-pointer text-[10px] font-bold uppercase tracking-wider"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center py-6 text-slate-500 text-xs">No administrative operating expenses logged yet.</p>
                      )}
                    </div>
                  </div>

                </div>
              )}

              {/* TAB: PAYOUTS */}
              {activeTab === 'payouts' && (
                <div className="space-y-6">
                  
                  {/* Create Payout */}
                  <form onSubmit={handleAddPayout} className="bg-slate-950 border border-slate-850 p-6 rounded-2xl space-y-4 max-w-lg font-sans">
                    <h3 className="text-sm font-bold text-white uppercase">Process Clinician share payout</h3>
                    <div className="grid grid-cols-2 gap-4 text-xs font-bold text-slate-400">
                      <div>
                        <label className="block mb-1.5 uppercase">Therapist Profile</label>
                        <select
                          value={newPayout.therapistId}
                          onChange={(e) => setNewPayout({ ...newPayout, therapistId: e.target.value })}
                          className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white"
                        >
                          {metrics?.therapists?.map((t: any) => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block mb-1.5 uppercase">Amount (IQD)</label>
                        <input
                          type="number" required placeholder="150000"
                          value={newPayout.amount}
                          onChange={(e) => setNewPayout({ ...newPayout, amount: Number(e.target.value) })}
                          className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white"
                        />
                      </div>
                    </div>
                    <button type="submit" className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs cursor-pointer transition-colors">
                      Trigger Payout
                    </button>
                  </form>

                  {/* Payout records */}
                  <div className="bg-slate-950 border border-slate-850 rounded-2xl p-6">
                    <h3 className="text-sm font-bold text-white uppercase mb-4 block">Shared Payout histories</h3>
                    <div className="space-y-2 text-xs">
                      {metrics?.payouts?.map((p: any) => (
                        <div key={p.id} className="p-3 border border-slate-850 rounded-lg bg-slate-900 flex justify-between items-center pr-6">
                          <div>
                            <span className="font-bold text-white block">{p.therapistName}</span>
                            <span className="text-[10px] text-slate-400 uppercase font-mono">Completed • {new Date(p.date).toLocaleDateString()}</span>
                          </div>
                          <span className="font-black text-emerald-400">{p.amount.toLocaleString()} IQD</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* TAB: CMS CONTENT */}
              {activeTab === 'cms' && (
                <div className="space-y-8">
                  
                  {/* Therapist addition form */}
                  <form onSubmit={handleAddTherapist} className="bg-slate-950 border border-slate-850 p-6 rounded-2xl space-y-4 max-w-xl">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider block border-b border-slate-850 pb-2">CMS: Add therapist accreditation profile</h3>
                    
                    <div className="grid grid-cols-2 gap-4 text-xs font-bold text-slate-400">
                      <div>
                        <label className="block mb-1.5">Doctor Full Name</label>
                        <input
                          type="text" required placeholder="Dr. Bushra Fawzi"
                          value={newTherapist.name}
                          onChange={(e) => setNewTherapist({ ...newTherapist, name: e.target.value })}
                          className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white"
                        />
                      </div>
                      
                      <div>
                        <label className="block mb-1.5">Clinical Specialization</label>
                        <select
                          value={newTherapist.specialty}
                          onChange={(e) => setNewTherapist({ ...newTherapist, specialty: e.target.value })}
                          className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white"
                        >
                          <option value="anxiety">Anxiety & stress</option>
                          <option value="depression">Depression</option>
                          <option value="family">Family problems</option>
                          <option value="marriage">Marriage counseling</option>
                        </select>
                      </div>

                      <div>
                        <label className="block mb-1.5">Languages (comma separated)</label>
                        <input
                          type="text" value={newTherapist.languages}
                          onChange={(e) => setNewTherapist({ ...newTherapist, languages: e.target.value })}
                          className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white"
                        />
                      </div>

                      <div>
                        <label className="block mb-1.5">Experience (years)</label>
                        <input
                          type="text" value={newTherapist.experience}
                          onChange={(e) => setNewTherapist({ ...newTherapist, experience: e.target.value })}
                          className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white"
                        />
                      </div>

                      <div>
                        <label className="block mb-1.5">Session Pricing (IQD)</label>
                        <input
                          type="number" value={newTherapist.priceSession}
                          onChange={(e) => setNewTherapist({ ...newTherapist, priceSession: Number(e.target.value) })}
                          className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white"
                        />
                      </div>

                      <div>
                        <label className="block mb-1.5">Accreditation Photo (Unsplash URL)</label>
                        <input
                          type="text" placeholder="https://images.unsplash.com..."
                          value={newTherapist.photo}
                          onChange={(e) => setNewTherapist({ ...newTherapist, photo: e.target.value })}
                          className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1.5">Clinical Bio and Qualifications</label>
                      <textarea
                        rows={3} required
                        value={newTherapist.bio}
                        onChange={(e) => setNewTherapist({ ...newTherapist, bio: e.target.value })}
                        className="w-full p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 font-sans"
                        placeholder="Clinical summary details..."
                      ></textarea>
                    </div>

                    <button type="submit" className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 font-extrabold rounded-lg text-xs text-white transition-colors cursor-pointer">
                      Accredit & Save Therapist
                    </button>
                  </form>

                </div>
              )}

              {/* TAB: SETTINGS */}
              {activeTab === 'settings' && (
                <div className="bg-slate-950 border border-slate-850 rounded-2xl p-6 max-w-xl space-y-6 font-sans">
                  <h3 className="text-base font-bold text-white mb-4 uppercase tracking-wider block border-b border-slate-850 pb-2">System Commission Parameters</h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-xs font-bold text-slate-400">
                      <div>
                        <label className="block mb-1">Commission Profit Ratio (%)</label>
                        <input
                          type="number" defaultValue={20}
                          className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white"
                        />
                      </div>
                      <div>
                        <label className="block mb-1">Support Contact Regional phone</label>
                        <input
                          type="text" defaultValue="+964 750 123 4567"
                          className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => alert('SaaS system parameters updated successfully!')}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 font-bold rounded-lg text-xs text-white cursor-pointer transition-colors"
                    >
                      Save Configuration
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}
        </main>

      </div>

    </div>
  );
}
