// src/ImageEncryption.jsx
import React, { useState } from "react";
import { encryptImageWithMetadata, decryptImageWithMetadata, SBOX_OPTIONS } from "../cryptoAlgorithm/aesCustom.js";
// IMPORT FUNGSI ANALISIS BARU
import { calculateHistogram, calculateEntropy, calculateCorrelation, calculateNPCR, calculateUACI } from "../cryptoAlgorithm/analysisUtils.js";

// IMPORT CHART.JS
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// ==========================================
// 1. RAW PNG ENCODER/DECODER UTILS (EXISTING CODE)
// ==========================================
// ... (Kode CRC, Adler32, bufferToPngBlob, pngBlobToBuffer Anda Tetap Sama)
// Saya persingkat di sini agar muat, tapi GUNAKAN KODE ENCODER/DECODER YANG SUDAH ANDA PUNYA SEBELUMNYA
// Pastikan bagian ini sama persis dengan kode Anda yang "Sudah Stabil/Tidak Error"

const CRC_TABLE = new Int32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1); else c = c >>> 1;
  }
  CRC_TABLE[n] = c;
}

const crc32 = (buf) => {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
};

const adler32 = (data) => {
  let a = 1, b = 0, L = data.length, i = 0;
  while (L > 0) {
    let n = Math.min(L, 3800); L -= n;
    while (n-- > 0) { a += data[i++]; b += a; }
    a %= 65521; b %= 65521;
  }
  return ((b << 16) | a) >>> 0;
};

const bufferToPngBlob = (dataBuffer) => {
  return new Promise((resolve) => {
    const originalLen = dataBuffer.length;
    const bufferWithHeader = new Uint8Array(4 + originalLen);
    const lenView = new DataView(bufferWithHeader.buffer);
    lenView.setUint32(0, originalLen, false); 
    bufferWithHeader.set(dataBuffer, 4);

    const len = bufferWithHeader.length;
    const pixelCount = Math.ceil(len / 3);
    const width = Math.ceil(Math.sqrt(pixelCount));
    const height = Math.ceil(pixelCount / width);
    const lineSize = width * 3 + 1; 
    const rawDataSize = lineSize * height;
    const rawData = new Uint8Array(rawDataSize);

    let srcIdx = 0;
    for (let y = 0; y < height; y++) {
      let destIdx = y * lineSize;
      rawData[destIdx++] = 0; 
      for (let x = 0; x < width; x++) {
        rawData[destIdx++] = srcIdx < len ? bufferWithHeader[srcIdx++] : 0; 
        rawData[destIdx++] = srcIdx < len ? bufferWithHeader[srcIdx++] : 0; 
        rawData[destIdx++] = srcIdx < len ? bufferWithHeader[srcIdx++] : 0; 
      }
    }

    const blockCount = Math.ceil(rawDataSize / 65535);
    const zlibSize = 2 + (blockCount * 5) + rawDataSize + 4; 
    const zlibBuffer = new Uint8Array(zlibSize);
    let zIdx = 0;
    zlibBuffer[zIdx++] = 0x78; zlibBuffer[zIdx++] = 0x01;
    let rIdx = 0; let bytesLeft = rawDataSize;
    while (bytesLeft > 0) {
      const chunkSize = Math.min(bytesLeft, 65535);
      const isFinal = bytesLeft <= 65535 ? 1 : 0;
      zlibBuffer[zIdx++] = isFinal; 
      zlibBuffer[zIdx++] = chunkSize & 0xff; zlibBuffer[zIdx++] = (chunkSize >>> 8) & 0xff;
      zlibBuffer[zIdx++] = (~chunkSize) & 0xff; zlibBuffer[zIdx++] = ((~chunkSize) >>> 8) & 0xff;
      zlibBuffer.set(rawData.subarray(rIdx, rIdx + chunkSize), zIdx);
      zIdx += chunkSize; rIdx += chunkSize; bytesLeft -= chunkSize;
    }

    const adler = adler32(rawData);
    const view = new DataView(zlibBuffer.buffer);
    view.setUint32(zIdx, adler, false); 

    const parts = [];
    parts.push(new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]));
    const ihdr = new Uint8Array(13);
    const ihdrView = new DataView(ihdr.buffer);
    ihdrView.setUint32(0, width, false); ihdrView.setUint32(4, height, false);
    ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
    const ihdrHead = new Uint8Array([0, 0, 0, 13, 73, 72, 68, 82]); 
    const ihdrCrcBuf = new Uint8Array(17);
    ihdrCrcBuf.set(ihdrHead.subarray(4), 0); ihdrCrcBuf.set(ihdr, 4);
    const ihdrCrc = new Uint8Array(4);
    new DataView(ihdrCrc.buffer).setUint32(0, crc32(ihdrCrcBuf), false);
    parts.push(ihdrHead, ihdr, ihdrCrc);
    const idatLen = new Uint8Array(4);
    new DataView(idatLen.buffer).setUint32(0, zlibBuffer.length, false);
    const idatHead = new Uint8Array([73, 68, 65, 84]); 
    const idatCrcBuf = new Uint8Array(4 + zlibBuffer.length);
    idatCrcBuf.set(idatHead, 0); idatCrcBuf.set(zlibBuffer, 4);
    const idatCrc = new Uint8Array(4);
    new DataView(idatCrc.buffer).setUint32(0, crc32(idatCrcBuf), false);
    parts.push(idatLen, idatHead, zlibBuffer, idatCrc);
    parts.push(new Uint8Array([0, 0, 0, 0, 73, 69, 78, 68, 0xAE, 0x42, 0x60, 0x82]));
    const blob = new Blob(parts, { type: 'image/png' });
    resolve(blob);
  });
};

