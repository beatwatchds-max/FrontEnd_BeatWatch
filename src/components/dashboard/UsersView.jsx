import { useState, useEffect } from 'react'
import { Plus, X, Hash, Users, AlertCircle } from 'lucide-react'
import apiClient from '../../api/client'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phoneRegex = /^\+?\d{7,15}$/

function getInitials(name) {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
}

const colorPalette = ['bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500']

function getColor(index) {
  return colorPalette[index % colorPalette.length]
}

export default function UsersView() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  const [form, setForm] = useState({
    nombreCompleto: '',
    correo: '',
    telefono: '',
    idLicencia: '',
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [touched, setTouched] = useState({})

  const fetchUsers = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await apiClient.get('/api/Usuarios')
      console.log('RAW Usuarios:', data)
      const list = Array.isArray(data) ? data : data.data || data.usuarios || data.pacientes || []
      setUsers(list)
    } catch (err) {
      console.error('Error al listar usuarios:', err)
      setError(err.message || 'Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const validate = (name, value) => {
    switch (name) {
      case 'nombreCompleto':
        if (!value.trim()) return 'El nombre es obligatorio'
        if (value.trim().length < 2) return 'Mínimo 2 caracteres'
        return ''
      case 'correo':
        if (!value.trim()) return 'El correo es obligatorio'
        if (!emailRegex.test(value)) return 'Formato de correo inválido'
        return ''
      case 'telefono':
        if (value && !phoneRegex.test(value.replace(/\s/g, ''))) return 'Teléfono inválido (7-15 dígitos)'
        return ''
      default:
        return ''
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (touched[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: validate(name, value) }))
    }
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))
    setFieldErrors((prev) => ({ ...prev, [name]: validate(name, value) }))
  }

  const getInputClass = (name) => {
    const base = 'border rounded-lg px-4 py-2 text-sm focus:outline-none w-full transition-all duration-300 ease-in-out'
    if (fieldErrors[name] && touched[name]) return `${base} border-red-400 focus:ring-2 focus:ring-red-400`
    return `${base} border-slate-300 focus:ring-2 focus:ring-blue-500`
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    const requiredFields = ['nombreCompleto', 'correo']
    const newErrors = {}
    let hasError = false
    requiredFields.forEach((field) => {
      const err = validate(field, form[field])
      newErrors[field] = err
      if (err) hasError = true
    })
    if (form.telefono) {
      newErrors.telefono = validate('telefono', form.telefono)
      if (newErrors.telefono) hasError = true
    }
    setFieldErrors(newErrors)
    setTouched(requiredFields.reduce((acc, f) => ({ ...acc, [f]: true }), {}))
    if (hasError) return

    setSubmitting(true)

    try {
      const payload = {
        nombreCompleto: form.nombreCompleto,
        correo: form.correo,
        telefono: form.telefono || '',
        idLicencia: form.idLicencia || '',
      }

      console.log('Payload registro paciente:', payload)
      await apiClient.post('/api/Pacientes/registrar', payload)

      setForm({ nombreCompleto: '', correo: '', telefono: '', idLicencia: '' })
      setShowForm(false)
      fetchUsers()
    } catch (err) {
      console.error('Error al registrar paciente:', err)
      setFormError(err.message || 'No se pudo registrar el usuario')
    } finally {
      setSubmitting(false)
    }
  }

  const getRoleBadge = (user) => {
    const role = user.rol || user.role || user.tipo || 'Paciente'
    return role.toLowerCase().includes('cuid') || role.toLowerCase().includes('admin')
      ? 'bg-amber-100 text-amber-700'
      : 'bg-blue-100 text-blue-700'
  }

  const getRoleLabel = (user) => {
    return user.rol || user.role || user.tipo || 'Paciente'
  }

  return (
    <div className="p-8 space-y-6">
      <div className="bg-blue-600 text-white rounded-xl p-6 flex items-center justify-between transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-blue-500/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Red de Monitoreo</h2>
            <p className="text-blue-100 text-sm">{users.length} perfiles de usuario</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-white text-blue-600 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300 ease-in-out hover:bg-blue-50 hover:shadow-md hover:-translate-y-0.5 flex items-center gap-2"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cerrar' : 'Agregar usuario'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm animate-fade-in">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 divide-y divide-slate-100">
        {loading && users.length === 0 && (
          <div className="p-8 text-center text-slate-400 text-sm">Cargando usuarios...</div>
        )}
        {!loading && users.length === 0 && !error && (
          <div className="p-8 text-center text-slate-400 text-sm">No hay usuarios registrados</div>
        )}
        {users.map((user, index) => {
          const name = user.nombreCompleto || user.nombre || user.name || 'Sin nombre'
          const email = user.correo || user.email || ''
          return (
            <div key={user.id || user._id || user.usuarioId || email || index} className="flex items-center justify-between p-5 transition-all duration-300 ease-in-out hover:bg-slate-50 hover:shadow-md hover:border-blue-200">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full ${getColor(index)} flex items-center justify-center text-white font-bold text-sm`}>
                  {getInitials(name)}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">{name}</h3>
                  {email && <p className="text-sm text-slate-500">{email}</p>}
                </div>
              </div>

              <span className={`text-xs font-medium px-3 py-1 rounded-full ${getRoleBadge(user)}`}>
                {getRoleLabel(user)}
              </span>
            </div>
          )
        })}
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border-2 border-blue-500 p-6 transition-all duration-300 ease-in-out hover:shadow-md animate-fade-in">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800">Nuevo Usuario</h3>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 transition-all duration-300 ease-in-out">
              <X className="w-5 h-5" />
            </button>
          </div>

          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4 animate-fade-in">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  name="nombreCompleto"
                  value={form.nombreCompleto}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Nombre completo"
                  className={getInputClass('nombreCompleto')}
                />
                {fieldErrors.nombreCompleto && touched.nombreCompleto && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1 animate-fade-in">
                    <AlertCircle className="w-3 h-3" />{fieldErrors.nombreCompleto}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
                <input
                  type="tel"
                  name="telefono"
                  value={form.telefono}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="+52 55 1234 5678"
                  className={getInputClass('telefono')}
                />
                {fieldErrors.telefono && touched.telefono && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1 animate-fade-in">
                    <AlertCircle className="w-3 h-3" />{fieldErrors.telefono}
                  </p>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico *</label>
              <input
                type="email"
                name="correo"
                value={form.correo}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="correo@ejemplo.com"
                className={getInputClass('correo')}
              />
              {fieldErrors.correo && touched.correo && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1 animate-fade-in">
                  <AlertCircle className="w-3 h-3" />{fieldErrors.correo}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">ID Licencia</label>
              <input
                type="text"
                name="idLicencia"
                value={form.idLicencia}
                onChange={handleChange}
                placeholder="ID de licencia (opcional)"
                className="border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none w-full transition-all duration-300 ease-in-out"
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg px-4 py-2 transition-all duration-300 ease-in-out hover:bg-slate-50 hover:shadow-md">
                Cancelar
              </button>
              <button type="submit" disabled={submitting} className="flex-1 bg-blue-600 text-white font-medium rounded-lg px-4 py-2 transition-all duration-300 ease-in-out hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {submitting ? 'Registrando...' : 'Agregar usuario'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
