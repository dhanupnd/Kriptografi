// src/crypto/aesCustom.js
// AES-128 (ECB) with 5 custom S-Boxes, ES module for React frontend.

// ========== 5 CUSTOM S-BOXES ==========
// sbox 4
export const SBOX1 = [
  99,109,34,226,133,28,163,9,86,186,220,231,69,40,16,205,
  249,125,201,130,250,192,33,90,112,24,128,175,156,224,114,89,
  46,117,108,200,54,166,213,153,233,15,244,181,66,216,185,251,
  234,214,152,105,212,60,5,252,218,116,162,123,235,39,126,253,
  197,146,104,11,228,76,240,95,143,25,199,145,56,148,88,29,
  96,72,85,139,168,154,78,31,243,22,190,198,14,110,47,169,
  167,84,255,21,158,129,102,242,254,202,138,93,80,150,172,32,
  191,111,174,82,131,115,41,10,97,193,7,71,171,170,106,120,
  118,149,155,100,160,211,17,36,230,208,178,121,236,127,59,157,
  83,77,94,103,119,8,92,221,206,187,222,20,184,79,26,232,
  164,137,246,245,62,53,23,144,134,151,159,140,179,12,27,61,
  43,38,217,124,141,247,177,207,147,48,229,4,3,13,64,42,
  1,210,248,183,107,63,30,57,219,136,18,91,225,142,237,2,
  173,73,241,51,209,101,58,74,188,6,223,49,194,182,132,67,
  75,37,35,68,195,55,189,227,19,180,45,52,70,0,215,87,
  98,176,50,122,81,196,113,44,65,204,135,165,161,239,238,203
];

// sbox 44
export const SBOX2 = [
  99,205,85,71,25,127,113,219,63,244,109,159,11,228,94,214,
  77,177,201,78,5,48,29,30,87,96,193,80,156,200,216,86,
  116,143,10,14,54,169,148,68,49,75,171,157,92,114,188,194,
  121,220,131,210,83,135,250,149,253,72,182,33,190,141,249,82,
  232,50,21,84,215,242,180,198,168,167,103,122,152,162,145,184,
  43,237,119,183,7,12,125,55,252,206,235,160,140,133,179,192,
  110,176,221,134,19,6,187,59,26,129,112,73,175,45,24,218,
  44,66,151,32,137,31,35,147,236,247,117,132,79,136,154,105,
  199,101,203,52,57,4,153,197,88,76,202,174,233,62,208,91,
  231,53,1,124,0,28,142,170,158,51,226,65,123,186,239,246,
  38,56,36,108,8,126,9,189,81,234,212,224,13,3,40,64,
  172,74,181,118,39,227,130,89,245,166,16,61,106,196,211,107,
  229,195,138,18,93,207,240,95,58,255,209,217,15,111,46,173,
  223,42,115,238,139,243,23,98,100,178,37,97,191,213,222,155,
  165,2,146,204,120,241,163,128,22,90,60,185,67,34,27,248,
  164,69,41,230,104,47,144,251,20,17,150,225,254,161,102,70
];

// sbox 81
export const SBOX3 = [
  99,32,150,197,205,1,48,101,96,97,82,18,158,57,52,218,
  226,147,54,108,175,212,219,85,157,237,26,5,156,179,235,24,
  163,74,27,13,201,231,176,75,81,255,236,25,63,190,44,148,
  28,253,112,204,139,102,80,53,200,113,11,9,39,65,222,14,
  3,223,247,19,95,124,0,130,98,214,117,146,138,69,35,58,
  46,144,45,142,164,6,10,76,77,174,141,78,196,109,152,159,
  220,22,120,227,234,33,180,118,67,123,181,244,250,51,72,224,
  182,86,62,140,87,208,2,40,21,239,38,232,233,210,129,68,
  7,126,61,194,125,42,15,12,41,103,184,127,134,229,199,167,
  183,71,185,143,60,94,207,105,151,90,36,216,23,49,155,106,
  145,248,154,215,16,132,149,169,128,8,209,47,131,178,160,93,
  116,122,133,168,20,161,245,172,228,83,100,107,202,137,73,79,
  188,17,217,111,186,43,119,177,243,195,66,110,136,89,189,241,
  115,171,59,30,92,249,252,230,251,29,31,104,162,84,246,4,
  221,55,173,165,153,242,192,254,121,34,238,191,211,135,198,91,
  88,206,37,50,193,56,166,213,114,225,187,170,70,203,240,64
];

