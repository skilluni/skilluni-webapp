"use client";

import { useAuth } from "../providers/AuthProvider";
import ButtonLink from "../ui/ButtonLink";
import { COURSES_PAGE } from "../../constants/coursesPage";

export default function CoursesHeroCta() {
  const { user } = useAuth();

  if (user) return null;

  return (
    <ButtonLink
      href={COURSES_PAGE.hero.primaryCta.href}
      label={COURSES_PAGE.hero.primaryCta.label}
      size="lg"
      cursorText="Join"
      dataCursor="link"
      isMagnetic
    />
  );
}
