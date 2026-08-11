import { useEffect, useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  ArrowRight,
  Check,
  ChevronDown,
  Clock3,
  FileText,
  Image as ImageIcon,
  Layers3,
  Menu,
  MessageSquareText,
  MonitorPlay,
  Palette,
  Play,
  Plus,
  Quote,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Video,
  WandSparkles,
  X,
  Zap,
} from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();

const navItems = [
  { href: '#tools', label: 'Create' },
  { href: '#workflow', label: 'How it works' },
  { href: '#proof', label: 'Creators' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#faq', label: 'FAQ' },
];

const faqs = [
  {
    question: 'What makes Createora different from a prompt box?',
    answer: 'Createora is a complete creative studio. Milo keeps your brief, style, formats, and unfinished thoughts in one place so every output feels connected, not randomly generated.',
  },
  {
    question: 'Can I use my own brand style?',
    answer: 'Yes. Save your visual references, words to use, words to avoid, colors, and examples in a Brand DNA profile. Createora carries that context from a first script to the final social cut.',
  },
  {
    question: 'What can I make inside Createora?',
    answer: 'Short-form video concepts, images, scripts, social series, campaign systems, thumbnails, launch kits, and reusable templates. Start with one idea, then let Milo help you take it somewhere.',
  },
  {
    question: 'Is Milo a chatbot?',
    answer: 'Milo is your creative co-pilot, not a customer service bot. He is there to give you a stronger first draft, spot the sharpest angle, and keep momentum when the blank canvas gets loud.',
  },
  {
    question: 'Can I try it before paying?',
    answer: 'Yes. The free workspace includes a generous set of monthly generations and every core creation tool. No credit card is needed to start.',
  },
];

type SignupModalProps = { onClose: () => void; intent?: string };

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

function SignupModal({ onClose, intent = 'your next idea' }: SignupModalProps) {
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
        <div className="modal-glow" aria-hidden="true" />
        <button className="modal-close" onClick={onClose} aria-label="Close sign up dialog" data-testid="button-close-signup">
          <X size={17} />
        </button>
        {submitted ? (
          <div className="success-state">
            <div className="success-icon"><Check size={25} /></div>
            <span className="eyebrow">Access request received</span>
            <h2 id="signup-title">Milo is warming up.</h2>
            <p>We’ll send your invite and a small spark of inspiration to {email}.</p>
            <button className="btn btn-primary" onClick={onClose} data-testid="button-finish-signup">Back to Createora <ArrowRight size={16} /></button>
          </div>
        ) : (
          <>
            <span className="eyebrow">Createora studio · 01</span>
            <h2 id="signup-title">Make {intent}.</h2>
            <p>Join the creator workspace where a rough thought can become a finished piece before lunch.</p>
            <form className="modal-form" onSubmit={(event) => { event.preventDefault(); setSubmitted(true); }}>
              <label htmlFor="signup-name">Your name
                <input id="signup-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Maya Chen" required data-testid="input-signup-name" />
              </label>
              <label htmlFor="signup-email">Work email
                <input id="signup-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="maya@studio.co" required data-testid="input-signup-email" />
              </label>
              <button type="submit" className="btn btn-primary" data-testid="button-submit-signup">Enter the studio <ArrowRight size={16} /></button>
            </form>
            <div className="modal-footnote"><ShieldCheck size={14} /> No credit card. No noise.</div>
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
            <a className="btn btn-ghost nav-login" href="#pricing" data-testid="link-nav-pricing">See plans</a>
            <button className="btn btn-primary nav-cta" onClick={onSignup} data-testid="button-nav-signup">Start creating <ArrowRight size={14} /></button>
            <button className="mobile-toggle" onClick={() => setMobileOpen((value) => !value)} aria-label={mobileOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileOpen} data-testid="button-mobile-menu">
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </nav>
        <div className="announcement"><span className="live-dot" /> Milo just learned a new way to remix your ideas <ArrowRight size={13} /></div>
      </div>
    </header>
  );
}

function Milo({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`milo-wrap ${compact ? 'milo-compact' : ''}`} aria-label="Milo, the Createora fox mascot" role="img">
      <div className="milo-aura" aria-hidden="true" />
      <svg className="milo-svg" viewBox="0 0 360 390" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="milo-fur" x1="70" y1="30" x2="300" y2="350" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F3B5FF" />
            <stop offset=".48" stopColor="#A957F4" />
            <stop offset="1" stopColor="#5A2BB5" />
          </linearGradient>
          <linearGradient id="milo-belly" x1="110" y1="170" x2="260" y2="350" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFF1FF" />
            <stop offset="1" stopColor="#D9B8F8" />
          </linearGradient>
          <linearGradient id="milo-tail" x1="238" y1="190" x2="347" y2="314" gradientUnits="userSpaceOnUse">
            <stop stopColor="#B96CFF" />
            <stop offset="1" stopColor="#6D34C4" />
          </linearGradient>
          <filter id="milo-shadow" x="20" y="20" width="330" height="370" filterUnits="userSpaceOnUse">
            <feDropShadow dx="0" dy="15" stdDeviation="14" floodColor="#4D1B9B" floodOpacity=".36" />
          </filter>
        </defs>
        <ellipse cx="185" cy="365" rx="112" ry="14" fill="#1A0C35" opacity=".55" />
        <path d="M232 226C278 207 302 238 319 264C337 291 326 315 298 310C273 305 253 277 228 271" fill="url(#milo-tail)" stroke="#2A1258" strokeWidth="7" />
        <path d="M292 267C314 274 322 290 315 303C307 316 288 309 277 298C291 295 299 284 292 267Z" fill="#F4D8FF" />
        <g filter="url(#milo-shadow)">
          <path d="M95 120L72 34C70 25 80 20 87 27L144 82L216 72L273 25C280 19 289 25 287 35L273 129" fill="url(#milo-fur)" stroke="#2A1258" strokeWidth="8" strokeLinejoin="round" />
          <path d="M77 45L94 105L126 79L88 39C83 34 76 38 77 45Z" fill="#F6D9FF" opacity=".82" />
          <path d="M282 43L264 105L232 80L271 38C276 33 284 36 282 43Z" fill="#DDB5FF" opacity=".72" />
          <path d="M77 153C77 102 114 71 177 71C241 71 278 105 278 159V238C278 302 240 340 178 340C115 340 77 301 77 238V153Z" fill="url(#milo-fur)" stroke="#2A1258" strokeWidth="8" />
          <path d="M114 196C118 159 141 140 177 140C214 140 238 161 241 197C244 235 226 282 178 282C130 282 111 235 114 196Z" fill="url(#milo-belly)" />
          <path d="M120 151C103 166 102 196 119 210" stroke="#2A1258" strokeWidth="8" strokeLinecap="round" />
          <path d="M236 151C253 166 254 196 237 210" stroke="#2A1258" strokeWidth="8" strokeLinecap="round" />
          <ellipse cx="139" cy="168" rx="10" ry="14" fill="#201034" />
          <ellipse cx="216" cy="168" rx="10" ry="14" fill="#201034" />
          <circle cx="142" cy="163" r="3.5" fill="#FFF7FF" />
          <circle cx="219" cy="163" r="3.5" fill="#FFF7FF" />
          <path d="M164 195C169 190 184 190 190 195C192 202 185 208 177 208C169 208 162 202 164 195Z" fill="#2A1258" />
          <path d="M177 207V222M177 222C166 222 160 216 157 212M177 222C188 222 194 216 197 212" stroke="#2A1258" strokeWidth="5" strokeLinecap="round" />
          <path d="M93 239C75 228 57 235 56 251C55 267 73 273 93 260M261 239C279 228 297 235 298 251C299 267 281 273 261 260" stroke="#2A1258" strokeWidth="8" strokeLinecap="round" />
          <path d="M129 301C117 319 128 340 147 340H208C227 340 238 319 226 301" fill="#F1D8FF" stroke="#2A1258" strokeWidth="7" />
          <path d="M135 331C139 345 153 353 164 340M221 331C217 345 203 353 192 340" stroke="#2A1258" strokeWidth="7" strokeLinecap="round" />
          <path d="M236 115C247 103 260 103 269 112" stroke="#F7D9FF" strokeWidth="6" strokeLinecap="round" opacity=".8" />
        </g>
        <path d="M291 107L297 120L311 126L297 132L291 146L285 132L271 126L285 120L291 107Z" fill="#E9B6FF" />
      </svg>
      <span className="milo-tag"><span className="milo-status" /> Milo / your creative co-pilot</span>
    </div>
  );
}

function Hero({ onSignup }: { onSignup: () => void }) {
  return (
    <>
      <section className="hero">
        <div className="hero-orbit orbit-one" aria-hidden="true" />
        <div className="hero-orbit orbit-two" aria-hidden="true" />
        <div className="container-wide hero-grid">
          <div className="hero-copy">
            <div className="eyebrow eyebrow-pulse"><span /> AI CREATIVE STUDIO / 2025</div>
            <h1 className="display-xl">Make the idea<br /><span className="hero-accent">impossible</span><br />to ignore.</h1>
            <p className="lede">Createora turns your roughest sparks into videos, visuals, scripts, and social that feel unmistakably yours. Meet Milo, your clever creative co-pilot.</p>
            <div className="hero-buttons">
              <button className="btn btn-primary btn-lg" onClick={onSignup} data-testid="button-hero-signup">Start creating free <ArrowRight size={17} /></button>
              <a className="btn btn-ghost btn-lg" href="#workflow" data-testid="link-hero-how-it-works"><Play size={15} fill="currentColor" /> See the workflow</a>
            </div>
            <div className="hero-note"><Clock3 size={14} /> From first spark to first draft in under 60 seconds.</div>
          </div>
          <div className="hero-stage" aria-label="Createora studio preview with Milo">
            <div className="stage-grid-lines" aria-hidden="true" />
            <div className="studio-panel">
              <div className="studio-bar"><span className="studio-brand"><span className="studio-dot" /> CREATEORA / STUDIO</span><span className="studio-status"><span /> LIVE WORKSPACE</span></div>
              <div className="studio-body">
                <aside className="studio-sidebar">
                  <div className="side-avatar">MC</div>
                  <span className="side-active"><Sparkles size={13} /> Create new</span>
                  <span><Layers3 size={13} /> My projects</span>
                  <span><Palette size={13} /> Brand DNA</span>
                  <div className="side-rule" />
                  <small>RECENT</small>
                  <span>Moonlight launch</span>
                  <span>Quiet mornings</span>
                </aside>
                <div className="studio-main">
                  <div className="studio-heading"><div><small>GOOD MORNING, MAYA</small><h3>What are we making?</h3></div><div className="studio-milo-mini">M</div></div>
                  <div className="prompt-input"><WandSparkles size={15} /><span>Describe a feeling, not a format...</span><button aria-label="Start with a prompt" data-testid="button-studio-prompt"><ArrowRight size={14} /></button></div>
                  <div className="quick-label">JUMP IN WITH A TOOL</div>
                  <div className="quick-tools">
                    <button className="quick-tool" onClick={onSignup} data-testid="button-quick-video"><Video size={15} /><span>AI Video</span></button>
                    <button className="quick-tool" onClick={onSignup} data-testid="button-quick-image"><ImageIcon size={15} /><span>AI Image</span></button>
                    <button className="quick-tool" onClick={onSignup} data-testid="button-quick-script"><FileText size={15} /><span>Script</span></button>
                  </div>
                  <div className="studio-insight"><div className="insight-icon"><Sparkles size={14} /></div><div><strong>Milo has a thought</strong><p>Try starting with the mood behind the message.</p></div><ArrowRight size={14} /></div>
                </div>
              </div>
            </div>
            <div className="milo-hero"><Milo /></div>
            <div className="stage-note note-top"><span>01</span> Idea in / magic out</div>
            <div className="stage-note note-bottom"><span>BRAND DNA</span> Kept in every frame</div>
          </div>
        </div>
      </section>
      <div className="signal-bar" aria-label="Createora capabilities">
        <div className="signal-track">
          {[0, 1].map((group) => (
            <div className="signal-item" key={group}><span>IDEAS WITH A PULSE</span><i /><span>YOUR VOICE, AMPLIFIED</span><i /><span>LESS BLANK PAGE</span><i /><span>MORE GOOD WORK</span><i /></div>
          ))}
        </div>
      </div>
    </>
  );
}

type ToolCard = { title: string; description: string; icon: ReactNode; className: string; meta: string; accent: string };

function Tools({ onSignup }: { onSignup: (intent?: string) => void }) {
  const tools: ToolCard[] = [
    { title: 'AI Video', description: 'Turn a thought into a scroll-stopping story with a point of view.', icon: <Video />, className: 'tool-video', meta: 'Motion / 01', accent: 'Text to motion' },
    { title: 'AI Image', description: 'Build a visual world that looks like you, not everybody else.', icon: <ImageIcon />, className: 'tool-image', meta: 'Visuals / 02', accent: 'Prompt to image' },
    { title: 'Script Writer', description: 'Find the hook, pace the story, and give every line a reason to stay.', icon: <FileText />, className: 'tool-script', meta: 'Words / 03', accent: 'Idea to script' },
    { title: 'Social Content', description: 'One strong idea, adapted for every channel you care about.', icon: <Share2 />, className: 'tool-social', meta: 'Reach / 04', accent: 'One to many' },
    { title: 'Templates', description: 'Keep your best formats close and make them yours in a click.', icon: <Layers3 />, className: 'tool-templates', meta: 'Systems / 05', accent: 'Save your edge' },
  ];
  return (
    <section className="tools-section" id="tools">
      <div className="container-wide">
        <div className="section-topline"><span className="eyebrow">Your new creative stack</span><span className="section-index">05 / 05 TOOLS</span></div>
        <div className="tools-heading"><h2 className="display-md">One studio.<br /><span>Every way to make.</span></h2><p>Stop stitching together six tabs to get one good thing out the door. Createora gives every format a shared creative brain.</p></div>
        <div className="tool-grid">
          {tools.map((tool) => (
            <button className={`tool-card ${tool.className}`} key={tool.title} onClick={() => onSignup(tool.title.toLowerCase())} data-testid={`button-tool-${tool.title.toLowerCase().replaceAll(' ', '-')}`}>
              <div className="tool-card-top"><span>{tool.meta}</span><ArrowRight size={16} /></div>
              <div className="tool-visual" aria-hidden="true"><div className="tool-icon">{tool.icon}</div><span className="tool-accent">{tool.accent}</span></div>
              <div className="tool-copy"><h3>{tool.title}</h3><p>{tool.description}</p></div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function Workflow() {
  const steps = [
    { no: '01', title: 'Drop in the spark', copy: 'A sentence, a moodboard, a voice note, or the thing you cannot stop thinking about.', icon: <MessageSquareText /> },
    { no: '02', title: 'Let Milo find the angle', copy: 'Get clear creative directions, sharper hooks, and a point of view worth building around.', icon: <Target /> },
    { no: '03', title: 'Ship the whole world', copy: 'Turn one idea into the video, visual, script, and social system that makes it travel.', icon: <Zap /> },
  ];
  return (
    <section className="workflow-section" id="workflow">
      <div className="container-wide">
        <div className="section-topline dark-line"><span className="eyebrow">The Createora loop</span><span className="section-index">FROM SPARK TO SIGNAL</span></div>
        <div className="workflow-intro"><h2 className="display-md">The magic is not<br />the <span>output.</span></h2><p>It is the moment a vague maybe becomes a direction you can feel in your chest. Createora keeps you moving toward that moment.</p></div>
        <div className="workflow-grid">
          <div className="workflow-steps">
            {steps.map((step) => <article className="workflow-step" key={step.no}><div className="step-marker"><span>{step.no}</span>{step.icon}</div><h3>{step.title}</h3><p>{step.copy}</p></article>)}
          </div>
          <div className="workflow-milo"><Milo compact /><div className="milo-speech"><span className="eyebrow">MILO / 09:42</span><strong>“What if the quiet part<br />is the whole point?”</strong><span className="speech-line" /></div></div>
        </div>
      </div>
    </section>
  );
}

function Proof() {
  return (
    <section className="proof-section" id="proof">
      <div className="container-wide">
        <div className="proof-intro"><span className="eyebrow">Made for the makers</span><p>From solo creators to small teams with big taste, Createora is where the next version starts.</p></div>
        <div className="proof-logos" aria-label="Creator community"><span>NOON / 04</span><span className="logo-serif">Lumen</span><span>COMMON GROUND</span><span className="logo-script">slowclub</span><span>FIELDNOTE®</span></div>
        <div className="proof-stats">
          <div className="stat"><strong>18.6k</strong><span>ideas shaped this month</span></div>
          <div className="stat"><strong>4.2 hrs</strong><span>saved per creator / week</span></div>
          <div className="stat"><strong>92%</strong><span>say the work feels more like them</span></div>
          <div className="stat stat-quote"><Quote size={20} /><p>Finally, a tool with taste.</p><span>— Rhea, Fieldnote</span></div>
        </div>
      </div>
    </section>
  );
}

function Pricing({ onSignup }: { onSignup: () => void }) {
  return (
    <section className="pricing-section" id="pricing">
      <div className="container-wide">
        <div className="section-topline"><span className="eyebrow">Choose your runway</span><span className="section-index">NO HIDDEN TRICKS</span></div>
        <div className="pricing-heading"><h2 className="display-md">Good work<br /><span>starts here.</span></h2><p>Start free while you find your rhythm. Upgrade when the ideas start arriving faster than your calendar.</p></div>
        <div className="price-grid">
          <article className="price-card">
            <div className="price-card-head"><div><span className="plan-kicker">FOR THE CURIOUS</span><h3>Starter</h3></div><span className="price-icon"><Star size={15} /></span></div>
            <p className="price-description">A real workspace for finding your next strong direction.</p>
            <div className="price">$0 <small>/ forever</small></div>
            <ul><li><Check size={15} /> 30 generations each month</li><li><Check size={15} /> 1 Brand DNA profile</li><li><Check size={15} /> All five creation tools</li></ul>
            <button className="btn btn-ghost" onClick={onSignup} data-testid="button-pricing-starter">Start for free <ArrowRight size={15} /></button>
          </article>
          <article className="price-card featured">
            <span className="price-badge">Most chosen</span>
            <div className="price-card-head"><div><span className="plan-kicker">FOR THE IN MOTION</span><h3>Studio</h3></div><span className="price-icon"><Sparkles size={15} /></span></div>
            <p className="price-description">Unlimited room for the ideas that refuse to stay small.</p>
            <div className="price">$24 <small>/ creator / month</small></div>
            <ul><li><Check size={15} /> Unlimited creative directions</li><li><Check size={15} /> 5 Brand DNA profiles</li><li><Check size={15} /> Full video and image studio</li><li><Check size={15} /> Shared remix boards</li></ul>
            <button className="btn btn-primary" onClick={onSignup} data-testid="button-pricing-studio">Bring your ideas <ArrowRight size={15} /></button>
          </article>
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  return (
    <section className="faq-section" id="faq">
      <div className="container-wide faq-layout">
        <div className="faq-intro"><span className="eyebrow">Questions, answered</span><h2 className="display-md">No fine print.<br /><span>Just good sense.</span></h2><p>Still curious? Good. Send a note and a real person will write back.</p><a className="btn btn-ghost" href="mailto:hello@createora.co" data-testid="link-email-support">Ask us anything <ArrowRight size={15} /></a></div>
        <div className="faq-list">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return <div className="faq-item" key={faq.question}><button className="faq-trigger" onClick={() => setOpenIndex(isOpen ? null : index)} aria-expanded={isOpen} data-testid={`button-faq-${index}`}><span>{faq.question}</span><Plus size={18} /></button><div className={`faq-answer ${isOpen ? 'open' : ''}`}><div><p>{faq.answer}</p></div></div></div>;
          })}
        </div>
      </div>
    </section>
  );
}

function FinalCTA({ onSignup }: { onSignup: () => void }) {
  return (
    <section className="final-cta">
      <div className="final-noise" aria-hidden="true" />
      <div className="container-wide final-inner"><div><span className="eyebrow">Your move</span><h2 className="display-lg">The next version<br /><span>starts with a spark.</span></h2></div><div className="final-action"><p>Milo is already waiting. Bring the half-formed thought.</p><button className="btn btn-white" onClick={onSignup} data-testid="button-final-signup">Open the studio <ArrowRight size={16} /></button></div></div>
    </section>
  );
}

function Footer() {
  return <footer className="footer"><div className="container-wide"><div className="footer-top"><div><Wordmark /><small>Make the idea impossible to ignore.</small></div><div className="footer-links"><a href="#tools" data-testid="link-footer-tools">Create</a><a href="#workflow" data-testid="link-footer-workflow">How it works</a><a href="#pricing" data-testid="link-footer-pricing">Pricing</a><a href="#faq" data-testid="link-footer-faq">FAQ</a><a href="mailto:hello@createora.co" data-testid="link-footer-contact">Contact</a></div></div><div className="footer-bottom"><span>Createora / A studio for the unfinished</span><span>© 2025 Createora Studio</span><span>Built for human taste</span></div></div></footer>;
}

function Home() {
  const [signupOpen, setSignupOpen] = useState(false);
  const [signupIntent, setSignupIntent] = useState('your next idea');
  const openSignup = (intent = 'your next idea') => { setSignupIntent(intent); setSignupOpen(true); };
  return <main className="createora-site"><Navigation onSignup={() => openSignup()} /><Hero onSignup={() => openSignup()} /><Tools onSignup={openSignup} /><Workflow /><Proof /><Pricing onSignup={() => openSignup()} /><FAQ /><FinalCTA onSignup={() => openSignup()} /><Footer />{signupOpen && <SignupModal intent={signupIntent} onClose={() => setSignupOpen(false)} />}</main>;
}

function Router() {
  return <RoutedErrorBoundary><Switch><Route path="/" component={Home} /><Route component={NotFound} /></Switch></RoutedErrorBoundary>;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;