import React, { useState } from 'react';
import { db } from '../data/db';

export const Onboarding: React.FC = () => {
    const [numTemas, setNumTemas] = useState(25);
    const [fechaExamen, setFechaExamen] = useState('');
    const [diasEstudioSemana, setDiasEstudioSemana] = useState(5);
    const [frecuenciaCasos, setFrecuenciaCasos] = useState(7);
    const [horaRecordatorio, setHoraRecordatorio] = useState('09:00');

    const handleGuardar = async (e: React.FormEvent) => {
        e.preventDefault();

        await db.ajustes.add({
            numTemas,
            fechaExamen: new Date(fechaExamen).getTime(),
            diasEstudioSemana,
            frecuenciaCasosPracticos: frecuenciaCasos,
            horaRecordatorio,
            diasParaRojo: 90
        } as any);
    };

    return (
        <div style={{ padding: '24px', maxWidth: '500px', margin: '0 auto', color: '#fff' }}>
            <h1 style={{ textAlign: 'center', color: '#4caf50' }}>¡Bienvenido! 🚀</h1>
            <p style={{ textAlign: 'center', color: '#aaa', marginBottom: '24px' }}>
                Vamos a configurar tu plan de estudio en 1 minuto.
            </p>

            <form onSubmit={handleGuardar} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ color: '#fff', fontWeight: '500' }}>1. ¿Cuántos temas tienes en total?</label>
                    <input
                        type="number"
                        value={numTemas}
                        onChange={e => setNumTemas(Number(e.target.value))}
                        style={inputStyle}
                        required
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ color: '#0034ff', fontWeight: '500' }}>2. Fecha del examen (Aproximada)</label>
                    <input
                        type="date"
                        value={fechaExamen}
                        onChange={e => setFechaExamen(e.target.value)}
                        style={inputStyle}
                        required
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ color: '#ff0000', fontWeight: '500' }}>3. ¿Cuántos días a la semana vas a estudiar?</label>
                    <input
                        type="number"
                        min="1" max="7"
                        value={diasEstudioSemana}
                        onChange={e => setDiasEstudioSemana(Number(e.target.value))}
                        style={inputStyle}
                        required
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ color: '#ff0000', fontWeight: '500' }}>4. ¿Cada cuántos días harás casos prácticos?</label>
                    <input
                        type="number"
                        value={frecuenciaCasos}
                        onChange={e => setFrecuenciaCasos(Number(e.target.value))}
                        style={inputStyle}
                        required
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ color: '#ff0000', fontWeight: '500' }}>5. ¿A qué hora quieres que te recuerde estudiar?</label>
                    <input
                        type="time"
                        value={horaRecordatorio}
                        onChange={e => setHoraRecordatorio(e.target.value)}
                        style={inputStyle}
                        required
                    />
                </div>

                <button
                    type="submit"
                    style={{
                        marginTop: '16px', padding: '16px', backgroundColor: '#1ec3b3',
                        color: 'white', border: 'none', borderRadius: '8px',
                        fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer'
                    }}
                >
                    Guardar y Empezar
                </button>
            </form>
        </div>
    );
};

const inputStyle = {
    padding: '12px',
    borderRadius: '8px',
    backgroundColor: '#077876',
    color: '#d100ff',
    border: '1px solid #444',
    fontSize: '1rem',
    width: '100%',
    boxSizing: 'border-box' as const
};