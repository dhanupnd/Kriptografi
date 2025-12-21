// src/App.jsx
import React, { useState } from "react";
import TextEncryption from "./components/TextEncryption.jsx";
import ImageCrypto from "./components/ImageEncryption.jsx";       // Komponen yang sudah ada
import SboxGenerator from "./components/SboxGenerator.jsx";       // Komponen yang sudah ada

export default function App() {
  const [activeTab, setActiveTab] = useState('generator');

  // Helper function untuk class tombol tab agar kode lebih rapi
  const getTabButtonClass = (tabName) => {
    const isActive = activeTab === tabName;
    return `flex-1 px-6 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
      isActive
        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
        : 'bg-transparent text-gray-400 hover:text-white'
    }`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6 relative overflow-hidden">
    
      
      {/* --- Background Animations (Tetap di sini) --- */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>
      
      <div className="absolute inset-0 opacity-5 font-mono text-xs pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="absolute animate-rain" style={{ left: `${i * 5}%`, animationDelay: `${i * 0.3}s`, animationDuration: `${10 + i}s` }}>
            {[...Array(30)].map((_, j) => <div key={j}>{Math.random() > 0.5 ? '1' : '0'}</div>)}
          </div>
        ))}
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* --- Header --- */}
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-purple-500/20 rounded-full mb-4 backdrop-blur-sm">
            <svg className="w-12 h-12 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2 pb-3">
            AES-128 Cryptography Tool
          </h1>
          <p className="text-gray-400">Custom S-Box Implementation • Secure Encryption</p>
        </div>

        {/* --- Tab Switcher --- */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl shadow-2xl p-2 border border-white/10 mb-8">
          <div className="flex gap-2">
            <button onClick={() => setActiveTab('generator')} className={getTabButtonClass('generator')}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              S-Box Generator
            </button>

            <button onClick={() => setActiveTab('text')} className={getTabButtonClass('text')}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Text Encryption
            </button>

            <button onClick={() => setActiveTab('image')} className={getTabButtonClass('image')}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Image Encryption
            </button>
          </div>
        </div>

        {/* --- Content Rendering --- */}
        <div className="animate-in fade-in duration-300">
          {activeTab === 'generator' && <SboxGenerator />}
          {activeTab === 'text' && <TextEncryption />}
          {activeTab === 'image' && <ImageCrypto />}
        </div>
      </div>

      {/* Global CSS for Background Animations */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        @keyframes rain {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        .animate-rain { animation: rain linear infinite; }
      `}</style>
    </div>
  );
}