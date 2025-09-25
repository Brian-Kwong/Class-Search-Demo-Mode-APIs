import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  descr: { type: String, required: true },
});

const SubjectModel = mongoose.model("Subject", subjectSchema);
export default SubjectModel;
