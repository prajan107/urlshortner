const rateLimit = require("express-rate-limit");
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    message: "Too many requests, please try again later."
  }
});

const authenticateToken =
    require("./src/middleware/authMiddleware");
const userController =
require("./src/controllers/userController");
const { validateUrl } =
require("./src/validators/urlValidators.js");
const errorHandler =
require("./src/middleware/errorHandler");
const express = require("express");

const urlController =
require("./src/controllers/urlController");

const app = express();

app.use(express.json());
app.use(limiter);
app.use(express.static("public"));

app.post(
    "/shorten",
    validateUrl,
    urlController.shortenUrl
);

app.post(
    "/register",
    userController.register
);

app.post("/login", userController.login);

app.get(
    "/analytics/:code",
    authenticateToken,
    urlController.getAnalytics
);

app.get(
    "/:code",
    urlController.redirectUrl
);
app.use(errorHandler);

app.listen(3000,()=>{

    console.log(
        "Server running on port 3000"
    );

});
