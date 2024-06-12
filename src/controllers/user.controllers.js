const mongoose = require("mongoose");
const { errorHandler } = require("../utils/error-handler");
const bcrypt = require("bcryptjs");
const User = require("../Models/User.model");
const { isValidObjectId } = require("../utils/isValidObjectId");
const jwt = require("jsonwebtoken");
const { sendEmail, sendOtp, verifyEmails } = require("../utils/sendEmail");
const { v4: uuidv4 } = require("uuid");

const registerUsers = async (req, res) => {
	try {
		// console.log(req.body);
		const { fullName, email, password, role, DOB, phoneNumber, address, gender, description, profession, images, category } =
			req.body;
		if (!fullName || !email || !password || !DOB || !role || !phoneNumber || !address || !gender) {
			return res.status(400).json({ error: "Please add all fields " });
		}

		const userExists = await User.findOne({ email });
		if (userExists) {
			return res.status(400).json({ error: "User already exists" });
		}

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		const verificationCode = generateVerificationCode();

		const newUser = await User.create({
			fullName: fullName.trim(),
			email: email.trim(),
			password: hashedPassword,
			role,
			DOB,
			phoneNumber: phoneNumber,
			address: address.trim(),
			gender: gender.trim(),
			emailVerificationCode: verificationCode,
			emailVerified: false,
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
		await newUser.save();

		const emailText = verifyEmails(newUser.fullName, verificationCode, email);
		const subject = "Email Verification";

		await sendEmail(email, subject, emailText);

		if (newUser) {
			return res.status(201).json({ message: "Registered successfully. Please check your email to verify your account." });
		}
	} catch (error) {
		return res.status(500).json({ error: errorHandler(error) });
	}
};

const generateVerificationCode = () => {
	return Math.floor(100000 + Math.random() * 900000).toString();
};

const verifyEmail = async (req, res) => {
	try {
		const { email, verificationCode } = req.body;
		const user = await User.findOne({ email });

		if (!user) {
			return res.status(400).json({ error: "User not found with this email" });
		}

		user.isEmailVerified = true;
		user.emailverificationCode = null;
		await user.save();

		if (user.emailVerificationCode !== verificationCode) {
			return res.status(400).json({ error: "Invalid verification code." });
		}
		res.status(200).json({ message: "Email verified successfully" });
	} catch (error) {
		console.error("Error verifying email:", error);
		res.status(500).json({ error: "Failed to verify email" });
	}
};

const login = async (req, res) => {
	try {
		const { email, password } = req.body;

		const user = await User.findOne({ email });

		if (!user.isEmailVerified) {
			return res.status(403).json({ error: "You must verify your email before logging in" });
		}

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

const getUsersByCategory = async (req, res) => {
	try {
		const { category } = req.query;

		if (!category) {
			return res.status(400).json({ error: "Category parameter is required" });
		}

		const users = await User.find({ category });

		if (!users || users.length === 0) {
			return res.status(404).json({ error: "No users found for the given category" });
		}

		return res.status(200).json({ message: "Users retrieved successfully", userCount: users.length, users });
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

		await user.save();
		console.log(user);

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

const forgotPassword = async (req, res) => {
	try {
		const { email } = req.body;
		const user = await User.findOne({ email });

		if (!user) {
			return res.status(400).send("User not found");
		}

		const otp = uuidv4().slice(0, 6); // Generate a simple 6-character OTP
		user.resetPasswordOtp = otp;
		user.resetPasswordOtpExpires = Date.now() + 300000; // OTP expires in 5 minutes
		await user.save();

		const emailText = sendOtp(user.fullName, otp); // Create the email content
		const subject = "Verification code";

		await sendEmail(user.email, subject, emailText); // Send the email

		return res.status(200).json({ message: "OTP sent to email" });
	} catch (error) {
		console.error("Error in forgotPassword:", error);
		return res.status(500).json({ error: errorHandler(error) });
	}
};

const verifyResetOtp = async (req, res) => {
	try {
		const { email, otp } = req.body;
		const user = await User.findOne({ email, resetPasswordOtp: otp, resetPasswordOtpExpires: { $gt: Date.now() } });

		if (!user) {
			return res.status(400).send("Invalid or expired OTP");
		}

		user.resetPasswordOtp = undefined;
		user.resetPasswordOtpExpires = undefined;
		await user.save();

		res.status(200).send("OTP verified");
	} catch (error) {
		return res.status(500).json({ error: errorHandler(error) });
	}
};

const resetPassword = async (req, res) => {
	try {
		const { email, password } = req.body;
		const user = await User.findOne({ email });

		if (!user) {
			return res.status(400).send("User not found");
		}

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		user.password = hashedPassword;
		await user.save();

		res.status(200).send("Password reset successful");
	} catch (error) {
		return res.status(500).json({ error: errorHandler(error) });
	}
};

const categoryUsers = async (req, res) => {
	try {
		const categories = ["medical", "beauty", "maintenance"];

		let users = [];
		for (const category of categories) {
			const user = await User.find({ category });
			users.push(user);
		}
		// console.log(users);
		return res.status(200).json({ message: "users: ", users });
	} catch (error) {
		return res.status(500).json({ error: errorHandler(error) });
	}
};

module.exports = {
	registerUsers,
	login,
	getUsers,
	searchUser,
	updateProfile,
	forgotPassword,
	resetPassword,
	verifyResetOtp,
	verifyEmail,
	getUsersByCategory,
	categoryUsers,
};
