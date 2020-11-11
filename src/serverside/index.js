import "regenerator-runtime/runtime";
import express from "express";

const app = express();

app.get("/", "");

app.listen(3000, () => {
  console.log(`Server is listening on port 3000`);
});
