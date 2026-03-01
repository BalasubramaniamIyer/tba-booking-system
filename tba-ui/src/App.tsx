// /**
//  * @license
//  * SPDX-License-Identifier: Apache-2.0
//  */

// import React, { useState, useEffect } from 'react';
// import { 
//   Search, Menu, X, User, LogOut, Ticket, Plus, BarChart3, Calendar, 
//   MapPin, ChevronRight, ChevronLeft, Loader2, AlertCircle, CheckCircle2, 
//   LayoutDashboard, Film, Trash2 
// } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion';

// type Role = 'user' | 'manager' | 'admin';

// interface UserModel {
//   email: string;
//   role: Role;
//   access_token: string;
// }

// interface Event {
//   id: number;
//   name: string;
//   total_seats: number;
//   image_url?: string; 
//   image?: string; 
//   venue?: string;
//   date?: string;
//   category?: string;
//   price?: number;
// }

// interface Booking {
//   id: number;
//   event_id: number;
//   seat_number: number;
//   event_name?: string;
// }

// interface Report {
//   platform_stats: {
//     total_users: number;
//     total_managers: number;
//     total_events: number;
//     total_overall_bookings: number;
//   };
//   event_stats: Array<{
//     event_name: string;
//     total_seats: number;
//     booked_seats: number;
//   }>;
// }

// interface Toast {
//   id: string;
//   message: string;
//   type: 'success' | 'error' | 'info';
// }

// const API_BASE_URL = 'http://127.0.0.1:8000';

// const MOCK_IMAGES = [
//   "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1000&auto=format&fit=crop",
//   "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1000&auto=format&fit=crop"
// ];

// const generateId = () => Math.random().toString(36).substr(2, 9);
// const getRandomImage = (id: number) => MOCK_IMAGES[id % MOCK_IMAGES.length];

// export default function App() {
//   const [user, setUser] = useState<UserModel | null>(null);
//   const [view, setView] = useState<'home' | 'manager' | 'admin' | 'tickets'>('home');
//   const [events, setEvents] = useState<Event[]>([]);
//   const [bookings, setBookings] = useState<Booking[]>([]);
//   const [reports, setReports] = useState<Report | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [toasts, setToasts] = useState<Toast[]>([]);
  
//   const [showAuthModal, setShowAuthModal] = useState(false);
//   const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
//   const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
//   const [bookedSeats, setBookedSeats] = useState<number[]>([]); 
  
//   const [loginForm, setLoginForm] = useState({ email: '', password: '' });
//   const [registerForm, setRegisterForm] = useState({ email: '', password: '', role: 'user' as Role });
  
//   // NEW: State holds all the custom data and the actual Image File
//   const [eventForm, setEventForm] = useState({ 
//     name: '', total_seats: 100, venue: '', date: '', price: 150, image: null as File | null 
//   });

//   useEffect(() => {
//     const storedUser = localStorage.getItem('ticket_user');
//     if (storedUser) setUser(JSON.parse(storedUser));
//     fetchEvents();
//   }, []);

//   useEffect(() => {
//     if (user?.role === 'admin' && view === 'admin') fetchReports();
//     if (view === 'tickets' && user) fetchMyBookings();
//   }, [user, view]);

//   useEffect(() => {
//     if (selectedEvent) fetchBookedSeats(selectedEvent.id);
//   }, [selectedEvent]);

//   const fetchBookedSeats = async (eventId: number) => {
//     const data = await apiCall(`/events/${eventId}/booked_seats`);
//     if (data) setBookedSeats(data);
//   };

//   const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
//     const id = generateId();
//     setToasts(prev => [...prev, { id, message, type }]);
//     setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
//   };

//   const apiCall = async (endpoint: string, options: RequestInit = {}) => {
//     const headers: HeadersInit = {
//       ...(user?.access_token ? { 'Authorization': `Bearer ${user.access_token}` } : {})
//     };

//     // IMPORTANT: If we send FormData (like image uploads), the browser handles the Content-Type automatically!
//     if (!(options.body instanceof FormData)) {
//       (headers as any)['Content-Type'] = 'application/json';
//     }

//     try {
//       const res = await fetch(`${API_BASE_URL}${endpoint}`, {
//         ...options,
//         headers: { ...headers, ...options.headers },
//       });

//       if (res.status === 401) {
//         logout();
//         addToast('Session expired. Please login again.', 'error');
//         return null;
//       }

//       const data = await res.json();
//       if (!res.ok) throw { status: res.status, message: data.detail || 'Something went wrong' };
//       return data;
//     } catch (error: any) {
//       if (error.message === 'Failed to fetch') addToast('Cannot connect to backend!', 'error');
//       else if (error.status === 400) addToast(error.message || 'Booking failed: Limit reached.', 'error');
//       else addToast(error.message || 'Network error.', 'error');
//       return null;
//     }
//   };

//   const fetchEvents = async () => {
//     setLoading(true);
//     const data = await apiCall('/events');
//     if (data) {
//       setEvents(data.map((e: any) => ({
//         ...e,
//         image: e.image_url || getRandomImage(e.id),
//         category: 'Blockbuster',
//       })));
//     }
//     setLoading(false);
//   };

//   const login = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     const formData = new FormData();
//     formData.append('username', loginForm.email);
//     formData.append('password', loginForm.password);

//     const data = await apiCall('/login', { method: 'POST', body: formData });

//     if (data) {
//       const userData: UserModel = { email: loginForm.email, role: data.role, access_token: data.access_token };
//       setUser(userData);
//       localStorage.setItem('ticket_user', JSON.stringify(userData));
//       setShowAuthModal(false);
//       addToast(`Welcome back, ${userData.email}!`, 'success');
//       setView('home');
//     }
//     setLoading(false);
//   };

