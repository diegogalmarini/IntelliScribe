// @ts-nocheck
/**
 * Centralized LameJS Polyfill
 * 
 * LameJS is a pure-JS port of LAME that relies heavily on global variables
 * for internal class references (e.g., Quantize.js expects BitStream and EQ to be global).
 * In modern module environments (Vite, Web Workers), these are not global by default.
 * 
 * This service deep-imports the necessary classes directly from the source and 
 * attaches them to the global scope.
 */

// Essential internal imports (LameJS doesn't export these in index.js)
import * as common from 'lamejs/src/js/common.js';
import * as MPEGModeMod from 'lamejs/src/js/MPEGMode.js';
import * as LameMod from 'lamejs/src/js/Lame.js';
import * as BitStreamMod from 'lamejs/src/js/BitStream.js';
import * as EncoderMod from 'lamejs/src/js/Encoder.js';
import * as QuantizeMod from 'lamejs/src/js/Quantize.js';
import * as QuantizePVTMod from 'lamejs/src/js/QuantizePVT.js';
import * as CBRNewIterationLoopMod from 'lamejs/src/js/CBRNewIterationLoop.js';
import * as LameInternalFlagsMod from 'lamejs/src/js/LameInternalFlags.js';
import * as LameGlobalFlagsMod from 'lamejs/src/js/LameGlobalFlags.js';
import * as TablesMod from 'lamejs/src/js/Tables.js';

// Helpers to extract the default (module.exports) for better interop
const getExport = (mod: any) => mod.default || mod;

const MPEGMode = getExport(MPEGModeMod);
const Lame = getExport(LameMod);
const BitStream = getExport(BitStreamMod);
const Encoder = getExport(EncoderMod);
const Quantize = getExport(QuantizeMod);
const QuantizePVT = getExport(QuantizePVTMod);
const CBRNewIterationLoop = getExport(CBRNewIterationLoopMod);
const LameInternalFlags = getExport(LameInternalFlagsMod);
const LameGlobalFlags = getExport(LameGlobalFlagsMod);
const Tables = getExport(TablesMod);
const VbrMode = common.VbrMode; // VbrMode is in common.js

export function setupLamePolyfill() {
    const global = typeof self !== 'undefined' ? self : (typeof window !== 'undefined' ? window : globalThis);

    if (global.__LAME_POLYFILLED__) return;

    // 1. Attach common utilities (new_float, new_int, Arrays, etc.)
    Object.keys(common).forEach(key => {
        if (!global[key]) {
            global[key] = common[key];
        }
    });

    // 2. Attach Core Classes
    global.MPEGMode = MPEGMode;
    global.Lame = Lame;
    global.BitStream = BitStream;
    global.Encoder = Encoder;
    global.Quantize = Quantize;
    global.QuantizePVT = QuantizePVT;
    global.CBRNewIterationLoop = CBRNewIterationLoop;
    global.LameInternalFlags = LameInternalFlags;
    global.LameGlobalFlags = LameGlobalFlags;
    global.Tables = Tables;
    global.VbrMode = VbrMode;

    // 3. Static helper methods often used directly as globals
    // BitStream.EQ and BitStream.NEQ are critical for Quantize.js
    if (!global.EQ) global.EQ = BitStream.EQ;
    if (!global.NEQ) global.NEQ = BitStream.NEQ;

    // 4. Ensure MPEGMode enum compatibility
    if (!global.MPEGMode.STEREO) {
        global.MPEGMode.STEREO = { ordinal: () => 0 };
        global.MPEGMode.JOINT_STEREO = { ordinal: () => 1 };
        global.MPEGMode.DUAL_CHANNEL = { ordinal: () => 2 };
        global.MPEGMode.MONO = { ordinal: () => 3 };
    }

    global.__LAME_POLYFILLED__ = true;
    console.log('[LamePolyfill] Exhaustive globals initialized');
}
