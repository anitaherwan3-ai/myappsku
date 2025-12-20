
import React, { useMemo, useState } from 'react';
import { useApp } from '../context';
import { MapPin, Users, Activity, Filter, Info, ChevronRight, AlertCircle, TrendingUp } from 'lucide-react';

const PatientMap = () => {
    const { patients, activities } = useApp();
    const [filterCategory, setFilterCategory] = useState('all');

    // Mengelompokkan pasien berdasarkan koordinat kegiatan
    const hotspots = useMemo(() => {
        const map: Record<string, { activity: any, count: number, triage: any }> = {};
        
        patients.forEach(p => {
            if (filterCategory !== 'all' && p.category !== filterCategory) return;
            
            const act = activities.find(a => a.id === p.activityId);
            if (!act) return;

            const key = `${act.id}`;
            if (!map[key]) {
                map[key] = { 
                    activity: act, 
                    count: 0, 
                    triage: { Red: 0, Yellow: 0, Green: 0 } 
                };
            }
            map[key].count++;
            map[key].triage[p.triage]++;
        });

        return Object.values(map).sort((a, b) => b.count - a.count);
    }, [patients, activities, filterCategory]);

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-2xl md:text-3xl font-black text-slate-800 flex items-center gap-4 tracking-tighter">
                        <div className="p-3 bg-primary/10 text-primary rounded-2xl"><MapPin /></div>
                        PETA SEBARAN PASIEN
                    </h2>
                    <p className="text-slate-400 text-sm mt-1 font-medium">Visualisasi klaster dan kepadatan pelayanan kesehatan.</p>
                </div>
                
                <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 relative z-10 w-full lg:w-auto">
                    {(['all', 'Berobat', 'MCU'] as const).map(cat => (
                        <button 
                            key={cat}
                            onClick={() => setFilterCategory(cat)}
                            className={`flex-1 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filterCategory === cat ? 'bg-white text-primary shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            {cat === 'all' ? 'SEMUA' : cat}
                        </button>
                    ))}
                </div>
                <div className="absolute top-0 right-0 p-10 opacity-5 -z-0"><MapPin size={150} /></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* List of Regions/Activities as Hotspots */}
                <div className="lg:col-span-1 space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                    <div className="flex items-center justify-between px-2 mb-2">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Titik Pelayanan Aktif</h3>
                        <span className="text-[10px] font-black text-primary px-2 py-0.5 bg-primary/10 rounded-full">{hotspots.length} LOKASI</span>
                    </div>
                    {hotspots.length > 0 ? hotspots.map((spot, i) => (
                        <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:border-primary/30 transition-all group hover:shadow-xl hover:shadow-primary/5 active:scale-[0.98]">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3.5 bg-slate-50 text-slate-400 rounded-2xl group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                    <TrendingUp size={20}/>
                                </div>
                                <div className="text-right">
                                    <span className="text-3xl font-black text-slate-800 tracking-tighter leading-none">{spot.count}</span>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Total Pasien</p>
                                </div>
                            </div>
                            <h4 className="font-black text-slate-800 mb-1 leading-tight uppercase tracking-tighter text-sm">{spot.activity.name}</h4>
                            <div className="flex items-center gap-2 text-xs text-slate-400 mb-6 font-medium">
                                <MapPin size={12} className="text-primary"/> {spot.activity.location}
                            </div>
                            
                            <div className="space-y-3">
                                <div className="flex gap-1 h-2.5 rounded-full overflow-hidden bg-slate-100 shadow-inner">
                                    <div className="bg-rose-500 transition-all duration-1000" style={{ width: `${(spot.triage.Red / spot.count) * 100}%` }}></div>
                                    <div className="bg-amber-400 transition-all duration-1000" style={{ width: `${(spot.triage.Yellow / spot.count) * 100}%` }}></div>
                                    <div className="bg-emerald-500 transition-all duration-1000" style={{ width: `${(spot.triage.Green / spot.count) * 100}%` }}></div>
                                </div>
                                <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                    <div className="text-center">
                                        <div className="text-[8px] font-black text-slate-400 uppercase">RED</div>
                                        <div className="text-xs font-black text-rose-500">{spot.triage.Red}</div>
                                    </div>
                                    <div className="h-4 w-px bg-slate-200"></div>
                                    <div className="text-center">
                                        <div className="text-[8px] font-black text-slate-400 uppercase">YEL</div>
                                        <div className="text-xs font-black text-amber-500">{spot.triage.Yellow}</div>
                                    </div>
                                    <div className="h-4 w-px bg-slate-200"></div>
                                    <div className="text-center">
                                        <div className="text-[8px] font-black text-slate-400 uppercase">GRN</div>
                                        <div className="text-xs font-black text-emerald-500">{spot.triage.Green}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="p-16 text-center bg-white rounded-[40px] border border-dashed border-slate-200">
                            <AlertCircle size={40} className="mx-auto text-slate-200 mb-4" />
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Tidak ada data lokasi</p>
                        </div>
                    )}
                </div>

                {/* Map Visual (Simulated with Info-Graphic) */}
                <div className="lg:col-span-2 bg-slate-900 rounded-[40px] p-2 shadow-2xl relative min-h-[400px] md:min-h-[600px] overflow-hidden group">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1474&auto=format&fit=crop')] bg-cover bg-center opacity-20 transition-transform duration-[10s] group-hover:scale-110"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                    
                    <div className="absolute inset-0 flex items-center justify-center p-8 md:p-12">
                         <div className="text-center bg-slate-900/40 backdrop-blur-xl p-8 md:p-12 rounded-[50px] border border-white/5 max-w-lg shadow-2xl animate-fade-in-up">
                             <div className="w-24 h-24 bg-primary/20 rounded-[32px] flex items-center justify-center mx-auto mb-8 border border-primary/30 shadow-2xl shadow-primary/20 animate-pulse-slow">
                                 <MapPin size={48} className="text-primary"/>
                             </div>
                             <h3 className="text-3xl md:text-4xl font-black text-white mb-4 uppercase tracking-tighter italic">WAR ROOM MAPS</h3>
                             <p className="text-slate-400 text-sm md:text-base leading-relaxed mb-10 font-medium">
                                Sistem integrasi spasial menghubungkan data rekam medis dengan koordinat geografis kegiatan Command Center secara akurat.
                             </p>
                             <div className="inline-flex items-center gap-4 text-left p-5 bg-white/5 rounded-3xl border border-white/10">
                                 <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                                     <Info size={20} />
                                 </div>
                                 <div>
                                     <p className="text-[10px] text-white/50 font-black uppercase tracking-widest mb-1">Status Sistem</p>
                                     <p className="text-xs text-amber-400 font-bold leading-tight">
                                         GPS Geofencing Active • Sinkronisasi Lokasi Real-time via Database Laravel
                                     </p>
                                 </div>
                             </div>
                         </div>
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute bottom-10 left-10 p-4 border-l-2 border-primary/50 text-white/30 hidden md:block">
                        <div className="text-[8px] font-black uppercase tracking-[0.3em]">Lat: -2.990934</div>
                        <div className="text-[8px] font-black uppercase tracking-[0.3em]">Lng: 104.756554</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientMap;
