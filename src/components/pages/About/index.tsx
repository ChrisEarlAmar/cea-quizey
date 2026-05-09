import { type FC } from "react";
import { Card, CardContent, CardHeader, CardTitle, /* CardDescription */ } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { FileJson, PlusCircle, Play } from "lucide-react";

const About: FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center p-6 md:p-12 space-y-8">
      <h1 className="text-4xl font-bold text-center">Welcome to Quizey</h1>
      <p className="text-center text-muted-foreground max-w-2xl">
        Quizey is a lightweight, no-login quiz app that lets you create, import, and play quizzes quickly. 
        You can build multiple-choice quizzes with either single-selection or multiple-selection questions.
      </p>

      <div className="flex flex-col md:flex-row gap-4 w-full max-w-5xl">
        <Card className="w-full md:w-1/3 border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlusCircle className="w-5 h-5" /> Create Quizzes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Build quizzes directly in Quizey using our intuitive form builder. Add multiple-choice questions, 
              define correct answers, and set point values for each question.
            </p>
          </CardContent>
        </Card>

        <Card className="w-full md:w-1/3 border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileJson className="w-5 h-5" /> Import Quizzes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Import existing quizzes using the <code>.qzy</code> format. Quickly load quizzes shared or exported 
              from other Quizey instances.
            </p>
          </CardContent>
        </Card>

        <Card className="w-full md:w-1/3 border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="w-5 h-5" /> Play & Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Start quizzes immediately, select answers, and see your results. Supports both single and multiple 
              selections, with instant or review mode feedback.
            </p>
          </CardContent>
        </Card>
      </div>

      <p className="text-center text-muted-foreground max-w-2xl">
        Quizey requires no login — everything is stored locally in your browser. Export your quizzes as 
        <code>.qzy</code> files to share or backup. Perfect for educators, students, or anyone who wants 
        a quick and simple quiz experience.
      </p>

        <div className="flex flex-col md:flex-row justify-center items-center gap-4 w-full">
            <Button
                onClick={() => navigate("/create")}
                className="flex items-center justify-center gap-2 w-full md:w-auto"
            >
                <PlusCircle className="w-4 h-4" />
                Create a Quiz
            </Button>

            <Button
                onClick={() => navigate("/")}
                className="flex items-center justify-center gap-2 w-full md:w-auto"
                variant="outline"
            >
                <Play className="w-4 h-4" />
                Play Quizzes
            </Button>
        </div>
    </div>
  );
};

export default About;
