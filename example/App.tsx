import * as React from "react";
import { Switch, Route } from "react-router-dom";
import Home from "./Home";
import Session from "./Session";
import Identity from "./Identity";
import Meeting from "./Meeting";

function App() {
  return (
    <Switch>
      <Route path="/" exact component={Home}></Route>
      <Route path="/meeting-session" component={Meeting}></Route>
      <Route path="/rekognition-identity-verification" component={Identity}></Route>
      <Route path="/rekognition-session-analysis" component={Session}></Route>
    </Switch>
  );
}

export default App;