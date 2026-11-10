import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../data/db';

export const Ajustes: React.FC = () => {
    const ajustes = useLiveQuery(async () => {
        const list = await db.ajustes.toArray();
        return list[0];
    });

    const [diasParaRojo, setDiasParaRojo] = useState(14);
    const [fechaExamen, setFechaExamen] = useState('');
    const [horasObjetivo, setHorasObjetivo] = useState(3);
    const [frecuenciaPracticos, setFrecuenciaPracticos] = useState(7);
    const [diasSemana, setDiasSemana] = useState(5);
    const [mensaje, setMensaje] = useState('');

    useEffect(() => {
        if (ajustes) {
            setDiasParaRojo(ajustes.diasParaRojo || 14);
            if (ajustes.fechaExamen) {
                const f = new Date(ajustes.fechaExamen);
                setFechaExamen(f.toISOString().split('T')[0]);
            }
            setHorasObjetivo(ajustes.horasObjetivo || 3);
            setFrecuenciaPracticos(ajustes.frecuenciaPracticos || 7);
            setDiasSemana(ajustes.diasSemana || 5);
        }
    }, [ajustes]);

    const handleGuardar = async (e: React.FormEvent) => {
        e.preventDefault();

        await db.ajustes.put({
            id: 1,
            diasParaRojo: Number(diasParaRojo),
            fechaExamen: fechaExamen ? new Date(fechaExamen).getTime() : new Date().getTime(),
            horasObjetivo: Number(horasObjetivo),
            frecuenciaPracticos: Number(frecuenciaPracticos),
            diasSemana: Number(diasSemana)
        } as any);

        setMensaje('Configuración actualizada correctamente.');
        setTimeout(() => setMensaje(''), 3000);
    };

    if (!ajustes) {
        return <div style={{ padding: '20px', color: '#EAEFEF' }}>Cargando ajustes...</div>;
    }

    return (
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '90px', color: '#EAEFEF' }}>
            <h2 style={{ margin: 0, fontSize: '1.3rem', color: '#F0B6C5', fontWeight: 600 }}>Configuración de la Oposición</h2>

            {mensaje && (
                <div style={{ padding: '12px', backgroundColor: '#2D5A52', color: '#E0F2EF', borderRadius: '8px', fontSize: '0.85rem' }}>
                    {mensaje}
                </div>
            )}

            <form onSubmit={handleGuardar} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={cardStyle}>
                    <label style={labelStyle}>Frecuencia de Casos Prácticos (Días)</label>
                    <input
                        type="number"
                        min="1"
                        max="30"
                        value={frecuenciaPracticos}
                        onChange={(e) => setFrecuenciaPracticos(Number(e.target.value))}
                        style={inputStyle}
                    />
                    <span style={hintStyle}>Intervalo de días programado para la realización de supuestos prácticos.</span>
                </div>

                <div style={cardStyle}>
                    <label style={labelStyle}>Días de estudio a la semana</label>
                    <input
                        type="number"
                        min="1"
                        max="7"
                        value={diasSemana}
                        onChange={(e) => setDiasSemana(Number(e.target.value))}
                        style={inputStyle}
                    />
                </div>

                <div style={cardStyle}>
                    <label style={labelStyle}>Límite de días para aviso de repaso</label>
                    <input
                        type="number"
                        min="1"
                        max="60"
                        value={diasParaRojo}
                        onChange={(e) => setDiasParaRojo(Number(e.target.value))}
                        style={inputStyle}
                    />
                </div>

                <div style={cardStyle}>
                    <label style={labelStyle}>Fecha oficial del examen</label>
                    <input
                        type="date"
                        value={fechaExamen}
                        onChange={(e) => setFechaExamen(e.target.value)}
                        style={inputStyle}
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
                    Guardar Cambios
                </button>
            </form>
        </div>
    );
};

const cardStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    backgroundColor: '#1A272C',
    padding: '16px',
    borderRadius: '10px',
    border: '1px solid #2D3E46'
};

const labelStyle = {
    fontWeight: 600 as const,
    fontSize: '0.9rem',
    color: '#3B9A9C'
};

const inputStyle = {
    padding: '10px 12px',
    borderRadius: '6px',
    backgroundColor: '#111A1E',
    border: '1px solid #2D3E46',
    color: '#EAEFEF',
    fontSize: '0.95rem'
};

const hintStyle = {
    fontSize: '0.75rem',
    color: '#8B9DA5'
};