const CountryCollection = require("../models/Country");
const fs = require("fs");
const httpStatus = require("http-status");

exports.getCountries = async (req, res, next) => {
  try {
    let countries = await CountryCollection.find();
    return res.status(httpStatus.OK).json({
      status: true,
      data: countries,
    });
  } catch (err) {
    res.status(httpStatus.BAD_REQUEST).json({
      status: false,
      error: "Something went wrong!!",
    });
  }
};

exports.addCountry = async (req, res, next) => {
  let body = req.body;
  let alreadyPresent = await CountryCollection.findOne({
    $or: [{ name: body.countryName }, { rank: body.rank }],
  });

  if (alreadyPresent != null) {
    return res.status(httpStatus.OK).json({
      status: false,
      error: "Name or Rank is already present!!",
    });
  }

  let buffer = new Buffer(
    body.fileString.replace(/^data:image\/\w+;base64,/, ""),
    "base64"
  );
  if (buffer.byteLength > 524288) {
    return res.status(httpStatus.OK).json({
      status: false,
      error: "File size is too long",
    });
  }

  let fileExt = body.file.split(".").pop();
  let allowedExt = ["png", "jpg"];
  if (!allowedExt.includes(fileExt)) {
    return res.status(httpStatus.OK).json({
      status: false,
      error: "Only jpg or png is allowed",
    });
  }

  let fileName = body.countryName + Date.now() + "." + fileExt;
  fs.writeFile("./public/images/" + fileName, buffer, async (err) => {
    if (err) {
      return res.status(httpStatus.BAD_GATEWAY).json({
        status: false,
        err: err,
      });
    }
    let newObject = new CountryCollection({
      name: body.countryName,
      continent: body.continent,
      flag: fileName,
      rank: body.rank,
    });
    let response = await newObject.save();
    return res.status(httpStatus.OK).json({
      status: true,
      data: response,
    });
  });
};

exports.getSingleCountry = async (req, res, next) => {
  try {
    let countryName = req.params.name;
    let country = await CountryCollection.findOne({ name: countryName });

    if (country == null) {
      return res.status(httpStatus.NOT_FOUND).json({
        status: false,
        error: "Data not found",
      });
    }

    return res.status(httpStatus.OK).json({
      status: true,
      data: country,
    });
  } catch (err) {}
};

exports.getContinents = async (req, res, next) => {
  try {
    fs.readFile("./data/data.json", "utf-8", (err, data) => {
      if (err) {
        return res.status(httpStatus.BAD_REQUEST).json({
          status: false,
          error: "Something went wrong",
        });
      } else {
        let countries = JSON.parse(data);
        countries =
          typeof countries.countries !== "undefined" ? countries.countries : [];
        let continents = [];
        countries.forEach((cont) => {
          continents.push(cont.continent);
        });
        let unique = [...new Set(continents)];
        return res.status(200).json({
          status: true,
          data: unique,
        });
      }
    });
  } catch (err) {
    return res.status(400).json({
      status: false,
      error: "Something went wrong",
    });
  }
};
