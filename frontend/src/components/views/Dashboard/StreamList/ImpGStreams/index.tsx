import { QueryClient } from "@tanstack/react-query";
import { redirect } from "react-router-dom";
import { importGStreams, local } from "../../../../../utils/helpers";
import { UserParams } from "../../UserSettings";
import ConfirmPrompt from "../ConfirmPrompt";

export const impStreamsAction =
  (qc: QueryClient) =>
  async ({ request }: UserParams) => {
    const formData = await request.formData();
    const remember = formData.get("remember") as string;
    if (remember) localStorage.setItem(local.imp_prompt, "off");

    importGStreams(qc, localStorage.getItem(local.id));

    return redirect("/dashboard");
  };

export default function ImpGStreams() {
  return (
    <ConfirmPrompt
      actionName="Import streams"
      question="Do you wish to import streams from a local guest account?"
    />
  );
}
