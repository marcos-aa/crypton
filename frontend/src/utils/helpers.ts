import { QueryClient } from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";
import { SyntheticEvent } from "react";
import * as yup from "yup";
import { NotifType } from "../components/views/Dashboard/Notification";
import { Stream } from "../components/views/Dashboard/StreamList";
import api from "../services/api";
import { StreamData, SymTracker, Tickers } from "./datafetching";

interface SymcountData {
  count: TotalCount;
  rawstreams: RawStream[];
  symbols: string[];
  newticks: string[];
}

interface GStreamData extends Omit<SymcountData, "count"> {
  data: TotalCount & { streams: Stream[] };
}

interface FilteredStreams {
  streams: Stream[];
  oldstream: Stream | null;
}

export type TotalCount = {
  tsyms: number;
  usyms: number;
  tstreams: number;
  symtracker: SymTracker;
};

type RawStream = Omit<Stream, "id"> & {
  _id: {
    $oid: string;
  };
};

interface NewIds {
  [id: string]: string;
}

interface ResMessage {
  message: string;
}

export interface InputData {
  name: string | null;
  email: string | null;
  password: string | null;
}

export interface TickSubs {
  newticks: string[];
  delticks: string[];
  redirect?: boolean;
}

interface NotifReturn {
  message: string;
  type: Exclude<NotifType, "loading">;
}

export const local = {
  id: "u_id",
  token: "u_token",
  streams: "u_streams",
  joined: "u_joinDate",
  expStreams: "u_exportStreams",
  expPrompt: "u:exportPrompt",
  delPrompt: "u:delPrompt",
};

export const messages: { [key: string]: string } = {
  name: "Name must contain only word characters.",
  email: "Please enter a valid email.",
  pass: "Passwords must have special, uppercase, lowercase and digit characters",
  passmin: "Password must have at least 8 characters",
  passmax: "Password must have at most 32 characters",
  cpassword: "Passwords must match",
};

const passRegex = /^([^0-9]*|[^A-Z]*|[^a-z]*|[a-zA-Z0-9]*)$/;

const userSchema = yup
  .object({
    name: yup.string().matches(/\w/, messages.name).required(),
    email: yup
      .string()
      .email(messages.email)
      .required("Email must not be empty"),
    password: yup
      .string()
      .min(8, messages.passmin)
      .max(32, messages.passmax)
      .test({
        test: (v: string) => !passRegex.test(v),
        message: messages.pass,
      }),
  })
  .noUnknown(true, "Form must not contain invalid fields");

const schemas = {
  auth: userSchema.pick(["email", "password"]).noUnknown(true),
  password: userSchema.pick(["password"]).noUnknown(true),
  signup: userSchema,
};

const formatTicker = (symbol: string): string => {
  const ticker = (symbol + "@ticker").toLowerCase();
  return ticker;
};

const formatSymbols = (
  store: Tickers,
  formatter: Intl.NumberFormat,
): Tickers => {
  const formatted: Tickers = {};
  for (const sym in store) {
    const keys = Object.keys(store[sym]).sort();
    const [average, change, last, pchange] = keys.map((k) =>
      formatter.format(store[sym][k]),
    );
    formatted[sym] = { average, change, last, pchange };
  }
  return formatted;
};

const validateForm = (
  input: InputData,
  schema: "signup" | "password" | "auth" = "auth",
): void | string => {
  try {
    schemas[schema].validateSync(input);
  } catch (e) {
    throw new Error((e as yup.ValidationError).errors[0]);
  }
};

const stopPropagation = (e: SyntheticEvent) => {
  e.stopPropagation();
};

const validateField = (
  property: string,
  input: Partial<InputData>,
): void | string => {
  try {
    userSchema.validateSyncAt(property, input);
  } catch (e) {
    const message = (e as yup.ValidationError).errors[0];
    throw message;
  }
};

const genSymcount = (
  uid: string,
  streams: Stream[],
  tracker: SymTracker,
): SymcountData => {
  const allsyms: string[] = [];
  const rawstreams: RawStream[] = streams.map((stream) => {
    allsyms.push(...stream.symbols);
    stream.user_id = uid;
    return { _id: { $oid: stream.id }, user_id: uid, symbols: stream.symbols };
  });

  const newticks = addTicks(allsyms, tracker);

  const symbols = Object.keys(tracker);
  const usyms = symbols.length;
  const tsyms = allsyms.length;
  const tstreams = streams.length;

  return {
    count: {
      tstreams,
      tsyms,
      usyms,
      symtracker: tracker,
    },
    rawstreams,
    symbols,
    newticks,
  };
};

