import Dexie, {type Table } from 'dexie';

export interface Tema {
    id?: number;
    titulo: string;
    notas?: string;
    ultimoEstudio?: Date;
    esFavorito?: boolean;
}

export interface Sesion {
    id?: number;
    temaId?: number;
    fecha: Date;
    duracionMinutos: number;
    tipo?: 'estudio' | 'practico';
    tituloPractico?: string;
}

export interface Ajustes {
    id?: number;
    diasParaRojo: number;
    fechaExamen: number;
    horasObjetivo: number;
    frecuenciaPracticos: number; // Cada cuántos días se hace un caso práctico
    diasSemana: number;
    totalTemas: number;
    horaNotificacion?: string;
}

export class OpoDatabase extends Dexie {
    temas!: Table<Tema>;
    sesiones!: Table<Sesion>;
    ajustes!: Table<Ajustes>;

    constructor() {
        super('OpoPlanDB');
        this.version(2).stores({
            temas: '++id, titulo, ultimoEstudio, esFavorito',
            sesiones: '++id, temaId, fecha, tipo',
            ajustes: '++id'
        });
    }
}

export const db = new OpoDatabase();