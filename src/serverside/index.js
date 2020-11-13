import "regenerator-runtime/runtime";
import express from "express";
import handleRequestPage from "./handleRequestPage";

const app = express();

app.get("/", handleRequestPage);
app.get("/index.html", (req, res) => res.redirect("/"));

app.use(express.static("./build"));

app.get("*", handleRequestPage);

app.listen(3000, () => {
  console.log(`Server is listening on port 3000`);
});
