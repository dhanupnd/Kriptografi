// src/SboxGenerator.jsx
import React, { useState } from "react";
import {
  constructModifiedSbox,
  testBijective,
  testBalance,
  calculateDDT,
  analyzeDDT,
  validateAffineMatrix,
  generateSboxCSV,
  downloadCSV
} from "../cryptoAlgorithm/sboxGenerator.js";

export default function SboxGenerator() {
  // Default Affine Matrix (dari contoh Anda)
  const defaultMatrix = [
    [0, 1, 0, 1, 0, 1, 1, 1],
    [1, 0, 1, 0, 1, 0, 1, 1],
    [1, 1, 0, 1, 0, 1, 0, 1],
    [1, 1, 1, 0, 1, 0, 1, 0],
    [0, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 0],
    [0, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 0, 1, 1, 1, 0]
  ];

  const [affineMatrix, setAffineMatrix] = useState(defaultMatrix);
  const [constVector, setConstVector] = useState("0x63");
  const [generatedSbox, setGeneratedSbox] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [validationError, setValidationError] = useState("");

  // Handle perubahan nilai matrix
  const handleMatrixChange = (row, col, value) => {
    const newMatrix = affineMatrix.map(r => [...r]);
    const numValue = parseInt(value);
    
    if (numValue === 0 || numValue === 1) {
      newMatrix[row][col] = numValue;
      setAffineMatrix(newMatrix);
      setValidationError("");
    }
  };

  // Reset matrix ke default
  const handleResetMatrix = () => {
    setAffineMatrix(defaultMatrix);
    setGeneratedSbox(null);
    setAnalysisResults(null);
    setValidationError("");
  };

  // Set matrix menjadi identity matrix
  const handleSetIdentity = () => {
    const identityMatrix = Array(8).fill(null).map((_, i) =>
      Array(8).fill(null).map((_, j) => (i === j ? 1 : 0))
    );
    setAffineMatrix(identityMatrix);
  };

  // Generate S-Box
  const handleGenerateSbox = () => {
    setIsGenerating(true);
    setValidationError("");

    // Validasi matrix
    const validation = validateAffineMatrix(affineMatrix);
    if (!validation.valid) {
      setValidationError(validation.message);
      setIsGenerating(false);
      return;
    }

    // Parse constant vector
    let constB = 0x63;
    try {
      constB = parseInt(constVector, 16);
      if (isNaN(constB) || constB < 0 || constB > 255) {
        throw new Error("Invalid constant");
      }
    } catch (e) {
      setValidationError("Constant vector harus berupa nilai hex 0x00 - 0xFF");
      setIsGenerating(false);
      return;
    }

    // Simulasi delay untuk UX
    setTimeout(() => {
      try {
        // Generate S-Box
        const sbox = constructModifiedSbox(affineMatrix, constB);

        // Test Bijective
        const bijectiveResult = testBijective(sbox);

        // Test Balance
        const balanceResult = testBalance(sbox);

        // Calculate DDT
        const ddtTable = calculateDDT(sbox);
        const ddtAnalysis = analyzeDDT(ddtTable);

        // Simpan hasil
        setGeneratedSbox(sbox);
        setAnalysisResults({
          bijective: bijectiveResult,
          balance: balanceResult,
          ddt: {
            ...ddtAnalysis,
            table: ddtTable
          }
        });

        setIsGenerating(false);
      } catch (error) {
        setValidationError("Error saat generate S-Box: " + error.message);
        setIsGenerating(false);
      }
    }, 500);
  };

  // Download hasil sebagai CSV/Excel
  const handleDownloadExcel = () => {
    if (!generatedSbox || !analysisResults) {
      alert("Belum ada S-Box yang di-generate!");
      return;
    }

    const csvContent = generateSboxCSV(generatedSbox, analysisResults);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    downloadCSV(csvContent, `sbox_analysis_${timestamp}.csv`);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-white/10">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <svg className="w-7 h-7 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          S-Box Generator from Affine Matrix
        </h2>
        <p className="text-gray-400 text-sm">
          Generate custom S-Box using Affine Transformation in GF(2⁸)
        </p>
      </div>

      {/* Affine Matrix Input */}
      <div className="bg-white/5 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h16M4 17h16" />
            </svg>
            Affine Matrix (8×8)
          </h3>
          <div className="flex gap-2">
            <button
              onClick={handleSetIdentity}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-all text-sm font-semibold"
            >
              Set Identity
            </button>
            <button
              onClick={handleResetMatrix}
              className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 transition-all text-sm font-semibold"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Matrix Grid */}
        <div className="bg-slate-800/50 rounded-lg p-4 overflow-x-auto">
          <div className="inline-block min-w-full">
            {affineMatrix.map((row, i) => (
              <div key={i} className="flex gap-2 mb-2">
                {row.map((val, j) => (
                  <input
                    key={j}
                    type="number"
                    min="0"
                    max="1"
                    value={val}
                    onChange={(e) => handleMatrixChange(i, j, e.target.value)}
                    className="w-12 h-12 text-center bg-slate-700 text-white rounded border border-purple-500/30 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition font-mono text-sm"
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Constant Vector Input */}
        <div className="mt-4">
          <label className="block">
            <div className="text-sm text-purple-300 mb-2 font-medium">
              Constant Vector b (Hexadecimal)
            </div>
            <input
              type="text"
              value={constVector}
              onChange={(e) => setConstVector(e.target.value)}
              placeholder="0x63"
              className="w-full p-3 rounded-lg bg-slate-800/50 text-white border border-purple-500/30 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition font-mono text-sm"
            />
          </label>
        </div>

        {/* Validation Error */}
        {validationError && (
          <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
            ⚠️ {validationError}
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerateSbox}
          disabled={isGenerating}
          className="w-full mt-4 px-6 py-3 rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 transition-all transform hover:scale-102 active:scale-95 font-semibold shadow-lg shadow-yellow-500/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating S-Box...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Generate S-Box
            </>
          )}
        </button>
      </div>

      {/* Results Section */}
      {generatedSbox && analysisResults && (
        <>
          {/* Analysis Results */}
          <div className="bg-white/5 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                Cryptographic Analysis
              </h3>
              <button
                onClick={handleDownloadExcel}
                className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 transition-all text-sm font-semibold flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Excel/CSV
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Bijective Test */}
              <div className={`p-4 rounded-lg border ${
                analysisResults.bijective.isBijective 
                  ? 'bg-green-500/10 border-green-500/50' 
                  : 'bg-red-500/10 border-red-500/50'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {analysisResults.bijective.isBijective ? (
                    <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span className="font-semibold text-white">Bijective Test</span>
                </div>
                <p className="text-sm text-gray-300">
                  Unique Outputs: {analysisResults.bijective.uniqueCount}/256
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {analysisResults.bijective.isBijective ? 'All outputs are unique ✓' : 'Some outputs repeat ✗'}
                </p>
              </div>

              {/* Balance Test */}
              <div className={`p-4 rounded-lg border ${
                analysisResults.balance.isBalanced 
                  ? 'bg-green-500/10 border-green-500/50' 
                  : 'bg-red-500/10 border-red-500/50'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {analysisResults.balance.isBalanced ? (
                    <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span className="font-semibold text-white">Balance Test</span>
                </div>
                <p className="text-sm text-gray-300">
                  All bit functions: {analysisResults.balance.isBalanced ? '128:128' : 'Unbalanced'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {analysisResults.balance.isBalanced ? 'Perfect balance ✓' : 'Some bits unbalanced ✗'}
                </p>
              </div>

              {/* Differential Uniformity */}
              <div className={`p-4 rounded-lg border ${
                analysisResults.ddt.maxDU <= 4 
                  ? 'bg-green-500/10 border-green-500/50' 
                  : 'bg-yellow-500/10 border-yellow-500/50'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {analysisResults.ddt.maxDU <= 4 ? (
                    <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span className="font-semibold text-white">Differential Uniformity</span>
                </div>
                <p className="text-sm text-gray-300">
                  Max DU: {analysisResults.ddt.maxDU}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {analysisResults.ddt.maxDU <= 4 ? 'Excellent resistance ✓' : 'Moderate resistance ⚠'}
                </p>
              </div>
            </div>

            {/* Balance Details */}
            <div className="mt-4 p-4 bg-slate-800/50 rounded-lg">
              <h4 className="text-sm font-semibold text-white mb-2">Balance Details (per bit function):</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                {Object.keys(analysisResults.balance.balanceResults).map((key) => {
                  const result = analysisResults.balance.balanceResults[key];
                  const isBalanced = result.count0 === 128 && result.count1 === 128;
                  return (
                    <div key={key} className={`p-2 rounded ${isBalanced ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                      <span className="font-mono text-gray-300">{key}: </span>
                      <span className={isBalanced ? 'text-green-400' : 'text-red-400'}>
                        {result.count0}:{result.count1}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Final Validity */}
            <div className="mt-4 p-4 bg-slate-800/50 rounded-lg border-l-4 border-purple-500">
              <h4 className="text-sm font-semibold text-white mb-1">Final Verdict:</h4>
              <p className="text-sm text-gray-300">
                {analysisResults.bijective.isBijective && analysisResults.balance.isBalanced && analysisResults.ddt.maxDU <= 4
                  ? '✅ This S-Box is VALID and suitable for cryptographic use'
                  : '⚠️ This S-Box has weaknesses and should be reviewed'}
              </p>
            </div>
          </div>

          {/* Generated S-Box Table */}
          <div className="bg-white/5 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Generated S-Box (Hexadecimal)
            </h3>

            <div className="bg-slate-800/50 rounded-lg p-4 overflow-x-auto">
              <div className="inline-block min-w-full">
                {/* Header Row */}
                <div className="grid grid-cols-17 gap-1 mb-2">
                  <div className="text-xs font-mono text-gray-500 text-center"></div>
                  {[...Array(16)].map((_, i) => (
                    <div key={i} className="text-xs font-mono text-gray-400 text-center font-semibold">
                      {i.toString(16).toUpperCase()}
                    </div>
                  ))}
                </div>

                {/* S-Box Rows */}
                {[...Array(16)].map((_, rowIndex) => (
                  <div key={rowIndex} className="grid grid-cols-17 gap-1 mb-1">
                    {/* Row Header */}
                    <div className="text-xs font-mono text-gray-400 text-center font-semibold flex items-center justify-center">
                      {rowIndex.toString(16).toUpperCase()}
                    </div>
                    
                    {/* S-Box Values */}
                    {generatedSbox.slice(rowIndex * 16, (rowIndex + 1) * 16).map((value, colIndex) => (
                      <div
                        key={colIndex}
                        className="text-xs font-mono text-center py-1.5 rounded bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 transition-colors"
                      >
                        {value.toString(16).padStart(2, '0').toUpperCase()}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Generated S-Box Table (Decimal) */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-white/10 mt-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  {/* Saya ganti icon sedikit agar ada variasi, atau pakai icon yang sama juga boleh */}
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Generated S-Box (Decimal)
                </h3>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(generatedSbox));
                    alert('Decimal Array copied to clipboard!');
                  }}
                  className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-all shadow-lg shadow-green-500/30 flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  Copy Decimal Array
                </button>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4 overflow-x-auto">
                <div className="inline-block min-w-full">
                  {/* Header Row (Tetap 0-F untuk Index Kolom) */}
                  <div className="grid grid-cols-17 gap-1 mb-2">
                    <div className="text-xs font-mono text-gray-500 text-center"></div>
                    {[...Array(16)].map((_, i) => (
                      <div key={i} className="text-xs font-mono text-gray-400 text-center font-semibold">
                        {i.toString(16).toUpperCase()}
                      </div>
                    ))}
                  </div>

                  {/* S-Box Rows */}
                  {[...Array(16)].map((_, rowIndex) => (
                    <div key={rowIndex} className="grid grid-cols-17 gap-1 mb-1">
                      {/* Row Header (Tetap 0-F untuk Index Baris) */}
                      <div className="text-xs font-mono text-gray-400 text-center font-semibold flex items-center justify-center">
                        {rowIndex.toString(16).toUpperCase()}
                      </div>
                      
                      {/* S-Box Values (DECIMAL) */}
                      {generatedSbox.slice(rowIndex * 16, (rowIndex + 1) * 16).map((value, colIndex) => (
                        <div
                          key={colIndex}
                          // Perbedaan visual sedikit: Menggunakan aksen Hijau (green) agar user bisa membedakan dengan tabel Hex (ungu)
                          // Jika ingin persis sama warnanya, ganti 'green' menjadi 'purple'
                          className="text-xs font-mono text-center py-1.5 rounded bg-green-500/10 text-green-300 hover:bg-green-500/20 transition-colors cursor-default"
                          title={`Hex: ${value.toString(16).toUpperCase()}`} // Tooltip helper
                        >
                          {/* HANYA BAGIAN INI YANG BERBEDA DARI TABEL SEBELUMNYA */}
                          {value.toString()} 
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* DDT Table (16x16 subset) */}
          <div className="bg-white/5 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Differential Distribution Table (16×16 Subset)
            </h3>

            <p className="text-sm text-gray-400 mb-4">
              Shows DDT[α][β] for α,β ∈ [0x00, 0x0F]. Full table is 256×256.
            </p>

            <div className="bg-slate-800/50 rounded-lg p-4 overflow-x-auto">
              <div className="inline-block min-w-full">
                {/* Header Row */}
                <div className="grid grid-cols-17 gap-1 mb-2">
                  <div className="text-xs font-mono text-gray-500 text-center font-semibold">α\β</div>
                  {[...Array(16)].map((_, i) => (
                    <div key={i} className="text-xs font-mono text-gray-400 text-center font-semibold">
                      {i.toString(16).toUpperCase()}
                    </div>
                  ))}
                </div>

                {/* DDT Rows */}
                {[...Array(16)].map((_, rowIndex) => (
                  <div key={rowIndex} className="grid grid-cols-17 gap-1 mb-1">
                    {/* Row Header */}
                    <div className="text-xs font-mono text-gray-400 text-center font-semibold flex items-center justify-center">
                      {rowIndex.toString(16).toUpperCase()}
                    </div>
                    
                    {/* DDT Values */}
                    {analysisResults.ddt.table[rowIndex].slice(0, 16).map((value, colIndex) => {
                      let bgColor = 'bg-slate-700/30';
                      if (value === 0) bgColor = 'bg-gray-700/50';
                      else if (value <= 2) bgColor = 'bg-green-500/20';
                      else if (value <= 4) bgColor = 'bg-yellow-500/20';
                      else bgColor = 'bg-red-500/20';

                      return (
                        <div
                          key={colIndex}
                          className={`text-xs font-mono text-center py-1.5 rounded ${bgColor} text-gray-300 hover:brightness-125 transition-colors`}
                        >
                          {value}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-gray-400 mt-3">
              💡 Color coding: <span className="text-green-400">Green (≤2)</span>, <span className="text-yellow-400">Yellow (3-4)</span>, <span className="text-red-400">Red (>4)</span>
            </p>
          </div>
        </>
      )}
    </div>
  );
}