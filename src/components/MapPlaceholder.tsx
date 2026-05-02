import React, { useState, useEffect } from 'react';
import { Map, MapPin } from 'lucide-react';
import { motion } from 'motion/react';

export default function MapPlaceholder({ title, description, address }: { title: string, description: string, address: string }) {
  const [pulse, setPulse] = useState(false);
  
  useEffect(() => {
    const i = setInterval(() => setPulse(p => !p), 1500);
    return () => clearInterval(i);
  }, []);

  return (
    <div className="relative w-full h-48 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 group">
       <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
         backgroundImage: 'radial-gradient(circle at 2px 2px, #0f172a 1px, transparent 0)',
         backgroundSize: '24px 24px'
       }}></div>
       <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
          <motion.div animate={{ scale: pulse ? 1.1 : 1 }} transition={{ duration: 1 }} className="relative text-teal-600 mb-2 drop-shadow-md">
             <MapPin className="w-8 h-8 relative z-10" />
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-teal-400 rounded-full blur-md opacity-50 z-0"></div>
          </motion.div>
          <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-xl text-center shadow-lg border border-slate-100 max-w-[80%]">
             <p className="text-xs font-black text-slate-800 mb-0.5">{title}</p>
             <p className="text-[10px] text-slate-500 font-bold max-w-full truncate">{address}</p>
          </div>
       </div>
       <div className="absolute bottom-3 left-3 bg-white/80 backdrop-blur px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-500 shadow-sm flex items-center gap-1">
         <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></div>
         تتبع حي للمندوب
       </div>
    </div>
  );
}
