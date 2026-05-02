import React from 'react';
import { motion } from 'motion/react';
import { X, MapPin, Clock, Star, Phone, ShieldCheck } from 'lucide-react';
import { UserProfile } from '../types';

export default function PharmacyProfile({ pharmacist, isFavorite, onToggleFavorite, onClose }: { 
  pharmacist: UserProfile, 
  isFavorite?: boolean,
  onToggleFavorite?: () => void,
  onClose: () => void 
}) {
  const rating = pharmacist.ratingCount ? (pharmacist.ratingSum! / pharmacist.ratingCount).toFixed(1) : 'جديد';

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[70] flex items-center justify-center p-4">
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className="bg-white w-full max-w-md rounded-[3rem] overflow-hidden shadow-2xl relative flex flex-col"
        dir="rtl"
      >
        <div className="h-32 bg-teal-600 relative shrink-0">
          <button onClick={onClose} className="absolute left-6 top-6 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white backdrop-blur-md transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-8 -mt-12 pb-8 flex-1 overflow-y-auto">
          <div className="relative mb-6">
            <div className="w-24 h-24 bg-white rounded-3xl p-1 shadow-xl mx-auto">
              <div className="w-full h-full bg-slate-100 rounded-2xl flex items-center justify-center text-teal-600">
                <ShieldCheck className="w-12 h-12" />
              </div>
            </div>
            {pharmacist.isAvailable ? (
              <div className="absolute bottom-0 right-1/2 translate-x-12 bg-green-500 text-white font-bold text-[8px] px-2 py-0.5 rounded-full border-2 border-white shadow-sm">متاح</div>
            ) : (
              <div className="absolute bottom-0 right-1/2 translate-x-12 bg-slate-500 text-white font-bold text-[8px] px-2 py-0.5 rounded-full border-2 border-white shadow-sm">مغلق</div>
            )}
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-slate-900 mb-1">{pharmacist.pharmacyName || pharmacist.name}</h2>
            <div className="flex items-center justify-center gap-1 text-orange-500 font-black">
              <Star className="w-4 h-4 fill-orange-500" />
              <span>{rating}</span>
              <span className="text-xs text-slate-400 font-bold mr-1">({pharmacist.ratingCount || 0} تقييم)</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-teal-600 shadow-sm">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">الموقع</p>
                <p className="text-sm font-bold text-slate-700">{pharmacist.pharmacyAddress || 'لم يتم تحديد العنوان'}</p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-teal-600 shadow-sm">
                <Clock className="w-5 h-5" />
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ساعات العمل</p>
                <p className="text-sm font-bold text-slate-700">{pharmacist.workingHours || 'متوفر دائماً'}</p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-teal-600 shadow-sm">
                <Phone className="w-5 h-5" />
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">التواصل</p>
                <p className="text-sm font-bold text-slate-700">{pharmacist.name}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
             <button className="flex-1 bg-teal-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-teal-600/30 hover:bg-teal-700 transition-all">
                ابدأ محادثة
             </button>
             <button 
                onClick={onToggleFavorite}
                className={`px-6 py-4 rounded-2xl transition-all border ${isFavorite ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/20' : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100'}`}
             >
                <Star className={`w-6 h-6 ${isFavorite ? 'fill-white' : ''}`} />
             </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
