import { mongoose } from "../database/index";
const Schema = mongoose.Schema;
const model = mongoose.model;

interface ISubscribe {
  name: string;
  cpf: string;
  identify: string;
  phone: string;
  email?: string;
  sala: string;
  obs?: string;
  status: "wait" | "confirmed" | "refused";
  paymend_id?: string;
  payment_method?: string;
  payment_type?: string;
  created_at: Date;
}

const schema = new Schema<ISubscribe>({
  name: { type: String, required: true },
  cpf: { type: String, required: true, unique: true },
  identify: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: false },
  sala: { type: String, required: true },
  obs: { type: String, required: false },
  paymend_id: { type: String, required: false },
  payment_method: { type: String, required: false },
  payment_type: { type: String, required: false },
  status: {
    type: String,
    enum: ["wait", "confirmed", "refused"],
    required: true,
  },
  created_at: { type: Date, required: false },
});

schema.pre("save", function (next) {
  this.created_at = new Date();
  next();
});

const subscribe =
  mongoose.models.Register || model<ISubscribe>("Register", schema);

export { subscribe };
