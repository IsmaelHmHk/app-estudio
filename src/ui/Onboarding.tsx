import React, { useState } from 'react';
import { db } from '../data/db';

export const Onboarding: React.FC = () => {
    const [totalTemas, setTotalTemas] = useState(25);
    const [fechaExamen, setFechaExamen] = useState('');
    const [diasSemana, setDiasSemana] = useState(5);

    const handleComenzar = async (e: React.FormEvent) => {
        e.preventDefault();

        await db.ajustes.put({
            id: 1,
            diasParaRojo: 14,
            horasObjetivo: 3,
            fechaExamen: fechaExamen ? new Date(fechaExamen).getTime() : new Date().getTime()
        } as any);

        const count = Math.max(1, Number(totalTemas) || 10);
        const temasExistentes = await db.temas.count();

        if (temasExistentes === 0) {
            const temasNuevos = [];
            for (let i = 1; i <= count; i++) {
                temasNuevos.push({
                    titulo: `Tema ${i}`,
                    esFavorito: false,
                    notas: ''
                });
            }
            await db.temas.bulkAdd(temasNuevos as any);
        }

        window.location.reload();
    };

    return (
        <div style={{
            backgroundColor: '#111A1E',
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px',
            color: '#EAEFEF',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
            <form
                onSubmit={handleComenzar}
                style={{
                    backgroundColor: '#1A272C',
                    padding: '28px 24px',
                    borderRadius: '12px',
                    border: '1px solid #2D3E46',
                    width: '100%',
                    maxWidth: '400px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '18px'
                }}
            >
                <div>
                    <h1 style={{ margin: '0 0 6px 0', fontSize: '1.4rem', color: '#F0B6C5', textAlign: 'center', fontWeight: 600 }}>
                        Bienvenido
                    </h1>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#8B9DA5', textAlign: 'center' }}>
                        Configura tu plan de estudio inicial en un minuto.
                    </p>
                </div>

                <div style={groupStyle}>
                    <label style={labelStyle}>1. ¿Cuántos temas tiene tu oposición?</label>
                    <input
                        type="number"
                        min="1"
                        max="200"
                        value={totalTemas}
                        onChange={(e) => setTotalTemas(Number(e.target.value))}
                        style={inputStyle}
                        required
                    />
                </div>

                <div style={groupStyle}>
                    <label style={labelStyle}>2. Fecha aproximada del examen</label>
                    <input
                        type="date"
                        value={fechaExamen}
                        onChange={(e) => setFechaExamen(e.target.value)}
                        style={inputStyle}
                        required
                    />
                </div>

                <div style={groupStyle}>
                    <label style={labelStyle}>3. ¿Cuántos días a la semana vas a estudiar?</label>
                    <input
                        type="number"
                        min="1"
                        max="7"
                        value={diasSemana}
                        onChange={(e) => setDiasSemana(Number(e.target.value))}
                        style={inputStyle}
                        required
                    />
                </div>

                <button
                    type="submit"
                    style={{
                        padding: '14px',
                        backgroundColor: '#F0B6C5',
                        color: '#111A1E',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        fontSize: '0.95rem',
                        cursor: 'pointer',
                        marginTop: '8px'
                    }}
                >
                    Guardar y Empezar
                </button>
            </form>
        </div>
    );
};

const groupStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px'
};

const labelStyle = {
    fontSize: '0.85rem',
    color: '#3B9A9C',
    fontWeight: 600 as const
};

const inputStyle = {
    padding: '10px 12px',
    borderRadius: '6px',
    backgroundColor: '#111A1E',
    border: '1px solid #2D3E46',
    color: '#EAEFEF',
    fontSize: '0.95rem'
};