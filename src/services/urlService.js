
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

function createShortUrl(originalUrl, expiry, callback) {

    const shortCode =
        generateCode();
        let expiresAt = null;

if(expiry !== "0"){

    expiresAt = new Date();

    expiresAt.setDate(
        expiresAt.getDate() + parseInt(expiry)
    );
}

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

module.exports = {
    generateCode,
    createShortUrl
};

