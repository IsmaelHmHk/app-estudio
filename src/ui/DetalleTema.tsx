import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../data/db';
import { Pomodoro } from './Pomodoro';

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
    const ajustes = useLiveQuery(async () => {
        const list = await db.ajustes.toArray();
        return list[0];
    });

    const [notas, setNotas] = useState('');
    const [modoEstudio, setModoEstudio] = useState(false);

    useEffect(() => {
        if (tema?.notas !== undefined) {
            setNotas(tema.notas || '');
        }
    }, [tema]);

    if (!tema) return <div style={{ padding: '16px', color: '#fff' }}>Cargando tema...</div>;

    const maxDias = ajustes?.diasParaRojo || 14;

    // Cálculo del estado de la barra temporal del tema
    const getEstadoTema = () => {
        if (!tema.ultimoEstudio) {
            return { dias: null, porcentaje: 100, color: '#f44336', texto: 'Sin estudiar aún' };
        }
        const fechaUltimo = new Date(tema.ultimoEstudio).getTime();
        const hoy = new Date().getTime();
        const dias = Math.max(0, Math.floor((hoy - fechaUltimo) / (1000 * 60 * 60 * 24)));
        const porcentaje = Math.min(100, Math.round((dias / maxDias) * 100));

        let color = '#4caf50';
        if (porcentaje >= 85 || dias >= maxDias) color = '#f44336';
        else if (porcentaje >= 50) color = '#ff9800';

        return { dias, porcentaje, color, texto: `Repasado hace ${dias} d` };
    };

    const estado = getEstadoTema();

    // Guardar / quitar favorito en Dexie
    const toggleFavorito = async () => {
        await db.temas.update(temaId, { esFavorito: !tema.esFavorito } as any);
    };

    const registrarSesion = async (minutos: number) => {
        const ahora = new Date();
        await db.temas.update(temaId, { ultimoEstudio: ahora } as any);
        await db.sesiones.add({
            temaId,
            fecha: ahora,
            duracionMinutos: minutos
        } as any);
        setModoEstudio(false); // Vuelve a la vista informativa tras guardar
    };

    return (
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '80px', color: '#fff' }}>
            {/* Cabecera y botón Favorito */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <button
                    onClick={onVolver}
                    style={{ padding: '8px 12px', borderRadius: '8px', background: '#333', color: '#fff', border: 'none', cursor: 'pointer' }}
                >
                    ← Volver
                </button>

                <button
                    onClick={toggleFavorito}
                    style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '1.6rem',
                        cursor: 'pointer',
                        filter: tema.esFavorito ? 'none' : 'grayscale(100%) opacity(0.3)'
                    }}
                    title={tema.esFavorito ? 'Quitar de favoritos' : 'Marcar como favorito'}
                >
                    ⭐
                </button>
            </div>

            <h2 style={{ margin: 0, fontSize: '1.3rem' }}>{tema.titulo}</h2>

            {/* Línea temporal del estado del tema */}
            <div style={{ backgroundColor: '#1e1e1e', padding: '14px', borderRadius: '10px', border: '1px solid #333', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: '#aaa' }}>Línea temporal de estudio:</span>
                    <span style={{ color: estado.color, fontWeight: 'bold' }}>{estado.texto}</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: '#333', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${estado.porcentaje}%`, height: '100%', backgroundColor: estado.color, transition: 'width 0.4s ease' }} />
                </div>
            </div>

            {/* Acción para lanzar el Pomodoro */}
            {!modoEstudio ? (
                <button
                    onClick={() => setModoEstudio(true)}
                    style={{
                        padding: '16px',
                        backgroundColor: '#ff9800',
                        color: '#000',
                        border: 'none',
                        borderRadius: '10px',
                        fontWeight: 'bold',
                        fontSize: '1.1rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    }}
                >
                    ⏱️ Estudiar este tema
                </button>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 'bold', color: '#ff9800' }}>Sesión de estudio en curso</span>
                        <button
                            onClick={() => setModoEstudio(false)}
                            style={{ padding: '6px 12px', background: '#444', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' }}
                        >
                            Cancelar
                        </button>
                    </div>
                    <Pomodoro onGuardarSesion={(minutos) => registrarSesion(minutos)} />
                </div>
            )}

            {/* Notas y Esquemas */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontWeight: 'bold' }}>Mis notas y esquemas:</label>
                <textarea
                    rows={6}
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    onBlur={() => db.temas.update(temaId, { notas })}
                    placeholder="Escribe tus notas o resúmenes aquí..."
                    style={{
                        padding: '12px', borderRadius: '8px', backgroundColor: '#1e1e1e',
                        color: '#fff', border: '1px solid #444', width: '100%', boxSizing: 'border-box'
                    }}
                />
            </div>

            {/* Historial de sesiones */}
            <div>
                <h3 style={{ fontSize: '1rem', marginBottom: '8px' }}>Historial de sesiones</h3>
                {!sesiones?.length ? (
                    <p style={{ color: '#aaa', fontSize: '0.9rem' }}>Aún no has registrado sesiones para este tema.</p>
                ) : (
                    <ul style={{ paddingLeft: '20px', color: '#ccc', fontSize: '0.9rem' }}>
                        {sesiones.map((s: any) => (
                            <li key={s.id} style={{ marginBottom: '4px' }}>
                                {new Date(s.fecha).toLocaleDateString()} - {s.duracionMinutos} min
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};