import { AKIS_FLOW_STEPS } from './constants/flowSteps.js'
import { useAkisFlow } from './hooks/useAkisFlow.js'
import AkisFlowCanvas from './components/AkisFlowCanvas.jsx'
import { AkisChrome } from './components/AkisChrome.jsx'
import { AkisHeader } from './components/AkisHeader.jsx'
import { AkisStepPanel } from './components/AkisStepPanel.jsx'
import { AkisFooter } from './components/AkisFooter.jsx'

export default function AkisPage() {
  const steps = AKIS_FLOW_STEPS
  const total = steps.length

  const { activeIndex, setActiveIndex, autoPlay, setAutoPlay, goNext, goPrev } = useAkisFlow(total)

  const step = steps[activeIndex]

  return (
    <div className="akis-page">
      <AkisChrome />

      <AkisFlowCanvas steps={steps} activeIndex={activeIndex} onSelectStep={setActiveIndex} />

      <AkisHeader autoPlay={autoPlay} onAutoPlayChange={setAutoPlay} />

      <AkisStepPanel
        steps={steps}
        activeIndex={activeIndex}
        total={total}
        step={step}
        onSelectStep={setActiveIndex}
        onPrev={goPrev}
        onNext={goNext}
      />

      <AkisFooter />
    </div>
  )
}
