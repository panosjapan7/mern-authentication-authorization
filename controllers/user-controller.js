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

exports.signup = signup;
