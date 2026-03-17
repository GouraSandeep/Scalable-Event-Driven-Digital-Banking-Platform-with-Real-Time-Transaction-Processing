import Joi from "joi";

export const AccountSchema = Joi.object({
  accountType: Joi.string().valid("savings", "current").required(),
  mpin: Joi.string()
    .length(4)
    .pattern(/^[0-9]{4}$/)
    .required(),
});
