import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useNavigate, useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { PlusCircle, Save, ArrowLeft } from "lucide-react";
import type { Quiz } from  "@/utils/types";
import { useQuizDB } from "@/hooks/useQuizDB";
import ErrorText from "./components/error-text-component";
import QuestionCard from "./components/question-card";

const Create: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getQuiz, saveQuiz } = useQuizDB();

  const [quiz, setQuiz] = useState<Quiz>({
    id: uuidv4(),
    title: "",
    description: "",
    createdAt: new Date().toISOString(),
    questions: [],
    config: { revealMode: "instant" },
  });

  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      if (id) {
        const existing = await getQuiz(id);
        if (existing) {
          // Merge with default structure
          const defaultQuiz: Quiz = {
            id: uuidv4(),
            title: "",
            description: "",
            createdAt: new Date().toISOString(),
            questions: [],
            config: { revealMode: "instant" },
          };

          const merged: Quiz = {
            ...defaultQuiz,
            ...existing,
            config: {
              ...defaultQuiz.config,
              ...(existing.config || {}),
            },
          };

          setQuiz(merged);
        } else {
          toast.error("Quiz not found.");
          navigate("/");
        }
      } else {
        handleAddQuestion(); // create mode: add one question by default
      }
    };

    fetchQuiz();
  }, [id]);


  const handleAddQuestion = () =>
    setQuiz((p) => ({
      ...p,
      questions: [
        ...p.questions,
        {
          id: uuidv4(),
          type: "multiple-choice-single",
          text: "",
          points: 1,
          explanation: "",
          choices: [
            { id: uuidv4(), text: "", isCorrect: true },
            { id: uuidv4(), text: "", isCorrect: false },
          ],
        },
      ],
    }));

  const handleSave = async () => {
    setShowErrors(true);

    if (!quiz.title.trim()) return toast.error("Title required.");
    if (!quiz.description.trim()) return toast.error("Description required.");
    if (!quiz.questions.length) return toast.error("At least one question required.");

    try {
      const quizToSave = {
        ...quiz,
        updatedAt: new Date().toISOString(),
      };
      await saveQuiz(quizToSave);
      toast.success(id ? "Quiz updated successfully." : "Quiz saved successfully.");
      navigate("/");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save quiz.");
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 mx-auto w-full">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
          <ArrowLeft className="w-4 h-4" /> Back to Quiz List
        </Button>
      </div>

      {/* Title & Description */}
      <div className="space-y-4">
        <div>
          <Label className="mb-2">Quiz Title</Label>
          <Input value={quiz.title} onChange={(e) => setQuiz({ ...quiz, title: e.target.value })} />
          {showErrors && !quiz.title.trim() && <ErrorText>Required.</ErrorText>}
        </div>

        <div>
          <Label className="mb-2">Description</Label>
          <Textarea
            value={quiz.description}
            onChange={(e) => setQuiz({ ...quiz, description: e.target.value })}
          />
          {showErrors && !quiz.description.trim() && <ErrorText>Required.</ErrorText>}
        </div>

        {/* Reveal Mode Selector */}
        <div>
          <Label className="mb-2">Reveal Mode</Label>
          <Select
            value={quiz.config.revealMode}
            onValueChange={(val) =>
              setQuiz((p) => ({ ...p, config: { ...p.config, revealMode: val as "instant" | "review" } }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="instant">Instant Reveal (after each question)</SelectItem>
              <SelectItem value="review">End Reveal (after all questions)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Questions */}
      <div className="flex justify-between items-center mt-8">
        <h2 className="text-lg font-semibold">Questions</h2>
        <Button variant="outline" onClick={handleAddQuestion}>
          <PlusCircle className="w-4 h-4 mr-2" /> Add Question
        </Button>
      </div>

      {quiz.questions.map((q, qi) => (
        <QuestionCard
          key={q.id}
          isInitiallyClosed={Boolean(id)}
          q={q}
          qi={qi}
          quizLength={quiz.questions.length}
          showErrors={showErrors}
          onQuestionChange={(f, v) =>
            setQuiz((p) => ({
              ...p,
              questions: p.questions.map((qq) => (qq.id === q.id ? { ...qq, [f]: v } : qq)),
            }))
          }
          onMove={(dir) => {
            setQuiz((p) => {
              const idx = p.questions.findIndex((x) => x.id === q.id);
              const swap = dir === "up" ? idx - 1 : idx + 1;
              if (swap < 0 || swap >= p.questions.length) return p;
              const newArr = [...p.questions];
              [newArr[idx], newArr[swap]] = [newArr[swap], newArr[idx]];
              return { ...p, questions: newArr };
            });
          }}
          onRemove={() =>
            setQuiz((p) => ({
              ...p,
              questions: p.questions.filter((x) => x.id !== q.id),
            }))
          }
          onChoiceAdd={() =>
            setQuiz((p) => ({
              ...p,
              questions: p.questions.map((qq) =>
                qq.id === q.id
                  ? { ...qq, choices: [...qq.choices, { id: uuidv4(), text: "", isCorrect: false }] }
                  : qq
              ),
            }))
          }
          onChoiceMove={(cid, dir) =>
            setQuiz((p) => ({
              ...p,
              questions: p.questions.map((qq) => {
                if (qq.id !== q.id) return qq;
                const i = qq.choices.findIndex((c) => c.id === cid);
                const swap = dir === "up" ? i - 1 : i + 1;
                if (swap < 0 || swap >= qq.choices.length) return qq;
                const arr = [...qq.choices];
                [arr[i], arr[swap]] = [arr[swap], arr[i]];
                return { ...qq, choices: arr };
              }),
            }))
          }
          onChoiceRemove={(cid) =>
            setQuiz((p) => ({
              ...p,
              questions: p.questions.map((qq) =>
                qq.id === q.id
                  ? {
                      ...qq,
                      choices:
                        qq.choices.length > 1
                          ? qq.choices.filter((c) => c.id !== cid)
                          : qq.choices,
                    }
                  : qq
              ),
            }))
          }
          onChoiceChange={(cid, field, value) =>
            setQuiz((p) => ({
              ...p,
              questions: p.questions.map((qq) =>
                qq.id === q.id
                  ? {
                      ...qq,
                      choices: qq.choices.map((c) =>
                        c.id === cid
                          ? field === "isCorrect" && qq.type === "multiple-choice-single"
                            ? { ...c, isCorrect: true }
                            : { ...c, [field]: value }
                          : qq.type === "multiple-choice-single" && field === "isCorrect"
                          ? { ...c, isCorrect: false }
                          : c
                      ),
                    }
                  : qq
              ),
            }))
          }
          onTypeChange={(t) =>
            setQuiz((p) => ({
              ...p,
              questions: p.questions.map((qq) => (qq.id === q.id ? { ...qq, type: t } : qq)),
            }))
          }
        />
      ))}

      {/* Save/Cancel */}
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={() => navigate("/")}>
          Cancel
        </Button>
        <Button onClick={handleSave} className="flex items-center gap-2">
          <Save className="w-4 h-4" />
          {id ? "Update Quiz" : "Save Quiz"}
        </Button>
      </div>
    </div>
  );
};

export default Create;
