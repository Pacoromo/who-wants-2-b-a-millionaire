const app = {};

app.apiURL = "https://opentdb.com/api.php";
app.sessionTokenUrl = "https://opentdb.com/api_token.php?command=request"; //API token URL (Necessary to avoid repeating questions in a session)

//*************************************************/
//******************Functions*********************//
//*************************************************/

// Get API token  (required by API to avoid repeating questions)

app.getToken = () => {
  fetch(app.sessionTokenUrl)
    .then((response) => response.json())
    .then((jsonResponse) => {
      app.token = jsonResponse.token;
    });
};

//options listeners 

app.optionListeners = () => {
  const buttons = document.querySelectorAll(".option-btn");

  buttons.forEach((button, index) => {
    button.addEventListener("click", function () {
      /* pending
  -play a background sound
  */  //stop timer
      clearInterval(app.timer);
      //get user answer
      app.optionSelected = app.answerOptions[index];
      //check answer
      app.checkAnswerResults();
      // }

    });
  });
}



//Screen display toggle

app.toggleScreen = (element) => {
  element.classList.toggle("non-visible");
};

//Show start screen

app.startScreen = () => {
  const enterBtn = document.getElementById("enter-btn");
  enterBtn.addEventListener(
    "click",
    () => {
      const header = document.querySelector("header");
      app.toggleScreen(header);
      //Call next screen
      app.rulesScreen();
    },
    { once: true }
  );
}; //show start

//Show rules screen
/*  
A second page:
    -Game rules description
    -Ask for the player's name with a text input
    -A start button*/

app.rulesScreen = () => {
  const rulesSection = document.querySelector(".rules-screen");
  const form = document.querySelector(".rules-screen form");
  app.toggleScreen(rulesSection);
  form.reset();
  form.addEventListener(
    "submit",
    (e) => {
      e.preventDefault();
      app.playerName = document.getElementById("player-name").value; //namespace scope
      app.currentQuestionNumber = 14; //initialize game
      app.difficultyLevel = "easy";
      app.toggleScreen(rulesSection);
      //Call next screen
      app.gameBoardScreen();
    },
    { once: true }
  );
}; //show rules

//Show gameboard screen

/*
A third page with the game's board
-a section showing the current question and player's name
-a section with 4 buttons with every option
-a score section hightlighting the current price pool
*/
app.gameBoardScreen = () => {
  const gameBoardsection = document.querySelector(".game-board-screen");
  const playerNameDisplay = document.querySelector(".player-name");
  playerNameDisplay.textContent = app.playerName;
  app.toggleScreen(gameBoardsection);
  app.loadQuestion();
}; //show game board

//Load questions method

app.loadQuestion = () => {
  //requests information from the API
  //use the URL constructor to specify the parameters we wish to include in our API endpoint (AKA in the request we are making to the API)
  const url = new URL(app.apiURL);
  url.search = new URLSearchParams({
    // pass in our seession token as a parameter
    token: app.token,
    amount: 1,
    type: "multiple",
    difficulty: app.difficultyLevel,
  });
  // Use the fetch API to make a request to the open trivia API endpoint
  // pass in new URL featuring params provided by the URLSearchParams constructor
  fetch(url)
    .then((response) => response.json())
    .then((jsonResponse) => {
      /* The response is an object with the next structure 
      {
        response_code; number,
        results: [{
          0: {
            category: string,
            correct_answer: string,
            difficulty: string,
            incorrect_answers: [string, string, string], (note: the API returns answers in HTML format)
            question: string,
            type: multiple
          }
        }]
      }
      We are interested in the jsonResponse.results[0] object.
      */
      //Call a method to break down information from the response object\
      app.breakDownInfo(jsonResponse.results[0]);
      // console.log(jsonResponse.results[0]);
      //Call a method to print information on the board
      app.printGameBoardInfo();
    });
}; //load questions

//break down info method

app.breakDownInfo = (questionInfo) => {
  app.currentQuestion = questionInfo.question;
  app.correctAnswer = questionInfo.correct_answer;
  // console.log(app.correctAnswer);
  const wrongAnswers = questionInfo.incorrect_answers; // the Api gives us 3 wrong answers
  wrongAnswers.push(app.correctAnswer); // make an array with all posible answers
  app.answerOptions = app.shuffleAnswers(wrongAnswers); // shuffle the array and store it
  // console.log(app.answerOptions);
}; //break down info

//Shuffle answers method https://bost.ocks.org/mike/shuffle/

app.shuffleAnswers = (array) => {
  let m = array.length,
    t,
    i;
  // While there remain elements to shuffle…
  while (m) {
    // Pick a remaining element…
    i = Math.floor(Math.random() * m--);
    // And swap it with the current element.
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }
  return array;
}; //Shuffle array

//print board method

