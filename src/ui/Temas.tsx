import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../data/db';
import { progresoColor, DIA } from '../logic/estudio';

interface TemasProps {
    onSelectTema: (temaId: number) => void;
}

export const Temas: React.FC<TemasProps> = ({ onSelectTema }) => {
    // Leemos temas y ajustes en tiempo real
    const temas = useLiveQuery(() => db.temas.toArray());
    const ajustes = useLiveQuery(() => db.ajustes.toCollection().first());

    if (!temas || !ajustes) {
        return <div style={{ padding: '16px' }}>Cargando temas...</div>;
    }

    return (
        <div style={{ padding: '16px' }}>
            <h2>Lista de Temas ({temas.length})</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
                {temas.map((tema) => {
                    const color = progresoColor(tema as any, DIA);

                    return (
                        <div
                            key={tema.id}
                            onClick={() => tema.id && onSelectTema(tema.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between', // Corregido aquí
                                padding: '12px 16px',
                                backgroundColor: '#2a2a2a',
                                borderRadius: '8px',
                                borderLeft: `6px solid ${color}`,
                                cursor: 'pointer',
                            }}
                        >
                            <div>
                                <strong style={{ display: 'block', fontSize: '1rem' }}>{tema.titulo}</strong>
                                <span style={{ fontSize: '0.8rem', color: '#aaa' }}>
                  {tema.ultimoEstudio
                      ? `Último repaso: ${new Date(tema.ultimoEstudio).toLocaleDateString()}`
                      : 'Sin empezar'}
                </span>
                            </div>
                            <span style={{ color: '#aaa', fontSize: '1.2rem' }}>›</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};