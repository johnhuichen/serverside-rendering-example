import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import Route1 from "./Route1";
import Route2 from "./Route2";

export default function Router() {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/" exact component={Route1} />
        <Route path="/foo" component={Route2} />
      </Switch>
    </BrowserRouter>
  );
}
