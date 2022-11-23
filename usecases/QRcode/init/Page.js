const Mongoose = require("mongoose");

const PageSchema = new Mongoose.Schema({
  campaignName: {
    type: String,
    required: true,
  },
  targetPage: {
    type: String,
    required: true,
  },
  org: {
    type: String,
    default: "Marketing Biz",
    required: true,
  }
});

const Page = Mongoose.model("page", PageSchema);

module.exports = Page;
