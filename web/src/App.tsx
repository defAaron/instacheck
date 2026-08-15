import { useState } from "react"
import { Landing } from "@/components/Landing"
import { Results } from "@/components/Results"
import { analyzeFiles, type Analysis } from "@/lib/analyze"

type AppState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; analysis: Analysis }

export default function App() {
  const [handle, setHandle] = useState("")
  const [state, setState] = useState<AppState>({ status: "idle" })

  const onFiles = async (files: File[]) => {
    setState({ status: "loading" })
    try {
      const analysis = await analyzeFiles(files)
      setState({ status: "ready", analysis })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not read that export."
      setState({ status: "error", message })
    }
  }

  if (state.status === "ready") {
    return (
      <Results
        handle={handle}
        analysis={state.analysis}
        onReset={() => setState({ status: "idle" })}
      />
    )
  }

  return (
    <Landing
      handle={handle}
      onHandleChange={setHandle}
      loading={state.status === "loading"}
      error={state.status === "error" ? state.message : null}
      onFiles={onFiles}
    />
  )
}
