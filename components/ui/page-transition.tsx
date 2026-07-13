import { type ReactNode, ViewTransition } from "react";

type PageTransitionProps = {
  children: ReactNode;
};

/** Opt-in directional navigation for list-to-detail page relationships. */
export function PageTransition({ children }: PageTransitionProps) {
  return (
    <ViewTransition
      default="none"
      enter={{
        "nav-back": "nav-back",
        "nav-forward": "nav-forward",
        default: "none",
      }}
      exit={{
        "nav-back": "nav-back",
        "nav-forward": "nav-forward",
        default: "none",
      }}
    >
      {children}
    </ViewTransition>
  );
}
