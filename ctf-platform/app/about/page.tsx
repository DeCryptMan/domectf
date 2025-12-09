import { Shield, Target, FileCode, Server } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-bg text-text-main font-sans">
      <div className="max-w-4xl mx-auto px-6 py-20">
        
        {/* Header */}
        <div className="border-b border-border pb-8 mb-12">
          <div className="text-xs font-mono text-accent mb-2">CLASSIFICATION: PUBLIC</div>
          <h1 className="text-4xl font-bold text-white tracking-tight mb-4">PLATFORM ARCHITECTURE & MISSION</h1>
          <p className="text-lg text-text-muted">
            The CyberDome is a national-grade training environment designed to identify and cultivate elite cybersecurity talent.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid md:grid-cols-2 gap-12">
          
          <div className="space-y-8">
            <section>
              <h3 className="flex items-center gap-2 text-white font-bold mb-3">
                <Target className="w-5 h-5 text-accent" />
                01. OBJECTIVE
              </h3>
              <p className="text-sm text-text-muted leading-relaxed text-justify">
                To simulate real-world Advanced Persistent Threats (APTs) in a controlled, isolated network. Participants engage in offensive and defensive maneuvers (Red/Blue Teaming) to secure critical infrastructure assets.
              </p>
            </section>

            <section>
              <h3 className="flex items-center gap-2 text-white font-bold mb-3">
                <Shield className="w-5 h-5 text-accent" />
                02. RULES OF ENGAGEMENT
              </h3>
              <ul className="text-sm text-text-muted space-y-2 font-mono list-disc list-inside">
                <li>Do not attack the platform infrastructure.</li>
                <li>Brute-forcing flags is strictly prohibited.</li>
                <li>Collaboration between teams is forbidden.</li>
                <li>Denial of Service (DoS) is out of scope.</li>
              </ul>
            </section>
          </div>

          <div className="space-y-8">
            <section>
              <h3 className="flex items-center gap-2 text-white font-bold mb-3">
                <FileCode className="w-5 h-5 text-accent" />
                03. TECHNICAL STACK
              </h3>
              <div className="bg-panel border border-border p-4 font-mono text-xs text-text-muted">
                <div className="flex justify-between border-b border-border/50 pb-2 mb-2">
                  <span>CORE</span>
                  <span className="text-white">Next.js 14 (App Router)</span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-2 mb-2">
                  <span>DATABASE</span>
                  <span className="text-white">MySQL 8.0 / Prisma ORM</span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-2 mb-2">
                  <span>SECURITY</span>
                  <span className="text-white">AES-256 / Bcrypt / JWT</span>
                </div>
                <div className="flex justify-between">
                  <span>DEPLOY</span>
                  <span className="text-white">Edge Runtime Capable</span>
                </div>
              </div>
            </section>

            <section>
              <h3 className="flex items-center gap-2 text-white font-bold mb-3">
                <Server className="w-5 h-5 text-accent" />
                04. INFRASTRUCTURE
              </h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Challenges are deployed as isolated containers. The scoring engine operates atomically to prevent race conditions during high-load flag submissions.
              </p>
            </section>
          </div>

        </div>

        {/* Footer Action */}
        <div className="mt-20 pt-8 border-t border-border flex justify-between items-center">
          <Link href="/" className="text-sm font-mono text-text-muted hover:text-white transition-colors">
            ← RETURN TO HOME
          </Link>
          <Link href="/auth/register" className="px-6 py-3 bg-white text-bg font-bold text-sm hover:bg-accent hover:text-white transition-colors">
            ACCEPT MISSION
          </Link>
        </div>

      </div>
    </div>
  );
}