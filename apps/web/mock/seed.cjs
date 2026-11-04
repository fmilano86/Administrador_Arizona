/**
 * Genera mock/db.json con datos de ejemplo RELATIVOS A HOY (así siempre hay
 * clases futuras para reservar). Se ejecuta solo si db.json no existe;
 * para regenerar: `npm run mock:reset`.
 */
const fs = require('node:fs')
const path = require('node:path')

const DB_PATH = path.join(__dirname, 'db.json')
const TZ = '-03:00' // Argentina (sin horario de verano)
const PASSWORD = 'Arizona123!'

// PRNG determinístico para que los datos sean reproducibles
function mulberry32(seed) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rand = mulberry32(2026)

const pad = (n) => String(n).padStart(2, '0')
const ymd = (d) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`
const addDays = (d, n) => new Date(d.getTime() + n * 86400000)
const at = (date, hhmm) => `${ymd(date)}T${hhmm}:00${TZ}`

function todayAR() {
  const now = new Date(Date.now() - 3 * 3600 * 1000)
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
}

const slug = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z]/g, '')

function build() {
  const now = new Date().toISOString()
  const hoy = todayAR()

  // ---------- Usuarios ----------
  const usuarios = []
  const addUser = (rol, nombre, apellido, extra = {}) => {
    const id = usuarios.length + 1
    usuarios.push({
      id,
      rol,
      nombre,
      apellido,
      email: `${slug(nombre)}.${slug(apellido)}@arizona.test`,
      password: PASSWORD, // solo para el mock; el backend real guarda un hash
      telefono: `11${String(40000000 + Math.floor(rand() * 59999999))}`,
      dni: String(20000000 + Math.floor(rand() * 25000000)),
      fecha_nacimiento: `${1975 + Math.floor(rand() * 30)}-${pad(1 + Math.floor(rand() * 12))}-${pad(1 + Math.floor(rand() * 28))}`,
      fecha_alta: addDays(hoy, -Math.floor(rand() * 200)).toISOString(),
      actualizado_en: now,
      eliminado_en: null,
      ...extra,
    })
    return id
  }

  addUser('ADMINISTRADOR', 'Marina', 'Ferrer')
  const ana = addUser('PROFESOR', 'Ana', 'Torres')
  const laura = addUser('PROFESOR', 'Laura', 'Gómez')
  const diego = addUser('PROFESOR', 'Diego', 'Ramírez')
  const valentina = addUser('ALUMNO', 'Valentina', 'López')
  const nombres = [
    ['Juan', 'Pérez'], ['Camila', 'Rojas'], ['Matías', 'Silva'], ['Sofía', 'Martínez'],
    ['Lucía', 'Fernández'], ['Martina', 'Acosta'], ['Tomás', 'Benítez'], ['Julieta', 'Navarro'],
    ['Nicolás', 'Ibarra'], ['Agustina', 'Paz'], ['Franco', 'Medina'], ['Carolina', 'Suárez'],
    ['Bruno', 'Herrera'],
  ]
  const alumnos = [valentina, ...nombres.map(([n, a]) => addUser('ALUMNO', n, a))]
  // Un alumno dado de baja, para ver el estado "Inactivo"
  addUser('ALUMNO', 'Rocío', 'Vega', { eliminado_en: addDays(hoy, -20).toISOString() })

  // ---------- Actividades ----------
  const actividades = [
    { id: 1, nombre: 'Pilates Reformer', descripcion: 'Clases grupales en máquinas reformer, con cupo reducido.' },
    { id: 2, nombre: 'Yoga', descripcion: 'Práctica de movimiento, respiración y calma.' },
    { id: 3, nombre: 'Sculpt', descripcion: 'Entrenamiento de fuerza y tonificación de todo el cuerpo.' },
  ].map((a) => ({ ...a, fecha_alta: now, actualizado_en: now, eliminado_en: null }))

  // ---------- Bloques y clases ----------
  // [actividad_id, profesor_id, [días de semana 0=dom..6=sáb], inicio, fin]
  const plan = [
    [1, ana, [1, 3, 5], '09:00', '10:00'],
    [1, ana, [2, 4], '18:00', '19:00'],
    [1, laura, [1, 3], '19:00', '20:00'],
    [2, laura, [2, 4], '08:00', '09:00'],
    [2, laura, [6], '10:00', '11:00'],
    [2, ana, [5], '18:00', '19:00'],
    [3, diego, [1, 3, 5], '12:00', '13:00'],
    [3, diego, [2, 4], '19:30', '20:30'],
    [3, diego, [6], '09:00', '10:00'],
  ]

  const desdeGlobal = addDays(hoy, -14)
  const hastaGlobal = addDays(hoy, 35)
  const bloques = []
  const clases = []

  for (const [actividad_id, profesor_id, dias, hi, hf] of plan) {
    for (const dia of dias) {
      // primera fecha >= desdeGlobal con ese día de semana
      let d = desdeGlobal
      while (d.getUTCDay() !== dia) d = addDays(d, 1)
      let ultima = d
      const bloque = {
        id: bloques.length + 1,
        actividad_id,
        profesor_id,
        creado_por_id: 1,
        fecha_desde: ymd(d),
        fecha_hasta: ymd(hastaGlobal),
        hora_inicio: hi,
        hora_fin: hf,
        frecuencia: 'SEMANAL',
        cupo_maximo: 7,
        estado: 'ACTIVO',
        fecha_alta: now,
        actualizado_en: now,
        eliminado_en: null,
      }
      for (let f = d; f <= hastaGlobal; f = addDays(f, 7)) {
        const inicio = at(f, hi)
        const fin = at(f, hf)
        clases.push({
          id: clases.length + 1,
          bloque_clase_id: bloque.id,
          actividad_id,
          profesor_id,
          inicio,
          fin,
          cupo_maximo: 7,
          estado: new Date(fin) < new Date() ? 'FINALIZADA' : 'PROGRAMADA',
          fecha_alta: now,
          actualizado_en: now,
          eliminado_en: null,
        })
        ultima = f
      }
      bloque.fecha_hasta = ymd(ultima)
      bloques.push(bloque)
    }
  }

  // ---------- Turnos ----------
  const turnos = []
  const reservasPorAlumno = new Map(alumnos.map((id) => [id, []]))
  const seSuperpone = (alumnoId, clase) =>
    reservasPorAlumno.get(alumnoId).some((c) => clase.inicio < c.fin && c.inicio < clase.fin)

  const reservar = (alumnoId, clase, estado = 'CONFIRMADO') => {
    if (estado === 'CONFIRMADO' && seSuperpone(alumnoId, clase)) return false
    const reserva = new Date(new Date(clase.inicio).getTime() - (1 + Math.floor(rand() * 5)) * 86400000)
    turnos.push({
      id: turnos.length + 1,
      alumno_id: alumnoId,
      clase_id: clase.id,
      tipo: rand() < 0.06 ? 'PRUEBA' : 'REGULAR',
      estado,
      fecha_reserva: reserva.toISOString(),
      fecha_cancelacion: estado === 'CANCELADO' ? new Date(reserva.getTime() + 3600000).toISOString() : null,
      actualizado_en: now,
    })
    if (estado === 'CONFIRMADO') reservasPorAlumno.get(alumnoId).push(clase)
    return true
  }

  // Valentina (alumna demo) va a Pilates lunes y miércoles a la mañana
  for (const clase of clases) {
    const dow = new Date(clase.inicio.slice(0, 10) + 'T12:00:00Z').getUTCDay()
    if (clase.actividad_id === 1 && clase.inicio.includes('T09:00') && (dow === 1 || dow === 3)) {
      reservar(valentina, clase)
    }
  }

  for (const clase of clases) {
    const pasada = clase.estado === 'FINALIZADA'
    let objetivo = rand() < 0.18 ? 7 : Math.floor(rand() * 7)
    if (pasada) objetivo = Math.max(objetivo, 3)
    const yaConfirmados = () => turnos.filter((t) => t.clase_id === clase.id && t.estado === 'CONFIRMADO').length
    const candidatos = alumnos
      .filter((id) => id !== valentina)
      .sort(() => rand() - 0.5)
    for (const id of candidatos) {
      if (yaConfirmados() >= objetivo) break
      reservar(id, clase)
    }
    // algunas cancelaciones para que el historial se vea real
    if (rand() < 0.2) {
      const libre = candidatos.find((id) => !turnos.some((t) => t.clase_id === clase.id && t.alumno_id === id))
      if (libre) reservar(libre, clase, 'CANCELADO')
    }
  }

  return { usuarios, actividades, bloques, clases, turnos }
}

function seed({ force = false } = {}) {
  if (!force && fs.existsSync(DB_PATH)) return false
  const db = build()
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2))
  console.log(
    `✔ mock/db.json generado: ${db.usuarios.length} usuarios, ${db.clases.length} clases, ${db.turnos.length} turnos`,
  )
  return true
}

module.exports = { seed, DB_PATH, PASSWORD }

if (require.main === module) seed({ force: process.argv.includes('--force') })
