import { ref, watch, onUnmounted, type Ref } from 'vue'

const DURATION_MS = 500

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

/**
 * Eases a displayed number towards a reactive target over ~500ms using
 * requestAnimationFrame, so figures like the HUD balance or a payout visibly
 * tick up/down instead of jumping. Jumps straight to the target when the
 * user prefers reduced motion.
 */
export function useAnimatedNumber(target: Ref<number>) {
  const displayed = ref(target.value)
  let frame: number | null = null

  function animate(from: number, to: number) {
    if (frame !== null) {
      cancelAnimationFrame(frame)
      frame = null
    }

    if (prefersReducedMotion()) {
      displayed.value = to
      return
    }

    const start = performance.now()
    const step = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(1, elapsed / DURATION_MS)
      displayed.value = from + (to - from) * easeOutCubic(progress)
      frame = progress < 1 ? requestAnimationFrame(step) : null
    }
    frame = requestAnimationFrame(step)
  }

  watch(target, (newValue, oldValue) => {
    animate(oldValue ?? newValue, newValue)
  })

  onUnmounted(() => {
    if (frame !== null) cancelAnimationFrame(frame)
  })

  return displayed
}
