import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../data/db';

interface ListaTemasProps {
    onSeleccionarTema: (id: number) => void;
}

export const ListaTemas: React.FC<ListaTemasProps> = ({ onSeleccionarTema }) => {
    const temas = useLiveQuery(() => db.temas.toArray());
    const ajustes = useLiveQuery(async () => {
        const list = await db.ajustes.toArray();
        return list[0];
    });

    if (!temas) {
        return <div style={{ padding: '16px', color: '#fff' }}>Cargando temas...</div>;
    }

    // Días para llegar a rojo desde ajustes (o 14 días por defecto)
    const maxDias = ajustes?.diasParaRojo || 14;

    const getEstadoTema = (ultimoEstudio: Date | number | undefined) => {
        if (!ultimoEstudio) {
            return {
                dias: null,
                porcentaje: 100,
                color: '#f44336',
                texto: '🔴 Sin estudiar'
            };
        }

        const fechaUltimo = new Date(ultimoEstudio).getTime();
        const hoy = new Date().getTime();
        const dias = Math.max(0, Math.floor((hoy - fechaUltimo) / (1000 * 60 * 60 * 24)));
        const porcentaje = Math.min(100, Math.round((dias / maxDias) * 100));

        let color = '#4caf50';
        let texto = `🟢 Hace ${dias} d`;

        if (porcentaje >= 85 || dias >= maxDias) {
            color = '#f44336';
            texto = `🔴 Hace ${dias} d (Urgente)`;
        } else if (porcentaje >= 50) {
            color = '#ff9800';
            texto = `🟡 Hace ${dias} d`;
        }

        return { dias, porcentaje, color, texto };
    };

    return (
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '80px', color: '#fff' }}>
            <h2 style={{ margin: 0, fontSize: '1.4rem' }}>📚 Temas de la Oposición</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {temas.map((t: any) => {
                    const estado = getEstadoTema(t.ultimoEstudio);

                    return (
                        <div
                            key={t.id}
                            onClick={() => onSeleccionarTema(t.id)}
                            style={{
                                backgroundColor: '#1e1e1e',
                                padding: '14px 16px',
                                borderRadius: '10px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '10px',
                                cursor: 'pointer',
                                border: '1px solid #333'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 'bold', fontSize: '1rem' }}>{t.titulo}</span>
                                <span
                                    style={{
                                        fontSize: '0.75rem',
                                        fontWeight: 'bold',
                                        padding: '4px 8px',
                                        borderRadius: '12px',
                                        backgroundColor: '#2a2a2a',
                                        color: estado.color,
                                        border: `1px solid ${estado.color}`
                                    }}
                                >
                                    {estado.texto}
                                </span>
                            </div>

                            {/* Línea temporal de paso del tiempo */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <div
                                    style={{
                                        width: '100%',
                                        height: '6px',
                                        backgroundColor: '#333',
                                        borderRadius: '3px',
                                        overflow: 'hidden'
                                    }}
                                >
                                    <div
                                        style={{
                                            width: `${estado.porcentaje}%`,
                                            height: '100%',
                                            backgroundColor: estado.color,
                                            borderRadius: '3px',
                                            transition: 'width 0.4s ease, background-color 0.4s ease'
                                        }}
                                    />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#888' }}>
                                    <span>Último: {t.ultimoEstudio ? new Date(t.ultimoEstudio).toLocaleDateString() : 'Sin datos'}</span>
                                    <span>Límite rojo: {maxDias} días</span>
                                    <span style={{ fontWeight: 'bold', fontSize: '1rem' }}>
                                    {t.esFavorito ? '⭐ ' : ''}{t.titulo}
                                </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};