const mongoose = require("mongoose");

const hospitalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Hospital name is required"],
      unique: true,
      trim: true,
      maxlength: [120, "Hospital name cannot exceed 120 characters"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    about: {
      type: String,
      default: "",
      maxlength: [1200, "About text cannot exceed 1200 characters"],
    },
    facilities: [{ type: String }],
    contact: {
      phone: { type: String, default: "" },
      email: { type: String, default: "" },
      address: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Hospital", hospitalSchema);
