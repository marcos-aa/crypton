import { QueryClient } from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";
import { SyntheticEvent } from "react";
import { ResMessage } from "shared";
import {
  NewIds,
  RawStream,
  Stream,
  StreamData,
  SymTracker,
  Tickers,
} from "shared/streamtypes";
import * as yup from "yup";
import { NotifType } from "../components/views/Dashboard/Notification";
import api from "../services/api";

interface SymcountData {
  count: TotalCount;
  rawstreams: RawStream[];
  symbols: string[];
  newticks: Newticks;
}

interface GStreamData extends Omit<SymcountData, "count"> {
  data: TotalCount & { streams: Stream[] };
}

interface FilteredStreams {
  streams: Stream[];
  oldstream: Stream | null;
}

export interface InputData {
  name: string;
  email: string;
  password: string;
}

interface NotifReturn {
  message: string;
  type: Exclude<NotifType, "loading">;
}

interface Newticks {
  syms: string[];
  tickers: Tickers;
}
export type TotalCount = {
  tsyms: number;
  usyms: number;
  tstreams: number;
  symtracker: SymTracker;
};

export const local = {
  token: "u_token",
  streams: "u_streams",
  window: "u_prefWindow",
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

const TICKER_KEYS = ["average", "change", "last", "pchange"];

const formatSymbols = (
  store: Tickers,
  formatter: Intl.NumberFormat,
): Tickers => {
  const formatted: Tickers = {};
  for (const sym in store) {
    const ticker = store[sym];

    const [average, change, last, pchange] = TICKER_KEYS.map((key) => {
      return formatter.format(ticker[key]);
    });

    formatted[sym] = { ...ticker, average, change, last, pchange };
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
    stream.userId = uid;
    return { _id: { $oid: stream.id }, userId: uid, symbols: stream.symbols };
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
  let rawstreams: RawStream[];
  let subticks: Newticks;
  let gtsyms: number = 0;

  qc.setQueryData<StreamData>(["streams"], (curr) => {
    let streams: Stream[] = [...curr.streams];
    const createdBy = curr.streams[0]?.userId;

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
      gtsyms = data.tsyms;
      streams = streams.concat(data.streams);
      data.tstreams += curr.tstreams;
      data.tsyms += curr.tsyms;
    }
    genTickUrl(subticks.syms, "newsyms");
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

          return { id, userId: stream.userId, symbols: stream.symbols };
        });
        return { streams, ...curr };
      });

      return {
        message: "Data exported successfully",
        type: "success",
      };
    })
    .catch((e: AxiosError<ResMessage>): NotifReturn => {
      const rawstart = rawstreams[0]._id.$oid;
      revertStreams(qc, rawstart, rawstreams.length, gtsyms, subticks.syms);
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
  rawid: string,
  rawlength: number,
  rawtsyms: number,
  newticks: string[],
) => {
  qc.setQueryData<StreamData>(["streams"], (data) => {
    const symtracker = { ...data.symtracker };
    let { tsyms, usyms } = data;

    const delsyms = [];
    newticks.forEach((symbol) => {
      const key = symbol.split("@")[0].toUpperCase();
      const count = symtracker[key] - 1 || 0;

      if (count < 1) {
        delete symtracker[key];
        delsyms.push(symbol);
        usyms -= 1;
      }
    });
    genTickUrl(delsyms, "delsyms");

    const streams = [...data.streams];
    const rawstart = data.streams.findIndex((stream) => stream.id === rawid);
    streams.splice(rawstart, rawstart + rawlength);

    return {
      ...data,
      symtracker,
      streams,
      tstreams: streams.length,
      tsyms: tsyms - rawtsyms,
      usyms,
    };
  });
};

const genTickUrl = (ticks: string[], type: "newsyms" | "delsyms") => {
  const url = new URL(window.location.origin + window.location.pathname);
  url.searchParams.set(type, JSON.stringify(ticks));
  history.replaceState(history.state, "", url);
};

const addTicks = (
  symbols: string[],
  symtracker: SymTracker,
  tickers?: Tickers,
): Newticks => {
  const newticks = symbols.reduce<Newticks>(
    (store, sym) => {
      symtracker[sym] = symtracker[sym] + 1 || 1;
      if (symtracker[sym] == 1) {
        store.syms.push(formatTicker(sym));
        const tickstamp = new Date().getTime();
        store.tickers[sym] = tickers?.[sym] ?? {
          average: "0",
          last: "0",
          pchange: "0",
          change: "0",
          volume: 0,
          open: tickstamp,
          close: tickstamp,
          qvolume: 0,
          trades: 0,
        };
      }
      return store;
    },
    { syms: [], tickers: {} },
  );
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
  genTickUrl,
  importGStreams,
  queryTicks,
  stopPropagation,
  validateField,
  validateForm,
};
