import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import Jwt from "jsonwebtoken";

export const signup = async (req, res, next) => {
  const { username, email, password } = req.body;
  const hashedPassword = bcryptjs.hashSync(password, 10);
  const newUser = new User({ username, email, password: hashedPassword });

  try {
    await newUser.save();
    res.status(201).json("user created successfully");
  } catch (error) {
    next(error);
  }
};

export const signin = async (req, res, next) =>{
  const {email, password} = req.body;
  try {
    const user = await User.findOne({ email });
    if(!user){
      return next(errorHandler(404, "User not found"));
    }
    const userPassword = bcryptjs.compareSync(password, user.password);
    if(!userPassword){
      return next(errorHandler(401, "Wrong credentials"));
    }
    const token = await Jwt.sign({id: user._id}, process.env.JWT_SECRET);

    // the below line prevents the server from sending the hashed password to the client
    const {password: pass, ...rest} = user._doc;
    res.cookie("access-token", token, {httpOnly: true}).status(200).json(rest);
  } catch (error) {
    next(error);
  }
}
