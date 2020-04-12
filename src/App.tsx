import React from "react";
import "./App.css";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import Home from "./Home";
import GameRoom from "./GameRoom";

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/game/:gameId">
          <GameRoom />
        </Route>
        <Route>
          <Home />
        </Route>
      </Switch>
    </BrowserRouter>
  );
}

export default App;
