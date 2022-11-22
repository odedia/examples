const Mongoose = require("mongoose");

const PageSchema = new Mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  org: {
    type: String,
    default: "Warehouse Ops",
    required: true,
  }
});

const Page = Mongoose.model("page", PageSchema);

module.exports = Page;
