import { subscribe } from "../models/Subscribe";
import { NextFunction, Request, Response } from "express";
import mercadopago from "mercadopago";
import { configs } from "../configs";
import { v4 as uuidv4 } from "uuid";

mercadopago.configure({
  access_token:
    configs.ambient === "dev" ? configs.mp_test : configs.mp_production,
});

export class Subscribe {
  async CreateSubscribe(req: Request, res: Response, next: NextFunction) {
    const { name, cpf, phone, email, sala, obs } = req.body;
    try {
      const findDup = await subscribe.findOne({ cpf });

      if (findDup) {
        return res.status(400).json({
          message:
            "Este CPF já possui uma inscrição, clique em MINHA INSCRIÇÃO para ver os detalhes",
        });
      }

      const mySub = await subscribe.create({
        name,
        identify: uuidv4(),
        cpf,
        phone,
        email,
        sala,
        obs,
        status: "wait",
      });

      let webhookUrl = configs.webhook;
      let productionUrl = `${configs.url_production}/confirm/${mySub.identify}`;

      let preference = {
        external_reference: mySub.identify,
        notification_url: `${
          configs.ambient === "dev" ? webhookUrl : productionUrl
        }`,
        items: [
          {
            title: `Curso de Programação de sites - NK Informática`,
            unit_price: configs.price,
            quantity: 1,
          },
        ],
        statement_descriptor: `Curso de Programação de sites - NK Informática`,
        back_urls: {
          success: `${
            configs.ambient === "dev" ? configs.url_dev : configs.url_production
          }/finalizar`,
          failure: `${
            configs.ambient === "dev" ? configs.url_dev : configs.url_production
          }/finalizar`,
          pending: `${
            configs.ambient === "dev" ? configs.url_dev : configs.url_production
          }/finalizar`,
        },
        payment_methods: {
          installments: 2,
        },
      };

      mercadopago.preferences
        .create(preference)
        .then((response) => {
          const url =
            configs.ambient === "dev"
              ? response.body.sandbox_init_point
              : response.body.init_point;
          return res
            .status(200)
            .json({ message: "Inscrição concluída com sucesso", url });
        })
        .catch((error) => {
          next(error);
        });
    } catch (error) {
      next(error);
    }
  }
  async PaySubscribeAgain(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;

    try {
      let webhookUrl = configs.webhook;
      let productionUrl = `${configs.url_production}/confirm/${id}`;

      let preference = {
        external_reference: id,
        notification_url: `${
          configs.ambient === "dev" ? webhookUrl : productionUrl
        }`,
        items: [
          {
            title: `Curso de Programação de sites - NK Informática`,
            unit_price: configs.price,
            quantity: 1,
          },
        ],
        statement_descriptor: `Curso de Programação de sites - NK Informática`,
        back_urls: {
          success: `${
            configs.ambient === "dev" ? configs.url_dev : configs.url_production
          }/finalizar`,
          failure: `${
            configs.ambient === "dev" ? configs.url_dev : configs.url_production
          }/finalizar`,
          pending: `${
            configs.ambient === "dev" ? configs.url_dev : configs.url_production
          }/finalizar`,
        },
        payment_methods: {
          installments: 2,
        },
      };

      mercadopago.preferences
        .create(preference)
        .then((response) => {
          const url =
            configs.ambient === "dev"
              ? response.body.sandbox_init_point
              : response.body.init_point;
          return res
            .status(200)
            .json({ message: "Inscrição concluída com sucesso", url });
        })
        .catch((error) => {
          next(error);
        });
    } catch (error) {
      next(error);
    }
  }
  async FindSubscribe(req: Request, res: Response, next: NextFunction) {
    const { cpf } = req.params;

    try {
      const mySubscribe = await subscribe.findOne({ cpf });

      return res.status(200).json(mySubscribe);
    } catch (error) {
      next(error);
    }
  }
  async ValidateSubscribe(req: Request, res: Response, next: NextFunction) {
    const { id, paymend_id, payment_method, status } = req.body;

    try {
      let statusSub;

      switch (status) {
        case "approved":
          statusSub = "confirmed";
          break;
        case "pending":
          statusSub = "wait";
          break;
        case "rejected":
          statusSub = "refused";
          break;
        default:
          statusSub = "wait";
          break;
      }

      const sub = await subscribe.findOneAndUpdate(
        { identify: id },
        { paymend_id, payment_method, status: statusSub },
        { new: true }
      );

      return res
        .status(200)
        .json({ message: "O status da sua inscrição foi alterado", sub });
    } catch (error) {
      next(error);
    }
  }
  async WebHook(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const { data } = req.body;

    try {
      if (data) {
        mercadopago.payment
          .findById(data.id)
          .then((data) => {
            const { response } = data;
            const status = response.status;

            if (status === "approved") {
              subscribe.findOneAndUpdate(
                { identify: id },
                { status: "confirmed" }
              );
            }
            if (status === "pending") {
              subscribe.findOneAndUpdate({ identify: id }, { status: "wait" });
            }
            if (status === "rejected") {
              subscribe.findOneAndUpdate(
                { identify: id },
                { status: "refused" }
              );
            }

            return res.status(201).json({ message: "OK" });
          })
          .catch((err) => {
            next(err);
          });
      }
    } catch (error) {
      next(error);
    }
  }
  async List(req: Request, res: Response, next: NextFunction) {
    try {
      const subscribes = await subscribe.find();
      return res.status(200).json(subscribes);
    } catch (error) {
      next(error);
    }
  }
  async Update(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const { status } = req.body;
    try {
      await subscribe.findOneAndUpdate({ identify: id }, { status });

      return res
        .status(200)
        .json({ message: "Inscrição alterada com sucesso" });
    } catch (error) {
      next(error);
    }
  }
}
