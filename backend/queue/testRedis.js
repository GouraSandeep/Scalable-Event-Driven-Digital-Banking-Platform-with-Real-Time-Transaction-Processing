import connection from "./redisConnection.js";

connection
  .ping()
  .then((res) => {
    console.log(" CONNECTED:", res);
    process.exit(0);
  })
  .catch((err) => {
    console.log(" ERROR:", err);
    process.exit(1);
  });
