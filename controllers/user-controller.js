const brcypt = require("bcryptjs");
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
    console.log("email: ", email);
    existingUser = await User.findOne({ email: email });
    console.log("existingUser: ", existingUser);
  } catch (error) {
    return new Error("error: ", err);
  }

  if (!existingUser)
    return res.status(400).json({ message: "User not found. Signup please" });

  const isPasswordCorrect = brcypt.compareSync(password, existingUser.password);
  console.log("isPasswordCorrect: ", isPasswordCorrect);
  if (!isPasswordCorrect)
    return res.status(400).json({ message: "Invalid email or password" });
  if (isPasswordCorrect)
    return res.status(200).json({ message: "Successfully logged in." });
};

module.exports = { login, signup };
