import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  noPad?:    boolean;
}

export function Card({ children, noPad = false, className, ...rest }: CardProps): JSX.Element {
  return (
    <div className={cn("bg-white border border-slate-200 rounded-xl shadow-sm", !noPad && "p-5", className)} {...rest}>
      {children}
    </div>
  );
}

interface SectionProps extends HTMLAttributes<HTMLDivElement> { children: ReactNode }

function Header({ className, children, ...rest }: SectionProps): JSX.Element {
  return <div className={cn("px-5 py-4 border-b border-slate-100", className)} {...rest}>{children}</div>;
}
function Body({ className, children, ...rest }: SectionProps): JSX.Element {
  return <div className={cn("px-5 py-4", className)} {...rest}>{children}</div>;
}
function Footer({ className, children, ...rest }: SectionProps): JSX.Element {
  return <div className={cn("px-5 py-3 border-t border-slate-100 bg-slate-50/60 rounded-b-xl", className)} {...rest}>{children}</div>;
}

Card.Header = Header;
Card.Body   = Body;
Card.Footer = Footer;