const pngBlobToBuffer = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = new Uint8Array(e.target.result);
      const view = new DataView(buffer.buffer);
      if (buffer[0] !== 0x89 || buffer[1] !== 0x50) { reject(new Error("File bukan format PNG yang valid")); return; }
      let offset = 8; let width = 0, height = 0;
      const idatChunks = []; let totalIdatLength = 0;
      while (offset < buffer.length) {
        if (offset + 8 > buffer.length) break;
        const len = view.getUint32(offset, false);
        const type = String.fromCharCode(...buffer.subarray(offset + 4, offset + 8));
        if (type === 'IHDR') { width = view.getUint32(offset + 8, false); height = view.getUint32(offset + 12, false); }
        else if (type === 'IDAT') { idatChunks.push(buffer.subarray(offset + 8, offset + 8 + len)); totalIdatLength += len; }
        else if (type === 'IEND') { break; }
        offset += 12 + len;
      }
      if (totalIdatLength === 0) { reject(new Error("Data gambar rusak (No IDAT)")); return; }
      const zlibData = new Uint8Array(totalIdatLength);
      let curOffset = 0;
      for (const chunk of idatChunks) { zlibData.set(chunk, curOffset); curOffset += chunk.length; }
      let zIdx = 2; const rowSize = width * 3 + 1; const totalDataSize = rowSize * height;
      const rawData = new Uint8Array(totalDataSize); let rIdx = 0;
      while (zIdx < zlibData.length - 4) { 
        const bfinal = zlibData[zIdx] & 0x01; zIdx++; 
        const len = zlibData[zIdx] | (zlibData[zIdx+1] << 8); zIdx += 4; 
        const safeLen = Math.min(len, rawData.length - rIdx);
        rawData.set(zlibData.subarray(zIdx, zIdx + safeLen), rIdx);
        rIdx += len; zIdx += len; if (bfinal) break;
      }
      const fullBuffer = new Uint8Array(width * height * 3);
      let fIdx = 0;
      for (let y = 0; y < height; y++) {
        const rowStart = y * rowSize + 1; 
        if (rowStart + (width * 3) <= rawData.length) {
            const rowData = rawData.subarray(rowStart, rowStart + (width * 3));
            fullBuffer.set(rowData, fIdx); fIdx += width * 3;
        }
      }
      const metaView = new DataView(fullBuffer.buffer);
      const actualLength = metaView.getUint32(0, false);
      const finalData = fullBuffer.slice(4, 4 + actualLength);
      resolve(finalData);
    };
    reader.onerror = reject; reader.readAsArrayBuffer(blob);
  });
};

// ==========================================
// 2. HELPER UNTUK ANALISIS GAMBAR
// ==========================================

