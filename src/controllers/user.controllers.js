const mongoose = require("mongoose");
const { errorHandler } = require("../utils/error-handler");
const bcrypt = require("bcryptjs");
const User = require("../Models/User.model");
const { isValidObjectId } = require("../utils/isValidObjectId");
const jwt = require("jsonwebtoken");

const registerUsers = async (req, res) => {
  try {
    const { fullName, email, password, role, DOB, phoneNumber, address, gender, description, profession, images, category } = req.body;
    if (!fullName || !email || !password || !DOB || !role || !phoneNumber || !address || !gender) {
      return res.status(400).json({ error: "Please add all fields " });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      fullName: fullName.trim(),
      email: email.trim(),
      password: hashedPassword,
      role,
      DOB,
      phoneNumber: phoneNumber.trim(),
      address: address.trim(),
      gender: gender.trim(),
    });
    if (role === "professional") {
      if (!profession || !category || !description) {
        return res.status(400).json({ error: "Please fill all the fields" });
      }
      newUser.category = category;
      newUser.profession = profession;
      newUser.images = images;
      newUser.description = description;
    }

    if (newUser) {
      return res.status(201).json({ message: "Registered Successfully" });
    }
  } catch (error) {
    return res.status(500).json({ error: errorHandler(error) });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      return res.status(201).json({ message: "Login Successful", token: generateToken(user.id), user });
    }

    return res.status(404).json({ error: "Invalid Email and Password" });
  } catch (error) {
    return res.status(500).json(errorHandler(error));
  }
};

const getUsers = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!isValidObjectId(userId)) {
      return res.status(404).json({ error: "Invalid Id" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User Not Found" });
    }

    return res.status(200).json({ message: "User Retrived Sucessfully", user });
  } catch (error) {
    return res.status(500).json(errorHandler(error));
  }
};
const updateProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    const { fullName, email, role, DOB, phoneNumber, address, gender, description, profession, images, category } = req.body;

    user.fullName = fullName;
    user.email = email;
    user.role = role;
    user.DOB = DOB;
    user.phoneNumber = phoneNumber;
    user.address = address;
    user.gender = gender;
    user.description = description;

    if (role === "professional" && (!profession || !category)) {
      return res.status(400).json({ error: "Please fill all the required fields for professional users" });
    }
    user.profession = profession;
    user.images = images;
    user.category = category;

    return res.status(200).json({ message: "Your Profile has been updated", user });
  } catch (error) {
    return res.status(500).json(errorHandler(error));
  }
};
const searchUser = async (req, res) => {
  try {
    const { search } = req.body;

    if (!search) {
      return res.status(400).json({ error: "Please add all fields " });
    }
    const userExists = await User.find({ $or: [{ fullName: search }, { category: search }] });

    if (!userExists[0]) {
      return res.status(400).json({ error: "User dosen't exist" });
    }

    return res.status(201).json({ message: "Search Successful", users: userExists });
  } catch (error) {
    return res.status(500).json(errorHandler(error));
  }
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "3h",
  });
};

module.exports = { registerUsers, login, getUsers, searchUser, updateProfile };
