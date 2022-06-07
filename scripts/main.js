const Http_Methods = {
    GET: 'GET',
    POST: 'POST',
    PATCH: 'PATCH',
    DELETE: 'DELETE'
};

const Base_Url = {
    localhost: 'localhost:8080',
    staging: '161.35.219.110:3030'
}
/**
 *
 * @returns {Promise<void>}
 */

var matchId;

//gestisce lo scorrimento delle parole iniziali
async function initMatch() {
    let endpoint = "/match"
    let checkbox = document.getElementById("allowAdmittedWords")
    if (checkbox.checked) {
        endpoint = "/match?allowAdmittedWords=true"
        console.log("checkato")
    } else {
        endpoint = "/match"
    }

    let url = "http://" + Base_Url.localhost + endpoint;
    let res = await newApiRequest(url, Http_Methods.POST);

    let htmlBlock = "<div class='text'>";
    let initialWords = res.initialSuggestedWords;
    matchId=res.id

    if(initialWords){
        for(word of initialWords){
            htmlBlock = htmlBlock + " | " + word + " | ";
        }
    }
    document.getElementById("firstWord-slider").innerHTML = htmlBlock + "</div>";
}




//riceve i suggerimenti di parole
async function submitLetters(requestBody) {
    let url = "http://" + Base_Url.localhost + "/words";
    let res = await newApiRequest(url, Http_Methods.POST, requestBody);

    let suggestionsArea = document.getElementById("suggestions");

    suggestionsArea.style.display = "block";

    console.log(res)
    let htmlBlock = "";
    let suggestions = res.suggestedWords;
    let greenLetters = res.match.insertedLettersGreen;

    if(suggestions){
        document.querySelector("div#suggestions h2").textContent = "Parole suggerite (" + suggestions.length + ")"
        let cols = 3;
        const initArea = document.getElementById('initArea');
        initArea.style.display = "none";
        for(word of suggestions){

            if(cols>0){
                htmlBlock = htmlBlock + "<td>" + word.word + "</td>";
                cols--;
            } else{
                htmlBlock = htmlBlock + "</tr>"
                htmlBlock = htmlBlock + "<tr><td>" + word.word + "</td>";
                cols = 2;
            }
           // htmlBlock = htmlBlock + "<tr><td>" + word.word + "</td></tr>";
        }
        htmlBlock = htmlBlock + "</tr>"
    } else{
        document.querySelector("div#suggestions h2").textContent = "Nessuna parola trovata"
    }
    const form = document.getElementById('formArea');
    form.reset();
    for(greenLetter of greenLetters){
        let pos = greenLetter.pos;
        document.getElementById("greenCell-"+pos).value = greenLetter.letter
    }
    document.querySelector("div#suggestions table").innerHTML = htmlBlock;
}

//invia il JSON
const form = document.getElementById('formArea')
form.addEventListener('submit', async (e) => {
    e.preventDefault()

    const form = e.currentTarget;


    try {
        const formData = new FormData(form);
        const plainFormData = Object.fromEntries(formData.entries());

        let requestBody = convertToApiRequestObject(plainFormData);

        await submitLetters(requestBody);

    } catch (error) {
        console.error(error);
    }
})

const btn = document.getElementById('goToSolverBtn')
btn.addEventListener('click', async (e) => {
    e.preventDefault();

    await initMatch();

    const initArea = document.getElementById('initArea');
    const configArea = document.getElementById('configArea');
    initArea.style.display = "block";
    configArea.style.display = "none";
    e.target.style.display = "none";
    form.style.display = "block";

})




//Converte le lettere in oggetti
function convertToApiRequestObject(plainFormData) {
    let result = {
        matchId: matchId,
        submittedWord: {
            greenLetters: [
                {
                    pos: 0,
                    value: plainFormData['greenCell-0'].toUpperCase()
                },
                {
                    pos: 1,
                    value: plainFormData['greenCell-1'].toUpperCase()
                },
                {
                    pos: 2,
                    value: plainFormData['greenCell-2'].toUpperCase()
                },
                {
                    pos: 3,
                    value: plainFormData['greenCell-3'].toUpperCase()
                },
                {
                    pos: 4,
                    value: plainFormData['greenCell-4'].toUpperCase()
                }
            ],
            yellowLetters: [
                {
                    pos: 0,
                    value: plainFormData['yellowCell-0'].toUpperCase()
                },
                {
                    pos: 1,
                    value: plainFormData['yellowCell-1'].toUpperCase()
                },
                {
                    pos: 2,
                    value: plainFormData['yellowCell-2'].toUpperCase()
                },
                {
                    pos: 3,
                    value: plainFormData['yellowCell-3'].toUpperCase()
                },
                {
                    pos: 4,
                    value: plainFormData['yellowCell-4'].toUpperCase()
                }
            ],
            greyLetters: [
                {
                    pos: 0,
                    value: plainFormData['greyCell-0'].toUpperCase()
                },
                {
                    pos: 1,
                    value: plainFormData['greyCell-1'].toUpperCase()
                },
                {
                    pos: 2,
                    value: plainFormData['greyCell-2'].toUpperCase()
                },
                {
                    pos: 3,
                    value: plainFormData['greyCell-3'].toUpperCase()
                },
                {
                    pos: 4,
                    value: plainFormData['greyCell-4'].toUpperCase()
                }
            ]
        }
    }
    //console.log(result)
    result.submittedWord.greenLetters = result.submittedWord.greenLetters.filter(value => value.value !== '');
    result.submittedWord.yellowLetters = result.submittedWord.yellowLetters.filter(value => value.value !== '');
    result.submittedWord.greyLetters = result.submittedWord.greyLetters.filter(value => value.value !== '');
    return result;
}


/*let input = document.getElementById("submitLettersBtn");
console.log(input)
input.addEventListener("click", (event) => {
    console.log('aa')
    event.preventDefault();
})*/





/* ----------------------------------------------------------------- */
/*                        API-RELATED FUNCTIONS                      */
/* ----------------------------------------------------------------- */


/**
 *
 * @param url
 * @param HTTP_Method
 * @param body
 * @returns {Promise<any>}
 */

//credo avvia le richiesta api
async function newApiRequest(url, HTTP_Method, body = null ) {
    let requestOptions;
    if (body == null) {
        requestOptions = {
            method: HTTP_Method,
            mode: 'cors',
            headers: new Headers({
                "Content-Type": "application/json"
            }),
        };
    } else {
        requestOptions = {
            method: HTTP_Method,
            mode: 'cors',
            headers: new Headers({
                "Content-Type": "application/json"
            }),
            body: JSON.stringify(body)
        };

    }

    const response = await fetch(url, requestOptions);
    return await response.json();
    /*
        .then(response => response.text())
        .then(result => console.log(JSON.parse(result)))
        .catch(error => console.log('error', error));
        */
}




