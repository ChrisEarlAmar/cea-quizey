import React, { type FC, useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AnimatePresence, motion } from "framer-motion";
import {
  CircleCheck,
  X,
  Check,
  Circle,
  Info,
  Loader2,
  Pause,
  Play as PlayIcon,
  Home, 
  RotateCw,
  AlertTriangle,
  Square, 
  CheckSquare,
  ArrowLeft, 
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuizDB } from "@/hooks/useQuizDB";
import type { Quiz, Question, Choice } from "@/utils/types";

// ---------- HELPERS ----------
const isShortText = (text: string, threshold = 60) => text.length <= threshold;

// ---------- CHOICE BUTTON ----------
const ChoiceButton: FC<{
  choice: Choice;
  selected: boolean;
  showCorrect: boolean;
  isMultiple: boolean;
  onClick: () => void;
}> = ({ choice, selected, isMultiple, showCorrect, onClick }) => {
  let borderColor = "border-gray-300";
  if (showCorrect) {
    if (choice.isCorrect) borderColor = "border-green-500";
    else if (selected && !choice.isCorrect) borderColor = "border-red-500";
  } else if (selected) {
    borderColor = "border-blue-500";
  }

  // Icon selection logic based on question type
  const renderIcon = () => {
    if (showCorrect) {
      if (choice.isCorrect) return <CircleCheck className="w-6 h-6 text-green-600" />;
      if (selected && !choice.isCorrect) return <X className="w-6 h-6 text-red-500" />;
      return isMultiple ? (
        <Square className="w-6 h-6 text-gray-400" />
      ) : (
        <Circle className="w-6 h-6 text-gray-400" />
      );
    }

    if (selected) {
      return isMultiple ? (
        <CheckSquare className="w-6 h-6 text-blue-600" />
      ) : (
        <CircleCheck className="w-6 h-6 text-blue-600" />
      );
    }

    return isMultiple ? (
      <Square className="w-6 h-6 text-gray-400" />
    ) : (
      <Circle className="w-6 h-6 text-gray-400" />
    );
  };

  return (
    <button
      onClick={onClick}
      disabled={showCorrect}
      className={`flex items-center justify-center gap-4 p-4 rounded-lg border-2 text-lg font-medium transition w-full
        ${borderColor} ${showCorrect ? "cursor-not-allowed" : "hover:border-blue-500"}`}
    >
      {renderIcon()}

      <span
        className={`flex-1 ${
          isShortText(choice.text) ? "text-center text-lg" : "text-left text-base"
        }`}
      >
        {choice.text}
      </span>
    </button>
  );
};

