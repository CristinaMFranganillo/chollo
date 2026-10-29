import { Capacitor, PluginListenerHandle, registerPlugin } from '@capacitor/core';
import { Aviso } from './models';

/**
 * Puente con el plugin nativo "Vigilante" (android/app/src/main/java/com/cristina/chollos/VigilantePlugin.java).
 *
 * El servicio Android escucha las notificaciones de Vinted y Wallapop aunque la app esté cerrada,
 * hace un filtro rápido con Gemini (solo texto) y, si parece un chollo, lanza su propio aviso.
 * Desde aquí solo lo configuramos y leemos los avisos que ha guardado.
 */
export interface VigilantePlugin {
  configurar(opciones: { apiKey: string; modelo: string; activo: boolean }): Promise<void>;
  estado(): Promise<{ permisoLectura: boolean; permisoAvisos: boolean; activo: boolean }>;
  abrirPermisoLectura(): Promise<void>;
  pedirPermisoAvisos(): Promise<{ concedido: boolean }>;
  obtenerAvisos(): Promise<{ avisos: Aviso[] }>;
  borrarAvisos(): Promise<void>;
  /** Id del aviso con el que se abrió la app desde una notificación (o null). */
  avisoPendiente(): Promise<{ id: string | null }>;
  addListener(evento: 'nuevoAviso', fn: (aviso: Aviso) => void): Promise<PluginListenerHandle>;
  addListener(evento: 'avisoAbierto', fn: (datos: { id: string }) => void): Promise<PluginListenerHandle>;
}

export const Vigilante = registerPlugin<VigilantePlugin>('Vigilante');

/** El vigilante solo existe en la app Android, no en la versión web. */
export const vigilanteDisponible = (): boolean =>
  Capacitor.getPlatform() === 'android' && Capacitor.isPluginAvailable('Vigilante');
