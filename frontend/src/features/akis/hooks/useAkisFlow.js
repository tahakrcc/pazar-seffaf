import { useState, useEffect, useCallback } from 'react'
import { AKIS_AUTO_ADVANCE_MS } from '../constants/timing.js'

/**
 * @param {number} stepCount
 */
export function useAkisFlow(stepCount) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [autoPlay, setAutoPlay] = useState(true)

  const goNext = useCallback(() => {
    setActiveIndex((i) => (i + 1) % stepCount)
  }, [stepCount])

  const goPrev = useCallback(() => {
    setActiveIndex((i) => (i - 1 + stepCount) % stepCount)
  }, [stepCount])

  useEffect(() => {
    if (!autoPlay) return undefined
    const id = window.setInterval(goNext, AKIS_AUTO_ADVANCE_MS)
    return () => window.clearInterval(id)
  }, [autoPlay, goNext])

  return {
    activeIndex,
    setActiveIndex,
    autoPlay,
    setAutoPlay,
    goNext,
    goPrev,
  }
}
