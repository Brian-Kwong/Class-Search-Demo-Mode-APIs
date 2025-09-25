const dotenv = require("dotenv");
dotenv.config();
module.exports = {
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    SEARCH_OPTIONS_URL: process.env.SEARCH_OPTIONS_URL,
    CLASS_SEARCH_URL: process.env.CLASS_SEARCH_URL,
    CLASS_DETAILS_URL: process.env.CLASS_DETAILS_URL,
  },
};
