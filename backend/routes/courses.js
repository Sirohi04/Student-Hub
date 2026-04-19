const express = require("express");
const router = express.Router();
const Course = require("../models/Course");

router.get("/", async (req, res) => {
  try {
    const courses = await Course.find({})
      .select("name teacher credits createdAt")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json(courses);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, teacher, credits } = req.body;

    if (!name || !teacher || !credits) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const course = await Course.create({ name, teacher, credits });

    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;