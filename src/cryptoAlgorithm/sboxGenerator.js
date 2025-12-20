// src/cryptoAlgorithm/sboxGenerator.js

const CONST_VECTOR_B = 0x63;
const MODULUS = 0x11B; // x^8 + x^4 + x^3 + x + 1

/**
 * Perkalian Polinomial di GF(2^8)
 */
function polyMul(a, b) {
  let res = 0;
  while (b) {
    if (b & 1) {
      res ^= a;
    }
    a <<= 1;
    if (a & 0x100) {
      a ^= MODULUS;
    }
    b >>= 1;
  }
  return res;
}

/**
 * Inverse Multiplikatif di GF(2^8)
 */
function polyInv(a) {
  if (a === 0) return 0;
  
  let result = 1;
  for (let i = 0; i < 254; i++) {
    result = polyMul(result, a);
  }
  return result;
}

/**
 * Transformasi Afin: y = A*z + b
 */
function affineTransform(z, matrix, constB) {
  let outputByte = 0;
  
  // Extract bits dari z (LSB ke MSB)
  const zBits = [];
  for (let i = 0; i < 8; i++) {
    zBits.push((z >> i) & 1);
  }
  
  // Extract bits dari constB
  const bBits = [];
  for (let i = 0; i < 8; i++) {
    bBits.push((constB >> i) & 1);
  }
  
  // Hitung transformasi afin
  for (let i = 0; i < 8; i++) {
    let dotProduct = 0;
    for (let j = 0; j < 8; j++) {
      dotProduct ^= (matrix[i][j] * zBits[j]);
    }
    const outputBit = dotProduct ^ bBits[i];
    outputByte |= (outputBit << i);
  }
  
  return outputByte;
}

/**
 * Konstruksi S-Box dari Affine Matrix
 */
export function constructModifiedSbox(matrix, constB = CONST_VECTOR_B) {
  const sbox = new Array(256);
  
  for (let x = 0; x < 256; x++) {
    // Step 1: Inverse Multiplikatif
    const z = polyInv(x);
    
    // Step 2: Transformasi Afin
    sbox[x] = affineTransform(z, matrix, constB);
  }
  
  return sbox;
}

/**
 * Test Bijective (semua output unik)
 */
export function testBijective(sbox) {
  const uniqueOutputs = new Set(sbox);
  return {
    isBijective: uniqueOutputs.size === 256,
    uniqueCount: uniqueOutputs.size
  };
}

/**
 * Test Balance (setiap bit output seimbang 128:128)
 */
export function testBalance(sbox) {
  const balanceResults = {};
  let isBalanced = true;
  
  for (let i = 0; i < 8; i++) {
    let count0 = 0;
    let count1 = 0;
    
    for (let x = 0; x < 256; x++) {
      const outputBit = (sbox[x] >> i) & 1;
      if (outputBit === 0) {
        count0++;
      } else {
        count1++;
      }
    }
    
    balanceResults[`f${i}`] = { count0, count1 };
    
    if (count0 !== 128 || count1 !== 128) {
      isBalanced = false;
    }
  }
  
  return { isBalanced, balanceResults };
}

/**
 * Hitung Differential Distribution Table (DDT)
 */
export function calculateDDT(sbox) {
  // Inisialisasi DDT 256x256
  const ddt = Array(256).fill(null).map(() => Array(256).fill(0));
  
  for (let alpha = 0; alpha < 256; alpha++) {
    for (let x = 0; x < 256; x++) {
      const xPrime = x ^ alpha;
      const beta = sbox[x] ^ sbox[xPrime];
      ddt[alpha][beta]++;
    }
  }
  
  return ddt;
}

/**
 * Analisis DDT - hitung Max Differential Uniformity
 */
export function analyzeDDT(ddt) {
  let maxDU = 0;
  const isDdtZeroCorrect = (ddt[0][0] === 256);
  
  for (let alpha = 1; alpha < 256; alpha++) {
    for (let beta = 0; beta < 256; beta++) {
      if (ddt[alpha][beta] > maxDU) {
        maxDU = ddt[alpha][beta];
      }
    }
  }
  
  return { maxDU, isDdtZeroCorrect };
}

