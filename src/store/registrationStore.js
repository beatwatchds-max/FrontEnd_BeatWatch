import { create } from 'zustand'

const useRegistrationStore = create((set) => ({
  usuarioId: null,
  correo: '',
  tipoLicencia: 'Grupal',
  licenciaId: null,
  step1Completed: false,
  step2Completed: false,
  setUsuarioData: (usuarioId, correo) => set({ usuarioId, correo, step1Completed: true }),
  setStep2Completed: () => set({ step2Completed: true }),
  setLicenciaId: (licenciaId) => set({ licenciaId }),
  clearRegistration: () => set({ usuarioId: null, correo: '', tipoLicencia: 'Grupal', licenciaId: null, step1Completed: false, step2Completed: false }),
}))

export default useRegistrationStore
