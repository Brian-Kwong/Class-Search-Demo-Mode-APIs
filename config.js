const dotenv = require("dotenv");
dotenv.config();
module.exports = {
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    SESSION_SECRET: process.env.SESSION_SECRET,
    SEARCH_OPTIONS_URL: process.env.SEARCH_OPTIONS_URL,
    CLASS_SEARCH_URL: process.env.CLASS_SEARCH_URL,
    CLASS_DETAILS_URL: process.env.CLASS_DETAILS_URL,
  },
};
