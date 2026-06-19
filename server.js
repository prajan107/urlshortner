const express = require("express");

const urlController =
require("./src/controllers/urlController");

const app = express();

app.use(express.json());
app.use(express.static("public"));

app.post(
    "/shorten",
    urlController.shortenUrl
);

app.get(
    "/:code",
    urlController.redirectUrl
);

app.listen(3000,()=>{

    console.log(
        "Server running on port 3000"
    );

});