import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../data/db';
import { hoyToca, alternativa } from '../logic/estudio';
import type { Tema } from '../types';

interface InicioProps {
    onSelectTema: (temaId: number) => void;
}

export const Inicio: React.FC<InicioProps> = ({ onSelectTema }) => {
    const temas = useLiveQuery(() => db.temas.toArray());
    const ajustes = useLiveQuery(() => db.ajustes.toCollection().first());

    if (!temas || !ajustes) {
        return <div style={{ padding: '16px' }}>Cargando tu progreso...</div>;
    }

    // 1. Saludo según la hora
    const hora = new Date().getHours();
    const saludo = hora < 12 ? 'Buenos días' : hora < 20 ? 'Buenas tardes' : 'Buenas noches';

    // 2. Cálculo de días para el examen (si hay fecha)
    let diasExamen: number | null = null;
    if (ajustes.fechaExamen) {
        const diffTime = Math.abs(new Date(ajustes.fechaExamen).getTime() - new Date().getTime());
        diasExamen = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // 3. Usamos tus funciones de lógica (OJO: verifica que los parámetros coinciden con tu estudio.ts)
    // Si tus funciones piden (temas, ajustes), pásaselos. Yo asumo que piden al menos (temas).
    const temaPrincipal = hoyToca(temas as any) as Tema | undefined;
    const temaAlternativo = alternativa(temas as any) as Tema | undefined;

    return (
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Cabecera */}
            <div>
                <h1 style={{ margin: '0 0 8px 0', fontSize: '1.8rem' }}>¡{saludo}! 👋</h1>
                {diasExamen !== null && (
                    <p style={{ margin: 0, color: '#ff9800', fontWeight: 'bold' }}>
                        ⏳ Faltan {diasExamen} días para el examen. ¡A por todas!
                    </p>
                )}
            </div>

            {/* Tema Principal */}
            {temaPrincipal ? (
                <div style={{ backgroundColor: '#2a2a2a', padding: '16px', borderRadius: '12px', border: '1px solid #444' }}>
                    <h2 style={{ margin: '0 0 12px 0', fontSize: '1.2rem', color: '#4caf50' }}>🎯 Hoy te toca</h2>
                    <h3 style={{ margin: '0 0 8px 0' }}>{temaPrincipal.titulo}</h3>
                    <p style={{ margin: '0 0 16px 0', fontSize: '0.9rem', color: '#aaa' }}>
                        Es el siguiente en la lista sin empezar.
                    </p>
                    <button
                        onClick={() => temaPrincipal.id && onSelectTema(temaPrincipal.id)}
                        style={{ width: '100%', padding: '12px', backgroundColor: '#4caf50', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        Estudiar este tema
                    </button>
                </div>
            ) : (
                <p style={{ color: '#aaa' }}>¡No hay temas pendientes! Eres una máquina.</p>
            )}

            {/* Tema Alternativo (si no es el mismo que el principal) */}
            {temaAlternativo && temaAlternativo.id !== temaPrincipal?.id && (
                <div style={{ backgroundColor: '#2a2a2a', padding: '16px', borderRadius: '12px', border: '1px solid #444' }}>
                    <h2 style={{ margin: '0 0 12px 0', fontSize: '1.1rem', color: '#ff9800' }}>¿Prefieres cambiarlo? 🔄</h2>
                    <h3 style={{ margin: '0 0 8px 0' }}>{temaAlternativo.titulo}</h3>
                    <p style={{ margin: '0 0 16px 0', fontSize: '0.9rem', color: '#aaa' }}>
                        Llevas mucho tiempo sin repasar este tema.
                    </p>
                    <button
                        onClick={() => temaAlternativo.id && onSelectTema(temaAlternativo.id)}
                        style={{ width: '100%', padding: '12px', backgroundColor: '#333', color: 'white', border: '1px solid #555', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        Cambiar y repasar este
                    </button>
                </div>
            )}
        </div>
    );
};