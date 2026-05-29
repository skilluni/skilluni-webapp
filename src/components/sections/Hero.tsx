"use client";

import { useEffect, useRef, useState } from "react";
import { HOME } from "../../constants/home";
import ButtonLink from "../ui/ButtonLink";
import { gsap, registerGsapPlugins } from "../../lib/gsap";

export default function Hero() {
  const { hero } = HOME;
  const sectionRef = useRef<HTMLElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);

  const [isRunning, setIsRunning] = useState(false);
  const [currentLine, setCurrentLine] = useState(0);
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);

  useEffect(() => {
    if (!sectionRef.current) {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    registerGsapPlugins();

    const ctx = gsap.context(() => {
      const introItems = gsap.utils.toArray<HTMLElement>(
        "[data-hero-intro]",
        sectionRef.current
      );

      gsap.fromTo(
        introItems,
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: "power2.out",
          stagger: 0.12,
        }
      );

      if (previewRef.current) {
        gsap.fromTo(
          previewRef.current,
          { y: 32, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: "power2.out",
          }
        );

        gsap.to(previewRef.current, {
          y: -10,
          duration: 3.2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const runCode = () => {
    if (isRunning) {
      return;
    }
    setIsRunning(true);
    setConsoleOutput([]);
    setCurrentLine(0);
  };

  // Autoplay compilation simulation after initial mount delay
  useEffect(() => {
    const timer = setTimeout(() => {
      runCode();
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Interval-driven compiler logs generator
  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const lines = [
      "javac SkillUni.java",
      "java SkillUni",
      "[INFO] Instantiating object: Student you = new Student(\"You\");",
      "[INFO] Injecting elite skills: [Java, OOP, DSA]",
      "[SUCCESS] Object \"You\" compiled with 100/100 board prep!",
      "[STATUS] 2,000+ student objects currently active in the heap."
    ];

    if (currentLine < lines.length) {
      const delay = currentLine === 0 ? 300 : currentLine === 1 ? 550 : currentLine === 2 ? 650 : 450;
      const timer = setTimeout(() => {
        setConsoleOutput((prev) => [...prev, lines[currentLine]]);
        setCurrentLine((prev) => prev + 1);
      }, delay);
      return () => clearTimeout(timer);
    } else {
      setIsRunning(false);
    }
  }, [isRunning, currentLine]);

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-background">
      <div className="mx-auto grid max-w-6xl gap-16 px-6 py-24 md:py-32 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        {/* Left column */}
        <div className="space-y-8">
          <div
            data-hero-intro
            className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface-1 px-4 py-2 text-eyebrow text-ink-muted"
          >
            {hero.eyebrow}
          </div>
          <h1
            data-hero-intro
            className="max-w-xl text-display-xxl tracking-[-0.05em] text-ink"
          >
            {hero.title}
          </h1>
          <p
            data-hero-intro
            className="max-w-xl text-body-lg text-ink-muted"
          >
            {hero.description}
          </p>
          <div data-hero-intro className="flex flex-wrap gap-4">
            <ButtonLink
              href={hero.primaryCta.href}
              label={hero.primaryCta.label}
              size="lg"
            />
            <ButtonLink
              href={hero.secondaryCta.href}
              label={hero.secondaryCta.label}
              size="lg"
              variant="secondary"
              isExternal={hero.secondaryCta.isExternal}
            />
          </div>
        </div>

        {/* Right column: Interactive Animated Java IDE */}
        <div
          ref={previewRef}
          className="rounded-[20px] border border-hairline bg-surface-1 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col h-[480px] w-full relative"
        >
          {/* IDE Title Bar Header */}
          <div className="h-11 border-b border-hairline bg-canvas flex items-center justify-between px-4 select-none shrink-0">
            {/* Top-Left Window Action Dots */}
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
              <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
            </div>

            {/* File Tab */}
            <div className="absolute left-1/2 -translate-x-1/2 text-caption font-mono text-ink-muted text-xs border-r border-l border-hairline bg-[#141414] h-11 flex items-center px-4 gap-2">
              <span className="text-[#a393ff]">☕</span>
              <span>SkillUni.java</span>
            </div>

            {/* Run Action Trigger */}
            <button
              onClick={runCode}
              disabled={isRunning}
              className={`flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold font-sans uppercase tracking-wider rounded-full border transition-all cursor-pointer ${
                isRunning
                  ? "bg-neutral-800 text-neutral-500 border-neutral-700 pointer-events-none"
                  : "bg-white text-black hover:bg-neutral-200 border-white active:scale-95"
              }`}
            >
              <span className="text-xs">▶</span>
              <span>Run</span>
            </button>
          </div>

          {/* Java Code Editor Workspace */}
          <div className="p-5 flex-1 overflow-y-auto bg-[#0d0d0d]/80 text-[11px] sm:text-xs leading-relaxed font-mono overflow-x-auto whitespace-pre select-all text-neutral-300">
            {/* Line 1 */}
            <div className="flex gap-4">
              <span className="text-neutral-700 select-none w-5 text-right">1</span>
              <span className="text-neutral-500 italic">// Defining classroom blueprint</span>
            </div>
            {/* Line 2 */}
            <div className="flex gap-4">
              <span className="text-neutral-700 select-none w-5 text-right">2</span>
              <span>
                <span className="text-[#ff7a3d]">public</span> <span className="text-[#ff7a3d]">class</span> <span className="text-[#a393ff]">SkillUni</span> {"{"}
              </span>
            </div>
            {/* Line 3 */}
            <div className="flex gap-4">
              <span className="text-neutral-700 select-none w-5 text-right">3</span>
              <span>
                {"  "}<span className="text-[#0099ff]">String</span> mission = <span className="text-[#22c55e]">"Inject Elite Skills"</span>;
              </span>
            </div>
            {/* Line 4 */}
            <div className="flex gap-4">
              <span className="text-neutral-700 select-none w-5 text-right">4</span>
              <span></span>
            </div>
            {/* Line 5 */}
            <div className="flex gap-4">
              <span className="text-neutral-700 select-none w-5 text-right">5</span>
              <span>
                {"  "}<span className="text-[#ff7a3d]">void</span> <span className="text-[#0099ff]">empower</span>(<span className="text-[#a393ff]">Student</span> student) {"{"}
              </span>
            </div>
            {/* Line 6 */}
            <div className="flex gap-4">
              <span className="text-neutral-700 select-none w-5 text-right">6</span>
              <span>
                {"    "}student.<span className="text-[#ff5577]">score</span> = <span className="text-[#ff5577] font-semibold">100</span>;
              </span>
            </div>
            {/* Line 7 */}
            <div className="flex gap-4">
              <span className="text-neutral-700 select-none w-5 text-right">7</span>
              <span>
                {"    "}student.<span className="text-[#0099ff]">skills</span>.<span className="text-[#0099ff]">addAll</span>(<span className="text-[#22c55e]">"Java"</span>, <span className="text-[#22c55e]">"OOP"</span>, <span className="text-[#22c55e]">"DSA"</span>);
              </span>
            </div>
            {/* Line 8 */}
            <div className="flex gap-4">
              <span className="text-neutral-700 select-none w-5 text-right">8</span>
              <span>
                {"    "}<span className="text-[#a393ff]">System</span>.out.println(student.name + <span className="text-[#22c55e]">" compiled!"</span>);
              </span>
            </div>
            {/* Line 9 */}
            <div className="flex gap-4">
              <span className="text-neutral-700 select-none w-5 text-right">9</span>
              <span>
                {"  "}{"}"}
              </span>
            </div>
            {/* Line 10 */}
            <div className="flex gap-4">
              <span className="text-neutral-700 select-none w-5 text-right">10</span>
              <span></span>
            </div>
            {/* Line 11 */}
            <div className="flex gap-4">
              <span className="text-neutral-700 select-none w-5 text-right">11</span>
              <span>
                {"  "}<span className="text-[#ff7a3d]">public</span> <span className="text-[#ff7a3d]">static</span> <span className="text-[#ff7a3d]">void</span> <span className="text-[#0099ff]">main</span>(<span className="text-[#a393ff]">String</span>[] args) {"{"}
              </span>
            </div>
            {/* Line 12 */}
            <div className="flex gap-4">
              <span className="text-neutral-700 select-none w-5 text-right">12</span>
              <span>
                {"    "}<span className="text-[#a393ff]">SkillUni</span> skilluni = <span className="text-[#ff7a3d]">new</span> <span className="text-[#a393ff]">SkillUni</span>();
              </span>
            </div>
            {/* Line 13 */}
            <div className="flex gap-4">
              <span className="text-neutral-700 select-none w-5 text-right">13</span>
              <span>
                {"    "}<span className="text-[#a393ff]">Student</span> you = <span className="text-[#ff7a3d]">new</span> <span className="text-[#a393ff]">Student</span>(<span className="text-[#22c55e]">"You"</span>);
              </span>
            </div>
            {/* Line 14 */}
            <div className="flex gap-4">
              <span className="text-neutral-700 select-none w-5 text-right">14</span>
              <span></span>
            </div>
            {/* Line 15 */}
            <div className="flex gap-4">
              <span className="text-neutral-700 select-none w-5 text-right">15</span>
              <span>
                {"    "}skilluni.<span className="text-[#0099ff]">empower</span>(you);
              </span>
            </div>
            {/* Line 16 */}
            <div className="flex gap-4">
              <span className="text-neutral-700 select-none w-5 text-right">16</span>
              <span>
                {"  "}{"}"}
              </span>
            </div>
            {/* Line 17 */}
            <div className="flex gap-4">
              <span className="text-neutral-700 select-none w-5 text-right">17</span>
              <span>
                {"}"}
              </span>
            </div>
          </div>

          {/* IDE Interactive Compiler Console Tab */}
          <div className="h-[140px] bg-black border-t border-hairline p-4 font-mono text-[10px] sm:text-xs overflow-y-auto flex flex-col gap-1.5 shrink-0 select-text">
            {/* Header / Tab Indicator */}
            <div className="flex items-center justify-between pb-1.5 border-b border-hairline-soft mb-1 select-none shrink-0">
              <span className="text-caption uppercase tracking-[0.1em] text-neutral-500 font-bold">Terminal Output</span>
              <span className="text-[10px] text-[#22c55e] flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full bg-[#22c55e] ${isRunning ? "animate-pulse" : ""}`} />
                <span>{isRunning ? "compiling..." : "idle"}</span>
              </span>
            </div>

            {/* Simulated Live Logs */}
            <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto">
              {consoleOutput.length === 0 && (
                <div className="text-neutral-600 italic">Click "Run" in the header to execute SkillUni.java...</div>
              )}
              
              {consoleOutput.map((line, idx) => {
                if (line.startsWith("javac") || line.startsWith("java")) {
                  return (
                    <div key={idx} className="flex gap-2">
                      <span className="text-neutral-500 select-none">$</span>
                      <span className="text-white">{line}</span>
                    </div>
                  );
                }
                if (line.startsWith("[INFO]")) {
                  return (
                    <div key={idx} className="flex gap-2 text-neutral-400">
                      <span className="text-[#0099ff] font-semibold select-none">[INFO]</span>
                      <span>{line.replace("[INFO] ", "")}</span>
                    </div>
                  );
                }
                if (line.startsWith("[SUCCESS]")) {
                  return (
                    <div key={idx} className="flex gap-2 text-white">
                      <span className="text-[#22c55e] font-bold select-none">[SUCCESS]</span>
                      <span className="font-semibold">{line.replace("[SUCCESS] ", "")}</span>
                    </div>
                  );
                }
                if (line.startsWith("[STATUS]")) {
                  return (
                    <div key={idx} className="flex gap-2 text-neutral-300">
                      <span className="text-[#a393ff] font-bold select-none">[STATUS]</span>
                      <span className="text-neutral-300">{line.replace("[STATUS] ", "")}</span>
                    </div>
                  );
                }
                return <div key={idx}>{line}</div>;
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
