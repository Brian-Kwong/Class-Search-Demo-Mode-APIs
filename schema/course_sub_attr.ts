import mongoose from "mongoose";

const courseSubAttrSchema = new mongoose.Schema({
  crse_attr_value: { type: String, required: true },
  descr: { type: String, required: true },
});

const CourseSubAttrModel = mongoose.model("CourseSubAttr", courseSubAttrSchema);

export default CourseSubAttrModel;
