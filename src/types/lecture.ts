export type Lecture = {
  id: string;
  order: number;
  slug: string;
  title: string;
  description: string;
  videoUrl: string;
  notesUrl: string;
  quizUrl?: string;
  duration: string;
  isLocked: boolean;
  completed?: boolean;
};
