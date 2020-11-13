import React from "react";
import ReactDOMServer from "react-dom/server";
import fs from "fs";
import Promise from "promise";

import App from "App";

const file = fs.readFileSync("./build/index.html", "utf8");

function renderToStream() {
  const bodyStream = ReactDOMServer.renderToNodeStream(<App />);

  return {
    bodyStream,
  };
}

function handleRequestPage(req, res) {
  return new Promise((resolve) => {
    const body = [];
    const { bodyStream } = renderToStream();

    bodyStream.on("data", (chunk) => {
      body.push(chunk.toString());
    });

    bodyStream.on("error", (err) => {
      // eslint-disable-next-line
      console.log(err);

      res.status(500).send("Something went wrong. Please try again.");
      resolve();
    });

    bodyStream.on("end", () => {
      const html = file.replace(
        `<div id="root"></div>`,
        `<div id="root">${body.join("")}</div>`
      );

      res.send(html);
      resolve();
    });
  });
}

export default handleRequestPage;
