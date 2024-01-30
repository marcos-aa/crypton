import { QueryClient } from "@tanstack/react-query";
import { SyntheticEvent } from "react";
import * as yup from "yup";
import { Stream } from "../components/views/Dashboard/StreamList";
import api from "../services/api";
import { StreamData, SymCount, Tickers } from "./datafetching";

export interface ReturnError {
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

interface OldStreamData {
  streams: Stream[];
  oldstream: Stream;
}

interface NewIds {
  [id: string]: string;
}

type IMPStream = Omit<Stream, "id">;

interface SymcountData {
  impstreams: IMPStream[];
  symbols: string[];
  symcount: SymCount;
}

type GStreamData = SymcountData & {
  gstreams: Stream[];
};

type RawStream = Omit<Stream, "id"> & {
  _id: {
    $oid: string;
  };
};

export const local = {
  id: "u_id",
  token: "u_token",
  streams: "u_streams",
  joined: "u_joindate",
  imp_streams: "u_import_streams",
  imp_prompt: "u:import_prompt",
  del_prompt: "u:delete_prompt",
};

export const messages: { [key: string]: string } = {
  name: "Name must contain only alphabet characters.",
  email: "Please enter a valid email.",
  pass: "Passwords must have special, uppercase, lowercase and digit characters",
  passmin: "Password must have at least 8 characters",
  passmax: "Password must have at most 32 characters",
  cpassword: "Passwords must match",
};

const reg = /^([^0-9]*|[^A-Z]*|[^a-z]*|[a-zA-Z0-9]*)$/;

const userSchema = yup
  .object({
    name: yup
      .string()
      .matches(/^[^0-9]+$/, messages.name)
      .required(),
    email: yup.string().email(messages.email).required(),
    password: yup
      .string()
      .min(8, messages.passmin)
      .max(32, messages.passmax)
      .test({
        test: (v: string) => !reg.test(v),
        message: messages.pass,
      }),
  })
  .noUnknown(true, "Invalid fields detected");

const schemas = {
  auth: userSchema.pick(["email", "password"]).noUnknown(true),
  password: userSchema.pick(["password"]).noUnknown(true),
  signup: userSchema,
};

const formatTicker = (symbol: string) => {
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
): SymcountData => {
  const allsyms = [];

  const impstreams: RawStream[] = streams.map((stream) => {
    allsyms.push(...stream.symbols);
    return { _id: { $oid: stream.id }, user_id: uid, symbols: stream.symbols };
  });

  const symcount = allsyms.reduce((store: SymCount, sym: string) => {
    store[sym] = store[sym] + 1 || 1;
    return store;
  }, prevcount);

  const symbols = Object.keys(symcount);

  return { impstreams, symcount, symbols };
};

const genGStreamData = (uid: string, prevcount: SymCount = {}): GStreamData => {
  const gstreams: Stream[] =
    JSON.parse(localStorage.getItem(local.streams)) || [];
  const { impstreams, symcount, symbols } = genSymcount(
    uid,
    gstreams,
    prevcount,
  );

  return { gstreams, impstreams, symbols, symcount };
};

const importGStreams = async (qc: QueryClient, uid: string) => {
  let gstreams: Stream[], impstreams: IMPStream[];

  qc.setQueryData<StreamData>(["streams"], (curr) => {
    if (!curr) curr = { streams: [], symcount: {}, tickers: {} };

    let streams: Stream[] = curr.streams;
    const createdBy = curr.streams[0]?.user_id;
    const data = genGStreamData(uid, curr.symcount);

    gstreams = data.gstreams;
    impstreams = data.impstreams;

    if (createdBy !== "guest") streams = streams.concat(gstreams);

    return {
      streams,
      symcount: data.symcount,
      tickers: curr.tickers,
    };
  });

  api
    .post<NewIds>("/streams/import", {
      streams: impstreams,
    })
    .then((res) => {
      localStorage.removeItem(local.streams);
      localStorage.removeItem(local.imp_streams);
      qc.setQueryData<StreamData>(["streams"], (curr) => {
        const dupids = Object.keys(res.data);

        const streams = [...curr.streams];
        streams.forEach((stream) => {
          if (dupids.includes(stream.id)) {
            stream.id = res.data[stream.id];
          }
        });

        return { streams, symcount: curr.symcount, tickers: curr.tickers };
      });
    })
    .catch(() => {
      qc.invalidateQueries(["streams"]);
      localStorage.setItem(local.streams, JSON.stringify(gstreams));
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

const delTicks = (oldsymbols: string[], symcount: SymCount) => {
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

const filterStreams = (id: string, streams: Stream[]): OldStreamData => {
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
