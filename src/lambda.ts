import * as moment from "moment";
import { capiURL, checkArticleForLinks, getArticles } from "./capi";
import { getSkim } from "./skimlinks";
import { upload } from "./upload";

export const handler = async (event: { date?: string }): Promise<void> => {
  const date = parseDate(event) || moment().subtract(1, "day");
  console.log("Lambda initialised for", date.format("YYYY-MM-DD"));
  const endpoint = capiURL(
    {
      sections: [
        "culture",
        "technology",
        "lifeandstyle",
        "fashion",
        "travel",
        "food",
        "recipes",
        "film",
        "games",
        "money",
        "music",
        "stage"
      ],
      pageSize: 200
    },
    date
  );
  const comissions = getSkim(date.format("YYYY-MM-DD"));

  const articles = await getArticles(endpoint);
  const withLinks = (await Promise.all(
    articles.map(checkArticleForLinks)
  )).filter(_ => _);
  const pagesWithLinks = withLinks.join("\n");

  const pagesUpload = upload("pages", date, pagesWithLinks);
  const uploadComissions = upload("comissions", date, await comissions);
  await pagesUpload;
  await uploadComissions;
  return;
};

const parseDate = (event: { date?: string }): moment.Moment | null => {
  if (event.date == null) {
    return null;
  }
  const m = moment(event.date);
  if (!m.isValid()) {
    return null;
  }
  return m;
};
