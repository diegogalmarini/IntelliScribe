# Multi-Audio Transcription - Plan de Implementación

## ✅ Completado

### 1. Componente MultiAudioUploader
**Archivo:** `pages/intelligence/components/MultiAudioUploader.tsx`

**Funcionalidades:**
- ✅ Upload múltiple de archivos de audio
- ✅ Parser de nombres WhatsApp (`WhatsApp Ptt YYYY-MM-DD at HH.MM.SS.ogg`)
- ✅ Extracción de duración usando Audio API
- ✅ Ordenamiento automático por timestamp
- ✅ Reordenamiento manual (flechas arriba/abajo)
- ✅ Asignación de speakers con dropdown
- ✅ Speakers personalizados
- ✅ Vista previa con metadatos (fecha, hora, duración, tamaño)
- ✅ Validación (requiere speaker asignado para procesar)

---

## 🚧 Pendiente

### 2. Integración con IntelligenceDashboard
**Cambios necesarios:**

```typescript
// En IntelligenceDashboard.tsx

import { MultiAudioUploader } from './components/MultiAudioUploader';

// Añadir estado
const [showMultiAudioUploader, setShowMultiAudioUploader] = useState(false);

// Añadir handler
const handleProcessMultiAudio = async (files: AudioFileItem[]) => {
    // 1. Subir cada archivo a Supabase Storage
    // 2. Transcribir cada uno
    // 3. Combinar transcripciones en orden
    // 4. Crear recording unificado
    // 5. Abrir en InlineEditor
};

// En el render, añadir condicional
{showMultiAudioUploader ? (
    <MultiAudioUploader
        user={user}
        onProcess={handleProcessMultiAudio}
        onCancel={() => setShowMultiAudioUploader(false)}
    />
) : (
    // ... contenido existente
)}
```

### 3. Lógica de Procesamiento

**Pasos:**

1. **Upload a Storage**
   ```typescript
   for (const audioFile of files) {
       const path = `${user.id}/${Date.now()}_${audioFile.filename}`;
       await supabase.storage
           .from('recordings')
           .upload(path, audioFile.file);
   }
   ```

2. **Transcripción Individual**
   ```typescript
   const transcriptions = await Promise.all(
       files.map(async (audioFile) => {
           const result = await transcribeAudio(
               audioFile.file,
               'audio/ogg', // o detectar del file
               language,
               audioUrl
           );
           return {
               speaker: audioFile.assignedSpeaker,
               timestamp: audioFile.extractedDate,
               segments: result
           };
       })
   );
   ```

3. **Combinar Transcripciones**
   ```typescript
   const combinedSegments = [];
   let segmentId = 0;
   
   files.forEach((audioFile, fileIndex) => {
       const transcription = transcriptions[fileIndex];
       const baseTimestamp = audioFile.extractedDate;
       
       // Añadir separador de fecha/hora
       combinedSegments.push({
           id: `separator-${fileIndex}`,
           timestamp: formatTime(baseTimestamp),
           speaker: 'SYSTEM',
           text: `📅 ${formatDate(baseTimestamp)} - ${formatTime(baseTimestamp)}`,
           speakerColor: 'from-gray-400 to-gray-500'
       });
       
       // Añadir segmentos de este audio
       transcription.segments.forEach((segment) => {
           combinedSegments.push({
               id: `seg-${segmentId++}`,
               timestamp: segment.timestamp,
               speaker: audioFile.assignedSpeaker,
               text: segment.text,
               speakerColor: getSpeakerColor(audioFile.assignedSpeaker)
           });
       });
   });
   ```

4. **Crear Recording Unificado**
   ```typescript
   const recording = {
       id: uuidv4(),
       title: `Conversación WhatsApp - ${formatDate(files[0].extractedDate)}`,
       description: `${files.length} audios combinados`,
       date: new Date().toISOString(),
       duration: calculateTotalDuration(files),
       durationSeconds: calculateTotalDurationSeconds(files),
       status: 'Completed',
       tags: ['whatsapp', 'multi-audio'],
       segments: combinedSegments,
       notes: [],
       media: [],
       audioUrl: null // No hay un único audio, son múltiples
   };
   ```

### 4. UI Enhancements

**Opción 1: Botón en EmptyState**
```jsx
<button onClick={() => setShowMultiAudioUploader(true)}>
    📱 Conversación WhatsApp
</button>
```

**Opción 2: Item en menú de Upload**
```jsx
<div className="flex gap-2">
    <button onClick={() => fileInputRef.current?.click()}>
        Subir Audio
    </button>
    <button onClick={() => setShowMultiAudioUploader(true)}>
        Múltiples Audios (WhatsApp)
    </button>
</div>
```

### 5. Export Format

El resultado final en `InlineEditor` será:

```
📅 24 de diciembre, 2025 - 14:30

[00:00] Tú:
Hola, ¿cómo va el proyecto?

[00:12] Cliente:
Bien, te cuento los avances...

📅 29 de diciembre, 2025 - 14:45

[00:00] Cliente:
Siguiendo con lo que hablamos...

📅 30 de diciembre, 2025 - 01:36

[00:00] Tú:
¿Podemos hacer un cambio?
```

---

## 🎯 Testing con Archivos Reales

**Archivos de prueba en `/docs/audiostest/`:**

1. `WhatsApp Ptt 2025-12-24 at 14.30.10.ogg`
2. `WhatsApp Ptt 2025-12-29 at 14.45.07.ogg`
3. `WhatsApp Ptt 2025-12-30 at 01.36.02.ogg`
4. `WhatsApp Ptt 2025-12-30 at 09.37.40.ogg`
5. `WhatsApp Ptt 2025-12-30 at 13.19.37.ogg`
6. `WhatsApp Ptt 2025-12-30 at 13.21.48.ogg`

**Plan de Testing:**
1. Subir los 6 archivos
2. Verificar que parsea correctamente las fechas
3. Ordenar automáticamente
4. Asignar speakers (Tú / Cliente)
5. Procesar
6. Verificar transcripción unificada

---

## 📋 Próximos Pasos

1. **Integrar en Dashboard** (15 min)
2. **Implementar lógica de procesamiento** (30 min)
3. **Testing con archivos reales** (15 min)
4. **Refinamiento UI** (15 min)

**Total estimado:** ~1.5 horas para MVP funcional

---

## 💡 Mejoras Futuras

- [ ] Editar timestamp manualmente
- [ ] Preview de audio inline
- [ ] Detección automática de speaker por voz
- [ ] Export específico para WhatsApp conversations
- [ ] Importar directamente desde WhatsApp Web
- [ ] Soporte para video (.mp4)
- [ ] Merge automático de audios contiguos

---

**Estado:** Componente creado, listo para integración
**Última actualización:** 2 de enero, 2026