/**
 * Validasi Affine Matrix (harus 8x8 dengan nilai 0 atau 1)
 */
export function validateAffineMatrix(matrix) {
  if (!Array.isArray(matrix) || matrix.length !== 8) {
    return { valid: false, message: "Matrix harus memiliki 8 baris" };
  }
  
  for (let i = 0; i < 8; i++) {
    if (!Array.isArray(matrix[i]) || matrix[i].length !== 8) {
      return { valid: false, message: `Baris ${i} harus memiliki 8 kolom` };
    }
    
    for (let j = 0; j < 8; j++) {
      const val = matrix[i][j];
      if (val !== 0 && val !== 1) {
        return { valid: false, message: `Nilai di baris ${i}, kolom ${j} harus 0 atau 1` };
      }
    }
  }
  
  return { valid: true, message: "Matrix valid" };
}

/**
 * Generate CSV dari S-Box dan hasil analisis
 */
export function generateSboxCSV(sbox, analysisResults) {
  let csv = "S-Box Analysis Report\n\n";
  
  // Header info
  csv += "Generated on," + new Date().toLocaleString() + "\n\n";
  
  // Analysis Results
  csv += "=== ANALYSIS RESULTS ===\n";
  csv += "Bijective Status," + (analysisResults.bijective.isBijective ? "PASS" : "FAIL") + "\n";
  csv += "Unique Outputs," + analysisResults.bijective.uniqueCount + "/256\n\n";
  
  csv += "Balance Status," + (analysisResults.balance.isBalanced ? "PASS" : "FAIL") + "\n";
  for (let i = 0; i < 8; i++) {
    const key = `f${i}`;
    csv += `f${i}(x),Count 0: ${analysisResults.balance.balanceResults[key].count0}, Count 1: ${analysisResults.balance.balanceResults[key].count1}\n`;
  }
  csv += "\n";
  
  csv += "Max Differential Uniformity," + analysisResults.ddt.maxDU + "\n";
  csv += "DDT[0][0] Check," + (analysisResults.ddt.isDdtZeroCorrect ? "PASS (256)" : "FAIL") + "\n";
  csv += "DU Status," + (analysisResults.ddt.maxDU <= 4 ? "EXCELLENT (≤4)" : "POOR (>4)") + "\n\n";
  
  // S-Box Table
  csv += "=== S-BOX TABLE (Decimal) ===\n";
  csv += ",";
  for (let i = 0; i < 16; i++) {
    csv += i.toString(16).toUpperCase() + ",";
  }
  csv += "\n";
  
  for (let i = 0; i < 16; i++) {
    csv += i.toString(16).toUpperCase() + ",";
    for (let j = 0; j < 16; j++) {
      csv += sbox[i * 16 + j] + ",";
    }
    csv += "\n";
  }
  csv += "\n";
  
  // S-Box Table (Hex)
  csv += "=== S-BOX TABLE (Hexadecimal) ===\n";
  csv += ",";
  for (let i = 0; i < 16; i++) {
    csv += i.toString(16).toUpperCase() + ",";
  }
  csv += "\n";
  
  for (let i = 0; i < 16; i++) {
    csv += i.toString(16).toUpperCase() + ",";
    for (let j = 0; j < 16; j++) {
      csv += sbox[i * 16 + j].toString(16).padStart(2, '0').toUpperCase() + ",";
    }
    csv += "\n";
  }
  csv += "\n";
  
  // DDT Table (16x16 subset)
  csv += "=== DIFFERENTIAL DISTRIBUTION TABLE (16x16 Subset) ===\n";
  csv += "Alpha\\Beta,";
  for (let i = 0; i < 16; i++) {
    csv += i.toString(16).toUpperCase() + ",";
  }
  csv += "\n";
  
  for (let alpha = 0; alpha < 16; alpha++) {
    csv += alpha.toString(16).toUpperCase() + ",";
    for (let beta = 0; beta < 16; beta++) {
      csv += analysisResults.ddt.table[alpha][beta] + ",";
    }
    csv += "\n";
  }
  
  return csv;
}

/**
 * Download CSV file
 */
export function downloadCSV(csvContent, filename = "sbox_analysis.csv") {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}