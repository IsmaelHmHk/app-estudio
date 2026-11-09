import { useState } from 'react';
import type { Tab } from './types';
import { Navbar } from './ui/Navbar';
import { Inicio } from './ui/Inicio';
import { Temas } from './ui/Temas';
import {DetalleTema} from "./ui/DetalleTema.tsx";

export function App() {
  const [activeTab, setActiveTab] = useState<Tab>('inicio');
  const [temaSeleccionadoId, setTemaSeleccionadoId] = useState<number | null>(null);

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
        </main>

        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
  );

}
export default App;