//   const register = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     const data = await apiCall('/register', { method: 'POST', body: JSON.stringify(registerForm) });
//     if (data) {
//       addToast('Registration successful! Please login.', 'success');
//       setAuthMode('login');
//     }
//     setLoading(false);
//   };

//   const logout = () => {
//     setUser(null);
//     localStorage.removeItem('ticket_user');
//     setView('home');
//     addToast('Logged out successfully', 'info');
//   };

//   const createEvent = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!user || (user.role !== 'manager' && user.role !== 'admin')) return;

//     setLoading(true);
    
//     // NEW: We pack the text and the File into FormData to send to FastAPI!
//     const formData = new FormData();
//     formData.append('name', eventForm.name);
//     formData.append('total_seats', eventForm.total_seats.toString());
//     formData.append('venue', eventForm.venue);
//     formData.append('date', eventForm.date);
//     formData.append('price', eventForm.price.toString());
//     if (eventForm.image) {
//       formData.append('image', eventForm.image);
//     }

//     const data = await apiCall('/events', { method: 'POST', body: formData });

//     if (data) {
//       addToast('Event created successfully!', 'success');
//       setEventForm({ name: '', total_seats: 100, venue: '', date: '', price: 150, image: null });
//       fetchEvents();
//       setView('home');
//     }
//     setLoading(false);
//   };

//   const deleteEvent = async (eventId: number, e: React.MouseEvent) => {
//     e.stopPropagation(); 
//     if (!window.confirm("Are you sure you want to permanently delete this event?")) return;
    
//     setLoading(true);
//     const data = await apiCall(`/events/${eventId}`, { method: 'DELETE' });
//     if (data) {
//       addToast("Event permanently deleted.", "success");
//       fetchEvents();
//     }
//     setLoading(false);
//   };

//   const bookTicket = async (seatNumber: number) => {
//     if (!user) { setShowAuthModal(true); return; }
//     if (!selectedEvent) return;

//     setLoading(true);
//     const data = await apiCall('/book', { method: 'POST', body: JSON.stringify({ event_id: selectedEvent.id, seat_number: seatNumber }) });

//     if (data) {
//       addToast(`Ticket booked! Seat #${seatNumber}`, 'success');
//       fetchEvents(); 
//       fetchBookedSeats(selectedEvent.id); 
//     }
//     setLoading(false);
//   };

//   const fetchMyBookings = async () => {
//     if (!user) return;
//     setLoading(true);
//     const data = await apiCall('/bookings/me');
//     if (data) {
//       const enriched = data.map((b: any) => {
//         const evt = events.find(e => e.id === b.event_id);
//         return { ...b, event_name: evt ? evt.name : `Event #${b.event_id}` };
//       });
//       setBookings(enriched);
//     }
//     setLoading(false);
//   };

//   const fetchReports = async () => {
//     if (!user || user.role !== 'admin') return;
//     setLoading(true);
//     const data = await apiCall('/admin/reports');
//     if (data) setReports(data);
//     setLoading(false);
//   };

//   const renderStars = (rating: number) => (
//     <div className="flex space-x-0.5">
//       {[...Array(5)].map((_, i) => (
//         <svg key={i} className={`w-3 h-3 ${i < rating ? 'text-red-500 fill-red-500' : 'text-gray-600'}`} viewBox="0 0 24 24">
//           <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
//         </svg>
//       ))}
//     </div>
//   );

//   const HeroCarousel = () => {
//     const [current, setCurrent] = useState(0);
//     const slides = events.slice(0, 5);

//     useEffect(() => {
//       const timer = setInterval(() => setCurrent(prev => (prev + 1) % slides.length), 5000);
//       return () => clearInterval(timer);
//     }, [slides.length]);

//     if (slides.length === 0) return null;

//     return (
//       <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden rounded-2xl mb-12 group border border-slate-800">
//         <div className="absolute inset-0 flex transition-transform duration-700 ease-out" style={{ transform: `translateX(-${current * 100}%)` }}>
//           {slides.map((slide) => (
//             <div key={slide.id} className="min-w-full h-full relative">
//               <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent z-10" />
//               <img src={slide.image} alt={slide.name} className="w-full h-full object-cover" />
//               <div className="absolute bottom-0 left-0 p-8 z-20 w-full max-w-4xl">
//                 <span className="inline-block px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full mb-4 uppercase tracking-wider">Now Showing</span>
//                 <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">{slide.name}</h2>
//                 <div className="flex items-center space-x-4 text-slate-300 mb-6">
//                   <span className="flex items-center"><Calendar className="w-4 h-4 mr-2" /> {slide.date}</span>
//                   <span className="flex items-center"><MapPin className="w-4 h-4 mr-2" /> {slide.venue}</span>
//                   <span className="flex items-center"><Film className="w-4 h-4 mr-2" /> ₹{slide.price}</span>
//                 </div>
//                 <button onClick={() => setSelectedEvent(slide)} className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-semibold transition-all flex items-center shadow-lg shadow-red-900/20">
//                   Book Tickets <Ticket className="ml-2 w-5 h-5" />
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-red-500/30">
//       <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex items-center justify-between h-20">
//             <div className="flex items-center cursor-pointer" onClick={() => setView('home')}>
//               <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-800 rounded-xl flex items-center justify-center shadow-lg shadow-red-900/20 mr-3">
//                 <Ticket className="text-white w-6 h-6" />
//               </div>
//               <div>
//                 <h1 className="text-xl font-bold text-white tracking-tight">TicketMaster<span className="text-red-500">Pro</span></h1>
//                 <p className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">Premium Booking</p>
//               </div>
//             </div>

