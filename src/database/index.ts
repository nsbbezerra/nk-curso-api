import mongoose from "mongoose";

mongoose.connect(
  "mongodb+srv://nsbbezerra:03102190@cluster0.0walo.mongodb.net/subscribe?retryWrites=true&w=majority"
);
mongoose.Promise = global.Promise;

export { mongoose };
