import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Owner from "../models/Owner.js";

const indianMobilePattern = /^[6-9]\d{9}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function createToken(ownerId) {
  return jwt.sign({ ownerId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

function publicOwner(owner) {
  return {
    id: owner._id,
    fullName: owner.fullName,
    mobileNumber: owner.mobileNumber,
    email: owner.email,
    createdAt: owner.createdAt,
  };
}

export async function register(req, res) {
  try {
    const { fullName, mobileNumber, email, password } = req.body;
    const normalizedMobile = mobileNumber?.trim();
    const normalizedEmail = email?.trim().toLowerCase();

    if (!fullName?.trim() || !normalizedMobile || !normalizedEmail || !password) {
      return res.status(400).json({ message: "All registration fields are required." });
    }
    if (!indianMobilePattern.test(normalizedMobile)) {
      return res.status(400).json({ message: "Enter a valid 10-digit Indian mobile number." });
    }
    if (!emailPattern.test(normalizedEmail)) {
      return res.status(400).json({ message: "Enter a valid email address." });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must contain at least 6 characters." });
    }

    const existingOwner = await Owner.findOne({
      $or: [{ mobileNumber: normalizedMobile }, { email: normalizedEmail }],
    });
    if (existingOwner) {
      const field = existingOwner.mobileNumber === normalizedMobile ? "mobile number" : "email address";
      return res.status(409).json({ message: `An account with this ${field} already exists.` });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const owner = await Owner.create({
      fullName: fullName.trim(),
      mobileNumber: normalizedMobile,
      email: normalizedEmail,
      password: hashedPassword,
    });

    return res.status(201).json({ message: "Registration successful. Please log in.", user: publicOwner(owner) });
  } catch (error) {
    return res.status(500).json({ message: "Unable to register at this time." });
  }
}

export async function login(req, res) {
  try {
    const { mobileNumber, password } = req.body;
    if (!mobileNumber?.trim() || !password) {
      return res.status(400).json({ message: "Mobile number and password are required." });
    }

    const owner = await Owner.findOne({ mobileNumber: mobileNumber.trim() }).select("+password");
    if (!owner || !(await bcrypt.compare(password, owner.password))) {
      return res.status(401).json({ message: "Invalid mobile number or password." });
    }

    return res.json({ message: "Login successful.", token: createToken(owner._id), user: publicOwner(owner) });
  } catch (error) {
    return res.status(500).json({ message: "Unable to log in at this time." });
  }
}