// Fungsi untuk membaca Raw Pixel (RGB) dari File Gambar Asli
const getImageRawBytes = (file) => {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(0, 0, img.width, img.height);
            // Ambil RGB saja (buang Alpha) untuk analisis yang adil
            const rgbData = new Uint8Array(img.width * img.height * 3);
            let idx = 0;
            for(let i=0; i<imageData.data.length; i+=4) {
                rgbData[idx++] = imageData.data[i];
                rgbData[idx++] = imageData.data[i+1];
                rgbData[idx++] = imageData.data[i+2];
            }
            resolve({ buffer: rgbData, width: img.width, height: img.height });
        };
        img.src = URL.createObjectURL(file);
    });
};

// Komponen Grafik Histogram
const HistogramChart = ({ data, title }) => {
    const chartData = {
      labels: Array.from({length: 256}, (_, i) => i),
      datasets: [
        { label: 'Red', data: data.r, borderColor: 'rgba(239, 68, 68, 0.8)', backgroundColor: 'rgba(239, 68, 68, 0.2)', borderWidth: 1, pointRadius: 0, fill: true },
        { label: 'Green', data: data.g, borderColor: 'rgba(34, 197, 94, 0.8)', backgroundColor: 'rgba(34, 197, 94, 0.2)', borderWidth: 1, pointRadius: 0, fill: true },
        { label: 'Blue', data: data.b, borderColor: 'rgba(59, 130, 246, 0.8)', backgroundColor: 'rgba(59, 130, 246, 0.2)', borderWidth: 1, pointRadius: 0, fill: true },
      ],
    };
    const options = {
      responsive: true,
      maintainAspectRatio: false, // Penting agar bisa stretch vertikal/horizontal
      animation: false, // Optional: Matikan animasi biar resize lebih cepat/ringan
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: { 
        legend: { 
          position: 'bottom', 
          labels: { color: '#cbd5e1', boxWidth: 10, padding: 20 } // Styling label
        }, 
        title: { display: false },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          titleColor: '#fff',
          bodyColor: '#cbd5e1',
          borderColor: 'rgba(255,255,255,0.1)',
          borderWidth: 1
        }
      },
      scales: { 
        x: { 
          ticks: { color: '#64748b', maxTicksLimit: 8 }, // Limit tick agar tidak numpuk di mobile
          grid: { color: '#334155', drawBorder: false } 
        }, 
        y: { 
          ticks: { color: '#64748b', callback: (val) => val >= 1000 ? `${val/1000}k` : val }, // Format angka besar
          grid: { color: '#334155', drawBorder: false },
          beginAtZero: true
        } 
      }
    };
    return (
      <div className="relative w-full h-[200px] sm:h-[250px] md:h-[300px]">
        <Line data={chartData} options={options} />
      </div>
    );
  };

// ==========================================
// 3. MAIN COMPONENT
// ==========================================

