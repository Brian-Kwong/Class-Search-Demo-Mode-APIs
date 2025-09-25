import mongoose from "mongoose";
import CourseSubAttrModel from "./course_sub_attr";

const courseAttrSchema = new mongoose.Schema({
  crse_attr: { type: String, required: true },
  descr: { type: String, required: true },
  values: [{ type: mongoose.Schema.Types.ObjectId, ref: CourseSubAttrModel }],
});

const CourseAttrModel = mongoose.model("CourseAttr", courseAttrSchema);

export default CourseAttrModel;
