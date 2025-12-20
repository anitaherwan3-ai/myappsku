
import React, { useMemo, useState } from 'react';
import { useApp } from '../context';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, AreaChart, Area 
} from 'recharts';
import { 
  Users, Map, AlertTriangle, TrendingUp, ChevronRight, 
  Filter, Calendar, Activity, Activity as ActivityIcon, 
  ArrowUpRight, ArrowDownRight, ClipboardList
} from 'lucide-react';

const DashboardSummary = () => {
    const { patients, activities, isLoading } = useApp();

    // Filter State
    const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
    const [selectedActivity, setSelectedActivity] = useState<string>('all');

    // Filtering Logic
    const filteredPatients = useMemo(() => {
        return patients.filter(p => {
            const date = new Date(p.visitDate);
            const matchYear = selectedYear === 'all' || date.getFullYear().toString() === selectedYear;
            const matchActivity = selectedActivity === 'all' || p.activityId === selectedActivity;
            return matchYear && matchActivity;
        });
    }, [patients, selectedYear, selectedActivity]);

    // Analytics Calculations
    const stats = useMemo(() => {
        const total = filteredPatients.length;
        const red = filteredPatients.filter(p => p.triage === 'Red').length;
        const yellow = filteredPatients.filter(p => p.triage === 'Yellow').length;
        const green = filteredPatients.filter(p => p.triage === 'Green').length;
        const referrals = filteredPatients.filter(p => p.referralStatus === 'Rujuk').length;
        
        // Top 10 Diseases
        const diseaseMap: Record<string, number> = {};
        filteredPatients.forEach(p => {
            if (p.category === 'Berobat' && p.diagnosisName) {
                diseaseMap[p.diagnosisName] = (diseaseMap[p.diagnosisName] || 0) + 1;
            }
        });
        const topDiseases = Object.entries(diseaseMap)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        // Visit Trends (by Date)
        const trendMap: Record<string, number> = {};
        filteredPatients.forEach(p => {
            trendMap[p.visitDate] = (trendMap[p.visitDate] || 0) + 1;
        });
        const visitTrend = Object.entries(trendMap)
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Referral Data
        const referralData = [
            { name: 'Dirujuk', value: referrals, color: '#f43f5e' },
            { name: 'Selesai/Rawat Jalan', value: total - referrals, color: '#10b981' }
        ];

        return { 
            total, red, yellow, green, referrals, 
            topDiseases, visitTrend, referralData,
            triageData: [
                { name: 'Red', value: red, color: '#f43f5e' },
                { name: 'Yellow', value: yellow, color: '#fbbf24' },
                { name: 'Green', value: green, color: '#10b981' },
            ]
        };
    }, [filteredPatients]);

    const availableYears = useMemo(() => {
        const years = new Set(patients.map(p => new Date(p.visitDate).getFullYear().toString()));
        years.add(new Date().getFullYear().toString());
        return Array.from(years).sort().reverse();
    }, [patients]);

    if (isLoading) return (
        <div className="h-full flex flex-col items-center justify-center p-20 text-slate-400">
            <ActivityIcon size={48} className="animate-spin text-primary mb-4" />
            <p className="font-bold tracking-widest animate-pulse">MEMUAT DATA INTELIJEN...</p>
        </div>
    );

    return (
        <div className="space-y-8 pb-20 animate-fade-in">
            {/* Header & Advanced Filter Bar */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                        <ActivityIcon className="text-primary" /> Analisis War Room PCC
                    </h2>
                    <p className="text-slate-400 text-sm">Monitor kesehatan masyarakat Sumatera Selatan secara real-time.</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200 w-full sm:w-auto">
                        <div className="p-2 text-slate-400"><Calendar size={18}/></div>
                        <select 
                            className="bg-transparent border-none text-sm font-bold text-slate-700 focus:ring-0 outline-none pr-8 cursor-pointer"
                            value={selectedYear}
                            onChange={e => setSelectedYear(e.target.value)}
                        >
                            <option value="all">Semua Tahun</option>
                            {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200 w-full sm:w-auto">
                        <div className="p-2 text-slate-400"><Activity size={18}/></div>
                        <select 
                            className="bg-transparent border-none text-sm font-bold text-slate-700 focus:ring-0 outline-none pr-8 cursor-pointer max-w-[200px]"
                            value={selectedActivity}
                            onChange={e => setSelectedActivity(e.target.value)}
                        >
                            <option value="all">Semua Kegiatan</option>
                            {activities.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                    </div>
                    
                    <button 
                        onClick={() => window.print()}
                        className="bg-primary text-white p-3 rounded-2xl shadow-lg shadow-primary/20 hover:bg-secondary transition-all active:scale-95"
                        title="Cetak Laporan Dashboard"
                    >
                        <ClipboardList size={20} />
                    </button>
                </div>
            </div>

            {/* KPI Cards Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Registrasi', val: stats.total, color: 'text-primary', bg: 'bg-primary/10', icon: Users },
                    { label: 'Kasus Kritis (Red)', val: stats.red, color: 'text-rose-600', bg: 'bg-rose-600', text: 'text-white', icon: AlertTriangle, shadow: 'shadow-rose-200' },
                    { label: 'Kasus Mendesak', val: stats.yellow, color: 'text-amber-500', bg: 'bg-amber-400', text: 'text-white', icon: TrendingUp, shadow: 'shadow-amber-100' },
                    { label: 'Total Rujukan', val: stats.referrals, color: 'text-blue-600', bg: 'bg-blue-600', text: 'text-white', icon: ArrowUpRight, shadow: 'shadow-blue-100' }
                ].map((kpi, i) => (
                    <div key={i} className={`${kpi.text ? kpi.bg : 'bg-white'} p-6 rounded-[32px] border ${kpi.text ? 'border-transparent' : 'border-slate-100'} shadow-sm ${kpi.shadow || ''} flex items-center justify-between group hover:scale-[1.02] transition-all`}>
                        <div>
                            <p className={`text-[10px] font-bold ${kpi.text ? 'text-white/70' : 'text-slate-400'} uppercase tracking-widest mb-1`}>{kpi.label}</p>
                            <h3 className={`text-3xl font-black ${kpi.text ? 'text-white' : 'text-slate-800'}`}>{kpi.val}</h3>
                        </div>
                        <div className={`w-14 h-14 rounded-2xl ${kpi.text ? 'bg-white/20' : kpi.bg} ${kpi.text ? 'text-white' : kpi.color} flex items-center justify-center`}>
                            <kpi.icon size={28}/>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* 1. TOP 10 DISEASES (BAR CHART) */}
                <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-xl">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-xl font-black text-slate-800">10 Penyakit Terbanyak</h3>
                            <p className="text-slate-400 text-xs">Berdasarkan data diagnosis ICD-10 pasien berobat.</p>
                        </div>
                        <div className="p-3 bg-primary/5 text-primary rounded-2xl"><TrendingUp size={20}/></div>
                    </div>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.topDiseases} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                <XAxis type="number" hide />
                                <YAxis 
                                    dataKey="name" 
                                    type="category" 
                                    width={150} 
                                    fontSize={10} 
                                    fontWeight="bold" 
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip 
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="count" radius={[0, 10, 10, 0]}>
                                    {stats.topDiseases.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={index < 3 ? '#0d9488' : '#94a3b8'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. VISIT TRENDS (LINE/AREA CHART) */}
                <div className="bg-slate-900 rounded-[40px] p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-5 text-white"><TrendingUp size={150}/></div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-xl font-black text-white">Tren Kunjungan Pasien</h3>
                                <p className="text-slate-400 text-xs">Fluktuasi jumlah pasien per tanggal kunjungan.</p>
                            </div>
                        </div>
                        <div className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.visitTrend}>
                                    <defs>
                                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="date" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '16px', color: '#fff' }}
                                        itemStyle={{ color: '#0d9488', fontWeight: 'bold' }}
                                    />
                                    <Area type="monotone" dataKey="count" stroke="#0d9488" strokeWidth={4} fillOpacity={1} fill="url(#colorCount)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* 3. TRIAGE & REFERRAL DISTRIBUTION (PIE CHARTS) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:col-span-2">
                    {/* Triage Pie */}
                    <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-xl flex flex-col items-center">
                        <h3 className="text-lg font-black text-slate-800 mb-6 self-start">Prioritas Triage</h3>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.triageData}
                                        innerRadius={60} outerRadius={80}
                                        paddingAngle={5} dataKey="value"
                                        stroke="none"
                                    >
                                        {stats.triageData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="grid grid-cols-3 gap-2 w-full mt-4">
                            {stats.triageData.map(t => (
                                <div key={t.name} className="text-center p-3 rounded-2xl bg-slate-50 border border-slate-100">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase">{t.name}</p>
                                    <p className="text-lg font-black" style={{color: t.color}}>{t.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Referral Pie */}
                    <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-xl flex flex-col items-center">
                        <h3 className="text-lg font-black text-slate-800 mb-6 self-start">Outcome Pasien (Rujukan)</h3>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.referralData}
                                        innerRadius={0} outerRadius={80}
                                        dataKey="value"
                                        stroke="#fff" strokeWidth={2}
                                    >
                                        {stats.referralData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="grid grid-cols-2 gap-4 w-full mt-4">
                            {stats.referralData.map(r => (
                                <div key={r.name} className="text-center p-3 rounded-2xl bg-slate-50 border border-slate-100">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase">{r.name}</p>
                                    <p className="text-lg font-black" style={{color: r.color}}>{r.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Simulated Live Feed Section */}
            <div className="bg-slate-900 rounded-[40px] p-8 shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-xl font-black text-white">Log Intelijen Terbaru</h3>
                        <p className="text-slate-400 text-xs">Aktivitas pendaftaran dan pemeriksaan medis terkini.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></div>
                        <span className="text-white text-[10px] font-bold tracking-widest uppercase">Live War Room</span>
                    </div>
                </div>
                <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-4">
                    {patients.slice(0, 10).map((p, i) => (
                        <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                                    p.triage === 'Red' ? 'bg-rose-500 text-white' : 
                                    p.triage === 'Yellow' ? 'bg-amber-400 text-white' : 'bg-emerald-500 text-white'
                                }`}>
                                    {p.triage.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-white font-bold text-sm uppercase">{p.name}</p>
                                    <p className="text-slate-500 text-[10px] font-mono tracking-wider">{p.mrn} • {p.visitDate}</p>
                                </div>
                            </div>
                            <div className="text-right hidden sm:block">
                                <p className="text-slate-400 text-[10px] font-bold uppercase mb-1">Status Diagnosis</p>
                                <p className="text-primary text-xs font-black truncate max-w-[200px]">{p.diagnosisName || 'Pengecekan Rutin'}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DashboardSummary;
