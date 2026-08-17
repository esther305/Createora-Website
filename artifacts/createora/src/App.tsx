import { useEffect, useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ClerkProvider, SignIn, SignUp, useAuth, useClerk, useSignIn, useUser } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadcn } from '@clerk/themes';
import { getGetProfileQueryKey, useGetProfile } from '@workspace/api-client-react';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CircleHelp,
  Clock3,
  CreditCard,
  FileBox,
  FileText,
  FolderKanban,
  Image as ImageIcon,
  ImagePlus,
  LayoutDashboard,
  Layers3,
  LogOut,
  Menu,
  MessageSquareText,
  MoreHorizontal,
  PenLine,
  Play,
  Plus,
  Quote,
  Settings,
  Share2,
  ShieldCheck,
  Sparkles,
  Target,
  UserRound,
  Video,
  WandSparkles,
  X,
  Zap,
} from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Redirect, Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();
const clerkPubKey = publishableKeyFromHost(window.location.hostname, import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

function stripBase(path: string) {
  return basePath && path.startsWith(basePath) ? path.slice(basePath.length) || '/' : path;
}

const navItems = [
  { href: '#tools', label: 'Tools' },
  { href: '#workflow', label: 'How it works' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#faq', label: 'FAQ' },
];

const faqs = [
  {
    question: 'What can I create with Createora?',
    answer: 'Createora brings AI Video, AI Image, Script Writer, Social Content, and Templates into one connected workspace. Start with one idea and build a complete content system around it.',
  },
  {
    question: 'Can I use my own brand style?',
    answer: 'Yes. Save your colors, tone, references, and examples in a Brand Profile. Createora keeps that context close so every draft feels recognizably yours.',
  },
  {
    question: 'Do I need experience with AI tools?',
    answer: 'Not at all. Start with a sentence, a reference, or a rough direction. Createora helps shape it into a useful first draft without requiring the perfect prompt.',
  },
  {
    question: 'Can I try it before paying?',
    answer: 'Yes. The free workspace includes monthly generations and all five core creation tools. No credit card is needed to start.',
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
            <h2 id="signup-title">You’re on the list.</h2>
            <p>We’ll send your invite and a few ideas to {email}.</p>
            <button className="btn btn-primary" onClick={onClose} data-testid="button-finish-signup">Back to Createora <ArrowRight size={16} /></button>
          </div>
        ) : (
          <>
            <span className="eyebrow">Createora workspace · 01</span>
            <h2 id="signup-title">Make {intent}.</h2>
            <p>Join the creative workspace where a rough thought becomes a finished piece before lunch.</p>
            <form className="modal-form" onSubmit={(event) => { event.preventDefault(); setSubmitted(true); }}>
              <label htmlFor="signup-name">Your name
                <input id="signup-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Maya Chen" required data-testid="input-signup-name" />
              </label>
              <label htmlFor="signup-email">Work email
                <input id="signup-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="maya@studio.co" required data-testid="input-signup-email" />
              </label>
              <button type="submit" className="btn btn-primary" data-testid="button-submit-signup">Enter the workspace <ArrowRight size={16} /></button>
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
            <a className="nav-login" href="#pricing" data-testid="link-nav-pricing">See plans</a>
            <button className="btn btn-primary nav-cta" onClick={onSignup} data-testid="button-nav-signup">Start creating <ArrowRight size={14} /></button>
            <button className="mobile-toggle" onClick={() => setMobileOpen((value) => !value)} aria-label={mobileOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileOpen} data-testid="button-mobile-menu">
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </nav>
        <div className="announcement"><span className="live-dot" /> Createora makes more room for your best work <ArrowRight size={13} /></div>
      </div>
    </header>
  );
}

function WorkspacePreview() {
  return (
    <div className="workspace-preview" aria-label="Createora content workspace preview">
      <div className="preview-window">
        <div className="preview-topbar">
          <div className="window-controls"><i /><i /><i /></div>
          <span className="preview-url">createora / workspace</span>
          <span className="preview-live"><span /> LIVE</span>
        </div>
        <div className="preview-layout">
          <aside className="preview-sidebar">
            <div className="preview-avatar">MC</div>
            <span className="preview-nav active"><Sparkles size={13} /> Create</span>
            <span className="preview-nav"><Layers3 size={13} /> Projects</span>
            <span className="preview-nav"><Target size={13} /> Brand profile</span>
            <div className="preview-rule" />
            <small>RECENT</small>
            <span className="preview-recent">Sunday campaign</span>
            <span className="preview-recent">Field notes</span>
          </aside>
          <div className="preview-main">
            <div className="preview-heading">
              <div><span className="preview-kicker">GOOD MORNING, MAYA</span><h3>What are we making?</h3></div>
              <div className="preview-spark"><WandSparkles size={16} /></div>
            </div>
            <div className="prompt-input"><WandSparkles size={15} /><span>Describe a feeling, not a format...</span><button aria-label="Start with a prompt" data-testid="button-studio-prompt"><ArrowRight size={14} /></button></div>
            <div className="quick-label">JUMP IN WITH A TOOL</div>
            <div className="quick-tools">
              <span className="quick-tool"><Video size={15} /> AI Video</span>
              <span className="quick-tool"><ImageIcon size={15} /> AI Image</span>
              <span className="quick-tool"><FileText size={15} /> Script</span>
            </div>
            <div className="preview-output">
              <div className="output-art"><div className="output-sun" /><div className="output-horizon" /><div className="output-slope" /></div>
              <div className="output-copy"><span>GENERATED CONCEPT / 01</span><strong>Sunday, made visual.</strong><small>Ready to remix</small></div>
              <ArrowRight size={15} />
            </div>
          </div>
        </div>
      </div>
      <div className="preview-float float-top"><Sparkles size={14} /><span>Brand-aware drafts</span></div>
      <div className="preview-float float-bottom"><span className="float-number">01</span><span>Idea in / draft out</span></div>
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
            <div className="eyebrow eyebrow-pulse"><span /> AI CONTENT STUDIO / 2026</div>
            <h1 className="display-xl">Make more<br /><span className="hero-accent">of your</span><br />best ideas.</h1>
            <p className="lede">Createora is the AI workspace for turning rough sparks into videos, visuals, scripts, and social content that feels unmistakably yours.</p>
            <div className="hero-buttons">
              <button className="btn btn-primary btn-lg" onClick={onSignup} data-testid="button-hero-signup">Start creating free <ArrowRight size={17} /></button>
              <a className="btn btn-secondary btn-lg" href="#workflow" data-testid="link-hero-how-it-works"><Play size={15} fill="currentColor" /> See how it works</a>
            </div>
            <div className="hero-note"><Clock3 size={14} /> From first spark to first draft in under 60 seconds.</div>
          </div>
          <WorkspacePreview />
        </div>
      </section>
      <div className="signal-bar" aria-label="Createora capabilities">
        <div className="signal-track">
          {[0, 1].map((group) => (
            <div className="signal-item" key={group}><span>CREATE WITH CLARITY</span><i /><span>YOUR VOICE, AMPLIFIED</span><i /><span>LESS BLANK PAGE</span><i /><span>MORE GOOD WORK</span><i /></div>
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
        <div className="section-topline"><span className="eyebrow">Your creative stack</span><span className="section-index">05 / 05 TOOLS</span></div>
        <div className="tools-heading"><h2 className="display-md">One studio.<br /><span>Every way to make.</span></h2><p>Stop stitching together six tabs to get one good thing out the door. Createora gives every format a shared creative foundation.</p></div>
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
    { no: '01', title: 'Bring the spark', copy: 'A sentence, a moodboard, a voice note, or the thing you cannot stop thinking about.', icon: <MessageSquareText /> },
    { no: '02', title: 'Find the angle', copy: 'Get clear creative directions, sharper hooks, and a point of view worth building around.', icon: <Target /> },
    { no: '03', title: 'Build the system', copy: 'Turn one idea into the video, visual, script, and social content that makes it travel.', icon: <Zap /> },
  ];
  return (
    <section className="workflow-section" id="workflow">
      <div className="container-wide">
        <div className="section-topline dark-line"><span className="eyebrow">How Createora works</span><span className="section-index">FROM SPARK TO SIGNAL</span></div>
        <div className="workflow-intro"><h2 className="display-md">A clearer path<br />from <span>idea to done.</span></h2><p>Keep your thinking, making, and finishing in one place. Createora helps you move from vague maybe to a direction you can feel.</p></div>
        <div className="workflow-grid">
          <div className="workflow-steps">
            {steps.map((step) => <article className="workflow-step" key={step.no}><div className="step-marker"><span>{step.no}</span>{step.icon}</div><h3>{step.title}</h3><p>{step.copy}</p></article>)}
          </div>
          <div className="workflow-board">
            <div className="board-header"><span><span className="board-dot" /> CREATEORA / PROJECT</span><span>03:42</span></div>
            <div className="board-title"><span className="eyebrow">ACTIVE PROJECT</span><h3>Sunday campaign</h3><p>From one quiet thought to a full week of content.</p></div>
            <div className="board-progress"><span><b>Creative system</b><small>4 of 5 pieces ready</small></span><strong>80%</strong><i><em /></i></div>
            <div className="board-items">
              <div className="board-item done"><span><Check size={13} /></span><b>Campaign direction</b><small>Ready</small></div>
              <div className="board-item done"><span><Check size={13} /></span><b>Hero image</b><small>Ready</small></div>
              <div className="board-item"><span><Video size={13} /></span><b>Short-form video</b><small>Rendering</small></div>
              <div className="board-item"><span><Share2 size={13} /></span><b>Social variations</b><small>Next up</small></div>
            </div>
            <div className="board-footer"><span><Sparkles size={13} /> Brand profile applied</span><ArrowRight size={14} /></div>
          </div>
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
        <div className="section-topline"><span className="eyebrow">Simple, useful plans</span><span className="section-index">NO HIDDEN TRICKS</span></div>
        <div className="pricing-heading"><h2 className="display-md">Good work<br /><span>starts here.</span></h2><p>Start free while you find your rhythm. Upgrade when the ideas start arriving faster than your calendar.</p></div>
        <div className="price-grid">
          <article className="price-card">
            <div className="price-card-head"><div><span className="plan-kicker">FOR THE CURIOUS</span><h3>Starter</h3></div><span className="price-icon"><Sparkles size={15} /></span></div>
            <p className="price-description">A real workspace for finding your next strong direction.</p>
            <div className="price">$0 <small>/ forever</small></div>
            <ul><li><Check size={15} /> 30 generations each month</li><li><Check size={15} /> 1 Brand Profile</li><li><Check size={15} /> All five creation tools</li></ul>
            <button className="btn btn-secondary" onClick={onSignup} data-testid="button-pricing-starter">Start for free <ArrowRight size={15} /></button>
          </article>
          <article className="price-card featured">
            <span className="price-badge">Most chosen</span>
            <div className="price-card-head"><div><span className="plan-kicker">FOR THE IN MOTION</span><h3>Studio</h3></div><span className="price-icon"><Zap size={15} /></span></div>
            <p className="price-description">Unlimited room for the ideas that refuse to stay small.</p>
            <div className="price">$24 <small>/ creator / month</small></div>
            <ul><li><Check size={15} /> Unlimited creative directions</li><li><Check size={15} /> 5 Brand Profiles</li><li><Check size={15} /> Full video and image studio</li><li><Check size={15} /> Shared remix boards</li></ul>
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
        <div className="faq-intro"><span className="eyebrow">Questions, answered</span><h2 className="display-md">No fine print.<br /><span>Just good sense.</span></h2><p>Still curious? Good. Send a note and a real person will write back.</p><a className="btn btn-secondary" href="mailto:hello@createora.co" data-testid="link-email-support">Ask us anything <ArrowRight size={15} /></a></div>
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
      <div className="final-pattern" aria-hidden="true" />
      <div className="container-wide final-inner"><div><span className="eyebrow">Your move</span><h2 className="display-lg">Give your next idea<br /><span>somewhere to go.</span></h2></div><div className="final-action"><p>Start with the half-formed thought. Leave with something worth sharing.</p><button className="btn btn-light" onClick={onSignup} data-testid="button-final-signup">Start creating free <ArrowRight size={16} /></button></div></div>
    </section>
  );
}

function Footer() {
  return <footer className="footer"><div className="container-wide"><div className="footer-top"><div><Wordmark /><small>A workspace for better ideas.</small></div><div className="footer-links"><a href="#tools" data-testid="link-footer-tools">Tools</a><a href="#workflow" data-testid="link-footer-workflow">How it works</a><a href="#pricing" data-testid="link-footer-pricing">Pricing</a><a href="#faq" data-testid="link-footer-faq">FAQ</a><a href="mailto:hello@createora.co" data-testid="link-footer-contact">Contact</a></div></div><div className="footer-bottom"><span>Createora / AI content creation</span><span>© 2026 Createora Studio</span><span>Built for human taste</span></div></div></footer>;
}

function AuthFrame({ children, eyebrow, title, copy }: { children: ReactNode; eyebrow: string; title: string; copy: string }) {
  return (
    <main className="auth-page">
      <div className="auth-ambient auth-ambient-one" aria-hidden="true" />
      <div className="auth-ambient auth-ambient-two" aria-hidden="true" />
      <div className="auth-layout">
        <div className="auth-intro">
          <Wordmark />
          <div className="auth-intro-copy">
            <span className="eyebrow">{eyebrow}</span>
            <h1>{title}</h1>
            <p>{copy}</p>
            <div className="auth-signal"><span><Sparkles size={14} /> AI content workspace</span><span><Check size={14} /> Built around your voice</span></div>
          </div>
        </div>
        <div className="auth-card-wrap">{children}</div>
      </div>
    </main>
  );
}

function SignInPage() {
  return (
    <AuthFrame eyebrow="Welcome back" title="Make room for your next idea." copy="Your creative workspace is ready when you are. Pick up a project or start something new.">
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} forceRedirectUrl={`${basePath}/dashboard`} />
    </AuthFrame>
  );
}

function SignUpPage() {
  return (
    <AuthFrame eyebrow="Createora workspace · 01" title="Your best work starts with a blank page." copy="Build a connected content practice with AI tools that remember your direction and respect your taste.">
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} forceRedirectUrl={`${basePath}/dashboard`} />
    </AuthFrame>
  );
}

function getAuthErrorMessage(error: unknown) {
  if (typeof error === 'object' && error !== null && 'errors' in error) {
    const errors = (error as { errors?: Array<{ longMessage?: string; message?: string }> }).errors;
    const message = errors?.[0]?.longMessage ?? errors?.[0]?.message;
    if (message) return message;
  }
  return 'Something went wrong. Please check your details and try again.';
}

function ForgotPasswordPage() {
  const { isLoaded, signIn } = useSignIn();
  const { setActive } = useClerk();
  const [stage, setStage] = useState<'email' | 'code' | 'password' | 'success'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isLoaded || !signIn) {
    return <main className="auth-page"><div className="auth-loading">Loading secure reset flow…</div></main>;
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (stage === 'email') {
        await signIn.create({ identifier: email, strategy: 'reset_password_email_code' });
        setStage('code');
      } else if (stage === 'code') {
        await signIn.attemptFirstFactor({ strategy: 'reset_password_email_code', code });
        setStage('password');
      } else if (stage === 'password') {
        const result = await signIn.resetPassword({ password });
        if (result.createdSessionId) {
          await setActive({ session: result.createdSessionId });
        }
        setStage('success');
      }
    } catch (submitError) {
      setError(getAuthErrorMessage(submitError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthFrame eyebrow="Account recovery" title={stage === 'success' ? 'You’re back in.' : 'Reset your password.'} copy={stage === 'success' ? 'Your password has been updated and your workspace is ready.' : 'A secure, step-by-step reset flow that keeps your account protected.'}>
      {stage === 'success' ? (
        <div className="reset-success">
          <div className="reset-success-icon"><Check size={26} /></div>
          <span className="eyebrow">Password updated</span>
          <h2>Ready when you are.</h2>
          <a className="btn btn-primary" href={`${basePath}/dashboard`} data-testid="link-reset-dashboard">Go to dashboard <ArrowRight size={15} /></a>
        </div>
      ) : (
        <form className="auth-form reset-form" onSubmit={submit}>
          <div className="auth-form-heading"><span className="eyebrow">Step {stage === 'email' ? '01' : stage === 'code' ? '02' : '03'} / 03</span><h2>{stage === 'email' ? 'Find your account' : stage === 'code' ? 'Check your inbox' : 'Choose a new password'}</h2><p>{stage === 'email' ? 'Enter the email you used for Createora.' : stage === 'code' ? `We sent a verification code to ${email}.` : 'Use at least 8 characters for your new password.'}</p></div>
          {stage === 'email' && <label htmlFor="reset-email">Email address<input id="reset-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@studio.co" required data-testid="input-reset-email" /></label>}
          {stage === 'code' && <label htmlFor="reset-code">Verification code<input id="reset-code" inputMode="numeric" value={code} onChange={(event) => setCode(event.target.value)} placeholder="123456" required data-testid="input-reset-code" /></label>}
          {stage === 'password' && <label htmlFor="reset-password">New password<input id="reset-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" minLength={8} required data-testid="input-reset-password" /></label>}
          {error && <p className="auth-error" role="alert" data-testid="status-reset-error">{error}</p>}
          <button className="btn btn-primary auth-submit" type="submit" disabled={submitting} data-testid="button-reset-submit">{submitting ? 'Working…' : stage === 'email' ? 'Send reset code' : stage === 'code' ? 'Verify code' : 'Update password'} <ArrowRight size={15} /></button>
          <a className="auth-back-link" href={`${basePath}/sign-in`} data-testid="link-reset-signin">Back to log in</a>
        </form>
      )}
    </AuthFrame>
  );
}

const dashboardTools = [
  { title: 'AI Studio', description: 'Start with a thought and build a complete content system.', icon: <Sparkles size={19} />, className: 'dashboard-tool-featured' },
  { title: 'AI Image Generator', description: 'Create visual directions that feel like your brand.', icon: <ImagePlus size={19} /> },
  { title: 'AI Video Generator', description: 'Turn a brief into motion made for the feed.', icon: <Video size={19} /> },
  { title: 'Script Writer', description: 'Find the hook and give every line a reason to stay.', icon: <PenLine size={19} /> },
  { title: 'Caption Generator', description: 'Say it clearly, then adapt it for every channel.', icon: <MessageSquareText size={19} /> },
];

function DashboardSidebar({ onLogout }: { onLogout: () => void }) {
  const sidebarItems = [
    { label: 'Overview', icon: <LayoutDashboard size={16} /> },
    { label: 'Projects', icon: <FolderKanban size={16} /> },
    { label: 'Files', icon: <FileBox size={16} /> },
  ];
  return (
    <aside className="dashboard-sidebar">
      <div className="dashboard-brand"><Wordmark /><span className="dashboard-plan">STUDIO</span></div>
      <button className="dashboard-new-project" data-testid="button-dashboard-new-project"><Plus size={16} /> New project</button>
      <nav className="dashboard-nav" aria-label="Workspace navigation">
        <span className="dashboard-nav-label">Workspace</span>
        {sidebarItems.map((item) => <a className={`dashboard-nav-item ${item.label === 'Overview' ? 'active' : ''}`} key={item.label} href={`#${item.label.toLowerCase()}`} data-testid={`link-dashboard-${item.label.toLowerCase()}`}>{item.icon}<span>{item.label}</span></a>)}
        <span className="dashboard-nav-label dashboard-nav-label-spaced">Account</span>
        <a className="dashboard-nav-item" href="#billing" data-testid="link-dashboard-billing"><CreditCard size={16} /><span>Billing</span></a>
        <a className="dashboard-nav-item" href="#settings" data-testid="link-dashboard-settings"><Settings size={16} /><span>Settings</span></a>
      </nav>
      <div className="dashboard-sidebar-bottom">
        <a className="dashboard-help" href="mailto:hello@createora.co" data-testid="link-dashboard-help"><CircleHelp size={16} /> Help center</a>
        <button className="dashboard-profile-link" data-testid="button-dashboard-profile"><UserRound size={16} /><span>Profile</span><MoreHorizontal size={15} /></button>
        <button className="dashboard-logout sidebar-logout" onClick={onLogout} data-testid="button-dashboard-logout"><LogOut size={16} /> Log out</button>
      </div>
    </aside>
  );
}

function DashboardPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();
  const profileQuery = useGetProfile({ query: { enabled: Boolean(isSignedIn), queryKey: getGetProfileQueryKey() } });

  if (!isLoaded) return <main className="dashboard-loading">Loading workspace…</main>;
  if (!isSignedIn) return <Redirect to="/sign-in" />;

  const firstName = user?.firstName || user?.username || 'creator';
  const credits = profileQuery.data?.credits ?? 30;
  const plan = profileQuery.data?.plan === 'studio' ? 'Studio' : 'Starter';

  return (
    <main className="dashboard-page">
      <DashboardSidebar onLogout={() => signOut({ redirectUrl: basePath || '/' })} />
      <section className="dashboard-content">
        <header className="dashboard-topbar">
          <div><span className="eyebrow">Tuesday, August 12, 2026</span><h1>Good morning, {firstName}.</h1></div>
          <div className="dashboard-top-actions"><span className="dashboard-credits"><Sparkles size={14} /> {credits} AI credits</span><button className="dashboard-avatar" data-testid="button-dashboard-user" aria-label="Open profile">{user?.firstName?.[0] ?? 'C'}{user?.lastName?.[0] ?? ''}</button></div>
        </header>
        <div className="dashboard-main-grid">
          <section className="dashboard-section dashboard-studio-section" id="overview">
            <div className="dashboard-section-heading"><div><span className="eyebrow">Createora studio</span><h2>What are we making?</h2></div><button className="dashboard-icon-button" data-testid="button-dashboard-studio-menu" aria-label="Studio options"><MoreHorizontal size={18} /></button></div>
            <div className="dashboard-prompt"><WandSparkles size={18} /><span>Describe a feeling, not a format...</span><button data-testid="button-dashboard-start-prompt" aria-label="Start creating"><ArrowRight size={16} /></button></div>
            <div className="dashboard-tool-grid">
              {dashboardTools.map((tool) => <button className={`dashboard-tool-card ${tool.className ?? ''}`} key={tool.title} data-testid={`button-dashboard-tool-${tool.title.toLowerCase().replaceAll(' ', '-')}`}><span className="dashboard-tool-icon">{tool.icon}</span><span className="dashboard-tool-copy"><strong>{tool.title}</strong><small>{tool.description}</small></span><ArrowUpRight size={15} /></button>)}
            </div>
          </section>
          <aside className="dashboard-side-column">
            <section className="dashboard-widget usage-widget" id="usage"><div className="widget-heading"><span>Usage this month</span><Sparkles size={15} /></div><strong>{credits} <small>credits left</small></strong><div className="usage-bar"><span /></div><div className="widget-meta"><span>{plan} plan</span><a href="#billing" data-testid="link-dashboard-upgrade">Upgrade <ArrowRight size={12} /></a></div></section>
            <section className="dashboard-widget" id="projects"><div className="widget-heading"><span>Recent projects</span><a href="#projects" data-testid="link-dashboard-view-projects">View all <ArrowRight size={12} /></a></div><div className="recent-project"><span className="project-thumb project-thumb-green" /><div><strong>Sunday campaign</strong><small>4 pieces · Updated today</small></div><MoreHorizontal size={15} /></div><div className="recent-project"><span className="project-thumb project-thumb-blue" /><div><strong>Field notes</strong><small>2 pieces · Updated yesterday</small></div><MoreHorizontal size={15} /></div><button className="widget-link" data-testid="button-dashboard-create-project"><Plus size={14} /> New project</button></section>
            <section className="dashboard-widget dashboard-profile-widget" id="settings"><div className="widget-heading"><span>Workspace profile</span><Settings size={15} /></div><div className="profile-summary"><div className="profile-large-avatar">{user?.firstName?.[0] ?? 'C'}</div><div><strong>{user?.fullName || firstName}</strong><small>{user?.primaryEmailAddress?.emailAddress || 'Creator workspace'}</small></div></div><a className="widget-link" href="#settings" data-testid="link-dashboard-edit-profile">Edit profile <ArrowRight size={14} /></a></section>
          </aside>
        </div>
      </section>
    </main>
  );
}

function Home() {
  const [, setLocation] = useLocation();
  const openSignup = (_intent?: string) => setLocation('/sign-up');
  return <main className="createora-site"><Navigation onSignup={openSignup} /><Hero onSignup={openSignup} /><Tools onSignup={openSignup} /><Workflow /><Proof /><Pricing onSignup={openSignup} /><FAQ /><FinalCTA onSignup={openSignup} /><Footer /></main>;
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  useEffect(() => addListener(({ user }) => {
    if (!user) queryClient.clear();
  }), [addListener]);
  return null;
}

function AppRoutes() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/sign-in/*?" component={SignInPage} />
        <Route path="/sign-up/*?" component={SignUpPage} />
        <Route path="/forgot-password" component={ForgotPasswordPage} />
        <Route path="/dashboard" component={DashboardPage} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  if (!clerkPubKey) {
    throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY in environment');
  }

  return (
    <WouterRouter base={basePath}>
      <ClerkProvider
        publishableKey={clerkPubKey}
        proxyUrl={clerkProxyUrl}
        appearance={{
          theme: shadcn,
          cssLayerName: 'clerk',
          options: {
            logoPlacement: 'inside',
            logoLinkUrl: basePath || '/',
            logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
          },
          variables: {
            colorPrimary: '#2e8b57',
            colorForeground: '#17221b',
            colorMutedForeground: '#65736a',
            colorDanger: '#b42318',
            colorBackground: '#ffffff',
            colorInput: '#f8faf6',
            colorInputForeground: '#17221b',
            colorNeutral: '#dce5dc',
            fontFamily: 'DM Sans',
            borderRadius: '0.75rem',
          },
          elements: {
            rootBox: 'w-full flex justify-center',
            cardBox: 'bg-white rounded-2xl w-[440px] max-w-full overflow-hidden shadow-none',
            card: '!shadow-none !border-0 !bg-transparent !rounded-none',
            footer: '!shadow-none !border-0 !bg-transparent !rounded-none',
            headerTitle: 'text-[#17221b] font-bold',
            headerSubtitle: 'text-[#65736a]',
            socialButtonsBlockButtonText: 'text-[#17221b]',
            formFieldLabel: 'text-[#17221b]',
            footerActionLink: 'text-[#2e8b57] font-semibold',
            footerActionText: 'text-[#65736a]',
            dividerText: 'text-[#65736a]',
            formButtonPrimary: 'bg-[#2e8b57] hover:bg-[#246b43] text-white',
            formFieldInput: 'bg-[#f8faf6] border-[#dce5dc] text-[#17221b]',
            socialButtonsBlockButton: 'border-[#dce5dc] bg-white',
            footerAction: 'bg-transparent',
            dividerLine: 'bg-[#dce5dc]',
            alert: 'border-[#f3c4be]',
            alertText: 'text-[#b42318]',
            formFieldSuccessText: 'text-[#2e8b57]',
            main: 'bg-white',
          },
        }}
        signInUrl={`${basePath}/sign-in`}
        signUpUrl={`${basePath}/sign-up`}
        localization={{
          signIn: { start: { title: 'Welcome back', subtitle: 'Sign in to access your workspace' } },
          signUp: { start: { title: 'Create your account', subtitle: 'Start making better content today' } },
        }}
        routerPush={(to) => {
          const [, setLocation] = useLocation();
          setLocation(stripBase(to));
        }}
        routerReplace={(to) => {
          const [, setLocation] = useLocation();
          setLocation(stripBase(to), { replace: true });
        }}
      >
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <ClerkQueryClientCacheInvalidator />
            <AppRoutes />
            <Toaster />
          </TooltipProvider>
        </QueryClientProvider>
      </ClerkProvider>
    </WouterRouter>
  );
}

export default App;