app.printGameBoardInfo = () => {
  /* pending
  -play a background sound
  */
  //print current prize method:
  app.currentPrize();
  //start a timer for the first 5 questions
  app.timerDisplay = document.querySelector(".timer");
  if (app.currentQuestionNumber >= 10) {
    app.setTimer(15);
  } else if (app.currentQuestionNumber >= 5) {
    app.difficultyLevel = "medium";
    app.setTimer(30);
  } else {
    app.difficultyLevel = "hard";
    app.setTimer(45);
  }
  console.log(app.difficultyLevel);
  //-print the question that we have obtained from The API
  const question = document.querySelector(".question");
  question.innerHTML = app.currentQuestion;
  const buttons = document.querySelectorAll(".option-btn");

  /* pending
  -check if user wants to walk away
*/

  // check user selection
  app.answerOptions.forEach((answerOption, index) => {
    //-print the 4 possible answers as buttons
    buttons[index].innerHTML = answerOption;
  });
}; //print board method

//Timer method

app.setTimer = (seconds) => {
  let timer = seconds;
  app.timerDisplay.textContent = timer; //display value

  //start counting
  app.timer = setInterval(function () {
    timer -= 1; //Every Second
    app.timerDisplay.textContent = timer;
    //4check timing
    if (timer === 0) {
      // showResults(message); Pending
      document.querySelector("body").style.border = "2px solid green";
    }
  }, 1000);
}; //timer method



app.currentPrize = () => {
  //print current prize method:
  //get a list of all prizes
  const prizes = document.querySelectorAll(".prize-list li");
  //remove the class "active-prize" from all Li's inside the prize list container
  prizes.forEach(element => {
    element.classList.remove("active-prize");
  });

  //Add the class .active-prize to the current li[index](style accordingly)
  const currentPrizeLi = prizes[app.currentQuestionNumber];
  //print the current prize element method
  currentPrizeLi.classList.add("active-prize");

  //Add prize amount to player's score
  app.playerPrize = currentPrizeLi.textContent;
  console.log(app.correctAnswer);

  // if current question is 5 or 10    
  //optional sound effect(Pending)

  if (app.currentQuestionNumber === 6 || app.currentQuestionNumber === 10) {
    //add that prize to the user's prize variable
    app.playerPrize = currentPrizeLi.textContent;
  }

  //then check if we are at question < 0
  // showResults(congratulations you 've won a million dollars); with $1,000,000 Pending

}// Current prize method



//check answers method

app.checkAnswerResults = () => {
  /* check if answer is R/W

      if correct:
        play a sound of correct answer
        we call for next question app.loadQuestion();
      
      if wrong:
        showResults(sorry you go home with no money); Pending// print a message with the earned amount

    */


  if (app.optionSelected === app.correctAnswer) {
    if (app.currentQuestionNumber === 0) {
      //showResults(message); Pending
      document.querySelector("body").style.border = "2px solid green";
    } else {
      app.currentQuestionNumber -= 1; // every question loaded
      // console.log("Answer is correct");
      app.loadQuestion();
    }

  } else {
    app.showResults("Congratulations, You've become a millionaire!!!");
    document.querySelector("body").style.border = "2px solid green";
  }
};


app.showResults = (message) => {

  //show modal screen
  const modalScreen = document.querySelector(".modal-screen");
  app.toggleScreen(modalScreen);
  //print message
  const modalMessage = document.querySelector(".message");
  modalMessage.innerHTML = "";
  modalMessage.textContent = message;
  const buttonsContainer = document.querySelector(".buttons-container");
  buttonsContainer.innerHTML = "";
  /*create 2 buttons */
  const playAgainBtn = document.createElement("button");
  playAgainBtn.textContent = "Play Again?";
  playAgainBtn.setAttribute("id", "play-again-btn")
  const restartBtn = document.createElement("button");
  restartBtn.setAttribute("id", "restart-btn")
  restartBtn.textContent = "Restart";

  //  start a button listener for both
  const buttons = document.querySelectorAll(".buttons-container button");

  buttons.forEach(button => {
    button.addEventListener("click", function () {

        if (this.id === "play-agin-btn"){
         // button "play again?"" (same player)
         // initialize game
          app.currentQuestion = 14;
          app.difficultyLevel = "easy;"
          app.printGameBoardInfo();
        }else {
          //button "restart"   (new player)
          app.startScreen();
        }
    })
  });
}











//App Init
app.init = () => {
  app.startScreen();
  app.getToken();
  app.optionListeners();
};

app.init();

/*


 A third page with the game's board
    -a section showing the current question
    -a section with 4 buttons with every option
    -a score section hightlighting the current price pool

-print the question that we have obtained from The API
-print the 4 possible answers as buttons
-start listening for the user answer
-start the timer
-play a background sound

-check if user wants to walk away
    if yes: check the next lowest threshold
    print the results

-make a function to compare selection
-play a sound when user makes a selection
-if no selection is made and the timer runs out the -answer is considered as wrong
-play a sound when answer is wrong or timer runs out
-play a sound when answer is right

    -If answer was right:
        -Check if user won
        If user won: show the results screen
    -if answer was wrong
        -Show the results screen */