// sbox 111
export const SBOX4 = [
  99,218,45,232,214,229,166,243,43,236,32,209,19,95,185,253,
  71,245,54,10,80,83,58,119,91,46,239,250,156,13,190,96,
  113,98,40,196,201,159,69,165,104,221,233,167,207,235,251,162,
  127,82,87,17,183,187,175,126,14,144,84,219,141,20,226,140,
  106,37,227,22,198,118,34,78,164,220,143,50,112,11,146,23,
  116,189,60,111,38,178,147,242,53,151,39,125,47,205,131,212,
  109,206,105,128,121,29,90,199,155,33,157,171,5,238,237,200,
  213,63,8,224,248,76,173,228,134,161,74,246,49,195,6,204,
  117,249,64,191,177,107,75,3,35,124,123,62,81,16,103,110,
  18,132,188,168,135,1,89,210,234,30,197,114,9,97,203,154,
  122,138,12,27,94,222,101,192,193,28,139,179,137,202,57,73,
  72,230,25,7,65,254,108,24,215,231,52,93,129,56,42,186,
  100,153,181,66,244,172,0,130,252,120,92,133,255,86,163,115,
  31,79,208,240,142,77,149,88,194,184,55,21,182,176,36,61,
  170,241,223,225,68,59,48,26,174,85,102,44,4,150,160,217,
  145,158,2,41,247,152,169,148,216,15,51,136,67,70,180,211
];

// sbox 128
export const SBOX5 = [
  99,158,120,142,11,56,149,192,178,2,206,226,253,160,87,19,
  139,10,54,245,80,53,163,221,44,29,103,250,156,28,190,6,
  23,64,215,127,201,249,205,240,31,119,173,182,3,235,217,25,
  196,22,185,187,132,17,175,231,121,9,220,189,141,20,209,174,
  89,97,242,82,57,254,136,177,211,84,203,186,52,214,79,113,
  184,219,105,246,4,43,108,227,83,224,39,130,62,69,94,77,
  176,32,60,59,14,46,15,26,117,237,191,35,5,68,33,234,
  110,12,179,151,188,247,233,27,241,124,61,111,223,150,96,102,
  155,159,98,157,78,122,30,207,171,161,72,47,115,152,239,213,
  222,183,248,70,210,137,106,135,200,75,92,114,144,37,143,86,
  107,100,63,228,131,18,169,243,208,13,71,8,1,172,198,88,
  123,93,162,67,65,118,147,129,40,126,112,230,24,229,145,50,
  138,51,194,36,41,202,170,125,48,45,197,148,85,154,58,81,
  104,146,193,165,232,212,166,73,181,116,21,55,167,109,66,74,
  0,134,49,180,238,128,252,199,140,255,204,91,38,195,95,251,
  42,218,236,244,76,16,101,133,216,90,153,34,7,168,225,164
];

// S-Box Options untuk UI
export const SBOX_OPTIONS = [
  { id: 4, name: 'S-Box 4', sbox: SBOX1, description: 'Custom S-Box variant 4' },
  { id: 44, name: 'S-Box 44', sbox: SBOX2, description: 'Custom S-Box variant 44' },
  { id: 81, name: 'S-Box 81', sbox: SBOX3, description: 'Custom S-Box variant 81' },
  { id: 111, name: 'S-Box 111', sbox: SBOX4, description: 'Custom S-Box variant 111' },
  { id: 128, name: 'S-Box 128', sbox: SBOX5, description: 'Custom S-Box variant 128' },
];

// Function to get S-Box by ID
export function getSboxById(id) {
  const option = SBOX_OPTIONS.find(opt => opt.id === id);
  return option ? option.sbox : SBOX1; // default to SBOX1 if not found
}

// Function to create inverse S-Box from any S-Box
export function createInverseSbox(sbox) {
  const inv = new Array(256).fill(0);
  for (let i = 0; i < 256; i++) {
    inv[sbox[i]] = i;
  }
  return inv;
}

// ========== AES ALGORITHM IMPLEMENTATION ==========

// src/cryptoAlgorithm/aesCustom.js

