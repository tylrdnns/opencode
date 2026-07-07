import { createSignal, onCleanup, Show, type Component } from "solid-js"
import { IconButton } from "@opencode-ai/ui/icon-button"
import { TooltipV2 } from "@opencode-ai/ui/v2/tooltip-v2"
import { KeybindV2 } from "@opencode-ai/ui/v2/keybind-v2"

interface VoiceInputProps {
  onTranscript: (text: string) => void
  disabled?: boolean
  class?: string
}

const SpeechRecognitionAPI =
  typeof window !== "undefined"
    ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    : undefined

export const VoiceInput: Component<VoiceInputProps> = (props) => {
  const [listening, setListening] = createSignal(false)
  let recognition: any = null
  let finalTranscript = ""

  function start() {
    if (!SpeechRecognitionAPI) return
    if (recognition) {
      try {
        recognition.stop()
      } catch {}
    }

    recognition = new SpeechRecognitionAPI()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = "en-US"
    finalTranscript = ""

    recognition.onresult = (event: any) => {
      let interim = ""
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalTranscript += result[0].transcript
        } else {
          interim += result[0].transcript
        }
      }
      props.onTranscript(finalTranscript + interim)
    }

    recognition.onend = () => {
      if (listening()) {
        // Web Speech API auto-stops after silence — restart if still in listening mode
        try {
          recognition.start()
        } catch {
          stop()
        }
      }
    }

    recognition.onerror = (event: any) => {
      if (event.error === "no-speech" || event.error === "aborted") return
      console.error("Speech recognition error:", event.error)
      stop()
    }

    setListening(true)
    try {
      recognition.start()
    } catch {
      setListening(false)
    }
  }

  function stop() {
    setListening(false)
    if (recognition) {
      try {
        recognition.stop()
      } catch {}
      recognition = null
    }
  }

  function toggle() {
    if (listening()) {
      stop()
    } else {
      start()
    }
  }

  onCleanup(() => {
    stop()
  })

  return (
    <Show when={SpeechRecognitionAPI}>
      <TooltipV2
        placement="top"
        value={
          <>
            {listening() ? "Stop voice input" : "Voice input"}
            <KeybindV2 keys={["ctrl", "shift", "m"]} variant="neutral" />
          </>
        }
      >
        <IconButton
          data-action="prompt-voice"
          type="button"
          icon={listening() ? "mic-off" : "mic"}
          variant="ghost"
          class={`size-7 rounded-md p-[6px] ${listening() ? "text-red-500 animate-pulse" : "text-v2-icon-icon-muted"} ${props.class ?? ""}`}
          onClick={toggle}
          disabled={props.disabled}
          aria-label={listening() ? "Stop voice input" : "Start voice input"}
        />
      </TooltipV2>
    </Show>
  )
}

export { SpeechRecognitionAPI as hasSpeechRecognition }
