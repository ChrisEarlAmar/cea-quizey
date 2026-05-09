import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Upload, FileJson, CheckCircle2, XCircle } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import type { Quiz as QuizData, Choice, Question } from "@/utils/types";
import { useQuizDB } from "@/hooks/useQuizDB"; // ✅ import Dexie hook

interface ImportQuizProps {
  onSuccess?: () => void;
}

const ImportQuizComponent: React.FC<ImportQuizProps> = ({ onSuccess }) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [open, setOpen] = useState(false);

  const { saveQuiz } = useQuizDB(); // ✅ use Dexie hook

  const resetStates = () => {
    setFileName(null);
    setIsDragging(false);
    setMessage(null);
    setSuccess(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validateQuiz = (data: any): data is Omit<QuizData, "id" | "createdAt"> => {
    if (!data || typeof data !== "object") return false;
    if (typeof data.title !== "string" || !data.title.trim()) return false;
    if (!Array.isArray(data.questions) || data.questions.length === 0) return false;

    for (const q of data.questions as Question[]) {
      if (!q.id || typeof q.id !== "string") return false;
      if (!q.text || typeof q.text !== "string") return false;
      if (!["multiple-choice-single", "multiple-choice-multiple"].includes(q.type))
        return false;
      if (!Array.isArray(q.choices) || q.choices.length < 2) return false;

      for (const c of q.choices as Choice[]) {
        if (!c.id || typeof c.id !== "string") return false;
        if (!c.text || typeof c.text !== "string") return false;
      }

      if (q.type === "multiple-choice-single") {
        const correctCount = (q.choices as Choice[]).filter((c) => c.isCorrect).length;
        if (correctCount !== 1) return false;
      }
    }

    return true;
  };

  const handleImport = async (jsonData: any) => {
    if (!validateQuiz(jsonData)) {
      setMessage("Invalid quiz format. Check your QZY file structure.");
      toast.error("Invalid quiz format. Check your QZY file structure.");
      setSuccess(false);
      setOpen(false);
      resetStates();
      return;
    }

    const newQuiz: QuizData = {
      id: uuidv4(),
      title: jsonData.title,
      description: jsonData.description || "",
      questions: jsonData.questions,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      config: jsonData.config || { revealMode: "instant" },
    };

    try {
      await saveQuiz(newQuiz);
      setMessage("Quiz imported successfully!");
      setSuccess(true);
      toast.success("Quiz imported successfully!");
      onSuccess?.();
      setOpen(false);
      resetStates();
    } catch (error) {
      console.error("Failed to import quiz:", error);
      setMessage("Error saving quiz to local database.");
      setSuccess(false);
      toast.error("Error saving quiz to local database.");
    }
  };

  const handleFileSelect = (file: File) => {
    if (!file.name.toLowerCase().endsWith(".qzy")) {
      setMessage("Please upload a valid .qzy quiz file.");
      toast.error("Please upload a valid .qzy quiz file.");
      setSuccess(false);
      return;
    }

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const json = JSON.parse(reader.result as string);
        handleImport(json);
      } catch {
        setMessage("Invalid QZY file contents.");
        setSuccess(false);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  return (
    <div className="w-full">
      <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) resetStates(); }}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full flex items-center justify-center gap-2">
            <Upload className="w-4 h-4" />
            <span>Import Quiz</span>
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-md overflow-hidden">
          <DialogHeader>
            <DialogTitle>Import Quiz (.qzy)</DialogTitle>
          </DialogHeader>

          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            className={cn(
              "flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors w-full max-w-full overflow-hidden",
              isDragging
                ? "border-primary bg-primary/10"
                : "border-muted-foreground/30 hover:border-primary"
            )}
            onClick={() => fileInputRef.current?.click()}
          >
            <FileJson className="w-10 h-10 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                {fileName
                  ? (() => {
                      const parts = fileName.split(".");
                      const ext = parts.pop();
                      const name = parts.join(".");

                      const shortName =
                        name.length > 10 ? name.slice(0, 10) + "…" : name;

                      return `Selected file: ${shortName}.${ext}`;
                    })()
                  : "Drag & drop your .qzy file here or click to browse"}
              </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".qzy"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
              }}
            />
          </div>

          {message && (
            <Alert
              variant={success ? "default" : "destructive"}
              className="mt-4 flex items-center gap-2"
            >
              {success ? (
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              ) : (
                <XCircle className="w-4 h-4 text-red-600" />
              )}
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ImportQuizComponent;
