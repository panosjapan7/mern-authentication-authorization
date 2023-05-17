const brcypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../model/User");

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

  const token = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: "35s",
  });

  console.log("Generated Token\n", token);

  if (req.cookies[`${existingUser._id}`]) {
    req.cookies[`${existingUser._id}`] = "";
  }

  res.cookie(String(existingUser._id), token, {
    path: "/",
    expires: new Date(Date.now() + 1000 * 30),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV,
  }); // "existingUser._id" will be the name of the cookie and "token" will be its value

  return res
    .status(200)
    .json({ message: "Successfully logged in.", user: existingUser, token });
};

const verifyToken = (req, res, next) => {
  const cookies = req.headers.cookie; // Gets cookies from header
  const token = cookies.split("=")[1];

  if (!token) return res.status(404).json({ message: "Token not found" });

  jwt.verify(String(token), process.env.JWT_SECRET_KEY, (error, user) => {
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

const refreshToken = (req, res, next) => {
  const cookies = req.headers.cookie; // Gets cookies from header
  const prevToken = cookies.split("=")[1];
  if (!prevToken)
    return res.status(400).json({ message: "Couldn't find token" });

  jwt.verify(String(prevToken), process.env.JWT_SECRET_KEY, (err, user) => {
    if (err) {
      console.log(err);
      return res.status(403).json({ message: "Authentication failed" });
    }

    res.clearCookie(`${user.id}`);
    req.cookies[`${user.id}`] = "";

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "35s",
    });

    console.log("Regenerated Token\n", token);

    res.cookie(String(user.id), token, {
      path: "/",
      expires: new Date(Date.now() + 1000 * 30), // 30 seconds
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV,
    }); // "existingUser._id" will be the name of the cookie and "token" will be its value

    req.id = user.id;
    next();
  });
};

const logout = (req, res, next) => {
  const cookies = req.headers.cookie; // Gets cookies from header
  const prevToken = cookies.split("=")[1];
  if (!prevToken)
    return res.status(400).json({ message: "Couldn't find token" });

  jwt.verify(String(prevToken), process.env.JWT_SECRET_KEY, (err, user) => {
    if (err) {
      console.log(err);
      return res.status(403).json({ message: "Authentication failed" });
    }

    res.clearCookie(`${user.id}`);
    req.cookies[`${user.id}`] = "";

    return res.status(200).json({ message: "Logged out successfully" });
  });
};

exports.signup = signup;
exports.login = login;
exports.verifyToken = verifyToken;
exports.getUser = getUser;
exports.refreshToken = refreshToken;
exports.logout = logout;
