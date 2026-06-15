const express = require("express");
const db = require("./db");

const app = express();

app.use(express.json());
app.use(express.static("public"));

function generateCode(length = 6) {
    const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    let result = "";

    for(let i=0;i<length;i++){
        result += chars.charAt(
            Math.floor(Math.random() * chars.length)
        );
    }

    return result;
}

app.post("/shorten", (req,res)=>{

    const originalUrl = req.body.url;

    const shortCode = generateCode();

    const sql =
        "INSERT INTO urls (original_url, short_code) VALUES (?, ?)";

    db.query(
        sql,
        [originalUrl, shortCode],
        (err,result)=>{

            if(err){
                return res.status(500).send(err);
            }

            res.json({
                shortUrl:
                    `http://localhost:3000/${shortCode}`
            });
        }
    );
});

app.get("/:code",(req,res)=>{

    const code = req.params.code;

    db.query(
        "SELECT * FROM urls WHERE short_code=?",
        [code],
        (err,result)=>{

            if(result.length > 0){
                res.redirect(
                    result[0].original_url
                );
            }else{
                res.send("URL Not Found");
            }
        }
    );
});

app.listen(3000,()=>{
    console.log("Server running on port 3000");
});