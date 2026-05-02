import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Camera, 
  MapPin, 
  Phone, 
  Clock, 
  CheckCircle, 
  Package, 
  LogOut, 
  User, 
  Stethoscope, 
  Pill,
  ChevronRight,
  Upload,
  Loader2,
  X,
  Settings,
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  onAuthStateChanged, 
  signInAnonymously, 
  signOut, 
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  doc, 
  updateDoc, 
  setDoc, 
  getDoc,
  serverTimestamp
} from 'firebase/firestore';
import { useDropzone } from 'react-dropzone';
import { auth, db } from './lib/firebase';
import { UserProfile, Order, OrderStatus, UserRole } from './types';

import { Toaster, toast } from 'sonner';
import MapPlaceholder from './components/MapPlaceholder';
import ChatModal from './components/ChatModal';
import ProfileEditor from './components/ProfileEditor';
import ReviewModal from './components/ReviewModal';

// --- Components ---

const Header = ({ user, profile, onLogout, onSettings }: { user: FirebaseUser | null, profile: UserProfile | null, onLogout: () => void, onSettings?: () => void }) => (
  <header className="bg-white border-b border-slate-200 px-4 sm:px-12 py-4 sm:py-6 flex justify-between items-center shadow-sm sticky top-0 z-50">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center shadow-md shadow-teal-600/20">
        <Pill className="text-white w-6 h-6" />
      </div>
      <span className="text-xl sm:text-2xl font-black tracking-tight text-teal-800">دوائي - Dawaey</span>
    </div>
    {user ? (
      <div className="flex gap-4 items-center">
        <div className="text-right hidden sm:block">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">{profile?.role === 'pharmacist' ? 'صيدلي شريك' : 'مريض'}</p>
          <p className="text-sm font-bold text-slate-800">{profile?.name}</p>
        </div>
        <div className="h-6 w-px bg-slate-200 mx-2 hidden sm:block"></div>
        <button 
          onClick={onSettings}
          className="p-2 text-slate-400 hover:bg-slate-100 hover:text-teal-600 rounded-full transition-all"
        >
          <Settings className="w-5 h-5" />
        </button>
        <button 
          onClick={onLogout}
          className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 px-3 py-2 sm:px-4 rounded-full border border-slate-200 transition-all group"
        >
          <LogOut className="w-4 h-4 text-slate-500 group-hover:text-red-500 transition-colors" />
          <span className="text-xs sm:text-sm font-bold text-slate-700 hidden sm:inline">خروج</span>
        </button>
      </div>
    ) : (
      <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-widest">
        <span>خطوتك الأولى لصحة أفضل</span>
      </div>
    )}
  </header>
);

