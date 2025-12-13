import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context';
import { ArrowLeft, Calendar, User, Share2 } from 'lucide-react';

const NewsDetail = () => {
  const { id } = useParams();
  const { news } = useApp();
  const navigate = useNavigate();

  const item = news.find(n => n.id === id);

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Berita Tidak Ditemukan</h2>
          <button onClick={() => navigate('/')} className="mt-4 text-primary hover:underline">Kembali ke Beranda</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800">
      {/* Navbar Simple */}
      <nav className="bg-white border-b border-gray-100 py-4 sticky top-0 z-50">
        <div className="container mx-auto px-6 flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-100 rounded-full transition">
            <ArrowLeft size={24} className="text-gray-700" />
          </button>
          <h1 className="font-bold text-lg text-gray-900 truncate">PCC Sumsel News</h1>
        </div>
      </nav>

      <article className="container mx-auto px-6 max-w-4xl py-10">
        <div className="mb-8">
            <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase tracking-wider mb-4">
                Berita Terbaru
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight text-gray-900 mb-6">
                {item.title}
            </h1>
            
            <div className="flex items-center gap-6 text-sm text-gray-500 border-b border-gray-100 pb-8">
                <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>{new Date(item.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-2">
                    <User size={16} />
                    <span>Admin PCC</span>
                </div>
            </div>
        </div>

        <div className="w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-2xl mb-10">
            <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
        </div>

        <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
            {item.content.split('\n').map((paragraph, idx) => (
                <p key={idx} className="mb-6 text-lg">{paragraph}</p>
            ))}
        </div>

        <div className="mt-16 pt-8 border-t border-gray-200 flex justify-between items-center">
            <button onClick={() => navigate('/')} className="font-bold text-gray-600 hover:text-primary transition flex items-center gap-2">
                <ArrowLeft size={20}/> Kembali ke Beranda
            </button>
            <button className="flex items-center gap-2 text-gray-500 hover:text-primary transition">
                <Share2 size={20}/> <span className="hidden md:inline">Bagikan Berita</span>
            </button>
        </div>
      </article>

      <footer className="bg-slate-50 border-t border-gray-200 py-10 mt-10">
         <div className="container mx-auto px-6 text-center">
            <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} PCC Sumsel Management System</p>
         </div>
      </footer>
    </div>
  );
};

export default NewsDetail;