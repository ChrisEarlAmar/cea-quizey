import { memo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {Trash2, ArrowUp, ArrowDown } from "lucide-react";
import ErrorText from "./error-text-component";
import type { Question, Choice } from  "@/utils/types";

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

export default ChoiceItem;
