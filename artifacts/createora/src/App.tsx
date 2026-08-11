import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ArrowRight, Check, ChevronDown, CircleArrowUp, Clock3, FileText, Layers3, Lightbulb, Menu, MessageSquareText, Palette, Play, Plus, Sparkles, Target, WandSparkles, X, Zap } from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();

const navItems = [
  { href: '#how-it-works', label: 'How it works' },
  { href: '#capabilities', label: 'Capabilities' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#faq', label: 'FAQ' },
];

const faqs = [
  {
    question: 'Is Createora another writing assistant?',
    answer: 'Not quite. Createora is the creative layer between an idea and the finished piece. It helps you find the angle, shape the story, and adapt it for every channel while keeping your voice intact.',
  },
  {
    question: 'Can I teach it our brand voice?',
    answer: 'Yes. Add your voice notes, examples, audience details, and visual references once. Createora uses that context to make every output feel like it came from your team, not a template library.',
  },
  {
    question: 'What can I make with Createora?',
    answer: 'Campaign concepts, social series, landing pages, launch emails, briefs, scripts, newsletters, and the small pieces of copy that keep a brand moving. Start with one thought and spin it into a whole system.',
  },
  {
    question: 'Will it replace my creative team?',
    answer: 'Createora is built to give good people more surface area for good work. It handles the blank page and the repetitive adaptation, so your team can spend more time on taste, strategy, and the decisions that matter.',
  },
  {
    question: 'Can I try it before committing?',
    answer: 'Absolutely. The Starter workspace is free to explore, and a live demo is available for teams who want to see Createora working with their own brand context.',
  },
];

function LogoMark() {
  return (
    <span className="wordmark-mark" aria-hidden="true">
      <Sparkles size={15} strokeWidth={2.5} />
    </span>
  );
}

function Wordmark() {
  return (
    <a className="wordmark" href="#top" data-testid="link-wordmark">
      <LogoMark />
      <span>Createora</span>
    </a>
  );
}

function SignupModal({ onClose }: { onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="signup-title">
        <button className="modal-close" onClick={onClose} aria-label="Close sign up dialog" data-testid="button-close-signup">
          <X size={17} />
        </button>
        {submitted ? (
          <div className="success-state">
            <div className="success-icon"><Check size={25} /></div>
            <span className="eyebrow">You’re on the list</span>
            <h2 id="signup-title">The blank page just got nervous.</h2>
            <p>We’ll send your invite and a small spark of inspiration to {email}.</p>
            <button className="btn btn-primary" onClick={onClose} data-testid="button-finish-signup">Back to Createora</button>
          </div>
        ) : (
          <>
            <span className="eyebrow">Early access · 01</span>
            <h2 id="signup-title">Make something worth sharing.</h2>
            <p>Tell us where to send your invite. No pitch deck required.</p>
            <form className="modal-form" onSubmit={(event) => { event.preventDefault(); setSubmitted(true); }}>
              <label htmlFor="signup-name">Your name
                <input id="signup-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Maya Chen" required data-testid="input-signup-name" />
              </label>
              <label htmlFor="signup-email">Work email
                <input id="signup-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="maya@studio.co" required data-testid="input-signup-email" />
              </label>
              <button type="submit" className="btn btn-primary" data-testid="button-submit-signup">Request an invite <ArrowRight size={16} /></button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function Navigation({ onSignup }: { onSignup: () => void }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <header className="nav-shell" id="top">
      <div className="container-wide">
        <nav className="nav" aria-label="Main navigation">
          <Wordmark />
          <div className={`nav-links ${mobileOpen ? 'mobile-open' : ''}`}>
            {navItems.map((item) => (
              <a href={item.href} key={item.href} onClick={() => setMobileOpen(false)} data-testid={`link-nav-${item.label.toLowerCase().replaceAll(' ', '-')}`}>{item.label}</a>
            ))}
          </div>
          <div className="nav-actions">
            <a className="btn btn-ghost" href="#pricing" data-testid="link-nav-pricing">See plans</a>
            <button className="btn btn-primary" onClick={onSignup} data-testid="button-nav-signup">Get early access <ArrowRight size={14} /></button>
            <button className="mobile-toggle" onClick={() => setMobileOpen((value) => !value)} aria-label={mobileOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileOpen} data-testid="button-mobile-menu">
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </nav>
        <div className="announcement"><strong>NEW</strong> Your next best idea is closer than you think <ArrowRight size={13} /></div>
      </div>
    </header>
  );
}

function Hero({ onSignup }: { onSignup: () => void }) {
  return (
    <>
      <section className="hero">
        <div className="container-wide hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">A creative partner, on call</span>
            <h1 className="display-xl">From <em>hmm</em> to<br />hell yes.</h1>
            <p className="lede">Createora turns the messy middle of an idea into polished, on-brand content your audience actually wants to spend time with.</p>
            <div className="hero-buttons">
              <button className="btn btn-primary" onClick={onSignup} data-testid="button-hero-signup">Start creating free <ArrowRight size={16} /></button>
              <a className="btn btn-ghost" href="#how-it-works" data-testid="link-hero-how-it-works"><Play size={15} fill="currentColor" /> See how it works</a>
            </div>
            <div className="hero-note"><Clock3 size={14} /> Your first idea, sharpened in under 60 seconds.</div>
          </div>
          <div className="hero-art" aria-label="Createora content editor preview" role="img">
            <div className="art-frame">
              <div className="art-top"><span>CREATEORA / WORKSPACE</span><span className="art-dots"><i /><i /><i /></span></div>
              <div className="editor-window">
                <aside className="editor-sidebar">
                  <div className="mini-brand">createora</div>
                  <span className="active">Spark board</span>
                  <span>Brand voice</span>
                  <p>Workspace</p>
                  <span>Campaigns</span>
                  <span>Saved ideas</span>
                  <p>Learn</p>
                  <span>Playbook</span>
                </aside>
                <div className="editor-main">
                  <span className="mini-overline">Spark board / launch week</span>
                  <h3>Make room<br />for the good stuff.</h3>
                  <div className="type-line" /><div className="type-line short" /><div className="type-line tiny" />
                  <div className="editor-card">
                    <strong><WandSparkles size={12} /> CREATEORA SUGGESTS</strong>
                    <p>Turn the “we should…” thought into a story people can see themselves in.</p>
                  </div>
                  <div className="editor-chips"><span>BRAND FIT 98%</span><span>3 DIRECTIONS</span></div>
                </div>
              </div>
            </div>
            <div className="floating-sticker"><CircleArrowUp size={20} /> <span>make<br />it matter</span></div>
          </div>
        </div>
      </section>
      <div className="marquee" aria-label="Createora features">
        <div className="marquee-track">
          {[0, 1].map((group) => (
            <div className="marquee-item" key={group}><span>Ideas with a pulse</span><b>✳</b><span>Voice, not vibes</span><b>✳</b><span>Less blank page</span><b>✳</b><span>More good work</span><b>✳</b></div>
          ))}
        </div>
      </div>
    </>
  );
}

function Proof() {
  return (
    <section className="proof">
      <div className="container-wide proof-row">
        <p>Built for small teams with big taste, from first spark to final send.</p>
        <div className="logo-list" aria-label="Customer logos"><span>FIELDNOTE</span><span>commonroom</span><span>STUDIO/37</span><span>verygood</span></div>
      </div>
    </section>
  );
}

function Story() {
  const steps = [
    { number: '01 / START', title: 'Bring the half-formed thought.', copy: 'Drop in a voice note, a messy brief, or a sentence you cannot stop thinking about. Rough is welcome.', icon: <Lightbulb size={18} /> },
    { number: '02 / SHAPE', title: 'Find the thread worth pulling.', copy: 'Createora spots the strongest angle, gives it shape, and opens up a few directions you would not have found alone.', icon: <Target size={18} /> },
    { number: '03 / SEND', title: 'Make it yours, everywhere.', copy: 'Turn one sharp idea into a whole set of on-brand pieces, ready for the channels where your people are.', icon: <Zap size={18} /> },
  ];
  return (
    <section className="story" id="how-it-works">
      <div className="container-wide">
        <div className="section-label eyebrow">The Createora method</div>
        <div className="story-intro">
          <h2 className="display-md">The good stuff is usually hiding in the <span style={{ color: 'hsl(var(--accent))' }}>almost.</span></h2>
          <p className="lede">Most tools help you make more. Createora helps you find the thing worth making in the first place.</p>
        </div>
        <div className="steps">
          {steps.map((step) => <article className="step" key={step.number}><div className="step-num"><span>{step.number}</span>{step.icon}</div><h3>{step.title}</h3><p>{step.copy}</p></article>)}
        </div>
      </div>
    </section>
  );
}

function Capabilities() {
  const capabilities = [
    { title: 'Start anywhere', copy: 'Brief, brain dump, or voice note. Good ideas do not arrive in a form.', icon: <MessageSquareText size={17} /> },
    { title: 'Keep your voice', copy: 'Teach Createora what on-brand actually sounds like for your team.', icon: <Palette size={17} /> },
    { title: 'Build the system', copy: 'One idea becomes the campaign, the post, the email, and the useful bits between.', icon: <Layers3 size={17} /> },
    { title: 'Make the call', copy: 'Compare directions side by side and move forward with taste, not guesswork.', icon: <CircleArrowUp size={17} /> },
  ];
  return (
    <section className="capabilities" id="capabilities">
      <div className="container-wide">
        <div className="section-label eyebrow">Your unfair creative advantage</div>
        <div className="cap-head"><h2 className="display-md">Less prompting.<br /><span style={{ color: 'hsl(var(--primary))' }}>More instinct.</span></h2><p>Createora does not bury the magic under a hundred settings. It gives your thinking somewhere to go — then gets out of the way.</p></div>
        <div className="cap-grid">
          <div className="cap-list">{capabilities.map((item) => <article className="cap-item" key={item.title}><span className="cap-icon">{item.icon}</span><div><h3>{item.title}</h3><p>{item.copy}</p></div></article>)}</div>
          <div className="cap-demo">
            <div className="demo-card">
              <div className="demo-header"><span>NEW CREATIVE / 04</span><button type="button" data-testid="button-demo-refresh"><Sparkles size={13} /> Rework</button></div>
              <span className="prompt-label">Your starting point</span>
              <div className="prompt-box">We want to make work-life boundaries feel less like a productivity hack and more like a form of self-respect.</div>
              <div className="demo-result"><small>CREATEORA / DIRECTION 02</small><h4>The out-of-office is a love letter.</h4><p>A campaign about the small rituals that tell your brain: you are allowed to leave this here. Warm, specific, with a little room to breathe.</p><div className="result-tags"><span>WARM</span><span>HUMAN</span><span>SHAREABLE</span></div></div>
              <div className="demo-footer"><span>Brand fit <strong>98%</strong></span><span>Use this direction <ArrowRight size={13} /></span></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function UseCases() {
  const cases = [
    { label: '01 / LAUNCHES', title: 'Give your next launch a point of view.' },
    { label: '02 / SOCIAL', title: 'Stop posting. Start saying something.' },
    { label: '03 / CONTENT', title: 'Build a backlog with a pulse.' },
    { label: '04 / EMAIL', title: 'Make the inbox feel human again.' },
    { label: '05 / TEAMS', title: 'Get everyone writing from the same page.' },
  ];
  return <section className="use-cases"><div className="container-wide"><div className="section-label eyebrow">One idea, many lives</div><div className="use-head"><h2 className="display-md">Whatever you are making,<br />make it <span style={{ color: 'hsl(var(--primary))' }}>land.</span></h2><p>From the first “what if?” to the final comma, Createora keeps the thread intact.</p></div><div className="case-grid">{cases.map((item) => <article className="case" key={item.label}><div className="case-top"><span>{item.label}</span><ArrowRight size={15} /></div><h3>{item.title}</h3></article>)}</div></div></section>;
}

function Quote() {
  return <section className="quote"><div className="container-wide quote-inner"><div className="quote-mark">“</div><div><blockquote>Createora gives our ideas a little more nerve. We go from “maybe” to a campaign we are proud to put our name on.</blockquote><cite><strong>Rhea Patel</strong><span>Brand lead, Fieldnote</span></cite></div><div className="numbers"><div className="number"><strong>3.4×</strong><span>more directions explored</span></div><div className="number"><strong>11 hrs</strong><span>back each week</span></div></div></div></section>;
}

function Pricing({ onSignup }: { onSignup: () => void }) {
  return <section className="pricing" id="pricing"><div className="container-wide"><div className="section-label eyebrow">Pick your pace</div><div className="pricing-head"><h2 className="display-md">A little help<br />goes a long way.</h2><p>Start small. Bring your whole team when the ideas start arriving faster than the calendar.</p></div><div className="price-grid"><article className="price-card"><h3>Starter</h3><p>For solo makers finding their next good angle.</p><div className="price">$0 <small>/ forever</small></div><ul><li><Check size={15} /> 20 creative sparks per month</li><li><Check size={15} /> 1 brand voice</li><li><Check size={15} /> Idea to social post</li></ul><button className="btn btn-ghost" onClick={onSignup} data-testid="button-pricing-starter">Start for free <ArrowRight size={15} /></button></article><article className="price-card featured"><span className="price-badge">Most loved</span><h3>Studio</h3><p>For small teams who want their best work to travel further.</p><div className="price">$24 <small>/ member / month</small></div><ul><li><Check size={15} /> Unlimited creative directions</li><li><Check size={15} /> 5 brand voices and shared context</li><li><Check size={15} /> Full campaign repurposing</li><li><Check size={15} /> Team review and remix boards</li></ul><button className="btn btn-primary" onClick={onSignup} data-testid="button-pricing-studio">Bring us your ideas <ArrowRight size={15} /></button></article></div></div></section>;
}

function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  return <section className="faq" id="faq"><div className="container-wide faq-layout"><div className="faq-intro"><div className="section-label eyebrow">Questions, answered</div><h2 className="display-md">No fine print.<br />Just <span style={{ color: 'hsl(var(--primary))' }}>good sense.</span></h2><p>Still curious? We like curious. Send a note to hello@createora.co and a real person will write back.</p><a className="btn btn-ghost" href="mailto:hello@createora.co" data-testid="link-email-support">Ask us anything <ArrowRight size={15} /></a></div><div className="faq-list">{faqs.map((faq, index) => { const isOpen = openIndex === index; return <div className="faq-item" key={faq.question}><button className="faq-trigger" onClick={() => setOpenIndex(isOpen ? null : index)} aria-expanded={isOpen} data-testid={`button-faq-${index}`}><span>{faq.question}</span><Plus size={18} /></button><div className={`faq-answer ${isOpen ? 'open' : ''}`}><div><p>{faq.answer}</p></div></div></div>; })}</div></div></section>;
}

function FinalCTA({ onSignup }: { onSignup: () => void }) {
  return <section className="final-cta"><div className="container-wide final-inner"><h2 className="display-lg">Your next great idea is already trying to get your attention.</h2><div><p>Give it a place to land. Createora is ready when you are.</p><button className="btn btn-ink" onClick={onSignup} data-testid="button-final-signup">Open your creative sidekick <ArrowRight size={16} /></button></div></div></section>;
}

function Footer() {
  return <footer className="footer"><div className="container-wide"><div className="footer-top"><div><Wordmark /><small>Less blank page. More good work.</small></div><div className="footer-links"><a href="#how-it-works" data-testid="link-footer-how-it-works">How it works</a><a href="#capabilities" data-testid="link-footer-capabilities">Capabilities</a><a href="#pricing" data-testid="link-footer-pricing">Pricing</a><a href="mailto:hello@createora.co" data-testid="link-footer-contact">Contact</a></div></div><div className="footer-bottom"><span>Createora / A better way in</span><span>© 2025 Createora Studio</span></div></div></footer>;
}

function Home() {
  const [signupOpen, setSignupOpen] = useState(false);
  return <main className="createora-site"><Navigation onSignup={() => setSignupOpen(true)} /><Hero onSignup={() => setSignupOpen(true)} /><Proof /><Story /><Capabilities /><UseCases /><Quote /><Pricing onSignup={() => setSignupOpen(true)} /><FAQ /><FinalCTA onSignup={() => setSignupOpen(true)} /><Footer />{signupOpen && <SignupModal onClose={() => setSignupOpen(false)} />}</main>;
}

function Router() {
  return <RoutedErrorBoundary><Switch><Route path="/" component={Home} /><Route component={NotFound} /></Switch></RoutedErrorBoundary>;
}

function RoutedErrorBoundary({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;