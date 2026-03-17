import Joi from "joi";

export const TransactionSchema = Joi.object({
  receiverAccount: Joi.string().trim().required(),
  amount: Joi.number().positive().required().messages({
    "number.base": "Amount must be a number",
    "number.positive": "Amount must be greater than 0",
    "any.required": "Amount is required",
  }),
  mpin: Joi.string().length(4).required(),
});
