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

    // Algoritmo: Selecciona prioritariamente de los que peor llevan el tiempo (o nunca estudiados)
    const obtenerSugerencia = (listaTemas: any[], actualId?: number) => {
        if (!listaTemas || listaTemas.length === 0) return null;

        // Filtramos para evitar repetir exactamente el mismo si le da a "Sugerir otro"
        const candidatos = listaTemas.filter(t => t.id !== actualId);
        const pool = candidatos.length > 0 ? candidatos : listaTemas;

        // Ordenamos por fecha de último estudio (los 'undefined' o más antiguos primero)
        const ordenados = [...pool].sort((a, b) => {
            const tA = a.ultimoEstudio ? new Date(a.ultimoEstudio).getTime() : 0;
            const tB = b.ultimoEstudio ? new Date(b.ultimoEstudio).getTime() : 0;
            return tA - tB;
        });

        // Coge aleatoriamente entre los 4 temas más urgentes para dar variedad
        const urgentes = ordenados.slice(0, Math.min(4, ordenados.length));
        const elegido = urgentes[Math.floor(Math.random() * urgentes.length)];
        return elegido;
    };

    // Al cargar la pantalla por primera vez
    useEffect(() => {
        if (temas && temas.length > 0 && !temaSugerido) {
            setTemaSugerido(obtenerSugerencia(temas));
        }
    }, [temas]);

    // Calcular racha de días (días consecutivos con al menos 1 sesión)
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
                // Si hoy aún no ha estudiado, comprobamos si estudió ayer para no romper la racha visualmente
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

    if (!temas) return <div style={{ padding: '16px', color: '#fff' }}>Cargando inicio...</div>;

    const handleSugerirOtro = () => {
        const nuevo = obtenerSugerencia(temas, temaSugerido?.id);
        setTemaSugerido(nuevo);
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

        alert(`🎉 ¡Grande! Tema "${temaSugerido.titulo}" completado.`);
        setTemaSugerido(obtenerSugerencia(temas, temaSugerido.id));
    };

    const racha = calcularRacha();

    return (
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '80px', color: '#fff' }}>
            {/* Cabecera con Racha */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.4rem' }}>👋 ¡Hola!</h1>
                    <p style={{ margin: 0, color: '#aaa', fontSize: '0.85rem' }}>Tu plan automático de hoy</p>
                </div>
                <div style={{
                    backgroundColor: '#1e1e1e',
                    padding: '8px 12px',
                    borderRadius: '20px',
                    border: '1px solid #ff9800',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontWeight: 'bold',
                    color: '#ff9800'
                }}>
                    🔥 {racha} {racha === 1 ? 'día' : 'días'}
                </div>
            </div>

            {/* Targeta Principal: Tema Sugerido */}
            {temaSugerido ? (
                <div style={{
                    backgroundColor: '#1e1e1e',
                    borderRadius: '16px',
                    padding: '20px',
                    border: '2px solid #ff9800',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    boxShadow: '0 4px 20px rgba(255, 152, 0, 0.15)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', color: '#ff9800', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            🎯 Te toca estudiar
                        </span>
                        {temaSugerido.esFavorito && <span>⭐ Favorito</span>}
                    </div>

                    <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#fff' }}>
                        {temaSugerido.titulo}
                    </h2>

                    <p style={{ margin: 0, color: '#aaa', fontSize: '0.85rem' }}>
                        {temaSugerido.ultimoEstudio
                            ? `Último repaso: ${new Date(temaSugerido.ultimoEstudio).toLocaleDateString()}`
                            : '🔴 Aún no lo has estudiado nunca'}
                    </p>

                    {/* Botones de acción principal */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                        <button
                            onClick={() => onAbrirTema(temaSugerido.id)}
                            style={btnPrimaryStyle}
                        >
                            ⏱️ Estudiar con Pomodoro y Apuntes
                        </button>

                        <button
                            onClick={handleMarcarCompletado}
                            style={btnSuccessStyle}
                        >
                            ✅ Ya lo he estudiado (Marcar rápido)
                        </button>

                        <button
                            onClick={handleSugerirOtro}
                            style={btnSecondaryStyle}
                        >
                            🎲 Sugerir otro tema
                        </button>
                    </div>
                </div>
            ) : (
                <div style={{ padding: '20px', textAlign: 'center', color: '#aaa' }}>
                    No hay temas creados aún. Ve a la pestaña Temas para empezar.
                </div>
            )}
        </div>
    );
};

const btnPrimaryStyle = {
    padding: '14px',
    backgroundColor: '#ff9800',
    color: '#000',
    border: 'none',
    borderRadius: '10px',
    fontWeight: 'bold' as const,
    fontSize: '1rem',
    cursor: 'pointer'
};

const btnSuccessStyle = {
    padding: '12px',
    backgroundColor: '#2e7d32',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontWeight: 'bold' as const,
    fontSize: '0.9rem',
    cursor: 'pointer'
};

const btnSecondaryStyle = {
    padding: '12px',
    backgroundColor: '#2a2a2a',
    color: '#ccc',
    border: '1px solid #444',
    borderRadius: '10px',
    fontSize: '0.85rem',
    cursor: 'pointer'
};