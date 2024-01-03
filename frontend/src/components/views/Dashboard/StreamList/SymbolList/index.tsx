import { faMagnifyingGlass, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { QueryClient } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import { ChangeEvent, MouseEvent, useMemo, useState } from "react";
import { redirect, useLoaderData, useLocation } from "react-router";
import { Form } from "react-router-dom";
import { v4 as uuid } from "uuid";

import { Stream } from "..";
import api from "../../../../../services/api";
import {
  StreamData,
  SymCount,
  getPairs,
} from "../../../../../utils/datafetching";
import {
  TickSubs,
  addTicks,
  delTicks,
  filterStreams,
  local,
  queryTicks,
} from "../../../../../utils/helpers";
import ModalContainer from "../../../../ModalContainer";
import CancellableAction from "../../CancellableAction";
import Signwall from "../../Signwall";
import SubmitAction from "../../SubmitAction";
import { UserParams } from "../../UserSettings";
import ActionAnimation from "../ActionAnimation";
import styles from "./styles.module.scss";

export interface StreamProps {
  stream?: Stream;
  socket?: WebSocket;
  verified: boolean;
}

export interface CatchError {
  [response: string]: AxiosResponse;
}

const pairsQuery = () => ({
  queryKey: ["currencies"],
  queryFn: async () => getPairs(),
});

export const pairsLoader = (qc) => async () => {
  const query = pairsQuery();
  const currencies: string[] = await qc.ensureQueryData(query);
  return currencies;
};

const craLocStream = (symbols: string[]): { data: Stream } => {
  const streams = JSON.parse(localStorage.getItem(local.streams)) || [];
  const id = uuid().substring(0, 8);
  const newStream = {
    id: `g-streams-${id}`,
    symbols,
  };

  streams.push(newStream);
  localStorage.setItem(local.streams, JSON.stringify(streams));
  return { data: newStream };
};

export const upsertStream =
  (qc: QueryClient) =>
  async ({ request, params }: UserParams) => {
    const method = request.method.toLowerCase();
    const formData = await request.formData();
    const userId = localStorage.getItem(local.id);
    const config: Partial<Stream> = {
      symbols: formData.getAll("selected") as string[],
    };
    console.log("upsert");
    if (params.id) config.id = params.id;

    const { data: stream } =
      userId == "guest"
        ? craLocStream(config.symbols)
        : await api[method]<Stream>("/streams", config);

    let { newticks, delticks }: TickSubs = { newticks: [], delticks: [] };

    qc.setQueryData<StreamData>(["streams"], (cached) => {
      const { streams, oldstream } = filterStreams(config.id, cached.streams);
      const newcount: SymCount = { ...cached.symcount };
      streams.unshift(stream);
      newticks = addTicks(stream.symbols, newcount);

      if (method === "put") {
        delticks = delTicks(oldstream.symbols, newcount);
      }

      return { symcount: newcount, streams, tickers: cached.tickers };
    });

    const [sub, unsub] = [
      queryTicks(newticks, "newticks"),
      queryTicks(delticks, "delticks"),
    ];

    return redirect(`/dashboard?${sub}&${unsub}`);
  };

export interface PageState {
  pathname: string;
  state: { verified: boolean; symbols: string[] };
}

export default function SymbolList() {
  const pairs = useLoaderData() as string[];
  const { state: pagestate, pathname }: PageState = useLocation();
  const [selected, setSelected] = useState<string[]>(pagestate?.symbols || []);
  const [search, setSearch] = useState<string>("");

  const handlePush = (event: MouseEvent) => {
    const newsym = (event.target as HTMLLIElement).textContent;
    const hasDuplicate = selected.some((symbol) => symbol == newsym);

    if (selected.length < 5 && !hasDuplicate) {
      setSelected((prev) => [...prev, newsym]);
    }
  };

  const handleRemoval = (delsym: string) => {
    setSelected((prev) => prev.filter((sym) => sym !== delsym));
  };

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  const matchingPairs = useMemo(() => {
    return (pairs as string[]).filter((symbol: string) =>
      symbol.includes(search.toLocaleUpperCase()),
    );
  }, [search]);

  return (
    <ModalContainer id={styles.symbolModal} predecessor="/dashboard">
      {!pagestate?.verified && pagestate?.symbols && <Signwall />}

      <header id={styles.modalHeader}>
        <h1> Select up to 5 currencies </h1>
        <label id={styles.searchBox}>
          <FontAwesomeIcon icon={faMagnifyingGlass} />
          <input
            name="search"
            type="text"
            placeholder="Search"
            value={search}
            onChange={handleSearch}
          />
        </label>
      </header>

      <Form
        id={styles.symbolOptions}
        action={pathname}
        method={pagestate?.symbols ? "put" : "post"}
      >
        <div id={styles.activeItems}>
          {selected?.map((symbol) => {
            return (
              <div
                id={styles.activeItem}
                key={symbol}
                onClick={() => handleRemoval(symbol)}
              >
                <input
                  type="text"
                  value={symbol}
                  readOnly
                  name="selected"
                  className={styles.selected}
                />
                <button type="button" aria-label={`Remove ${symbol}`}>
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </div>
            );
          })}
        </div>

        <CancellableAction>
          <ActionAnimation actpath={pathname}>
            <SubmitAction disabled={selected.length < 1}>
              {pagestate?.symbols ? "Update" : "Create"}
            </SubmitAction>
          </ActionAnimation>
        </CancellableAction>
      </Form>

      <ul id={styles.symbolList}>
        {matchingPairs.map((pair: string) => {
          return (
            <li
              role="listitem"
              className={styles.symbol}
              onClick={handlePush}
              key={pair}
            >
              {pair}
            </li>
          );
        })}
      </ul>
    </ModalContainer>
  );
}
