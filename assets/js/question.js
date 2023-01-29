//Ninja trivia API Key.
const ninjaAPIKey = 'JYu2MPGTksY+oXRs5QynHQ==IvWTlwPMWz9NZLpb';

//Ninja trivia query URL.
const triviaQueryURL = 'https://api.api-ninjas.com/v1/trivia';

//Wikipedia query URL.
const wikipediaQueryURL = 'https://en.wikipedia.org/w/api.php';

//Total questions to be asked.
const totalQuestionNumber = 10;

//Total wikipedia results to display.
let wikipediaResultNumber = 3;

//DOM Elements
const containerEl = document.querySelector('#container');

//ID names
const startQuizButtonID = 'start-quiz-button';
const hintButtonID = 'hint-button-';
const hintDivID = 'hint-result-';
const answerTextboxID = 'answer-';
const specSearchTextboxID = 'spec-search-';
const moreInfoButtonID = 'more-info-';
const checkAnsBtnID = 'check-answer-';
const submitBtnID = 'submit-button';

//Attribute names
const dataIndex = 'data-index';

//Array of trivia question object which contains question, answer and category.
let triviaQuestions;

init();

//Event listener for div container.
containerEl.addEventListener('click', event => {
    
    //Gets the element that is clicked.
    let targetEl = event.target;

    //If the clicked element is hint button for question, gets wikipedia search results and displays 3 results.
    if (targetEl.id.indexOf(hintButtonID) !== -1){

        //Disables the hint button so that user cannot clicl it again.
        targetEl.disabled = true;

        //Searches wikipedia and displays search results related to questions and/ or answer.
        searchWikipedia(targetEl);

    //If the clicked element is more info button, re-searches wikipedia and updated search results.
    } else if (targetEl.id.indexOf(moreInfoButtonID) !== -1){

        processSpecificSearch(targetEl);

    //If the clicked element is check answer button and
    //if the answer is correct, changes answer textbox background to gree,
    //otherwise changes the background to red.
    //Also displays correct answer if user answer is wrong.
    } else if (targetEl.id.indexOf(checkAnsBtnID) !== -1){

        //Disables the check answer button so that user cannot clicl it again.
        targetEl.disabled = true;

        processUserAnswer(targetEl);
    }
});


//Processes user answer.
function processUserAnswer(checkAnsBtnEl){

    //Gets the index of check answer button.
    //This is to determine which question's check answer button is clicked.
    let index = parseInt(checkAnsBtnEl.getAttribute(dataIndex));

    //Using the index, gets answer textbox element.
    let answerTextboxEl = document.getElementById(`${answerTextboxID}${index}`);

    //Gets user answer and removes white spaces from start and end.
    let userAnswer = answerTextboxEl.value;
    userAnswer = userAnswer.trim().toLowerCase();

    let correctAnswer = triviaQuestions[index].answer.toLowerCase();

    //Compares user answer with correct answer.
    if(userAnswer === correctAnswer){

        //Sets answer textbox background color to green, if user answer if correct.
        answerTextboxEl.style.background = 'green';
    }
    else{

        //Sets answer textbox background color to red, if user answer if correct.
        answerTextboxEl.style.background = 'red';

        //Adds a dive element to display correct answer.
        let innerQuestionDivEl = checkAnsBtnEl.parentElement;

        let answerDivEl = document.createElement('div');
        answerDivEl.textContent = `Correct Answer: ${triviaQuestions[index].answer}`;
        innerQuestionDivEl.append(answerDivEl);
    }

    //Using the index, gets specific search textbox element and disables it if found.
    let specSearchTextboxEl = document.getElementById(`${specSearchTextboxID}${index}`);
    if(specSearchTextboxEl !== null){
        specSearchTextboxEl.value = '';
        specSearchTextboxEl.disabled = true;
    }

    //Using the index, gets more info element and disables it if found.
    let moreInfoBtnEl = document.getElementById(`${moreInfoButtonID}${index}`);
    if(moreInfoBtnEl !== null){
        moreInfoBtnEl.disabled = true;
    }
}

