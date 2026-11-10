import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../data/db';

export const Stats: React.FC = () => {
    const temas = useLiveQuery(() => db.temas.toArray());
    const sesiones = useLiveQuery(() => db.sesiones.toArray());
    const ajustes = useLiveQuery(async () => {
        const list = await db.ajustes.toArray();
        return list[0];
    });

    if (!temas || !sesiones || !ajustes) {
        return <div style={{ padding: '20px', color: '#fff' }}>Cargando estadísticas...</div>;
    }

    // Calculamos métricas
    const totalTemas = temas.length || 1;
    const temasRepasados = temas.filter((t: any) => t.ultimoEstudio).length;
    const porcentajeProgreso = Math.round((temasRepasados / totalTemas) * 100);

    const minutosTotales = sesiones.reduce((acc: number, s: any) => acc + (s.duracionMinutos || 0), 0);
    const horasTotales = (minutosTotales / 60).toFixed(1);

    // Días hasta el examen
    const hoy = new Date().getTime();
    const fechaExamen = ajustes.fechaExamen || hoy;
    const diasRestantes = Math.max(0, Math.ceil((fechaExamen - hoy) / (1000 * 60 * 60 * 24)));

    return (
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px', color: '#fff', paddingBottom: '80px' }}>
            <h2 style={{ margin: 0, fontSize: '1.4rem' }}>📊 Mi Progreso</h2>

            {/* Cuenta Atrás */}
            <div style={cardStyle}>
                <span style={{ fontSize: '0.85rem', color: '#aaa' }}>Días para el examen</span>
                <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#4caf50' }}>{diasRestantes}</span>
                <span style={{ fontSize: '0.8rem', color: '#666' }}>¡A apretar los dientes! 💪</span>
            </div>

            {/* Progreso de Temas */}
            <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 'bold' }}>Temas Vistos</span>
                    <span style={{ color: '#4caf50', fontWeight: 'bold' }}>{temasRepasados} / {totalTemas} ({porcentajeProgreso}%)</span>
                </div>

                {/* Barra de progreso visual */}
                <div style={{ width: '100%', height: '12px', backgroundColor: '#333', borderRadius: '6px', overflow: 'hidden' }}>
                    <div style={{
                        width: `${porcentajeProgreso}%`,
                        height: '100%',
                        backgroundColor: '#4caf50',
                        transition: 'width 0.4s ease'
                    }} />
                </div>
            </div>

            {/* Métricas rápidas */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={cardStyle}>
                    <span style={{ fontSize: '0.8rem', color: '#aaa' }}>Horas Estudiadas</span>
                    <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#ff9800' }}>{horasTotales} h</span>
                </div>
                <div style={cardStyle}>
                    <span style={{ fontSize: '0.8rem', color: '#aaa' }}>Sesiones Pomodoro</span>
                    <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#2196f3' }}>{sesiones.length}</span>
                </div>
            </div>
        </div>
    );
};

const cardStyle = {
    backgroundColor: '#1e1e1e',
    padding: '16px',
    borderRadius: '12px',
    border: '1px solid #333',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px'
};