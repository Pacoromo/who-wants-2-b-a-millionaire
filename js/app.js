const app = {};

app.apiURL = "https://opentdb.com/api.php";
app.sessionTokenUrl = "https://opentdb.com/api_token.php?command=request"; //API token URL (Necessary to avoid repeating questions in a session)

//audio files

app.explainTheRulesAudio = new Audio("../assets/sounds/explain-the-rules.mp3");
app.letsPlayAudio = new Audio("../assets/sounds/lets-play.mp3");
app.correctAnswerAudio = new Audio("../assets/sounds/correct-answer.mp3");
app.wrongAnswerAudio = new Audio("../assets/sounds/wrong-answer.mp3");
app.timeIsUpAudio = new Audio("../assets/sounds/time-is-up.mp3")
app.thresholdAudio = new Audio("../assets/sounds/amount-win.mp3");
app.applauseAudio = new Audio("../assets/sounds/applause.mp3");
app.win1MilAudio = new Audio("../assets/sounds/1000000-win.mp3");
app.question14to9Audio = new Audio("../assets/sounds/100-1000-music.mp3");
app.question9to5Audio = new Audio("../assets/sounds/2000-32000-music.mp3");
app.question4Audio = new Audio("../assets/sounds/64000-music.mp3");
app.question3and2Audio = new Audio("../assets/sounds/125000-250000-music.mp3");
app.question1Audio = new Audio("../assets/sounds/500000-music.mp3");
app.question0Audio = new Audio("../assets/sounds/1000000-music.mp3");

//Array of all the audios that have to be stopped after answering a question
app.allQuestionsAudio = [
  app.question14to9Audio,
  app.question9to5Audio,
  app.question4Audio,
  app.question3and2Audio,
  app.question1Audio,
  app.question0Audio
];

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
      //stop timer whenever an option is selected
      clearInterval(app.timer);
      //get user selection
      app.optionSelected = app.answerOptions[index];
      //check answer
      app.checkAnswerResults();
    });
  });
};

//Player Life lines options

app.playerLifelinesListeners = () => {
  const buttons = document.querySelectorAll(".player-options button");

  buttons.forEach(button => {
    button.addEventListener("click", function () {
      clearInterval(app.timer);
      app.lifeLineSelected = this.id
      app.checkLifeLineSelected();
    })
  });
};// player life lines


//Check Life Line Selected Method  (first Strecht goal)

app.checkLifeLineSelected = () => {
  if (app.lifeLineSelected === "walk-away") {
    app.showResults(`You are leaving with: ${app.lastAmount.innerText}`, app.applauseAudio);
  }//2 more stretch goals after this
};

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
      app.explainTheRulesAudio.play();
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
      app.explainTheRulesAudio.load(); //stop and reload audio when leaving page
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
  app.walkAwayBtn = document.getElementById("walk-away");
  app.walkAwayBtn.classList.add("non-visible");
};

//Show gameboard screen

app.gameBoardScreen = () => {
  app.gameBoardSection = document.querySelector(".game-board-screen");
  app.toggleScreen(app.gameBoardSection);
  const playerNameDisplay = document.querySelector(".player-name");
  playerNameDisplay.textContent = app.playerName;
}; //show game board screen method

//Load questions method

app.loadQuestion = (message, audio) => {
  app.toggleScreen(app.gameBoardSection); //hide game board temporaily
  const loaderScreen = document.querySelector(".loader-screen"); //show loader screen
  app.toggleScreen(loaderScreen);
  const loaderMessage = document.querySelector(".loader-message"); //display message inside loader screen
  loaderMessage.innerHTML = message;
  loaderMessage.classList.add("text-animation");
  app.stopQuestionsBackgroundAudio(); //stop any question audio background playing at the moment
  audio.play(); //play corresponding audio

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
      //print information on the board and hide loader when audio has finished playing
      audio.onended = () => {
        //Call a method to print information on the board
        app.printGameBoardInfo();
        //Show game board after the board has been populated
        app.toggleScreen(app.gameBoardSection);
        //Hide loader screen
        loaderMessage.classList.remove("text-animation");
        app.toggleScreen(loaderScreen);
        // Play audio according to question number
        app.playQuestionsAudio();
      };
    });
}; //load questions method

//Stop Questions audio method

app.stopQuestionsBackgroundAudio = () => {
  app.allQuestionsAudio.forEach((audioFile) => {
    audioFile.load();
  });
}; // Stop Audio Method

//Play Questions Audio accordingly