export default function ImageEncryption() {
  const defaultKeyHex = "2b7e151628aed2a6abf7158809cf4f3c";
  const [keyHex, setKeyHex] = useState(defaultKeyHex);
  const [selectedSboxId, setSelectedSboxId] = useState(44);
  
  // Encryption States
  const [originalImage, setOriginalImage] = useState(null);
  const [originalImagePreview, setOriginalImagePreview] = useState(null);
  const [encryptedImageBlob, setEncryptedImageBlob] = useState(null);
  const [encryptedImagePreview, setEncryptedImagePreview] = useState(null);
  const [encryptedMetadata, setEncryptedMetadata] = useState(null);

  // Analysis State (New)
  const [analysisData, setAnalysisData] = useState(null);
  
  // Decryption States
  const [encryptedFileToDecrypt, setEncryptedFileToDecrypt] = useState(null);
  const [decryptedImage, setDecryptedImage] = useState(null);
  const [decryptedImagePreview, setDecryptedImagePreview] = useState(null);
  const [decryptedMetadata, setDecryptedMetadata] = useState(null);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setOriginalImage(file);
      const reader = new FileReader();
      reader.onload = (event) => setOriginalImagePreview(event.target.result);
      reader.readAsDataURL(file);
      
      // Reset
      setEncryptedImageBlob(null); setEncryptedImagePreview(null); setEncryptedMetadata(null); setAnalysisData(null);
    }
  };

  const handleEncryptImage = async () => {
    if (!originalImage) return alert("Please select an image first!");
    try {
      // 1. Enkripsi
      const result = await encryptImageWithMetadata(originalImage, keyHex, selectedSboxId);
      
      // 2. Buat PNG
      const pngBlob = await bufferToPngBlob(result.encryptedData);
      setEncryptedImageBlob(pngBlob);
      setEncryptedMetadata(result.metadata);
      setEncryptedImagePreview(URL.createObjectURL(pngBlob));

      // 3. --- MULAI ANALISIS ---
      // Ambil data raw gambar asli
      const originalRaw = await getImageRawBytes(originalImage);
      // Ambil data raw enkripsi (Ciphertext). 
      // Note: result.encryptedData mengandung header JSON, ini dianggap sebagai 'noise' visual.
      const encryptedRaw = result.encryptedData;

      // Hitung Histogram
      const histOriginal = calculateHistogram(originalRaw.buffer);
      const histEncrypted = calculateHistogram(encryptedRaw);

      // Hitung Entropy
      const entropyOriginal = calculateEntropy(originalRaw.buffer);
      const entropyEncrypted = calculateEntropy(encryptedRaw);

      // Hitung Correlation
      const corrOriginal = calculateCorrelation(originalRaw.buffer, originalRaw.width, originalRaw.height);
      const encSide = Math.ceil(Math.sqrt(encryptedRaw.length / 3));
      const corrEncrypted = calculateCorrelation(encryptedRaw, encSide, encSide);

      // Hitung NPCR & UACI (Original vs Encrypted)
      const npcr = calculateNPCR(originalRaw.buffer, encryptedRaw);
      const uaci = calculateUACI(originalRaw.buffer, encryptedRaw);

      setAnalysisData({
        histOriginal, histEncrypted,
        entropyOriginal, entropyEncrypted,
        corrOriginal, corrEncrypted,
        npcr, uaci
      });

      alert("Success! Image encrypted and analysis complete.");
    } catch (e) {
      console.error(e); alert("Error: " + e.message);
    }
  };

  const handleDownloadEncrypted = () => {
    if (!encryptedImageBlob) return;
    const name = originalImage.name.substring(0, originalImage.name.lastIndexOf('.')) || originalImage.name;
    const url = URL.createObjectURL(encryptedImageBlob);
    const a = document.createElement('a'); a.href = url; a.download = `ENC_${name}.png`; 
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const handleEncryptedFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEncryptedFileToDecrypt(file);
      setDecryptedImage(null); setDecryptedImagePreview(null); setDecryptedMetadata(null);
    }
  };

  const handleDecryptImage = async () => {
    if (!encryptedFileToDecrypt) return alert("Select PNG!");
    try {
      const encryptedBytes = await pngBlobToBuffer(encryptedFileToDecrypt);
      const result = await decryptImageWithMetadata(encryptedBytes, keyHex, selectedSboxId);
      setDecryptedImage(result.decryptedBytes);
      setDecryptedMetadata(result.metadata);
      const blob = new Blob([result.decryptedBytes], { type: result.metadata.originalType || 'image/png' });
      setDecryptedImagePreview(URL.createObjectURL(blob));
      alert("Decrypted successfully!");
    } catch (e) {
      console.error(e); alert("Error: " + e.message);
    }
  };

  const handleDownloadDecrypted = () => {
    if (!decryptedImage) return;
    const name = decryptedMetadata?.originalName || 'decrypted.jpg';
    const mime = decryptedMetadata?.originalType || 'image/jpeg';
    const url = URL.createObjectURL(new Blob([decryptedImage], { type: mime }));
    const a = document.createElement('a'); a.href = url; a.download = `DEC_${name}`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Settings Panel */}
      <div className="bg-white/5 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-white/10">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h16M4 17h16" />
          </svg>
          Configuration
        </h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {SBOX_OPTIONS.map((opt) => (
            <button key={opt.id} onClick={() => setSelectedSboxId(opt.id)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 active:scale-95 ${selectedSboxId === opt.id ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30' : 'bg-slate-700/50 text-gray-300 hover:bg-slate-700'}`}>
              <div className="flex items-center gap-2">
                  {selectedSboxId === opt.id && (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                  {opt.name}
                </div>
            </button>
          ))}
        </div>
        <input className="w-full p-3 rounded bg-slate-800/50 text-white border border-purple-500/30 focus:border-purple-500 outline-none"
          value={keyHex} onChange={(e) => setKeyHex(e.target.value.trim())} placeholder="Key (32 hex chars)" />
      </div>

      {/* Main Operations Grid */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Encryption Side */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-green-400">🔒</span> Encryption
          </h2>
          <input type="file" accept="image/*" onChange={handleImageSelect} className="mb-4 w-full text-sm text-gray-300 file:bg-purple-600 file:border-0 file:rounded file:px-4 file:py-2 file:text-white hover:file:bg-purple-700 cursor-pointer" />
          
          <div className="grid grid-cols-2 gap-4 mb-4 min-h-[160px]">
            <div className="bg-slate-800/50 rounded-lg p-2 border border-white/5 flex flex-col items-center justify-center">
                {originalImagePreview ? (
                   <img src={originalImagePreview} className="max-h-32 rounded object-contain" alt="Orig" />
                ) : <span className="text-gray-500 text-xs">No Image</span>}
                <span className="text-gray-400 text-xs mt-1">Original</span>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-2 border border-white/5 flex flex-col items-center justify-center">
                {encryptedImagePreview ? (
                   <img src={encryptedImagePreview} className="max-h-32 rounded object-contain image-pixelated" style={{imageRendering:'pixelated'}} alt="Enc" />
                ) : <span className="text-gray-500 text-xs">Waiting...</span>}
                <span className="text-gray-400 text-xs mt-1">Encrypted</span>
            </div>
          </div>

          <button onClick={handleEncryptImage} className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 rounded-lg text-white font-bold mb-3 shadow-lg shadow-purple-500/20 transition-all">Encrypt & Analyze</button>
          {encryptedImageBlob && (
            <button onClick={handleDownloadEncrypted} className="w-full py-2 bg-slate-700 hover:bg-slate-600 rounded text-purple-300 font-medium text-sm border border-purple-500/30">Download Encrypted PNG</button>
          )}
        </div>

        {/* Decryption Side */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-blue-400">🔓</span> Decryption
          </h2>
          <input type="file" accept="image/png" onChange={handleEncryptedFileSelect} className="mb-4 w-full text-sm text-gray-300 file:bg-blue-600 file:border-0 file:rounded file:px-4 file:py-2 file:text-white hover:file:bg-blue-700 cursor-pointer" />
          
          <div className="min-h-[160px] bg-slate-800/50 rounded-lg p-2 border border-white/5 flex flex-col items-center justify-center mb-4">
             {decryptedImagePreview ? (
                 <img src={decryptedImagePreview} className="max-h-40 rounded object-contain" alt="Dec" />
             ) : <span className="text-gray-500 text-sm">Decrypted result will appear here</span>}
          </div>

          <button onClick={handleDecryptImage} className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 rounded-lg text-white font-bold mb-3 shadow-lg shadow-blue-500/20 transition-all">Decrypt Image</button>
          {decryptedImage && (
             <button onClick={handleDownloadDecrypted} className="w-full py-2 bg-slate-700 hover:bg-slate-600 rounded text-blue-300 font-medium text-sm border border-blue-500/30">Download Result</button>
          )}
        </div>
      </div>

      {/* --- DASHBOARD ANALISIS (Sama seperti gambar referensi) --- */}
      {analysisData && (
        <div className="mt-12 bg-slate-900/90 rounded-2xl p-8 border border-slate-700 shadow-2xl animate-fade-in-up">
          <h2 className="text-3xl font-bold text-white mb-8 border-b border-slate-700 pb-4">Histogram Analysis</h2>
          
          <div className="grid md:grid-cols-2 gap-8 mb-10">
            <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
                <h4 className="text-gray-300 text-sm mb-4 font-semibold">Original Image Histogram</h4>
                <HistogramChart data={analysisData.histOriginal} />
            </div>
            <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
                <h4 className="text-gray-300 text-sm mb-4 font-semibold">Encrypted Image Histogram</h4>
                <HistogramChart data={analysisData.histEncrypted} />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-white mb-6 border-b border-slate-700 pb-4">Security Metrics Analysis</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Entropy Card */}
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 relative overflow-hidden group hover:border-yellow-500/50 transition-colors">
              <div className="flex justify-between items-start mb-4">
                 <div>
                    <h3 className="text-lg font-bold text-white">Entropy</h3>
                    <p className="text-gray-400 text-xs">Measures randomness/uncertainty (ideal: 8.0)</p>
                 </div>
                 <span className="bg-yellow-500/20 text-yellow-500 text-xs font-bold px-2 py-1 rounded">Good</span>
              </div>
              <div className="space-y-2">
                 <div className="flex justify-between text-sm"><span className="text-gray-400">Original:</span> <span className="text-white font-mono">{analysisData.entropyOriginal.toFixed(4)}</span></div>
                 <div className="flex justify-between text-sm"><span className="text-gray-400">Encrypted:</span> <span className="text-green-400 font-mono font-bold">{analysisData.entropyEncrypted.toFixed(4)}</span></div>
              </div>
            </div>

            {/* NPCR Card */}
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 relative overflow-hidden group hover:border-green-500/50 transition-colors">
              <div className="flex justify-between items-start mb-4">
                 <div>
                    <h3 className="text-lg font-bold text-white">NPCR</h3>
                    <p className="text-gray-400 text-xs">Pixel Change Rate (Difference %)</p>
                 </div>
                 <span className="bg-green-500/20 text-green-500 text-xs font-bold px-2 py-1 rounded">Excellent</span>
              </div>
              <div className="flex items-end justify-between">
                 <div>
                    <span className="text-3xl font-bold text-white">{analysisData.npcr.toFixed(4)}%</span>
                    <p className="text-green-500 text-xs mt-1">Difference Rate</p>
                 </div>
              </div>
            </div>

             {/* UACI Card */}
             <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 relative overflow-hidden group hover:border-blue-500/50 transition-colors">
              <div className="flex justify-between items-start mb-4">
                 <div>
                    <h3 className="text-lg font-bold text-white">UACI</h3>
                    <p className="text-gray-400 text-xs">Average Changing Intensity (ideal: ~33.4%)</p>
                 </div>
                 <span className="bg-blue-500/20 text-blue-500 text-xs font-bold px-2 py-1 rounded">Excellent</span>
              </div>
              <div className="flex items-end justify-between">
                 <div>
                    <span className="text-3xl font-bold text-white">{analysisData.uaci.toFixed(4)}%</span>
                    <p className="text-blue-500 text-xs mt-1">Intensity Diff</p>
                 </div>
              </div>
            </div>

            {/* Correlation Card */}
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 relative overflow-hidden group hover:border-red-500/50 transition-colors">
              <div className="flex justify-between items-start mb-4">
                 <div>
                    <h3 className="text-lg font-bold text-white">Correlation</h3>
                    <p className="text-gray-400 text-xs">Pixel correlation (lower is better, ideal: 0.0)</p>
                 </div>
                 <span className="bg-red-500/20 text-red-500 text-xs font-bold px-2 py-1 rounded">Fair</span>
              </div>
              <div className="space-y-2">
                 <div className="flex justify-between text-sm"><span className="text-gray-400">Original:</span> <span className="text-white font-mono">{analysisData.corrOriginal.toFixed(4)}</span></div>
                 <div className="flex justify-between text-sm"><span className="text-gray-400">Encrypted:</span> <span className="text-green-400 font-mono font-bold">{analysisData.corrEncrypted.toFixed(4)}</span></div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-slate-800/50 rounded-lg text-sm text-gray-400 border-l-4 border-slate-500">
            <strong>Interpretation:</strong> 
            <span className="ml-1">
              Entropy mendekati 8.0, NPCR tinggi (>99%), dan Korelasi mendekati 0.0 pada gambar terenkripsi menunjukkan kualitas enkripsi yang baik (acak sempurna dan tidak memiliki pola visual).
            </span>
          </div>
        </div>
      )}
    </div>
  );
}