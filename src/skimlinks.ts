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
  const url = `${endpoint}/${accountType}/${accountId}/commission-report`;
  console.log(`${sign(url)}&start_date=2019-02-10&page=2`);
  const r = await fetch(sign(url));
  const t = await r.json();
  const commissions = t.commissions
  const ps = commissions.filter(_ => _.click_details.page_url !== null)
  console.log(ps);
  console.log(ps.length)
  console.log(commissions.length)
  console.log(JSON.stringify(t))

  return;
};

const sign = (url: string) => {
  const timestamp = moment().unix();
  const token = md5(`${timestamp}${privateKey}`);
  return `${url}?timestamp=${timestamp}&token=${token}`;
};
