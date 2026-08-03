import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, Download, CreditCard, Calendar, Mail, FileText, Check } from 'lucide-react'
import useRegistrationStore from '../../store/registrationStore'

const API_BASE = 'https://backend-beatwatch.onrender.com'

function getStoredToken() {
  try {
    const raw = localStorage.getItem('bookstack-auth')
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed?.state?.token) return parsed.state.token
    }
  } catch {}
  return localStorage.getItem('auth_token')
}

export default function StepConfirmation() {
  const navigate = useNavigate()
  const { usuarioId, correo } = useRegistrationStore()
  const [downloading, setDownloading] = useState(false)

  const handleDownloadReceipt = async () => {
    const reciboId = usuarioId || 'ultimo'
    setDownloading(true)

    try {
      const token = getStoredToken()
      const headers = {}
      if (token) headers['Authorization'] = `Bearer ${token}`

      const response = await fetch(`${API_BASE}/api/Reportes/descargar/recibo/${reciboId}`, { headers })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: No se pudo descargar el recibo`)
      }

      const blob = await response.blob()
      console.log('RAW Recibo blob:', blob.type, blob.size)

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `recibo-${reciboId}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Error al descargar recibo:', err)
      alert(err.message || 'No se pudo descargar el recibo')
    } finally {
      setDownloading(false)
    }
  }

  const handleGoLogin = () => {
    navigate('/login')
  }

  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="mb-8">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-12 h-12 text-emerald-500" />
        </div>
        <h1 className="text-3xl font-extrabold text-emerald-600">¡Pago Confirmado!</h1>
        <p className="text-slate-500 mt-2">Tu registro ha sido completado exitosamente.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-left mb-8 transition-all duration-300 ease-in-out">
        <h2 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
          <FileText className="w-5 h-5 text-slate-400" />
          Detalles de la Transacción
        </h2>

        <div className="grid grid-cols-2 gap-y-4 gap-x-8">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider">Plan</p>
            <p className="text-sm font-semibold text-slate-800 mt-1">Plan DEMO - Gratis</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider">Método de Pago</p>
            <div className="flex items-center gap-2 mt-1">
              <CreditCard className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-semibold text-slate-800">•••• 3456</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider">Fecha</p>
            <div className="flex items-center gap-2 mt-1">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-semibold text-slate-800">30 de Julio, 2026</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider">Correo de Recibo</p>
            <div className="flex items-center gap-2 mt-1">
              <Mail className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-semibold text-slate-800">{correo || 'correo@ejemplo.com'}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 mt-6 pt-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Tu plan incluye</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              'Monitoreo 24/7 en tiempo real',
              'Detección de arritmias con IA',
              'Alertas automáticas por SMS',
              'Dashboard de salud personal',
              'Historial de 30 días',
              'Soporte por chat',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-slate-600">
                <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={handleGoLogin}
          className="w-full bg-blue-600 text-white rounded-lg px-4 py-3 font-medium transition-all duration-300 ease-in-out hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 flex items-center justify-center gap-2"
        >
          Ir al Login
        </button>
        <button
          onClick={() => navigate('/')}
          className="w-full border border-blue-500 text-blue-600 rounded-lg px-4 py-3 font-medium transition-all duration-300 ease-in-out hover:bg-blue-50 flex items-center justify-center gap-2"
        >
          Continuar en la App
        </button>
        <button
          onClick={handleDownloadReceipt}
          disabled={downloading}
          className="flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-slate-600 transition-all duration-300 ease-in-out mt-2 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {downloading ? 'Descargando...' : 'Descargar Recibo'}
        </button>
      </div>
    </div>
  )
}
