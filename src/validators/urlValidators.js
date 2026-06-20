const { body } = require("express-validator");

const validateUrl = [

    body("url")
        .notEmpty()
        .withMessage("URL is required")

        .isURL()
        .withMessage("Please enter a valid URL")

];

module.exports = {
    validateUrl
};