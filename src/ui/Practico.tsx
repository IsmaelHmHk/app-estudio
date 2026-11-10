import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../data/db';

export const Practico: React.FC = () => {
    const [segundos, setSegundos] = useState(0);
    const [activo, setActivo] = useState(false);
    const [nombrePractico, setNombrePractico] = useState('');
    const [mensaje, setMensaje] = useState('');

    const historialPracticos = useLiveQuery(
        () => db.sesiones.where('tipo').equals('practico').reverse().sortBy('fecha')
    );

    useEffect(() => {
        let intervalo: any = null;
        if (activo) {
            intervalo = setInterval(() => {
                setSegundos((prev) => prev + 1);
            }, 1000);
        } else if (!activo && segundos !== 0) {
            clearInterval(intervalo);
        }
        return () => clearInterval(intervalo);
    }, [activo, segundos]);

    const formatTiempo = (totSeg: number) => {
        const hrs = Math.floor(totSeg / 3600);
        const mins = Math.floor((totSeg % 3600) / 60);
        const segs = totSeg % 60;
        return `${hrs > 0 ? hrs + 'h ' : ''}${mins < 10 ? '0' : ''}${mins}m ${segs < 10 ? '0' : ''}${segs}s`;
    };

    const handleGuardarPractico = async () => {
        if (segundos < 60) {
            alert('El tiempo mínimo para registrar un caso práctico es de 1 minuto.');
            return;
        }

        const minutosTotales = Math.max(1, Math.round(segundos / 60));
        const tituloFinal = nombrePractico.trim() || `Caso Práctico ${new Date().toLocaleDateString()}`;

        await db.sesiones.add({
            fecha: new Date(),
            duracionMinutos: minutosTotales,
            tipo: 'practico',
            tituloPractico: tituloFinal
        } as any);

        setActivo(false);
        setSegundos(0);
        setNombrePractico('');
        setMensaje(`Caso práctico "${tituloFinal}" registrado con éxito (${minutosTotales} min).`);
        setTimeout(() => setMensaje(''), 4000);
    };

    return (
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '90px', color: '#EAEFEF' }}>
            <div>
                <h2 style={{ margin: 0, fontSize: '1.3rem', color: '#F0B6C5', fontWeight: 600 }}>Caso Práctico</h2>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#8B9DA5' }}>Temporizador de simulacro y registro de supuestos</p>
            </div>

            {mensaje && (
                <div style={{ padding: '12px', backgroundColor: '#2D5A52', color: '#E0F2EF', borderRadius: '8px', fontSize: '0.85rem' }}>
                    {mensaje}
                </div>
            )}

            {/* Temporizador de caso práctico */}
            <div style={{
                backgroundColor: '#1A272C',
                padding: '24px',
                borderRadius: '12px',
                border: '1px solid #2D3E46',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px'
            }}>
                <input
                    type="text"
                    placeholder="Identificador o título del supuesto (opcional)..."
                    value={nombrePractico}
                    onChange={(e) => setNombrePractico(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '6px',
                        backgroundColor: '#111A1E',
                        border: '1px solid #2D3E46',
                        color: '#EAEFEF',
                        fontSize: '0.9rem',
                        boxSizing: 'border-box'
                    }}
                />

                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#3B9A9C', fontFamily: 'monospace' }}>
                    {formatTiempo(segundos)}
                </div>

                <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                    <button
                        onClick={() => setActivo(!activo)}
                        style={{
                            flex: 1,
                            padding: '12px',
                            backgroundColor: activo ? '#8B3246' : '#3B9A9C',
                            color: '#EAEFEF',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        {activo ? 'Pausar' : segundos > 0 ? 'Reanudar' : 'Iniciar Caso Práctico'}
                    </button>

                    {segundos > 0 && (
                        <button
                            onClick={handleGuardarPractico}
                            style={{
                                flex: 1,
                                padding: '12px',
                                backgroundColor: '#F0B6C5',
                                color: '#111A1E',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                            }}
                        >
                            Completar y Registrar
                        </button>
                    )}
                </div>
            </div>

            {/* Historial de casos prácticos */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', color: '#3B9A9C' }}>Historial de Casos Prácticos</h3>
                {!historialPracticos || historialPracticos.length === 0 ? (
                    <p style={{ fontSize: '0.85rem', color: '#8B9DA5' }}>No has registrado casos prácticos todavía.</p>
                ) : (
                    historialPracticos.map((p: any) => (
                        <div
                            key={p.id}
                            style={{
                                backgroundColor: '#1A272C',
                                padding: '12px 14px',
                                borderRadius: '8px',
                                border: '1px solid #2D3E46',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{p.tituloPractico || 'Caso Práctico'}</span>
                                <span style={{ fontSize: '0.75rem', color: '#8B9DA5' }}>{new Date(p.fecha).toLocaleDateString()}</span>
                            </div>
                            <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#F0B6C5' }}>
                                {p.duracionMinutos} min
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};