import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../data/db';

interface DetalleTemaProps {
    temaId: number;
    onVolver: () => void;
}

export const DetalleTema: React.FC<DetalleTemaProps> = ({ temaId, onVolver }) => {
    // Buscamos el tema específico y sus sesiones ordenadas por fecha
    const tema = useLiveQuery(() => db.temas.get(temaId), [temaId]);
    const sesiones = useLiveQuery(
        () => db.sesiones.where('temaId').equals(temaId).reverse().sortBy('fecha'),
        [temaId]
    );

    const [notas, setNotas] = useState('');

    // Cuando cargue el tema, metemos sus notas en el estado local del textarea
    useEffect(() => {
        if (tema?.notas) {
            setNotas(tema.notas);
        }
    }, [tema]);

    if (!tema) return <div style={{ padding: '16px' }}>Cargando tema...</div>;

    // --- ACCIONES ---
    const handleMarcarRepasado = async () => {
        const ahora = new Date();

        // 1. Actualizamos el tema poniéndole la fecha de hoy
        await db.temas.update(temaId, { ultimoEstudio: ahora } as any);

        // 2. Guardamos una sesión nueva (luego le meteremos los minutos reales del pomodoro)
        await db.sesiones.add({
            temaId: temaId,
            fecha: ahora,
            duracionMinutos: 30
        } as any);

        // Opcional: onVolver() aquí si quieres que al marcarlo te devuelva a la lista automáticamente
    };

    const handleGuardarNotas = async () => {
        await db.temas.update(temaId, { notas });
    };

    return (
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Cabecera con botón volver */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                    onClick={onVolver}
                    style={{ padding: '8px 12px', borderRadius: '8px', background: '#333', color: '#fff', border: 'none' }}
                >
                    ← Volver
                </button>
                <h2 style={{ margin: 0, fontSize: '1.2rem' }}>{tema.titulo}</h2>
            </div>

            <p style={{ color: '#aaa', margin: 0 }}>
                Último repaso: {tema.ultimoEstudio ? new Date(tema.ultimoEstudio).toLocaleString() : 'Nunca'}
            </p>

            {/* Botón principal */}
            <button
                onClick={handleMarcarRepasado}
                style={{
                    padding: '16px', backgroundColor: '#4caf50', color: '#fff', border: 'none',
                    borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer'
                }}
            >
                ✅ Marcar como repasado (Hoy)
            </button>

            {/* Zona de apuntes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontWeight: 'bold' }}>Mis notas y esquemas:</label>
                <textarea
                    rows={6}
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    onBlur={handleGuardarNotas} // Se guarda en Dexie al salir del textarea
                    placeholder="Escribe aquí lo que te cuesta recordar..."
                    style={{
                        padding: '12px', borderRadius: '8px', backgroundColor: '#1e1e1e',
                        color: '#fff', border: '1px solid #444', width: '100%', boxSizing: 'border-box'
                    }}
                />
                <small style={{ color: '#888' }}>Se guarda solo al tocar fuera de la caja.</small>
            </div>

            {/* Historial rápido */}
            <div>
                <h3 style={{ fontSize: '1rem' }}>Historial de sesiones</h3>
                {!sesiones?.length ? (
                    <p style={{ color: '#aaa' }}>Aún no hay sesiones registradas.</p>
                ) : (
                    <ul style={{ paddingLeft: '20px', color: '#ccc' }}>
                        {sesiones.map(s => (
                            <li key={s.id}>{new Date(s.fecha).toLocaleDateString()} - {(s as any).duracionMinutos} min</li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};