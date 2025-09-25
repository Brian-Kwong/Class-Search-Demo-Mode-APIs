import mongoose from "mongoose";
import fs from "fs";
import path from "path";
// ===== Import Mongoose models =====
import Subject from "../schema/subjects";
import CourseAttrModel from "../schema/course_attr";
import CourseSubAttrModel from "../schema/course_sub_attr";
import ProfessorModel from "../schema/professor";
import InstructionMode from "../schema/instruction_modes";
import CourseModel from "../schema/course";

import { parse } from "csv-parse";
import { CourseType } from "./courseType";
import connectToDatabase from "./db";
import { error } from "console";

// Read in CSV file and convert to JSON
const readAndParseCSV = (filePath: string) => {
  const items = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(parse({ columns: true, delimiter: "," }))
      .on("data", (data) => items.push(data))
      .on("end", () => {
        resolve(items);
      })
      .on("error", (error) => {
        reject(error);
      });
  });
};

const addSubjects = async () => {
  const subjects = (await readAndParseCSV(
    path.join(__dirname, "../data/subjects.csv"),
  )) as Array<{ subject: string; descr: string }>;
  try {
    await Subject.collection.drop();
  } catch (error) {
    console.log("No existing subjects collection to drop");
  } finally {
    Subject.insertMany(subjects)
      .then(() => {
        console.log("Subjects collection created and populated successfully");
        return;
      })
      .catch((error) => {
        console.error("Error inserting subjects:", error);
        process.exit(1);
      });
  }
};

const addCourseAttributes = async () => {
  let courseAttributes = (await readAndParseCSV(
    path.join(__dirname, "../data/course_attr.csv"),
  )) as Array<{ crse_attr: string; descr: string }>;
  const subCategories = (await readAndParseCSV(
    path.join(__dirname, "../data/course_attr_sub_categories.csv"),
  )) as Array<{ category: string; crse_attr_value: string }>;
  courseAttributes.forEach(async (attr) => {
    attr["values"] = subCategories.filter(
      (sub) => sub.category === attr.crse_attr,
    );
  });
  await Promise.all(
    courseAttributes.map(async (attr) => {
      attr["values"] = attr["values"]
        ? (await Promise.all(
            attr["values"].map(async (sub) => {
              const subCategory = await CourseSubAttrModel.findOne({
                crse_attr_value: sub.crse_attr_value,
              });
              return subCategory ? subCategory._id : null;
            }),
          )) || []
        : [];
      return attr;
    }),
  );
  try {
    await CourseAttrModel.collection.drop();
  } catch (error) {
    console.log("No existing course attributes collection to drop");
  } finally {
    CourseAttrModel.insertMany(courseAttributes)
      .then(() => {
        console.log(
          "Course attributes collection created and populated successfully",
        );
        return;
      })
      .catch((error) => {
        console.error("Error inserting course attributes:", error);
        process.exit(1);
      });
  }
};

const addCourseSubAttributes = async () => {
  const courseSubAttributes = (await readAndParseCSV(
    path.join(__dirname, "../data/course_attr_sub_categories.csv"),
  )) as Array<{ category: string; crse_attr_value: string; descr: string }>;
  courseSubAttributes.map((attr) => {
    delete attr.category;
    return attr;
  });
  try {
    await CourseSubAttrModel.collection.drop();
  } catch (error) {
    console.log("No existing course sub-attributes collection to drop");
  } finally {
    CourseSubAttrModel.insertMany(courseSubAttributes)
      .then(() => {
        console.log(
          "Course sub-attributes collection created and populated successfully",
        );
        return;
      })
      .catch((error) => {
        console.error("Error inserting course sub-attributes:", error);
        process.exit(1);
      });
  }
};

const addProfessors = async () => {
  const professors = (await readAndParseCSV(
    path.join(__dirname, "../data/professor.csv"),
  )) as Array<{ name: string; email: string }>;
  try {
    await ProfessorModel.collection.drop();
  } catch (error) {
    console.log("No existing professors collection to drop");
  } finally {
    ProfessorModel.insertMany(professors)
      .then(() => {
        console.log("Professors collection created and populated successfully");
        return;
      })
      .catch((error) => {
        console.error("Error inserting professors:", error);
        process.exit(1);
      });
  }
};

