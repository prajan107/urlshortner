
const urlRepository =
    require("../repositories/urlRepository");

function generateCode(length = 6) {

    const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    let result = "";

    for(let i = 0; i < length; i++) {

        result += chars.charAt(
            Math.floor(Math.random() * chars.length)
        );
    }

    return result;
}

function createShortUrl(originalUrl, expiry, customAlias, callback) {
    const alias =
        typeof customAlias === "string"
            ? customAlias.trim()
            : "";

    const shortCode =
        alias || generateCode();

    let expiresAt = null;

    if(expiry !== "0"){

        expiresAt = new Date();

        expiresAt.setDate(
            expiresAt.getDate() + parseInt(expiry)
        );
    }

    function saveUrl(){
        urlRepository.createUrl(
            originalUrl,
            shortCode,
            expiresAt,
            (err,result)=>{

                if(err){
                    return callback(err);
                }

                callback(
                    null,
                    shortCode
                );
            }
        );
    }

    if(!alias){
        return saveUrl();
    }

    urlRepository.findByCode(
        shortCode,
        (err,result)=>{

            if(err){
                return callback(err);
            }

            if(result.length > 0){
                const error =
                    new Error("Custom alias already exists");

                error.statusCode = 409;

                return callback(error);
            }

            saveUrl();
        }
    );
}

module.exports = {
    generateCode,
    createShortUrl
};

