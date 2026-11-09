import Dexie, { type Table } from 'dexie'

export interface Tema {
    id?: number
    numero: number
    titulo: string
    notas: string
    ultimoEstudio: number | null // null = gris (sin empezar)
}

export interface Sesion {
    id?: number
    temaId: number
    fecha: number
    minutos: number
}

export interface Ajustes {
    id: number
    fechaExamen: number
    diasSemana: number
    casosPracticosCadaDias: number
    horaRecordatorio: string
    diasParaRojo: number // 90 por defecto
}

class AppDB extends Dexie {
    temas!: Table<Tema, number>
    sesiones!: Table<Sesion, number>
    ajustes!: Table<Ajustes, number>

    constructor() {
        super('app-estudio')
        this.version(1).stores({
            temas: '++id, numero',
            sesiones: '++id, temaId, fecha',
            ajustes: 'id',
        })
    }
}

export const db = new AppDB()