const RoleSelection = ({ onSelect }: { onSelect: (role: UserRole, name: string) => void }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole | null>(null);

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-6 bg-slate-50">
      <div className="text-center mb-12">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl sm:text-5xl font-black text-slate-800 mb-4"
        >
          دواؤك.. في أيدٍ أمينة
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto"
        >
          ارسل صورة الروشتة أو ابحث عن الدواء، وسيتكفل أقرب صيدلي بتوصيله لباب منزلك في غضون دقائق.
        </motion.p>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white p-8 sm:p-12 rounded-3xl shadow-xl shadow-slate-200/50 max-w-2xl w-full border border-slate-100"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
          <button 
            onClick={() => setRole('patient')}
            className={`p-8 rounded-3xl border-2 flex flex-col items-center text-center group transition-all ${
              role === 'patient' 
                ? 'border-teal-500 bg-teal-50 shadow-inner' 
                : 'border-slate-100 bg-slate-50 hover:border-teal-200'
            }`}
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all ${
              role === 'patient' ? 'bg-teal-600 text-white shadow-lg' : 'bg-white text-slate-400 group-hover:text-teal-500'
            }`}>
              <User className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-1">أنا مريض</h3>
            <p className="text-sm text-slate-500 leading-relaxed">أريد طلب دواء وتوصيله لعنواني بسرعة</p>
          </button>

          <button 
            onClick={() => setRole('pharmacist')}
            className={`p-8 rounded-3xl border-2 flex flex-col items-center text-center group transition-all ${
              role === 'pharmacist' 
                ? 'border-orange-400 bg-orange-50 shadow-inner' 
                : 'border-slate-100 bg-slate-50 hover:border-orange-200'
            }`}
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all ${
              role === 'pharmacist' ? 'bg-orange-500 text-white shadow-lg' : 'bg-white text-slate-400 group-hover:text-orange-500'
            }`}>
              <Stethoscope className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-1">أنا صيدلي</h3>
            <p className="text-sm text-slate-500 leading-relaxed">أريد خدمة مجتمعي وتوصيل الطلبات للمرضى</p>
          </button>
        </div>

        <AnimatePresence>
          {role && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-6 pt-6 border-t border-slate-100"
            >
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3 text-right">الاسم بالكامل للكشف عن الهوية</label>
                <div className="relative">
                  <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ادخل اسمك هنا..."
                    className="w-full bg-slate-50 p-4 pr-12 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:bg-white outline-none transition-all text-right font-medium"
                  />
                </div>
              </div>
              <button 
                disabled={!name}
                onClick={() => onSelect(role, name)}
                className={`w-full py-5 rounded-2xl font-black text-lg shadow-lg transition-all transform active:scale-95 disabled:opacity-50 disabled:grayscale ${
                  role === 'patient' ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/20' : 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/20'
                }`}
              >
                ابدأ رحلتك في دوائي
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="mt-16 flex flex-wrap justify-center items-center gap-8 sm:gap-12 text-slate-400 font-medium text-sm">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-teal-500" />
          <span>أكثر من 50 صيدلية شريكة</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-teal-500" />
          <span>توصيل آمن وبسرعة فائقة</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-teal-500" />
          <span>دعم طبي على مدار اليوم</span>
        </div>
      </div>
    </div>
  );
};

