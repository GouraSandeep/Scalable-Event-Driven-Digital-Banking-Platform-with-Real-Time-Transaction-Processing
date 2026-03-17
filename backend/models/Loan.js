import mongoose from "mongoose";

import { loanSchema } from "../schemas/Loan.js";

export default mongoose.model("Loan", loanSchema);
