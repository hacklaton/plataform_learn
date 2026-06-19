import { z } from 'zod';

export const submitContextSchema = z.object({
  profesor: z.string().min(1, 'El profesor es requerido'),
  asignatura: z.string().min(1, 'La asignatura es requerida'),
  curso: z.string().min(1, 'El curso es requerido'),
  contexto: z.string().min(1, 'El contexto es requerido'),
  objetivos: z.array(z.string().min(1)).min(1, 'Debe indicar al menos un objetivo'),
});

export const updateTopicStatusSchema = z.object({
  estado: z.enum(['SUGERIDO', 'SELECCIONADO', 'DESCARTADO']),
});
