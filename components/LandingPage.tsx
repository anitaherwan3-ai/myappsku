import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context';
import { Phone, Clock, Ambulance, Video, Users, ChevronRight, MapPin, Calendar, ArrowRight, LogIn, Activity, Heart, ChevronLeft } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const { news, activities, carouselItems } = useApp();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [actIndex, setActIndex] = useState(0);

  // Scroll Effect for Navbar
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Carousel Auto-play
  useEffect(() => {
    if (carouselItems.length > 0) {
        const timer = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % carouselItems.length);
        }, 5000);
        return () => clearInterval(timer);
    }
  }, [carouselItems.length]);

  // Activity Slider Logic
  const topActivities = [...activities]
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
    .slice(0, 5); // Get latest 5
  
  const visibleActivities = 3;
  
  const nextAct = () => {
      setActIndex(prev => Math.min(prev + 1, Math.max(0, topActivities.length - visibleActivities)));
  };

  const prevAct = () => {
      setActIndex(prev => Math.max(prev - 1, 0));
  };

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-primary selection:text-white">
      {/* Navbar */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-md py-3' : 'bg-transparent py-5'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg transition-colors ${scrolled ? 'bg-primary text-white' : 'bg-white text-primary'}`}>P</div>
            <div>
                <h1 className={`font-bold text-xl leading-none ${scrolled ? 'text-gray-800' : 'text-white'}`}>PCC Sumsel</h1>
                <p className={`text-[10px] font-bold tracking-widest uppercase mt-0.5 ${scrolled ? 'text-primary' : 'text-white/80'}`}>Management System</p>
            </div>
          </div>
          <div>
            <button 
                onClick={() => navigate('/login')} 
                className={`px-6 py-2.5 rounded-full font-bold shadow-lg transition transform hover:scale-105 flex items-center gap-2 text-sm ${scrolled ? 'bg-primary text-white hover:bg-secondary' : 'bg-white text-primary hover:bg-gray-100'}`}
            >
               <LogIn size={16}/> Login Petugas
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen min-h-[600px] overflow-hidden">
          {carouselItems.map((item, idx) => (
             <div key={item.id} className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                 <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-transparent to-transparent z-20" />
                 <img src={item.imageUrl} className="w-full h-full object-cover transform scale-105" alt="Hero" />
                 <div className="absolute inset-0 z-30 flex items-center px-6">
                     <div className="container mx-auto">
                         <div className="max-w-3xl animate-fade-in-up">
                            {/* Removed Badge and Buttons as requested */}
                            <h2 className="text-5xl md:text-7xl font-extrabold text-white mb-4 leading-tight drop-shadow-lg">
                                {item.title}
                            </h2>
                            <p className="text-xl md:text-2xl text-gray-200 font-light border-l-4 border-primary pl-6">
                                {item.subtitle}
                            </p>
                         </div>
                     </div>
                 </div>
             </div>
          ))}
          {/* Indicators */}
          <div className="absolute bottom-10 right-10 z-30 flex gap-3">
              {carouselItems.map((_, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setCurrentSlide(idx)} 
                    className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentSlide ? 'bg-primary w-12' : 'bg-white/30 w-6 hover:bg-white'}`} 
                  />
              ))}
          </div>
      </section>

      {/* Stats Floating Banner */}
      <div className="container mx-auto px-6 relative z-40 -mt-20 mb-20">
          <div className="bg-white rounded-2xl shadow-2xl shadow-slate-200/50 p-8 grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-gray-100">
              <div className="flex items-center gap-4 p-2">
                  <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center shrink-0">
                      <Ambulance size={28} />
                  </div>
                  <div>
                      <h4 className="text-2xl font-bold text-gray-800">24 Jam</h4>
                      <p className="text-gray-500 text-sm">Layanan Gawat Darurat</p>
                  </div>
              </div>
              <div className="flex items-center gap-4 p-2">
                  <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center shrink-0">
                      <Users size={28} />
                  </div>
                  <div>
                      <h4 className="text-2xl font-bold text-gray-800">Profesional</h4>
                      <p className="text-gray-500 text-sm">Tenaga Medis Ahli</p>
                  </div>
              </div>
              <div className="flex items-center gap-4 p-2">
                  <div className="w-14 h-14 bg-green-50 text-green-500 rounded-full flex items-center justify-center shrink-0">
                      <Activity size={28} />
                  </div>
                  <div>
                      <h4 className="text-2xl font-bold text-gray-800">Terintegrasi</h4>
                      <p className="text-gray-500 text-sm">Sistem Data Satu Pintu</p>
                  </div>
              </div>
          </div>
      </div>

      {/* Services Section */}
      <section className="py-20 bg-slate-50 relative overflow-hidden">
        {/* Decor */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

        <div className="container mx-auto px-6 relative z-10">
            <div className="text-center max-w-2xl mx-auto mb-16">
                <span className="text-primary font-bold tracking-wider uppercase text-sm mb-2 block">Layanan Unggulan</span>
                <h3 className="text-4xl font-extrabold text-gray-900 mb-4">Solusi Kesehatan Komprehensif</h3>
                <p className="text-gray-500 text-lg">Kami menyediakan berbagai layanan kesehatan modern yang terintegrasi untuk menjamin kesejahteraan masyarakat.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { icon: Ambulance, color: 'text-red-500', bg: 'from-red-500 to-rose-500', title: 'Gawat Darurat', desc: 'Respon cepat armada ambulans lengkap dengan peralatan medis standar ICU.' },
                    { icon: Video, color: 'text-blue-500', bg: 'from-blue-500 to-indigo-500', title: 'TeleMedicine', desc: 'Konsultasi jarak jauh dengan dokter spesialis melalui video call berkualitas HD.' },
                    { icon: Heart, color: 'text-rose-500', bg: 'from-rose-500 to-pink-500', title: 'Medical Check-Up', desc: 'Pemeriksaan kesehatan menyeluruh dengan hasil yang terintegrasi digital.' },
                ].map((service, i) => (
                    <div key={i} className="group bg-white p-8 rounded-3xl shadow-lg border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                            <service.icon size={120} />
                        </div>
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${service.bg} flex items-center justify-center text-white shadow-lg mb-6 group-hover:scale-110 transition-transform`}>
                            <service.icon size={32} />
                        </div>
                        <h4 className="text-2xl font-bold mb-3 text-gray-800">{service.title}</h4>
                        <p className="text-gray-500 leading-relaxed mb-6">{service.desc}</p>
                        {/* Link removed as requested */}
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* Activities Section (Top 5, Show 3 Slider) */}
      <section className="py-24 bg-white">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4">
                <div>
                    <h3 className="text-4xl font-extrabold text-gray-900 mb-2">Agenda Kegiatan</h3>
                    <div className="h-1.5 w-24 bg-primary rounded-full"></div>
                </div>
                {/* Navigation Controls */}
                <div className="flex gap-2">
                    <button 
                        onClick={prevAct} 
                        disabled={actIndex === 0}
                        className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 disabled:opacity-50 transition"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button 
                        onClick={nextAct}
                        disabled={actIndex >= topActivities.length - visibleActivities}
                        className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 disabled:opacity-50 transition"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {topActivities.slice(actIndex, actIndex + visibleActivities).map(a => (
                    <div key={a.id} className="bg-white rounded-3xl border border-gray-100 shadow-lg hover:shadow-2xl hover:border-primary/30 transition duration-300 flex flex-col overflow-hidden group">
                         <div className="h-3 bg-gradient-to-r from-primary to-emerald-400"></div>
                         <div className="p-6 flex flex-col h-full">
                             <div className="flex justify-between items-start mb-6">
                                 <div className="bg-slate-50 border border-slate-200 p-2 rounded-2xl text-center min-w-[60px] group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-colors">
                                     <span className="block text-lg font-bold">{new Date(a.startDate).getDate()}</span>
                                     <span className="block text-[10px] uppercase font-bold tracking-wider">{new Date(a.startDate).toLocaleString('default', { month: 'short' })}</span>
                                 </div>
                                 <span className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-wide border ${a.status === 'On Progress' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
                                     {a.status}
                                 </span>
                             </div>
                             <h4 className="text-lg font-bold leading-snug text-gray-800 mb-4 group-hover:text-primary transition-colors line-clamp-3">{a.name}</h4>
                             
                             <div className="mt-auto space-y-2 pt-4 border-t border-gray-100">
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <MapPin size={14} className="text-accent shrink-0"/> 
                                    <span className="truncate">{a.location}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Users size={14} className="text-accent shrink-0"/> 
                                    <span className="truncate">{a.host}</span>
                                </div>
                             </div>
                         </div>
                    </div>
                ))}
            </div>
          </div>
      </section>

      {/* News Section */}
      <section className="py-24 bg-slate-900 text-white">
        <div className="container mx-auto px-6">
            <div className="flex justify-between items-center mb-16">
                <div>
                    <span className="text-accent font-bold tracking-wider uppercase text-sm mb-2 block">Informasi Publik</span>
                    <h3 className="text-4xl font-extrabold">Berita & Artikel</h3>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {news.map((n, i) => (
                    <div 
                        key={n.id} 
                        onClick={() => navigate(`/news/${n.id}`)}
                        className="group bg-slate-800 rounded-2xl overflow-hidden hover:-translate-y-2 transition duration-500 shadow-2xl shadow-black/20 cursor-pointer"
                    >
                        <div className="h-56 overflow-hidden relative">
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition z-10"></div>
                            <img src={n.imageUrl} alt={n.title} className="w-full h-full object-cover transform group-hover:scale-110 transition duration-700" />
                            <div className="absolute top-4 left-4 z-20 bg-primary text-white text-xs font-bold px-3 py-1 rounded-md shadow-lg">
                                {n.date}
                            </div>
                        </div>
                        <div className="p-6">
                            <h4 className="text-xl font-bold mb-3 text-white group-hover:text-primary transition leading-tight">{n.title}</h4>
                            <p className="text-slate-400 text-sm leading-relaxed line-clamp-3 mb-4">{n.content}</p>
                            <button className="text-accent text-sm font-bold flex items-center gap-2 group-hover:gap-3 transition-all">Baca Selengkapnya <ChevronRight size={14}/></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white pt-20 pb-10 border-t border-gray-100 font-sans">
        <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                <div className="md:col-span-2 pr-10">
                    <div className="flex items-center gap-3 mb-6">
                         <div className="w-12 h-12 bg-gradient-to-br from-primary to-teal-400 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">P</div>
                         <div>
                            <h5 className="text-gray-900 font-bold text-2xl leading-none">PCC Sumsel</h5>
                            <p className="text-xs text-gray-500 font-bold tracking-[0.2em] uppercase mt-1">Management System</p>
                         </div>
                    </div>
                    <p className="text-gray-500 leading-relaxed mb-6">
                        Pusat Komando Kesehatan Provinsi Sumatera Selatan. Mengintegrasikan data, sumber daya, dan layanan untuk respon kesehatan yang cepat dan akurat.
                    </p>
                </div>
                
                <div>
                    <h5 className="text-gray-900 font-bold text-lg mb-6">Tautan Cepat</h5>
                    <ul className="space-y-4 text-gray-500 text-sm">
                        <li><a href="#" className="hover:text-primary transition flex items-center gap-2"><ChevronRight size={14} className="text-gray-300"/> Beranda</a></li>
                        <li><a href="#" className="hover:text-primary transition flex items-center gap-2"><ChevronRight size={14} className="text-gray-300"/> Tentang Kami</a></li>
                        <li><a href="#" className="hover:text-primary transition flex items-center gap-2"><ChevronRight size={14} className="text-gray-300"/> Layanan</a></li>
                        <li><a href="#" className="hover:text-primary transition flex items-center gap-2"><ChevronRight size={14} className="text-gray-300"/> Berita</a></li>
                    </ul>
                </div>

                <div>
                    <h5 className="text-gray-900 font-bold text-lg mb-6">Kontak Kami</h5>
                    <ul className="space-y-4 text-sm text-gray-500">
                        <li className="flex items-start gap-3">
                            <MapPin className="text-primary mt-1 shrink-0" size={18}/>
                            <span>Jl. Jendral Sudirman Km 3,5</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Phone className="text-primary shrink-0" size={18}/>
                            <span className="font-bold text-gray-800">0811-7870-119</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Clock className="text-primary shrink-0" size={18}/>
                            <span>Senin - Minggu (24 Jam)</span>
                        </li>
                    </ul>
                </div>
            </div>
            
            <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
                <p>&copy; {new Date().getFullYear()} Dinas Kesehatan Provinsi Sumatera Selatan.</p>
                <div className="flex gap-6">
                    <a href="#" className="hover:text-gray-600">Kebijakan Privasi</a>
                    <a href="#" className="hover:text-gray-600">Syarat & Ketentuan</a>
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;