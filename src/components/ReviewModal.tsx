import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Star, CheckCircle } from 'lucide-react';
import { addDoc, collection, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function ReviewModal({ orderId, pharmacistId, patientId, onClose }: {
  orderId: string,
  pharmacistId: string,
  patientId: string,
  onClose: () => void
}) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSaving(true);
    try {
      // Create review
      await addDoc(collection(db, 'reviews'), {
        orderId,
        pharmacistId,
        patientId,
        rating,
        comment,
        createdAt: new Date().toISOString()
      });

      // Update Order to mark as reviewed
      await updateDoc(doc(db, 'orders', orderId), {
        isReviewed: true
      });

      // Update Pharmacist profile rating sum/count
      await updateDoc(doc(db, 'profiles', pharmacistId), {
        ratingSum: increment(rating),
        ratingCount: increment(1)
      });
      
      onClose();
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        className="bg-white w-full max-w-sm rounded-[2rem] p-8 shadow-2xl relative text-center"
        dir="rtl"
      >
        <button onClick={onClose} className="absolute left-6 top-6 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500">
          <X className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-teal-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-1">كيف كانت خدمتك؟</h2>
        <p className="text-xs text-slate-500 mb-6">قيم تجربتك مع الصيدلي لتساعدنا في تقديم الأفضل</p>

        <div className="flex justify-center gap-2 mb-6" dir="ltr">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
            >
              <Star 
                className={`w-8 h-8 transition-colors ${
                  (hoverRating || rating) >= star ? 'fill-orange-400 text-orange-400' : 'text-slate-200'
                }`}
              />
            </button>
          ))}
        </div>

        <textarea 
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="اكتب تعليقك هنا..."
          className="w-full bg-slate-50 p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none text-right resize-none mb-6 text-sm"
          rows={3}
        ></textarea>

        <button 
          disabled={saving || rating === 0}
          onClick={handleSubmit}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white py-4 rounded-xl font-bold disabled:opacity-50 transition-all flex items-center justify-center"
        >
          {saving ? 'جاري الإرسال...' : 'إرسال التقييم'}
        </button>
      </motion.div>
    </div>
  );
}
