"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowRight, MousePointerClick, Scale, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const WHY = [
  {
    icon: "/icons/price.png",
    title: "Price & value",
    body: "Starting price, ₹/sq.ft and ranges — normalised so the best value rises.",
  },
  {
    icon: "/icons/amenities.png",
    title: "Amenities & life",
    body: "Pool, gym, clubhouse, security, sports, co-working — matched side by side.",
  },
  {
    icon: "/icons/investment.png",
    title: "Investment ROI",
    body: "Appreciation, rental yield and demand feed a transparent investment score.",
  },
];

const STEPS = [
  { n: "1", icon: MousePointerClick, label: "Select 2–4 homes" },
  { n: "2", icon: Scale, label: "Compare side-by-side" },
  { n: "3", icon: Sparkles, label: "Get your best pick" },
];

export function Showcase() {
  return (
    <section
      id="why-compare"
      className="relative overflow-hidden border-t border-border py-16 md:py-20"
    >
      <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-accent/10 blur-[120px]" />
      <div className="container relative">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-bold uppercase tracking-[0.2em] text-accent">
            Why compare
          </span>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-primary dark:text-foreground sm:text-4xl">
            Every reason a home wins — on one screen.
          </h2>
        </div>

        {/* Tilt cards */}
        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          {WHY.map((b) => (
            <TiltCard key={b.title} icon={b.icon} title={b.title} body={b.body} />
          ))}
        </div>

        {/* How it works strip */}
        <div
          id="how-it-works"
          className="mt-12 flex flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-card/60 p-5 backdrop-blur sm:flex-row sm:gap-2"
        >
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <React.Fragment key={s.n}>
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 font-display text-sm font-extrabold text-accent">
                    {s.n}
                  </span>
                  <span className="flex items-center gap-1.5 text-sm font-semibold">
                    <Icon className="h-4 w-4 text-accent" />
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <ArrowRight className="hidden h-4 w-4 text-muted-foreground sm:block" />
                )}
              </React.Fragment>
            );
          })}
          <Link href="/properties" className="sm:ml-4">
            <Button variant="accent" size="sm" className="group">
              Try it
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

/** A card that tilts in 3D toward the cursor. */
function TiltCard({
  icon,
  title,
  body,
}: {
  icon: string;
  title: string;
  body: string;
}) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [11, -11]), {
    stiffness: 150,
    damping: 14,
  });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-11, 11]), {
    stiffness: 150,
    damping: 14,
  });

  const onMove = (e: React.MouseEvent) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <div style={{ perspective: 900 }} onMouseMove={onMove} onMouseLeave={onLeave}>
      <motion.div
        style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        className="group h-full rounded-2xl border border-border bg-card p-6 shadow-glass transition-shadow hover:shadow-lift"
      >
        <div
          style={{ transform: "translateZ(40px)" }}
          className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-muted transition-colors group-hover:bg-accent/10"
        >
          <Image
            src={icon}
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 object-contain"
          />
        </div>
        <h3
          style={{ transform: "translateZ(28px)" }}
          className="font-display text-lg font-bold text-primary dark:text-foreground"
        >
          {title}
        </h3>
        <p
          style={{ transform: "translateZ(18px)" }}
          className="mt-2 text-sm leading-relaxed text-muted-foreground"
        >
          {body}
        </p>
      </motion.div>
    </div>
  );
}
