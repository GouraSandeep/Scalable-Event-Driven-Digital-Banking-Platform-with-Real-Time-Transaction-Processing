import IORedis from "ioredis";

const connection = new IORedis(
  "redis://default:s6xUHBOOcTe6IvfCT1crOzaT8b4v1DY8@redis-19744.crce281.ap-south-1-3.ec2.cloud.redislabs.com:19744",
  {
    maxRetriesPerRequest: null,
  },
);

connection.on("connect", () => {
  console.log(" Redis Connected");
});

connection.on("error", (err) => {
  console.log(" Redis Error", err.message);
});

export default connection;
