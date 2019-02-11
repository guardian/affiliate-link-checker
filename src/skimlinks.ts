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

export const getSkim = async () => {
  const url = `${endpoint}/${accountType}/${accountId}/comission-report`;
  console.log(sign(url));
  const r = await fetch(sign(url));
  const t = await r.text();
  console.log(t);

  return;
};

const sign = (url: string) => {
  const timestamp = moment().unix();
  const token = md5(`${timestamp}${privateKey}`);
  console.log(token);
  return `${url}?timestamp=${timestamp}&token=${token}`;
};
