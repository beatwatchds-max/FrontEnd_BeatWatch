import { create } from 'zustand'

const useRegistrationStore = create((set) => ({
  usuarioId: null,
  correo: '',
  setUsuarioData: (usuarioId, correo) => set({ usuarioId, correo }),
  clearRegistration: () => set({ usuarioId: null, correo: '' }),
}))

export default useRegistrationStore
