// src/cryptoAlgorithm/analysisUtils.js

// 1. Menghitung Histogram (Frekuensi R, G, B)
export const calculateHistogram = (data) => {
  const r = new Array(256).fill(0);
  const g = new Array(256).fill(0);
  const b = new Array(256).fill(0);

  // Data diasumsikan urutan [R, G, B, R, G, B...]
  for (let i = 0; i < data.length; i += 3) {
    if (data[i] !== undefined) r[data[i]]++;
    if (data[i + 1] !== undefined) g[data[i + 1]]++;
    if (data[i + 2] !== undefined) b[data[i + 2]]++;
  }
  return { r, g, b };
};

// 2. Menghitung Entropy (Tingkat Keacakan, Ideal ~8.0)
export const calculateEntropy = (data) => {
  const frequencies = new Array(256).fill(0);
  for (let i = 0; i < data.length; i++) {
    frequencies[data[i]]++;
  }

  let entropy = 0;
  const totalBytes = data.length;
  for (let i = 0; i < 256; i++) {
    if (frequencies[i] > 0) {
      const p = frequencies[i] / totalBytes;
      entropy -= p * Math.log2(p);
    }
  }
  return entropy;
};

// 3. Menghitung Correlation (Hubungan pixel tetangga)
// Menggunakan sampel horizontal untuk performa
export const calculateCorrelation = (data, width, height) => {
  let N = 0;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
  
  const step = 3; 
  // Loop pixel, bandingkan dengan pixel tetangga kanannya
  // Kita konversi RGB ke Grayscale sederhana untuk korelasi umum
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width - 1; x++) {
      const idx = (y * width + x) * step;
      const idxNext = idx + step;

      if (idxNext + 2 < data.length) {
        const valX = (data[idx] + data[idx+1] + data[idx+2]) / 3;
        const valY = (data[idxNext] + data[idxNext+1] + data[idxNext+2]) / 3;

        sumX += valX;
        sumY += valY;
        sumXY += valX * valY;
        sumX2 += valX * valX;
        sumY2 += valY * valY;
        N++;
      }
    }
  }

  const numerator = (N * sumXY) - (sumX * sumY);
  const denominator = Math.sqrt((N * sumX2 - sumX * sumX) * (N * sumY2 - sumY * sumY));

  if (denominator === 0) return 0;
  return Math.abs(numerator / denominator);
};

// 4. NPCR (Number of Pixels Change Rate)
// Membandingkan Original vs Encrypted
export const calculateNPCR = (original, encrypted) => {
  const len = Math.min(original.length, encrypted.length);
  let diffCount = 0;
  
  for (let i = 0; i < len; i++) {
    if (original[i] !== encrypted[i]) {
      diffCount++;
    }
  }
  return (diffCount / len) * 100;
};

// 5. UACI (Unified Average Changing Intensity)
export const calculateUACI = (original, encrypted) => {
  const len = Math.min(original.length, encrypted.length);
  let sumDiff = 0;
  
  for (let i = 0; i < len; i++) {
    sumDiff += Math.abs(original[i] - encrypted[i]);
  }
  
  return (sumDiff / (255 * len)) * 100;
};