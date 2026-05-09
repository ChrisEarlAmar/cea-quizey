import { type FC } from "react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Play, Download } from "lucide-react";


interface QuizCardProps {
    id: string;
    title: string;
    description: string;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onPlay: (id: string) => void;
    onExport: (id: string) => void;
}

const QuizCard: FC<QuizCardProps> = ({
  id,
  title,
  description,
  onEdit,
  onDelete,
  onPlay,
  onExport,
}) => {

  const DeleteComnfirmDialog = () => {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="destructive"
            size="sm"
            className="flex items-center gap-1"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Delete</span>
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this quiz in your list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                onDelete?.(id);
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  };

  return (
    <Card
      key={id}
      className="flex flex-col justify-between shadow-none"
    >
      <CardHeader>
        <CardTitle className="truncate">{title}</CardTitle>
        <CardDescription className="line-clamp-2 text-sm text-muted-foreground">
          {description}
        </CardDescription>
      </CardHeader>

      <CardFooter className="flex flex-wrap justify-start sm:justify-end gap-2">
        {/* Delete - leftmost, destructive */}
        <DeleteComnfirmDialog />

        {/* Edit - secondary */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit?.(id)}
          className="flex items-center gap-1"
        >
          <Pencil className="w-4 h-4" />
          <span className="hidden sm:inline">Edit</span>
        </Button>

        {/* Export - secondary */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onExport?.(id)}
          className="flex items-center gap-1"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export</span>
        </Button>

        {/* Play - primary/rightmost */}
        <Button
          size="sm"
          onClick={() => onPlay?.(id)}
          className="flex items-center gap-1"
        >
          <Play className="w-4 h-4" />
          <span className="hidden sm:inline">Play</span>
        </Button>
      </CardFooter>

    </Card>
  );
};

export default QuizCard;
