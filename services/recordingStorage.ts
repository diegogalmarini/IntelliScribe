import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'diktalo_recordings';
const STORE_NAME = 'active_chunks';
const DB_VERSION = 1;

interface RecordingChunk {
    id: string; // recording session id
    chunkIndex: number;
    data: Blob;
    timestamp: number;
}

let dbPromise: Promise<IDBPDatabase> | null = null;

const getDB = () => {
    if (!dbPromise) {
        dbPromise = openDB(DB_NAME, DB_VERSION, {
            upgrade(db) {
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    const store = db.createObjectStore(STORE_NAME, { keyPath: ['id', 'chunkIndex'] });
                    store.createIndex('by_recording', 'id');
                }
            },
        });
    }
    return dbPromise;
};

export const recordingStorage = {
    async saveChunk(recordingId: string, chunkIndex: number, data: Blob) {
        const db = await getDB();
        await db.put(STORE_NAME, {
            id: recordingId,
            chunkIndex,
            data,
            timestamp: Date.now()
        });
    },

    async getAllChunks(recordingId: string): Promise<Blob[]> {
        const db = await getDB();
        const chunks = await db.getAllFromIndex(STORE_NAME, 'by_recording', recordingId);
        return chunks
            .sort((a, b) => a.chunkIndex - b.chunkIndex)
            .map(c => c.data);
    },

    async clearRecording(recordingId: string) {
        const db = await getDB();
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const index = tx.store.index('by_recording');
        let cursor = await index.openCursor(IDBKeyRange.only(recordingId));
        while (cursor) {
            await cursor.delete();
            cursor = await cursor.continue();
        }
        await tx.done;
    },

    async getUnfinishedRecordings(): Promise<string[]> {
        const db = await getDB();
        const keys = await db.getAllKeys(STORE_NAME);
        const ids = new Set<string>();
        // @ts-ignore - keys are [id, index]
        keys.forEach(key => ids.add(key[0]));
        return Array.from(ids);
    }
};
