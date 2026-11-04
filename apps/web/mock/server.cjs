/**
 * API simulada para desarrollar el frontend sin el backend real.
 * Usa JSON Server + handlers propios que replican las reglas de negocio del MVP:
 *   - cupo máximo por clase
 *   - un alumno no puede reservar dos actividades superpuestas
 *   - un alumno no puede reservar dos veces la misma clase
 * El contrato (rutas y formas de respuesta) está documentado en docs/contrato-api.md
 */
const crypto = require('node:crypto')
const jsonServer = require('json-server')
const { seed, DB_PATH, PASSWORD } = require('./seed.cjs')

seed() // crea db.json si no existe

const PORT = Number(process.env.MOCK_PORT ?? 3001)
const DELAY = Number(process.env.MOCK_DELAY ?? 250)
const SECRET = process.env.MOCK_JWT_SECRET ?? 'arizona-mock-secret'
const TOKEN_TTL_S = 8 * 60 * 60
const TZ = '-03:00'

const server = jsonServer.create()
const router = jsonServer.router(DB_PATH)

/* ------------------------------ helpers ------------------------------ */

const col = (name) => router.db.get(name).value()
const save = () => router.db.write()
const nextId = (name) => col(name).reduce((max, x) => Math.max(max, x.id), 0) + 1
const nowIso = () => new Date().toISOString()
const fail = (res, status, detail) => res.status(status).json({ detail })
const publico = ({ password: _password, ...usuario }) => usuario
const resumen = (u) => ({
  id: u.id,
  nombre: u.nombre,
  apellido: u.apellido,
  email: u.email,
  telefono: u.telefono,
  fecha_nacimiento: u.fecha_nacimiento,
})
const fechaLocal = (iso) => iso.slice(0, 10) // los datos del mock siempre llevan -03:00
const hhmm = (iso) => iso.slice(11, 16)
const pad = (n) => String(n).padStart(2, '0')
const ymd = (d) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`

function sign(payload) {
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url')
  const head = b64({ alg: 'HS256', typ: 'JWT' })
  const body = b64(payload)
  const sig = crypto.createHmac('sha256', SECRET).update(`${head}.${body}`).digest('base64url')
  return `${head}.${body}.${sig}`
}

function verify(token) {
  const [head, body, sig] = token.split('.')
  if (!head || !body || !sig) return null
  const expected = crypto.createHmac('sha256', SECRET).update(`${head}.${body}`).digest('base64url')
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null
  const payload = JSON.parse(Buffer.from(body, 'base64url').toString())
  if (payload.exp * 1000 < Date.now()) return null
  return payload
}

const authResponse = (usuario) => ({
  access_token: sign({ sub: String(usuario.id), rol: usuario.rol, exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_S }),
  token_type: 'bearer',
  usuario: publico(usuario),
})

/* ---------------------------- middlewares ---------------------------- */

const auth = (req, res, next) => {
  const header = req.headers.authorization ?? ''
  const payload = header.startsWith('Bearer ') ? verify(header.slice(7)) : null
  if (!payload) return fail(res, 401, 'Tu sesión venció. Iniciá sesión nuevamente.')
  const usuario = col('usuarios').find((u) => u.id === Number(payload.sub))
  if (!usuario || usuario.eliminado_en) return fail(res, 401, 'Tu cuenta no tiene acceso al sistema.')
  req.user = usuario
  next()
}

const roles = (...permitidos) => (req, res, next) =>
  permitidos.includes(req.user.rol) ? next() : fail(res, 403, 'No tenés permisos para realizar esta acción.')

const soloAdmin = roles('ADMINISTRADOR')

/* ------------------------- enriquecimiento --------------------------- */

function claseDetalle(clase, user) {
  const actividad = col('actividades').find((a) => a.id === clase.actividad_id)
  const profesor = col('usuarios').find((u) => u.id === clase.profesor_id)
  const confirmados = col('turnos').filter((t) => t.clase_id === clase.id && t.estado === 'CONFIRMADO')
  const detalle = {
    ...clase,
    actividad: { id: actividad?.id ?? clase.actividad_id, nombre: actividad?.nombre ?? 'Actividad' },
    profesor: { id: profesor?.id ?? clase.profesor_id, nombre: profesor?.nombre ?? '', apellido: profesor?.apellido ?? '' },
    turnos_confirmados: confirmados.length,
    cupos_disponibles: Math.max(clase.cupo_maximo - confirmados.length, 0),
  }
  if (user?.rol === 'ALUMNO') detalle.mi_turno = confirmados.find((t) => t.alumno_id === user.id) ?? null
  return detalle
}

function turnoDetalle(turno, user) {
  const clase = col('clases').find((c) => c.id === turno.clase_id)
  const alumno = col('usuarios').find((u) => u.id === turno.alumno_id)
  return { ...turno, clase: claseDetalle(clase, user), alumno: resumen(alumno) }
}

function cancelarClase(clase) {
  clase.estado = 'CANCELADA'
  clase.actualizado_en = nowIso()
  for (const t of col('turnos')) {
    if (t.clase_id === clase.id && t.estado === 'CONFIRMADO') {
      t.estado = 'CANCELADO'
      t.fecha_cancelacion = nowIso()
      t.actualizado_en = nowIso()
    }
  }
}

/* ------------------------------ base -------------------------------- */

server.use(jsonServer.defaults())
server.use(jsonServer.bodyParser)
server.use((req, _res, next) => (req.method === 'OPTIONS' || !DELAY ? next() : setTimeout(next, DELAY)))

server.get('/health', (_req, res) => res.json({ status: 'ok' }))

/* ------------------------------- auth ------------------------------- */

server.post('/auth/login', (req, res) => {
  const { email, password } = req.body ?? {}
  const usuario = col('usuarios').find((u) => u.email.toLowerCase() === String(email ?? '').trim().toLowerCase())
  if (!usuario || usuario.password !== password) return fail(res, 401, 'Correo o contraseña incorrectos.')
  if (usuario.eliminado_en) return fail(res, 403, 'Tu cuenta está dada de baja. Comunicate con el estudio.')
  res.json(authResponse(usuario))
})

server.post('/auth/register', (req, res) => {
  const { nombre, apellido, email, password, telefono, fecha_nacimiento } = req.body ?? {}
  if (!nombre || !apellido || !email || !password) return fail(res, 422, 'Completá nombre, apellido, correo y contraseña.')
  if (String(password).length < 8) return fail(res, 422, 'La contraseña debe tener al menos 8 caracteres.')
  if (col('usuarios').some((u) => u.email.toLowerCase() === String(email).trim().toLowerCase())) {
    return fail(res, 409, 'Ya existe una cuenta con ese correo electrónico.')
  }
  const usuario = {
    id: nextId('usuarios'),
    rol: 'ALUMNO',
    nombre: String(nombre).trim(),
    apellido: String(apellido).trim(),
    email: String(email).trim().toLowerCase(),
    password,
    telefono: telefono || null,
    dni: null,
    fecha_nacimiento: fecha_nacimiento || null,
    fecha_alta: nowIso(),
    actualizado_en: nowIso(),
    eliminado_en: null,
  }
  router.db.get('usuarios').push(usuario).write()
  res.status(201).json(authResponse(usuario))
})

server.get('/auth/me', auth, (req, res) => res.json(publico(req.user)))

/* ------------------------------ clases ------------------------------ */

function filtrarClases(req) {
  const { desde, hasta, actividad_id, estado } = req.query
  let { profesor_id } = req.query
  if (req.user.rol === 'PROFESOR') profesor_id = String(req.user.id) // un profesor solo ve lo suyo
  return col('clases')
    .filter((c) => !c.eliminado_en)
    .filter((c) => !desde || fechaLocal(c.inicio) >= desde)
    .filter((c) => !hasta || fechaLocal(c.inicio) <= hasta)
    .filter((c) => !actividad_id || c.actividad_id === Number(actividad_id))
    .filter((c) => !profesor_id || c.profesor_id === Number(profesor_id))
    .filter((c) => !estado || c.estado === estado)
    .sort((a, b) => new Date(a.inicio) - new Date(b.inicio))
}

server.get('/clases', auth, (req, res) => {
  res.json(filtrarClases(req).map((c) => claseDetalle(c, req.user)))
})

server.get('/clases/:id', auth, (req, res) => {
  const clase = col('clases').find((c) => c.id === Number(req.params.id))
  if (!clase) return fail(res, 404, 'La clase no existe.')
  res.json(claseDetalle(clase, req.user))
})

server.patch('/clases/:id/cancelar', auth, soloAdmin, (req, res) => {
  const clase = col('clases').find((c) => c.id === Number(req.params.id))
  if (!clase) return fail(res, 404, 'La clase no existe.')
  if (clase.estado !== 'PROGRAMADA') return fail(res, 409, 'Solo se pueden cancelar clases programadas.')
  cancelarClase(clase)
  save()
  res.json(claseDetalle(clase, req.user))
})

/* ------------------------------ turnos ------------------------------ */

server.get('/turnos', auth, (req, res) => {
  const { alumno_id, clase_id, estado, desde, hasta, actividad_id } = req.query
  let { profesor_id } = req.query
  const user = req.user
  if (user.rol === 'PROFESOR') profesor_id = String(user.id)

  const clases = new Map(col('clases').map((c) => [c.id, c]))
  const lista = col('turnos')
    .filter((t) => (user.rol === 'ALUMNO' ? t.alumno_id === user.id : !alumno_id || t.alumno_id === Number(alumno_id)))
    .filter((t) => !clase_id || t.clase_id === Number(clase_id))
    .filter((t) => !estado || t.estado === estado)
    .filter((t) => {
      const c = clases.get(t.clase_id)
      if (!c) return false
      if (desde && fechaLocal(c.inicio) < desde) return false
      if (hasta && fechaLocal(c.inicio) > hasta) return false
      if (actividad_id && c.actividad_id !== Number(actividad_id)) return false
      if (profesor_id && c.profesor_id !== Number(profesor_id)) return false
      return true
    })
    .sort((a, b) => new Date(clases.get(a.clase_id).inicio) - new Date(clases.get(b.clase_id).inicio))

  res.json(lista.map((t) => turnoDetalle(t, user)))
})

server.post('/turnos', auth, roles('ALUMNO'), (req, res) => {
  const claseId = Number(req.body?.clase_id)
  const alumno = req.user
  const clase = col('clases').find((c) => c.id === claseId)
  if (!clase) return fail(res, 404, 'La clase no existe.')
  if (clase.estado !== 'PROGRAMADA') return fail(res, 409, 'Esta clase no está disponible para reservar.')
  if (new Date(clase.inicio) <= new Date()) return fail(res, 409, 'Esta clase ya comenzó.')

  const turnos = col('turnos')
  const previo = turnos.find((t) => t.alumno_id === alumno.id && t.clase_id === clase.id)
  if (previo?.estado === 'CONFIRMADO') return fail(res, 409, 'Ya tenés una reserva para esta clase.')

  const confirmados = turnos.filter((t) => t.clase_id === clase.id && t.estado === 'CONFIRMADO').length
  if (confirmados >= clase.cupo_maximo) return fail(res, 409, 'La clase está completa: no quedan cupos disponibles.')

  const clases = col('clases')
  const conflicto = turnos
    .filter((t) => t.alumno_id === alumno.id && t.estado === 'CONFIRMADO')
    .map((t) => clases.find((c) => c.id === t.clase_id))
    .find((c) => c && new Date(clase.inicio) < new Date(c.fin) && new Date(c.inicio) < new Date(clase.fin))
  if (conflicto) {
    const act = col('actividades').find((a) => a.id === conflicto.actividad_id)
    return fail(res, 409, `Ya tenés ${act?.nombre ?? 'otra actividad'} reservada de ${hhmm(conflicto.inicio)} a ${hhmm(conflicto.fin)}, que se superpone con esta clase.`)
  }

  let turno = previo
  if (turno) {
    // Reactivamos la reserva cancelada: un alumno no puede tener dos turnos para la misma clase
    turno.estado = 'CONFIRMADO'
    turno.fecha_reserva = nowIso()
    turno.fecha_cancelacion = null
    turno.actualizado_en = nowIso()
    save()
  } else {
    turno = {
      id: nextId('turnos'),
      alumno_id: alumno.id,
      clase_id: clase.id,
      tipo: 'REGULAR',
      estado: 'CONFIRMADO',
      fecha_reserva: nowIso(),
      fecha_cancelacion: null,
      actualizado_en: nowIso(),
    }
    router.db.get('turnos').push(turno).write()
  }
  res.status(201).json(turnoDetalle(turno, alumno))
})

server.post('/turnos/:id/cancelar', auth, roles('ALUMNO', 'ADMINISTRADOR'), (req, res) => {
  const turno = col('turnos').find((t) => t.id === Number(req.params.id))
  if (!turno) return fail(res, 404, 'La reserva no existe.')
  if (req.user.rol === 'ALUMNO' && turno.alumno_id !== req.user.id) return fail(res, 403, 'Solo podés cancelar tus propias reservas.')
  if (turno.estado === 'CANCELADO') return fail(res, 409, 'Esta reserva ya estaba cancelada.')
  const clase = col('clases').find((c) => c.id === turno.clase_id)
  if (new Date(clase.inicio) <= new Date()) return fail(res, 409, 'No se puede cancelar una clase que ya comenzó.')
  turno.estado = 'CANCELADO'
  turno.fecha_cancelacion = nowIso()
  turno.actualizado_en = nowIso()
  save()
  res.json(turnoDetalle(turno, req.user))
})

/* ------------------------------ bloques ----------------------------- */

server.post('/bloques', auth, soloAdmin, (req, res) => {
  const b = req.body ?? {}
  const actividad = col('actividades').find((a) => a.id === Number(b.actividad_id) && !a.eliminado_en)
  const profesor = col('usuarios').find((u) => u.id === Number(b.profesor_id) && u.rol === 'PROFESOR' && !u.eliminado_en)
  if (!actividad) return fail(res, 422, 'Elegí una actividad válida.')
  if (!profesor) return fail(res, 422, 'Elegí un profesor válido.')
  if (!b.fecha_desde || !b.fecha_hasta || b.fecha_hasta < b.fecha_desde) return fail(res, 422, 'La fecha de fin no puede ser anterior a la de inicio.')
  if (!b.hora_inicio || !b.hora_fin || b.hora_fin <= b.hora_inicio) return fail(res, 422, 'La hora de fin debe ser posterior a la de inicio.')
  const cupo = Number(b.cupo_maximo ?? 7)
  if (!Number.isInteger(cupo) || cupo < 1 || cupo > 7) return fail(res, 422, 'El cupo máximo debe estar entre 1 y 7.')

  const bloque = {
    id: nextId('bloques'),
    actividad_id: actividad.id,
    profesor_id: profesor.id,
    creado_por_id: req.user.id,
    fecha_desde: b.fecha_desde,
    fecha_hasta: b.fecha_hasta,
    hora_inicio: b.hora_inicio,
    hora_fin: b.hora_fin,
    frecuencia: 'SEMANAL',
    cupo_maximo: cupo,
    estado: 'ACTIVO',
    fecha_alta: nowIso(),
    actualizado_en: nowIso(),
    eliminado_en: null,
  }

  const nuevas = []
  let id = nextId('clases')
  const limite = new Date(`${b.fecha_hasta}T00:00:00Z`)
  for (let d = new Date(`${b.fecha_desde}T00:00:00Z`); d <= limite; d = new Date(d.getTime() + 7 * 86400000)) {
    const inicio = `${ymd(d)}T${b.hora_inicio}:00${TZ}`
    const fin = `${ymd(d)}T${b.hora_fin}:00${TZ}`
    nuevas.push({
      id: id++,
      bloque_clase_id: bloque.id,
      actividad_id: actividad.id,
      profesor_id: profesor.id,
      inicio,
      fin,
      cupo_maximo: cupo,
      estado: new Date(fin) < new Date() ? 'FINALIZADA' : 'PROGRAMADA',
      fecha_alta: nowIso(),
      actualizado_en: nowIso(),
      eliminado_en: null,
    })
  }
  if (!nuevas.length) return fail(res, 422, 'El rango de fechas no genera ninguna clase.')

  router.db.get('bloques').push(bloque).write()
  nuevas.forEach((c) => router.db.get('clases').push(c).write())
  res.status(201).json({ bloque, clases_generadas: nuevas.length })
})

server.patch('/bloques/:id/cancelar', auth, soloAdmin, (req, res) => {
  const bloque = col('bloques').find((b) => b.id === Number(req.params.id))
  if (!bloque) return fail(res, 404, 'El bloque no existe.')
  if (bloque.estado === 'CANCELADO') return fail(res, 409, 'Este bloque ya estaba cancelado.')
  bloque.estado = 'CANCELADO'
  bloque.actualizado_en = nowIso()
  col('clases')
    .filter((c) => c.bloque_clase_id === bloque.id && c.estado === 'PROGRAMADA' && new Date(c.inicio) > new Date())
    .forEach(cancelarClase)
  save()
  res.json(bloque)
})

/* --------------------------- actividades ---------------------------- */

server.post('/actividades', auth, soloAdmin, (req, res) => {
  const nombre = String(req.body?.nombre ?? '').trim()
  if (!nombre) return fail(res, 422, 'Ingresá el nombre de la actividad.')
  if (col('actividades').some((a) => a.nombre.toLowerCase() === nombre.toLowerCase())) {
    return fail(res, 409, 'Ya existe una actividad con ese nombre.')
  }
  const actividad = {
    id: nextId('actividades'),
    nombre,
    descripcion: req.body?.descripcion?.trim() || null,
    fecha_alta: nowIso(),
    actualizado_en: nowIso(),
    eliminado_en: null,
  }
  router.db.get('actividades').push(actividad).write()
  res.status(201).json(actividad)
})

server.patch('/actividades/:id', auth, soloAdmin, (req, res) => {
  const actividad = col('actividades').find((a) => a.id === Number(req.params.id))
  if (!actividad) return fail(res, 404, 'La actividad no existe.')
  const { nombre, descripcion, eliminado_en } = req.body ?? {}
  if (nombre !== undefined) {
    const limpio = String(nombre).trim()
    if (!limpio) return fail(res, 422, 'Ingresá el nombre de la actividad.')
    if (col('actividades').some((a) => a.id !== actividad.id && a.nombre.toLowerCase() === limpio.toLowerCase())) {
      return fail(res, 409, 'Ya existe una actividad con ese nombre.')
    }
    actividad.nombre = limpio
  }
  if (descripcion !== undefined) actividad.descripcion = descripcion?.trim() || null
  if (eliminado_en !== undefined) actividad.eliminado_en = eliminado_en
  actividad.actualizado_en = nowIso()
  save()
  res.json(actividad)
})

/* ----------------------------- usuarios ----------------------------- */

server.use('/usuarios', auth, soloAdmin)

function validarUnicos(usuario, { email, dni }) {
  const otros = col('usuarios').filter((u) => u.id !== usuario?.id)
  if (email && otros.some((u) => u.email.toLowerCase() === email.toLowerCase())) return 'Ya existe un usuario con ese correo electrónico.'
  if (dni && otros.some((u) => u.dni === dni)) return 'Ya existe un usuario con ese DNI.'
  return null
}

server.post('/usuarios', (req, res) => {
  const b = req.body ?? {}
  if (!['ALUMNO', 'PROFESOR'].includes(b.rol)) return fail(res, 422, 'El rol debe ser Alumno o Profesor.')
  if (!b.nombre?.trim() || !b.apellido?.trim() || !b.email?.trim()) return fail(res, 422, 'Completá nombre, apellido y correo.')
  if (!b.password || String(b.password).length < 8) return fail(res, 422, 'La contraseña inicial debe tener al menos 8 caracteres.')
  const duplicado = validarUnicos(null, { email: b.email.trim(), dni: b.dni || null })
  if (duplicado) return fail(res, 409, duplicado)
  const usuario = {
    id: nextId('usuarios'),
    rol: b.rol,
    nombre: b.nombre.trim(),
    apellido: b.apellido.trim(),
    email: b.email.trim().toLowerCase(),
    password: b.password,
    telefono: b.telefono || null,
    dni: b.dni || null,
    fecha_nacimiento: b.fecha_nacimiento || null,
    fecha_alta: nowIso(),
    actualizado_en: nowIso(),
    eliminado_en: null,
  }
  router.db.get('usuarios').push(usuario).write()
  res.status(201).json(publico(usuario))
})

server.patch('/usuarios/:id', (req, res) => {
  const usuario = col('usuarios').find((u) => u.id === Number(req.params.id))
  if (!usuario) return fail(res, 404, 'El usuario no existe.')
  const b = req.body ?? {}
  if (usuario.rol === 'ADMINISTRADOR' && b.eliminado_en) return fail(res, 409, 'No se puede dar de baja a un administrador.')
  const duplicado = validarUnicos(usuario, { email: b.email?.trim(), dni: b.dni || null })
  if (duplicado) return fail(res, 409, duplicado)
  for (const campo of ['nombre', 'apellido', 'telefono', 'dni', 'fecha_nacimiento', 'eliminado_en']) {
    if (b[campo] !== undefined) usuario[campo] = typeof b[campo] === 'string' ? b[campo].trim() || null : b[campo]
  }
  if (b.email) usuario.email = b.email.trim().toLowerCase()
  if (b.password) usuario.password = b.password
  usuario.actualizado_en = nowIso()
  save()
  res.json(publico(usuario))
})

server.delete('/usuarios/:id', (_req, res) => fail(res, 405, 'Los usuarios no se eliminan: se dan de baja.'))

/* --------------------- recursos genéricos (router) ------------------- */

// Lectura para cualquier usuario autenticado; escritura solo del administrador
const soloLecturaParaTodos = (req, res, next) => (req.method === 'GET' ? next() : soloAdmin(req, res, next))
server.use(['/actividades', '/bloques', '/clases', '/turnos'], auth, soloLecturaParaTodos)

router.render = (req, res) => {
  let data = res.locals.data
  if (req.originalUrl.startsWith('/usuarios')) data = Array.isArray(data) ? data.map(publico) : data && publico(data)
  res.jsonp(data)
}

server.use(router)

server.listen(PORT, () => {
  console.log(`\n🌿 API mock de Arizona escuchando en http://localhost:${PORT}  (latencia simulada: ${DELAY} ms)`)
  console.log('   Usuarios de prueba (contraseña para todos: ' + PASSWORD + '):')
  console.log('     Administrador → marina.ferrer@arizona.test')
  console.log('     Profesora     → laura.gomez@arizona.test')
  console.log('     Alumna        → valentina.lopez@arizona.test\n')
})
