export type Tab = 'inicio' | 'temas' | 'stats' | 'sugerencias' | 'ajustes';

export interface Tema {
    id?: number;
    titulo: string;
    notas?: string;
    ultimoEstudio?: Date;
}