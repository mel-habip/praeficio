const BE_DOMAIN = `http://localhost:8000/`;


// fetch(BE_DOMAIN, {
//     method: "GET"
// }).then(res => res.json()).then(data => {
//     data.split('').forEach(letter => console.log(letter))
// });


let fetchData = {
    method: "post",
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },

    body: JSON.stringify({
        username: 'user',
        password: 'password'
    })
}

var fromServer = fetch(BE_DOMAIN + 'api/create_new_user/?username=Mel&password=123', fetchData)
    .then(function (response) {
        if (!response.ok) {
            throw Error(response.statusText);
        }
        return response.json();
    })
    .then(function (response) {
        console.log(response);
    })
    .catch(error => console.log("there was an error --> " + error));


