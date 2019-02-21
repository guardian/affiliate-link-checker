import { createHash } from "crypto";
import * as moment from "moment";
import fetch from "node-fetch";

const endpoint = "https://reporting.skimapis.com";
const accountType = "publisher_user";
const accountId = process.env.user;
const privateKey = process.env.pk;

const md5 = (s: string): string =>
  createHash("md5")
    .update(s)
    .digest("hex");

export const getSkim = async (start: string) => {
  const format = "YYYY-MM-DD";
  const startDate = moment(start).format(format);

  const url = `${endpoint}/${accountType}/${accountId}/commission-report?${sign()}&updated_since=${startDate}`;

  return JSON.stringify(getPages(url), null, 2);
};

const getPages = async (url: string, offset: number = 0): Promise<any[]> => {
  const limit = 100;
  const response = await fetch(`${url}&limit=${limit}&offset=${offset}`);
  const parsed = await response.json();
  const hasNext =
    "pagination" in parsed &&
    "has_next" in parsed.pagination &&
    parsed.pagination.has_next;
  const commissions = "commissions" in parsed && parsed.commissions;
  if (!hasNext) {
    return commissions;
  }
  return [...commissions, ...(await getPages(url, offset + limit))];
};

const sign = () => {
  const timestamp = moment().unix();
  const token = md5(`${timestamp}${privateKey}`);
  return `timestamp=${timestamp}&token=${token}`;
};
