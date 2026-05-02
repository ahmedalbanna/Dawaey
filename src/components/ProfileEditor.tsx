import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Save, MapPin, Clock, Star } from 'lucide-react';
import { UserProfile } from '../types';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function ProfileEditor({ profile, onClose }: { profile: UserProfile, onClose: () => void }) {
  const [name, setName] = useState(profile.name);
  const [pharmacyName, setPharmacyName] = useState(profile.pharmacyName || '');
  const [pharmacyAddress, setPharmacyAddress] = useState(profile.pharmacyAddress || '');
  const [address, setAddress] = useState(profile.addresses?.[0] || '');
  const [workingHours, setWorkingHours] = useState(profile.workingHours || '');
  const [isAvailable, setIsAvailable] = useState(profile.isAvailable ?? true);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates: any = { name };
      if (profile.role === 'patient') {
        updates.addresses = address ? [address] : [];
      } else {
        updates.pharmacyName = pharmacyName;
        updates.pharmacyAddress = pharmacyAddress;
        updates.workingHours = workingHours;
        updates.isAvailable = isAvailable;
      }
      await updateDoc(doc(db, 'profiles', profile.uid), updates);
      onClose();
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative"
        dir="rtl"
      >
        <button 
          onClick={onClose} 
          className="absolute left-6 top-6 p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-black text-slate-900 mb-6 text-right">تعديل الملف الشخصي</h2>

        <div className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2 text-right">الاسم</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none text-right"
            />
          </div>

          {profile.role === 'patient' && (
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-2 text-right">عنوان التوصيل المفضل</label>
              <div className="relative">
                <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="المدينة، الحي..."
                  className="w-full bg-slate-50 p-4 pr-10 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none text-right"
                />
              </div>
            </div>
          )}

          {profile.role === 'pharmacist' && (
            <>
              <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4">
                <span className="text-sm font-bold text-slate-700">حالة التوافر للطلبات</span>
                <button 
                  onClick={() => setIsAvailable(!isAvailable)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${isAvailable ? 'bg-teal-500' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isAvailable ? 'right-7' : 'right-1'}`}></div>
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2 text-right">اسم الصيدلية</label>
                <input 
                  type="text" 
                  value={pharmacyName}
                  onChange={(e) => setPharmacyName(e.target.value)}
                  placeholder="مثال: صيدلية الأمل المركزية"
                  className="w-full bg-slate-50 p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none text-right"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2 text-right">عنوان الصيدلية بالتفصيل</label>
                <div className="relative">
                  <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    value={pharmacyAddress}
                    onChange={(e) => setPharmacyAddress(e.target.value)}
                    placeholder="الحي، الشارع، علامة مميزة..."
                    className="w-full bg-slate-50 p-4 pr-10 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none text-right"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2 text-right">ساعات العمل</label>
                <div className="relative">
                  <Clock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    value={workingHours}
                    onChange={(e) => setWorkingHours(e.target.value)}
                    placeholder="مثال: 9 ص - 10 م"
                    className="w-full bg-slate-50 p-4 pr-10 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none text-right"
                  />
                </div>
              </div>

              {profile.ratingCount && profile.ratingCount > 0 ? (
                <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 flex items-center justify-between mt-4">
                   <div className="text-right">
                     <p className="text-sm font-bold text-slate-800">تقييمك الحالي</p>
                     <p className="text-xs text-slate-500">بناءً على {profile.ratingCount} مراجعة</p>
                   </div>
                   <div className="flex items-center gap-2">
                     <span className="text-xl font-black text-orange-600">
                       {(profile.ratingSum! / profile.ratingCount).toFixed(1)}
                     </span>
                     <Star className="w-6 h-6 fill-orange-400 text-orange-400" />
                   </div>
                </div>
              ) : null}
            </>
          )}

          <button 
            disabled={saving || !name}
            onClick={handleSave}
            className="w-full mt-4 bg-teal-600 hover:bg-teal-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-teal-600/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {saving ? 'جاري الحفظ...' : (
              <>
                <Save className="w-5 h-5" />
                حفظ التعديلات
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