//             <div className="flex items-center space-x-4">
//               {user ? (
//                 <div className="flex items-center space-x-4">
//                   {(user.role === 'manager' || user.role === 'admin') && (
//                     <button onClick={() => setView('manager')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'manager' ? 'bg-red-600/10 text-red-500' : 'text-slate-300 hover:text-white'}`}>Manager Panel</button>
//                   )}
//                   {user.role === 'admin' && (
//                     <button onClick={() => setView('admin')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'admin' ? 'bg-red-600/10 text-red-500' : 'text-slate-300 hover:text-white'}`}>Admin Panel</button>
//                   )}
                  
//                   <div className="relative group">
//                     <button className="flex items-center space-x-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
//                       <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
//                         <User className="w-4 h-4" />
//                       </div>
//                       <span className="hidden sm:block">{user.email.split('@')[0]}</span>
//                     </button>
                    
//                     <div className="absolute right-0 mt-2 w-48 bg-slate-900 rounded-xl shadow-xl border border-slate-800 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right z-50">
//                       <div className="py-1">
//                         <button onClick={() => setView('tickets')} className="flex items-center w-full px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white"><Ticket className="w-4 h-4 mr-2" /> My Tickets</button>
//                         <button onClick={logout} className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-slate-800 hover:text-red-300"><LogOut className="w-4 h-4 mr-2" /> Sign Out</button>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ) : (
//                 <button onClick={() => setShowAuthModal(true)} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-medium text-sm transition-all shadow-lg shadow-red-900/20">Sign In</button>
//               )}
//             </div>
//           </div>
//         </div>
//       </nav>

//       <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {view === 'home' && (
//           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
//             <HeroCarousel />
//             <div className="flex items-center justify-between mb-8">
//               <h2 className="text-2xl font-bold text-white flex items-center"><span className="w-1 h-8 bg-red-600 rounded-full mr-3"></span>Recommended Events</h2>
//             </div>

//             {loading && events.length === 0 ? (
//               <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 text-red-600 animate-spin" /></div>
//             ) : (
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
//                 {events.map((event) => (
//                   <motion.div key={event.id} whileHover={{ y: -5 }} className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 group cursor-pointer hover:shadow-2xl hover:shadow-red-900/10 transition-all relative" onClick={() => setSelectedEvent(event)}>
                    
//                     {(user?.role === 'admin' || user?.role === 'manager') && (
//                       <button onClick={(e) => deleteEvent(event.id, e)} className="absolute top-3 right-3 z-30 p-2 bg-slate-950/80 hover:bg-red-600 text-slate-300 hover:text-white rounded-full backdrop-blur-sm transition-colors border border-slate-700">
//                         <Trash2 className="w-4 h-4" />
//                       </button>
//                     )}

//                     <div className="relative aspect-[2/3] overflow-hidden">
//                       <img src={event.image} alt={event.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
//                       <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
//                       <div className="absolute bottom-4 left-4 right-4">
//                         <p className="text-xs font-medium text-red-400 mb-1">{event.date}</p>
//                         <h3 className="text-lg font-bold text-white leading-tight mb-1">{event.name}</h3>
//                         {renderStars(4)}
//                       </div>
//                     </div>
//                     <div className="p-4">
//                       <div className="flex justify-between items-center text-sm text-slate-400 mb-3">
//                         <span className="flex items-center"><MapPin className="w-3 h-3 mr-1" /> {event.venue}</span>
//                         <span className="font-semibold text-white">₹{event.price}</span>
//                       </div>
//                       <button className="w-full py-2.5 bg-slate-800 hover:bg-orange-500 text-white rounded-xl text-sm font-medium transition-colors">Book Now</button>
//                     </div>
//                   </motion.div>
//                 ))}
//               </div>
//             )}
//           </motion.div>
//         )}

//         {view === 'manager' && (
//           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto">
//             <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800 shadow-xl">
//               <div className="flex items-center mb-6">
//                 <div className="p-3 bg-red-600/10 rounded-xl mr-4"><LayoutDashboard className="w-6 h-6 text-red-500" /></div>
//                 <div><h2 className="text-2xl font-bold text-white">Manager Dashboard</h2></div>
//               </div>
//               <form onSubmit={createEvent} className="space-y-6">
//                 <div>
//                   <label className="block text-sm font-medium text-slate-300 mb-2">Event Name</label>
//                   <input type="text" required value={eventForm.name} onChange={e => setEventForm({...eventForm, name: e.target.value})} className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-red-500 outline-none" placeholder="e.g. Leo" />
//                 </div>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-slate-300 mb-2">Total Seats</label>
//                     <input type="number" required min="1" value={eventForm.total_seats} onChange={e => setEventForm({...eventForm, total_seats: parseInt(e.target.value)})} className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-red-500 outline-none" />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-slate-300 mb-2">Ticket Price (₹)</label>
//                     <input type="number" required min="0" value={eventForm.price} onChange={e => setEventForm({...eventForm, price: parseInt(e.target.value)})} className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-red-500 outline-none" />
//                   </div>
//                 </div>
                
//                 {/* NEW Custom Inputs! */}
//                 <div>
//                   <label className="block text-sm font-medium text-slate-300 mb-2">Venue</label>
//                   <input type="text" required value={eventForm.venue} onChange={e => setEventForm({...eventForm, venue: e.target.value})} className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-red-500 outline-none" placeholder="e.g. PVR Cinemas, Tiruppur" />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-slate-300 mb-2">Date & Time</label>
//                   <input type="text" required value={eventForm.date} onChange={e => setEventForm({...eventForm, date: e.target.value})} className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-red-500 outline-none" placeholder="e.g. Oct 24, 7:00 PM" />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-slate-300 mb-2">Upload Movie Poster</label>
//                   <input 
//                     type="file" 
//                     accept="image/*" 
//                     onChange={e => setEventForm({...eventForm, image: e.target.files?.[0] || null})} 
//                     className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 focus:ring-2 focus:ring-red-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-700" 
//                   />
//                 </div>

//                 <button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center mt-4">
//                   {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Plus className="w-5 h-5 mr-2" /> Create Event</>}
//                 </button>
//               </form>
//             </div>
//           </motion.div>
//         )}

