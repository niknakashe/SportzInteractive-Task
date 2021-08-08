const express = require("express");
const router = express.Router();
const CountryController = require("../controller/countries");
const multer = require("multer");
const upload = multer();

router.get("/", CountryController.getCountries);

router.get("/getContinents", CountryController.getContinents);

router.get("/:name", CountryController.getSingleCountry);

router.post(
  "/",
  upload.array("uploads[]", 12),
  CountryController.addCountry
);

module.exports = router;
