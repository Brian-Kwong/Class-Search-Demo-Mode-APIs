import serverless from "serverless-http";
import express from "express";
import session from "express-session";
import dotenv from "dotenv";

dotenv.config();

// ===== Import Mongoose models =====
import Subject from "../schema/subjects";
import CourseAttrModel from "../schema/course_attr";
import CourseSubAttrModel from "../schema/course_sub_attr";
import ProfessorModel from "../schema/professor";
import InstructionMode from "../schema/instruction_modes";
import CourseModel from "../schema/course";
import connectToDatabase from "./db";

const app = express();

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
    },
  }),
);

declare module "express-session" {
  interface SessionData {
    user?: { role: string };
  }
}

app.get(`/${process.env.SEARCH_OPTIONS_URL}`, async (req, res, _next) => {
  const subjects = await Subject.find();
  const crse_attrs = await CourseAttrModel.find().populate("values");
  const instruct_modes = await InstructionMode.find();
  req.session!.user = { role: "demo" };
  return res.status(200).json({
    subjects: subjects,
    crse_attrs: crse_attrs,
    instruct_modes: instruct_modes,
    search_start_time: "07:00 AM",
    search_end_time: "10:00 PM",
    selected_term: "2257",
    class_search_fields: [{ INSTITUTION: "DEMO" }],
  });
});

