import IORedis from "ioredis";

const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

connection.on("connect", () => {
  console.log(" Redis Connected");
});

connection.on("error", (err) => {
  console.log(" Redis Error", err.message);
});

export default connection;
