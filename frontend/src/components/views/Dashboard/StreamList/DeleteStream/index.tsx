import { QueryClient } from "@tanstack/react-query";
import { Form as RouterForm, redirect, useLocation } from "react-router-dom";

import { Stream } from "..";
import api from "../../../../../services/api";
import {
  delTicks,
  filterStreams,
  genTickUrl,
  local,
  queryTicks,
} from "../../../../../utils/helpers";
import CheckboxField from "../../../../AuthForm/CheckboxField";
import ModalContainer from "../../../../ModalContainer";
import CancellableAction from "../../CancellableAction";
import SubmitAction from "../../SubmitAction";
import { UserParams } from "../../UserSettings";
import styles from "./styles.module.scss";
import { StreamData, SymTracker } from "shared/streamtypes";

export const deleteStream =
  (qc: QueryClient) =>
  async ({ request, params }: UserParams) => {
    const formData = await request.formData();
    const noPrompt = formData.get("prompt") as string;

    if (noPrompt) localStorage.setItem(local.delPrompt, "false");
    let delstream: Stream;
    let delticks: string[];

    const { streams } = qc.setQueryData<StreamData>(
      ["streams"],
      (cached): StreamData => {
        const symtracker: SymTracker = { ...cached.symtracker };
        const { streams, oldstream } = filterStreams(params.id, cached.streams);
        delstream = oldstream;
        delticks = delTicks(oldstream?.symbols, symtracker);

        const tstreams = cached.tstreams - 1;
        const tsyms = cached.tsyms - oldstream.symbols.length;
        const usyms = cached.usyms - delticks.length;

        return {
          streams,
          symtracker,
          tickers: cached.tickers,
          tstreams,
          tsyms,
          usyms,
        };
      },
    );

    const isGuest = localStorage.getItem(local.id) === "guest";
    const delparams = queryTicks(delticks, "?delticks");

    if (isGuest) {
      localStorage.setItem(local.streams, JSON.stringify(streams));
      return redirect(`/dashboard` + delparams);
    }

    api
      .delete("/streams", {
        data: {
          id: params.id,
        },
      })
      .catch(() => {
        genTickUrl(delticks, "newticks");
        qc.setQueryData<StreamData>(["streams"], (curr) => {
          const streams = [...curr.streams];
          streams.unshift(delstream);
          return { ...curr, streams };
        });
      });

    return redirect(`/dashboard` + delparams);
  };

export default function DeleteStream() {
  const { pathname } = useLocation();

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
  );
}
