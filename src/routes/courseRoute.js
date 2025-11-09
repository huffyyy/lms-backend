import express from "express";
import {
  deleteContentCourse,
  deleteCourse,
  deleteStudentToCourse,
  getCategories,
  getCourses,
  getCoursesById,
  getDetailContent,
  getStudentsByCourseId,
  postContentCourse,
  postCourse,
  postStudentToCourse,
  updateContentCourse,
  UpdateCourse
} from "../controllers/courseController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { fileStrorageCourse } from "../utils/multer.js";
import { fileFilter } from "../utils/multer.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { addStudentCourseSchema, mutateContentSchema } from "../utils/schema.js";
import multer from "multer";

const courseRoute = express.Router();

const upload = multer({
  storage: fileStrorageCourse,
  fileFilter
});

courseRoute.get("/courses", verifyToken, getCourses);
courseRoute.get("/categories", verifyToken, getCategories);
courseRoute.get("/courses/:id", verifyToken, getCoursesById);
courseRoute.post("/courses", verifyToken, upload.single("thumbnail"), postCourse);
courseRoute.put("/courses/:id", verifyToken, upload.single("thumbnail"), UpdateCourse);
courseRoute.delete("/courses/:id", verifyToken, deleteCourse);

courseRoute.post("/courses/contents", verifyToken, validateRequest(mutateContentSchema), postContentCourse);
courseRoute.put("/courses/contents/:id", verifyToken, validateRequest(mutateContentSchema), updateContentCourse);
courseRoute.delete("/courses/contents/:id", verifyToken, deleteContentCourse);
courseRoute.get("/courses/contents/:id", verifyToken, getDetailContent);

courseRoute.get("/courses/students/:id", verifyToken, getStudentsByCourseId);
courseRoute.post("/courses/students/:id", verifyToken, validateRequest(addStudentCourseSchema), postStudentToCourse);
courseRoute.put("/courses/students/:id", verifyToken, validateRequest(addStudentCourseSchema), deleteStudentToCourse);

export default courseRoute;
