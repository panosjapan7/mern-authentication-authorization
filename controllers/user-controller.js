const brcypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../model/User");

const JWT_SECRET_KEY = "MyKey";

const signup = async (req, res, next) => {
  const { name, email, password } = req.body;
  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (error) {
    console.log("error: ", error);
  }

  if (existingUser)
    return res.status(400).json({ message: "User already exists" });

  const hashedPassword = brcypt.hashSync(password);
  const user = new User({
    name,
    email,
    password: hashedPassword,
  });

  try {
    await user.save();
  } catch (error) {
    console.log("error: ", error);
  }

  return res.status(201).json({ message: user });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;

  try {
    existingUser = await User.findOne({ email: email });
  } catch (error) {
    return new Error("error: ", err);
  }

  if (!existingUser)
    return res.status(400).json({ message: "User not found. Signup please" });

  const isPasswordCorrect = brcypt.compareSync(password, existingUser.password);
  if (!isPasswordCorrect)
    return res.status(400).json({ message: "Invalid email or password" });
  const token = jwt.sign({ id: existingUser._id }, JWT_SECRET_KEY, {
    expiresIn: "1hr",
  });

  return res
    .status(200)
    .json({ message: "Successfully logged in.", user: existingUser, token });
};

const verifyToken = (req, res, next) => {
  const headers = req.header(`Authorization`);
  const token = headers.split(" ")[1];
  if (!token) return res.status(404).json({ message: "Token not found" });
  jwt.verify(String(token), JWT_SECRET_KEY, (error, user) => {
    if (error) return res.status(400).json({ message: "Invalid token" });
    req.id = user.id;
  });
  next();
};

const getUser = async (req, res, next) => {
  const userId = req.id;
  let user;
  try {
    user = await User.findById(userId, "-password"); // Send all the details of this User entry except the "password" field
  } catch (error) {
    return new Error(error);
  }

  if (!user) return res.status(404).json({ message: "User not found" });

  return res.status(200).json({ user });
};

module.exports = { getUser, login, signup, verifyToken };
