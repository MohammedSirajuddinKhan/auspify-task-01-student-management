import mongoose from "mongoose";
import Student from "../models/Student.js";
import asyncHandler from "../utils/asyncHandler.js";

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

export const createStudent = asyncHandler(async (req, res) => {
  const { fullName, email, rollNumber, course, semester, phone } = req.body;

  const student = await Student.create({
    fullName,
    email,
    rollNumber,
    course,
    semester,
    phone,
  });

  res.status(201).json({
    success: true,
    message: "Student created successfully",
    data: student,
  });
});

export const getAllStudents = asyncHandler(async (req, res) => {
  const students = await Student.find().sort({
    createdAt: -1,
  });

  res.status(200).json({
    success: true,
    count: students.length,
    data: students,
  });
});

export const getStudentById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw createError("Invalid student ID", 400);
  }

  const student = await Student.findById(id);

  if (!student) {
    throw createError("Student not found", 404);
  }

  res.status(200).json({
    success: true,
    data: student,
  });
});

export const updateStudent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw createError("Invalid student ID", 400);
  }

  const allowedFields = [
    "fullName",
    "email",
    "rollNumber",
    "course",
    "semester",
    "phone",
  ];

  const updates = {};

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    throw createError("No valid fields provided for update", 400);
  }

  const student = await Student.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });

  if (!student) {
    throw createError("Student not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "Student updated successfully",
    data: student,
  });
});

export const deleteStudent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw createError("Invalid student ID", 400);
  }

  const student = await Student.findByIdAndDelete(id);

  if (!student) {
    throw createError("Student not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "Student deleted successfully",
  });
});
