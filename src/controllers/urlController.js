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
    const customAlias =
    req.body.customAlias;

    urlService.createShortUrl(
        originalUrl,
        expiry,
        customAlias,
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
    (err, result) => {

        if (err) {
            console.error(err);
            return res.status(500).send("Database Error");
        }

        if (result && result.length > 0) {
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

                urlRepository.recordVisit(
                    url.id,
                    (err) => {

                        if(err){
                            console.error(err);
                        }

                    }
                );

                res.redirect(
                    url.original_url
                );

            } else {

                res.send(
                    "URL Not Found"
                );

            }
        }
 });
}
function getAnalytics(req,res,next){

    const code =
        req.params.code;

    urlRepository.getVisitCount(
        code,
        (err,result)=>{

            if(err){
                return next(err);
            }

            res.json({
                shortCode: code,
                totalVisits:
                    result[0].totalVisits
            });
        }
    );
}

module.exports = {
    shortenUrl,
    redirectUrl,
    getAnalytics
};