// ... (Bagian SBOX1 sampai SBOX5 dan SBOX_OPTIONS TETAP SAMA, Jangan dihapus) ...
// ... (Pastikan SBOX_OPTIONS diletakkan di sini seperti kode asli Anda) ...
// ... (Fungsi getSboxById, createInverseSbox TETAP SAMA) ...

// =======================================================
// CATATAN: Copy bagian di bawah ini menggantikan logika 
// AES lama mulai dari RCON sampai baris terakhir file.
// =======================================================

const RCON = [
  0x00, 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1B, 0x36
];

function xtime_clear(a) {
  return (a & 0x80) ? (((a << 1) ^ 0x1B) & 0xFF) : ((a << 1) & 0xFF);
}

function gf_mul(a, b) {
  let res = 0;
  while (b) {
    if (b & 1) res ^= a;
    a = xtime_clear(a);
    b >>= 1;
  }
  return res & 0xFF;
}

// Key expansion
function subWord(word, sbox) {
  return word.map(b => sbox[b]);
}

function rotWord(word) {
  return word.slice(1).concat(word.slice(0,1));
}

export function keyExpansion(keyBytes, sbox) {
  if (!(keyBytes instanceof Uint8Array)) keyBytes = new Uint8Array(keyBytes);
  const Nk = 4, Nr = 10, Nb = 4;
  const w = [];
  
  for (let i = 0; i < 16; i += 4) {
    w.push([keyBytes[i], keyBytes[i+1], keyBytes[i+2], keyBytes[i+3]]);
  }
  
  for (let i = Nk; i < Nb*(Nr+1); i++) {
    let temp = w[i-1].slice();
    if (i % Nk === 0) {
      temp = subWord(rotWord(temp), sbox);
      temp[0] ^= RCON[i / Nk];
    }
    const wi = [];
    for (let j = 0; j < 4; j++) {
      wi.push((w[i-Nk][j] ^ temp[j]) & 0xFF);
    }
    w.push(wi);
  }
  
  const roundKeys = [];
  for (let r = 0; r <= Nr; r++) {
    const rk = [];
    for (let c = 0; c < 4; c++) {
      rk.push(...w[4*r + c]);
    }
    roundKeys.push(rk);
  }
  return roundKeys;
}

// AES Core Operations
function addRoundKey(state, rk) {
  for (let i = 0; i < 16; i++) state[i] ^= rk[i];
}

function subBytes(state, sbox) {
  for (let i = 0; i < 16; i++) state[i] = sbox[state[i]];
}

function invSubBytes(state, invSbox) {
  for (let i = 0; i < 16; i++) state[i] = invSbox[state[i]];
}

function shiftRows(state) {
  const tmp = state.slice();
  state[1] = tmp[5]; state[5] = tmp[9]; state[9] = tmp[13]; state[13] = tmp[1];
  state[2] = tmp[10]; state[6] = tmp[14]; state[10] = tmp[2]; state[14] = tmp[6];
  state[3] = tmp[15]; state[7] = tmp[3]; state[11] = tmp[7]; state[15] = tmp[11];
}

function invShiftRows(state) {
  const tmp = state.slice();
  state[1] = tmp[13]; state[5] = tmp[1]; state[9] = tmp[5]; state[13] = tmp[9];
  state[2] = tmp[10]; state[6] = tmp[14]; state[10] = tmp[2]; state[14] = tmp[6];
  state[3] = tmp[7]; state[7] = tmp[11]; state[11] = tmp[15]; state[15] = tmp[3];
}

function mix_single_column(a) {
  const t = a[0] ^ a[1] ^ a[2] ^ a[3];
  const u = a[0];
  a[0] ^= t ^ gf_mul(a[0] ^ a[1], 0x02);
  a[1] ^= t ^ gf_mul(a[1] ^ a[2], 0x02);
  a[2] ^= t ^ gf_mul(a[2] ^ a[3], 0x02);
  a[3] ^= t ^ gf_mul(a[3] ^ u, 0x02);
}

function mixColumns(state) {
  for (let c = 0; c < 4; c++) {
    const col = [state[4*c + 0], state[4*c + 1], state[4*c + 2], state[4*c + 3]];
    mix_single_column(col);
    for (let r = 0; r < 4; r++) state[4*c + r] = col[r] & 0xFF;
  }
}

