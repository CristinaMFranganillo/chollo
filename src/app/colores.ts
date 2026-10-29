import { Nota } from './models';

const COLOR_NOTA: Record<Nota, string> = {
  CHOLLO: 'success',
  BUENO: 'primary',
  NEGOCIABLE: 'warning',
  DESCARTADO: 'medium',
};

/** Color de Ionic para cada nota. */
export const colorNota = (nota: Nota | null | undefined): string =>
  (nota && COLOR_NOTA[nota]) || 'medium';
