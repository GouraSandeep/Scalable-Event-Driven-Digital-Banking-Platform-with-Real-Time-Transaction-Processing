import mongoose from "mongoose";

import { accountSchema } from "../schemas/Account.js";

export default mongoose.model("Account", accountSchema);