//First, deletes current wikipedia search results.
//Then re-searches wikipedia for user specified texts.
//Displays wikipedia results with new searches.
function processSpecificSearch(moreInfoBtnEl){

    //Gets the index of more info button.
    //This is to determine which question's more info button is clicked.
    let index = parseInt(moreInfoBtnEl.getAttribute(dataIndex));

    //Using the index, gets specific search textbox element.
    let specSearchTextboxEl = document.getElementById(`${specSearchTextboxID}${index}`);

    //Gets user specified search string and removes white spaces from start and end.
    let searchString = specSearchTextboxEl.value;
    searchString = searchString.trim();

    //Exists the function if specified string is an empty string.
    if(searchString === ''){
        return;
    }

    //Using the index, gets the div element that contains wikipedia search results.
    let resultDivEl = document.getElementById(`${hintDivID}${index}`);

    //Deletes current wikipedia search results.
    deleteWikiSearch(resultDivEl);

    //Searches wikipedia for specific text and displays search results.
    displayMoreInfoSearch(resultDivEl, searchString);
}

//Searches wikipedia for specific text and displays search results.
async function displayMoreInfoSearch(resultDivEl, searchString){

    //Re-searches wikipedia for user specified texts.
    let wikiSearchResults = await getWikipediaSearchResults(searchString);
    if(wikiSearchResults.query.search.length === 0){
        return;
    }

    //Displays wikipedia results with new searches.
    displayWikiSearchResults(resultDivEl, wikiSearchResults);

}

//Deletes wikipedia search results for specified question.
function deleteWikiSearch(resultDivEl){

    //Gets all direct child div elements that contains wikipedia results and removes them if found.
    let searchResults = Array.from(resultDivEl.children);
    if(typeof(searchResults) !== 'undefined'){
        searchResults.forEach(child=>{
            child.remove();
        });
    }
}

//Searches wikipedia and gets the results and displays results.
async function searchWikipedia(hintBtnEl){

    //Gets the index of hint button.
    //This is to determine which question's hint button is clicked.
    let index = parseInt(hintBtnEl.getAttribute(dataIndex));

    //Using the index, gets the div element that contains the question elements (question, category, answer textbox and hint button).
    let containerDivEl = containerEl.children[index];

    //Gets wikipedia result for the selected question using index number and search string as question + answer.
    let searchString = `${triviaQuestions[index].question} + ${triviaQuestions[index].answer}`
    let wikiSearchResults = await getWikipediaSearchResults(searchString);

    //Checks if any search result is obtained or not.  
    if(wikiSearchResults.query.search.length === 0){

        //Re-searches wikipedia using search string as answer only.
        searchString = `${triviaQuestions[index].answer}`;
        wikiSearchResults = await getWikipediaSearchResults(searchString);
    }

    //Displays results in browser.
    displayHint(containerDivEl, wikiSearchResults, index);
}

//Displays results in browser.
function displayHint(containerDivEl, wikiSearchResults, index){
    
     //Creates a div element that will contain all searches.
     let resultDivEl = document.createElement('div');
     resultDivEl.id = `${hintDivID}${index}`;
     resultDivEl.className = 'mx-3 my-3 px-3 py-3';

     //Displays search results of wikipedia search results are obtained.
     if(wikiSearchResults.query.search.length > 0){
        displayWikiSearchResults(resultDivEl, wikiSearchResults);
     }

     //Creates a div element that contains specific search textbox and more info button.
     let specSearchEl = document.createElement('div');
     specSearchEl.className = 'mx-3 my-3 px-3 py-3';

     //Label for specific search textbox.
     let textboxLabelEl = document.createElement('label');
     textboxLabelEl.innerHTML = 'Specific Search: ';
     textboxLabelEl.className = 'title is-4';

     //Textbox for specific search.
     let specSearchTextboxEl = document.createElement('input');
     specSearchTextboxEl.type = 'text';
     specSearchTextboxEl.id = `${specSearchTextboxID}${index}`;
     specSearchTextboxEl.placeholder = 'Type key word to search';
    //  specSearchTextboxEl.style.display = 'inline';

    //Creates button element for specific wikipedia search.
    //Creates an attribute called 'data-index'.
    //This index value will be used to determine which more info button is clicked.
    let moreInfoBtnEl = document.createElement('button');
    moreInfoBtnEl.id = `${moreInfoButtonID}${index}`;
    moreInfoBtnEl.setAttribute(dataIndex, index);
    moreInfoBtnEl.innerHTML = 'More Info';
    moreInfoBtnEl.className = 'button question-button is-warning has-text-weight-bold is-size-6';

    //Adds specific search textbox and more info button.
    specSearchEl.append(textboxLabelEl, specSearchTextboxEl, moreInfoBtnEl);

    //Adds search result div element to container div.
    containerDivEl.append(resultDivEl, specSearchEl);
}

