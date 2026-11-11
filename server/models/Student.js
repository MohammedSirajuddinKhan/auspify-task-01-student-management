import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Student name is required"],
      trim: true,
      minlength: 3,
      maxlength: 60,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    rollNumber: {
      type: String,
      required: [true, "Roll Number is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    course: {
      type: String,
      required: [true, "Course is required"],
      trim: true,
    },
    semester: {
      type: Number,
      required: [true, "Semester is required"],
      min: 1,
      max: 6,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      match: [/^[0-9]{10}$/, "Enter a valid 10-digit phone number"],
    },
  },
  { timestamps: true },
);

const Student = mongoose.model("Student", studentSchema);

export default Student;
