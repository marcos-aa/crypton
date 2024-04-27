import { QueryClient } from "@tanstack/react-query"
import { Form as RouterForm, redirect, useLocation } from "react-router-dom"

import { Stream, StreamData, SymTracker } from "shared/streamtypes"
import api from "../../../../../services/api"
import {
  delTicks,
  filterStreams,
  local,
  queryTicks,
  setPageState,
} from "../../../../../utils/helpers"
import CheckboxField from "../../../../AuthForm/CheckboxField"
import ModalContainer from "../../../../ModalContainer"
import CancellableAction from "../../CancellableAction"
import SubmitAction from "../../SubmitAction"
import { UserParams } from "../../UserSettings"
import styles from "./styles.module.scss"

export const deleteStream =
  (qc: QueryClient) =>
  async ({ request, params }: UserParams) => {
    const formData = await request.formData()
    const noPrompt = formData.get("prompt")

    if (noPrompt) localStorage.setItem(local.delPrompt, "false")
    let deletedStream: Stream
    let uniqueTicks: string[]

    const { streams } = qc.setQueryData<StreamData>(
      ["streams"],
      (cached): StreamData => {
        const symtracker: SymTracker = { ...cached.symtracker }
        const { streams, oldstream } = filterStreams(params.id, cached.streams)
        deletedStream = oldstream
        uniqueTicks = delTicks(oldstream?.symbols, symtracker)

        const tstreams = cached.tstreams - 1
        const tsyms = cached.tsyms - oldstream.symbols.length
        const usyms = cached.usyms - uniqueTicks.length

        return {
          streams,
          symtracker,
          tickers: cached.tickers,
          tstreams,
          tsyms,
          usyms,
        }
      }
    )

    const isGuest = localStorage.getItem(local.token) === "guest"
    const ticksParam = queryTicks(uniqueTicks, "?delsyms")

    if (isGuest) {
      localStorage.setItem(local.streams, JSON.stringify(streams))
      return redirect("/dashboard" + ticksParam)
    }

    api
      .delete("/streams", {
        data: {
          id: params.id,
        },
      })
      .catch(() => {
        setPageState(uniqueTicks, "newsyms")
        qc.setQueryData<StreamData>(["streams"], (curr) => {
          const streams = [...curr.streams]
          streams.unshift(deletedStream)

          return {
            ...curr,
            streams,
            tstreams: streams.length,
            tsyms: curr.tsyms + deletedStream.symbols.length,
            usyms: curr.usyms + uniqueTicks.length,
          }
        })
      })

    return redirect("/dashboard" + ticksParam)
  }

export default function DeleteStream() {
  const { pathname } = useLocation()

  return (
    <ModalContainer predecessor="/dashboard">
      <RouterForm id={styles.deletionForm} method="delete" action={pathname}>
        <h1> Do you wish to delete this stream? </h1>
        <CheckboxField label="Do not ask again" />

        <CancellableAction>
          <SubmitAction>Delete</SubmitAction>
        </CancellableAction>
      </RouterForm>
    </ModalContainer>
  )
}
