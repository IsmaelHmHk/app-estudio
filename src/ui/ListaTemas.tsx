import React, { useState } from 'react';
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

    const [busqueda, setBusqueda] = useState('');
    const [filtro, setFiltro] = useState<'todos' | 'sin_repasar' | 'hace_tiempo' | 'al_dia' | 'favoritos'>('todos');
    const [mostrarFormNuevo, setMostrarFormNuevo] = useState(false);
    const [nuevoTitulo, setNuevoTitulo] = useState('');

    if (!temas) {
        return <div style={{ padding: '16px', color: '#fff' }}>Cargando temas...</div>;
    }

    const maxDias = ajustes?.diasParaRojo || 14;

    const getEstadoTema = (t: any) => {
        if (!t.ultimoEstudio) {
            return {
                dias: null,
                porcentaje: 100,
                color: '#f44336',
                texto: 'Sin repasar',
                categoria: 'sin_repasar'
            };
        }

        const fechaUltimo = new Date(t.ultimoEstudio).getTime();
        const hoy = new Date().getTime();
        const dias = Math.max(0, Math.floor((hoy - fechaUltimo) / (1000 * 60 * 60 * 24)));
        const porcentaje = Math.min(100, Math.round((dias / maxDias) * 100));

        if (dias >= maxDias || porcentaje >= 85) {
            return {
                dias,
                porcentaje,
                color: '#f44336',
                texto: `Hace ${dias} d`,
                categoria: 'hace_tiempo'
            };
        }

        return {
            dias,
            porcentaje,
            color: porcentaje >= 50 ? '#ff9800' : '#4caf50',
            texto: `Hace ${dias} d`,
            categoria: 'al_dia'
        };
    };

    const temasFiltrados = temas.filter((t: any) => {
        const coincideTexto = t.titulo.toLowerCase().includes(busqueda.toLowerCase());
        const estado = getEstadoTema(t);

        if (!coincideTexto) return false;

        if (filtro === 'favoritos') return !!t.esFavorito;
        if (filtro === 'sin_repasar') return estado.categoria === 'sin_repasar';
        if (filtro === 'hace_tiempo') return estado.categoria === 'hace_tiempo';
        if (filtro === 'al_dia') return estado.categoria === 'al_dia';

        return true;
    });

    const handleCrearTema = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nuevoTitulo.trim()) return;

        await db.temas.add({
            titulo: nuevoTitulo.trim(),
            esFavorito: false,
            notas: ''
        } as any);

        setNuevoTitulo('');
        setMostrarFormNuevo(false);
    };

    const handleEliminarTema = async (e: React.MouseEvent, id: number, titulo: string) => {
        e.stopPropagation();
        if (confirm(`¿Eliminar el tema "${titulo}"?`)) {
            await db.temas.delete(id);
            await db.sesiones.where('temaId').equals(id).delete();
        }
    };

    return (
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '80px', color: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0, fontSize: '1.3rem' }}>Temas ({temasFiltrados.length})</h2>
                <button
                    onClick={() => setMostrarFormNuevo(!mostrarFormNuevo)}
                    style={{
                        padding: '8px 14px',
                        backgroundColor: '#ff9800',
                        color: '#000',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                    }}
                >
                    {mostrarFormNuevo ? 'Cancelar' : '+ Nuevo Tema'}
                </button>
            </div>

            {mostrarFormNuevo && (
                <form onSubmit={handleCrearTema} style={{ display: 'flex', gap: '8px', backgroundColor: '#1e1e1e', padding: '12px', borderRadius: '8px', border: '1px solid #333' }}>
                    <input
                        type="text"
                        placeholder="Título del tema..."
                        value={nuevoTitulo}
                        onChange={(e) => setNuevoTitulo(e.target.value)}
                        style={{ flex: 1, padding: '10px', borderRadius: '6px', backgroundColor: '#2a2a2a', border: '1px solid #444', color: '#fff' }}
                        autoFocus
                    />
                    <button type="submit" style={{ padding: '10px 16px', backgroundColor: '#4caf50', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                        Guardar
                    </button>
                </form>
            )}

            <input
                type="text"
                placeholder="Buscar tema..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                style={{
                    padding: '12px',
                    borderRadius: '8px',
                    backgroundColor: '#1e1e1e',
                    border: '1px solid #333',
                    color: '#fff',
                    fontSize: '0.95rem'
                }}
            />

            {/* Filtros en pestañas limpias */}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                {[
                    { id: 'todos', label: 'Todos' },
                    { id: 'sin_repasar', label: 'Sin repasar' },
                    { id: 'hace_tiempo', label: 'Repasado hace tiempo' },
                    { id: 'al_dia', label: 'Al día' },
                    { id: 'favoritos', label: 'Favoritos' }
                ].map((f) => (
                    <button
                        key={f.id}
                        onClick={() => setFiltro(f.id as any)}
                        style={{
                            padding: '6px 12px',
                            borderRadius: '16px',
                            backgroundColor: filtro === f.id ? '#ff9800' : '#2a2a2a',
                            color: filtro === f.id ? '#000' : '#ccc',
                            border: '1px solid #444',
                            fontWeight: filtro === f.id ? 'bold' : 'normal',
                            fontSize: '0.8rem',
                            whiteSpace: 'nowrap',
                            cursor: 'pointer'
                        }}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Lista de Temas */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {temasFiltrados.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
                        No hay temas en esta categoría.
                    </div>
                ) : (
                    temasFiltrados.map((t: any) => {
                        const estado = getEstadoTema(t);

                        return (
                            <div
                                key={t.id}
                                onClick={() => onSeleccionarTema(t.id)}
                                style={{
                                    backgroundColor: '#1e1e1e',
                                    padding: '14px 16px',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '10px',
                                    cursor: 'pointer',
                                    border: '1px solid #333'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                                        {t.esFavorito && (
                                            <span style={{ fontSize: '0.65rem', backgroundColor: '#2a2a2a', color: '#ff9800', border: '1px solid #ff9800', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                                                FAVORITO
                                            </span>
                                        )}
                                        <span style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>
                                            {t.titulo}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                                        <button
                                            onClick={(e) => handleEliminarTema(e, t.id, t.titulo)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: '#777',
                                                fontSize: '0.8rem',
                                                cursor: 'pointer',
                                                padding: '4px'
                                            }}
                                        >
                                            Borrar
                                        </button>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <div style={{ width: '100%', height: '4px', backgroundColor: '#333', borderRadius: '2px', overflow: 'hidden' }}>
                                        <div
                                            style={{
                                                width: `${estado.porcentaje}%`,
                                                height: '100%',
                                                backgroundColor: estado.color,
                                                borderRadius: '2px',
                                                transition: 'width 0.4s ease'
                                            }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#777' }}>
                                        <span>Último: {t.ultimoEstudio ? new Date(t.ultimoEstudio).toLocaleDateString() : 'Sin registros'}</span>
                                        <span>Límite: {maxDias} días</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};