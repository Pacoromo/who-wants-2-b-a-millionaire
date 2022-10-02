const app = {};

//*************************************************/
//******************Functions*********************//
//*************************************************/

app.toggleScreen = (element) => {
  element.classList.toggle("non-visible");
};

//Show start screen

/*
A landing page with the app heading "Who wants to be a millionaire"

A backrounbd related to the TV Show
    -An Enter button
*/

app.startScreen = () => {
  const header = document.querySelector("header");
  const enterBtn = document.getElementById("enter-btn");
  app.toggleScreen(header);
  enterBtn.addEventListener(
    "click",
    () => {
      app.toggleScreen(header);
      //Call next screen
      app.rulesScreen();
    },
    { once: true }
  );
};

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
      app.toggleScreen(rulesSection);
      //Call next screen
      app.gameBoardScreen();
    },
    { once: true }
  );
};

//Show gameboard screen

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
    -increase the score
    -Check if user won
    If user won: show the results screen
-if answer was wrong
    -Show the results screen */

app.gameBoardScreen = () => {
  const gameBoardsection = document.querySelector(".game-board-screen");
  const playerNameDisplay = document.querySelector(".player-name");
  playerNameDisplay.textContent = app.playerName;
  app.toggleScreen(gameBoardsection);
};

//App Init
app.init = () => {
  app.startScreen();
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
        -increase the score
        -Check if user won
        If user won: show the results screen
    -if answer was wrong
        -Show the results screen */
