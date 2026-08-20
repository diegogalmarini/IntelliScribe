import { lazy, ComponentType } from 'react';

const RELOAD_FLAG = 'diktalo_chunk_reloaded';

const readFlag = (): boolean => {
    try {
        return sessionStorage.getItem(RELOAD_FLAG) === '1';
    } catch {
        // Modo privado o almacenamiento bloqueado: sin marca no se puede
        // garantizar que no haya bucle, asi que se prefiere no recargar.
        return true;
    }
};

const writeFlag = (value: boolean) => {
    try {
        if (value) sessionStorage.setItem(RELOAD_FLAG, '1');
        else sessionStorage.removeItem(RELOAD_FLAG);
    } catch {
        // Sin almacenamiento el reintento se degrada a "no recargar".
    }
};

/**
 * `React.lazy` con recuperacion ante un chunk que ya no existe.
 *
 * Cada despliegue genera ficheros con un hash nuevo y retira los del anterior.
 * Una pestaña que lleva abierta desde antes del despliegue conserva el
 * index.html viejo, y al navegar pide un chunk que ya no esta. El import
 * diferido falla y la pantalla se queda en blanco.
 *
 * En Sentry esto aparecia como `Failed to fetch dynamically imported module`.
 * Ademas era invisible en las comprobaciones manuales: la regla comodin de
 * vercel.json devolvia index.html con codigo 200 en vez de un 404, asi que el
 * navegador recibia HTML y reventaba al parsearlo como modulo. Esa parte se
 * corrige en vercel.json; esta recupera al usuario que ya lo esta sufriendo.
 *
 * Se recarga UNA sola vez por sesion: si tras recargar sigue fallando, el
 * problema no es un chunk caducado y el error debe llegar a Sentry.
 */
export function lazyWithReload<T extends ComponentType<any>>(
    factory: () => Promise<{ default: T }>
) {
    return lazy(async () => {
        try {
            const mod = await factory();
            writeFlag(false);
            return mod;
        } catch (error) {
            if (readFlag()) throw error;
            writeFlag(true);
            window.location.reload();
            // La recarga no es instantanea. Devolver una promesa que nunca
            // resuelve evita que React pinte el fallback de error durante el
            // parpadeo previo a la recarga.
            return new Promise<{ default: T }>(() => { });
        }
    });
}
