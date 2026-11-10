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
    const [horaNotificacion, setHoraNotificacion] = useState('09:00');
    const [estadoNotificacion, setEstadoNotificacion] = useState<NotificationPermission>('default');
    const [mensaje, setMensaje] = useState('');

    useEffect(() => {
        if (ajustes) {
            setDiasParaRojo(ajustes.diasParaRojo || 14);
            if (ajustes.fechaExamen) {
                const f = new Date(ajustes.fechaExamen);
                setFechaExamen(f.toISOString().split('T')[0]);
            }
            setHorasObjetivo((ajustes as any).horasObjetivo || 3);
            setHoraNotificacion((ajustes as any).horaNotificacion || '09:00');
        }
        if ('Notification' in window) {
            setEstadoNotificacion(Notification.permission);
        }
    }, [ajustes]);

    const activarNotificaciones = async () => {
        if (!('Notification' in window)) {
            alert('Tu navegador no admite notificaciones locales.');
            return;
        }
        const permiso = await Notification.requestPermission();
        setEstadoNotificacion(permiso);
        if (permiso === 'granted') {
            new Notification('OpoPlan', {
                body: 'Notificaciones activadas. Te avisaremos cuando sea la hora de estudio.',
                icon: '/pwa-192x192.png'
            });
        }
    };

    const handleGuardar = async (e: React.FormEvent) => {
        e.preventDefault();

        await db.ajustes.put({
            id: 1,
            diasParaRojo: Number(diasParaRojo),
            fechaExamen: fechaExamen ? new Date(fechaExamen).getTime() : new Date().getTime(),
            horasObjetivo: Number(horasObjetivo),
            horaNotificacion
        } as any);

        setMensaje('Configuración actualizada correctamente.');
        setTimeout(() => setMensaje(''), 3000);
    };

    if (!ajustes) {
        return <div style={{ padding: '20px', color: '#eaeef0' }}>Cargando ajustes...</div>;
    }

    return (
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '90px', color: '#eaeef0' }}>
            <h2 style={{ margin: 0, fontSize: '1.3rem', color: '#f0b6c5', fontWeight: 600 }}>Configuración de la Oposición</h2>

            {mensaje && (
                <div style={{ padding: '12px', backgroundColor: '#2d5a52', color: '#e0f2ef', borderRadius: '8px', fontSize: '0.85rem' }}>
                    {mensaje}
                </div>
            )}

            <form onSubmit={handleGuardar} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                    <span style={hintStyle}>Número de días para que un tema pase a la categoría "Repasado hace tiempo".</span>
                </div>

                <div style={cardStyle}>
                    <label style={labelStyle}>Fecha oficial del examen</label>
                    <input
                        type="date"
                        value={fechaExamen}
                        onChange={(e) => setFechaExamen(e.target.value)}
                        style={inputStyle}
                    />
                    <span style={hintStyle}>Se utiliza para calcular la cuenta atrás en Estadísticas.</span>
                </div>

                <div style={cardStyle}>
                    <label style={labelStyle}>Objetivo diario de estudio (Horas)</label>
                    <input
                        type="number"
                        min="1"
                        max="12"
                        value={horasObjetivo}
                        onChange={(e) => setHorasObjetivo(Number(e.target.value))}
                        style={inputStyle}
                    />
                    <span style={hintStyle}>Meta recomendada para el seguimiento de racha y estadísticas.</span>
                </div>

                <div style={cardStyle}>
                    <label style={labelStyle}>Recordatorio diario de estudio</label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input
                            type="time"
                            value={horaNotificacion}
                            onChange={(e) => setHoraNotificacion(e.target.value)}
                            style={{ ...inputStyle, flex: 1 }}
                        />
                        <button
                            type="button"
                            onClick={activarNotificaciones}
                            style={{
                                padding: '10px 14px',
                                backgroundColor: estadoNotificacion === 'granted' ? '#2d5a52' : '#2a3c42',
                                color: estadoNotificacion === 'granted' ? '#e0f2ef' : '#f0b6c5',
                                border: '1px solid #3b9a9c',
                                borderRadius: '6px',
                                fontWeight: 'bold',
                                fontSize: '0.8rem',
                                cursor: 'pointer'
                            }}
                        >
                            {estadoNotificacion === 'granted' ? 'Permiso Concedido' : 'Activar Notificaciones'}
                        </button>
                    </div>
                    <span style={hintStyle}>
                        {estadoNotificacion === 'granted'
                            ? `Aviso diario programado a las ${horaNotificacion}.`
                            : 'Pulsa activar para recibir avisos directos en este dispositivo.'}
                    </span>
                </div>

                <button
                    type="submit"
                    style={{
                        padding: '14px',
                        backgroundColor: '#f0b6c5',
                        color: '#111a1e',
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
    backgroundColor: '#1a272c',
    padding: '16px',
    borderRadius: '10px',
    border: '1px solid #2d3e46'
};

const labelStyle = {
    fontWeight: 600 as const,
    fontSize: '0.9rem',
    color: '#3b9a9c'
};

const inputStyle = {
    padding: '10px 12px',
    borderRadius: '6px',
    backgroundColor: '#111a1e',
    border: '1px solid #2d3e46',
    color: '#eaeef0',
    fontSize: '0.95rem'
};

const hintStyle = {
    fontSize: '0.75rem',
    color: '#8b9da5'
};