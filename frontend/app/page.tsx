"use client";
import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "https://memetic-velocity.onrender.com";

interface TrackResult {
  claim_id: number;
  claim_text: string;
  versions_found: number;
  avg_mutation_rate: number;
  velocity: number;
  zscore: number;
  alert: boolean;
}

interface Version {
  id: number;
  text: string;
  source: string;
  source_url: string;
  mutation_score: number;
  created_at: string;
}

const EXAMPLE_CLAIMS = [
  "AI will replace 50% of jobs in the next decade",
  "The Federal Reserve will cut interest rates this year",
  "Big Tech companies are secretly lobbying against AI regulation",
  "The US economy is heading into a recession",
  "Social media algorithms are designed to cause addiction",
];

function getMutationColor(score: number) {
  if (score < 20) return { bg: "bg-emerald-500/20", text: "text-emerald-400", border: "border-emerald-500/30", label: "Stable", hex: "#34d399" };
  if (score < 40) return { bg: "bg-yellow-500/20", text: "text-yellow-400", border: "border-yellow-500/30", label: "Drifting", hex: "#facc15" };
  if (score < 60) return { bg: "bg-orange-500/20", text: "text-orange-400", border: "border-orange-500/30", label: "Mutating", hex: "#fb923c" };
  return { bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/30", label: "High Risk", hex: "#f87171" };
}

function getSourceBadge(source: string) {
  const map: Record<string, { color: string; label: string }> = {
    google_news: { color: "bg-blue-500/20 text-blue-400 border-blue-500/30", label: "Google News" },
    bing_news: { color: "bg-teal-500/20 text-teal-400 border-teal-500/30", label: "Bing News" },
    yahoo_finance: { color: "bg-purple-500/20 text-purple-400 border-purple-500/30", label: "Yahoo Finance" },
  };
  return map[source] || { color: "bg-white/10 text-white/40 border-white/10", label: source };
}

// Animated particle background
function ParticleField() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const particles = [
    { id: 0, x: 74.6, y: 12.4, size: 1.6, duration: 8.7, delay: 3.2 },
    { id: 1, x: 87.3, y: 80.4, size: 1.0, duration: 14.9, delay: 2.8 },
    { id: 2, x: 85.7, y: 45.9, size: 1.6, duration: 13.2, delay: 3.0 },
    { id: 3, x: 15.0, y: 3.8, size: 1.6, duration: 12.0, delay: 0.02 },
    { id: 4, x: 77.0, y: 39.4, size: 2.9, duration: 13.1, delay: 1.2 },
    { id: 5, x: 53.3, y: 31.4, size: 1.5, duration: 10.5, delay: 3.1 },
    { id: 6, x: 53.4, y: 5.5, size: 1.9, duration: 12.6, delay: 2.0 },
    { id: 7, x: 11.0, y: 46.9, size: 1.2, duration: 10.5, delay: 3.2 },
    { id: 8, x: 30.9, y: 58.1, size: 1.4, duration: 11.9, delay: 0.4 },
    { id: 9, x: 62.2, y: 48.7, size: 2.3, duration: 14.0, delay: 0.07 },
    { id: 10, x: 86.6, y: 64.8, size: 2.0, duration: 15.0, delay: 2.0 },
    { id: 11, x: 89.1, y: 7.4, size: 2.7, duration: 17.5, delay: 1.5 },
    { id: 12, x: 99.5, y: 64.8, size: 1.4, duration: 11.7, delay: 3.2 },
    { id: 13, x: 12.9, y: 34.8, size: 2.3, duration: 13.0, delay: 1.7 },
    { id: 14, x: 56.9, y: 14.1, size: 1.2, duration: 15.9, delay: 3.7 },
    { id: 15, x: 66.7, y: 43.8, size: 1.6, duration: 16.8, delay: 4.8 },
    { id: 16, x: 9.7, y: 99.0, size: 1.9, duration: 9.0, delay: 0.6 },
    { id: 17, x: 51.7, y: 95.6, size: 1.5, duration: 8.5, delay: 0.7 },
    { id: 18, x: 13.7, y: 96.2, size: 1.1, duration: 10.9, delay: 0.6 },
    { id: 19, x: 53.4, y: 38.1, size: 2.0, duration: 10.9, delay: 4.4 },
    { id: 20, x: 98.2, y: 39.6, size: 1.7, duration: 8.9, delay: 2.1 },
    { id: 21, x: 73.5, y: 53.7, size: 1.8, duration: 17.3, delay: 3.6 },
    { id: 22, x: 74.0, y: 26.6, size: 2.1, duration: 11.7, delay: 2.7 },
    { id: 23, x: 55.6, y: 51.4, size: 1.4, duration: 13.3, delay: 4.3 },
    { id: 24, x: 56.6, y: 80.5, size: 2.8, duration: 13.8, delay: 4.9 },
    { id: 25, x: 95.2, y: 64.5, size: 1.9, duration: 13.7, delay: 0.8 },
    { id: 26, x: 2.7, y: 39.9, size: 2.2, duration: 9.4, delay: 1.5 },
    { id: 27, x: 25.3, y: 56.0, size: 1.7, duration: 17.4, delay: 2.1 },
    { id: 28, x: 29.6, y: 16.4, size: 1.4, duration: 8.2, delay: 2.8 },
    { id: 29, x: 63.1, y: 6.1, size: 2.4, duration: 14.1, delay: 0.5 },
  ];

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-violet-500/10 animate-pulse"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 20% 50%, rgba(139, 92, 246, 0.05) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(59, 130, 246, 0.05) 0%, transparent 60%)" }} />
    </div>
  );
}

