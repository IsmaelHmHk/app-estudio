import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../data/db';

interface InicioProps {
    onAbrirTema: (id: number) => void;
}

export const Inicio: React.FC<InicioProps> = ({ onAbrirTema }) => {
    const temas = useLiveQuery(() => db.temas.toArray());
    const sesiones = useLiveQuery(() => db.sesiones.toArray());
    const [temaSugerido, setTemaSugerido] = useState<any>(null);
    const [mostrarNotasExpres, setMostrarNotasExpres] = useState(false);

    const obtenerSugerencia = (listaTemas: any[], actualId?: number) => {
        if (!listaTemas || listaTemas.length === 0) return null;
        const candidatos = listaTemas.filter(t => t.id !== actualId);
        const pool = candidatos.length > 0 ? candidatos : listaTemas;

        const ordenados = [...pool].sort((a, b) => {
            const tA = a.ultimoEstudio ? new Date(a.ultimoEstudio).getTime() : 0;
            const tB = b.ultimoEstudio ? new Date(b.ultimoEstudio).getTime() : 0;
            return tA - tB;
        });

        const urgentes = ordenados.slice(0, Math.min(4, ordenados.length));
        return urgentes[Math.floor(Math.random() * urgentes.length)];
    };

    useEffect(() => {
        if (temas && temas.length > 0 && !temaSugerido) {
            setTemaSugerido(obtenerSugerencia(temas));
        }
    }, [temas]);

    const calcularRacha = () => {
        if (!sesiones || sesiones.length === 0) return 0;
        const diasConEstudio = new Set(
            sesiones.map(s => new Date(s.fecha).toISOString().split('T')[0])
        );

        let racha = 0;
        let fechaCheck = new Date();

        while (true) {
            const fechaStr = fechaCheck.toISOString().split('T')[0];
            if (diasConEstudio.has(fechaStr)) {
                racha++;
                fechaCheck.setDate(fechaCheck.getDate() - 1);
            } else {
                if (racha === 0) {
                    fechaCheck.setDate(fechaCheck.getDate() - 1);
                    const ayerStr = fechaCheck.toISOString().split('T')[0];
                    if (diasConEstudio.has(ayerStr)) {
                        racha++;
                        fechaCheck.setDate(fechaCheck.getDate() - 1);
                        continue;
                    }
                }
                break;
            }
        }
        return racha;
    };

    if (!temas) return <div style={{ padding: '24px', color: '#8B9DA5' }}>Cargando panel...</div>;

    const handleSugerirOtro = () => {
        setMostrarNotasExpres(false);
        setTemaSugerido(obtenerSugerencia(temas, temaSugerido?.id));
    };

    const handleMarcarCompletado = async () => {
        if (!temaSugerido) return;
        const ahora = new Date();
        await db.temas.update(temaSugerido.id, { ultimoEstudio: ahora } as any);
        await db.sesiones.add({
            temaId: temaSugerido.id,
            fecha: ahora,
            duracionMinutos: 30
        } as any);

        setMostrarNotasExpres(false);
        setTemaSugerido(obtenerSugerencia(temas, temaSugerido.id));
    };

    const racha = calcularRacha();

    return (
        <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '22px', paddingBottom: '90px', color: '#EAEFEF' }}>
            {/* Header de bienvenida + Badge Racha */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <span style={{ fontSize: '0.75rem', letterSpacing: '1px', textTransform: 'uppercase', color: '#3B9A9C', fontWeight: 700 }}>
                        Plan Personalizado
                    </span>
                    <h1 style={{ margin: '4px 0 0 0', fontSize: '1.5rem', color: '#EAEFEF', fontWeight: 700, letterSpacing: '-0.3px' }}>
                        Objetivo de Hoy
                    </h1>
                </div>
                <div style={{
                    backgroundColor: '#1A272C',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    border: '1px solid #3B9A9C',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    color: '#3B9A9C',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3B9A9C', display: 'inline-block' }}></span>
                    Racha: {racha} {racha === 1 ? 'día' : 'días'}
                </div>
            </div>

            {/* Tarjeta Hero Principal */}
            {temaSugerido ? (
                <div style={{
                    background: 'linear-gradient(145deg, #1A272C 0%, #141F23 100%)',
                    borderRadius: '16px',
                    padding: '22px',
                    border: '1px solid #2D3E46',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '18px',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{
                            fontSize: '0.7rem',
                            color: '#F0B6C5',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            backgroundColor: 'rgba(240, 182, 197, 0.1)',
                            padding: '4px 10px',
                            borderRadius: '12px',
                            border: '1px solid rgba(240, 182, 197, 0.2)'
                        }}>
                            Prioridad Automática
                        </span>
                        {temaSugerido.esFavorito && (
                            <span style={{ fontSize: '0.7rem', color: '#3B9A9C', border: '1px solid #3B9A9C', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                                Favorito
                            </span>
                        )}
                    </div>

                    <div>
                        <h2 style={{ margin: '0 0 6px 0', fontSize: '1.35rem', color: '#EAEFEF', fontWeight: 600, lineHeight: 1.3 }}>
                            {temaSugerido.titulo}
                        </h2>
                        <p style={{ margin: 0, color: '#8B9DA5', fontSize: '0.82rem' }}>
                            {temaSugerido.ultimoEstudio
                                ? `Último repaso realizado el ${new Date(temaSugerido.ultimoEstudio).toLocaleDateString()}`
                                : 'Sin registros de estudio previo'}
                        </p>
                    </div>

                    {mostrarNotasExpres && (
                        <div style={{
                            backgroundColor: '#111A1E',
                            padding: '16px',
                            borderRadius: '12px',
                            border: '1px solid #2D3E46',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px'
                        }}>
                            <span style={{ fontSize: '0.75rem', color: '#3B9A9C', fontWeight: 700, textTransform: 'uppercase' }}>Notas rápidas:</span>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#C8D3D8', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                                {temaSugerido.notas || 'Sin notas ni esquemas redactados para este tema.'}
                            </p>
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
                        <button
                            onClick={() => onAbrirTema(temaSugerido.id)}
                            style={{
                                padding: '14px',
                                backgroundColor: '#F0B6C5',
                                color: '#111A1E',
                                border: 'none',
                                borderRadius: '10px',
                                fontWeight: 700,
                                fontSize: '0.95rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: '0 4px 12px rgba(240, 182, 197, 0.2)'
                            }}
                        >
                            Estudiar con Pomodoro
                        </button>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <button
                                onClick={() => setMostrarNotasExpres(!mostrarNotasExpres)}
                                style={{
                                    padding: '11px',
                                    backgroundColor: '#233339',
                                    color: '#EAEFEF',
                                    border: '1px solid #2D3E46',
                                    borderRadius: '10px',
                                    fontWeight: 600,
                                    fontSize: '0.82rem',
                                    cursor: 'pointer'
                                }}
                            >
                                {mostrarNotasExpres ? 'Ocultar notas' : 'Lectura Exprés'}
                            </button>

                            <button
                                onClick={handleMarcarCompletado}
                                style={{
                                    padding: '11px',
                                    backgroundColor: 'rgba(59, 154, 156, 0.15)',
                                    color: '#3B9A9C',
                                    border: '1px solid #3B9A9C',
                                    borderRadius: '10px',
                                    fontWeight: 600,
                                    fontSize: '0.82rem',
                                    cursor: 'pointer'
                                }}
                            >
                                Marcar visto
                            </button>
                        </div>

                        <button
                            onClick={handleSugerirOtro}
                            style={{
                                padding: '10px',
                                backgroundColor: 'transparent',
                                color: '#8B9DA5',
                                border: 'none',
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                                textAlign: 'center'
                            }}
                        >
                            Proponer otro tema
                        </button>
                    </div>
                </div>
            ) : (
                <div style={{ padding: '30px 20px', textAlign: 'center', color: '#8B9DA5', backgroundColor: '#1A272C', borderRadius: '16px', border: '1px solid #2D3E46' }}>
                    No hay temas en el temario. Puedes añadirlos en la sección "Temas".
                </div>
            )}
        </div>
    );
};