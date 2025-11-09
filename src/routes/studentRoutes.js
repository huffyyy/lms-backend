import express from "express";
import multer from "multer";
import { verifyToken } from "../middleware/verifyToken.js";
import {
  deleteStudent,
  getCoursesStundents,
  getStudentById,
  getStudents,
  postStudent,
  updateStudent
} from "../controllers/studentContoller.js";
import { fileFilter, fileStorage } from "../utils/multer.js";

const studentRoutes = express.Router();

const upload = multer({
  storage: fileStorage("students"),
  fileFilter
});

studentRoutes.get("/students", verifyToken, getStudents);
studentRoutes.get("/students/:id", verifyToken, getStudentById);
studentRoutes.post("/students", verifyToken, upload.single("avatar"), postStudent);
studentRoutes.put("/students/:id", verifyToken, upload.single("avatar"), updateStudent);
studentRoutes.delete("/students/:id", verifyToken, deleteStudent);

studentRoutes.get("/students-courses", verifyToken, getCoursesStundents);

export default studentRoutes;
