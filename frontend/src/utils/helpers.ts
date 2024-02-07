import { QueryClient } from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";
import { SyntheticEvent } from "react";
import * as yup from "yup";
import { NotifType } from "../components/views/Dashboard/Notification";
import { Stream } from "../components/views/Dashboard/StreamList";
import api from "../services/api";
import { StreamData, SymCount, SymNumbers, Tickers } from "./datafetching";

interface SymData extends SymNumbers {
  impstreams: IMPStream[];
  symbols: string[];
  symcount: SymCount;
}

interface FilteredStreams {
  streams: Stream[];
  oldstream: Stream | null;
}

type RawStream = Omit<Stream, "id"> & {
  _id: {
    $oid: string;
  };
};

type IMPStream = Omit<Stream, "id">;

type GStreamData = SymData & {
  streams: Stream[];
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
  prevcount: SymCount,
): SymData => {
  const allsyms: string[] = [];
  const impstreams: RawStream[] = streams.map((stream) => {
    allsyms.push(...stream.symbols);
    return { _id: { $oid: stream.id }, user_id: uid, symbols: stream.symbols };
  });

  const symcount = allsyms.reduce<SymCount>((store, sym: string) => {
    store[sym] = store[sym] + 1 || 1;
    return store;
  }, prevcount);

  const symbols = Object.keys(symcount);
  const usyms = symbols.length;
  const tsyms = allsyms.length;
  const tstreams = streams.length;

  return { impstreams, symcount, symbols, tsyms, usyms, tstreams };
};

const genGStreamData = (uid: string, prevcount: SymCount = {}): GStreamData => {
  const streams: Stream[] =
    JSON.parse(localStorage.getItem(local.streams)) || [];
  const symdata = genSymcount(uid, streams, prevcount);
  const streamData = Object.assign(symdata, { streams });
  return streamData;
};

const importGStreams = async (
  qc: QueryClient,
  uid: string,
): Promise<NotifReturn> => {
  let gstreams: Stream[], impstreams: IMPStream[];

  qc.setQueryData<StreamData>(["streams"], (curr: StreamData) => {
    let streams: Stream[] = curr?.streams || [];
    const createdBy = curr?.streams[0]?.user_id;
    const data = genGStreamData(uid, curr?.symcount);

    gstreams = data.streams;
    impstreams = data.impstreams;

    if (createdBy !== "guest") streams = streams.concat(gstreams);

    return {
      ...data,
      streams,
      tickers: curr.tickers,
    };
  });

  localStorage.removeItem(local.streams);
  localStorage.removeItem(local.expStreams);

  return api
    .post<NewIds>("/streams/import", {
      streams: impstreams,
    })
    .then((res: AxiosResponse<NewIds>): NotifReturn => {
      qc.setQueryData<StreamData>(["streams"], (curr) => {
        const dupids = Object.keys(res.data);

        const streams = [...curr.streams];
        streams.forEach((stream) => {
          if (dupids.includes(stream.id)) {
            stream.id = res.data[stream.id];
          }
        });
        return { streams, ...curr };
      });

      return {
        message: "Data exported successfully",
        type: "success",
      };
    })
    .catch((e: AxiosError<ResMessage>): NotifReturn => {
      qc.invalidateQueries(["streams"]);
      localStorage.setItem(local.expStreams, "failure");
      localStorage.setItem(local.streams, JSON.stringify(gstreams));

      return {
        message:
          e.response?.data?.message ||
          "Your streams failed to be exported. Please try again",
        type: "error",
      };
    });
};

const addTicks = (symbols: string[], symcount: SymCount): string[] => {
  const newticks = symbols.reduce((store: string[], sym) => {
    symcount[sym] = symcount[sym] + 1 || 1;
    if (symcount[sym] == 1) store.push(formatTicker(sym));
    return store;
  }, []);

  return newticks;
};

const delTicks = (oldsymbols: string[], symcount: SymCount): string[] => {
  const delticks = oldsymbols.reduce((store: string[], oldsym) => {
    symcount[oldsym] -= 1;
    if (symcount[oldsym] < 1) {
      delete symcount[oldsym];
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
