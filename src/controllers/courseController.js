import courseModel from "../model/courseModel.js";
import categoryModel from "../model/categoryModel.js";
import userModel from "../model/userModel.js";
import { mutateCourseSchema } from "../utils/schema.js";
import fs from "fs";
import path from "path";
import courseDetailModel from "../model/courseDetailModel.js";

export const getCourses = async (req, res) => {
  try {
    const courses = await courseModel
      .find({ manager: req.user?._id })
      .select("name thumbnail")
      .populate({
        path: "category",
        select: "name -_id"
      })
      .populate({
        path: "students",
        select: "name"
      });

    const imageUrl = process.env.APP_URL + "/uploads/courses/";

    const response = courses.map((item) => {
      return {
        ...item.toObject(),
        thumbnail_url: imageUrl + item.thumbnail,
        total_students: item.students.length
      };
    });

    return res.json({
      message: "Get courses successfully",
      data: response
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await categoryModel.find();

    return res.json({
      message: "Get categories successfully",
      data: categories
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
};

export const getCoursesById = async (req, res) => {
  try {
    const { id } = req.params;
    const { preview } = req.query;

    const course = await courseModel
      .findById(id)
      .findById(id)
      .populate({ path: "category", select: "name -_id" })
      .populate({
        path: "details",
        select: preview === "true" ? "title type youtubeId text" : "title type"
      });

    const imageUrl = process.env.APP_URL + "/uploads/courses/";

    return res.json({
      message: "Get course  detail success",
      data: {
        ...course.toObject(),
        thumbnail_url: imageUrl + course.thumbnail
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
};

export const postCourse = async (req, res) => {
  try {
    const body = req.body;

    if (!req.file || !req.file.filename) {
      return res.status(400).json({
        message: "Thumbnail file is required",
        data: null,
        errors: ["Thumbnail file is required"]
      });
    }

    const parse = mutateCourseSchema.safeParse(body);

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

    const category = await categoryModel.findById(parse.data.categoryId);
    if (!category) {
      if (req?.file?.path && fs.existsSync(req?.file?.path)) {
        fs.unlinkSync(req?.file?.path);
      }
      return res.status(404).json({
        message: "Category ID not found"
      });
    }

    const course = new courseModel({
      name: parse.data.name,
      category: category._id,
      description: parse.data.description,
      tagline: parse.data.tagline,
      thumbnail: req.file.filename,
      manager: req.user._id
    });

    await course.save();

    await categoryModel.findByIdAndUpdate(category._id, { $push: { courses: course._id } }, { new: true });

    await userModel.findByIdAndUpdate(req.user?._id, { $push: { courses: course._id } }, { new: true });

    return res.json({
      message: "Create course success",
      data: course
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
};

export const UpdateCourse = async (req, res) => {
  try {
    const body = req.body;
    const courseId = req.params.id;

    const parse = mutateCourseSchema.safeParse(body);

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

    const category = await categoryModel.findById(parse.data.categoryId);
    const oldCourse = await courseModel.findById(courseId);

    if (!category) {
      if (req?.file?.path && fs.existsSync(req?.file?.path)) {
        fs.unlinkSync(req?.file?.path);
      }
      return res.status(404).json({
        message: "Category ID not found"
      });
    }

    if (!oldCourse.thumbnail && (!req.file || !req.file.filename)) {
      return res.status(400).json({
        message: "Thumbnail file is required",
        data: null,
        errors: ["Thumbnail file is required"]
      });
    }

    if (req.file && oldCourse.thumbnail) {
      const oldPath = `public/uploads/courses/${oldCourse.thumbnail}`;
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    await courseModel.findByIdAndUpdate(courseId, {
      name: parse.data.name,
      category: category._id,
      description: parse.data.description,
      tagline: parse.data.tagline,
      thumbnail: req.file?.filename || oldCourse.thumbnail,
      manager: req.user._id
    });

    return res.json({
      message: "Update course success"
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await courseModel.findById(id);

    if (!course) {
      return res.status(404).json({
        message: "Course not found"
      });
    }

    const dirname = path.resolve();

    const filePath = path.join(dirname, "public/uploads/courses", course.thumbnail);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    await courseModel.findByIdAndDelete(id);
    return res.json({
      message: "Delete course success"
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
};

export const postContentCourse = async (req, res) => {
  try {
    const body = req.body;

    const course = await courseModel.findById(body.courseId);

    const content = new courseDetailModel({
      title: body.title,
      type: body.type,
      course: course._id,
      text: body.text,
      youtubeId: body.youtubeId
    });

    await content.save();

    await courseModel.findByIdAndUpdate(
      course._id,
      {
        $push: {
          details: content._id
        }
      },
      { new: true }
    );

    return res.json({
      message: "Create content success"
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
};

export const updateContentCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const course = await courseModel.findById(body.courseId);

    await courseDetailModel.findByIdAndUpdate(
      id,
      {
        title: body.title,
        type: body.type,
        course: course._id,
        text: body.text,
        youtubeId: body.youtubeId
      },
      { new: true }
    );

    return res.json({
      message: "Update content success"
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
};

export const deleteContentCourse = async (req, res) => {
  try {
    const { id } = req.params;
    await courseDetailModel.findOneAndDelete({
      _id: id
    });
    return res.json({
      message: "Delete Content Success"
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
};

export const getDetailContent = async (req, res) => {
  try {
    const { id } = req.params;
    const content = await courseDetailModel.findById(id);

    return res.json({
      message: "Get detail content success",
      data: content
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
};

export const getStudentsByCourseId = async (req, res) => {
  try {
    const { id } = req.params;

    // ambil course dan populate students (select field photo)
    const course = await courseModel.findById(id).select("name").populate({
      path: "students",
      select: "name email photo" // ambil field photo dari user
    });

    // base url untuk foto siswa
    const photoBaseUrl = (process.env.APP_URL || "") + "/uploads/students/";

    // map students -> tambahkan photo_url (consisten dengan endpoint /students)
    const students = (course?.students || []).map((item) => {
      const obj = item.toObject();
      return {
        ...obj,
        photo_url: obj.photo ? photoBaseUrl + obj.photo : null
      };
    });

    // kembalikan data dengan key 'students' (bukan 'student') untuk konsistensi
    return res.json({
      message: "Get student by course success",
      data: {
        ...course.toObject(),
        students // key konsisten
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
};

export const postStudentToCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;

    await userModel.findByIdAndUpdate(body.studentId, {
      $push: {
        courses: id
      }
    });

    await courseModel.findByIdAndUpdate(id, {
      $push: {
        students: body.studentId
      }
    });
    return res.json({
      message: "Add students to course succes"
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
};

export const deleteStudentToCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { studentId } = req.body;

    await userModel.findByIdAndUpdate(studentId, {
      $pull: {
        courses: id
      }
    });

    await courseModel.findByIdAndUpdate(id, {
      $pull: {
        students: studentId
      }
    });

    return res.json({
      message: "Delete student from course success"
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
};