app.get(`/${process.env.CLASS_SEARCH_URL}`, async (req, res, _next) => {
  const reqQuery = req.query;
  if (!reqQuery.term) {
    return res.status(400).json({
      error: "Missing required field: term",
    });
  }

  // Build the query object based on provided parameters
  // These parameters can be directly matched
  const query: any = {};
  const simpleFields = ["catalog_nbr", "units"];
  simpleFields.forEach((field) => {
    if (reqQuery[field]) {
      query[field] = reqQuery[field];
    }
  });

  // These parameters require joins or special handling
  if (reqQuery.start_time_ge) {
    if (typeof reqQuery.start_time_ge === "string") {
      query["meetings.start_time"] = {
        $gte: new Date(
          `1970-01-01T${reqQuery.start_time_ge.replace(".", ":")}:00Z`,
        ),
      };
      query["meetings.days"] = { $ne: "NA" };
    }
  }
  if (reqQuery.end_time_le) {
    if (typeof reqQuery.end_time_le === "string") {
      query["meetings.end_time"] = {
        $lte: new Date(
          `1970-01-01T${reqQuery.end_time_le.replace(".", ":")}:00Z`,
        ),
      };
      query["meetings.days"] = { $ne: "NA" };
    }
  }
  if (reqQuery.days) {
    query["$or"] = (reqQuery.days as string)
      .split("/.{1,2}/g")
      .map((day) => ({ "meetings.days": { $regex: new RegExp(day, "i") } }));
  }
  // For fields that need populate first fetch the related documents
  if (reqQuery.crse_attr_value) {
    const crseAttrValue = Array.isArray(reqQuery.crse_attr_value)
      ? reqQuery.crse_attr_value[0]
      : reqQuery.crse_attr_value;
    const attr = await CourseSubAttrModel.findOne({
      crse_attr_value: {
        $regex: new RegExp(
          `^${String(crseAttrValue).replace(/\+/g, " ")}$`,
          "i",
        ),
      },
    });
    if (attr) {
      query.crse_attr = { $in: attr._id };
    }
  }
  if (reqQuery.subject) {
    const subject = reqQuery.subject;
    const subj = await Subject.findOne({ subject: subject });
    if (subj) {
      query.subject = subj._id;
    } else {
      // No matching subject, return empty result
      return res.status(200).json({
        pageCount: 0,
        classes: [],
      });
    }
  }
  if (reqQuery.instructor_name || reqQuery.instr_first_name) {
    const professors = await ProfessorModel.find({
      firstName: reqQuery.instr_first_name
        ? { $regex: new RegExp(reqQuery.instr_first_name as string, "i") }
        : { $exists: true },
      lastName: reqQuery.instructor_name
        ? { $regex: new RegExp(reqQuery.instructor_name as string, "i") }
        : { $exists: true },
    });
    if (professors.length > 0) {
      query.instructors = { $in: professors.map((prof) => prof._id) };
    } else {
      // No matching professors, return empty result
      return res.status(200).json({
        pageCount: 0,
        classes: [],
      });
    }
  }
  if (reqQuery.instruction_mode) {
    const instructMode = Array.isArray(reqQuery.instruction_mode)
      ? reqQuery.instruction_mode[0]
      : reqQuery.instruction_mode;
    const mode = await InstructionMode.findOne({
      instruction_mode: instructMode,
    });
    if (mode) {
      query.instruction_mode = mode._id;
    } else {
      // No matching instruction mode, return empty result
      return res.status(200).json({
        pageCount: 0,
        classes: [],
      });
    }
  }

  query.strm = reqQuery.term;

  const results = await CourseModel.find(query)
    .populate("subject")
    .populate("instructors")
    .populate("crse_attr")
    .populate("instruction_mode");

  return res.status(200).json({
    pageCount: 1,
    classes: results.map((course, index) => ({
      index: index,
      crse_id: course.crse_id,
      crse_offer_nbr: course.crse_offer_nbr,
      strm: course.strm,
      session_descr: course.session_descr,
      class_section: course.class_section,
      class_nbr: course.class_nbr,
      location_descr: course.location_descr,
      start_dt: course.start_dt,
      end_dt: course.end_dt,
      campus_descr: course.campus_descr,
      acad_career: course.acad_career,
      acad_career_descr: course.acad_career_descr,
      component: course.component,
      subject:
        typeof course.subject === "object" &&
        course.subject !== null &&
        "subject" in course.subject
          ? (course.subject as any).subject
          : "",
      subject_descr:
        typeof course.subject === "object" &&
        course.subject !== null &&
        "subject_descr" in course.subject
          ? (course.subject as any).subject_descr
          : "",
      catalog_nbr: course.catalog_nbr,
      instruction_mode:
        typeof course.instruction_mode === "object" &&
        course.instruction_mode !== null &&
        "instruction_mode" in course.instruction_mode
          ? (course.instruction_mode as any).instruction_mode
          : "",
      instruction_mode_descr:
        typeof course.instruction_mode === "object" &&
        course.instruction_mode !== null &&
        "descr" in course.instruction_mode
          ? (course.instruction_mode as any).descr
          : "",
      grading_basis: course.grading_basis,
      wait_tot: course.wait_tot,
      wait_cap: course.wait_cap,
      class_capacity: course.class_capacity,
      enrollment_total: course.enrollment_total,
      enrollment_available: course.enrollment_available,
      descr: course.descr,
      units: course.units,
      combined_section: course.combined_section,
      enrl_stat_descr: course.enrl_stat_descr,
      topic: course.topic,
      instructors:
        typeof course.instructors === "object" &&
        course.instructors !== null &&
        Array.isArray(course.instructors)
          ? (
              course.instructors as unknown as {
                firstName: string;
                lastName: string;
                email: string;
              }[]
            ).map((instr) => ({
              name: instr.firstName + " " + instr.lastName,
              email: instr.email,
            }))
          : [],
      section_type: course.section_type,
      meetings: course.meetings.map((meet) => ({
        days: meet.days,
        // Time format HH.MM.SS.ssss
        start_time:
          meet.days !== "NA" && meet.start_time instanceof Date
            ? `${meet.start_time.toISOString().substring(11, 16).replace(":", ".")}.000000`
            : "NA",
        end_time:
          meet.days !== "NA" && meet.end_time instanceof Date
            ? `${meet.end_time.toISOString().substring(11, 16).replace(":", ".")}.000000`
            : "NA",
        start_dt: meet.start_dt,
        end_dt: meet.end_dt,
        bldg_cd: meet.bldg_cd,
        facility_descr: meet.facility_descr,
        room: meet.room,
        facility_id: meet.facility_id,
        instructor: meet.instructor,
      })),
      crse_attr:
        course.crse_attr && Array.isArray(course.crse_attr)
          ? (
              course.crse_attr as unknown as {
                crse_attr_value: string;
                descr: string;
              }[]
            )
              .map((attr) => attr.crse_attr_value)
              .join(", ")
          : [],
      crse_attr_value:
        course.crse_attr && Array.isArray(course.crse_attr)
          ? (
              course.crse_attr as unknown as {
                crse_attr_value: string;
                descr: string;
              }[]
            )
              .map((attr) => attr.descr)
              .join(", ")
          : [],
      reserve_caps: course.reserve_caps,
      isInCart: course.isInCart,
      isEnrolled: course.isEnrolled,
      isWaitlisted: course.isWaitlisted,
      notes: course.notes,
      icons: course.icons,
    })),
  });
});

app.get(`/${process.env.CLASS_DETAILS_URL}`, async (req, res, next) => {
  const { term, class_nbr } = req.query;
  if (!term || !class_nbr) {
    return res.status(400).json({
      error: "Missing required fields: term or class_nbr",
    });
  }

  const course = await CourseModel.findOne({
    strm: term,
    class_nbr: class_nbr,
  });
  return res.status(200).json(
    (course && {
      section_info: {
        enroll_dates: {
          open_date: course.enroll_dates.start,
          close_date: course.enroll_dates.end,
        },
        catalog_descr: {
          crse_catalog_description:
            course.crse_catalog_description.crse_catalog_description,
        },
        notes: {
          class_notes: course.notes.join("\n"),
        },
        enrollment_information: {
          enroll_requirements:
            course.enrollment_information.enroll_requirements,
        },
      },
    }) || { section_info: {} },
  );
});

app.use((_req, res, _next) => {
  return res.status(404).json({
    error: "End point not found",
  });
});

const server = serverless(app);

export const handler = async (event: any, context: any) => {
  await connectToDatabase();
  context.callbackWaitsForEmptyEventLoop = false;
  return server(event, context);
};