// ---------- QUESTION HEADER ----------
const QuestionHeader: FC<{
  index: number;
  total: number;
  showCorrect: boolean;
  timeLeft: number;
  paused: boolean;
  togglePause: () => void;
  questionType?: "multiple-choice-single" | "multiple-choice-multiple";
}> = ({ index, total, showCorrect, timeLeft, paused, togglePause, questionType }) => (
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2 sm:gap-0">

    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
      <div className="text-2xl font-semibold">
        Question {index + 1} / {total}
      </div>

      {/* Type Badge */}
      {questionType === "multiple-choice-multiple" && (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-sm font-medium">
          <CircleCheck className="w-4 h-4 text-amber-600" />
          Multiple Select
        </span>
      )}
    </div>

    {showCorrect && (
      <div className="flex justify-between sm:justify-end items-center w-full sm:w-auto mt-1 sm:mt-0 gap-2">
        {/* Countdown + Loader */}
        <div className="flex items-center gap-2">
          <Loader2
            className={cn(
              "w-5 h-5 text-muted-foreground transition-all",
              !paused && "animate-spin"
            )}
          />
          <span className="text-lg min-w-[80px]">
            {Boolean(index === total - 1) ? `Finishing in ${timeLeft}s` : `Next in ${timeLeft}s`}
            </span>
        </div>

        {/* Pause/Resume Button */}
        <Button
          variant="default"
          size="sm"
          className="flex items-center gap-2 flex-shrink-0 px-3 py-1"
          onClick={togglePause}
          title={paused ? "Resume countdown" : "Pause countdown"}
        >
          {paused ? <PlayIcon className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
          <span className="text-sm">{paused ? "Resume" : "Pause"}</span>
        </Button>
      </div>
    )}
  </div>
);

// ---------- QUESTION CARD ----------
const QuestionCard: FC<{
  question: Question;
  index: number;
  total: number;
  selectedAnswers: string[];
  onChoiceChange: (choiceId: string) => void;
  onSubmit: () => void;
  onPrev: () => void;
  onNext: () => void;
  showCorrect: boolean;
  revealMode: "instant" | "review";
}> = ({ question, index, total, selectedAnswers, onChoiceChange, onSubmit, onPrev, onNext, showCorrect, revealMode }) => {
   const navigate = useNavigate();
  
    const [timeLeft, setTimeLeft] = useState(4);
    const [paused, setPaused] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const togglePause = () => setPaused((p) => !p);

  useEffect(() => {
    if (!showCorrect || paused) return;

    timerRef.current = setTimeout(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          onNext();
          return 4;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [showCorrect, paused, timeLeft]);

  useEffect(() => {
    if (!showCorrect) setTimeLeft(4);
  }, [showCorrect]);

  const isMultiple = question.type === "multiple-choice-multiple";

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-4xl mx-auto bg-background rounded-2xl 
        p-0 sm:p-6 md:p-8 
        sm:border sm:border-border sm:shadow-sm sm:mt-4"
    >
      {/* Header */}
      <div className="mb-6">
        <QuestionHeader
          index={index}
          total={total}
          showCorrect={showCorrect}
          timeLeft={timeLeft}
          paused={paused}
          togglePause={togglePause}
          questionType={question.type}
        />
      </div>

      {/* Question Text */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <p className="text-2xl font-semibold">{question.text}</p>
        </div>
    
      {/* Choices */}
      <div className="flex flex-col gap-4">
        {question.choices.map((c) => (
          <ChoiceButton
            key={c.id}
            choice={c}
            isMultiple={isMultiple}
            selected={selectedAnswers.includes(c.id)}
            showCorrect={showCorrect}
            onClick={() => onChoiceChange(c.id)}
          />
        ))}
      </div>

      {/* Explanation (if showCorrect) */}
      {showCorrect && question.explanation && question.explanation.trim() !== "" && (
        <AnimatePresence>
          <motion.div
            key="explanation"
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="mt-4"
          >
            <Alert className="flex items-start gap-4 p-4">
              <Info className="h-7 w-7 mt-1 text-blue-500 shrink-0" />
              <div>
                <AlertTitle className="text-lg font-semibold">Explanation</AlertTitle>
                <AlertDescription className="text-base leading-relaxed text-muted-foreground">
                  {question.explanation}
                </AlertDescription>
              </div>
            </Alert>
          </motion.div>
        </AnimatePresence>
      )}

        {/* Submit Button */}
        {(!showCorrect && revealMode === "instant") && (
            <Button
                onClick={onSubmit}
                className="w-full flex items-center justify-center gap-3 mt-6 px-5 py-4 text-lg"
            >
                <Check className="w-5 h-5" />
                <span>Check Answer</span>
            </Button>
        )}

        {(!showCorrect && revealMode === "review") && (
            <div className="flex items-center justify-between gap-4 mt-6">
                {/* Previous Button — hidden when index === 0 */}
                <Button
                    onClick={() => (index === 0 ? navigate("/") : onPrev())}
                    variant="outline"
                    className="flex-1 flex items-center justify-center gap-2 px-5 py-4 text-lg"
                >
                    {index === 0 ? (
                    <>
                        <Home className="w-5 h-5" />
                        <span>Home</span>
                    </>
                    ) : (
                    <>
                        <ArrowLeft className="w-5 h-5" />
                        <span>Previous</span>
                    </>
                    )}
                </Button>

                {/* Next / Finish Button */}
                <Button
                onClick={onNext}
                className={`flex-1 flex items-center justify-center gap-2 px-5 py-4 text-lg ${
                    index === 0 ? "w-full" : ""
                }`}
                >
                {index === total - 1 ? (
                    <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Finish Quiz</span>
                    </>
                ) : (
                    <>
                    <span>Next</span>
                    <ArrowRight className="w-5 h-5" />
                    </>
                )}
                </Button>
            </div>
        )}
    </motion.div>
  );
};

// ---------- RESULTS REVIEW ----------
const ResultsReview: FC<{
  quiz: Quiz;
  answers: Record<string, string[]>;
  score: number;
  totalPossible: number;
  onRestart: () => void;
  onHome: () => void;
}> = ({ quiz, answers, score, totalPossible, onRestart, onHome }) => {
    const navigate = useNavigate();

    return (
        <motion.div
            key="score"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full p-1 sm:p-6 md:p-8 text-center"
        >
            <div className="flex items-center justify-between mb-4">
                <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to Quiz List
                </Button>
            </div>

            <h2 className="text-3xl font-semibold mb-2">Quiz Complete!</h2>
            <p className="text-2xl mb-6">
                Your Score: <strong>{score}</strong> / {totalPossible}
            </p>

            <div className="space-y-6 text-left">
            {quiz.questions.map((q, qi) => {
                const userAns = answers[q.id] || [];
                const correctAns = q.choices.filter((c) => c.isCorrect).map((c) => c.id);

                const isFullyCorrect =
                userAns.length > 0 &&
                userAns.every((a) => correctAns.includes(a)) &&
                userAns.length === correctAns.length;

                const isIncomplete =
                q.type === "multiple-choice-multiple" &&
                userAns.length > 0 &&
                userAns.some((a) => correctAns.includes(a)) &&
                !isFullyCorrect;

                // ✅ Score calculation
                let questionScore = 0;
                if (isFullyCorrect) {
                questionScore = q.points;
                } else if (isIncomplete) {
                const correctSelected = userAns.filter((id) => correctAns.includes(id)).length;
                questionScore = Number(
                    ((correctSelected / correctAns.length) * q.points).toFixed(2)
                );
                }

                const renderAnswers = (
                ids: string[],
                correctIds: string[],
                colorize = false
                ) =>
                ids
                    .map((id) => {
                    const choice = q.choices.find((c) => c.id === id);
                    if (!choice) return null;
                    const isCorrectChoice = correctIds.includes(id);
                    const textClass = colorize
                        ? isCorrectChoice
                        ? "text-green-600"
                        : "text-red-500"
                        : "text-green-600";
                    return (
                        <span key={id} className={`font-medium ${textClass}`}>
                        {choice.text}
                        </span>
                    );
                    })
                    .filter(Boolean)
                    .reduce((prev: React.ReactNode[], curr, idx, arr) => {
                    prev.push(curr);
                    if (idx < arr.length - 1) prev.push(<span key={`sep-${idx}`}>, </span>);
                    return prev;
                    }, []);

                return (
                <div key={q.id} className="pb-4 border-b last:border-none">
                    <h3 className="text-lg font-medium mb-2">
                    {qi + 1}. {q.text}
                    </h3>

                    {/* Your / Correct Answers */}
                    {isFullyCorrect ? (
                    <p className="mb-2">
                        <strong>Answer:</strong> {renderAnswers(correctAns, correctAns)}
                    </p>
                    ) : (
                    <>
                        <p className="mb-2">
                        <strong>Your Answer:</strong>{" "}
                        {userAns.length > 0 ? (
                            renderAnswers(userAns, correctAns, true)
                        ) : (
                            <span className="text-gray-400 italic">No answer</span>
                        )}
                        </p>
                        <p className="mb-2">
                        <strong>Correct Answer:</strong>{" "}
                        {renderAnswers(correctAns, correctAns)}
                        </p>
                    </>
                    )}

                    {/* Explanation */}
                    {q.explanation && (
                    <Alert className="mt-3 flex items-start gap-4 p-4">
                        <Info className="h-7 w-7 mt-1 text-blue-500 shrink-0" />
                        <div>
                        <AlertTitle className="text-lg font-semibold">Explanation</AlertTitle>
                        <AlertDescription className="text-base leading-relaxed text-muted-foreground">
                            {q.explanation}
                        </AlertDescription>
                        </div>
                    </Alert>
                    )}

                    {/* ✅ Indicator + Score */}
                    <div className="mt-3 flex items-center justify-between font-semibold">
                    <div className="flex items-center gap-2">
                        {isFullyCorrect ? (
                        <>
                            <CircleCheck className="w-5 h-5 text-green-600" />
                            <span className="text-green-600">Correct</span>
                        </>
                        ) : isIncomplete ? (
                        <>
                            <AlertTriangle className="w-5 h-5 text-amber-500" />
                            <span className="text-amber-500">Incomplete Answer</span>
                        </>
                        ) : (
                        <>
                            <X className="w-5 h-5 text-red-500" />
                            <span className="text-red-500">Incorrect</span>
                        </>
                        )}
                    </div>

                    <span className="text-right text-base text-muted-foreground">
                        Score: <strong>{questionScore}</strong> / {q.points}
                    </span>
                    </div>
                </div>
                );
            })}
            </div>

            <div className="mt-8 flex justify-center gap-4">
            <Button variant="outline" onClick={onHome} className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                Home
            </Button>
            <Button onClick={onRestart} className="flex items-center gap-2">
                <RotateCw className="w-4 h-4" />
                Restart Quiz
            </Button>
            </div>
        </motion.div>
    );
};

// ---------- START CARD WITH ANIMATION ----------
const StartCard: FC<{
  quiz: Quiz;
  onStart: () => void;
  onHome: () => void;
}> = ({ quiz, onStart, onHome }) => (
  <motion.div
    key="start-card"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.5 }}
    className="w-full p-1 sm:p-6 md:p-8 text-center bg-background/60 rounded-2xl border-0 shadow-none sm:border sm:border-border sm:shadow-sm"
  >
    <motion.h1
      className="text-4xl font-bold mb-4"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      {quiz.title}
    </motion.h1>

    <motion.p
      className="text-lg text-muted-foreground mb-8"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      {quiz.description}
    </motion.p>

    <div className="flex justify-center gap-4">
      <Button variant="default" onClick={onStart} className="flex items-center gap-2">
        <Check className="w-4 h-4" />
        Start Quiz
      </Button>
      <Button variant="outline" onClick={onHome} className="flex items-center gap-2">
        <Home className="w-4 h-4" />
        Home
      </Button>
    </div>
  </motion.div>
);

// ---------- MAIN PLAY COMPONENT ----------
const Play: FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { getQuiz } = useQuizDB();

    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [currentIndex, setCurrentIndex] = useState<number | null>(null);
    const [answers, setAnswers] = useState<Record<string, string[]>>({});
    const [score, setScore] = useState<number | null>(null);
    const [showCorrect, setShowCorrect] = useState(false);

    useEffect(() => {
        const fetchQuiz = async () => {
            if (id) {
                const existing = await getQuiz(id);
                if (existing) {
                    setQuiz(existing ?? null);
                } else {
                    navigate("/");
            }
            } else {
                navigate("/");
            }
        };

        fetchQuiz();
    }, [id, navigate]);

    if (!quiz) return null;

    const handleStart = () => setCurrentIndex(0);
    const totalPossible = quiz.questions.reduce((sum, q) => sum + q.points, 0);

    return (
        <motion.div
        className="flex flex-col gap-6 p-4 w-full overflow-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        >
        <AnimatePresence mode="wait" initial={false}>
            {currentIndex === null ? (
            <StartCard
                key="start-card"
                quiz={quiz}
                onStart={handleStart}
                onHome={() => navigate("/")}
            />
            ) : score === null ? (
            <QuestionCard
                key={quiz.questions[currentIndex].id}
                question={quiz.questions[currentIndex]}
                index={currentIndex}
                total={quiz.questions.length}
                selectedAnswers={answers[quiz.questions[currentIndex].id] || []}
                onChoiceChange={(choiceId: string) => {
                setAnswers((prev) => {
                    const prevChoices = prev[quiz.questions[currentIndex].id] || [];
                    if (quiz.questions[currentIndex].type === "multiple-choice-single")
                    return { ...prev, [quiz.questions[currentIndex].id]: [choiceId] };
                    return prevChoices.includes(choiceId)
                    ? { ...prev, [quiz.questions[currentIndex].id]: prevChoices.filter((id) => id !== choiceId) }
                    : { ...prev, [quiz.questions[currentIndex].id]: [...prevChoices, choiceId] };
                });
                }}
                onSubmit={() => setShowCorrect(true)}
                onPrev={() => {
                    if (currentIndex > 0) setCurrentIndex((i) => (i ?? 0) - 1);
                }}
                onNext={() => {
                if (currentIndex < quiz.questions.length - 1) setCurrentIndex((i) => (i ?? 0) + 1);
                else setScore(Number(
                    quiz.questions.reduce((total, q) => {
                    const userAns = answers[q.id] || [];
                    const correctAns = q.choices.filter((c) => c.isCorrect).map((c) => c.id);
                    if (correctAns.length === 0) return total;

                    if (q.type === "multiple-choice-single") {
                        if (userAns.length === 1 && correctAns.includes(userAns[0])) return total + q.points;
                    } else {
                        const correctSelected = userAns.filter((id) => correctAns.includes(id)).length;
                        const incorrectSelected = userAns.filter((id) => !correctAns.includes(id)).length;
                        if (incorrectSelected === 0 && correctSelected > 0) return total + (correctSelected / correctAns.length) * q.points;
                    }
                    return total;
                    }, 0).toFixed(2)
                ));
                setShowCorrect(false);
                }}
                showCorrect={showCorrect}
                revealMode={quiz.config.revealMode}
            />
            ) : (
            <ResultsReview
                key="results"
                quiz={quiz}
                answers={answers}
                score={score}
                totalPossible={totalPossible}
                onRestart={() => {
                setAnswers({});
                setCurrentIndex(null);
                setScore(null);
                setShowCorrect(false);
                }}
                onHome={() => navigate("/")}
            />
            )}
        </AnimatePresence>
        </motion.div>
    );
};

export default Play;
