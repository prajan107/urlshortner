async function shortenURL(){

    const url =
        document.getElementById("urlInput").value;

    const expiry =
    document.getElementById("expiry").value;
    const customAlias =
    document.getElementById("customAlias").value;

    const response =
        await fetch("/shorten",{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify(
                {url,
                expiry,
                customAlias}

            )
        });

    const data =
        await response.json();

    const result =
        document.getElementById("result");

    if(data.errors){

        result.innerHTML =
            data.errors[0].msg;

        return;
    }

    if(data.message){

        result.innerHTML =
            data.message;

        return;
    }

    result.innerHTML =
        `<a href="${data.shortUrl}">
            ${data.shortUrl}
        </a>`;
}