function invMixColumns(state) {
  for (let c = 0; c < 4; c++) {
    const s0 = state[4*c + 0], s1 = state[4*c + 1], s2 = state[4*c + 2], s3 = state[4*c + 3];
    state[4*c + 0] = (gf_mul(s0,0x0e) ^ gf_mul(s1,0x0b) ^ gf_mul(s2,0x0d) ^ gf_mul(s3,0x09)) & 0xFF;
    state[4*c + 1] = (gf_mul(s0,0x09) ^ gf_mul(s1,0x0e) ^ gf_mul(s2,0x0b) ^ gf_mul(s3,0x0d)) & 0xFF;
    state[4*c + 2] = (gf_mul(s0,0x0d) ^ gf_mul(s1,0x09) ^ gf_mul(s2,0x0e) ^ gf_mul(s3,0x0b)) & 0xFF;
    state[4*c + 3] = (gf_mul(s0,0x0b) ^ gf_mul(s1,0x0d) ^ gf_mul(s2,0x09) ^ gf_mul(s3,0x0e)) & 0xFF;
  }
}

// Block functions
export function aesEncryptBlock(plaintext16, roundKeys, sbox) {
  const state = Array.from(plaintext16);
  addRoundKey(state, roundKeys[0]);
  for (let rnd = 1; rnd <= 9; rnd++) {
    subBytes(state, sbox); shiftRows(state); mixColumns(state); addRoundKey(state, roundKeys[rnd]);
  }
  subBytes(state, sbox); shiftRows(state); addRoundKey(state, roundKeys[10]);
  return Uint8Array.from(state);
}

export function aesDecryptBlock(cipher16, roundKeys, invSbox) {
  const state = Array.from(cipher16);
  addRoundKey(state, roundKeys[10]);
  for (let rnd = 9; rnd >= 1; rnd--) {
    invShiftRows(state); invSubBytes(state, invSbox); addRoundKey(state, roundKeys[rnd]); invMixColumns(state);
  }
  invShiftRows(state); invSubBytes(state, invSbox); addRoundKey(state, roundKeys[0]);
  return Uint8Array.from(state);
}

// PKCS#7 Padding
export function pkcs7Pad(data) {
  const padLen = 16 - (data.length % 16);
  const out = new Uint8Array(data.length + padLen);
  out.set(data, 0);
  out.fill(padLen, data.length);
  return out;
}

export function pkcs7Unpad(data) {
  if (data.length === 0) return data;
  const pad = data[data.length - 1];
  if (pad < 1 || pad > 16) return data; // Return as is if invalid padding
  return data.slice(0, data.length - pad);
}

// ==========================================
// MODIFIKASI: MODE CBC (Cipher Block Chaining)
// ==========================================

// Enkripsi CBC: Menambahkan IV acak di depan
export function aesCbcEncrypt(dataBytes, keyBytes, sbox) {
  const rk = keyExpansion(keyBytes, sbox);
  const dataP = pkcs7Pad(dataBytes);
  
  // 1. Generate IV Acak (16 bytes)
  const iv = crypto.getRandomValues(new Uint8Array(16));
  
  // Output buffer: [IV (16 bytes)] + [Ciphertext]
  const out = new Uint8Array(16 + dataP.length);
  out.set(iv, 0); 
  
  let previousBlock = iv; // Blok XOR awal adalah IV

  for (let i = 0; i < dataP.length; i += 16) {
    const blk = dataP.slice(i, i+16);
    
    // XOR dengan blok sebelumnya (DIFUSI)
    for(let j=0; j<16; j++) {
        blk[j] ^= previousBlock[j];
    }
    
    // Encrypt
    const c = aesEncryptBlock(blk, rk, sbox);
    
    // Simpan hasil
    out.set(c, i + 16);
    
    // Update previousBlock untuk iterasi berikutnya
    previousBlock = c;
  }
  
  return out;
}

