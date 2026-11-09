import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../data/db';

export const Ajustes: React.FC = () => {
    // Leemos los ajustes actuales de la base de datos
    const ajustes = useLiveQuery(() => db.ajustes.toCollection().first());

    const [numTemas, setNumTemas] = useState(25);
    const [fechaExamen, setFechaExamen] = useState('');
    const [diasEstudioSemana, setDiasEstudioSemana] = useState(5);
    const [frecuenciaCasos, setFrecuenciaCasos] = useState(7);
    const [horaRecordatorio, setHoraRecordatorio] = useState('09:00');
    const [guardado, setGuardado] = useState(false);

    // Rellenamos el formulario cuando lleguen los datos de Dexie
    useEffect(() => {
        if (ajustes) {
            const adj = ajustes as any; // Truco maestro para evitar que TS se queje
            setNumTemas(adj.numTemas || 25);

            if (adj.fechaExamen) {
                const fechaStr = typeof adj.fechaExamen === 'number'
                    ? new Date(adj.fechaExamen).toISOString().split('T')[0]
                    : adj.fechaStr;
                setFechaExamen(fechaStr || '');
            }
            setDiasEstudioSemana(adj.diasEstudioSemana || adj.diasSemana || 5);
            setFrecuenciaCasos(adj.frecuenciaCasosPracticos || adj.casosPracticosCadaDias || 7);
            setHoraRecordatorio(adj.horaRecordatorio || '09:00');
        }
    }, [ajustes]);

    const handleActualizar = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!ajustes?.id) return;

        await db.ajustes.update(ajustes.id, {
            numTemas,
            fechaExamen: new Date(fechaExamen).getTime(),
            diasEstudioSemana,
            frecuenciaCasosPracticos: frecuenciaCasos,
            horaRecordatorio,
        } as any); // <--- Con esto le decimos a TypeScript que confíe en nosotros

        setGuardado(true);
        setTimeout(() => setGuardado(false), 2500);
    };

    if (!ajustes) return <div style={{ padding: '16px', color: '#fff' }}>Cargando ajustes...</div>;

    return (
        <div style={{ padding: '24px', maxWidth: '500px', margin: '0 auto', color: '#fff', paddingBottom: '80px' }}>
            <h2 style={{ color: '#4caf50', marginBottom: '8px' }}>⚙️ Ajustes de Estudio</h2>
            <p style={{ color: '#aaa', marginBottom: '24px' }}>Modifica los parámetros de tu oposición cuando lo necesites.</p>

            <form onSubmit={handleActualizar} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ color: '#fff', fontWeight: '500' }}>Número total de temas</label>
                    <input
                        type="number"
                        value={numTemas}
                        onChange={e => setNumTemas(Number(e.target.value))}
                        style={inputStyle}
                        required
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ color: '#fff', fontWeight: '500' }}>Fecha del examen</label>
                    <input
                        type="date"
                        value={fechaExamen}
                        onChange={e => setFechaExamen(e.target.value)}
                        style={inputStyle}
                        required
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ color: '#fff', fontWeight: '500' }}>Días de estudio a la semana</label>
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
                    <label style={{ color: '#fff', fontWeight: '500' }}>Casos prácticos cada (días)</label>
                    <input
                        type="number"
                        value={frecuenciaCasos}
                        onChange={e => setFrecuenciaCasos(Number(e.target.value))}
                        style={inputStyle}
                        required
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ color: '#fff', fontWeight: '500' }}>Hora del recordatorio</label>
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
                        marginTop: '16px', padding: '16px', backgroundColor: '#4caf50',
                        color: 'white', border: 'none', borderRadius: '8px',
                        fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer'
                    }}
                >
                    Guardar Cambios
                </button>

                {guardado && (
                    <p style={{ textAlign: 'center', color: '#4caf50', fontWeight: 'bold', margin: '0' }}>
                        ¡Cambios guardados correctamente! ✅
                    </p>
                )}
            </form>
        </div>
    );
};

const inputStyle = {
    padding: '12px',
    borderRadius: '8px',
    backgroundColor: '#1e1e1e',
    color: '#fff',
    border: '1px solid #444',
    fontSize: '1rem',
    width: '100%',
    boxSizing: 'border-box' as const
};