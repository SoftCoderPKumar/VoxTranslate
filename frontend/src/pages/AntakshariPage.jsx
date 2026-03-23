import  { useState, useRef, useEffect } from "react";
import nspell from "nspell";

import "./AntakshariPage.css";

const AntakshariPage = () => {
  const [gameState, setGameState] = useState("idle"); // 'idle', 'playing', 'paused', 'gameOver'
  const [score, setScore] = useState(0);
  const [currentWord, setCurrentWord] = useState("");
  const [lastLetter, setLastLetter] = useState("");
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds per turn
  const [wordsPlayed, setWordsPlayed] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [gameStats, setGameStats] = useState({
    totalWords: 0,
    correctWords: 0,
    longestWord: "",
    averageWordLength: 0,
  });
  const [ruleOpen, setRuleOpen] = useState(true);
  const [spell, setSpell] = useState(null);

  const timerRef = useRef(null);
  const inputRef = useRef(null);

  // Load dictionary
  useEffect(() => {
    const loadDictionary = async () => {
      const aff = await fetch("/dictionary/en.aff").then((res) => res.text());
      const dic = await fetch("/dictionary/en.dic").then((res) => res.text());

      const spellChecker = nspell(aff, dic);
      setSpell(spellChecker);
    };

    loadDictionary();
  }, []);

  // check spelling
  const checkSpelling = (word) => {
    if (!spell) return;
    return spell.correct(word);
  };

  // Timer logic
  useEffect(() => {
    if (gameState === "playing" && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [gameState, timeLeft]);

  // Handle game over when time runs out
  useEffect(() => {
    if (timeLeft === 0 && gameState === "playing") {
      setGameState("gameOver");
      // Calculate final stats
      const totalWords = wordsPlayed.length;
      const correctWords = wordsPlayed.filter((word) => word.isValid).length;
      const longestWord = wordsPlayed.reduce(
        (longest, word) =>
          word.text.length > longest.length ? word.text : longest,
        "",
      );
      const averageWordLength =
        totalWords > 0
          ? wordsPlayed.reduce((sum, word) => sum + word.text.length, 0) /
            totalWords
          : 0;

      setGameStats({
        totalWords,
        correctWords,
        longestWord,
        averageWordLength: Math.round(averageWordLength * 10) / 10,
      });
    }
  }, [timeLeft, gameState, wordsPlayed]);

  // Auto-focus input when game starts
  useEffect(() => {
    if (gameState === "playing" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [gameState]);

  const startGame = () => {
    setGameState("playing");
    setScore(0);
    setCurrentWord("");
    setLastLetter("");
    setTimeLeft(60);
    setWordsPlayed([]);
    setErrorMessage("");
    setGameStats({
      totalWords: 0,
      correctWords: 0,
      longestWord: "",
      averageWordLength: 0,
    });
  };

  const pauseGame = () => {
    setGameState("paused");
  };

  const resumeGame = () => {
    setGameState("playing");
  };

  const stopGame = () => {
    setGameState("playing");
    setTimeLeft(0);
  };

  const exitGame = () => {
    setGameState("idle");
    setTimeLeft(60);
    setErrorMessage("");
  };

  const restartGame = () => {
    startGame();
  };

  const validateWord = async (word) => {
    const trimmedWord = word.trim().toLowerCase();

    // Check if word is empty
    if (!trimmedWord) {
      return { isValid: false, error: "Please enter a word" };
    }

    // Check minimum length
    if (trimmedWord.length < 2) {
      return { isValid: false, error: "Word must be at least 2 letters long" };
    }

    // Check if word starts with correct letter
    if (lastLetter && !trimmedWord.startsWith(lastLetter)) {
      return {
        isValid: false,
        error: `Word must start with '${lastLetter.toUpperCase()}'. Please try again.`,
      };
    }

    // Check if word was already used
    const wordExists = wordsPlayed.some(
      (w) => w.text.toLowerCase() === trimmedWord,
    );
    if (wordExists) {
      return {
        isValid: false,
        error: "This word has already been used. Please try another word.",
      };
    }

    // Check if it's a valid English word (basic check - contains only letters)
    if (!/^[a-zA-Z]+$/.test(trimmedWord)) {
      return {
        isValid: false,
        error: "Please enter a valid English word (letters only)",
      };
    }

    var misspelled = checkSpelling(trimmedWord);

    if (!misspelled) {
      return {
        isValid: false,
        error: "Oops! That word is incorrect. Try again.",
      };
    }

    return { isValid: true, error: "" };
  };

  const submitWord = async () => {
    const word = currentWord.trim();
    const validation = await validateWord(word);

    if (!validation.isValid) {
      setErrorMessage(validation.error);
      setTimeout(() => setErrorMessage(""), 3000);
      const newWord = {
        text: word,
        isValid: false,
        timestamp: Date.now(),
      };
      setWordsPlayed((prev) => [...prev, newWord]);
      return;
    }

    // Word is valid
    const newWord = {
      text: word,
      isValid: true,
      timestamp: Date.now(),
    };

    setWordsPlayed((prev) => [...prev, newWord]);
    setLastLetter(word.slice(-1).toLowerCase());
    setScore((prev) => prev + word.length); // Score based on word length
    setCurrentWord("");
    setTimeLeft(60); // Reset timer
    setErrorMessage("");

    // Auto-focus input
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && gameState === "playing") {
      submitWord();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getTimerColor = () => {
    if (timeLeft > 20) return "var(--green-primary)";
    if (timeLeft > 10) return "var(--orange-primary)";
    return "#dc3545"; // Red
  };

  return (
    <div
      className="page-wrapper game-page"
      style={{ background: "var(--dark-bg)" }}
    >
      <div className="container py-4">
        <div className="card-dark p-4">
          <h2 className="mb-4 text-center">🎵 Antakshari Game</h2>

          {/* Game Status */}
          <div className="game-status mb-4">
            <div className=" d-flex gap-4 align-items-center justify-content-between">
              {(gameState === "playing" || gameState == "paused") && (
                <>
                  <div className="w-100">
                    <div className="status-card">
                      <h6>Score</h6>
                      <div className="score-display">{score}</div>
                    </div>
                  </div>

                  <div className="w-100">
                    <div className="status-card">
                      <h6>Time Left</h6>
                      <div
                        className="timer-display"
                        style={{ color: getTimerColor() }}
                      >
                        {formatTime(timeLeft)}
                      </div>
                    </div>
                  </div>

                  <div className="w-100">
                    <div className="status-card">
                      <h6>Words Played</h6>
                      <div className="words-count">{wordsPlayed.length}</div>
                    </div>
                  </div>
                  <div className="w-100">
                    <div className="status-card">
                      <h6>Next Letter</h6>
                      <div className="next-letter">
                        {lastLetter ? lastLetter.toUpperCase() : "-"}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Game Controls */}
          <div className="game-controls mb-4">
            <div className="d-flex justify-content-center gap-3 flex-wrap">
              {gameState === "idle" && (
                <button
                  className="btn btn-outline-green btn-lg"
                  onClick={startGame}
                >
                  <i className="bi bi-play-fill me-2"></i>
                  Start Game
                </button>
              )}

              {gameState === "playing" && (
                <>
                  <button
                    className="btn btn-outline-orange"
                    onClick={pauseGame}
                  >
                    <i className="bi bi-pause-fill me-2"></i>
                    Pause
                  </button>
                </>
              )}

              {gameState === "paused" && (
                <>
                  <button
                    className="btn btn-outline-green"
                    onClick={resumeGame}
                  >
                    <i className="bi bi-play-fill me-2"></i>
                    Resume
                  </button>
                  <button
                    className="btn btn-outline-orange"
                    onClick={restartGame}
                  >
                    <i className="bi bi-arrow-repeat me-2"></i>
                    Restart
                  </button>
                </>
              )}

              {(gameState === "playing" || gameState === "paused") && (
                <>
                  <button className="btn btn-orange" onClick={stopGame}>
                    <i className="bi bi-stop-fill me-2"></i>
                    Stop
                  </button>
                  <button className="btn btn-danger" onClick={exitGame}>
                    <i className="bi bi-x-octagon me-2"></i>
                    Exit
                  </button>
                </>
              )}

              {gameState === "gameOver" && (
                <button
                  className="btn btn-outline-green btn-lg"
                  onClick={restartGame}
                >
                  <i className="bi bi-arrow-repeat me-2"></i>
                  Play Again
                </button>
              )}
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="alert alert-danger mb-4" role="alert">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {errorMessage}
            </div>
          )}

          {/* Word Input */}
          {gameState === "playing" && (
            <div className="word-input-section mb-4">
              <div className="input-group input-group-lg">
                <span className="input-group-text">
                  <i className="bi bi-pencil-square"></i>
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  className="form-control"
                  placeholder={
                    lastLetter
                      ? `Enter a word starting with '${lastLetter.toUpperCase()}'...`
                      : "Enter your first word..."
                  }
                  value={currentWord}
                  onChange={(e) => setCurrentWord(e.target.value)}
                  onKeyDown={handleKeyPress}
                  disabled={gameState !== "playing"}
                  autoComplete="off"
                />
                <button
                  className="btn btn-orange"
                  onClick={submitWord}
                  disabled={!currentWord.trim() || gameState !== "playing"}
                >
                  <i className="bi bi-send me-2"></i>
                  Submit
                </button>
              </div>
              {/* <div className="form-text text-muted">
                Press Enter or click Submit to play your word
              </div> */}
            </div>
          )}

          {/* Game Over Screen */}
          {gameState === "gameOver" && (
            <div className="game-over-section mb-4">
              <div className="game-over-card">
                <h3 className="text-center mb-4">
                  <i className="bi bi-trophy text-warning me-2"></i>
                  Game Over!
                </h3>

                <div className="final-stats">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="stat-item">
                        <h6>Final Score</h6>
                        <div className="stat-value text-orange">{score}</div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="stat-item">
                        <h6>Words Played</h6>
                        <div className="stat-value text-green">
                          {gameStats.totalWords}
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="stat-item">
                        <h6>Correct Words</h6>
                        <div className="stat-value text-blue">
                          {gameStats.correctWords}
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="stat-item">
                        <h6>Longest Word</h6>
                        <div className="stat-value text-purple">
                          {gameStats.longestWord || "None"}
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="stat-item">
                        <h6>Average Word Length</h6>
                        <div className="stat-value text-teal">
                          {gameStats.averageWordLength}
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="stat-item">
                        <h6>Accuracy</h6>
                        <div className="stat-value text-success">
                          {gameStats.totalWords > 0
                            ? Math.round(
                                (gameStats.correctWords /
                                  gameStats.totalWords) *
                                  100,
                              )
                            : 0}
                          %
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Words History */}
          {wordsPlayed.length > 0 && (
            <div className="words-history">
              <h5 className="mb-3">Words Played</h5>
              <div className="words-list">
                {wordsPlayed.map((word, index) => (
                  <div
                    key={index}
                    className={`word-item ${word.isValid ? "alert-primary" : "alert-danger"}`}
                  >
                    <span className="word-number">#{index + 1}</span>
                    <span className="word-text">{word.text}</span>

                    <span className="word-letter">
                      {word.isValid ? word.text.slice(-1).toUpperCase() : ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Game Rules */}
          <div className="game-rules mt-4 ">
            <button
              className=" d-flex justify-content-between align-content-center gap-1"
              onClick={() => setRuleOpen((v) => !v)}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--dark-muted)",
                fontWeight: 600,
                cursor: "pointer",
                width: "100%",
              }}
              aria-expanded={ruleOpen}
            >
              <div className=" text-info">
                <i className="bi bi-info-circle me-2"></i>Game Rules
              </div>
              <i
                className={`bi bi-caret-${ruleOpen ? "up" : "down"}-fill ms-2`}
              />
            </button>
            {/* Rule list */}
            {ruleOpen && (
              <ul className="rules-list border-top mt-2 pt-2">
                <li>
                  Enter words that start with the last letter of the previous
                  word.
                </li>
                <li>Each word must be at least 2 letters long.</li>
                <li>You have 60 seconds to enter each word.</li>
                <li>
                  Score points based on word length (1 points per letter).
                </li>
                <li>Avoid repeating words that have already been played.</li>
                <li>The game ends when time runs out.</li>
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AntakshariPage;
