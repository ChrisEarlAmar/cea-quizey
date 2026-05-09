import { type FC, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Search,
  AlertCircle,
  PlusCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuizDB } from "@/hooks/useQuizDB";
import ImportQuizComponent from "./components/import-quiz-component";
import QuizCard from "./components/quiz-card";
// import { type Quiz } from "@/utils/types";

const Home: FC = () => {
  const navigate = useNavigate();

  const { quizzes, deleteQuiz } = useQuizDB();
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ Handle filtered results
  const filteredQuizzes = (quizzes ?? []).filter((quiz) =>
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ✅ Handlers
  const handleEdit = (id: string) => navigate(`/create/${id}`);
  const handlePlay = (id: string) => navigate(`/play/${id}`);
  const handleCreate = () => navigate("/create");

  const handleDelete = async (id: string) => {
    await deleteQuiz(id);
    toast.success("Quiz deleted successfully!");
  };

  const handleExport = async (id: string) => {
    const quiz = (quizzes ?? []).find((q) => q.id === id);
    if (!quiz) {
      toast.error("Quiz not found.");
      return;
    }

    const filename = `${
      quiz.title.trim().toLowerCase().replace(/[^\w\d-_]+/g, "_") || "quiz"
    }.qzy`;

    const json = JSON.stringify(quiz, null, 2);
    const blob = new Blob([json], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-4">
      {/* 🔹 Top Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-full lg:w-1/4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="Search quizzes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 sm:ml-auto w-full sm:w-auto">
          <Button
            onClick={handleCreate}
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Quiz</span>
          </Button>

          {/* ⚙️ Import Button (refetch handled by Dexie automatically) */}
          <ImportQuizComponent
            // onSuccess={() => toast.success("Quiz imported successfully!")}
          />
        </div>
      </div>

      {/* 🔹 Quizzes Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {filteredQuizzes.length > 0 ? (
          filteredQuizzes.map((quiz) => (
            <QuizCard
              key={quiz.id}
              id={quiz.id}
              title={quiz.title}
              description={quiz.description}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onPlay={handlePlay}
              onExport={handleExport}
            />
          ))
        ) : (
          <div className="col-span-full w-full">
            {searchTerm.trim() ? (
              <div className="w-full text-center text-muted-foreground py-10 bg-muted/20 rounded-md">
                No quizzes found for “{searchTerm}”.
              </div>
            ) : (
              <Card className="w-full border-dashed text-center shadow-sm bg-muted/30">
                <CardHeader>
                  <div className="flex flex-col items-center gap-2">
                    <AlertCircle className="h-8 w-8 text-muted-foreground" />
                    <CardTitle>No quizzes yet</CardTitle>
                  </div>
                  <CardDescription>
                    You haven’t created any quizzes. Start by making your first one!
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center pb-6">
                  <Button onClick={handleCreate}>Create Quiz</Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
