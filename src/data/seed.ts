import { db } from './db'
import { DIA } from '../logic/estudio'

const diasDesdeEstudio = [3, 10, 20, 40, 60, 75]

export async function sembrarDatos() {
    if ((await db.temas.count()) > 0) return

    const ahora = Date.now()
    await db.temas.bulkAdd(
        Array.from({ length: 25 }, (_, i) => ({
            numero: i + 1,
            titulo: `Tema ${i + 1}`,
            notas: '',
            ultimoEstudio:
                i < diasDesdeEstudio.length ? ahora - diasDesdeEstudio[i] * DIA : null,
        }))
    )

    await db.ajustes.put({
        id: 1,
        fechaExamen: ahora + 84 * DIA,
        diasSemana: 5,
        casosPracticosCadaDias: 3,
        horaRecordatorio: '18:00',
        diasParaRojo: 90,
    })
}