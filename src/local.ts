import AWS = require("aws-sdk");
import { handler } from "./lambda";

AWS.config.update({
  region: "eu-west-1"
});

const run = async () => {
  await handler({ date: "2019-02-19" });
};

run();
