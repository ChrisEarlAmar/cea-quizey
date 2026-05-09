import { useState, memo } from "react";
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
import { Label } from "@/components/ui/label";
import { PlusCircle, Trash2, ArrowUp, ArrowDown, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import ChoiceItem from "./choice-item-component";
import type { Question, Choice } from  "@/utils/types";

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
                <Button
                    type="button"
                    onClick={() => setCollapsed((c) => !c)}
                    className="flex items-center gap-2 text-primary text-base sm:text-lg font-semibold bg-transparent hover:bg-transparent hover:text-primary transition-colors"
                >
                    <span>Question {qi + 1}</span>
                    {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </Button>

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
                            <div className="p-1">
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

                            <div className="flex-1 p-1">
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

export default QuestionCard;