// Animated mutation ring
function MutationRing({ score }: { score: number }) {
  const color = getMutationColor(score);
  const circumference = 2 * Math.PI * 45;
  const progress = (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center py-6">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
          <circle
            cx="50" cy="50" r="45" fill="none"
            stroke={color.hex} strokeWidth="6"
            strokeDasharray={`${progress} ${circumference}`}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 1.5s ease-in-out" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-light ${color.text}`}>{score.toFixed(1)}</span>
          <span className={`text-xs font-mono ${color.text} opacity-70`}>{color.label}</span>
        </div>
      </div>
      <p className="text-xs text-white/30 font-mono mt-2">MUTATION RATE</p>
    </div>
  );
}

// Score explanation panel
function ScoreExplanation() {
  return (
    <div className="bg-white/3 border border-white/8 rounded-2xl p-5 sm:p-6">
      <p className="text-xs text-white/30 font-mono mb-4">HOW TO READ THE SCORES</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-orange-400"></div>
            <p className="text-sm font-medium text-white/80">Mutation Rate</p>
          </div>
          <p className="text-xs text-white/40 leading-relaxed">How much the idea has changed shape from the original. Computed via cosine distance between semantic embeddings. 0 = identical, 100 = completely different meaning.</p>
          <div className="flex gap-2 mt-2 flex-wrap">
            <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded px-2 py-0.5">0–20 Stable</span>
            <span className="text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded px-2 py-0.5">20–40 Drifting</span>
            <span className="text-xs bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded px-2 py-0.5">40–60 Mutating</span>
            <span className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 rounded px-2 py-0.5">60+ High Risk</span>
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-400"></div>
            <p className="text-sm font-medium text-white/80">Velocity</p>
          </div>
          <p className="text-xs text-white/40 leading-relaxed">How many new versions of this idea appeared in the last 24 hours across all tracked sources. High velocity = rapidly spreading narrative.</p>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-violet-400"></div>
            <p className="text-sm font-medium text-white/80">Z-Score Alert</p>
          </div>
          <p className="text-xs text-white/40 leading-relaxed">How statistically unusual the current mutation rate is vs. historical baseline for this claim. Z &gt; 2 triggers an alert — the idea is mutating faster than normal.</p>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackResult | null>(null);
  const [versions, setVersions] = useState<Version[]>([]);
  const [error, setError] = useState("");
  const [loadingStep, setLoadingStep] = useState("");
  const [showExplanation, setShowExplanation] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    if (result) {
      setAnimatedScore(0);
      const target = result.avg_mutation_rate;
      const duration = 1500;
      const steps = 60;
      const increment = target / steps;
      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          setAnimatedScore(target);
          clearInterval(timer);
        } else {
          setAnimatedScore(current);
        }
      }, duration / steps);
      return () => clearInterval(timer);
    }
  }, [result]);

  const trackClaim = async (text: string) => {
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);
    setVersions([]);
    setError("");
    setQuery(text);
    setShowExplanation(false);

    try {
      setLoadingStep("Searching for versions across the web...");
      const res = await axios.post(`${API_URL}/track?text=${encodeURIComponent(text)}&domain=Custom`);
      setResult(res.data);

      setLoadingStep("Fetching version details...");
      const vRes = await axios.get(`${API_URL}/versions/${res.data.claim_id}`);
      setVersions(vRes.data);
    } catch {
      setError("Something went wrong. Make sure the backend is running.");
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  };

  const mutationColor = result ? getMutationColor(result.avg_mutation_rate) : null;

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
      <ParticleField />

      {/* Header */}
      <div className="relative border-b border-white/5 px-4 sm:px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
            <span className="text-violet-400 text-sm">⚡</span>
          </div>
          <span className="font-medium tracking-tight">Memetic Velocity</span>
        </div>
        <span className="text-xs text-white/30 font-mono hidden sm:block">IDEA MUTATION TRACKER</span>
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-8 py-10 sm:py-16">

        {/* Hero */}
        {/* Hero */}
{!result && !loading && (
  <div className="mb-12 text-center">
    <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-1.5 mb-8"
      style={{ animation: "fadeInDown 0.6s ease forwards", opacity: 0 }}>
      <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse"></span>
      <span className="text-xs text-violet-300 font-mono">LIVE SEMANTIC DRIFT DETECTION</span>
    </div>
    <h1 className="text-3xl sm:text-5xl font-light tracking-tight mb-4 leading-tight"
      style={{ animation: "fadeInUp 0.8s ease 0.2s forwards", opacity: 0 }}>
      How fast is this idea<br />
      <span className="text-violet-400">changing shape?</span>
    </h1>
    <p className="text-white/40 text-base sm:text-lg font-light max-w-xl mx-auto"
      style={{ animation: "fadeInUp 0.8s ease 0.4s forwards", opacity: 0 }}>
      Track how narratives mutate as they spread across the internet. Powered by semantic embeddings and cosine distance.
    </p>

    {/* Animated genome visualization */}
    <div className="mt-12 relative h-32 flex items-center justify-center"
      style={{ animation: "fadeIn 1s ease 0.6s forwards", opacity: 0 }}>
      <div className="relative w-64 h-16">
        {/* DNA strand dots */}
        {[0,1,2,3,4,5,6,7].map((i) => (
          <div key={i} className="absolute" style={{ left: `${i * 14}%` }}>
            <div className="w-2 h-2 rounded-full bg-violet-500/60"
              style={{ animation: `dnaFloat 2s ease-in-out ${i * 0.15}s infinite alternate`, position: "absolute", top: 0 }}></div>
            <div className="w-2 h-2 rounded-full bg-blue-500/40"
              style={{ animation: `dnaFloat 2s ease-in-out ${i * 0.15 + 1}s infinite alternate`, position: "absolute", bottom: 0 }}></div>
            <div className="w-px bg-white/10" style={{ height: "64px", position: "absolute", left: "3px" }}></div>
          </div>
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f] via-transparent to-[#0a0a0f]"></div>
    </div>
  </div>
)}
        {/* Search Box */}
        <div className="mb-8">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && trackClaim(query)}
              placeholder="Enter any claim, narrative, or idea to track..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 sm:px-6 py-4 sm:py-5 text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition-all text-base sm:text-lg pr-28 sm:pr-36"
            />
            <button
              onClick={() => trackClaim(query)}
              disabled={loading || !query.trim()}
              className="absolute right-2 sm:right-3 top-2 sm:top-3 bottom-2 sm:bottom-3 px-4 sm:px-6 bg-violet-600 hover:bg-violet-500 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl font-medium transition-all text-sm"
            >
              {loading ? "..." : "Track →"}
            </button>
          </div>
        </div>

        {/* Example Claims */}
        {!result && !loading && (
          <div className="mb-16">
            <p className="text-xs text-white/30 font-mono mb-3">TRY AN EXAMPLE</p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_CLAIMS.map((claim) => (
                <button
                  key={claim}
                  onClick={() => trackClaim(claim)}
                  className="text-sm bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl px-4 py-2 text-white/60 hover:text-white/90 transition-all text-left"
                >
                  {claim}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-flex flex-col items-center gap-6">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full border-2 border-violet-500/20 animate-ping"></div>
                <div className="absolute inset-2 rounded-full border-2 border-violet-500/30 animate-ping" style={{ animationDelay: "0.3s" }}></div>
                <div className="w-full h-full rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin"></div>
              </div>
              <div className="space-y-1">
                <p className="text-white/60 font-mono text-sm">{loadingStep}</p>
                <p className="text-white/20 font-mono text-xs">Computing semantic embeddings...</p>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Results */}
        {result && mutationColor && (
          <div className="space-y-6">

            {/* Claim Header */}
            <div className="bg-white/3 border border-white/8 rounded-2xl p-5 sm:p-6">
              <p className="text-xs text-white/30 font-mono mb-2">TRACKING CLAIM</p>
              <p className="text-base sm:text-lg font-light text-white/90 break-words">"{result.claim_text}"</p>
            </div>

            {/* Score Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-stretch">
              {/* Mutation Ring */}
              <div className={`${mutationColor.bg} border ${mutationColor.border} rounded-2xl flex flex-col items-center justify-center`}>
                <MutationRing score={animatedScore} />
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-5 sm:p-6">
                <p className="text-xs font-mono text-white/40 mb-2">VELOCITY</p>
                <p className="text-4xl font-light text-blue-400">{result.velocity.toFixed(0)}</p>
                <p className="text-sm mt-1 text-blue-400/70">versions / 24h</p>
                <div className="mt-4 flex gap-1">
                  {Array.from({ length: Math.min(result.velocity, 10) }).map((_, i) => (
                    <div key={i} className="flex-1 h-1 rounded-full bg-blue-400/60" style={{ animationDelay: `${i * 0.1}s` }}></div>
                  ))}
                  {Array.from({ length: Math.max(0, 10 - result.velocity) }).map((_, i) => (
                    <div key={i} className="flex-1 h-1 rounded-full bg-white/10"></div>
                  ))}
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6">
                <p className="text-xs font-mono text-white/40 mb-2">VERSIONS FOUND</p>
                <p className="text-4xl font-light text-white/80">{result.versions_found}</p>
                <p className="text-sm mt-1 text-white/30">across sources</p>
                <div className="mt-4 grid grid-cols-3 gap-1">
                  {Array.from({ length: Math.min(result.versions_found, 9) }).map((_, i) => (
                    <div key={i} className="h-1.5 rounded-full bg-white/20"></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Alert */}
            {result.alert && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-start gap-3">
                <span className="text-red-400 text-lg shrink-0 animate-pulse">⚠</span>
                <p className="text-red-300 text-sm">High mutation alert — this narrative is changing shape faster than its historical baseline (Z-score: {result.zscore.toFixed(2)})</p>
              </div>
            )}

            {/* Score Explanation Toggle */}
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="w-full py-3 bg-white/3 hover:bg-white/5 border border-white/8 rounded-2xl text-white/40 hover:text-white/60 transition-all text-xs font-mono"
            >
              {showExplanation ? "▲ HIDE SCORE EXPLANATION" : "▼ WHAT DO THESE SCORES MEAN?"}
            </button>

            {showExplanation && <ScoreExplanation />}

            {/* Version Cards */}
            {versions.length > 0 && (
              <div>
                <p className="text-xs text-white/30 font-mono mb-4">VERSIONS FOUND ACROSS THE WEB</p>
                <div className="space-y-3">
                  {versions.slice(0, 10).map((v) => {
                    const vc = getMutationColor(v.mutation_score);
                    const badge = getSourceBadge(v.source);
                    return (
                      <div key={v.id} className="bg-white/3 border border-white/8 hover:border-white/15 rounded-xl p-4 transition-all">
                        <div className="flex items-start justify-between gap-3 min-w-0">
                          <div className="flex-1 min-w-0">
                            <p className="text-white/70 text-sm font-light leading-relaxed break-words">
                              {v.text.slice(0, 150)}{v.text.length > 150 ? "..." : ""}
                            </p>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              <span className={`text-xs border rounded px-2 py-0.5 ${badge.color}`}>{badge.label}</span>
                              {v.source_url && (
                                <a
                                  href={v.source_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-violet-400/60 hover:text-violet-400 transition-colors font-mono underline underline-offset-2 truncate max-w-[200px]"
                                >
                                  View source →
                                </a>
                              )}
                            </div>
                          </div>
                          <div className={`shrink-0 ${vc.bg} border ${vc.border} rounded-lg px-3 py-1.5 text-center min-w-[70px]`}>
                            <p className={`text-xs font-mono ${vc.text}`}>{v.mutation_score.toFixed(1)}</p>
                            <p className={`text-xs ${vc.text} opacity-60`}>{vc.label}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Track Another */}
            <button
              onClick={() => { setResult(null); setVersions([]); setQuery(""); setShowExplanation(false); }}
              className="w-full py-4 bg-white/5 hover:bg-white/8 border border-white/10 rounded-2xl text-white/50 hover:text-white/80 transition-all text-sm font-mono"
            >
              ← TRACK ANOTHER CLAIM
            </button>

          </div>
        )}
      </div>
    </main>
  );
}
