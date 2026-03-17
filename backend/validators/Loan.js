import Joi from "joi";

export const LoanSchema = Joi.object({
  userId: Joi.string().hex().length(24).required(),
  amount: Joi.number().positive().required(),
  status: Joi.string()
    .valid("pending", "approved", "rejected")
    .default("pending"),
  createdAt: Joi.date().optional(),
});
