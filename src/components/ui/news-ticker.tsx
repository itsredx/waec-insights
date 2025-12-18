"use client"

import { cn } from "@/lib/utils";
import Link from "next/link";

export function NewsTicker({ className }: { className?: string }) {
  return (
    <div className={cn("bg-primary text-primary-foreground fixed bottom-0 left-0 w-full h-10 flex items-center z-50 overflow-hidden", className)}>
      <div className="ticker-wrapper">
        <div className="ticker-content">
          {[...Array(3)].map((_, i) => (
            <span key={i} className="font-headline-ticker px-8">
              Built by{" "}
              <Link
                href="https://red-x.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-accent transition-colors"
              >
                RED X
              </Link>{" "}
              at NCDMB AI/ML & B.D.A Training Kano
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
