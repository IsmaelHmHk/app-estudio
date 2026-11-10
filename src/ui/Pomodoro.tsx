import React, { useState, useEffect } from 'react';

interface PomodoroProps {
    onGuardarSesion: (minutos: number) => void;
}

export const Pomodoro: React.FC<PomodoroProps> = ({ onGuardarSesion }) => {
    // Tiempos configurables (en minutos)
    const [minutosEstudio, setMinutosEstudio] = useState(25);
    const [minutosDescanso, setMinutosDescanso] = useState(5);

    // Estado del temporizador
    const [segundosRestantes, setSegundosRestantes] = useState(25 * 60);
    const [activo, setActivo] = useState(false);
    const [esDescanso, setEsDescanso] = useState(false);

    // Sincronizar el reloj si se cambian los ajustes antes de arrancar
    useEffect(() => {
        if (!activo) {
            setSegundosRestantes((esDescanso ? minutosDescanso : minutosEstudio) * 60);
        }
    }, [minutosEstudio, minutosDescanso, esDescanso]);

    // Lógica del temporizador
    useEffect(() => {
        let intervalo: any = null;

        if (activo && segundosRestantes > 0) {
            intervalo = setInterval(() => {
                setSegundosRestantes((prev) => prev - 1);
            }, 1000);
        } else if (activo && segundosRestantes === 0) {
            if (!esDescanso) {
                // Termina sesión de estudio: guardamos en Dexie y pasamos a descanso
                onGuardarSesion(minutosEstudio);
                alert('🎉 ¡Tiempo de estudio completado! Hora de descansar.');
                setEsDescanso(true);
                setSegundosRestantes(minutosDescanso * 60);
            } else {
                // Termina descanso: volvemos a modo estudio
                alert('⏰ ¡Descanso finalizado! ¿Listo para otra ronda?');
                setEsDescanso(false);
                setSegundosRestantes(minutosEstudio * 60);
            }
            setActivo(false);
        }

        return () => clearInterval(intervalo);
    }, [activo, segundosRestantes, esDescanso, minutosEstudio, minutosDescanso, onGuardarSesion]);

    // Formatear segundos a MM:SS
    const formatoTiempo = (seg: number) => {
        const m = Math.floor(seg / 60).toString().padStart(2, '0');
        const s = (seg % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const handleReiniciar = () => {
        setActivo(false);
        setSegundosRestantes((esDescanso ? minutosDescanso : minutosEstudio) * 60);
    };

    return (
        <div style={{
            backgroundColor: '#2a2a2a',
            padding: '20px',
            borderRadius: '12px',
            border: `2px solid ${esDescanso ? '#2196f3' : '#ff9800'}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            alignItems: 'center'
        }}>
            <h3 style={{ margin: 0, color: esDescanso ? '#2196f3' : '#ff9800' }}>
                {esDescanso ? '☕ Descanso' : '⏱️ Temporizador Pomodoro'}
            </h3>

            {/* Selector de tiempos editables */}
            {!activo && (
                <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <label style={{ color: '#aaa', marginBottom: '4px' }}>Estudio (min)</label>
                        <input
                            type="number"
                            min="1"
                            max="120"
                            value={minutosEstudio}
                            onChange={(e) => setMinutosEstudio(Math.max(1, Number(e.target.value)))}
                            style={inputMiniStyle}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <label style={{ color: '#aaa', marginBottom: '4px' }}>Descanso (min)</label>
                        <input
                            type="number"
                            min="1"
                            max="60"
                            value={minutosDescanso}
                            onChange={(e) => setMinutosDescanso(Math.max(1, Number(e.target.value)))}
                            style={inputMiniStyle}
                        />
                    </div>
                </div>
            )}

            {/* Reloj Grande */}
            <div style={{ fontSize: '3rem', fontWeight: 'bold', fontFamily: 'monospace', color: '#fff' }}>
                {formatoTiempo(segundosRestantes)}
            </div>

            {/* Botones de Control */}
            <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                <button
                    onClick={() => setActivo(!activo)}
                    style={{
                        flex: 1,
                        padding: '12px',
                        backgroundColor: activo ? '#f44336' : '#4caf50',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                    }}
                >
                    {activo ? 'Pausar' : 'Empezar'}
                </button>
                <button
                    onClick={handleReiniciar}
                    style={{
                        padding: '12px 16px',
                        backgroundColor: '#444',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer'
                    }}
                >
                    🔄
                </button>
            </div>
        </div>
    );
};

const inputMiniStyle = {
    width: '60px',
    padding: '6px',
    textAlign: 'center' as const,
    borderRadius: '6px',
    border: '1px solid #555',
    backgroundColor: '#1e1e1e',
    color: '#fff',
    fontSize: '1rem'
};