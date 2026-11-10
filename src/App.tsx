import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './data/db';
import { Inicio } from './ui/Inicio';
import { ListaTemas } from './ui/ListaTemas';
import { DetalleTema } from './ui/DetalleTema';
import { Stats } from './ui/Stats';
import { Ajustes } from './ui/Ajustes';
import { Onboarding } from './ui/Onboarding';

export const App = () => {
    const [tabActual, setTabActual] = useState<'inicio' | 'temas' | 'stats' | 'ajustes'>('inicio');
    const [temaSeleccionadoId, setTemaSeleccionadoId] = useState<number | null>(null);

    const ajustes = useLiveQuery(() => db.ajustes.get(1));

    if (ajustes === undefined) return <div style={{ color: '#fff', padding: '20px' }}>Cargando...</div>;
    if (!ajustes) return <Onboarding />;

    const abrirDetalleTema = (id: number) => {
        setTemaSeleccionadoId(id);
        setTabActual('temas');
    };

    return (
        // En el contenedor principal de App.tsx:
        <div style={{ backgroundColor: '#111A1E', minHeight: '100vh', color: '#EAEFEF', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            {/* Contenido Principal */}
            <main style={{ paddingBottom: '70px' }}>
                {tabActual === 'inicio' && (
                    <Inicio onAbrirTema={(id) => abrirDetalleTema(id)} />
                )}

                {tabActual === 'temas' && (
                    temaSeleccionadoId ? (
                        <DetalleTema
                            temaId={temaSeleccionadoId}
                            onVolver={() => setTemaSeleccionadoId(null)}
                        />
                    ) : (
                        <ListaTemas onSeleccionarTema={(id) => setTemaSeleccionadoId(id)} />
                    )
                )}

                {tabActual === 'stats' && <Stats />}
                {tabActual === 'ajustes' && <Ajustes />}
            </main>

            {/* Navegación Inferior */}
            <nav style={navStyle}>
                <button
                    onClick={() => { setTabActual('inicio'); setTemaSeleccionadoId(null); }}
                    style={tabActual === 'inicio' ? navBtnActiveStyle : navBtnStyle}
                >
                    🏠 Inicio
                </button>
                <button
                    onClick={() => { setTabActual('temas'); setTemaSeleccionadoId(null); }}
                    style={tabActual === 'temas' ? navBtnActiveStyle : navBtnStyle}
                >
                    📚 Temas
                </button>
                <button
                    onClick={() => { setTabActual('stats'); setTemaSeleccionadoId(null); }}
                    style={tabActual === 'stats' ? navBtnActiveStyle : navBtnStyle}
                >
                    📊 Stats
                </button>
                <button
                    onClick={() => { setTabActual('ajustes'); setTemaSeleccionadoId(null); }}
                    style={tabActual === 'ajustes' ? navBtnActiveStyle : navBtnStyle}
                >
                    ⚙️ Ajustes
                </button>
            </nav>
        </div>
    );
};

const navStyle = {
    position: 'fixed' as const,
    bottom: 0,
    left: 0,
    right: 0,
    height: '60px',
    backgroundColor: '#1A272C',
    borderTop: '1px solid #2D3E46',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    zIndex: 1000
};

const navBtnStyle = {
    background: 'none',
    border: 'none',
    color: '#8B9DA5',
    fontSize: '0.85rem',
    fontWeight: 'bold' as const,
    cursor: 'pointer'
};

const navBtnActiveStyle = {
    ...navBtnStyle,
    color: '#F0B6C5'
};