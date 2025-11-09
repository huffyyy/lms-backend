import bcrypt from "bcrypt";
import { mutatateStudentSchema } from "../utils/schema.js";
import userModel from "../model/userModel.js";
import courseModel from "../model/courseModel.js";
import path from "path";
import fs from "fs";

export const getStudents = async (req, res) => {
  try {
    const students = await userModel
      .find({
        role: "student",
        manager: req.user._id
      })
      .select("name courses photo");

    const photoUrl = process.env.APP_URL + "/uploads/students/";

    const response = students.map((item) => {
      return {
        ...item.toObject(),
        photo_url: photoUrl + item.photo
      };
    });

    return res.json({
      message: "Get students success",
      data: response
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
};

export const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await userModel.findById(id).select("name email");

    return res.json({
      message: "Get detail students succes",
      data: student
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
};
export const postStudent = async (req, res) => {
  try {
    console.log("req.body:", req.body);
    console.log("req.file:", req.file);

    const body = req.body;

    const parse = mutatateStudentSchema.safeParse(body);

    if (!parse.success) {
      const errorMessage = parse.error.issues.map((err) => err.message);

      if (req?.file?.path && fs.existsSync(req?.file?.path)) {
        fs.unlinkSync(req?.file?.path);
      }

      return res.status(400).json({
        message: "Error Validation",
        data: null,
        errors: errorMessage
      });
    }

    const hashPassword = bcrypt.hashSync(body.password, 12);

    const student = new userModel({
      name: parse.data.name,
      email: parse.data.email,
      password: hashPassword,
      photo: req.file?.filename, //
      manager: req.user._id,
      role: "student"
    });

    await student.save();

    return res.json({
      message: "Create Student success"
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
};

export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const body = req.body;

    const parse = mutatateStudentSchema
      .partial({
        password: true
      })
      .safeParse(body);

    if (!parse.success) {
      const errorMessage = parse.error.issues.map((err) => err.message);

      if (req?.file?.path && fs.existsSync(req?.file?.path)) {
        fs.unlinkSync(req?.file?.path);
      }

      return res.status(400).json({
        message: "Error Validation",
        data: null,
        errors: errorMessage
      });
    }

    const student = await userModel.findById(id);

    const hashPassword = parse.data?.password ? bcrypt.hashSync(parse.data.password, 12) : student.password;

    await userModel.findByIdAndUpdate(id, {
      name: parse.data.name,
      email: parse.data.email,
      password: hashPassword,
      photo: req.file?.filename || student.photo,
      manager: req.user._id,
      role: "student"
    });

    return res.json({
      message: "Update Student success"
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
};
``;

export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await userModel.findById(id);

    await courseModel.findOneAndUpdate(
      {
        students: id
      },
      {
        $pull: {
          students: id
        }
      }
    );

    const dirname = path.resolve();

    const filePath = path.join(dirname, "public/uploads/students", student.photo);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await userModel.findByIdAndDelete(id);

    return res.json({
      message: "Delete Student success"
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
};

export const getCoursesStundents = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id).populate({
      path: "courses",
      select: "name category thumbnail",
      populate: {
        path: "category",
        select: "name"
      }
    });

    const imageUrl = process.env.APP_URL + "/uploads/courses/";

    const response = user?.courses?.map((item) => {
      return {
        ...item.toObject(),
        thumbnail_url: imageUrl + item.thumbnail
      };
    });
    return res.json({
      message: "Get courses succes",
      data: response
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
};
