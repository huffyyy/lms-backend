import { z } from "zod";

export const exampleSchema = z.object({
  name: z.string().min(3)
});

export const signUpSchema = z.object({
  name: z.string().min(5),
  email: z.string().email(),
  password: z.string().min(5)
});

export const signInSchema = signUpSchema.omit({ name: true });

export const mutateCourseSchema = z.object({
  name: z.string().min(5),
  categoryId: z.string(),
  tagline: z.string().min(5),
  description: z.string().min(10)
});

export const mutateContentSchema = z.object({
  title: z.string().min(5),
  type: z.string(),
  youtubeId: z.string().optional(),
  text: z.string().optional(),
  courseId: z.string().min(5)
});

export const mutatateStudentSchema = z.object({
  name: z.string().min(5),
  email: z.string().email(),
  password: z.string().min(5)
});

export const addStudentCourseSchema = z.object({
  studentId: z.string().min(5)
});
