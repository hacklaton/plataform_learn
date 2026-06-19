import { redis } from './redis.js';

/**
 * Event bus hacia el ecosistema de agentes distribuidos (Python / FiftyOne).
 *
 * Usa Redis Pub/Sub como message broker ligero. Cada evento se publica en un
 * canal con nombre de dominio (ej: 'academico.nota_registrada') y un payload
 * JSON. Los agentes se suscriben a estos canales para reaccionar de forma
 * event-driven sin acoplarse al backend.
 *
 * Si en el futuro se migra a RabbitMQ / NATS, solo hay que reemplazar la
 * implementación de `publishEvent` manteniendo la misma firma.
 */

export const DOMAIN_EVENTS = {
  GRADE_REGISTERED: 'academico.nota_registrada',
  GRADE_UPDATED: 'academico.nota_actualizada',
  GRADE_DELETED: 'academico.nota_eliminada',
  STUDENT_CREATED: 'academico.alumno_creado',
  TEACHER_CREATED: 'academico.profesor_creado',
  COURSE_CREATED: 'academico.salon_creado',
} as const;

export type DomainEvent = (typeof DOMAIN_EVENTS)[keyof typeof DOMAIN_EVENTS];

export interface DomainEventEnvelope<T = unknown> {
  event: DomainEvent;
  emittedAt: string;
  source: 'plataform_learn_backend';
  payload: T;
}

/**
 * Publica un evento de dominio en el broker para que lo consuman los agentes.
 * Es "fire-and-forget": un fallo del broker no debe romper la operación
 * principal (registrar una nota, crear un alumno, etc.).
 */
export async function publishEvent<T>(event: DomainEvent, payload: T): Promise<void> {
  const envelope: DomainEventEnvelope<T> = {
    event,
    emittedAt: new Date().toISOString(),
    source: 'plataform_learn_backend',
    payload,
  };

  try {
    await redis.publish(event, JSON.stringify(envelope));
  } catch (error) {
    console.error(`[events] No se pudo publicar el evento "${event}":`, (error as Error).message);
  }
}
