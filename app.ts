import express from "express";
import {setupAppInsights} from "./AppInsights/appinsight";

setupAppInsights();

const app = express();

app.get("/health", (req, res) => {
  res.send("OK");
});

app.listen(3000, () => {
  console.log("Server started");
});




