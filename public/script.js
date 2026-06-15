async function shortenURL(){

    const url =
        document.getElementById("urlInput").value;

    const response =
        await fetch("/shorten",{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({url})
        });

    const data =
        await response.json();

    document.getElementById("result")
        .innerHTML =
        `<a href="${data.shortUrl}">
            ${data.shortUrl}
        </a>`;
}