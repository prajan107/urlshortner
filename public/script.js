async function shortenURL(){

    const url =
        document.getElementById("urlInput").value;

    const expiry =
    document.getElementById("expiry").value;

    const response =
        await fetch("/shorten",{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify(
                {url,
                expiry}

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

    result.innerHTML =
        `<a href="${data.shortUrl}">
            ${data.shortUrl}
        </a>`;
}