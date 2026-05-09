import React, { useEffect, useState, memo } from "react";
import { v4 as uuidv4 } from "uuid";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { PlusCircle, Trash2, Save, ArrowUp, ArrowDown, ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Quiz, Question, Choice } from  "@/utils/types";

// ================== Utility Components ==================
const ErrorText: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-xs text-destructive mt-1">{children}</p>
);

// ================== ChoiceItem Subcomponent ==================
const ChoiceItem = memo(
  ({
    q,
    c,
    ci,
    showErrors,
    onChange,
    onMove,
    onRemove,
  }: {
    q: Question;
    c: Choice;
    ci: number;
    showErrors: boolean;
    onChange: (field: keyof Choice, value: any) => void;
    onMove: (dir: "up" | "down") => void;
    onRemove: () => void;
  }) => {
    const duplicateChoiceError = () => {
      const normalized = c.text.trim().toLowerCase();
      return q.choices.filter((x) => x.text.trim().toLowerCase() === normalized).length > 1;
    };

    const isEmpty = !c.text.trim();
    const isDuplicate = duplicateChoiceError();

    return (
      <div className="border p-2 sm:p-6 md:p-8 rounded-md flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            value={c.text}
            placeholder={`Choice ${ci + 1}`}
            onChange={(e) => onChange("text", e.target.value)}
          />
          {showErrors &&
            ((isEmpty && isDuplicate && <ErrorText>Choice must be unique and not empty.</ErrorText>) ||
              (isEmpty && <ErrorText>Choice cannot be empty.</ErrorText>) ||
              (isDuplicate && <ErrorText>Choice text must be unique.</ErrorText>))}
        </div>

        <div className="flex flex-col sm:flex-row w-full sm:w-auto justify-between gap-2 sm:items-center">
          <div className="flex items-center gap-2">
            {q.type === "multiple-choice-single" ? (
              <>
                <Label className="text-sm whitespace-nowrap">Correct Answer</Label>
                <RadioGroup>
                  <RadioGroupItem
                    value={c.id}
                    checked={c.isCorrect}
                    onClick={() => onChange("isCorrect", true)}
                  />
                </RadioGroup>
              </>
            ) : (
              <>
                <Label className="text-sm whitespace-nowrap">Correct Answer</Label>
                <Checkbox checked={c.isCorrect} onCheckedChange={(v) => onChange("isCorrect", v)} />
              </>
            )}
          </div>

          <div className="flex justify-end sm:justify-center gap-1 items-center mt-2 sm:mt-0 border-t sm:border-t-0 pt-2 sm:pt-0">
            <Button size="icon" variant="ghost" disabled={ci === 0} onClick={() => onMove("up")}>
              <ArrowUp className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              disabled={ci === q.choices.length - 1}
              onClick={() => onMove("down")}
            >
              <ArrowDown className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="destructive"
              disabled={q.choices.length <= 1}
              onClick={onRemove}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }
);

// ================== QuestionCard Subcomponent ==================
const QuestionCard = memo(
  ({
    isInitiallyClosed,
    q,
    qi,
    quizLength,
    showErrors,
    onQuestionChange,
    onMove,
    onRemove,
    onChoiceAdd,
    onChoiceMove,
    onChoiceRemove,
    onChoiceChange,
    onTypeChange,
  }: {
    isInitiallyClosed: Boolean;
    q: Question;
    qi: number;
    quizLength: number;
    showErrors: boolean;
    onQuestionChange: (field: keyof Question, value: any) => void;
    onMove: (dir: "up" | "down") => void;
    onRemove: () => void;
    onChoiceAdd: () => void;
    onChoiceMove: (cid: string, dir: "up" | "down") => void;
    onChoiceRemove: (cid: string) => void;
    onChoiceChange: (cid: string, field: keyof Choice, value: any) => void;
    onTypeChange: (type: Question["type"]) => void;
  }) => {
    const [collapsed, setCollapsed] = useState(isInitiallyClosed);
    return (
      <div className={cn("rounded-md bg-card border border-border transition-all", "p-[3vw] sm:p-[2vw] md:p-[1.5vw] space-y-4")}>
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className="flex items-center gap-2 text-base sm:text-lg font-semibold hover:text-primary transition-colors"
          >
            <span>Question {qi + 1}</span>
            {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>

          <div className="flex gap-1">
            <Button size="icon" variant="ghost" disabled={qi === 0} onClick={() => onMove("up")}>
              <ArrowUp className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              disabled={qi === quizLength - 1}
              onClick={() => onMove("down")}
            >
              <ArrowDown className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="destructive" onClick={onRemove}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              key="content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="pt-3 space-y-4">
                <div className="p-1">
                  <Input
                    value={q.text}
                    placeholder="Enter question"
                    onChange={(e) => onQuestionChange("text", e.target.value)}
                  />
                  {showErrors && !q.text.trim() && <p className="text-sm text-red-500 mt-1">Required.</p>}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-end gap-2 w-full">
                  <div className="sm:w-1/2 w-full p-1">
                    <Label className="mb-1 block">Points</Label>
                    <Input
                      type="number"
                      min={1}
                      value={q.points}
                      onChange={(e) =>
                        onQuestionChange("points", parseInt(e.target.value) || 1)
                      }
                    />
                  </div>

                  <div className="sm:w-1/2 w-full p-1">
                    <Label className="mb-1 block">Answer Selection</Label>
                    <Select
                      value={q.type}
                      onValueChange={(v) => onTypeChange(v as Question["type"])}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="multiple-choice-single">Single</SelectItem>
                        <SelectItem value="multiple-choice-multiple">Multiple</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>


                <div className="space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <Label className="whitespace-nowrap">Choices <span className="text-red-500">*</span></Label>
                    <Button size="sm" variant="outline" onClick={onChoiceAdd}>
                      <PlusCircle className="w-4 h-4 mr-1" /> Add Choice
                    </Button>
                  </div>

                  {q.choices.map((c: Choice, ci: number) => (
                    <ChoiceItem
                      key={c.id}
                      q={q}
                      c={c}
                      ci={ci}
                      showErrors={showErrors}
                      onChange={(f, v) => onChoiceChange(c.id, f, v)}
                      onMove={(dir) => onChoiceMove(c.id, dir)}
                      onRemove={() => onChoiceRemove(c.id)}
                    />
                  ))}
                </div>

                <div className="p-1">
                  <Label className="mb-2">Explanation (optional)</Label>
                  <Textarea
                  className="mb-2"
                    placeholder="Provide an explanation"
                    value={q.explanation}
                    onChange={(e) => onQuestionChange("explanation", e.target.value)}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

// ================== Main Create Component ==================
const Create: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

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
    if (id) {
      const stored = JSON.parse(localStorage.getItem("quizzes") || "[]") as Quiz[];
      const existing = stored.find((q) => q.id === id);

      if (existing) {
        // Define your default quiz structure
        const defaultQuiz: Quiz = {
          id: uuidv4(),
          title: "",
          description: "",
          createdAt: new Date().toISOString(),
          questions: [],
          config: { revealMode: "instant" },
        };

        // Merge defaults for any missing keys (deep merge for nested config)
        const merged: Quiz = {
          ...defaultQuiz,
          ...existing,
          config: {
            ...defaultQuiz.config,
            ...(existing.config || {}),
          },
        };

        // Update local copy if modified (optional but keeps storage consistent)
        const updated = stored.map((q) => (q.id === id ? merged : q));
        localStorage.setItem("quizzes", JSON.stringify(updated));

        setQuiz(merged);
      } else {
        alert("Quiz not found.");
        navigate("/");
      }
    } else handleAddQuestion();
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

  const handleSave = () => {
    setShowErrors(true);
    if (!quiz.title.trim()) return toast.error("Title required.");
    if (!quiz.description.trim()) return toast.error("Description required.");
    if (!quiz.questions.length) {
      handleAddQuestion();
      toast.error("At least one question required.");
      return;
    }

    const stored = JSON.parse(localStorage.getItem("quizzes") || "[]") as Quiz[];
    if (id) {
      const updated = stored.map((q) =>
        q.id === id ? { ...quiz, updatedAt: new Date().toISOString() } : q
      );
      localStorage.setItem("quizzes", JSON.stringify(updated));
      toast.success("Quiz updated successfully.");
    } else {
      localStorage.setItem("quizzes", JSON.stringify([...stored, quiz]));
      toast.success("Quiz saved successfully.");
    }

    navigate("/");
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
