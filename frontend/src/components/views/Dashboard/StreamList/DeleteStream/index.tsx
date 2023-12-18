import { QueryClient } from "@tanstack/react-query";
import { redirect } from "react-router-dom";

import api from "../../../../../services/api";
import { StreamData } from "../../../../../utils/datafetching";
import {
  TickSubs,
  delTicks,
  filterStreams,
  local,
  queryTicks,
} from "../../../../../utils/helpers";
import { UserParams } from "../../UserSettings";
import ConfirmPrompt from "../ConfirmPrompt";

export const deleteStream =
  (qc: QueryClient) =>
  async ({ request, params }: UserParams) => {
    const formData = await request.formData();
    const remember = formData.get("remember") as string;
    if (remember) localStorage.setItem("u:prompt_delete", "off");

    const ticks: TickSubs = { newticks: [], delticks: [] };

    const { streams } = qc.setQueryData<StreamData>(
      ["streams"],
      (cached: StreamData) => {
        const newcount = { ...cached.symcount };
        const { streams, oldstream } = filterStreams(params.id, cached.streams);
        ticks.delticks = delTicks(oldstream?.symbols, newcount);
        return { ...cached, streams, symcount: newcount };
      },
    );

    const isGuest = localStorage.getItem(local.id) === "guest";
    const delparams = queryTicks(ticks.delticks, "?delticks");

    if (isGuest) {
      localStorage.setItem(local.streams, JSON.stringify(streams));
      return redirect(`/dashboard` + delparams);
    }

    api
      .delete("/stream", {
        data: {
          id: params.id,
        },
      })
      .catch(() => {
        const url = new URL(window.location.origin + window.location.pathname);
        url.searchParams.set("newticks", JSON.stringify(ticks.delticks));
        history.replaceState(history.state, "", url);
        qc.invalidateQueries(["streams"]);
      });

    return redirect(`/dashboard` + delparams);
  };

export default function DeleteStream() {
  return (
    <ConfirmPrompt
      actionName="Delete"
      question="Do you wish to delete this stream?"
    />
  );
}
