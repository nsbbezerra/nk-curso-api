import { app } from "./app";

const PORT = process.env.PORT || 4003;

app.listen(PORT, function () {
  console.log(`API running on port: ${PORT}`);
});
