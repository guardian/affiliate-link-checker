import * as moment from "moment";
import fetch from "node-fetch";

const key = process.env.CAPIKEY;

interface Result {
  id: string;
}

interface CAPIResponse {
  status: "ok";
  total: number;
  startIndex: number;
  pageSize: number;
  currentPage: number;
  pages: number;
  results: Result[];
}
interface CAPIReply {
  response: CAPIResponse;
}

const isCAPIReply = (r: any): r is CAPIReply =>
  "response" in r && "status" in r.response && r.response.status === "ok";

import Sema = require("async-sema");

export interface URLoptions {
  sections: string[];
  pageSize: number;
}

const endpoint = "https://content.guardianapis.com";
export const capiURL = (options: URLoptions, date: moment.Moment) =>
  `${endpoint}/search?section=${options.sections.join(
    "|"
  )}&from-date=${date.format("YYYY-MM-DD")}&page-size=${
    options.pageSize
  }&api-key=${key}`;

const s = new Sema(10);

export const checkArticleForLinks = async (
  id: string
): Promise<string | false> => {
  await s.acquire();
  try {
    // console.log("Fetching article", id);
    const resp = await fetch(`https://www.theguardian.com/${id}.json`);
    const body = await resp.text();
    // console.log("Fetched", id, body.length);
    return body.includes("go.theguardian.com") ? id : false;
    // return body.includes("This article contains affiliate links, which means we may earn a small commission if a reader clicks through and makes a purchase") ? id : false;
  } catch (error) {
    console.log("Could not parse", id);
  } finally {
    s.release();
  }
  return false;
};

export const getArticles = async (
  url: string,
  page: number = 1
): Promise<string[]> => {
  const pageURL = `${url}&page=${page}`;
  console.log("Fetching", pageURL);
  const resp = await fetch(pageURL);
  console.log("Parsing response from CAPI.");
  const r = await resp.json();
  if (!isCAPIReply(r)) {
    console.log("Not a valid reply");
    throw new Error("Nope");
  }
  const next =
    r.response.currentPage === r.response.pages
      ? []
      : await getArticles(url, page + 1);
  return [...r.response.results.map(_ => `/${_.id}`), ...next];
};