//         {view === 'admin' && (
//           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
//             <div className="mb-8"><h2 className="text-3xl font-bold text-white mb-2">Admin Master Panel</h2></div>
//             {loading && !reports ? (
//               <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-red-600 animate-spin" /></div>
//             ) : reports ? (
//               <div className="space-y-8">
//                 <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//                   <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
//                     <p className="text-slate-400 font-medium">Total Users</p>
//                     <p className="text-4xl font-bold text-white">{reports.platform_stats.total_users}</p>
//                   </div>
//                   <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
//                     <p className="text-slate-400 font-medium">Total Managers</p>
//                     <p className="text-4xl font-bold text-white">{reports.platform_stats.total_managers}</p>
//                   </div>
//                   <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
//                     <p className="text-slate-400 font-medium">Active Events</p>
//                     <p className="text-4xl font-bold text-white">{reports.platform_stats.total_events}</p>
//                   </div>
//                   <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
//                     <p className="text-slate-400 font-medium">Total Bookings</p>
//                     <p className="text-4xl font-bold text-white">{reports.platform_stats.total_overall_bookings}</p>
//                   </div>
//                 </div>

//                 <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
//                   <div className="overflow-x-auto">
//                     <table className="w-full text-left">
//                       <thead>
//                         <tr className="bg-slate-950 text-slate-400 text-xs uppercase tracking-wider">
//                           <th className="px-6 py-4 font-medium">Event Name</th>
//                           <th className="px-6 py-4 font-medium text-right">Total Seats</th>
//                           <th className="px-6 py-4 font-medium text-right">Booked</th>
//                         </tr>
//                       </thead>
//                       <tbody className="divide-y divide-slate-800">
//                         {reports.event_stats.map((stat, idx) => (
//                           <tr key={idx} className="hover:bg-slate-800/50">
//                             <td className="px-6 py-4 text-white font-medium">{stat.event_name}</td>
//                             <td className="px-6 py-4 text-right text-slate-300">{stat.total_seats}</td>
//                             <td className="px-6 py-4 text-right text-green-400 font-mono">{stat.booked_seats}</td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 </div>
//               </div>
//             ) : <div className="text-center py-20 text-slate-500">No reports available.</div>}
//           </motion.div>
//         )}

//         {view === 'tickets' && (
//           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
//             <h2 className="text-2xl font-bold text-white mb-8 flex items-center"><Ticket className="w-6 h-6 mr-3 text-red-500" /> My Tickets</h2>
//             {bookings.length === 0 ? (
//               <div className="text-center py-20 bg-slate-900 rounded-2xl border border-slate-800">
//                 <p className="text-slate-400">You haven't booked any tickets yet.</p>
//               </div>
//             ) : (
//               <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//                 {bookings.map((booking) => (
//                   <div key={booking.id} className="bg-white text-slate-900 rounded-2xl overflow-hidden relative flex flex-col shadow-xl">
//                     <div className="bg-orange-500 p-4 text-white">
//                       <h3 className="font-bold text-lg">{booking.event_name}</h3>
//                     </div>
//                     <div className="p-6 flex-1 flex flex-col justify-center items-center text-center border-b-2 border-dashed border-slate-200">
//                       <span className="text-slate-400 text-xs uppercase tracking-widest mb-1">Seat Number</span>
//                       <span className="text-5xl font-black text-slate-900">{booking.seat_number}</span>
//                     </div>
//                     <div className="p-4 bg-slate-50 text-xs text-slate-500">ID: #{booking.id}</div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </motion.div>
//         )}
//       </main>

//       {/* Modals */}
//       <AnimatePresence>
//         {showAuthModal && (
//           <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
//             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowAuthModal(false)} />
//             <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-800">
//               <div className="flex border-b border-slate-800">
//                 <button className={`flex-1 py-4 text-sm font-medium transition-colors ${authMode === 'login' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`} onClick={() => setAuthMode('login')}>Login</button>
//                 <button className={`flex-1 py-4 text-sm font-medium transition-colors ${authMode === 'register' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`} onClick={() => setAuthMode('register')}>Register</button>
//               </div>
//               <div className="p-8">
//                 {authMode === 'login' ? (
//                   <form onSubmit={login} className="space-y-4">
//                     <div>
//                       <label className="block text-xs font-medium text-slate-400 mb-1 uppercase">Email</label>
//                       <input type="email" required value={loginForm.email} onChange={e => setLoginForm({...loginForm, email: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white" />
//                     </div>
//                     <div>
//                       <label className="block text-xs font-medium text-slate-400 mb-1 uppercase">Password</label>
//                       <input type="password" required value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white" />
//                     </div>
//                     <button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-bold mt-2">{loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Login'}</button>
//                   </form>
//                 ) : (
//                   <form onSubmit={register} className="space-y-4">
//                     <div><label className="block text-xs font-medium text-slate-400 mb-1 uppercase">Email</label><input type="email" required value={registerForm.email} onChange={e => setRegisterForm({...registerForm, email: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white" /></div>
//                     <div><label className="block text-xs font-medium text-slate-400 mb-1 uppercase">Password</label><input type="password" required value={registerForm.password} onChange={e => setRegisterForm({...registerForm, password: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white" /></div>
//                     <div>
//                       <label className="block text-xs font-medium text-slate-400 mb-1 uppercase">Role</label>
//                       <select value={registerForm.role} onChange={e => setRegisterForm({...registerForm, role: e.target.value as Role})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white">
//                         <option value="user">User</option><option value="manager">Manager</option><option value="admin">Admin</option>
//                       </select>
//                     </div>
//                     <button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-bold mt-2">{loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Create Account'}</button>
//                   </form>
//                 )}
//               </div>
//             </motion.div>
//           </div>
//         )}
//       </AnimatePresence>

