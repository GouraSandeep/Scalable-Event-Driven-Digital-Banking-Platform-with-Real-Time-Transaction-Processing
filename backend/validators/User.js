import Joi from "joi";
export const UserSchema = Joi.object({
  username: Joi.string().trim().min(3).required(),
  email: Joi.string().email().trim().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid("user", "admin").default("user"),
});
