const { validationResult } =
require("express-validator");
const urlService =
    require("../services/urlService");

const urlRepository =
    require("../repositories/urlRepository");

function shortenUrl(req,res,next){
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
        errors: errors.array()
    });
}
    
    const originalUrl =
        req.body.url;
    
    const expiry =
    req.body.expiry;

    urlService.createShortUrl(
        originalUrl,
        expiry,
        (err,shortCode)=>{

            if(err){
                
                   return next(err);
                }
        

            res.json({
                shortUrl:
                `http://localhost:3000/${shortCode}`
            });
        }
    );
}

function redirectUrl(req,res){

    const code =
        req.params.code;

    urlRepository.findByCode(
        code,
        (err,result)=>{

            if(result.length > 0){

    const url = result[0];

    if(
        url.expires_at &&
        new Date() > new Date(url.expires_at)
    ){
        return res.send(
            "Link has expired"
        );
    }

    res.redirect(
        url.original_url
    );

} else {

    res.send(
        "URL Not Found"
    );
}
        }
    );
}

module.exports = {
    shortenUrl,
    redirectUrl
};