import ENV from "../utils/env.js";

const get_home = async (req, res) => {
  return res.status(200).json({ message: "Let's hack the planet! Hack ethically and legally. With great power comes great responsibility." });
};

export { get_home };