const addInstructionModes = async () => {
  const instructionModes = (await readAndParseCSV(
    path.join(__dirname, "../data/instruction_modes.csv"),
  )) as Array<{ instruction_mode: string; descr: string }>;
  try {
    await InstructionMode.collection.drop();
  } catch {
    console.log("No existing instruction modes collection to drop");
  } finally {
    InstructionMode.insertMany(instructionModes)
      .then(() => {
        console.log(
          "Instruction modes collection created and populated successfully",
        );
        return;
      })
      .catch((error) => {
        console.error("Error inserting instruction modes:", error);
        process.exit(1);
      });
  }
};

const addCourses = async () => {
  const courses = (await readAndParseCSV(
    path.join(__dirname, "../data/courses.csv"),
  )) as Array<CourseType>;
  const coursePromises = await Promise.all(
    courses.map(async (course) => {
      const subject = await Subject.findOne({ subject: course.subject });
      const instructionMode = await InstructionMode.findOne({
        instruction_mode: course.instruction_mode,
      });
      const instructors = await Promise.all(
        course.instructors.split(";").map(async (name) => {
          const firstName = name.split("|")[0].trim();
          if (!firstName) return null;
          const lastName = name.split("|")[1] ? name.split("|")[1].trim() : "";
          if (!lastName) return null;
          const prof = await ProfessorModel.findOne({ firstName, lastName });
          return prof ? prof._id : null;
        }),
      );
      const crse_attr = await Promise.all(
        course.crse_attr_value.split(";").map(async (attr) => {
          const classAttr = attr.replace(/GE [A-Z]-/g, "").trim();
          if (!classAttr) return null;
          const courseAttr = await CourseSubAttrModel.findOne({
            crse_attr_value: classAttr,
          });
          return courseAttr ? courseAttr._id : null;
        }),
      );
      const startTime = course.start_time
        ? new Date(`1970-01-01T${course.start_time}Z`)
        : undefined;
      const endTime = course.end_time
        ? new Date(`1970-01-01T${course.end_time}Z`)
        : undefined;
      return {
        crse_id: course.crse_id,
        class_section: course.class_section,
        class_nbr: course.class_nbr,
        component: course.component,
        subject: subject ? subject._id : null,
        catalog_nbr: course.catalog_nbr,
        instruction_mode: instructionMode ? instructionMode._id : null,
        acad_org: course.acad_org,
        wait_tot: course.wait_tot,
        wait_cap: course.wait_cap,
        class_capacity: course.class_capacity,
        enrollment_total: course.enrollment_total,
        enrollment_available: course.enrollment_available,
        descr: course.descr,
        units: course.units,
        enrl_stat: course.enrl_stat,
        enrl_stat_descr: course.enrl_stat_descr,
        instructors: instructors.filter(
          (id) => id !== null,
        ) as Array<mongoose.Types.ObjectId>,
        section_type: course.section_type,
        meetings: [
          {
            days: course.days,
            start_time: startTime,
            end_time: endTime,
            bldg_cd: course.bldg_cd,
            facility_descr: course.facility_descr,
            room: course.room,
            facility_id: course.facility_id,
            instructor:
              instructors.length > 0
                ? course.instructors.split(";")[0].replace("|", " ").trim()
                : "TBA",
          },
        ],
        crse_attr: crse_attr.filter(
          (id) => id !== null,
        ) as Array<mongoose.Types.ObjectId>,
        notes: course.reserve_notes ? [course.reserve_notes] : [],
        crse_catalog_description: {
          crse_catalog_description: course.crse_catalog_description || "",
        },
        enrollment_information: course.prereq_courses
          ? { enroll_requirements: course.prereq_courses }
          : {},
      };
    }),
  );
  try {
    await CourseModel.collection.drop();
  } catch {
    console.log("No existing courses collection to drop");
  } finally {
    CourseModel.insertMany(coursePromises)
      .then(() => {
        console.log("Courses collection created and populated successfully");
        return;
      })
      .catch((error) => {
        console.error("Error inserting courses:", error);
        process.exit(1);
      });
  }
};

const createAllCollections = async () => {
  await addSubjects();
  await addCourseSubAttributes();
  await addCourseAttributes();
  await addProfessors();
  await addInstructionModes();
  await addCourses();
};
connectToDatabase()
  .then(() => {
    createAllCollections()
      .then(async () => {
        console.log("All collections created and populated successfully");
      })
      .catch((error) => {
        console.error("Error creating collections:", error);
        process.exit(1);
      });
  })
  .catch((error) => {
    console.error("Failed to connect to database:", error);
  });
