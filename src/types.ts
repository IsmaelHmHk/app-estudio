export type Tab = 'inicio' | 'temas' | 'stats' | 'sugerencias' | 'ajustes';

export interface Tema {
    id?: number;
    titulo: string;
    notas?: string;
    ultimoEstudio?: Date;
    esFavorito?: boolean;
}
export interface Ajustes {
    id?: number;
    numTemas: number;
    fechaExamen: string;
    diasEstudioSemana: number;
    frecuenciaCasosPracticos: number; // Cada cuántos días
    horaRecordatorio: string; // Ej: "09:00"
    diasParaRojo: number; // Por defecto lo pondremos a 90
}