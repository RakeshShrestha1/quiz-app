// Selecting elements from the DOM
const startBtn = document.getElementById('start-btn');
const easyBtn = document.getElementById('easy-btn');
const mediumBtn = document.getElementById('medium-btn');
const hardBtn = document.getElementById('hard-btn');
const questionContainer = document.getElementById('question');
const answersContainer = document.getElementById('answers');
const resultMessage = document.getElementById('result-message');
const resultBtn = document.getElementById('result-btn');
const nextBtn = document.getElementById('next-btn');
const loadingIndicator = document.getElementById('loading-indicator');
const timerDisplay = document.getElementById('timer-display');

// Global variables
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let timerInterval;
let currentDifficulty;

// Event listeners
startBtn.addEventListener('click', () => {
  hideScreen('start-screen');
  showScreen('difficulty-screen');
});

easyBtn.addEventListener('click', () => startGame('easy'));
mediumBtn.addEventListener('click', () => startGame('medium'));
hardBtn.addEventListener('click', () => startGame('hard'));

// Function to start the game
function startGame(difficulty) {
  currentDifficulty = difficulty; // Set current difficulty
  
  // Reset the timer display
  timerDisplay.textContent = '';
  
  // Reset the timer interval if it's already running
  clearInterval(timerInterval);
  
  // Show loading indicator
  loadingIndicator.classList.remove('hidden');

  fetchQuestions(difficulty)
    .then(data => {
      questions = data.results;
      currentQuestionIndex = 0; // Reset current question index
      score = 0; // Reset score
      hideScreen('difficulty-screen');
      showScreen('question-screen');
      showNextQuestion(); // Call showNextQuestion after questions are fetched

      // Determine starting time based on difficulty level and start the timer
      let startingTime;
      switch (currentDifficulty) {
        case 'easy':
          startingTime = 15; // Set starting time to 15 seconds for easy difficulty
          break;
        case 'medium':
          startingTime = 10; // Set starting time to 10 seconds for medium difficulty
          break;
        case 'hard':
          startingTime = 5; // Set starting time to 5 seconds for hard difficulty
          break;
        default:
          startingTime = 10; // Default starting time to 10 seconds if difficulty is not recognized
          break;
      }
      
      startTimer(startingTime); // Start the timer with the determined starting time

      // Hide loading indicator after questions are fetched
      loadingIndicator.classList.add('hidden');
    })
    .catch(error => {
      console.error('Error starting game:', error);
      // Hide loading indicator if an error occurs during fetching
      loadingIndicator.classList.add('hidden');
    });
}

// Function to fetch questions from the API
function fetchQuestions(difficulty) {
  const url = `https://opentdb.com/api.php?amount=10&difficulty=${difficulty}&type=multiple`;
  return fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .catch(error => {
      console.error('Error fetching questions:', error);
      throw error;
    });
}

// Function to display the next question
function showNextQuestion() {
  const question = questions[currentQuestionIndex];
  const questionNumber = currentQuestionIndex + 1; // Question number
  questionContainer.textContent = `Question ${questionNumber}: ${question.question}`;
  const answers = [question.correct_answer, ...question.incorrect_answers];

  // Shuffle the answers array
  for (let i = answers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [answers[i], answers[j]] = [answers[j], answers[i]];
  }

  answersContainer.innerHTML = '';
  answers.forEach(answer => {
    const button = document.createElement('button');
    button.textContent = answer;
    button.addEventListener('click', () => checkAnswer(button, answer === question.correct_answer));
    answersContainer.appendChild(button);
  });
}

// Function to start the timer
function startTimer(time) {
  let timeLeft = time; // Set timer to the specified time for the current question

  timerDisplay.textContent = timeLeft; // Reset timer display
  timerInterval = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = timeLeft; // Update timer display
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      checkAnswer(null, false); // Automatically check answer as incorrect when time runs out
    }
  }, 1000);
}

// Function to check the selected answer
function checkAnswer(button, isCorrect) {
  // Stop the timer
  clearInterval(timerInterval);

  if (button && isCorrect) {
    score++;
    resultMessage.textContent = 'Correct!';
    resultMessage.classList.add('correct');
    button.classList.add('correct-background');
  } else {
    resultMessage.textContent = button ? 'Incorrect!' : 'Time\'s up!';
    resultMessage.classList.add('incorrect');
    if (button) {
      button.classList.add('incorrect-background');
    }
  }
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    setTimeout(() => {
      resultMessage.textContent = '';
      resultMessage.classList.remove('correct', 'incorrect');
      showNextQuestion();
      // Determine starting time based on difficulty level and start the timer for the next question
      let startingTime;
      switch (currentDifficulty) {
        case 'easy':
          startingTime = 15; // Set starting time to 15 seconds for easy difficulty
          break;
        case 'medium':
          startingTime = 10; // Set starting time to 10 seconds for medium difficulty
          break;
        case 'hard':
          startingTime = 5; // Set starting time to 5 seconds for hard difficulty
          break;
        default:
          startingTime = 10; // Default starting time to 10 seconds if difficulty is not recognized
          break;
      }
      
      startTimer(startingTime); // Start the timer with the determined starting time
    }, 1000);
  } else {
    showResult(); // Call showResult when all questions are finished
  }
}

// Function to display user stats
function showResult() {
  hideScreen('question-screen');
  showScreen('result-screen');
  const totalQuestions = questions.length;
  const correctAnswers = score;
  const wrongAnswers = totalQuestions - correctAnswers;
  resultMessage.textContent = `Total Questions: ${totalQuestions}\nCorrect Answers: ${correctAnswers}\nWrong Answers: ${wrongAnswers}`;
}

// Helper function to hide a screen
function hideScreen(screenId) {
  document.getElementById(screenId).classList.add('hidden');
}

// Helper function to show a screen
function showScreen(screenId) {
  document.getElementById(screenId).classList.remove('hidden');
}

// Event listener for result button
resultBtn.addEventListener('click', showResult);

// Event listener for next button
nextBtn.addEventListener('click', () => {
  hideScreen('result-screen');
  showScreen('difficulty-screen');
});
