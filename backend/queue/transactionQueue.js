import { Queue } from "bullmq";
import connection from "./redisConnection.js";

export const transactionQueue = new Queue("transactionQueue", {
  connection,
});
