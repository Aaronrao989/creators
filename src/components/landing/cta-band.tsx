import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";

export function CtaBand() {
  return (
    <section className="container pb-8">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-[hsl(274_52%_28%)] px-8 py-14 text-primary-foreground md:px-16 md:py-20">
          <div className="pointer-events-none absolute -right-10 -top-10 h-72 w-72 rounded-full bg-accent/25 blur-[110px]" />
          <Image
            src="/art/support.png"
            alt=""
            width={480}
            height={360}
            className="pointer-events-none absolute -bottom-6 right-6 hidden w-72 opacity-90 lg:block"
          />
          <div className="relative max-w-xl">
            <h2 className="font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
              Stop second-guessing. Start comparing.
            </h2>
            <p className="mt-4 text-primary-foreground/80">
              Shortlist a few properties and let Creators Home rank them on the
              things that actually matter — in under two minutes.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/properties">
                <Button variant="accent" size="lg" className="group">
                  Start Comparing Now
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <a href="tel:+919252996677">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/25 bg-white/5 text-white hover:bg-white/10"
                >
                  Talk to an expert
                </Button>
              </a>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
