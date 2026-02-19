import express from "express";
import cors from "cors";
import ENV from "./utils/env.js";

// Route imports
import normal_router from "./routes/normal.route.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // for collecting the request's body (req.body) of requests that come in that are formatted in JSON
app.set("trust proxy", 1); // for getting the right ip the request is coming from.. mostly for rate limiting

// Routes or views
app.use("/", normal_router);

const PORT = ENV.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
