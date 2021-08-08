const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const countrySchema = new Schema({
  name: { type: String },
  continent: { type: String },
  flag: { type: String },
  rank: { type: Number },
});

const CountryCollection = mongoose.model("Countries", countrySchema);

module.exports = CountryCollection;
