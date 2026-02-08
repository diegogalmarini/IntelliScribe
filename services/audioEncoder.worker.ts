import * as lamejs from 'lamejs';

// Setup exhaustive lamejs globals if missing (critical for internal dependencies like BitStream, EQ, etc.)
if (typeof self !== 'undefined') {
    const l = lamejs as any;
    // Map all exports to global scope
    for (const key in l) {
        if (Object.prototype.hasOwnProperty.call(l, key)) {
            (self as any)[key] = l[key];
        }
    }
    // Ensure 'Lame' is specifically mapped to the module root if missing
    if (!(self as any).Lame) {
        (self as any).Lame = l.Lame || l;
    }
    // Fallback for MPEGMode if it's not in the exports
    if (!(self as any).MPEGMode) {
        (self as any).MPEGMode = {
            STEREO: 0,
            JOINT_STEREO: 1,
            DUAL_CHANNEL: 2,
            MONO: 3
        };
    }
}

let encoder: any = null;
let sampleRate = 0;
let channels = 0;
let kbps = 64;

self.onmessage = (e: MessageEvent) => {
    const { type, payload } = e.data;

    switch (type) {
        case 'INIT':
            sampleRate = payload.sampleRate;
            channels = payload.channels;
            kbps = payload.kbps || 64;
            // @ts-ignore
            encoder = new lamejs.Mp3Encoder(channels, sampleRate, kbps);
            break;

        case 'ENCODE':
            if (!encoder) return;
            const mp3Data: any[] = [];
            const { left, right } = payload;

            const leftInt16 = convertFloat32ToInt16(left);
            let mp3buf;

            if (channels === 2 && right) {
                const rightInt16 = convertFloat32ToInt16(right);
                mp3buf = encoder.encodeBuffer(leftInt16, rightInt16);
            } else {
                mp3buf = encoder.encodeBuffer(leftInt16);
            }

            if (mp3buf.length > 0) {
                // Return a transferrable or just the buffer
                self.postMessage({ type: 'CHUNK', payload: mp3buf });
            }
            break;

        case 'FINISH':
            if (encoder) {
                const finalBuf = encoder.flush();
                if (finalBuf.length > 0) {
                    self.postMessage({ type: 'CHUNK', payload: finalBuf });
                }
            }
            self.postMessage({ type: 'DONE' });
            break;
    }
};

function convertFloat32ToInt16(buffer: Float32Array): Int16Array {
    const l = buffer.length;
    const res = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        // Clamp and scale
        let s = Math.max(-1, Math.min(1, buffer[i]));
        res[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return res;
}