function displayWikiSearchResults(resultDivEl, wikiSearchResults){
    //If total searches from wikipedia is less than 3, sets the length as search length.
    if (wikiSearchResults.query.search.length < wikipediaResultNumber){
        wikipediaResultNumber = wikiSearchResults.query.search.length;
    }

    //Loop through wikipedia searches.
    for (let i = 0; i < wikipediaResultNumber; i++) {

        //Gets the seach data.
        let searchResult = wikiSearchResults.query.search[i];

        //Creates a div element that will contains wikipedia seach title and snippet.
        let innerResultDivEl = document.createElement('div');
        innerResultDivEl.className = 'block';

        //Creates question as h2 element to display wikipedia search title.
        let titleEl = document.createElement('h3');
        titleEl.textContent = searchResult.title;
        titleEl.className = 'title is-4 has-text-grey-darker';

        //Creates a paragraph element to display wikipedia snippet.
        //First gets the parapgrapg inner HTML as search snippet and then
        //Resets it using paragraph textcontent.
        //This is to remove all HTML tags contained in search snippet received from wikipedia.
        let paraEl = document.createElement('p');
        paraEl.innerHTML = searchResult.snippet;
        paraEl.innerHTML = `${paraEl.textContent}...`;
        paraEl.className = 'subtitle is-5';
        
        //Adds title and snippet to inner div elememnt.
        innerResultDivEl.append(titleEl, paraEl);

        //Adds the inner div element to seach result div element.
        resultDivEl.append(innerResultDivEl);
    }
}

//Gets wikipedia result for the selected question.
//Search result is obtained using question and asnwer both.
//Returns the search result as an object which contains an object called 'query'.
//'query' object contains array of all search results from wikipedia.
async function getWikipediaSearchResults(searchString){

    let params = {
        action: "query",
        list: "search",
        srsearch: searchString,
        format: "json"
    };

    let requestURL = `${wikipediaQueryURL}?origin=*`;

    Object.keys(params).forEach(function(key){requestURL += "&" + key + "=" + params[key];});

    const response = await fetch(requestURL);

    return response.json();
}

//Initial function when the page is loaded.
async function init(){

    let allQuestions = [];

    //Gets list of categories selected by the user.
    let category = ['language','sciencenature','fooddrink'];

    //Loops thorugh the selected categories to get 10 questions for each category.
    for (let i = 0; i < category.length; i++) {

        //Gets the list of questions from ninja trivia for the specified category.
        let categoryQuestions = await getTriviaQuestions(category[i]);
        if(typeof(categoryQuestions) === 'undefined'){
            return;
        }

        //Adds category quetions to the final list.
        categoryQuestions.forEach(question => {
            allQuestions.push(question);
        });           
    }

    //Gets list of 10 questions randomly from all questions list.
    triviaQuestions = getQuizList(allQuestions);
    
    //Processes trivia questions.
    processTriviaQuestions();
}

//Processes trivia questions.
function processTriviaQuestions(){
    
    //Loops through all trivial questions one by one and dispaly them in browser.
    for (let i = 0; i < triviaQuestions.length; i++) {
        displayTriviaQuestion(triviaQuestions[i], i)
    }

    //Creates a div a submit button.
    let buttonDivEl = document.createElement('div');

    //Creates a submit button with id and class.
    let submitButtonEl = document.createElement('button');
    submitButtonEl.innerHTML = 'Submit';
    submitButtonEl.id = submitBtnID;
    submitButtonEl.class = '';
    buttonDivEl.append(submitButtonEl);

    containerEl.append(buttonDivEl);
}

