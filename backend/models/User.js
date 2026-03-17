import mongoose from "mongoose";

import { userSchema } from "../schemas/User.js";

export default mongoose.model("User", userSchema);
