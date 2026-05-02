import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { X, Send, User, Stethoscope } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, addDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { ChatMessage, Order, UserProfile } from '../types';

export default function ChatModal({ order, profile, onClose }: {
  order: Order,
  profile: UserProfile,
  onClose: () => void
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(collection(db, 'orders', order.id, 'messages'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(d => d.data() as ChatMessage));
      setLoading(false);
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 100);
    });

    return unsubscribe;
  }, [order.id]);

  const handleSend = async () => {
    if (!text.trim() || !auth.currentUser) return;
    try {
      await addDoc(collection(db, 'orders', order.id, 'messages'), {
        text: text.trim(),
        senderId: auth.currentUser.uid,
        createdAt: new Date().toISOString()
      });
      setText('');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        className="bg-slate-50 w-full max-w-md rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-slate-200"
        style={{ height: '80vh' }}
        dir="rtl"
      >
        {/* Header */}
        <div className="bg-white p-6 border-b border-slate-100 flex items-center gap-4 shrink-0">
          <button onClick={onClose} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-600">
               {profile.role === 'patient' ? <Stethoscope className="w-5 h-5" /> : <User className="w-5 h-5" />}
             </div>
             <div>
               <h3 className="font-bold text-slate-800 text-sm">
                 {profile.role === 'patient' ? 'الصيدلي' : order.patientName}
               </h3>
               <p className="text-xs text-teal-600 font-bold">محادثة آمنة</p>
             </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4" ref={scrollRef}>
           {loading && <div className="text-center text-slate-400 text-sm py-4">جاري تحميل المحادثة...</div>}
           {!loading && messages.length === 0 && (
              <div className="text-center text-slate-400 text-sm py-10">
                لا توجد رسائل سابقة. يمكنك بدء المحادثة الآن.
              </div>
           )}
           {messages.map((msg, i) => {
             const isMe = msg.senderId === auth.currentUser?.uid;
             return (
               <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                 <div className={`max-w-[75%] rounded-2xl p-4 text-sm ${isMe ? 'bg-teal-600 text-white rounded-tl-none' : 'bg-white border border-slate-200 text-slate-700 rounded-tr-none shadow-sm'}`}>
                   {msg.text}
                 </div>
               </div>
             );
           })}
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-slate-200 flex gap-2 shrink-0">
          <input 
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="اكتب رسالتك هنا..."
            className="flex-1 bg-slate-50 p-4 rounded-[1.25rem] border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none text-right text-sm"
          />
          <button 
            disabled={!text.trim()}
            onClick={handleSend}
            className="w-14 h-14 bg-teal-600 text-white rounded-[1.25rem] flex items-center justify-center hover:bg-teal-700 transition-colors shadow-lg shadow-teal-600/20 disabled:opacity-50"
          >
            <Send className="w-5 h-5 rtl:scale-x-100" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