// Dekripsi CBC: Membaca IV dari 16 byte pertama
export function aesCbcDecrypt(dataBytes, keyBytes, sbox) {
  const invSbox = createInverseSbox(sbox);
  const rk = keyExpansion(keyBytes, sbox);
  
  // Ambil IV
  const iv = dataBytes.slice(0, 16);
  const cipherText = dataBytes.slice(16);
  
  const out = new Uint8Array(cipherText.length);
  let previousBlock = iv;

  for (let i = 0; i < cipherText.length; i += 16) {
    const blk = cipherText.slice(i, i+16); // Cipher block saat ini
    
    // Decrypt
    const p = aesDecryptBlock(blk, rk, invSbox);
    
    // XOR dengan blok sebelumnya
    for(let j=0; j<16; j++) {
        p[j] ^= previousBlock[j];
    }
    
    out.set(p, i);
    
    // Simpan cipher block ini sebagai pengacak blok berikutnya
    previousBlock = blk;
  }
  
  return pkcs7Unpad(out);
}

// Helpers
export function strToBytes(str) { return new TextEncoder().encode(str); }
export function bytesToStr(bytes) { return new TextDecoder().decode(bytes); }
export function hexToBytes(hex) {
  if (hex.length % 2) throw new Error("Invalid hex");
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) out[i/2] = parseInt(hex.substr(i,2), 16);
  return out;
}
export function bytesToHex(bytes) {
  return Array.from(bytes).map(b => b.toString(16).padStart(2,'0')).join('');
}

// ==========================================
// HIGH LEVEL APIs (Updated to use CBC)
// ==========================================

export function encryptTextToHex(plaintext, keyHex, sboxId = 1) {
  const sbox = getSboxById(sboxId);
  const key = hexToBytes(keyHex);
  const ptBytes = strToBytes(plaintext);
  // Ganti aesEcbEncrypt -> aesCbcEncrypt
  const ctBytes = aesCbcEncrypt(ptBytes, key, sbox);
  return bytesToHex(ctBytes);
}

export function decryptHexToText(cipherHex, keyHex, sboxId = 1) {
  const sbox = getSboxById(sboxId);
  const key = hexToBytes(keyHex);
  const ctBytes = hexToBytes(cipherHex);
  // Ganti aesEcbDecrypt -> aesCbcDecrypt
  const ptBytes = aesCbcDecrypt(ctBytes, key, sbox);
  return bytesToStr(ptBytes);
}

export function getSboxInfo(id) {
  return SBOX_OPTIONS.find(opt => opt.id === id) || SBOX_OPTIONS[0];
}

// IMAGE FUNCTIONS (Updated to use CBC)

export async function encryptImageWithMetadata(imageFile, keyHex, sboxId = 1) {
  const sbox = getSboxById(sboxId);
  const key = hexToBytes(keyHex);
  
  const arrayBuffer = await imageFile.arrayBuffer();
  const imageBytes = new Uint8Array(arrayBuffer);
  
  const metadata = {
    originalName: imageFile.name,
    originalType: imageFile.type,
    originalSize: imageFile.size,
    sboxId: sboxId
  };
  
  const metadataString = JSON.stringify(metadata);
  const metadataBytes = strToBytes(metadataString);
  const metadataLength = metadataBytes.length;
  
  const metadataLengthBytes = new Uint8Array(4);
  new DataView(metadataLengthBytes.buffer).setUint32(0, metadataLength, false);
  
  // GUNAKAN CBC UNTUK ENKRIPSI GAMBAR
  const encryptedImageBytes = aesCbcEncrypt(imageBytes, key, sbox);
  
  const totalLength = 4 + metadataLength + encryptedImageBytes.length;
  const combinedData = new Uint8Array(totalLength);
  combinedData.set(metadataLengthBytes, 0);
  combinedData.set(metadataBytes, 4);
  combinedData.set(encryptedImageBytes, 4 + metadataLength);
  
  return { encryptedData: combinedData, metadata: metadata };
}

export async function decryptImageWithMetadata(encryptedData, keyHex, sboxId = 1) {
  const sbox = getSboxById(sboxId);
  const key = hexToBytes(keyHex);
  
  const metadataLength = new DataView(encryptedData.buffer).getUint32(0, false);
  const metadataBytes = encryptedData.slice(4, 4 + metadataLength);
  const metadataString = bytesToStr(metadataBytes);
  const metadata = JSON.parse(metadataString);
  
  const encryptedImageBytes = encryptedData.slice(4 + metadataLength);
  
  // GUNAKAN CBC UNTUK DEKRIPSI GAMBAR
  const decryptedBytes = aesCbcDecrypt(encryptedImageBytes, key, sbox);
  
  return { decryptedBytes: decryptedBytes, metadata: metadata };
}