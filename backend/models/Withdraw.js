import mongoose from "mongoose";
import { withdrawSchema } from "../schemas/Withdraw.js";

export default mongoose.model("Withdraw", withdrawSchema);
