const app = {};

app.apiURL = "https://opentdb.com/api.php";
app.sessionTokenUrl = "https://opentdb.com/api_token.php?command=request"; //API token URL (Necessary to avoid repeating questions in a session)

//audio files

app.mainThemeAudio = new Audio("../assets/sounds/main-theme.mp3");
app.letsPlayAudio = new Audio("../assets/sounds/lets-play.mp3");
app.correctAnswerAudio = new Audio("../assets/sounds/correct-answer.mp3");
app.wrongAnswerAudio = new Audio("../assets/sounds/wrong-answer.mp3");

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
  */  //stop timer whenever an option is selected
      clearInterval(app.timer);
      //get user selection
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
  const header = document.querySelector("header");
  app.toggleScreen(header);
  const enterBtn = document.getElementById("enter-btn");
  enterBtn.addEventListener(
    "click",
    () => {
      app.mainThemeAudio.play();
      app.toggleScreen(header);
      //Call next screen
      app.rulesScreen();
    },
    { once: true }
  );
}; //show start screen method

//Show rules screen

app.rulesScreen = () => {
  const rulesSection = document.querySelector(".rules-screen");
  app.toggleScreen(rulesSection);
  const form = document.querySelector(".rules-screen form");
  form.reset();
  form.addEventListener(
    "submit",
    (e) => {
      e.preventDefault();
      app.mainThemeAudio.load();//stop/restart audio
      app.initializeGame();
      app.playerName = document.getElementById("player-name").value;
      app.toggleScreen(rulesSection);
      // Call next screen
      app.gameBoardScreen();
      app.loadQuestion("Lets play!", app.letsPlayAudio);
    },
    { once: true }
  );
}; //show rules screen method

//Initialize game 

app.initializeGame = () => {
  app.playerPrize = "";
  app.currentQuestionNumber = 14;
  app.difficultyLevel = "easy";
}

//Show gameboard screen

app.gameBoardScreen = () => {
  app.gameBoardSection = document.querySelector(".game-board-screen");
  app.toggleScreen(app.gameBoardSection);
  const playerNameDisplay = document.querySelector(".player-name");
  playerNameDisplay.textContent = app.playerName;
}; //show game board screen method

//Load questions method

app.loadQuestion = (message, audio) => {
  //hide game board temporaily
  app.toggleScreen(app.gameBoardSection);
  //start loader screen
  const loaderScreen = document.querySelector(".loader-screen");
  app.toggleScreen(loaderScreen);
  //display message inside loader screen
  const loaderMessage = document.querySelector(".loader-message");
  loaderMessage.textContent = message;
  //play corresponding audio
  audio.play();
  const url = new URL(app.apiURL);
  url.search = new URLSearchParams({
    token: app.token,
    amount: 1,
    type: "multiple",
    difficulty: app.difficultyLevel,
  });
  // Use the fetch API to make a request to the open trivia API endpoint
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
      //print information on the bboard and hide loader when audio has finished
      audio.onended = () => {
        //Call a method to print information on the board
        app.printGameBoardInfo();
        //Show game board
        app.toggleScreen(app.gameBoardSection);
        //Hide loader
        app.toggleScreen(loaderScreen);
      }
    });
}; //load questions method

//break down info method

app.breakDownInfo = (questionInfo) => {
  app.currentQuestion = questionInfo.question;
  app.correctAnswer = questionInfo.correct_answer;
  const wrongAnswers = questionInfo.incorrect_answers; // the Api gives us 3 wrong answers
  wrongAnswers.push(app.correctAnswer); // make an array with all posible answers
  app.answerOptions = app.shuffleAnswers(wrongAnswers); // shuffle the array and store it
}; //break down info method

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
}; //Shuffle array method

//print board method

app.printGameBoardInfo = () => {
  //print current prize method:
  app.currentPrize();
  //start timer
  app.timerDisplay = document.querySelector(".timer");
  if (app.currentQuestionNumber >= 10) {
    app.setTimer(15);//first 5 question
  } else if (app.currentQuestionNumber >= 5) {
    app.difficultyLevel = "medium";
    app.setTimer(30);//question 6 - 10
  } else {
    app.difficultyLevel = "hard";
    app.setTimer(45);//questions 11 -15
  }
  //print the question that we have obtained from The API
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
    //check timing
    if (timer === 0) {
      app.showResults("You've failed. Please try again");
    }
  }, 1000);
}; //timer method

//print current prize method:

app.currentPrize = () => {
  //get a list of all prizes
  const prizes = document.querySelectorAll(".prize-list li");
  //remove the class "active-prize" from all Li's inside the prize list container
  prizes.forEach(element => {
    element.classList.remove("active-prize");
  });
  //Add the class .active-prize to the current li[index](style accordingly)
  app.activePrize = prizes[app.currentQuestionNumber];
  //print the current prize element
  app.activePrize.classList.add("active-prize");
  console.log(app.correctAnswer);
}// Current prize method



//check answers method

app.checkAnswerResults = () => {
  // check if answer is R/W
  if (app.optionSelected === app.correctAnswer) {
    //check if we are working on the last question
    if (app.currentQuestionNumber === 0) {
      app.showResults("Congratulations you're now a millionaire!!!");
      //check if current question is 5 or 10 (money threshold)
    } else if (app.currentQuestionNumber === 5 || app.currentQuestionNumber === 10) {
      //add that prize to the user's prize variable, play a special sound and screen(pending)
      app.playerPrize = app.activePrize.textContent;
      app.currentQuestionNumber -= 1; //go for next question
      app.loadQuestion(`Congratulations, you've just won ${app.playerPrize}`,);
    } else {
      //play a sound of correct answer (pending)
      app.currentQuestionNumber -= 1; //go for next question
      app.loadQuestion("You are correct", app.correctAnswerAudio);
    }
  } else {
    //play a sound of wrong answer (pending)
    let message = "";
    if (app.playerPrize != "") {
      message = `You are going home with ${app.playerPrize}`;
    } else {
      message = "Please try again!"
    }
    app.showResults(message);
  }
};//Check answer result method


app.showResults = (message, sound) => {
  //Stop timer when game is over
  clearInterval(app.timer);
  //hide game board
  app.toggleScreen(app.gameBoardSection)
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
  playAgainBtn.setAttribute("id", "play-again-btn")
  playAgainBtn.textContent = "Play Again?";

  const restartBtn = document.createElement("button");
  restartBtn.textContent = "Restart";

  /* Put buttons inside container */
  buttonsContainer.append(restartBtn, playAgainBtn);

  //  start a button listener for both
  const buttons = document.querySelectorAll(".buttons-container button");

  buttons.forEach(button => {
    button.addEventListener("click", function () {
      if (this.id === "play-again-btn") {
        app.initializeGame();
        app.gameBoardScreen();
        app.loadQuestion("Lets play again!", app.letsPlayAudio);
      } else {
        //"restart" button
        app.startScreen();//call start screen
      }
      app.toggleScreen(modalScreen);//Hide modal screen
    })
  });
}//Show results method

//App Init
app.init = () => {
  app.startScreen();
  app.getToken();
  app.optionListeners();
};

app.init();