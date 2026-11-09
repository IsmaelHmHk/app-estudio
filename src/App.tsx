import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './data/db';
import type { Tab } from './types';
import { Navbar } from './ui/Navbar';
import { Inicio } from './ui/Inicio';
import { Temas } from './ui/Temas';
import { DetalleTema } from './ui/DetalleTema';
import { Onboarding } from './ui/Onboarding'; // ¡Importante importar el nuevo componente!
import { Ajustes } from './ui/Ajustes';

export function App() {
    const [activeTab, setActiveTab] = useState<Tab>('inicio');
    const [temaSeleccionadoId, setTemaSeleccionadoId] = useState<number | null>(null);

    // Leemos TODA la tabla de ajustes para ver si está vacía
    const ajustesData = useLiveQuery(() => db.ajustes.toArray());

    // Si ajustesData es undefined, Dexie todavía está cargando la base de datos
    if (ajustesData === undefined) {
        return <div style={{ padding: '20px', color: '#aaa' }}>Cargando aplicación...</div>;
    }

    // Si devuelve un array vacío, es la primera vez que entra: mostramos el Onboarding
    if (ajustesData.length === 0) {
        return <div className="app-container"><Onboarding /></div>;
    }

    // Si pasa de aquí, es que ya hay ajustes. Renderizamos la app normal.
    return (
        <div className="app-container">
            <main className="content">
                {activeTab === 'inicio' && <Inicio onSelectTema={setTemaSeleccionadoId} />}

                {activeTab === 'temas' && (
                    temaSeleccionadoId !== null
                        ? <DetalleTema temaId={temaSeleccionadoId} onVolver={() => setTemaSeleccionadoId(null)} />
                        : <Temas onSelectTema={setTemaSeleccionadoId} />
                )}

                {activeTab === 'stats' && <div>Pantalla Stats</div>}
                {activeTab === 'sugerencias' && <div>Pantalla Sugerencias</div>}
                {activeTab === 'ajustes' && <div>Pantalla Ajustes</div>}
                {activeTab === 'ajustes' && <Ajustes />}
            </main>

            {/* Ocultamos el navbar al entrar en el detalle para limpiar la pantalla */}
            {temaSeleccionadoId === null && (
                <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
            )}
        </div>
    );
}

export default App;