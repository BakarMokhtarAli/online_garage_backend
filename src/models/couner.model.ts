import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
  model: { type: String, required: true, unique: true },
  seq: { type: Number, default: 0 },
});

const Counter = mongoose.model("Counter", counterSchema);
export default Counter;
