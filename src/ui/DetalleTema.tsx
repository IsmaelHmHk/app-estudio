import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../data/db';
import { Pomodoro } from './Pomodoro'; // Importamos el Pomodoro

interface DetalleTemaProps {
    temaId: number;
    onVolver: () => void;
}

export const DetalleTema: React.FC<DetalleTemaProps> = ({ temaId, onVolver }) => {
    const tema = useLiveQuery(() => db.temas.get(temaId), [temaId]);
    const sesiones = useLiveQuery(
        () => db.sesiones.where('temaId').equals(temaId).reverse().sortBy('fecha'),
        [temaId]
    );

    const [notas, setNotas] = useState('');

    useEffect(() => {
        if (tema?.notas) setNotas(tema.notas);
    }, [tema]);

    if (!tema) return <div style={{ padding: '16px' }}>Cargando tema...</div>;

    // Guarda una sesión cuando el Pomodoro acaba o manualmente
    const registrarSesion = async (minutos: number) => {
        const ahora = new Date();
        await db.temas.update(temaId, { ultimoEstudio: ahora } as any);
        await db.sesiones.add({
            temaId,
            fecha: ahora,
            duracionMinutos: minutos
        } as any);
    };

    return (
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '80px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                    onClick={onVolver}
                    style={{ padding: '8px 12px', borderRadius: '8px', background: '#333', color: '#fff', border: 'none' }}
                >
                    ← Volver
                </button>
                <h2 style={{ margin: 0, fontSize: '1.2rem' }}>{tema.titulo}</h2>
            </div>

            {/* Componente Pomodoro Configurable */}
            <Pomodoro onGuardarSesion={(minutos) => registrarSesion(minutos)} />

            {/* Registro rápido de 30 min sin temporizador */}
            <button
                onClick={() => registrarSesion(30)}
                style={{
                    padding: '12px', backgroundColor: '#333', color: '#aaa', border: '1px solid #555',
                    borderRadius: '8px', fontSize: '0.9rem', cursor: 'pointer'
                }}
            >
                ⚡ Marcar 30 min repasados sin temporizador
            </button>

            {/* Apuntes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontWeight: 'bold' }}>Mis notas y esquemas:</label>
                <textarea
                    rows={6}
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    onBlur={() => db.temas.update(temaId, { notas })}
                    placeholder="Escribe tus notas aquí..."
                    style={{
                        padding: '12px', borderRadius: '8px', backgroundColor: '#1e1e1e',
                        color: '#fff', border: '1px solid #444', width: '100%', boxSizing: 'border-box'
                    }}
                />
            </div>

            {/* Historial */}
            <div>
                <h3 style={{ fontSize: '1rem' }}>Historial de sesiones</h3>
                {!sesiones?.length ? (
                    <p style={{ color: '#aaa' }}>Aún no hay sesiones registradas.</p>
                ) : (
                    <ul style={{ paddingLeft: '20px', color: '#ccc' }}>
                        {sesiones.map((s: any) => (
                            <li key={s.id}>{new Date(s.fecha).toLocaleDateString()} - {s.duracionMinutos} min</li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};