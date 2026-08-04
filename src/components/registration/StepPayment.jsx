import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CreditCard, Wallet, Building, Lock, Check, Shield, AlertCircle } from 'lucide-react'
import useRegistrationStore from '../../store/registrationStore'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const formatCardNumber = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 16)
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ')
}

const formatExpDate = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 4)
  if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2)
  return digits
}

export default function StepPayment() {
  const [activeMethod, setActiveMethod] = useState('card')
  const navigate = useNavigate()
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const setStep2Completed = useRegistrationStore((s) => s.setStep2Completed)

  const [form, setForm] = useState({
    email: '',
    cardNumber: '',
    cardName: '',
    expDate: '',
    cvv: '',
  })

  const paymentMethods = [
    { id: 'card', label: 'Tarjeta', icon: CreditCard },
    { id: 'paypal', label: 'PayPal', icon: Wallet },
    { id: 'oxxo', label: 'OXXO', icon: Building },
  ]

  const features = [
    'Monitoreo 24/7 en tiempo real',
    'Detección de arritmias con IA',
    'Alertas automáticas por SMS',
    'Dashboard de salud personal',
    'Historial de 30 días',
    'Soporte por chat',
  ]

  const validate = (name, value) => {
    switch (name) {
      case 'email':
        if (!value.trim()) return 'El correo es obligatorio'
        if (!emailRegex.test(value)) return 'Formato de correo inválido'
        return ''
      case 'cardNumber':
        if (!value.trim()) return 'El número de tarjeta es obligatorio'
        const digits = value.replace(/\s/g, '')
        if (!/^\d{16}$/.test(digits)) return 'Número de tarjeta inválido (16 dígitos)'
        return ''
      case 'cardName':
        if (!value.trim()) return 'El nombre del titular es obligatorio'
        if (value.trim().length < 3) return 'Mínimo 3 caracteres'
        return ''
      case 'expDate':
        if (!value.trim()) return 'La fecha de expiración es obligatoria'
        if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(value)) return 'Formato MM/AA'
        return ''
      case 'cvv':
        if (!value.trim()) return 'El CVV es obligatorio'
        if (!/^\d{3}$/.test(value)) return 'CVV inválido (3 dígitos)'
        return ''
      default:
        return ''
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    let formatted = value

    if (name === 'cardNumber') formatted = formatCardNumber(value)
    else if (name === 'expDate') formatted = formatExpDate(value)
    else if (name === 'cvv') formatted = value.replace(/\D/g, '').slice(0, 3)
    else if (name === 'cardName') formatted = value.replace(/[^a-zA-ZáéíóúñÁÉÍÓÚÑ\s]/g, '')

    setForm((prev) => ({ ...prev, [name]: formatted }))
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validate(name, formatted) }))
    }
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))
    setErrors((prev) => ({ ...prev, [name]: validate(name, value) }))
  }

  const getInputClass = (name) => {
    const base = 'border rounded-lg px-4 py-2 text-sm focus:outline-none w-full transition-all duration-300 ease-in-out'
    if (errors[name] && touched[name]) return `${base} border-red-400 focus:ring-2 focus:ring-red-400`
    return `${base} border-slate-300 focus:ring-2 focus:ring-blue-500`
  }

  const handlePay = () => {
    if (activeMethod !== 'card') {
      setStep2Completed()
      navigate('/registro/confirmacion')
      return
    }

    const requiredFields = ['email', 'cardNumber', 'cardName', 'expDate', 'cvv']
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

    setStep2Completed()
    navigate('/registro/confirmacion')
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="grid grid-cols-[2fr_1fr] gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 transition-all duration-300 ease-in-out">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Método de Pago</h2>

          <div className="flex gap-3 mb-6">
            {paymentMethods.map((method) => {
              const Icon = method.icon
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setActiveMethod(method.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all duration-300 ease-in-out ${
                    activeMethod === method.id
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {method.label}
                </button>
              )
            })}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="correo@ejemplo.com"
                onKeyPress={(e) => { if (/[áéíóúñÁÉÍÓÚÑ]/.test(e.key)) e.preventDefault() }}
                className={getInputClass('email')}
              />
              {errors.email && touched.email && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1 animate-fade-in">
                  <AlertCircle className="w-3 h-3" />{errors.email}
                </p>
              )}
            </div>

            {activeMethod === 'card' && (
              <div className="border-t border-slate-100 pt-4 animate-fade-in">
                <h3 className="text-sm font-semibold text-slate-700 mb-4">Información de la Tarjeta</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Número de Tarjeta</label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={form.cardNumber}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      onKeyPress={(e) => { if (!/[0-9\s]/.test(e.key)) e.preventDefault() }}
                      className={getInputClass('cardNumber')}
                    />
                    {errors.cardNumber && touched.cardNumber && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1 animate-fade-in">
                        <AlertCircle className="w-3 h-3" />{errors.cardNumber}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del Titular</label>
                    <input
                      type="text"
                      name="cardName"
                      value={form.cardName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="JUAN PÉREZ GARCÍA"
                      className={getInputClass('cardName')}
                    />
                    {errors.cardName && touched.cardName && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1 animate-fade-in">
                        <AlertCircle className="w-3 h-3" />{errors.cardName}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de Expiración</label>
                      <input
                        type="text"
                        name="expDate"
                        value={form.expDate}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="MM/AA"
                        maxLength={5}
                        onKeyPress={(e) => { if (!/[0-9]/.test(e.key)) e.preventDefault() }}
                        className={getInputClass('expDate')}
                      />
                      {errors.expDate && touched.expDate && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1 animate-fade-in">
                          <AlertCircle className="w-3 h-3" />{errors.expDate}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">CVV</label>
                      <input
                        type="text"
                        name="cvv"
                        value={form.cvv}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="123"
                        maxLength={3}
                        onKeyPress={(e) => { if (!/[0-9]/.test(e.key)) e.preventDefault() }}
                        className={getInputClass('cvv')}
                      />
                      {errors.cvv && touched.cvv && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1 animate-fade-in">
                          <AlertCircle className="w-3 h-3" />{errors.cvv}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-emerald-600 text-xs mt-4">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Tu información está protegida con encriptación SSL de 256 bits</span>
                </div>
              </div>
            )}

            {activeMethod === 'paypal' && (
              <div className="animate-fade-in">
                <p className="text-sm text-slate-600 mt-4">Te enviaremos el recibo de pago a este correo</p>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mt-4 text-sm text-slate-700 text-center">
                  Al continuar, serás redirigido a PayPal para completar el pago de forma segura. Podrás pagar con tu cuenta PayPal o tarjeta.
                </div>
              </div>
            )}

            {activeMethod === 'oxxo' && (
              <div className="animate-fade-in">
                <p className="text-sm text-slate-600 mt-4">Te enviaremos el recibo de pago a este correo</p>
                <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-4 mt-4 text-sm text-center">
                  Recibirás una ficha de pago para realizar el pago en cualquier tienda OXXO. El pago puede tardar hasta 48 horas en reflejarse.
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handlePay}
            className="w-full bg-blue-600 text-white rounded-lg px-4 py-3 font-medium transition-all duration-300 ease-in-out hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 flex items-center justify-center gap-2 mt-6"
          >
            Pagar Gratis
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 transition-all duration-300 ease-in-out">
            <h3 className="font-bold text-slate-800 mb-4">Resumen del Pedido</h3>
            <div className="flex justify-between items-center py-3 border-b border-slate-100">
              <span className="text-sm text-slate-600">Plan DEMO</span>
              <span className="text-sm font-semibold text-slate-800">Gratis</span>
            </div>
            <div className="flex justify-between items-center py-2 text-sm">
              <span className="text-slate-500">Subtotal</span>
              <span className="text-slate-600">$0.00</span>
            </div>
            <div className="flex justify-between items-center py-2 text-sm font-bold">
              <span className="text-slate-800">Total</span>
              <span className="text-slate-800">$0.00</span>
            </div>
            <div className="border-t border-slate-100 mt-4 pt-4">
              <p className="text-xs text-slate-400 font-medium mb-3">Incluye:</p>
              <ul className="space-y-2">
                {features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-slate-600">
                    <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
              <Shield className="w-4 h-4 text-emerald-500" />
              <span className="text-xs text-slate-500">Garantía de 30 días</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
