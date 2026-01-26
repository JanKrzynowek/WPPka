import { useState } from "react";
import questionsData from "./questions.json";
import answersData from "./answers.json";
import "./App.css";

// --- ŁĄCZENIE DANYCH ---
const allQuestions = questionsData.map((q) => {
  const answerObj = answersData.find((a) => a.id === q.id);
  return {
    ...q,
    correctAnswerId: answerObj ? answerObj.correct : null, // Tutaj przypisujemy np. "a" lub "c"
  };
});

const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

function App() {
  const [appState, setAppState] = useState("menu");
  const [currentQuestions, setCurrentQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);

  // Stany nauki
  const [isLearningMode, setIsLearningMode] = useState(false);
  const [selectedAnswerId, setSelectedAnswerId] = useState(null); // Przechowujemy ID klikniętej (np. "a")
  const [isInteractionLocked, setIsInteractionLocked] = useState(false);
  const [showFlashcardAnswer, setShowFlashcardAnswer] = useState(false);

  const startQuiz = (mode, range, learning = false) => {
    let questionsPool = [];

    // Wybór zakresu (symulacja na podstawie ID, lub slice jeśli wolisz)
    // Zakładamy proste cięcie tablicy dla przykładu
    if (range === "1") questionsPool = allQuestions.slice(0, 100);
    else if (range === "2") questionsPool = allQuestions.slice(100, 200);
    else if (range === "3") questionsPool = allQuestions.slice(200, 300);
    else questionsPool = allQuestions;

    if (questionsPool.length === 0) questionsPool = allQuestions;

    let shuffledQuestions = shuffleArray(questionsPool);

    // Mieszanie odpowiedzi (obiektów {id, text})
    shuffledQuestions = shuffledQuestions.map((q) => ({
      ...q,
      answers: shuffleArray(q.answers),
    }));

    // W trybie egzaminu ucinamy do 30, w nauce bierzemy wszystko
    if (mode === "exam") {
      shuffledQuestions = shuffledQuestions.slice(0, 30);
    }

    setCurrentQuestions(shuffledQuestions);
    setCurrentIndex(0);
    setScore(0);
    setShowFlashcardAnswer(false);
    setSelectedAnswerId(null);
    setIsInteractionLocked(false);
    setIsLearningMode(learning);
    setAppState(mode === "flashcards" ? "flashcards" : "quiz");
  };

  const handleAnswerClick = (answerId) => {
    if (isInteractionLocked) return;

    // PORÓWNANIE PO ID (np. czy "a" === "a")
    const currentQ = currentQuestions[currentIndex];
    const isCorrect = answerId === currentQ.correctAnswerId;

    if (isCorrect) setScore(score + 1);

    if (isLearningMode) {
      setSelectedAnswerId(answerId);
      setIsInteractionLocked(true);
    } else {
      goToNextQuestion();
    }
  };

  const goToNextQuestion = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < currentQuestions.length) {
      setCurrentIndex(nextIndex);
    } else {
      setAppState("result");
    }
  };

  const handleManualNext = () => {
    setIsInteractionLocked(false);
    setSelectedAnswerId(null);
    goToNextQuestion();
  };

  // Funkcja stylizująca przyciski w trybie nauki
  const getButtonClass = (answerId) => {
    if (!selectedAnswerId) return "";

    const correctId = currentQuestions[currentIndex].correctAnswerId;

    // 1. Wybrana odpowiedź
    if (answerId === selectedAnswerId) {
      return answerId === correctId ? "btn-correct" : "btn-wrong";
    }
    // 2. Poprawna odpowiedź (gdy wybrano źle)
    if (answerId === correctId) {
      return "btn-correct";
    }
    return "btn-dimmed";
  };

  // --- RENDEROWANIE ---

  if (appState === "menu") {
    return (
      <div className="card menu-card">
        <h1>🎓 WPPka</h1>
        <div className="divider">Egzamin (Losowe 30)</div>
        <div className="grid-buttons">
          <button onClick={() => startQuiz("exam", "1", false)}>
            Zestaw 1 (1-100)
          </button>
          <button onClick={() => startQuiz("exam", "2", false)}>
            Zestaw 2 (101-200)
          </button>
          <button onClick={() => startQuiz("exam", "3", false)}>
            Zestaw 3 (201-300)
          </button>
          <button onClick={() => startQuiz("exam", "all", false)}>
            Wszystkie (300)
          </button>
        </div>
        <div className="divider">Nauka (Instant Feedback)</div>
        <div className="grid-buttons">
          <button
            className="secondary"
            onClick={() => startQuiz("learning", "1", true)}
          >
            Nauka 1
          </button>
          <button
            className="secondary"
            onClick={() => startQuiz("learning", "2", true)}
          >
            Nauka 2
          </button>
          <button
            className="secondary"
            onClick={() => startQuiz("learning", "3", true)}
          >
            Nauka 3
          </button>
          <button
            className="secondary"
            onClick={() => startQuiz("learning", "all", true)}
          >
            Cała baza
          </button>
        </div>
        <div className="divider">Inne</div>
        <button
          className="text-btn"
          onClick={() => startQuiz("flashcards", "all")}
        >
          Fiszki
        </button>
      </div>
    );
  }

  if (appState === "quiz") {
    const question = currentQuestions[currentIndex];
    return (
      <div className="card quiz-card">
        <div className="header-row">
          <div className="progress-info">
            <span>
              Pytanie {currentIndex + 1} / {currentQuestions.length}
            </span>
          </div>
          <button className="exit-btn" onClick={() => setAppState("menu")}>
            ✕
          </button>
        </div>

        <h2>{question.question}</h2>
        <div className="answers-grid">
          {question.answers.map((ans) => (
            <button
              key={ans.id} // Używamy ID jako klucza React
              onClick={() => handleAnswerClick(ans.id)} // Przekazujemy ID
              className={isLearningMode ? getButtonClass(ans.id) : ""}
              disabled={isInteractionLocked}
            >
              {/* Tutaj opcjonalnie możesz dodać literkę przed tekstem */}
              <span
                style={{
                  opacity: 0.6,
                  marginRight: "10px",
                  fontWeight: "bold",
                }}
              >
                {ans.id.toUpperCase()}.
              </span>
              {ans.text}
            </button>
          ))}
        </div>
        {isLearningMode && (
          <div
            style={{
              marginTop: "20px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <span
              className="score-badge"
              style={{ marginBottom: selectedAnswerId ? "15px" : "0" }}
            >
              Pkt: {score}
            </span>
            {selectedAnswerId && (
              <button onClick={handleManualNext}>Następne pytanie ➔</button>
            )}
          </div>
        )}
      </div>
    );
  }

  if (appState === "flashcards") {
    const question = currentQuestions[currentIndex];
    // Szukamy tekstu poprawnej odpowiedzi na podstawie ID
    const correctAnsObj = question.answers.find(
      (a) => a.id === question.correctAnswerId,
    );
    const correctText = correctAnsObj ? correctAnsObj.text : "Błąd danych";

    return (
      <div className="card flashcard-card">
        <div className="flashcard-content">
          <div className="header">
            Fiszka {currentIndex + 1} / {currentQuestions.length}
          </div>
          <h2>{question.question}</h2>
          {showFlashcardAnswer ? (
            <div className="answer-reveal correct">{correctText}</div>
          ) : (
            <div className="answer-placeholder">???</div>
          )}
        </div>
        <div className="flashcard-controls">
          {!showFlashcardAnswer ? (
            <button onClick={() => setShowFlashcardAnswer(true)}>Pokaż</button>
          ) : (
            <button
              onClick={() => {
                setShowFlashcardAnswer(false);
                if (currentIndex + 1 < currentQuestions.length)
                  setCurrentIndex(currentIndex + 1);
                else setAppState("menu");
              }}
            >
              Następne
            </button>
          )}
          <button className="text-btn" onClick={() => setAppState("menu")}>
            Wyjdź
          </button>
        </div>
      </div>
    );
  }

  if (appState === "result") {
    const percentage = Math.round((score / currentQuestions.length) * 100);
    return (
      <div className="card result-card">
        <h1>Wynik</h1>
        <div className={`score-circle ${percentage >= 50 ? "pass" : "fail"}`}>
          {percentage}%
        </div>
        <p>
          Zdobyłeś {score} z {currentQuestions.length} punktów.
        </p>
        <button onClick={() => setAppState("menu")}>Wróć do Menu</button>
      </div>
    );
  }
  return null;
}

export default App;