app.playQuestionsAudio = () => {
  if (app.currentQuestionNumber >= 10) {
    app.question14to9Audio.play();
  } else if (app.currentQuestionNumber >= 5) {
    app.question9to5Audio.play();
  } else if (app.currentQuestionNumber === 4) {
    app.question4Audio.play();
  } else if (
    app.currentQuestionNumber === 3 ||
    app.currentQuestionNumber === 2
  ) {
    app.question3and2Audio.play();
  } else if (app.currentQuestionNumber === 1) {
    app.question1Audio.play();
  } else {
    app.question0Audio.play();
  }
}; //Play Questions Audio

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
    app.setTimer(15); //first 5 question
  } else if (app.currentQuestionNumber >= 5) {
    app.difficultyLevel = "medium";
    app.setTimer(30); //question 6 - 10
  } else {
    app.difficultyLevel = "hard";
    app.setTimer(45); //questions 11 -15
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
      app.showResults(`Your time's up!<br>Please try again:`, app.timeIsUpAudio);
    }
  }, 1000);
}; //timer method

//print current prize method:

app.currentPrize = () => {
  //get a list of all prizes
  const prizes = document.querySelectorAll(".prize-list li");
  //remove the class "active-prize" from all Li's inside the prize list container
  prizes.forEach((element) => {
    element.classList.remove("active-prize");
  });
  //Add the class .active-prize to the current li[index](style accordingly)
  app.activePrize = prizes[app.currentQuestionNumber];
  //Create a variable for the amount already earned
  app.lastAmount = prizes[app.currentQuestionNumber + 1]
  //print the current prize element
  app.activePrize.classList.add("active-prize");
  console.log(app.correctAnswer);//Just for revision...It get's Really hard!
}; // Current prize method

//check answers method

app.checkAnswerResults = () => {
  //print walk away button after first question
  if (app.currentQuestionNumber === 14) {
    app.walkAwayBtn.classList.remove("non-visible");
  }
  // check if answer is R/W
  if (app.optionSelected === app.correctAnswer) {
    //check if we are working on the last question
    if (app.currentQuestionNumber === 0) {
      app.showResults(`Congratulations!<br>You're now a millionaire!`, app.win1MilAudio);
      //check if current question is 5 or 10 (money threshold)
    } else if (
      app.currentQuestionNumber === 5 ||
      app.currentQuestionNumber === 10
    ) {
      //add that prize to the user's prize variable
      app.playerPrize = app.activePrize.textContent;
      app.currentQuestionNumber -= 1; //go for next question
      app.loadQuestion(`Congratulations!<br>You've just won:<br>${app.playerPrize}`, app.thresholdAudio);
    } else {
      app.currentQuestionNumber -= 1; //go for next question
      app.loadQuestion("You are correct!", app.correctAnswerAudio);
    }
  } else {
    let audio,
      message = "";
    if (app.playerPrize != "") {
      message = `You are going home with: ${app.playerPrize}`;
      audio = app.thresholdAudio;
    } else {
      message = "Please try again!";
      audio = app.wrongAnswerAudio;
    }
    app.showResults(message, audio);
  }
}; //Check answer result method

app.showResults = (message, sound) => {
  //Stop timer when game is over
  clearInterval(app.timer);
  //stop sounds from questions board
  app.stopQuestionsBackgroundAudio();
  //hide game board
  app.toggleScreen(app.gameBoardSection);
  //play corresponding sound
  sound.play();
  //show modal screen
  const modalScreen = document.querySelector(".modal-screen");
  app.toggleScreen(modalScreen);
  //print message
  const modalMessage = document.querySelector(".message");
  modalMessage.innerHTML = "";
  modalMessage.innerHTML = message;
  const buttonsContainer = document.querySelector(".buttons-container");
  buttonsContainer.classList.add("non-visible");
  buttonsContainer.innerHTML = "";
  /*create 2 buttons */
  const playAgainBtn = document.createElement("button");
  playAgainBtn.setAttribute("id", "play-again-btn");
  playAgainBtn.textContent = "Play Again?";

  const restartBtn = document.createElement("button");
  restartBtn.textContent = "Restart";

  /* Put buttons inside container */
  buttonsContainer.append(restartBtn, playAgainBtn);

  //  start a button listener for both
  const buttons = document.querySelectorAll(".buttons-container button");
  buttons.forEach((button) => {
    button.addEventListener("click", function () {
      if (this.id === "play-again-btn") {
        app.initializeGame();
        app.gameBoardScreen();
        app.loadQuestion("Lets play again!", app.letsPlayAudio);
      } else {
        //"restart" button
        app.startScreen(); //call start screen
      }
      app.toggleScreen(modalScreen); //Hide modal screen
    });
  });
  sound.onended = () => {
    buttonsContainer.classList.remove("non-visible"); //** Check transition timing in css  (Pending)*//
  };
}; //Show results method

//App Init
app.init = () => {
  app.getToken();
  app.startScreen();
  app.optionListeners();
  app.playerLifelinesListeners();
};

app.init();