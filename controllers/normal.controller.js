import ENV from "../utils/env.js";

const file_handler = async (req, res) => {
  return res.status(200).json({ message: "Let's hack the planet!" });
};

export { file_handler };
