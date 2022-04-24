import express from "express";
import { Subscribe } from "../classes/subscribe";

const SubscribeClass = new Subscribe();

const router = express.Router();

router.post("/subscribe", SubscribeClass.CreateSubscribe);
router.post("/pay_again/:id", SubscribeClass.PaySubscribeAgain);
router.get("/find_subscribe/:cpf", SubscribeClass.FindSubscribe);
router.put("/validade", SubscribeClass.ValidateSubscribe);
router.post("/confirm/:id", SubscribeClass.WebHook);
router.get("/list", SubscribeClass.List);

export { router };
