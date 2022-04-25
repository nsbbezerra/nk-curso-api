import { app } from "./app";

const PORT = process.env.PORT || 8080;

app.listen(PORT, function () {
  console.log(`API running on port: ${PORT}`);
});
