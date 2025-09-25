import mongoose from "mongoose";

const instructionModeSchema = new mongoose.Schema({
  instruction_mode: { type: String, required: true },
  descr: { type: String, required: true },
});

const InstructionMode = mongoose.model(
  "InstructionMode",
  instructionModeSchema,
);

export default InstructionMode;