const PatientOrderForm = ({ profile, onSubmit, onCancel }: { profile: UserProfile, onSubmit: (data: any) => void, onCancel: () => void }) => {
  const [medicine, setMedicine] = useState('');
  const [address, setAddress] = useState(profile.addresses?.[0] || '');
  const [phone, setPhone] = useState('');
  const [image, setImage] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: { 'image/*': [] },
    maxFiles: 1,
    multiple: false
  } as any);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div 
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        className="bg-white w-full max-w-xl rounded-t-[2.5rem] sm:rounded-[3rem] p-8 sm:p-12 shadow-2xl relative overflow-y-auto max-h-[95vh] border border-slate-100"
      >
        <button 
          onClick={onCancel} 
          className="absolute left-8 top-10 p-3 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="text-right mb-10">
          <h2 className="text-3xl font-black text-slate-900 leading-tight">طلب دواء جديد</h2>
          <p className="text-slate-500 mt-2">املاء البيانات وسنقوم بالباقي</p>
        </div>
        
        <div className="space-y-8">
          <div>
            <label className="block text-sm font-black text-slate-700 mb-3 text-right">صورة الروشتة (لضمان الدقة)</label>
            <div 
              {...getRootProps()} 
              className={`border-3 border-dashed rounded-[2rem] p-8 flex flex-col items-center justify-center transition-all cursor-pointer group ${
                isDragActive ? 'border-teal-500 bg-teal-50' : 'border-slate-100 bg-slate-50 hover:border-teal-300 hover:bg-slate-100'
              }`}
            >
              <input {...getInputProps()} />
              {image ? (
                <div className="relative w-full aspect-video">
                  <img src={image} alt="Prescription" className="w-full h-full object-contain rounded-2xl shadow-lg border border-white" />
                  <button 
                    onClick={(e) => { e.stopPropagation(); setImage(null); }}
                    className="absolute -top-3 -right-3 bg-red-500 text-white p-2 rounded-full shadow-xl hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform">
                    <Camera className="w-8 h-8 text-teal-600" />
                  </div>
                  <p className="text-sm font-bold text-slate-800">اضغط هنا لتصوير الروشتة</p>
                  <p className="text-xs text-slate-400 mt-1">يجب أن تكون الكتابة واضحة والختم ظاهراً</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-black text-slate-700 mb-3 text-right">اسم الدواء (اختياري مع الصورة)</label>
              <div className="relative group">
                <Pill className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-teal-600 transition-colors" />
                <input 
                  type="text" 
                  value={medicine}
                  onChange={(e) => setMedicine(e.target.value)}
                  placeholder="مثال: اوجمنتين 1جم، فوار راني..."
                  className="w-full bg-slate-50 p-4 pr-12 rounded-[1.25rem] border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:bg-white outline-none text-right font-medium transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-black text-slate-700 mb-3 text-right">عنوان التوصيل (المدينة، الحي، الشارع)</label>
              <div className="relative group">
                <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-teal-600 transition-colors" />
                <input 
                  type="text" 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="اكتب عنوانك بالتفصيل هنا..."
                  className="w-full bg-slate-50 p-4 pr-12 rounded-[1.25rem] border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:bg-white outline-none text-right font-medium transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-black text-slate-700 mb-3 text-right">رقم هاتف مفعل (ضروري للتواصل)</label>
              <div className="relative group">
                <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-teal-600 transition-colors" />
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01xxxxxxxxx"
                  className="w-full bg-slate-50 p-4 pr-12 rounded-[1.25rem] border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:bg-white outline-none text-right font-medium transition-all"
                />
              </div>
            </div>
          </div>

          <button 
            disabled={(!medicine && !image) || !address || !phone}
            onClick={() => onSubmit({ medicineName: medicine, address, phone, prescriptionImage: image })}
            className="w-full bg-teal-600 text-white py-5 rounded-2xl font-black text-xl shadow-xl shadow-teal-600/20 disabled:opacity-50 disabled:grayscale hover:bg-teal-700 transform active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            تأكيد إرسال الطلب
            <ChevronRight className="w-6 h-6 transform rotate-180" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

interface OrderCardProps {
  order: Order;
  isPharmacist: boolean;
  onUpdateStatus?: (status: OrderStatus) => void;
  onReviewClick?: (order: Order) => void;
  onChatClick?: (order: Order) => void;
}

const OrderCard: React.FC<OrderCardProps> = (props) => {
  const { order, isPharmacist, onUpdateStatus, onReviewClick, onChatClick } = props;
  const getStatusColor = (status: OrderStatus) => {
    switch(status) {
      case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100 shadow-amber-100/50';
      case 'delivering': return 'bg-teal-50 text-teal-600 border-teal-100 shadow-teal-100/50';
      case 'completed': return 'bg-slate-100 text-slate-500 border-slate-200 shadow-none';
    }
  };

  const getStatusLabel = (status: OrderStatus) => {
    switch(status) {
      case 'pending': return 'قيد المراجعة';
      case 'delivering': return 'جاري التوصيل الآن';
      case 'completed': return 'تم التوصيل بنجاح';
    }
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-100 shadow-lg shadow-slate-200/40 hover:shadow-xl transition-all mb-6 relative overflow-hidden group flex flex-col"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
        <div className="flex flex-col order-2 sm:order-1">
          <span className={`self-start px-4 py-1.5 rounded-full text-xs font-black border tracking-wide mb-3 shadow-sm ${getStatusColor(order.status)}`}>
            {getStatusLabel(order.status)}
          </span>
          <h3 className="font-black text-2xl text-slate-900">{order.medicineName || "روشتة طبية مصورة"}</h3>
        </div>
        <div className="text-right order-1 sm:order-2 flex flex-col items-end">
          <div className="bg-slate-100 px-3 py-1 rounded-lg flex items-center gap-2 text-slate-500 font-bold text-xs">
            {new Date(order.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
            <Clock className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {!isPharmacist && (
        <div className="mb-8 px-2 relative">
          <div className="flex justify-between text-xs font-bold text-slate-400 mb-2 relative z-10">
            <div className={`px-2 bg-white ${order.status === 'pending' || order.status === 'delivering' || order.status === 'completed' ? 'text-teal-600' : ''}`}>مراجعة</div>
            <div className={`px-2 bg-white ${order.status === 'delivering' || order.status === 'completed' ? 'text-teal-600' : ''}`}>في الطريق</div>
            <div className={`px-2 bg-white ${order.status === 'completed' ? 'text-teal-600' : ''}`}>تم التوصيل</div>
          </div>
          <div className="absolute top-2.5 rtl:right-10 rtl:left-10 ltr:left-10 ltr:right-10 h-1 bg-slate-100 -z-0 rounded-full">
            <div className={`absolute top-0 right-0 h-1 bg-teal-500 transition-all rounded-full ${order.status === 'pending' ? 'w-[10%]' : order.status === 'delivering' ? 'w-1/2' : 'w-full'}`}></div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 mt-auto">
        <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-4 text-slate-700">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-teal-600">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">العنوان</span>
            <span className="text-sm font-bold truncate max-w-[150px]">{order.address}</span>
          </div>
        </div>
        <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-4 text-slate-700 justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-teal-600">
              <Phone className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">التليفون</span>
              <span className="text-sm font-bold">{order.phone}</span>
            </div>
          </div>
          {(order.status === 'delivering' || order.status === 'completed') && (
            <button 
              onClick={() => onChatClick?.(order)}
              className="p-2 bg-slate-200 hover:bg-slate-300 rounded-full transition-colors group-hover:bg-teal-100 group-hover:text-teal-700"
              title="محادثة"
            >
              <div className="w-5 h-5 relative">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              </div>
            </button>
          )}
        </div>
      </div>

      {order.status === 'delivering' && (
        <div className="mb-6">
           <MapPlaceholder 
             title={isPharmacist ? "موقع المريض المستهدف" : "موقع المندوب / الصيدلي"} 
             description={order.address} 
             address={order.address} 
           />
        </div>
      )}

      {isPharmacist && order.status !== 'completed' && (
        <div className="flex gap-3 pt-6 border-t border-slate-100 mt-2">
          {order.status === 'pending' && (
            <button 
              onClick={() => onUpdateStatus?.('delivering')}
              className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-4 rounded-2xl text-base font-black shadow-lg shadow-teal-600/20 transition-all flex items-center justify-center gap-2"
            >
              <Package className="w-5 h-5" />
              قبول وبدء التوصيل
            </button>
          )}
          {order.status === 'delivering' && (
            <button 
              onClick={() => onUpdateStatus?.('completed')}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white py-4 rounded-2xl text-base font-black shadow-lg shadow-green-600/20 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              تأكيد إتمام التوصيل
            </button>
          )}
        </div>
      )}

      {!isPharmacist && order.status === 'completed' && !order.isReviewed && (
        <div className="pt-6 border-t border-slate-100 mt-2">
          <button 
            onClick={() => onReviewClick?.(order)}
            className="w-full bg-orange-50 hover:bg-orange-100 text-orange-600 py-3 rounded-xl text-sm font-bold border border-orange-200 transition-all flex items-center justify-center gap-2"
          >
            <Star className="w-4 h-4" />
            قيم الصيدلي
          </button>
        </div>
      )}
      
      {!isPharmacist && order.status === 'completed' && order.isReviewed && (
        <div className="pt-6 border-t border-slate-100 mt-2 flex justify-center text-orange-400">
           <div className="flex gap-1 items-center bg-orange-50 px-3 py-1 rounded-full text-xs font-bold">
              <Star className="w-4 h-4 fill-orange-400" />
              تم التقييم
           </div>
        </div>
      )}

      {order.prescriptionImage && (
        <div className="mt-6 pt-6 border-t border-slate-100">
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-3 text-right">مرفق الروشتة</p>
          <img src={order.prescriptionImage} alt="Prescription" className="w-full h-auto max-h-48 object-contain rounded-2xl border border-slate-100 bg-slate-50" />
        </div>
      )}
    </motion.div>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [reviewOrder, setReviewOrder] = useState<Order | null>(null);
  const [chatOrder, setChatOrder] = useState<Order | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'delivering' | 'completed'>('pending');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const docRef = doc(db, 'profiles', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user || !profile) return;

    let q;
    if (profile.role === 'patient') {
      q = query(collection(db, 'orders'), where('patientId', '==', user.uid), orderBy('createdAt', 'desc'));
    } else {
      q = query(collection(db, 'orders'), orderBy('createdAt', 'desc')); // Fetch all orders to filter locally
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Notification logic for modified documents
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'modified') {
          const newData = change.doc.data() as Order;
          if (profile.role === 'patient' && newData.status === 'delivering') {
            toast.success('تم قبول طلبك! وهو الآن في الطريق إليك.');
          } else if (profile.role === 'patient' && newData.status === 'completed') {
            toast.success('تم تسليم طلبك بنجاح. لا تنسَ تقييم الصيدلي!');
          }
        }
        if (change.type === 'added' && profile.role === 'pharmacist' && !loading) {
           const newData = change.doc.data() as Order;
           if (newData.status === 'pending') {
              toast.info('طلب دواء جديد متاح في منطقتك!');
           }
        }
      });

      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      setOrders(docs);
    });

    return unsubscribe;
  }, [user, profile, loading]);

  const handleRoleSelection = async (role: UserRole, name: string) => {
    setLoading(true);
    try {
      const res = await signInAnonymously(auth);
      const newProfile: UserProfile = {
        uid: res.user.uid,
        name,
        role,
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'profiles', res.user.uid), newProfile);
      setProfile(newProfile);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const handleNewOrder = async (data: any) => {
    if (!user || !profile) return;
    try {
      await addDoc(collection(db, 'orders'), {
        ...data,
        patientId: user.uid,
        patientName: profile.name,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      setShowForm(false);
    } catch (error) {
      console.error(error);
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status,
        updatedAt: new Date().toISOString(),
        pharmacistId: user?.uid
      });
    } catch (error) {
      console.error(error);
    }
  };

  const filteredOrders = orders.filter(o => {
    if (profile?.role === 'pharmacist') {
      if (filter === 'all') return true;
      return o.status === filter;
    } else {
      if (searchQuery) {
         return o.medicineName?.includes(searchQuery) || o.address?.includes(searchQuery);
      }
      return true;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-teal-50">
        <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
      </div>
    );
  }

  if (!user || !profile) {
    return <RoleSelection onSelect={handleRoleSelection} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans" dir="rtl">
      <Toaster position="top-center" richColors />
      <Header user={user} profile={profile} onLogout={() => signOut(auth)} onSettings={() => setShowSettings(true)} />

      <main className="max-w-5xl mx-auto p-6 pb-40 sm:p-12 min-h-[70vh]">
        {profile.role === 'patient' ? (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <div>
                <h2 className="text-3xl font-black text-slate-900 leading-tight">تاريخ طلباتك</h2>
                <p className="text-slate-500 mt-1">تتبع رحلة دوائك من الصيدلية إلى منزلك</p>
              </div>
              <div className="bg-white px-4 py-2 rounded-full border border-slate-200 text-teal-600 font-bold text-sm shadow-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>
                خدمة نشطة الآن
              </div>
            </div>

            <div className="mb-8">
               <input 
                 type="text"
                 placeholder="ابحث في طلباتك السابقة بالاسم أو العنوان..."
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full bg-white p-4 rounded-[1.5rem] border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none shadow-sm text-right font-medium"
               />
            </div>

            {filteredOrders.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-[3rem] p-16 sm:p-24 text-center border-2 border-dashed border-slate-200 shadow-inner"
              >
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Package className="w-12 h-12 text-slate-200" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">منزلك يفتقد للأدوية؟</h3>
                <p className="text-slate-500 max-w-sm mx-auto">لم تقم بأي طلب اليوم، يمكنك الضغط على الزر أدناه لإرسال أول روشتة لنا!</p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredOrders.map(order => (
                    <OrderCard key={order.id} order={order} isPharmacist={false} onReviewClick={setReviewOrder} onChatClick={setChatOrder} />
                  ))}
                </AnimatePresence>
              </div>
            )}

            <motion.button 
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowForm(true)}
              className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-teal-600 text-white px-10 py-6 rounded-[2rem] font-black text-xl shadow-2xl shadow-teal-600/40 flex items-center gap-4 z-40 ring-4 ring-white transition-all active:shadow-none"
            >
              <Plus className="w-7 h-7" />
              اطلب دواء جديد الآن
            </motion.button>
          </div>
        ) : (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 text-right">
              <div>
                <h2 className="text-3xl font-black text-slate-900 leading-tight">الطلبات المتاحة حالياً</h2>
                <p className="text-slate-500 mt-1">ساهم في شفاء المرضى من خلال توصيل سريع وآمن</p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto bg-white p-1 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
                 <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${filter === 'all' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:bg-slate-50'}`}>الكل</button>
                 <button onClick={() => setFilter('pending')} className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${filter === 'pending' ? 'bg-amber-50 text-amber-600' : 'text-slate-500 hover:bg-slate-50'}`}>جديدة</button>
                 <button onClick={() => setFilter('delivering')} className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${filter === 'delivering' ? 'bg-teal-50 text-teal-600' : 'text-slate-500 hover:bg-slate-50'}`}>جاري التوصيل</button>
                 <button onClick={() => setFilter('completed')} className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${filter === 'completed' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:bg-slate-50'}`}>مكتملة</button>
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-[3rem] p-16 sm:p-24 text-center border border-slate-100 shadow-xl shadow-slate-200/20">
                <div className="w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-12 h-12 text-teal-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">أنت بطل اليوم!</h3>
                <p className="text-slate-500 max-w-sm mx-auto">كل المرضى في منطقتك استلموا أدويتهم بالفعل. لا توجد طلبات جديدة حالياً.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredOrders.map(order => (
                    <OrderCard 
                      key={order.id} 
                      order={order} 
                      isPharmacist={true} 
                      onUpdateStatus={(status) => updateOrderStatus(order.id, status)}
                      onChatClick={setChatOrder}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}
      </main>

      <AnimatePresence>
        {showForm && (
          <PatientOrderForm 
            profile={profile}
            onCancel={() => setShowForm(false)} 
            onSubmit={handleNewOrder} 
          />
        )}
        {showSettings && (
          <ProfileEditor profile={profile} onClose={() => setShowSettings(false)} />
        )}
        {reviewOrder && (
          <ReviewModal 
            orderId={reviewOrder.id} 
            pharmacistId={reviewOrder.pharmacistId!} 
            patientId={reviewOrder.patientId} 
            onClose={() => setReviewOrder(null)} 
          />
        )}
        {chatOrder && profile && (
          <ChatModal order={chatOrder} profile={profile} onClose={() => setChatOrder(null)} />
        )}
      </AnimatePresence>

      <footer className="py-12 bg-teal-900 text-teal-100 px-6 sm:px-12 mt-20">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-8">
          <div className="flex gap-8 text-sm font-bold opacity-80">
            <a href="#" className="hover:text-white transition-colors">الشروط والأحكام</a>
            <a href="#" className="hover:text-white transition-colors">سياسة الخصوصية</a>
            <a href="#" className="hover:text-white transition-colors">تواصل معنا</a>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end gap-2 mb-2">
              <Pill className="w-5 h-5 text-teal-400" />
              <span className="text-lg font-black tracking-tight text-white">دوائي</span>
            </div>
            <p className="text-[10px] tracking-widest opacity-60 uppercase font-black">© 2026 ميد فاست للرعاية الصحية المتكاملة</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
