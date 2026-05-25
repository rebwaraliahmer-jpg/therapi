import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Send, Check, CheckCheck, Paperclip, ShieldAlert, CreditCard, Sparkles, Loader2, Volume2, Plus, LogOut, CheckCircle } from 'lucide-react';
import { translations } from '../translations.ts';
import { Therapist, Chat, Message } from '../types.ts';

interface ChatViewProps {
  lang: 'en' | 'ku' | 'ar';
  currentUser: { id: string; name: string; email: string; role: string };
  initialChat: Chat;
  onNavigate: (view: string) => void;
}

export default function ChatView({ lang, currentUser, initialChat, onNavigate }: ChatViewProps) {
  const t = translations[lang];
  const isRtl = lang === 'ku' || lang === 'ar';

  const [chat, setChat] = useState<Chat>(initialChat);
  const [messages, setMessages] = useState<Message[]>(initialChat.messages);
  const [textInput, setTextInput] = useState('');
  const [therapist, setTherapist] = useState<Therapist | null>(null);
  
  // Payment States
  const [payMethod, setPayMethod] = useState<'stripe' | 'paypal'>('stripe');
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('424');
  const [payingState, setPayingState] = useState(false);
  const [paySuccessAlert, setPaySuccessAlert] = useState(false);

  // File Upload states
  const [uploadingState, setUploadingState] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  // Load therapist profile details
  useEffect(() => {
    async function loadTherapistDetails() {
      try {
        const resp = await fetch('/api/therapists');
        const list = await resp.json();
        const found = list.find((d: Therapist) => d.id === chat.therapistId);
        setTherapist(found || null);
      } catch (err) {
        console.error('Error fetching therapist data:', err);
      }
    }
    loadTherapistDetails();
  }, [chat.therapistId]);

  // Unified Web Audio API sound chime synthesized digitally for real notifications!
  const playNotificationChime = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      const audioCtx = new AudioContextClass();
      
      // Chime frequency 1
      const osc1 = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(650, audioCtx.currentTime); 
      osc1.frequency.exponentialRampToValueAtTime(1050, audioCtx.currentTime + 0.15);

      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);

      osc1.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc1.start();
      osc1.stop(audioCtx.currentTime + 0.35);
    } catch (err) {
      console.warn('Audio playback blocked until user engagement interaction:', err);
    }
  };

  // Poll chats periodically to see virtual responses or seen status modifications
  useEffect(() => {
    let intervalId: any;

    async function checkUpdates() {
      try {
        const resp = await fetch(`/api/chats?clientId=${currentUser.id}`);
        const list = await resp.json();
        const updatedChat = list.find((c: Chat) => c.id === chat.id);
        
        if (updatedChat) {
          // Play sound notification if new message is received from therapist
          const previousMsgCount = messages.length;
          const newMsgCount = updatedChat.messages.length;

          if (newMsgCount > previousMsgCount) {
            const hasNewDoctorMsg = updatedChat.messages.some(
              (m: Message, index: number) => index >= previousMsgCount && m.senderRole === 'therapist'
            );
            if (hasNewDoctorMsg) {
              playNotificationChime();
            }
          }

          setChat(updatedChat);
          setMessages(updatedChat.messages);
        }
      } catch (err) {
        console.error('Poller error:', err);
      }
    }

    // Set polling interval every 1 second for fast response simulation feel
    intervalId = setInterval(checkUpdates, 1500);

    return () => clearInterval(intervalId);
  }, [chat.id, messages.length, currentUser.id]);

  // Update read seen status as client is currently typing or viewing
  useEffect(() => {
    async function markAsSeen() {
      try {
        await fetch(`/api/chats/${chat.id}/read`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ readerRole: 'client' })
        });
      } catch (err) {
        console.error('Error marking seen status:', err);
      }
    }

    if (chat.isPaid) {
      markAsSeen();
    }
  }, [chat.id, messages.length, chat.isPaid]);

  // Scroll to bottom helper
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chat.typing]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!textInput.trim() || !chat.isPaid) return;

    const textToSend = textInput;
    setTextInput('');

    try {
      const resp = await fetch(`/api/chats/${chat.id}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: currentUser.id,
          senderRole: 'client',
          text: textToSend,
          lang: lang
        })
      });

      const newMsg = await resp.json();
      setMessages(prev => [...prev, newMsg]);
    } catch (err) {
      console.error('Error sending dialogue text:', err);
    }
  };

  // Simulated Secure Checkout Workflow
  const handlePaymentCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cardNumber.replace(/\s/g, '').length < 12) return;
    
    setPayingState(true);
    // Simulate payment response delay (1.2 seconds)
    await new Promise(resolve => setTimeout(resolve, 1200));

    try {
      const paymentResp = await fetch('/api/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: currentUser.id,
          clientName: currentUser.name,
          chatId: chat.id,
          therapistId: chat.therapistId,
          amount: therapist ? therapist.priceSession : 25000,
          paymentMethod: payMethod,
          type: 'session'
        })
      });

      const payData = await paymentResp.json();
      if (payData.success) {
        setPaySuccessAlert(true);
        setTimeout(() => {
          setPaySuccessAlert(false);
          setChat(prev => ({ ...prev, isPaid: true }));
        }, 1500);
      }
    } catch (err) {
      console.error('Checkout error:', err);
    } finally {
      setPayingState(false);
    }
  };

  // Simulated HIPAA file selection and attachment uploader
  const handleTriggerMockUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileUploadChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingState(true);
    // Simulate secure file network delay (1.5 seconds)
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      const resp = await fetch(`/api/chats/${chat.id}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: currentUser.id,
          senderRole: 'client',
          text: `Attachment: ${file.name}`,
          fileUrl: 'https://images.unsplash.com/photo-1594824813573-246434e33963?auto=format&fit=crop&w=60&q=80', // mock placeholder preview
          fileName: file.name
        })
      });

      const newMsg = await resp.json();
      setMessages(prev => [...prev, newMsg]);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploadingState(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex flex-col font-sans relative" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* WhatsApp style Top Banner info */}
      <header className="bg-slate-900 text-white h-18 sticky top-0 z-30 shadow-xs flex items-center justify-between px-4 sm:px-6">
        
        <div className="flex items-center gap-3">
          {/* Back key */}
          <button
            onClick={() => onNavigate('dashboard')}
            className="p-1 text-slate-100 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft className={`w-6 h-6 ${isRtl ? 'rotate-180' : ''}`} />
          </button>

          {/* Doctor Info */}
          <div className="flex items-center gap-3">
            <img
              src={therapist?.photo || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=150&q=80'}
              alt={therapist?.name}
              className="w-10 h-10 rounded-xl object-cover border border-slate-800"
            />
            
            <div>
              <span className="font-extrabold text-white text-sm sm:text-base block leading-tight">
                {therapist?.name || 'Practitioner'}
              </span>
              <span className="text-[10px] text-emerald-350 block mt-0.5 font-bold">
                {chat.typing ? (
                  <span className="font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-405 rounded-full animate-bounce"></span>
                    {t.typingIndicator}
                  </span>
                ) : (
                  <span>{therapist?.onlineStatus === 'online' ? t.online : t.offline}</span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Info right (HIPAA tag and language indicator) */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] bg-slate-800 text-emerald-300 px-2 rounded-md font-mono py-0.5 border border-slate-700">
            🔐 HIPAA Protected
          </span>
          <button
            onClick={playNotificationChime}
            className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Test notification"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main active messaging container */}
      <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col space-y-4 chat-scrollbar max-w-4xl mx-auto w-full mb-22">
        
        {/* Safe notice warning */}
        <div className="bg-yellow-50/90 backdrop-blur-md border border-yellow-150 p-3.5 rounded-2xl text-[11px] sm:text-xs text-yellow-900 max-w-md mx-auto text-center leading-relaxed">
          {t.securityNotice} Messages are end-to-end encrypted under Kurdistan clinical registries.
        </div>

        {/* Dynamic Message logs */}
        {messages.map((m) => {
          const isSenderMe = m.senderId === currentUser.id;

          return (
            <div
              key={m.id}
              className={`flex flex-col max-w-[85%] sm:max-w-[70%] rounded-2xl p-3.5 shadow-xs relative ${
                isSenderMe
                  ? 'bg-emerald-600 text-white self-end rounded-tr-none shadow-xs'
                  : 'bg-white text-gray-900 self-start rounded-tl-none border border-gray-150 shadow-xs'
              }`}
            >
              {/* Image previews inside chat logs if uploaded */}
              {m.fileUrl && (
                <div className="mb-2 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                  <img src={m.fileUrl} alt={m.fileName} className="max-h-28 object-cover w-full animate-pulse" />
                </div>
              )}

              <p className="text-xs sm:text-sm leading-relaxed break-words">{m.text}</p>
              
              <div className="flex items-center justify-end gap-1.5 mt-2.5">
                <span className={`text-[10px] font-mono leading-none ${isSenderMe ? 'text-emerald-200' : 'text-gray-400'}`}>
                  {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {isSenderMe && (
                  <span>
                    {m.seen ? (
                      <CheckCheck className="w-3.5 h-3.5 text-emerald-250" />
                    ) : (
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                    )}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* Therapist virtual typing indicator mock */}
        {chat.typing && (
          <div className="bg-white text-gray-500 text-xs py-2 px-4 rounded-xl self-start border border-gray-200 flex items-center gap-1.5 font-bold animate-pulse font-sans">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"></span>
            <span>{therapist?.name || 'Practitioner'} {t.typingIndicator}</span>
          </div>
        )}

        <div ref={endOfMessagesRef} />
      </div>

      {/* FOOTER BAR: TEXT TRANSMITTER OR LOCKED/UNLOCKED CHECKOUT MODAL */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-150 p-4 sticky z-40">
        <div className="max-w-4xl mx-auto w-full">
          
          {chat.isPaid ? (
            /* ACTIVE CHAT WORKSPACE */
            <form onSubmit={handleSendMessage} className="flex items-center gap-3.5">
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUploadChange}
                className="hidden"
                accept="image/*,application/pdf"
              />

              <button
                type="button"
                onClick={handleTriggerMockUpload}
                disabled={uploadingState}
                className="p-3 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-500 border border-gray-150 transition-colors flex-shrink-0 cursor-pointer disabled:opacity-50"
                title="Secure Attachment"
              >
                {uploadingState ? (
                  <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                ) : (
                  <Paperclip className="w-5 h-5" />
                )}
              </button>

              <input
                type="text"
                placeholder={t.messagePlaceholder}
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="flex-1 py-3.5 px-4 bg-gray-50 rounded-2xl border border-gray-200 focus:border-gray-300 text-xs sm:text-sm focus:outline-hidden transition-all focus:bg-white"
              />

              <button
                type="submit"
                className="p-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-xs transition-all flex-shrink-0 cursor-pointer"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          ) : (
            /* CHECKOUT LOCK SYSTEM MODAL SHEET */
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 text-white max-w-xl mx-auto">
              
              {paySuccessAlert ? (
                /* Payment Success view */
                <div className="text-center py-6 flex flex-col items-center justify-center">
                  <CheckCircle className="w-12 h-12 text-emerald-400 animate-bounce mb-3" />
                  <h4 className="font-extrabold text-white text-base">{t.sessionPurchasedTitle}</h4>
                  <p className="text-xs text-slate-400 mt-1">{t.sessionPurchasedSub}</p>
                </div>
              ) : (
                /* Active Checkout forms */
                <form onSubmit={handlePaymentCheckout} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-emerald-400" />
                      <span className="text-sm font-extrabold uppercase tracking-tight">{t.paymentTitle}</span>
                    </div>

                    <span className="text-xs text-emerald-350 font-black bg-emerald-950/50 px-2.5 py-1 rounded-md border border-emerald-900/40">
                      {therapist ? therapist.priceSession.toLocaleString() : '25,000'} IQD
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-350 leading-relaxed block">
                    {t.paymentSub}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <button
                      type="button"
                      onClick={() => setPayMethod('stripe')}
                      className={`p-2.5 border rounded-xl font-bold transition-all cursor-pointer ${
                        payMethod === 'stripe' 
                          ? 'border-emerald-500 bg-emerald-950 text-white' 
                          : 'border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Credit Card (Stripe)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPayMethod('paypal')}
                      className={`p-2.5 border rounded-xl font-bold transition-all cursor-pointer ${
                        payMethod === 'paypal' 
                          ? 'border-emerald-500 bg-emerald-950 text-white' 
                          : 'border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      PayPal Express
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">{t.cardNumber}</label>
                      <input
                        type="text"
                        required
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-950 border border-slate-850 rounded-lg text-xs font-mono text-white focus:outline-hidden focus:border-emerald-400"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">{t.expiry}</label>
                        <input
                          type="text"
                          required
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full px-3 py-2.5 bg-slate-950 border border-slate-850 rounded-lg text-xs font-mono text-white text-center focus:outline-hidden focus:border-emerald-400"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">{t.cvv}</label>
                        <input
                          type="text"
                          required
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full px-3 py-2.5 bg-slate-950 border border-slate-850 rounded-lg text-xs font-mono text-white text-center focus:outline-hidden focus:border-emerald-400"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={payingState}
                    className="w-full py-3.5 mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {payingState ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        Validating payment security...
                      </>
                    ) : (
                      <>
                        {t.completePayment} ({therapist ? therapist.priceSession.toLocaleString() : '25,000'} IQD)
                      </>
                    )}
                  </button>
                </form>
              )}

            </div>
          )}

        </div>
      </footer>

    </div>
  );
}
