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

    if (!temas) return <div style={{ padding: '24px', color: '#8B9DA5' }}>Cargando temario...</div>;

    const maxDias = ajustes?.diasParaRojo || 14;

    const getEstadoTema = (t: any) => {
        if (!t.ultimoEstudio) {
            return { dias: null, porcentaje: 100, color: '#8B3246', texto: 'Sin repasar', categoria: 'sin_repasar' };
        }

        const fechaUltimo = new Date(t.ultimoEstudio).getTime();
        const hoy = new Date().getTime();
        const dias = Math.max(0, Math.floor((hoy - fechaUltimo) / (1000 * 60 * 60 * 24)));
        const porcentaje = Math.min(100, Math.round((dias / maxDias) * 100));

        if (dias >= maxDias || porcentaje >= 85) {
            return { dias, porcentaje, color: '#8B3246', texto: `Hace ${dias}d`, categoria: 'hace_tiempo' };
        }

        return {
            dias,
            porcentaje,
            color: porcentaje >= 50 ? '#D99B26' : '#3B9A9C',
            texto: `Hace ${dias}d`,
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
        <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '18px', paddingBottom: '90px', color: '#EAEFEF' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.35rem', color: '#EAEFEF', fontWeight: 700 }}>Temario ({temasFiltrados.length})</h2>
                </div>
                <button
                    onClick={() => setMostrarFormNuevo(!mostrarFormNuevo)}
                    style={{
                        padding: '8px 14px',
                        backgroundColor: '#F0B6C5',
                        color: '#111A1E',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        cursor: 'pointer'
                    }}
                >
                    {mostrarFormNuevo ? 'Cancelar' : '+ Añadir Tema'}
                </button>
            </div>

            {mostrarFormNuevo && (
                <form onSubmit={handleCrearTema} style={{ display: 'flex', gap: '8px', backgroundColor: '#1A272C', padding: '14px', borderRadius: '12px', border: '1px solid #2D3E46' }}>
                    <input
                        type="text"
                        placeholder="Título o código del tema..."
                        value={nuevoTitulo}
                        onChange={(e) => setNuevoTitulo(e.target.value)}
                        style={{ flex: 1, padding: '10px 12px', borderRadius: '8px', backgroundColor: '#111A1E', border: '1px solid #2D3E46', color: '#EAEFEF', fontSize: '0.9rem' }}
                        autoFocus
                    />
                    <button type="submit" style={{ padding: '10px 16px', backgroundColor: '#3B9A9C', color: '#EAEFEF', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>
                        Guardar
                    </button>
                </form>
            )}

            <input
                type="text"
                placeholder="Buscar tema por nombre..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    backgroundColor: '#1A272C',
                    border: '1px solid #2D3E46',
                    color: '#EAEFEF',
                    fontSize: '0.9rem',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
                }}
            />

            {/* Píldoras de Filtro estilo Tab */}
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
                {[
                    { id: 'todos', label: 'Todos' },
                    { id: 'sin_repasar', label: 'Sin repasar' },
                    { id: 'hace_tiempo', label: 'Atrasados' },
                    { id: 'al_dia', label: 'Al día' },
                    { id: 'favoritos', label: 'Favoritos' }
                ].map((f) => (
                    <button
                        key={f.id}
                        onClick={() => setFiltro(f.id as any)}
                        style={{
                            padding: '6px 12px',
                            borderRadius: '20px',
                            backgroundColor: filtro === f.id ? '#F0B6C5' : '#1A272C',
                            color: filtro === f.id ? '#111A1E' : '#8B9DA5',
                            border: filtro === f.id ? '1px solid #F0B6C5' : '1px solid #2D3E46',
                            fontWeight: filtro === f.id ? 700 : 500,
                            fontSize: '0.78rem',
                            whiteSpace: 'nowrap',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                        }}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Lista de Tarjetas */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {temasFiltrados.length === 0 ? (
                    <div style={{ padding: '30px 20px', textAlign: 'center', color: '#8B9DA5', backgroundColor: '#1A272C', borderRadius: '12px', border: '1px solid #2D3E46' }}>
                        No se encontraron temas en esta vista.
                    </div>
                ) : (
                    temasFiltrados.map((t: any) => {
                        const estado = getEstadoTema(t);

                        return (
                            <div
                                key={t.id}
                                onClick={() => onSeleccionarTema(t.id)}
                                style={{
                                    backgroundColor: '#1A272C',
                                    padding: '14px 16px',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '10px',
                                    cursor: 'pointer',
                                    border: '1px solid #2D3E46',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, paddingRight: '8px' }}>
                                        {t.esFavorito && (
                                            <span style={{ fontSize: '0.6rem', color: '#F0B6C5', border: '1px solid #F0B6C5', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>
                                                FAV
                                            </span>
                                        )}
                                        <span style={{ fontWeight: 600, fontSize: '0.95rem', color: '#EAEFEF' }}>
                                            {t.titulo}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span
                                            style={{
                                                fontSize: '0.72rem',
                                                fontWeight: 700,
                                                padding: '3px 8px',
                                                borderRadius: '10px',
                                                backgroundColor: 'rgba(17, 26, 30, 0.6)',
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
                                                color: '#8B9DA5',
                                                fontSize: '0.75rem',
                                                cursor: 'pointer',
                                                padding: '2px 4px'
                                            }}
                                        >
                                            Borrar
                                        </button>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <div style={{ width: '100%', height: '4px', backgroundColor: '#111A1E', borderRadius: '2px', overflow: 'hidden' }}>
                                        <div
                                            style={{
                                                width: `${estado.porcentaje}%`,
                                                height: '100%',
                                                backgroundColor: estado.color,
                                                borderRadius: '2px',
                                                transition: 'width 0.3s ease'
                                            }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#8B9DA5' }}>
                                        <span>Último: {t.ultimoEstudio ? new Date(t.ultimoEstudio).toLocaleDateString() : 'Ninguno'}</span>
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