//       <AnimatePresence>
//         {selectedEvent && (
//           <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
//             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm" onClick={() => setSelectedEvent(null)} />
//             <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="relative bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-slate-800 flex flex-col md:flex-row">
//               <div className="w-full md:w-1/3 relative hidden md:block">
//                 <img src={selectedEvent.image} className="absolute inset-0 w-full h-full object-cover" alt="poster" />
//                 <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
//                 <div className="absolute bottom-0 left-0 p-6"><h2 className="text-2xl font-bold text-white mb-2">{selectedEvent.name}</h2></div>
//               </div>
//               <div className="flex-1 p-6 md:p-8 overflow-y-auto">
//                 <div className="flex justify-between items-center mb-6">
//                   <h3 className="text-xl font-bold text-white">Select Seats</h3>
//                   <button onClick={() => setSelectedEvent(null)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
//                 </div>
//                 <div className="mb-10"><div className="w-full h-2 bg-slate-700 rounded-full mb-2" /><p className="text-center text-xs text-slate-500 uppercase tracking-widest">Screen</p></div>
//                 <div className="grid grid-cols-10 gap-2 mb-8 max-w-md mx-auto">
//                   {[...Array(Math.min(selectedEvent.total_seats, 100))].map((_, i) => {
//                     const seatNum = i + 1;
//                     const isOccupied = bookedSeats.includes(seatNum);
//                     return (
//                       <button 
//                         key={seatNum} 
//                         disabled={isOccupied || loading} 
//                         onClick={() => bookTicket(seatNum)} 
//                         className={`aspect-square rounded-md text-[10px] font-medium transition-all ${
//                           isOccupied 
//                             ? 'bg-black text-slate-700 cursor-not-allowed border border-slate-800' 
//                             : 'bg-orange-500 text-white hover:bg-orange-400 hover:scale-110 shadow-sm shadow-orange-900/50'
//                         }`}
//                       >
//                         {seatNum}
//                       </button>
//                     );
//                   })}
//                 </div>
//                 <div className="flex justify-center space-x-6 text-xs text-slate-400">
//                   <div className="flex items-center"><div className="w-3 h-3 bg-orange-500 rounded mr-2" /> Available</div>
//                   <div className="flex items-center"><div className="w-3 h-3 bg-black border border-slate-800 rounded mr-2" /> Sold out</div>
//                 </div>
//               </div>
//             </motion.div>
//           </div>
//         )}
//       </AnimatePresence>

//       <div className="fixed bottom-4 right-4 z-[200] space-y-2">
//         <AnimatePresence>
//           {toasts.map(toast => (
//             <motion.div key={toast.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className={`px-4 py-3 rounded-xl shadow-lg border flex items-center min-w-[300px] ${toast.type === 'error' ? 'bg-slate-900 border-red-500/30 text-red-400' : 'bg-slate-900 border-green-500/30 text-green-400'}`}>
//               <span className="text-sm font-medium">{toast.message}</span>
//             </motion.div>
//           ))}
//         </AnimatePresence>
//       </div>
//     </div>
//   );
// }

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Search, Menu, X, User, LogOut, Ticket, Plus, BarChart3, Calendar, 
  MapPin, ChevronRight, ChevronLeft, Loader2, AlertCircle, CheckCircle2, 
  LayoutDashboard, Film, Trash2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Role = 'user' | 'manager' | 'admin';

interface UserModel {
  email: string;
  role: Role;
  access_token: string;
}

interface Event {
  id: number;
  name: string;
  total_seats: number;
  image_url?: string; 
  image?: string; 
  venue?: string;
  date?: string;
  category?: string;
  price?: number;
}

interface Booking {
  id: number;
  event_id: number;
  seat_number: number;
  event_name?: string;
}

