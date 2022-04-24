import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { router } from "./routes";

interface HTTPError extends Error {
  status?: number;
}

const app = express();

app.use(cors());
app.use(express.json());
app.use(router);
app.use((error: HTTPError, req: Request, res: Response, next: NextFunction) => {
  console.log(error);
  const errorMessage = error.message;
  return res.status(400).json({
    message: "Ocorreu um erro ao realizar a operação",
    errorMessage,
  });
});

export { app };
