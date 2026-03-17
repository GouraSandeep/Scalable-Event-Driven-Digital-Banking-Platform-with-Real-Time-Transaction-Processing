import mongoose from "mongoose";

import { transactionSchema } from "../schemas/Transaction.js";

export default mongoose.model("Transaction", transactionSchema);