//Displays the question in browser using container.
function displayTriviaQuestion(triviaQuestion, index){

    const category = `Category: ${triviaQuestion.category}`;
    const question = `${index + 1}. ${triviaQuestion.question}`;

    //Creates a div that will contain question and wikipedia search results.
    let questionDivEl = document.createElement('div');
    questionDivEl.className = 'column is-12-mobile is-12-tablet is-12-desktop is-12-widescreen is-12-fullhd has-background-info my-3';

    //Creates a div for each question that will contain question, category, answer textbox and hint button.
    let innerQuestionDivEl = document.createElement('div');
    innerQuestionDivEl.className = 'mx-3 my-3 px-3 py-3';
    
    //Creates question as h2 element.
    let questionEl = document.createElement('h2');
    questionEl.textContent = question;
    questionEl.className = 'title is-3 has-text-grey-darker';

    //Creates a div for answer textbox and label.
    let categoryEl = document.createElement('div');
    categoryEl.textContent = category;
    categoryEl.className = 'subtitle is-4 has-text-warning has-text-weight-bold';

    //Label for answer textbox.
    let textboxLabelEl = document.createElement('label');
    textboxLabelEl.setAttribute('for', `${answerTextboxID}${index}`);

    //Textbox for answer.
    let answerTextboxEl = document.createElement('input');
    answerTextboxEl.type = 'text';
    answerTextboxEl.id = `${answerTextboxID}${index}`;
    answerTextboxEl.placeholder = 'Type your answer here';

    //Hint button to dispaly wikipedia search results.
    //Creates an attribute called 'data-index'.
    //This index value will be used to determine which question hint button is clicked.
    let hintBtnEl = document.createElement('button');
    hintBtnEl.id = `${hintButtonID}${index}`;
    hintBtnEl.setAttribute(dataIndex, index);
    hintBtnEl.innerHTML = 'Hint';
    hintBtnEl.className = 'button question-button is-warning has-text-weight-bold is-size-6';

    //Creates a button where user can check the answer of specific question.
    let checkAnsBtnEl = document.createElement('button');
    checkAnsBtnEl.id = `${checkAnsBtnID}${index}`;
    checkAnsBtnEl.setAttribute(dataIndex, index);
    checkAnsBtnEl.innerHTML = 'Check';
    checkAnsBtnEl.className = 'button question-button is-success has-text-weight-bold is-size-6';

    //Adds question elements to inner div.
    innerQuestionDivEl.append(questionEl, categoryEl, textboxLabelEl, answerTextboxEl, hintBtnEl, checkAnsBtnEl);

    //Adds inner div to outer div.
    questionDivEl.append(innerQuestionDivEl);

    //Adds outer div to main container div.
    containerEl.append(questionDivEl);
}

//Gets list of 10 questions randomly from all questions list.
function getQuizList(allQuestions){
    
    let quizList = [];

    do{
        
        //Randomly gets the question from all questions array.
        let randomQuiz = allQuestions[Math.floor(Math.random() * allQuestions.length)];
        
        //Tries to find randomly generated question from question list.
        let existingQuestion = quizList.find(extQuiz => extQuiz.question === randomQuiz.question);

        //Checks whether current question is already added to the list or not. Only adds unique questions.
        if(typeof(existingQuestion) === 'undefined'){
            quizList.push(randomQuiz);
        }

    }while(quizList.length < totalQuestionNumber)

    return quizList;
}

//Gets the list of questions from ninja trivia.
async function getTriviaQuestions(category){

    let requestURL = `${triviaQueryURL}?category=${category}&limit=${totalQuestionNumber}`;

    const options = {
        method: 'GET',
        headers: { 'X-Api-Key': ninjaAPIKey},
    };

    const response = await fetch(requestURL, options);

    return response.json();
}


