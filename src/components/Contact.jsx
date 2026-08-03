import { useState } from 'react'
import { Mail, Phone, MapPin, Send, Heart, AlertCircle } from 'lucide-react'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Contact() {
  const [form, setForm] = useState({ nombre: '', correo: '', mensaje: '' })
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const validate = (name, value) => {
    switch (name) {
      case 'nombre':
        if (!value.trim()) return 'El nombre es obligatorio'
        if (value.trim().length < 2) return 'Mínimo 2 caracteres'
        return ''
      case 'correo':
        if (!value.trim()) return 'El correo es obligatorio'
        if (!emailRegex.test(value)) return 'Formato de correo inválido'
        return ''
      case 'mensaje':
        if (!value.trim()) return 'El mensaje es obligatorio'
        if (value.trim().length < 10) return 'Mínimo 10 caracteres'
        return ''
      default:
        return ''
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validate(name, value) }))
    }
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))
    setErrors((prev) => ({ ...prev, [name]: validate(name, value) }))
  }

  const getInputClass = (name) => {
    const base = 'border rounded-lg px-4 py-2.5 text-sm focus:outline-none w-full transition-all duration-300 ease-in-out'
    if (errors[name] && touched[name]) return `${base} border-red-400 focus:ring-2 focus:ring-red-400`
    return `${base} border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white`
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const requiredFields = ['nombre', 'correo', 'mensaje']
    const newErrors = {}
    let hasError = false
    requiredFields.forEach((field) => {
      const err = validate(field, form[field])
      newErrors[field] = err
      if (err) hasError = true
    })
    setErrors(newErrors)
    setTouched(requiredFields.reduce((acc, f) => ({ ...acc, [f]: true }), {}))
    if (hasError) return

    console.log('Formulario de contacto:', form)
    setSubmitted(true)
  }

  const contactInfo = [
    { icon: Mail, label: 'Email', value: 'soporte@bitwatch.com' },
    { icon: Phone, label: 'Teléfono', value: '+52 55 1234 5678' },
    { icon: MapPin, label: 'Ubicación', value: 'Ciudad de México, MX' },
  ]

  return (
    <section id="contacto" className="py-20 px-8 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900">
            <span className="bg-gradient-to-r from-blue-600 to-rose-500 bg-clip-text text-transparent">Contáctanos</span>
          </h2>
          <p className="text-slate-500 mt-3 max-w-md mx-auto">
            ¿Tienes preguntas? Estamos aquí para ayudarte.
          </p>
        </div>

        <div className="grid grid-cols-[1fr_2fr] gap-8 max-w-5xl mx-auto">
          <div className="space-y-6">
            {contactInfo.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.label} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 transition-all duration-300 hover:shadow-md hover:border-blue-200">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider">{item.label}</p>
                    <p className="text-sm font-semibold text-slate-800">{item.value}</p>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 transition-all duration-300 hover:shadow-md">
            {submitted ? (
              <div className="text-center py-8 animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-emerald-500" fill="currentColor" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">¡Mensaje enviado!</h3>
                <p className="text-slate-500 text-sm">Te contactaremos pronto.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                  <input type="text" name="nombre" value={form.nombre} onChange={handleChange} onBlur={handleBlur} placeholder="Tu nombre" className={getInputClass('nombre')} />
                  {errors.nombre && touched.nombre && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1 animate-fade-in"><AlertCircle className="w-3 h-3" />{errors.nombre}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Correo</label>
                  <input type="email" name="correo" value={form.correo} onChange={handleChange} onBlur={handleBlur} placeholder="correo@ejemplo.com" className={getInputClass('correo')} />
                  {errors.correo && touched.correo && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1 animate-fade-in"><AlertCircle className="w-3 h-3" />{errors.correo}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mensaje</label>
                  <textarea name="mensaje" value={form.mensaje} onChange={handleChange} onBlur={handleBlur} placeholder="¿En qué podemos ayudarte?" rows={4} className={`${getInputClass('mensaje')} resize-none`} />
                  {errors.mensaje && touched.mensaje && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1 animate-fade-in"><AlertCircle className="w-3 h-3" />{errors.mensaje}</p>
                  )}
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white rounded-lg px-4 py-2.5 font-medium transition-all duration-300 ease-in-out hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" />
                  Enviar mensaje
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
