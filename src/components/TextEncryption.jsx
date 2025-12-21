// src/TextEncryption.jsx
import React, { useState } from "react";
import { encryptTextToHex, decryptHexToText, SBOX_OPTIONS, getSboxById } from "../cryptoAlgorithm/aesCustom.js";
import { runSboxAnalysis } from "../services/sboxService.js";

const TextEncryption = () => {
  const defaultKeyHex = "2b7e151628aed2a6abf7158809cf4f3c";
  const [keyHex, setKeyHex] = useState(defaultKeyHex);
  const [plaintext, setPlaintext] = useState("");
  const [cipherHex, setCipherHex] = useState("");
  const [decrypted, setDecrypted] = useState("");
  const [selectedSboxId, setSelectedSboxId] = useState(44);
  
  // State untuk analisis S-Box
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleEncrypt = () => {
    try {
      const ct = encryptTextToHex(plaintext, keyHex, selectedSboxId);
      setCipherHex(ct);
      setDecrypted("");
    } catch (e) {
      alert("Error encrypting: " + e.message);
    }
  };

  const handleDecrypt = () => {
    try {
      const pt = decryptHexToText(cipherHex, keyHex, selectedSboxId);
      setDecrypted(pt);
    } catch (e) {
      alert("Error decrypting: " + e.message);
    }
  };

  const handleAnalyzeSbox = (id, name) => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const sboxData = getSboxById(id);
      const results = runSboxAnalysis(sboxData);
      setAnalysisResult({ ...results, name });
      setIsAnalyzing(false);
    }, 100);
  };

  return (
    <>
      {/* S-Box Selector Section */}
      <div className="bg-white/5 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-white/10 mb-8">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h16M4 17h16" />
          </svg>
          Select S-Box for Encryption/Decryption
        </h2>
        
        <div className="flex flex-wrap gap-3">
          {SBOX_OPTIONS.map((option) => (
            <div key={option.id} className="flex flex-col gap-2">
              <button
                onClick={() => setSelectedSboxId(option.id)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 active:scale-95 ${
                  selectedSboxId === option.id
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                    : 'bg-slate-700/50 text-gray-300 hover:bg-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  {selectedSboxId === option.id && (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                  {option.name}
                </div>
              </button>
            </div>
          ))}
        </div>

        {/* Tombol Analisis berdasarkan S-Box yang dipilih saat ini */}
        <div className="flex justify-center w-full mt-4"> 
            <button 
              onClick={() => {
                 const currentOption = SBOX_OPTIONS.find(o => o.id === selectedSboxId);
                 if(currentOption) handleAnalyzeSbox(currentOption.id, currentOption.name);
              }}
              disabled={isAnalyzing}
              className="px-4 py-2 bg-cyan-950/50 border border-cyan-500/30 rounded-lg 
                        text-[10px] uppercase tracking-wider font-bold text-cyan-400 
                        hover:bg-cyan-900/50 hover:text-cyan-300 hover:border-cyan-400/50
                        transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? "Analyzing..." : `Analyze S-Box ${selectedSboxId} Result`}
            </button>
        </div>

        {/* Panel Hasil Analisis */}
        {analysisResult && (
          <div className="mt-6 p-4 bg-slate-800/80 border border-cyan-500/30 rounded-xl animate-in fade-in zoom-in duration-500">
            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">📊</span>
                <h3 className="text-cyan-400 text-sm font-bold uppercase tracking-widest">
                  Cryptographic Metrics: {analysisResult.name}
                </h3>
              </div>
              <button 
                onClick={() => setAnalysisResult(null)} 
                className="text-gray-500 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Grid Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"> 
                {/* 1. Non-Linearity */}
                <div className="bg-slate-900/60 p-3 rounded-lg border border-purple-500/20 shadow-inner">
                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Non-Linearity (Min)</p>
                    <p className="text-2xl font-mono text-purple-400">{analysisResult.nonLinearity}</p>
                </div>

                {/* 2. SAC Score */}
                <div className="bg-slate-900/60 p-3 rounded-lg border border-green-500/20 shadow-inner">
                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">SAC Score (Avg)</p>
                    <p className="text-2xl font-mono text-green-400">{(analysisResult.sac || 0).toFixed(4)}</p>
                </div>

                {/* 3. BIC-NL */}
                <div className="bg-slate-900/60 p-3 rounded-lg border border-pink-500/20 shadow-inner">
                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">BIC-NL (Avg)</p>
                    <p className="text-2xl font-mono text-pink-400">{(analysisResult.bicNl || 0).toFixed(2)}</p>
                </div>

                {/* 4. BIC-SAC */}
                <div className="bg-slate-900/60 p-3 rounded-lg border border-indigo-500/20 shadow-inner">
                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">BIC-SAC (Avg)</p>
                    <p className="text-2xl font-mono text-indigo-400">{(analysisResult.bicSac || 0).toFixed(4)}</p>
                </div>

                {/* 5. LAP */}
                <div className="bg-slate-900/60 p-3 rounded-lg border border-orange-500/20 shadow-inner">
                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">LAP (Max Bias)</p>
                    <p className="text-2xl font-mono text-orange-400">{(analysisResult.lap || 0).toFixed(4)}</p>
                </div>

                {/* 6. DAP */}
                <div className="bg-slate-900/60 p-3 rounded-lg border border-yellow-500/20 shadow-inner">
                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">DAP (Max Prob)</p>
                    <p className="text-2xl font-mono text-yellow-400">{(analysisResult.dap || 0).toFixed(4)}</p>
                </div>

                {/* 7. Algebraic Degree */}
                <div className="bg-slate-900/60 p-3 rounded-lg border border-blue-500/20 shadow-inner">
                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Alg. Degree (AD)</p>
                    <p className="text-2xl font-mono text-blue-400">{analysisResult.ad || 0}</p>
                </div>

                {/* 8. Transparency Order */}
                <div className="bg-slate-900/60 p-3 rounded-lg border border-cyan-500/20 shadow-inner">
                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Trans. Order (TO)</p>
                    <p className="text-2xl font-mono text-cyan-400">{(analysisResult.to || 0).toFixed(4)}</p>
                </div>

                 {/* 9. Correlation Immunity (CI) */}
                 <div className="bg-slate-900/60 p-3 rounded-lg border border-purple-500/20 shadow-inner">
                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Corr. Immunity (CI)</p>
                    <p className="text-2xl font-mono text-cyan-400">{(analysisResult.ci || 0)}</p>
                </div>

                {/* 10. Differential Uniformity (DU) */}
                <div className="bg-slate-900/60 p-3 rounded-lg border border-red-500/20 shadow-inner">
                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Diff. Uniformity (DU)</p>
                    <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-mono text-orange-400">{(analysisResult.du || 0)}</p>
                        <span className="text-[10px] text-gray-500">
                            {analysisResult.du <= 4 ? "(Excellent)" : analysisResult.du <= 8 ? "(Good)" : "(Weak)"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Footer Info */}
            <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center text-[10px] text-gray-500 italic">
                <p>* Calculations based on full 8x8 S-Box analysis</p>
                <p className="uppercase tracking-widest text-cyan-500/50 font-bold">Secure S-Box Analyzer v2.0</p>
            </div>
        </div>
        )}
        
        <div className="mt-4 p-3 bg-slate-800/50 rounded-lg border border-purple-500/20">
          <p className="text-sm text-gray-300">
            <span className="font-semibold text-purple-300">Currently selected:</span> S-Box {selectedSboxId}
          </p>
        </div>
      </div>

      {/* S-Box Tables Overview */}
      <div className="bg-white/5 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-white/10 mb-8">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
           <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          S-Box Tables Overview
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {SBOX_OPTIONS.map((option) => {
            const sbox = getSboxById(option.id);
            const isSelected = selectedSboxId === option.id;
            
            return (
              <div key={option.id} className={`bg-slate-800/50 rounded-xl p-4 border transition-all ${isSelected ? 'border-purple-500 shadow-lg shadow-purple-500/20' : 'border-slate-700/50'}`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    {option.name}
                  </h3>
                  {isSelected && <span className="px-2 py-1 text-xs font-semibold bg-purple-500/20 text-purple-300 rounded">Active</span>}
                </div>

                <div className="overflow-x-auto">
                  <div className="inline-block min-w-full">
                     {/* Header Hex 0-F */}
                    <div className="grid grid-cols-17 gap-0.5 mb-1">
                      <div className="text-xs font-mono text-gray-500"></div>
                      {[...Array(16)].map((_, i) => (
                        <div key={i} className="text-xs font-mono text-gray-400 text-center">{i.toString(16).toUpperCase()}</div>
                      ))}
                    </div>
                    {/* Rows */}
                    {[...Array(16)].map((_, rowIndex) => (
                      <div key={rowIndex} className="grid grid-cols-17 gap-0.5 mb-0.5">
                        <div className="text-xs font-mono text-gray-400 text-center flex items-center justify-center">{rowIndex.toString(16).toUpperCase()}</div>
                        {sbox.slice(rowIndex * 16, (rowIndex + 1) * 16).map((value, colIndex) => (
                          <div key={colIndex} className={`text-xs font-mono text-center py-1 rounded ${isSelected ? 'bg-purple-500/10 text-purple-300' : 'bg-slate-700/30 text-gray-400'}`}>
                            {value.toString(16).padStart(2, '0').toUpperCase()}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Card - Text Encryption Form */}
      <div className="bg-white/5 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/10">
        <div className="mb-6">
          <label className="block text-sm text-purple-300 mb-2 font-medium">Encryption Key (Hex)</label>
          <input
            className="w-full p-3 rounded-lg bg-slate-800/50 text-white border border-purple-500/30 font-mono text-sm"
            value={keyHex}
            onChange={(e) => setKeyHex(e.target.value.trim())}
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm text-blue-300 mb-2 font-medium">Plaintext</label>
          <textarea
            className="w-full p-3 rounded-lg bg-slate-800/50 text-white border border-green-500/30"
            rows={4}
            value={plaintext}
            onChange={(e) => setPlaintext(e.target.value)}
          />
        </div>

        <div className="flex gap-4 mb-6">
          <button onClick={handleEncrypt} className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-colors duration-300 text-white font-bold shadow-lg">
            Encrypt
          </button>
          <button onClick={handleDecrypt} className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition-colors duration-300 text-white font-bold shadow-lg">
            Decrypt
          </button>
        </div>

        <div className="mb-6">
          <label className="block text-sm text-pink-300 mb-2 font-medium">Ciphertext (Hex)</label>
          <textarea
            className="w-full p-3 rounded-lg bg-slate-800/50 text-white border border-pink-500/30 font-mono text-sm"
            rows={4}
            value={cipherHex}
            onChange={(e) => setCipherHex(e.target.value.trim())}
          />
        </div>

        <div>
           <label className="block text-sm text-blue-300 mb-2 font-medium">Decrypted Plaintext</label>
           <textarea
             className="w-full p-3 rounded-lg bg-slate-800/50 text-white border border-blue-500/30"
             rows={2}
             value={decrypted}
             readOnly
           />
        </div>
      </div>
      
      {/* CSS untuk Grid Table S-Box */}
      <style jsx>{`
        .grid-cols-17 {
          grid-template-columns: repeat(17, minmax(0, 1fr));
        }
      `}</style>
    </>
  );
};

export default TextEncryption;