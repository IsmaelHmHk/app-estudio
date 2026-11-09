import type { Tema, Ajustes } from '../data/db'

export const DIA = 24 * 60 * 60 * 1000

// 0 = verde, 1 = rojo. null = gris (sin empezar)
export function progresoColor(t: Tema, hoy: number, ajustes: Ajustes): number | null {
    if (t.ultimoEstudio === null) return null
    const dias = (hoy - t.ultimoEstudio) / DIA
    return Math.min(Math.max(dias / ajustes.diasParaRojo, 0), 1)
}

// Hoy te toca: el primer tema gris
export function hoyToca(temas: Tema[]): Tema | undefined {
    return temas
        .filter(t => t.ultimoEstudio === null)
        .sort((a, b) => a.numero - b.numero)[0]
}

// Alternativa: el tema estudiado que más tiempo lleva sin tocarse
export function alternativa(temas: Tema[]): Tema | undefined {
    return temas
        .filter(t => t.ultimoEstudio !== null)
        .sort((a, b) => a.ultimoEstudio! - b.ultimoEstudio!)[0]
}