const genGStreamData = (uid: string, tracker: SymTracker = {}): GStreamData => {
  const streams: Stream[] =
    JSON.parse(localStorage.getItem(local.streams)) || [];
  const { count, rawstreams, newticks, symbols } = genSymcount(
    uid,
    streams,
    tracker,
  );
  const data = Object.assign(count, { streams });
  return { data, rawstreams, newticks, symbols };
};

const importGStreams = async (
  qc: QueryClient,
  uid: string,
): Promise<NotifReturn> => {
  let rawstreams: RawStream[], prevstreams: Stream[];
  let subticks: string[];

  genTickUrl(subticks, "newticks");
  qc.setQueryData<StreamData>(["streams"], (curr): StreamData => {
    prevstreams = [...curr.streams];
    let streams: Stream[];
    const createdBy = curr.streams[0]?.user_id;

    const {
      data,
      rawstreams: rstreams,
      newticks,
    } = genGStreamData(uid, {
      ...curr.symtracker,
    });

    rawstreams = rstreams;
    subticks = newticks;

    if (createdBy != "guest") {
      streams = prevstreams.concat(data.streams);
      data.tstreams += curr.tstreams;
      data.tsyms += curr.tsyms;
    }

    genTickUrl(subticks, "newticks");
    return {
      ...data,
      streams,
      tickers: curr?.tickers,
    };
  });

  localStorage.removeItem(local.expStreams);

  return api
    .post<NewIds>("/streams/import", {
      streams: rawstreams,
    })
    .then((res: AxiosResponse<NewIds>): NotifReturn => {
      localStorage.removeItem(local.streams);

      qc.setQueryData<StreamData>(["streams"], (curr) => {
        const dupids = Object.keys(res.data);

        const streams = curr.streams.map<Stream>((stream) => {
          const id = dupids.includes(stream.id)
            ? res.data[stream.id]
            : stream.id;

          return { id, user_id: stream.user_id, symbols: stream.symbols };
        });
        return { streams, ...curr };
      });

      return {
        message: "Data exported successfully",
        type: "success",
      };
    })
    .catch((e: AxiosError<ResMessage>): NotifReturn => {
      revertStreams(qc, prevstreams, subticks, "delticks");
      localStorage.setItem(local.expStreams, "failure");

      return {
        message:
          e.response?.data?.message ||
          "Your streams failed to be exported. Please try again",
        type: "error",
      };
    });
};

const revertStreams = (
  qc: QueryClient,
  streams: Stream[],
  ticks: string[],
  type: "newticks" | "delticks",
) => {
  genTickUrl(ticks, type);
  qc.setQueryData<StreamData>(["streams"], (data) => ({
    ...data,
    streams,
  }));
};

const genTickUrl = (ticks: string[], type: "newticks" | "delticks") => {
  const url = new URL(window.location.origin + window.location.pathname);
  url.searchParams.set(type, JSON.stringify(ticks));
  history.replaceState(history.state, "", url);
};

const addTicks = (symbols: string[], symtracker: SymTracker): string[] => {
  const newticks = symbols.reduce((store: string[], sym) => {
    symtracker[sym] = symtracker[sym] + 1 || 1;
    if (symtracker[sym] == 1) store.push(formatTicker(sym));
    return store;
  }, []);
  return newticks;
};

const delTicks = (oldsymbols: string[], symtracker: SymTracker): string[] => {
  const delticks = oldsymbols.reduce((store: string[], oldsym) => {
    symtracker[oldsym] -= 1;
    if (symtracker[oldsym] < 1) {
      delete symtracker[oldsym];
      store.push(formatTicker(oldsym));
    }
    return store;
  }, []);

  return delticks;
};

const queryTicks = (ticks: string[], key: string): string => {
  const queryName = `${key}=`;
  if (ticks.length < 1) return queryName + "[]";
  const encoded = encodeURIComponent(JSON.stringify(ticks));
  const tickParam = `${queryName}${encoded}`;
  return tickParam;
};

const filterStreams = (id: string, streams: Stream[]): FilteredStreams => {
  let oldstream: Stream;
  const newstreams = streams.filter((stream) => {
    if (stream.id === id) oldstream = stream;
    return stream.id !== id;
  });
  return { streams: newstreams, oldstream };
};

export {
  addTicks,
  delTicks,
  filterStreams,
  formatSymbols,
  formatTicker,
  genGStreamData,
  importGStreams,
  queryTicks,
  stopPropagation,
  validateField,
  validateForm,
};
