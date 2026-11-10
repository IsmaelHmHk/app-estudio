import type {Tema} from '../data/db';

export const DIA = 1000 * 60 * 60 * 24;

export const progresoColor = (dias: number | null, maxDias: number = 14): string => {
    if (dias === null) return '#8b3246'; // Sin estudiar
    const porcentaje = Math.min(100, Math.round((dias / maxDias) * 100));
    if (porcentaje >= 85 || dias >= maxDias) return '#8b3246'; // Repasado hace tiempo
    if (porcentaje >= 50) return '#ff9800'; // Por repasar
    return '#3b9a9c'; // Al día
};

export const calcularEstadoTema = (t: Tema, maxDias: number = 14) => {
    if (!t.ultimoEstudio) return { dias: null, porcentaje: 100, color: '#8b3246' };

    const hoy = new Date().getTime();
    const ultimo = new Date(t.ultimoEstudio).getTime();
    const dias = Math.max(0, Math.floor((hoy - ultimo) / DIA));
    const porcentaje = Math.min(100, Math.round((dias / maxDias) * 100));
    const color = progresoColor(dias, maxDias);

    return { dias, porcentaje, color };
};

export const obtenerSiguienteTema = (temas: Tema[]) => {
    if (!temas || temas.length === 0) return null;

    const sinEstudiar = temas.filter(t => !t.ultimoEstudio);
    if (sinEstudiar.length > 0) {
        return sinEstudiar.sort((a, b) => (a.numero || 0) - (b.numero || 0))[0];
    }

    return temas.sort((a, b) => {
        const timeA = a.ultimoEstudio ? new Date(a.ultimoEstudio).getTime() : 0;
        const timeB = b.ultimoEstudio ? new Date(b.ultimoEstudio).getTime() : 0;
        return timeA - timeB;
    })[0];
};