// src/services/sboxService.js

const getHammingWeight = (n) => {
    let count = 0;
    let temp = n;
    while (temp > 0) {
        temp &= (temp - 1);
        count++;
    }
    return count;
};

const fwht = (a) => {
    let res = [...a];
    let n = res.length;
    for (let h = 1; h < n; h <<= 1) {
        for (let i = 0; i < n; i += (h << 1)) {
            for (let j = i; j < i + h; j++) {
                let x = res[j];
                let y = res[j + h];
                res[j] = x + y;
                res[j + h] = x - y;
            }
        }
    }
    return res;
};

export const runSboxAnalysis = (sbox) => {
    const results = {
        nonlinearity: [],
        sac: [],
        bicNl: [],
        bicSac: [],
    };

    // 1. Nonlinearity
    for (let bit = 0; bit < 8; bit++) {
        let f = [];
        for (let x = 0; x < 256; x++) {
            f.push(((sbox[x] >> bit) & 1) === 0 ? 1 : -1);
        }
        let wht = fwht(f);
        let maxWht = Math.max(...wht.map(Math.abs));
        results.nonlinearity.push((256 - maxWht) / 2);
    }

    // 2. SAC (Strict Avalanche Criterion)
    for (let i = 0; i < 8; i++) {
        let totalBitChanges = 0;
        for (let x = 0; x < 256; x++) {
            let diff = sbox[x] ^ sbox[x ^ (1 << i)];
            totalBitChanges += getHammingWeight(diff);
        }
        results.sac.push(totalBitChanges / (256 * 8));
    }

    // 3. BIC-NL (Bit Independence Criterion - Nonlinearity)
    for (let i = 0; i < 8; i++) {
        for (let j = i + 1; j < 8; j++) {
            let f = [];
            for (let x = 0; x < 256; x++) {
                let b1 = (sbox[x] >> i) & 1;
                let b2 = (sbox[x] >> j) & 1;
                f.push((b1 ^ b2) === 0 ? 1 : -1);
            }
            let wht = fwht(f);
            let maxWht = Math.max(...wht.map(Math.abs));
            results.bicNl.push((256 - maxWht) / 2);
        }
    }

    // 4. BIC-SAC
    for (let inBit = 0; inBit < 8; inBit++) {
        let flip = 1 << inBit;
        for (let out1 = 0; out1 < 8; out1++) {
            for (let out2 = out1 + 1; out2 < 8; out2++) {
                let count = 0;
                for (let x = 0; x < 256; x++) {
                    let y1 = sbox[x];
                    let y2 = sbox[x ^ flip];
                    let d1 = ((y1 >> out1) & 1) ^ ((y2 >> out1) & 1);
                    let d2 = ((y1 >> out2) & 1) ^ ((y2 >> out2) & 1);
                    count += (d1 ^ d2);
                }
                results.bicSac.push(count / 256);
            }
        }
    }

    // 5. LAP (Linear Approximation Probability)
    let maxBias = 0;
    for (let a = 1; a < 256; a++) {
        for (let b = 1; b < 256; b++) {
            let matches = 0;
            for (let x = 0; x < 256; x++) {
                if ((getHammingWeight(x & a) % 2) === (getHammingWeight(sbox[x] & b) % 2)) matches++;
            }
            maxBias = Math.max(maxBias, Math.abs(matches - 128));
        }
    }
    const lap = (128 + maxBias) / 256;

    // 6. DAP (Differential Approximation Probability)
    let maxDiffCount = 0;
    for (let dx = 1; dx < 256; dx++) {
        let counts = new Array(256).fill(0);
        for (let x = 0; x < 256; x++) {
            counts[sbox[x] ^ sbox[x ^ dx]]++;
        }
        maxDiffCount = Math.max(maxDiffCount, Math.max(...counts));
    }
    const dap = maxDiffCount / 256;

    // 7. Algebraic Degree (AD)
    let maxDeg = 0;
    for (let bit = 0; bit < 8; bit++) {
        let truthTable = [];
        for (let x = 0; x < 256; x++) truthTable.push((sbox[x] >> bit) & 1);
        let deg = 0;
        for (let mask = 1; mask < 256; mask++) {
            let sum = 0;
            for (let x = 0; x < 256; x++) {
                if ((getHammingWeight(x & mask) % 2) === 0) sum ^= truthTable[x];
            }
            if (sum !== 0) deg = Math.max(deg, getHammingWeight(mask));
        }
        maxDeg = Math.max(maxDeg, deg);
    }

    // 8. Transparency Order (TO)
    let maxTO = 0;
    for (let a = 0; a < 256; a++) {
        let rowSum = 0;
        for (let x = 0; x < 256; x++) {
            rowSum += Math.pow(-1, getHammingWeight(sbox[x] ^ sbox[x ^ a]));
        }
        maxTO = Math.max(maxTO, Math.abs(rowSum));
    }
    const to = maxTO / 256;

    return {
        nonLinearity: Math.min(...results.nonlinearity),
        sac: results.sac.reduce((a, b) => a + b, 0) / results.sac.length,
        bicNl: results.bicNl.reduce((a, b) => a + b, 0) / results.bicNl.length,
        bicSac: results.bicSac.reduce((a, b) => a + b, 0) / results.bicSac.length,
        lap: lap,
        dap: dap,
        ad: maxDeg,
        to: to,
        ci: 0 // Correlation Immunity biasanya memerlukan analisis Walsh mendalam per bit
    };
};