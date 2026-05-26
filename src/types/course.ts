import type { Lecture } from "./lecture";

export type Course = {
  id: string;
  slug: string;
  title: string;
  description: string;
  level: string;
  thumbnail: string;
  isPremium: boolean;
  lectures: Lecture[];
  tags?: string[];
};
