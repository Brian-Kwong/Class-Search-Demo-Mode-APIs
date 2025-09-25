import mongoose from "mongoose";
import * as defaults from "../src/defaults";
import { Mongoose } from "mongoose";

const courseSchema = new mongoose.Schema({
  crse_id: { type: String, required: true, unique: true },
  crse_offer_nbr: { type: Number, required: true, default: 1 },
  strm: { type: String, required: true, default: defaults.DEFAULT_TERM },
  session_code: {
    type: String,
    required: true,
    default: defaults.SESSION_CODE,
  },
  session_descr: {
    type: String,
    required: true,
    default: defaults.SESSION_DESCR,
  },
  class_section: { type: String, required: true },
  location: {
    type: String,
    required: true,
    default: defaults.DEFAULT_INSTITUTION,
  },
  location_descr: {
    type: String,
    required: true,
    default: defaults.DEFAULT_INSTITUTION_DESCR,
  },
  start_dt: {
    type: String,
    required: true,
    default: defaults.TERM_DATES[defaults.DEFAULT_TERM].start,
  },
  end_dt: {
    type: String,
    required: true,
    default: defaults.TERM_DATES[defaults.DEFAULT_TERM].end,
  },
  class_stat: { type: String, required: true, default: "A" },
  campus: { type: String, required: true, default: "MAIN" },
  campus_descr: { type: String, required: true, default: "Main Demo Campus" },
  class_nbr: { type: Number, required: true, unique: true },
  acad_career: { type: String, required: true, default: "UGRD" },
  acad_career_descr: { type: String, required: true, default: "Undergraduate" },
  component: { type: String, required: true },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true,
  },
  catalog_nbr: { type: String, required: true },
  class_type: {
    type: String,
    required: true,
    default: function () {
      return this.component === "LEC" ? "E" : "N";
    },
  },
  schedule_print: { type: String, required: true, default: "Y" },
  acad_group: { type: String, required: true, default: "UGRD" },
  instruction_mode: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstructionMode",
    required: true,
  },
  acad_org: { type: String, required: true },
  grading_basis: { type: String, required: true, default: "Student Option" },
  wait_tot: { type: Number, required: true },
  wait_cap: { type: Number, required: true },
  class_capacity: { type: Number, required: true },
  enrollment_total: { type: Number, required: true },
  enrollment_available: { type: Number, required: true },
  descr: { type: String, required: true },
  rqmnt_designtn: { type: String, default: "" },
  units: { type: String, required: true },
  combined_section: { type: String, required: true, default: "N" },
  enrl_stat: { type: String, required: true },
  enrl_stat_descr: { type: String, required: true },
  topic: { type: String, default: "" },
  instructors: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Professor", required: false },
  ],
  section_type: { type: String, required: true },
  meetings: [
    {
      days: { type: String, required: true },
      start_time: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
        default: "NA",
      },
      end_time: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
        default: "NA",
      },
      start_dt: {
        type: String,
        required: true,
        default: defaults.TERM_DATES[defaults.DEFAULT_TERM].start,
      },
      end_dt: {
        type: String,
        required: true,
        default: defaults.TERM_DATES[defaults.DEFAULT_TERM].end,
      },
      bldg_cd: { type: String, required: true },
      bldg_has_coordinates: { type: Boolean, required: true, default: true },
      facility_descr: { type: String, required: true },
      room: { type: String, required: true },
      facility_id: { type: String, required: true },
      instructor: {
        type: String,
        required: true,
        default: function () {
          return this.instructors.length > 0
            ? this.instructors[0].firstName + " " + this.instructors[0].lastName
            : "TBA";
        },
      },
    },
  ],
  crse_attr: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CourseSubAttr",
      required: false,
    },
  ],
  reserve_caps: { type: Array, default: [] },
  isInCart: { type: Boolean, default: false },
  isEnrolled: { type: Boolean, default: false },
  isWaitlisted: { type: Boolean, default: false },
  notes: { type: Array, default: [] },
  icons: { type: Array, default: [] },
  enroll_dates: {
    type: Object,
    default: {
      start: defaults.TERM_DATES[defaults.DEFAULT_TERM].enrollment_start,
      end: defaults.TERM_DATES[defaults.DEFAULT_TERM].enrollment_end,
    },
  },
  crse_catalog_description: {
    type: Object,
    default: { crse_catalog_description: "" },
  },
  enrollment_information: {
    type: Object,
    default: { enroll_requirements: "" },
  },
});

const CourseModel = mongoose.model("Course", courseSchema);

export default CourseModel;
