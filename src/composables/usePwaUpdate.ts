import { registerSW } from 'virtual:pwa-register'
import { useToastStore } from '@/stores/toastStore'

export function usePwaUpdate() {
  const toastStore = useToastStore()

  let updateSW: ((reloadPage?: boolean) => Promise<void>) | undefined

  updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      toastStore.addToast({
        type: 'success',
        title: 'Update available',
        message: 'A new version of Penny Plummet is ready.',
        icon: 'bi-arrow-clockwise',
        persist: true,
        action: {
          label: 'Reload to update',
          handler: () => updateSW?.(true),
        },
      })
    },
  })
}
