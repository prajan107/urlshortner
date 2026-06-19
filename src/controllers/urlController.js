const urlService =
    require("../services/urlService");

const urlRepository =
    require("../repositories/urlRepository");

function shortenUrl(req,res){

    const originalUrl =
        req.body.url;

    urlService.createShortUrl(
        originalUrl,
        (err,shortCode)=>{

            if(err){
                return res
                    .status(500)
                    .send(err);
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

                res.redirect(
                    result[0].original_url
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