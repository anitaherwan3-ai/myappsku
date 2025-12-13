import React, { useState } from 'react';
import { useApp } from '../context';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { Filter, RotateCcw, Users, Activity, Divide, ClipboardList, Building2, Calendar } from 'lucide-react';

const DashboardSummary = () => {
    const { patients, activities, officers } = useApp();

    // Date Filter State
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Filter Logic
    const filteredPatients = patients.filter(p => {
        if (!startDate && !endDate) return true;
        const pDate = new Date(p.visitDate);
        const start = startDate ? new Date(startDate) : new Date('1970-01-01');
        const end = endDate ? new Date(endDate) : new Date('2099-12-31');
        return pDate >= start && pDate <= end;
    });

    const filteredActivities = activities.filter(a => {
        if (!startDate && !endDate) return true;
        const aStart = new Date(a.startDate);
        const filterStart = startDate ? new Date(startDate) : new Date('1970-01-01');
        const filterEnd = endDate ? new Date(endDate) : new Date('2099-12-31');
        return aStart >= filterStart && aStart <= filterEnd;
    });

    // 1. Stats Cards with Gradients
    const stats = [
        { label: 'Total Pasien', value: filteredPatients.length, bg: 'bg-gradient-to-br from-blue-500 to-blue-600', icon: Users },
        { label: 'Total Kegiatan', value: filteredActivities.length, bg: 'bg-gradient-to-br from-teal-500 to-emerald-600', icon: Calendar },
        { label: 'Rujukan RS', value: filteredPatients.filter(p => p.referralStatus === 'Rujuk').length, bg: 'bg-gradient-to-br from-rose-500 to-pink-600', icon: Building2 },
        { label: 'Petugas Aktif', value: officers.length, bg: 'bg-gradient-to-br from-violet-500 to-purple-600', icon: ClipboardList },
    ];

    // 2. Data Processing for Charts
    const categoryCount = {
        Berobat: filteredPatients.filter(p => p.category === 'Berobat').length,
        MCU: filteredPatients.filter(p => p.category === 'MCU').length
    };
    const categoryData = [
        { name: 'Berobat', value: categoryCount.Berobat },
        { name: 'MCU', value: categoryCount.MCU },
    ].filter(d => d.value > 0);

    const COLORS = ['#0d9488', '#f59e0b']; 

    const referralCount = {
        'Tidak Rujuk': filteredPatients.filter(p => p.referralStatus === 'Tidak Rujuk').length,
        'Rujuk': filteredPatients.filter(p => p.referralStatus === 'Rujuk').length
    };
    const referralData = [
        { name: 'Tidak Rujuk', value: referralCount['Tidak Rujuk'] },
        { name: 'Rujuk', value: referralCount['Rujuk'] },
    ].filter(d => d.value > 0);

    const REF_COLORS = ['#3b82f6', '#ef4444'];

    // Top Diseases
    const diseaseCounts: Record<string, number> = {};
    filteredPatients.forEach(p => {
        if (p.category === 'Berobat' && p.diagnosisName) {
            diseaseCounts[p.diagnosisName] = (diseaseCounts[p.diagnosisName] || 0) + 1;
        }
    });
    const diseaseData = Object.entries(diseaseCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

    // Average Patients
    const totalP = filteredPatients.length;
    const totalA = filteredActivities.length;
    const avgPatients = totalA > 0 ? (totalP / totalA).toFixed(1) : '0';

    // Custom Label for Pie Chart
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);
        if (isNaN(percent) || percent === 0) return null;
        return (
          <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12} fontWeight="bold">
            {`${(percent * 100).toFixed(0)}%`}
          </text>
        );
    };

    // Fixed Tooltip Logic (No Division by zero or complex calc)
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-3 border border-gray-200 shadow-xl rounded-lg z-50">
                    <p className="font-bold text-gray-800 text-sm">{data.name}</p>
                    <p className="text-sm text-gray-600">
                        Jumlah: <span className="font-bold text-primary">{data.value}</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-8 font-sans pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Dashboard Ringkasan</h2>
                
                <div className="bg-white p-3 rounded-lg shadow-md border border-gray-200 flex flex-wrap items-center gap-3 text-sm">
                    <div className="flex items-center gap-2 px-2 text-gray-700 font-bold border-r border-gray-200 pr-4">
                        <Filter size={18} className="text-primary"/> Filter:
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-gray-500 text-xs uppercase font-bold">Mulai</span>
                        <input 
                            type="date" 
                            className="border border-gray-300 rounded-md px-2 py-1.5 text-gray-900 bg-white focus:ring-2 focus:ring-primary outline-none"
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                        />
                    </div>
                    <span className="text-gray-400 font-bold">-</span>
                    <div className="flex items-center gap-2">
                        <span className="text-gray-500 text-xs uppercase font-bold">Sampai</span>
                        <input 
                            type="date" 
                            className="border border-gray-300 rounded-md px-2 py-1.5 text-gray-900 bg-white focus:ring-2 focus:ring-primary outline-none"
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                        />
                    </div>
                    {(startDate || endDate) && (
                        <button 
                            onClick={() => { setStartDate(''); setEndDate(''); }}
                            className="ml-2 text-xs text-red-600 font-bold hover:text-red-800 bg-red-50 px-3 py-1.5 rounded-lg border border-red-200 flex items-center gap-1"
                        >
                            <RotateCcw size={12}/> Reset
                        </button>
                    )}
                </div>
            </div>

            {/* Gradient Infographics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <div key={idx} className={`${stat.bg} p-6 rounded-2xl shadow-lg text-white flex items-center justify-between transition hover:-translate-y-1 hover:shadow-xl relative overflow-hidden group`}>
                        <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4 group-hover:scale-110 transition-transform duration-500">
                            {React.createElement(stat.icon || Activity, { size: 120 })}
                        </div>
                        <div className="relative z-10">
                            <p className="text-blue-100 text-sm font-bold uppercase tracking-wider mb-1">{stat.label}</p>
                            <h3 className="text-4xl font-extrabold">{stat.value}</h3>
                        </div>
                        <div className="bg-white/20 p-3 rounded-xl relative z-10 backdrop-blur-sm">
                            {React.createElement(stat.icon || Activity, { size: 24 })}
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 1. Pie Chart: Kategori Pasien */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 min-h-[400px] flex flex-col">
                    <h3 className="font-bold text-lg mb-4 text-gray-700 border-b pb-2">Kategori Pasien</h3>
                    <div className="flex-1 w-full h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie 
                                    data={categoryData} 
                                    cx="50%" 
                                    cy="50%"
                                    innerRadius={60} 
                                    outerRadius={100} 
                                    paddingAngle={5} 
                                    dataKey="value"
                                    labelLine={false}
                                    label={renderCustomizedLabel}
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip content={<CustomTooltip />} />
                                <Legend verticalAlign="bottom" height={36} iconType="circle"/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. Pie Chart: Status Rujukan */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 min-h-[400px] flex flex-col">
                    <h3 className="font-bold text-lg mb-4 text-gray-700 border-b pb-2">Status Rujukan</h3>
                    <div className="flex-1 w-full h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie 
                                    data={referralData} 
                                    cx="50%" 
                                    cy="50%"
                                    innerRadius={60} 
                                    outerRadius={100} 
                                    paddingAngle={5} 
                                    dataKey="value"
                                    labelLine={false}
                                    label={renderCustomizedLabel}
                                >
                                    {referralData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={REF_COLORS[index % REF_COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip content={<CustomTooltip />} />
                                <Legend verticalAlign="bottom" height={36} iconType="circle"/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 3. Top 5 Diseases */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <h3 className="font-bold text-lg mb-4 text-gray-700 border-b pb-2">5 Penyakit Terbanyak</h3>
                    <div className="space-y-4">
                        {diseaseData.length > 0 ? diseaseData.map((d, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <span className="text-gray-700 font-medium flex items-center gap-2">
                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${i === 0 ? 'bg-yellow-500' : 'bg-gray-400'}`}>{i+1}</span>
                                    {d.name}
                                </span>
                                <div className="flex items-center gap-2">
                                    <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary" style={{ width: `${(d.value / diseaseData[0].value) * 100}%` }}></div>
                                    </div>
                                    <span className="text-sm font-bold text-gray-800">{d.value}</span>
                                </div>
                            </div>
                        )) : <p className="text-gray-400 italic text-center py-4">Belum ada data penyakit.</p>}
                    </div>
                </div>

                {/* 4. Average Infographic */}
                <div className="bg-gradient-to-br from-indigo-600 to-purple-800 p-8 rounded-xl shadow-lg text-white flex flex-col justify-center items-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none flex justify-center items-center">
                        <Activity size={200} className="animate-pulse" />
                    </div>
                    
                    <h3 className="text-xl font-bold mb-6 text-indigo-100 uppercase tracking-widest z-10 flex items-center gap-2 border-b border-indigo-400 pb-2">
                        <Divide size={20} /> Statistik Layanan
                    </h3>
                    
                    <div className="z-10 text-center">
                        <span className="text-7xl font-extrabold tracking-tighter drop-shadow-2xl">{avgPatients}</span>
                        <p className="text-lg font-medium text-indigo-100 mt-2">Rata-rata Pasien / Kegiatan</p>
                    </div>

                    <div className="mt-8 grid grid-cols-2 gap-8 w-full max-w-xs z-10 border-t border-white/20 pt-6">
                        <div className="text-center">
                            <span className="block text-2xl font-bold">{totalP}</span>
                            <span className="text-xs uppercase text-indigo-200 font-bold">Total Pasien</span>
                        </div>
                        <div className="text-center">
                            <span className="block text-2xl font-bold">{totalA}</span>
                            <span className="text-xs uppercase text-indigo-200 font-bold">Total Kegiatan</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardSummary;