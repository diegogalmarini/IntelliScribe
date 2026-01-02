# 🎯 Multi-Audio WhatsApp Transcription - Guía de Implementación Final

## ✅ Progreso Actual

### Completado:
- ✅ `MultiAudioUploader.tsx` - Componente UI completo
- ✅ `audioConcat.ts` - Servicio de concatenación con MP3 compression
- ✅ Imports añadidos a `IntelligenceDashboard.tsx`
- ✅ `lamejs` instalado (`npm install lamejs`)

### Pendiente:
- 🚧 Añadir estado y handler en `IntelligenceDashboard`
- 🚧 Renderizar `MultiAudioUploader` condicionalmente
- 🚧 Añadir botón en `EmptyStateClean`
- 🚧 Testing con archivos reales

---

## 📝 Código a Añadir

### 1. Estado en IntelligenceDashboard (después de línea 64)

```typescript
// Multi-audio upload state
const [showMultiAudioUploader, setShowMultiAudioUploader] = useState(false);
const [isProcessingMultiAudio, setIsProcessingMultiAudio] = useState(false);
```

### 2. Handler de procesamiento (después de handleAction, ~línea 110)

```typescript
const handleProcessMultiAudio = async (files: any[]) => {
    try {
        setIsProcessingMultiAudio(true);
        
        // 1. Concatenate audios into single MP3
        const audioFiles = files.map(f => f.file);
        const { blob, segmentOffsets, totalDuration } = await concatenateAudios(audioFiles);
        
        // 2. Upload concatenated MP3 to Supabase
        const audioUrl = await uploadAudio(blob, user.id!);
        if (!audioUrl) throw new Error('Failed to upload audio');
        
        // 3. Get signed URL for transcription
        const signedUrl = await getSignedAudioUrl(audioUrl);
        if (!signedUrl) throw new Error('Failed to get signed URL');
        
        // 4. Transcribe each audio segment
        const allSegments: any[] = [];
        
        for (let i = 0; i < files.length; i++) {
            const audioFile = files[i];
            const offsetSeconds = segmentOffsets[i];
            
            // Transcribe this specific segment
            // (We transcribe the full audio but attribute segments to correct speaker)
            if (i === 0) {
                // Only transcribe once - the full concatenated audio
                const result = await transcribeAudio(undefined, 'audio/mp3', 'es', signedUrl);
                
                // Distribute segments to speakers based on time offsets
                result.forEach((seg, idx) => {
                    const segTime = timeToSeconds(seg.timestamp || '0:00');
                    
                    // Find which audio file this segment belongs to
                    let speakerIndex = 0;
                    for (let j = 0; j < segmentOffsets.length; j++) {
                        if (segTime >= segmentOffsets[j]) {
                            speakerIndex = j;
                        }
                    }
                    
                    allSegments.push({
                        id: `seg-${idx}`,
                        timestamp: seg.timestamp || '00:00',
                        speaker: files[speakerIndex].assignedSpeaker,
                        text: seg.text || '',
                        speakerColor: getSpeakerColor(files[speakerIndex].assignedSpeaker),
                        originalTimestamp: files[speakerIndex].extractedDate
                    });
                });
            }
        }
        
        // 5. Create recording
        const h = Math.floor(totalDuration / 3600).toString().padStart(2, '0');
        const m = Math.floor((totalDuration % 3600) / 60).toString().padStart(2, '0');
        const s = Math.floor(totalDuration % 60).toString().padStart(2, '0');
        
        const recording = {
            id: '',
            folderId: selectedFolderId === 'ALL' ? null : selectedFolderId,
            title: `WhatsApp - ${new Date(files[0].extractedDate).toLocaleDateString('es-ES')}`,
            description: `${files.length} audios de WhatsApp`,
            date: new Date().toISOString(),
            duration: `${h}:${m}:${s}`,
            durationSeconds: Math.floor(totalDuration),
            status: 'Completed' as const,
            tags: ['whatsapp', 'multi-audio'],
            participants: new Set(files.map(f => f.assignedSpeaker)).size,
            audioUrl,
            summary: null,
            segments: allSegments,
            notes: [],
            media: []
        };
        
        // 6. Save to database
        const createdRecording = await databaseService.createRecording(recording);
        if (!createdRecording) throw new Error('Failed to create recording');
        
        // 7. Update state and navigate
        setView('recordings');
        setShowMultiAudioUploader(false);
        setSelectedId(createdRecording.id);
        onSelectRecording(createdRecording.id);
        setIsEditorOpen(true); // Open InlineEditor
        
    } catch (error: any) {
        console.error('[Multi-Audio] Processing failed:', error);
        alert(`Error al procesar audios: ${error.message}`);
    } finally {
        setIsProcessingMultiAudio(false);
    }
};

// Helper to assign colors to speakers
const getSpeakerColor = (speaker: string): string => {
    const colors = [
        'from-blue-400 to-purple-500',
        'from-green-400 to-emerald-500',
        'from-orange-400 to-red-500',
        'from-pink-400 to-rose-500',
        'from-cyan-400 to-teal-500'
    ];
    
    // Hash speaker name to consistent color
    let hash = 0;
    for (let i = 0; i < speaker.length; i++) {
        hash = speaker.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};
```

### 3. Modificar EmptyStateClean.tsx

Añadir tercer botón para multi-audio:

```typescript
const actions = [
    {
        type: 'record' as const,
        icon: Mic,
        label: t('recordAudio') || 'Grabar Audio',
    },
    {
        type: 'upload' as const,
        icon: Upload,
        label: t('uploadFile') || 'Subir Archivo',
    },
    {
        type: 'whatsapp' as const,  // NUEVO
        icon: MessageSquare,         // NUEVO (importar de lucide-react)
        label: 'Conversación WhatsApp',  // NUEVO
    },
];
```

Luego en `handleAction` de IntelligenceDashboard:

```typescript
const handleAction = (type: 'record' | 'upload' | 'whatsapp') => {
    if (type === 'record') {
        setIsRecording(true);
        setSelectedId(null);
    }
    if (type === 'upload') {
        fileInputRef.current?.click();
    }
    if (type === 'whatsapp') {  // NUEVO
        setShowMultiAudioUploader(true);
    }
};
```

### 4. Renderizado condicional en IntelligenceDashboard

En el return, antes del contenido actual (línea ~372):

```typescript
{showMultiAudioUploader ? (
    <MultiAudioUploader
        user={user}
        onProcess={handleProcessMultiAudio}
        onCancel={() => setShowMultiAudioUploader(false)}
    />
) : view === 'subscription' ? (
    <SubscriptionView user={user} />
) : (
    // ... resto del contenido existente
)}
```

---

## 🎨 Flujo Completo

```
Usuario → [📱 Conversación WhatsApp]
   ↓
MultiAudioUploader abre
   ↓
Usuario selecciona 6 archivos .ogg
   ↓
Parser extrae timestamps de nombres
   ↓
Usuario asigna speakers (Tú, Cliente)
   ↓
Usuario ordena (auto o manual)
   ↓
Click [Procesar (6)]
   ↓
concatenateAudios(): 6 OGG → 1 MP3 (800KB)
   ↓
uploadAudio(): MP3 → Supabase Storage
   ↓
transcribeAudio(): MP3 → Gemini → Segments
   ↓
Distribuir segments a speakers by time offset
   ↓
createRecording(): BD con segments + metadatos
   ↓
InlineEditor abre con transcripción lista
   ↓
✅ Usuario puede reproducir, editar, exportar
```

---

## 🧪 Testing con Archivos Reales

**Archivos en:** `C:\Users\diego\Diktalo\docs\audiostest\`

1. `WhatsApp Ptt 2025-12-24 at 14.30.10.ogg`
2. `WhatsApp Ptt 2025-12-29 at 14.45.07.ogg`
3. `WhatsApp Ptt 2025-12-30 at 01.36.02.ogg`
4. `WhatsApp Ptt 2025-12-30 at 09.37.40.ogg`
5. `WhatsApp Ptt 2025-12-30 at 13.19.37.ogg`
6. `WhatsApp Ptt 2025-12-30 at 13.21.48.ogg`

**Plan de Prueba:**
1. ✅ Verificar que parsea fechas correctamente
2. ✅ Ordenar automáticamente por fecha
3. ✅ Asignar "Tú" a primeros 3 y "Cliente" a siguientes 3
4. ✅ Procesar
5. ✅ Verificar que MP3 concatenado pesa ~800KB (vs 3MB original)
6. ✅ Verificar que transcripción tiene speakers correctos
7. ✅ Verificar que timestamps son secuenciales

---

## 📊 Resultado Esperado

**Storage:**
- 1 archivo: `userId/1735830006000.mp3` (~800KB)

**Transcripción:**
```typescript
[
  {
    timestamp: "00:00",
    speaker: "Tú",
    text: "contenido audio 1...",
    originalTimestamp: "2025-12-24T14:30:10"
  },
  {
    timestamp: "00:45",
    speaker: "Cliente",
    text: "contenido audio 2...",
    originalTimestamp: "2025-12-29T14:45:07"
  },
  // ... más segmentos
]
```

**UI en InlineEditor:**
```
[🔊 Audio Player] ━━━━━━━●━━━━━━ 2:30 / 5:30

[24 Dic, 14:30] Tú 🟦
Hola, contenido del primer audio...

[29 Dic, 14:45] Cliente 🟩
Respuesta del cliente...

[30 Dic, 01:36] Tú 🟦
Continuación...
```

---

## ⚡ Próximos Pasos

1. ✅ Completar integración en `IntelligenceDashboard`
2. ✅ Añadir botón en `EmptyStateClean`
3. ✅ Testing funcional con archivos reales
4. ✅ Ajustar UI según feedback
5. ✅ Deploy a producción

---

**Última actualización:** 2 de enero, 2026  
**Estado:** Listo para integración final (código completo arriba)
