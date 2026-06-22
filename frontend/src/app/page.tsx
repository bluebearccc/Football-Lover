import Link from 'next/link';
import dynamic from 'next/dynamic';

const ShaderBackground = dynamic(() => import('@/components/landing/ShaderBackground'), {
  ssr: false,
});
const FootballHero = dynamic(() => import('@/components/landing/FootballHero'), {
  ssr: false,
});

export default function LandingPage() {
  return (
    <div className="bg-surface text-on-surface font-body-lg antialiased overflow-x-hidden selection:bg-primary/30 selection:text-primary min-h-screen">
      <ShaderBackground />
      <div className="relative z-10 flex flex-col min-h-screen">
        <main className="flex-grow flex flex-col">
          {/* Section 1: Hero */}
          <section className="relative w-full min-h-[921px] flex items-center justify-center pt-24 pb-16 px-margin-mobile md:px-margin-desktop overflow-hidden">
            <FootballHero />
            <div className="relative z-10 max-w-5xl w-full flex flex-col items-center text-center space-y-8 mt-12 animate-fade-in-up">
              <div className="inline-flex items-center space-x-2 bg-surface/40 border border-white/10 rounded-full px-4 py-1.5 backdrop-blur-xl mb-4">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_12px_rgba(75,226,119,0.9)]" />
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
                  Live Platform Version 2.0 Released
                </span>
              </div>

              <h1 className="font-display-lg text-display-lg md:text-[64px] md:leading-[72px] text-on-surface max-w-4xl tracking-tight">
                Master the Game. <br />
                <span className="gradient-text">Predict the Glory.</span>
              </h1>

              <p className="font-body-lg text-body-lg md:text-[20px] md:leading-[32px] text-on-surface-variant max-w-2xl">
                Dominate the leaderboard with real-time football predictions fueled by AI-powered
                insights. Track every possession, analyze the stats, and turn your sports knowledge
                into prestige.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 w-full sm:w-auto">
                <Link
                  href="/register"
                  className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-on-primary font-headline-md text-headline-md py-4 px-8 rounded-lg shadow-[0_0_25px_rgba(34,197,94,0.5)] transition-all transform hover:scale-105 text-center"
                >
                  Start Predicting Now
                </Link>
                <Link
                  href="#live-preview"
                  className="w-full sm:w-auto bg-surface/40 border border-primary text-primary hover:bg-primary/10 font-headline-md text-headline-md py-4 px-8 rounded-lg backdrop-blur-xl transition-colors text-center"
                >
                  Explore Matches
                </Link>
              </div>

              {/* Social Proof */}
              <div className="mt-12 flex items-center gap-4 text-on-surface-variant">
                <div className="flex -space-x-3">
                  <img
                    className="w-10 h-10 rounded-full border-2 border-surface object-cover"
                    alt="User avatar"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDlQXHAD7U54Ifvczga5GbpyHBfUxkoZ1xOm9Ka2FpItwxvp7wQ45vlC1Y3Wbt9E6ineNesF4nVQCT_DHg1WRlZbHuJFMSea8DiRdck7_B3hbMD6pf4QSnxISJU1rJIStAcW4LSuE_REqIBi6ZYlDV4OgLQag3-xwBMjqrKIlMKEdrDP7XuA0DbNEsWOOKHJRoDTe_IV4jCDQfKDBQnuROZTvBDUOmaJOt2vvA3av_JfYGNQTpeA0W2EVyl5znkdBNgtZxYpuhOFeNT"
                  />
                  <img
                    className="w-10 h-10 rounded-full border-2 border-surface object-cover"
                    alt="User avatar"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCaHC6qwjCuWltG_aRte-4M_qdd_AokaPu1zzirKTu3f-KQ-nt6gL_2uaHrtSOn7MfYOPajA7TpMYV59GyM5j4KgblGF_9HM4-zvGAG0qy2a1pHK-x61SrX047RNLfGJmXIWrUif67ifcuVoJSlvU9O9LVD_cgGHC3r_vPMZgaK1il-scXq5xqAOcjq_uRMVquQT-gvhr9b0puvKh0895HftDcDy8ExkTDDnxLuGjm5eOpdi9-KFHclPfDGC_gqP8FovfycfixveINY"
                  />
                  <img
                    className="w-10 h-10 rounded-full border-2 border-surface object-cover"
                    alt="User avatar"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCZMC2O-TQUKqmtl2PBP2EfFMbEEzASUyQHkIs80iV4ebwX6a3CuIh4cPTa0ey5MtNoMs7mi777W8Wm34wNjTAQ3EkQq1cmJaenUk8pMpB8yDrpCH0MJj4gZq2OCjIll6gFKhbC2n-4_9Q2_g01C-tiMFGGsVJ4iFuYhZPVoBg99evvYovMeQGCPdtoBc8XHEpkc8cLdxzzzoDxQ3IuM8PjObmgq-B7L_-d9Y9UwZ8MSpY588i-U1HwAhvfvl1lXjDrb-QAV6qmn1ts"
                  />
                  <div className="w-10 h-10 rounded-full border-2 border-surface bg-surface-container-highest flex items-center justify-center font-label-caps text-label-caps text-primary z-10">
                    +50k
                  </div>
                </div>
                <div className="font-body-sm text-body-sm flex flex-col items-start">
                  <div className="flex text-tertiary">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  </div>
                  <span className="text-on-surface-variant">Top Rated Sports App</span>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Live Preview */}
          <section id="live-preview" className="w-full py-16 px-margin-mobile md:px-margin-desktop relative">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h2 className="font-headline-lg text-headline-lg text-on-surface">Live Now</h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                    Real-time match data flowing from top leagues.
                  </p>
                </div>
                <Link
                  href="#"
                  className="text-primary font-data-mono text-data-mono hover:underline flex items-center gap-1"
                >
                  View All Live{' '}
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
              </div>

              <div className="flex overflow-x-auto gap-widget-gap pb-6 snap-x snap-mandatory scrollbar-hide">
                {/* Live Match Card 1 */}
                <div className="min-w-[320px] md:min-w-[400px] glass-card rounded-xl p-card-padding flex flex-col snap-start live-glow relative animate-fade-in-right stagger-1">
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="font-label-caps text-label-caps text-primary">LIVE 67&apos;</span>
                  </div>
                  <div className="absolute top-4 right-4 font-label-caps text-label-caps text-on-surface-variant bg-surface-container-high/40 px-2 py-1 rounded">
                    PREMIER LEAGUE
                  </div>
                  <div className="flex justify-between items-center mt-8 mb-6">
                    <div className="flex flex-col items-center gap-2 w-1/3">
                      <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center p-2 bg-surface/20">
                        <img
                          className="w-full h-full object-contain"
                          alt="Chelsea FC logo"
                          src="https://crests.football-data.org/61.png"
                        />
                      </div>
                      <span className="font-headline-md text-headline-md text-on-surface">CHE</span>
                    </div>
                    <div className="w-1/3 flex flex-col items-center justify-center">
                      <span className="font-display-lg text-display-lg text-on-surface leading-none tracking-tighter">
                        2 - 1
                      </span>
                    </div>
                    <div className="flex flex-col items-center gap-2 w-1/3">
                      <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center p-2 bg-surface/20">
                        <img
                          className="w-full h-full object-contain"
                          alt="Arsenal FC logo"
                          src="https://crests.football-data.org/57.png"
                        />
                      </div>
                      <span className="font-headline-md text-headline-md text-on-surface">ARS</span>
                    </div>
                  </div>
                  <div className="mt-auto pt-4 border-t border-white/10 w-full">
                    <div className="flex justify-between font-label-caps text-label-caps text-on-surface-variant mb-2">
                      <span>Home Win Probability</span>
                      <span className="text-primary">64%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: '64%' }} />
                    </div>
                  </div>
                </div>

                {/* Live Match Card 2 */}
                <div className="min-w-[320px] md:min-w-[400px] glass-card rounded-xl p-card-padding flex flex-col snap-start animate-fade-in-right stagger-2">
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="font-label-caps text-label-caps text-primary">LIVE 12&apos;</span>
                  </div>
                  <div className="absolute top-4 right-4 font-label-caps text-label-caps text-on-surface-variant bg-surface-container-high/40 px-2 py-1 rounded">
                    LA LIGA
                  </div>
                  <div className="flex justify-between items-center mt-8 mb-6">
                    <div className="flex flex-col items-center gap-2 w-1/3">
                      <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center p-2 bg-surface/20">
                        <img
                          className="w-full h-full object-contain"
                          alt="Real Madrid logo"
                          src="https://crests.football-data.org/86.png"
                        />
                      </div>
                      <span className="font-headline-md text-headline-md text-on-surface">RMA</span>
                    </div>
                    <div className="w-1/3 flex flex-col items-center justify-center">
                      <span className="font-display-lg text-display-lg text-on-surface leading-none tracking-tighter">
                        0 - 0
                      </span>
                    </div>
                    <div className="flex flex-col items-center gap-2 w-1/3">
                      <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center p-2 bg-surface/20">
                        <img
                          className="w-full h-full object-contain"
                          alt="Atletico Madrid logo"
                          src="https://crests.football-data.org/78.png"
                        />
                      </div>
                      <span className="font-headline-md text-headline-md text-on-surface">ATM</span>
                    </div>
                  </div>
                  <div className="mt-auto pt-4 border-t border-white/10 w-full">
                    <div className="flex justify-between font-label-caps text-label-caps text-on-surface-variant mb-2">
                      <span>Draw Probability</span>
                      <span className="text-secondary">45%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-secondary" style={{ width: '45%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Bento Grid Features */}
          <section className="w-full py-20 px-margin-mobile md:px-margin-desktop">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16 max-w-2xl mx-auto">
                <h2 className="font-headline-lg text-headline-lg text-on-surface mb-4">
                  Precision Engineered for Analysts
                </h2>
                <p className="font-body-lg text-body-lg text-on-surface-variant">
                  We don&apos;t just show scores. We deliver granular data, turning every match into a
                  predictive battlefield where insight conquers luck.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-widget-gap">
                {/* Large Feature 1 */}
                <div className="md:col-span-2 glass-card rounded-xl p-8 flex flex-col justify-between relative overflow-hidden group animate-scale-up stagger-1">
                  <div className="absolute inset-0 z-0 bg-gradient-to-br from-white/5 to-transparent opacity-50 group-hover:opacity-80 transition-opacity" />
                  <div className="relative z-10 w-full md:w-2/3 mb-8">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center mb-6">
                      <span
                        className="material-symbols-outlined text-primary text-[28px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        query_stats
                      </span>
                    </div>
                    <h3 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-3">
                      Real-time Analytics Engine
                    </h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Track possession zones, expected goals (xG), and momentum shifts instantly. Our
                      data stream updates at 50ms intervals, ensuring you never miss a predictive edge.
                    </p>
                  </div>
                  <div className="relative z-10 w-full h-32 flex items-end gap-2 px-4 opacity-70">
                    <div className="w-full bg-white/10 rounded-t-sm h-[20%]" />
                    <div className="w-full bg-white/10 rounded-t-sm h-[40%]" />
                    <div className="w-full bg-primary/40 border border-primary/50 rounded-t-sm h-[75%] relative live-glow">
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 font-data-mono text-data-mono text-primary text-[10px]">
                        xG Spike
                      </div>
                    </div>
                    <div className="w-full bg-white/10 rounded-t-sm h-[30%]" />
                    <div className="w-full bg-white/10 rounded-t-sm h-[50%]" />
                  </div>
                </div>

                {/* Small Feature 1 */}
                <div className="glass-card rounded-xl p-8 flex flex-col relative group overflow-hidden animate-scale-up stagger-2">
                  <div className="absolute inset-0 bg-white/5 group-hover:bg-white/10 transition-colors z-0" />
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-lg bg-secondary/10 border border-secondary/30 flex items-center justify-center mb-6">
                      <span
                        className="material-symbols-outlined text-secondary text-[28px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        leaderboard
                      </span>
                    </div>
                    <h3 className="font-headline-md text-headline-md text-on-surface mb-3">
                      Global Leaderboards
                    </h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mb-6">
                      Rise through the ranks. Earn exclusive badges by predicting high-risk underdog
                      victories.
                    </p>
                    <div className="bg-surface/20 border border-white/10 rounded-lg p-3 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-data-mono text-[12px] text-tertiary">#1</span>
                          <span className="font-data-mono text-[12px] text-on-surface">AlexD</span>
                        </div>
                        <span className="font-data-mono text-[12px] text-primary">14.2k</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-data-mono text-[12px] text-on-surface-variant">#2</span>
                          <span className="font-data-mono text-[12px] text-on-surface">You</span>
                        </div>
                        <span className="font-data-mono text-[12px] text-on-surface">12.8k</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Small Feature 2 */}
                <div className="glass-card rounded-xl p-8 flex flex-col justify-between animate-scale-up stagger-3">
                  <div className="w-12 h-12 rounded-lg bg-tertiary/10 border border-tertiary/30 flex items-center justify-center mb-6">
                    <span
                      className="material-symbols-outlined text-tertiary text-[28px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      target
                    </span>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-on-surface mb-3">
                    Deep Prop Markets
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Don&apos;t just predict the winner. Call the first goalscorer, exact corner counts,
                    and yellow cards for maximum points.
                  </p>
                </div>

                {/* Wide Feature 2 */}
                <div className="md:col-span-2 glass-card rounded-xl p-0 overflow-hidden relative min-h-[250px] flex items-center animate-scale-up stagger-1">
                  <div
                    className="absolute inset-0 z-0 bg-black opacity-40"
                    style={{
                      backgroundImage:
                        "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB-BwuqHXo3Uiot6Mi85LBoqct6Kyj09eA_kaUzm2MGWypnBogCMosso7VFiUp9F5DExyZnzIxLq5XapjKsCUWG5b-UStF0xBUOymIHHyJiPvroESqm3-Y4ROQbQJP3ja_dnnAMKX6XVfgWuew97LyiKGkeZDVWmOJNCK2lGJ4L7OQrgYG41I9LBZQTJJLksYlkppRiLVtpSMJSCrS_1kMW0on3Ssk8FYQZPY4Vdm3PsCp_aWemgPNm0ryR9q4R0UmRr6-39ZgMWl6k')",
                      backgroundSize: 'cover',
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-surface/80 via-surface/60 to-transparent z-10" />
                  <div className="relative z-20 p-8 w-full md:w-1/2">
                    <span className="inline-block px-3 py-1 bg-surface/40 border border-white/10 text-on-surface font-label-caps text-[10px] rounded mb-4">
                      PRO FEATURE
                    </span>
                    <h3 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-3">
                      AI Predictor Bot
                    </h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mb-6">
                      Need a second opinion? Unlock our proprietary machine learning model trained on a
                      decade of match data to guide your toughest calls.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: How it Works */}
          <section className="w-full py-20 px-margin-mobile md:px-margin-desktop border-y border-white/5">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="font-headline-lg text-headline-lg text-on-surface">The Path to Pro</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                {/* Connecting Line */}
                <div className="hidden md:block absolute top-12 left-[16.6%] right-[16.6%] h-[2px] bg-white/5 z-0">
                  <div className="h-full w-1/3 bg-primary opacity-30 shadow-[0_0_15px_rgba(34,197,94,0.6)]" />
                </div>

                {/* Step 1 */}
                <div className="relative z-10 flex flex-col items-center text-center animate-fade-in-up stagger-1">
                  <div className="w-24 h-24 rounded-full bg-surface/40 border border-white/10 backdrop-blur-xl flex items-center justify-center mb-6 shadow-lg">
                    <span className="material-symbols-outlined text-[40px] text-on-surface-variant">
                      search
                    </span>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-on-surface mb-2">
                    1. Choose a Match
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant max-w-xs">
                    Scan the live schedule. Identify mismatches, analyze form, and select your target
                    battleground.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="relative z-10 flex flex-col items-center text-center animate-fade-in-up stagger-2">
                  <div className="w-24 h-24 rounded-full bg-surface/40 border-2 border-primary backdrop-blur-xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(34,197,94,0.4)] relative">
                    <div className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-20" />
                    <span
                      className="material-symbols-outlined text-[40px] text-primary"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      insights
                    </span>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-on-surface mb-2">
                    2. Make the Call
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant max-w-xs">
                    Submit your predictions before kickoff, or trade live props as the action unfolds
                    on the pitch.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="relative z-10 flex flex-col items-center text-center animate-fade-in-up stagger-3">
                  <div className="w-24 h-24 rounded-full bg-surface/40 border border-white/10 backdrop-blur-xl flex items-center justify-center mb-6 shadow-lg">
                    <span
                      className="material-symbols-outlined text-[40px] text-tertiary"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      emoji_events
                    </span>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-on-surface mb-2">
                    3. Earn &amp; Climb
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant max-w-xs">
                    Accurate calls generate points. Watch your global rank soar and unlock elite
                    analyst tiers.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 5: CTA Footer */}
          <section className="w-full py-24 px-margin-mobile md:px-margin-desktop relative overflow-hidden flex flex-col items-center justify-center text-center">
            <div
              className="absolute inset-0 z-0 opacity-10"
              style={{
                backgroundImage: 'radial-gradient(circle at center, #4be277 0%, transparent 60%)',
              }}
            />
            <div className="relative z-10 max-w-2xl flex flex-col items-center">
              <h2 className="font-display-lg text-[40px] leading-[48px] text-on-surface mb-6">
                Ready to Join the Elite?
              </h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant mb-10">
                Stop watching from the sidelines. Step into the arena and prove your football intellect
                against thousands worldwide.
              </p>
              <Link
                href="/register"
                className="bg-primary hover:bg-primary/90 text-on-primary font-headline-md text-headline-md py-4 px-12 rounded-xl shadow-[0_0_30px_rgba(34,197,94,0.6)] transition-all transform hover:scale-105 flex items-center gap-3"
              >
                Create Free Account
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  arrow_forward
                </span>
              </Link>
              <p className="font-label-caps text-label-caps text-on-surface-variant mt-6">
                No credit card required. Web &amp; Mobile app access.
              </p>
            </div>
          </section>
        </main>

        <footer className="w-full py-8 border-t border-white/5 bg-surface/20 backdrop-blur-xl text-center">
          <div className="max-w-7xl mx-auto px-margin-desktop flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="font-headline-md text-headline-md font-bold text-primary opacity-80">
              GoalPredict Live
            </div>
            <div className="flex gap-6 font-body-sm text-body-sm text-on-surface-variant">
              <Link href="#" className="hover:text-primary transition-colors">Terms</Link>
              <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-primary transition-colors">Support</Link>
            </div>
            <div className="font-body-sm text-body-sm text-on-surface-variant/50">
              &copy; 2024 GP Analytics Inc. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
