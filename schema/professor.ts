import mongoose from "mongoose";

const professorSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
});

const ProfessorModel = mongoose.model("Professor", professorSchema);

export default ProfessorModel;
