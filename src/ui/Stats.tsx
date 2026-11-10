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

    if (!temas || !sesiones) {
        return <div style={{ padding: '24px', color: '#8B9DA5' }}>Cargando métricas...</div>;
    }

    // Cálculo de días restantes hasta el examen
    const calcularDiasExamen = () => {
        if (!ajustes?.fechaExamen) return null;
        const hoy = new Date().getTime();
        const examen = new Date(ajustes.fechaExamen).getTime();
        const dif = Math.ceil((examen - hoy) / (1000 * 60 * 60 * 24));
        return Math.max(0, dif);
    };

    // Horas totales estudiadas
    const minutosTotales = sesiones.reduce((acc, s) => acc + (s.duracionMinutos || 0), 0);
    const horasTotales = (minutosTotales / 60).toFixed(1);

    // Temas vistos al menos una vez
    const temasVistos = temas.filter(t => !!t.ultimoEstudio).length;
    const porcentajeGlobal = temas.length > 0 ? Math.round((temasVistos / temas.length) * 100) : 0;

    const diasExamen = calcularDiasExamen();

    return (
        <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '90px', color: '#EAEFEF' }}>
            <div>
                <h2 style={{ margin: 0, fontSize: '1.35rem', color: '#EAEFEF', fontWeight: 700 }}>Rendimiento y Métricas</h2>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#8B9DA5' }}>Progreso de la preparación</p>
            </div>

            {/* Hero Card: Cuenta atrás del examen */}
            <div style={{
                background: 'linear-gradient(145deg, #1A272C 0%, #152226 100%)',
                padding: '20px',
                borderRadius: '16px',
                border: '1px solid #2D3E46',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
            }}>
                <div>
                    <span style={{ fontSize: '0.75rem', color: '#3B9A9C', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>
                        Cuenta Atrás Oficial
                    </span>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#F0B6C5', marginTop: '2px' }}>
                        {diasExamen !== null ? `${diasExamen} Días` : 'Sin fecha'}
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.75rem', color: '#8B9DA5' }}>Examen:</span>
                    <div style={{ fontSize: '0.85rem', color: '#EAEFEF', fontWeight: 600 }}>
                        {ajustes?.fechaExamen ? new Date(ajustes.fechaExamen).toLocaleDateString() : 'Por definir'}
                    </div>
                </div>
            </div>

            {/* Grid de Métricas Secundarias */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={statBoxStyle}>
                    <span style={statLabelStyle}>Horas Invertidas</span>
                    <span style={statValueStyle}>{horasTotales} h</span>
                    <span style={statSubtextStyle}>{sesiones.length} sesiones acumuladas</span>
                </div>

                <div style={statBoxStyle}>
                    <span style={statLabelStyle}>Cobertura Temario</span>
                    <span style={statValueStyle}>{porcentajeGlobal}%</span>
                    <span style={statSubtextStyle}>{temasVistos} de {temas.length} temas repasados</span>
                </div>
            </div>

            {/* Barra de progreso global del temario */}
            <div style={{
                backgroundColor: '#1A272C',
                padding: '18px',
                borderRadius: '14px',
                border: '1px solid #2D3E46',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ fontWeight: 600, color: '#EAEFEF' }}>Progreso Global del Temario</span>
                    <span style={{ fontWeight: 700, color: '#3B9A9C' }}>{porcentajeGlobal}%</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: '#111A1E', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                        style={{
                            width: `${porcentajeGlobal}%`,
                            height: '100%',
                            backgroundColor: '#3B9A9C',
                            borderRadius: '4px',
                            transition: 'width 0.4s ease'
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

const statBoxStyle = {
    backgroundColor: '#1A272C',
    padding: '16px',
    borderRadius: '14px',
    border: '1px solid #2D3E46',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px'
};

const statLabelStyle = {
    fontSize: '0.75rem',
    color: '#8B9DA5',
    fontWeight: 600 as const
};

const statValueStyle = {
    fontSize: '1.4rem',
    fontWeight: 800 as const,
    color: '#EAEFEF'
};

const statSubtextStyle = {
    fontSize: '0.7rem',
    color: '#3B9A9C'
};