interface Report {
  platform_stats: {
    total_users: number;
    total_managers: number;
    total_events: number;
    total_overall_bookings: number;
  };
  event_stats: Array<{
    event_name: string;
    total_seats: number;
    booked_seats: number;
  }>;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

const API_BASE_URL = 'http://127.0.0.1:8000';

const MOCK_IMAGES = [
  "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1000&auto=format&fit=crop"
];

const generateId = () => Math.random().toString(36).substr(2, 9);
const getRandomImage = (id: number) => MOCK_IMAGES[id % MOCK_IMAGES.length];

export default function App() {
  const [user, setUser] = useState<UserModel | null>(null);
  const [view, setView] = useState<'home' | 'manager' | 'admin' | 'tickets'>('home');
  const [events, setEvents] = useState<Event[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reports, setReports] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [bookedSeats, setBookedSeats] = useState<number[]>([]); 
  
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ email: '', password: '', role: 'user' as Role });
  
  const [eventForm, setEventForm] = useState({ 
    name: '', total_seats: 100, venue: '', date: '', price: 150, image: null as File | null 
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('ticket_user');
    if (storedUser) setUser(JSON.parse(storedUser));
    fetchEvents();
  }, []);

  useEffect(() => {
    if (user?.role === 'admin' && view === 'admin') fetchReports();
    if (view === 'tickets' && user) fetchMyBookings();
  }, [user, view]);

  useEffect(() => {
    if (selectedEvent) fetchBookedSeats(selectedEvent.id);
  }, [selectedEvent]);

  const fetchBookedSeats = async (eventId: number) => {
    const data = await apiCall(`/events/${eventId}/booked_seats`);
    if (data) setBookedSeats(data);
  };

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = generateId();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  };

  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const headers: HeadersInit = {
      ...(user?.access_token ? { 'Authorization': `Bearer ${user.access_token}` } : {})
    };

    if (!(options.body instanceof FormData)) {
      (headers as any)['Content-Type'] = 'application/json';
    }

    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: { ...headers, ...options.headers },
      });

      if (res.status === 401) {
        logout();
        addToast('Session expired. Please login again.', 'error');
        return null;
      }

      const data = await res.json();
      if (!res.ok) throw { status: res.status, message: data.detail || 'Something went wrong' };
      return data;
    } catch (error: any) {
      if (error.message === 'Failed to fetch') addToast('Cannot connect to backend!', 'error');
      else if (error.status === 400) addToast(error.message || 'Action failed.', 'error');
      else addToast(error.message || 'Network error.', 'error');
      return null;
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    const data = await apiCall('/events');
    if (data) {
      setEvents(data.map((e: any) => ({
        ...e,
        image: e.image_url || getRandomImage(e.id),
      })));
    }
    setLoading(false);
  };

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append('username', loginForm.email);
    formData.append('password', loginForm.password);

    const data = await apiCall('/login', { method: 'POST', body: formData });

    if (data) {
      const userData: UserModel = { email: loginForm.email, role: data.role, access_token: data.access_token };
      setUser(userData);
      localStorage.setItem('ticket_user', JSON.stringify(userData));
      setShowAuthModal(false);
      addToast(`Welcome back, ${userData.email}!`, 'success');
      setView('home');
    }
    setLoading(false);
  };

  const register = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const data = await apiCall('/register', { method: 'POST', body: JSON.stringify(registerForm) });
    if (data) {
      addToast('Registration successful! Please login.', 'success');
      setAuthMode('login');
    }
    setLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ticket_user');
    setView('home');
    addToast('Logged out successfully', 'info');
  };

  const createEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || (user.role !== 'manager' && user.role !== 'admin')) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('name', eventForm.name);
    formData.append('total_seats', eventForm.total_seats.toString());
    formData.append('venue', eventForm.venue);
    formData.append('date', eventForm.date);
    formData.append('price', eventForm.price.toString());
    if (eventForm.image) formData.append('image', eventForm.image);

    const data = await apiCall('/events', { method: 'POST', body: formData });

    if (data) {
      addToast('Event created successfully!', 'success');
      setEventForm({ name: '', total_seats: 100, venue: '', date: '', price: 150, image: null });
      fetchEvents();
      setView('home');
    }
    setLoading(false);
  };

  const deleteEvent = async (eventId: number, e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (!window.confirm("Are you sure you want to permanently delete this event?")) return;
    
    setLoading(true);
    const data = await apiCall(`/events/${eventId}`, { method: 'DELETE' });
    if (data) {
      addToast("Event permanently deleted.", "success");
      fetchEvents();
      if (view === 'admin') fetchReports(); // Refresh admin stats
    }
    setLoading(false);
  };

  const bookTicket = async (seatNumber: number) => {
    if (!user) { setShowAuthModal(true); return; }
    if (!selectedEvent) return;

    setLoading(true);
    const data = await apiCall('/book', { method: 'POST', body: JSON.stringify({ event_id: selectedEvent.id, seat_number: seatNumber }) });

    if (data) {
      addToast(`Ticket booked! Seat #${seatNumber}`, 'success');
      fetchEvents(); 
      fetchBookedSeats(selectedEvent.id); 
    }
    setLoading(false);
  };

  const fetchMyBookings = async () => {
    if (!user) return;
    setLoading(true);
    const data = await apiCall('/bookings/me');
    if (data) {
      const enriched = data.map((b: any) => {
        const evt = events.find(e => e.id === b.event_id);
        return { ...b, event_name: evt ? evt.name : `Event #${b.event_id}` };
      });
      setBookings(enriched);
    }
    setLoading(false);
  };

  const fetchReports = async () => {
    if (!user || user.role !== 'admin') return;
    setLoading(true);
    const data = await apiCall('/admin/reports');
    if (data) setReports(data);
    setLoading(false);
  };

  const renderStars = (rating: number) => (
    <div className="flex space-x-0.5">
      {[...Array(5)].map((_, i) => (
        <svg key={i} className={`w-3 h-3 ${i < rating ? 'text-red-500 fill-red-500' : 'text-gray-600'}`} viewBox="0 0 24 24">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      ))}
    </div>
  );

  const HeroCarousel = () => {
    const [current, setCurrent] = useState(0);
    const slides = events.slice(0, 5);

    useEffect(() => {
      const timer = setInterval(() => setCurrent(prev => (prev + 1) % slides.length), 5000);
      return () => clearInterval(timer);
    }, [slides.length]);

    if (slides.length === 0) return null;

    return (
      <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden rounded-2xl mb-12 group border border-slate-800">
        <div className="absolute inset-0 flex transition-transform duration-700 ease-out" style={{ transform: `translateX(-${current * 100}%)` }}>
          {slides.map((slide) => (
            <div key={slide.id} className="min-w-full h-full relative">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent z-10" />
              <img src={slide.image} alt={slide.name} className="w-full h-full object-cover" />
              <div className="absolute bottom-0 left-0 p-8 z-20 w-full max-w-4xl">
                <span className="inline-block px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full mb-4 uppercase tracking-wider">Now Showing</span>
                <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">{slide.name}</h2>
                <div className="flex items-center space-x-4 text-slate-300 mb-6">
                  <span className="flex items-center"><Calendar className="w-4 h-4 mr-2" /> {slide.date}</span>
                  <span className="flex items-center"><MapPin className="w-4 h-4 mr-2" /> {slide.venue}</span>
                  <span className="flex items-center"><Film className="w-4 h-4 mr-2" /> ₹{slide.price}</span>
                </div>
                <button onClick={() => setSelectedEvent(slide)} className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-semibold transition-all flex items-center shadow-lg shadow-red-900/20">
                  Book Tickets <Ticket className="ml-2 w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-red-500/30">
      <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center cursor-pointer" onClick={() => setView('home')}>
              <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-800 rounded-xl flex items-center justify-center shadow-lg shadow-red-900/20 mr-3">
                <Ticket className="text-white w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">TicketMaster<span className="text-red-500">Pro</span></h1>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">Premium Booking</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  {(user.role === 'manager' || user.role === 'admin') && (
                    <button onClick={() => setView('manager')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'manager' ? 'bg-red-600/10 text-red-500' : 'text-slate-300 hover:text-white'}`}>Manager Panel</button>
                  )}
                  {user.role === 'admin' && (
                    <button onClick={() => setView('admin')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'admin' ? 'bg-red-600/10 text-red-500' : 'text-slate-300 hover:text-white'}`}>Admin Panel</button>
                  )}
                  
                  <div className="relative group">
                    <button className="flex items-center space-x-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                        <User className="w-4 h-4" />
                      </div>
                      <span className="hidden sm:block">{user.email.split('@')[0]}</span>
                    </button>
                    
                    <div className="absolute right-0 mt-2 w-48 bg-slate-900 rounded-xl shadow-xl border border-slate-800 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right z-50">
                      <div className="py-1">
                        <button onClick={() => setView('tickets')} className="flex items-center w-full px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white"><Ticket className="w-4 h-4 mr-2" /> My Tickets</button>
                        <button onClick={logout} className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-slate-800 hover:text-red-300"><LogOut className="w-4 h-4 mr-2" /> Sign Out</button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowAuthModal(true)} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-medium text-sm transition-all shadow-lg shadow-red-900/20">Sign In</button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'home' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <HeroCarousel />
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white flex items-center"><span className="w-1 h-8 bg-red-600 rounded-full mr-3"></span>Recommended Events</h2>
            </div>

            {loading && events.length === 0 ? (
              <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 text-red-600 animate-spin" /></div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {events.map((event) => (
                  <motion.div key={event.id} whileHover={{ y: -5 }} className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 group cursor-pointer hover:shadow-2xl hover:shadow-red-900/10 transition-all relative" onClick={() => setSelectedEvent(event)}>
                    
                    {(user?.role === 'admin' || user?.role === 'manager') && (
                      <button onClick={(e) => deleteEvent(event.id, e)} className="absolute top-3 right-3 z-30 p-2 bg-slate-950/80 hover:bg-red-600 text-slate-300 hover:text-white rounded-full backdrop-blur-sm transition-colors border border-slate-700">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    <div className="relative aspect-[2/3] overflow-hidden">
                      <img src={event.image} alt={event.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <p className="text-xs font-medium text-red-400 mb-1">{event.date}</p>
                        <h3 className="text-lg font-bold text-white leading-tight mb-1">{event.name}</h3>
                        {renderStars(4)}
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-center text-sm text-slate-400 mb-3">
                        <span className="flex items-center"><MapPin className="w-3 h-3 mr-1" /> {event.venue}</span>
                        <span className="font-semibold text-white">₹{event.price}</span>
                      </div>
                      <button className="w-full py-2.5 bg-slate-800 hover:bg-orange-500 text-white rounded-xl text-sm font-medium transition-colors">Book Now</button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {view === 'manager' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto">
            <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800 shadow-xl">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-red-600/10 rounded-xl mr-4"><LayoutDashboard className="w-6 h-6 text-red-500" /></div>
                <div><h2 className="text-2xl font-bold text-white">Manager Dashboard</h2></div>
              </div>
              <form onSubmit={createEvent} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Event Name</label>
                  <input type="text" required value={eventForm.name} onChange={e => setEventForm({...eventForm, name: e.target.value})} className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-red-500 outline-none" placeholder="e.g. Leo" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Total Seats</label>
                    <input type="number" required min="1" value={eventForm.total_seats} onChange={e => setEventForm({...eventForm, total_seats: parseInt(e.target.value)})} className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-red-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Ticket Price (₹)</label>
                    <input type="number" required min="0" value={eventForm.price} onChange={e => setEventForm({...eventForm, price: parseInt(e.target.value)})} className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-red-500 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Venue</label>
                  <input type="text" required value={eventForm.venue} onChange={e => setEventForm({...eventForm, venue: e.target.value})} className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-red-500 outline-none" placeholder="e.g. PVR Cinemas, Tiruppur" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Date & Time</label>
                  <input type="text" required value={eventForm.date} onChange={e => setEventForm({...eventForm, date: e.target.value})} className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-red-500 outline-none" placeholder="e.g. Oct 24, 7:00 PM" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Upload Movie Poster</label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={e => setEventForm({...eventForm, image: e.target.files?.[0] || null})} 
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 focus:ring-2 focus:ring-red-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-700" 
                  />
                </div>
                <button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center mt-4">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Plus className="w-5 h-5 mr-2" /> Create Event</>}
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {view === 'admin' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mb-8"><h2 className="text-3xl font-bold text-white mb-2">Admin Master Panel</h2></div>
            {loading && !reports ? (
              <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-red-600 animate-spin" /></div>
            ) : reports ? (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                    <p className="text-slate-400 font-medium">Total Users</p>
                    <p className="text-4xl font-bold text-white">{reports.platform_stats.total_users}</p>
                  </div>
                  <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                    <p className="text-slate-400 font-medium">Total Managers</p>
                    <p className="text-4xl font-bold text-white">{reports.platform_stats.total_managers}</p>
                  </div>
                  <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                    <p className="text-slate-400 font-medium">Active Events</p>
                    <p className="text-4xl font-bold text-white">{reports.platform_stats.total_events}</p>
                  </div>
                  <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                    <p className="text-slate-400 font-medium">Total Bookings</p>
                    <p className="text-4xl font-bold text-white">{reports.platform_stats.total_overall_bookings}</p>
                  </div>
                </div>

                <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-950 text-slate-400 text-xs uppercase tracking-wider">
                          <th className="px-6 py-4 font-medium">Event Name</th>
                          <th className="px-6 py-4 font-medium text-right">Total Seats</th>
                          <th className="px-6 py-4 font-medium text-right">Booked</th>
                          <th className="px-6 py-4 font-medium text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {reports.event_stats.map((stat, idx) => {
                          const eventObj = events.find(e => e.name === stat.event_name);
                          return (
                            <tr key={idx} className="hover:bg-slate-800/50">
                              <td className="px-6 py-4 text-white font-medium">{stat.event_name}</td>
                              <td className="px-6 py-4 text-right text-slate-300">{stat.total_seats}</td>
                              <td className="px-6 py-4 text-right text-green-400 font-mono">{stat.booked_seats}</td>
                              <td className="px-6 py-4 text-center">
                                {eventObj && (
                                  <button 
                                    onClick={(e) => deleteEvent(eventObj.id, e)}
                                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : <div className="text-center py-20 text-slate-500">No reports available.</div>}
          </motion.div>
        )}

        {view === 'tickets' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-2xl font-bold text-white mb-8 flex items-center"><Ticket className="w-6 h-6 mr-3 text-red-500" /> My Tickets</h2>
            {bookings.length === 0 ? (
              <div className="text-center py-20 bg-slate-900 rounded-2xl border border-slate-800">
                <p className="text-slate-400">You haven't booked any tickets yet.</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {bookings.map((booking) => (
                  <div key={booking.id} className="bg-white text-slate-900 rounded-2xl overflow-hidden relative flex flex-col shadow-xl">
                    <div className="bg-orange-500 p-4 text-white">
                      <h3 className="font-bold text-lg">{booking.event_name}</h3>
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-center items-center text-center border-b-2 border-dashed border-slate-200">
                      <span className="text-slate-400 text-xs uppercase tracking-widest mb-1">Seat Number</span>
                      <span className="text-5xl font-black text-slate-900">{booking.seat_number}</span>
                    </div>
                    <div className="p-4 bg-slate-50 text-xs text-slate-500">ID: #{booking.id}</div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </main>

      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowAuthModal(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-800">
              <div className="flex border-b border-slate-800">
                <button className={`flex-1 py-4 text-sm font-medium transition-colors ${authMode === 'login' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`} onClick={() => setAuthMode('login')}>Login</button>
                <button className={`flex-1 py-4 text-sm font-medium transition-colors ${authMode === 'register' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`} onClick={() => setAuthMode('register')}>Register</button>
              </div>
              <div className="p-8">
                {authMode === 'login' ? (
                  <form onSubmit={login} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1 uppercase">Email</label>
                      <input type="email" required value={loginForm.email} onChange={e => setLoginForm({...loginForm, email: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1 uppercase">Password</label>
                      <input type="password" required value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white" />
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-bold mt-2">{loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Login'}</button>
                  </form>
                ) : (
                  <form onSubmit={register} className="space-y-4">
                    <div><label className="block text-xs font-medium text-slate-400 mb-1 uppercase">Email</label><input type="email" required value={registerForm.email} onChange={e => setRegisterForm({...registerForm, email: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white" /></div>
                    <div><label className="block text-xs font-medium text-slate-400 mb-1 uppercase">Password</label><input type="password" required value={registerForm.password} onChange={e => setRegisterForm({...registerForm, password: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white" /></div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1 uppercase">Role</label>
                      <select value={registerForm.role} onChange={e => setRegisterForm({...registerForm, role: e.target.value as Role})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white">
                        <option value="user">User</option><option value="manager">Manager</option><option value="admin">Admin</option>
                      </select>
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-bold mt-2">{loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Create Account'}</button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedEvent && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm" onClick={() => setSelectedEvent(null)} />
            <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="relative bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-slate-800 flex flex-col md:flex-row">
              <div className="w-full md:w-1/3 relative hidden md:block">
                <img src={selectedEvent.image} className="absolute inset-0 w-full h-full object-cover" alt="poster" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6"><h2 className="text-2xl font-bold text-white mb-2">{selectedEvent.name}</h2></div>
              </div>
              <div className="flex-1 p-6 md:p-8 overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-white">Select Seats</h3>
                  <button onClick={() => setSelectedEvent(null)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
                </div>
                <div className="mb-10"><div className="w-full h-2 bg-slate-700 rounded-full mb-2" /><p className="text-center text-xs text-slate-500 uppercase tracking-widest">Screen</p></div>
                <div className="grid grid-cols-10 gap-2 mb-8 max-w-md mx-auto">
                  {[...Array(Math.min(selectedEvent.total_seats, 100))].map((_, i) => {
                    const seatNum = i + 1;
                    const isOccupied = bookedSeats.includes(seatNum);
                    return (
                      <button 
                        key={seatNum} 
                        disabled={isOccupied || loading} 
                        onClick={() => bookTicket(seatNum)} 
                        className={`aspect-square rounded-md text-[10px] font-medium transition-all ${
                          isOccupied 
                            ? 'bg-black text-slate-700 cursor-not-allowed border border-slate-800' 
                            : 'bg-orange-500 text-white hover:bg-orange-400 hover:scale-110 shadow-sm shadow-orange-900/50'
                        }`}
                      >
                        {seatNum}
                      </button>
                    );
                  })}
                </div>
                <div className="flex justify-center space-x-6 text-xs text-slate-400">
                  <div className="flex items-center"><div className="w-3 h-3 bg-orange-500 rounded mr-2" /> Available</div>
                  <div className="flex items-center"><div className="w-3 h-3 bg-black border border-slate-800 rounded mr-2" /> Sold out</div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-4 right-4 z-[200] space-y-2">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div key={toast.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className={`px-4 py-3 rounded-xl shadow-lg border flex items-center min-w-[300px] ${toast.type === 'error' ? 'bg-slate-900 border-red-500/30 text-red-400' : 'bg-slate-900 border-green-500/30 text-green-400'}`}>
              <span className="text-sm font-medium">{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}