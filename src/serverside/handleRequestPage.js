import React from "react";
import ReactDOMServer from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import fs from "fs";
import Promise from "promise";

import App from "App";

const file = fs.readFileSync("./build/index.html", "utf8");

function renderToStream(req) {
  const context = {};
  const bodyStream = ReactDOMServer.renderToNodeStream(
    <StaticRouter location={req.url} context={context}>
      <App />
    </StaticRouter>
  );

  return {
    bodyStream,
    context,
  };
}

function handleRequestPage(req, res) {
  return new Promise((resolve) => {
    const body = [];
    const { bodyStream, context } = renderToStream(req);

    if (context.url) {
      res.redirect(context.url);
      resolve();
    }

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
