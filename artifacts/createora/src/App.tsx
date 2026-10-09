import { useEffect, useRef, useState, type ReactNode, type ChangeEvent, type PointerEvent } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ClerkProvider, SignIn, SignUp, useAuth, useClerk, useSignIn, useUser } from '@clerk/react';
import { shadcn } from '@clerk/themes';
import {
  getGetProfileQueryKey,
  useGetProfile,
  setAuthTokenGetter,
} from '@workspace/api-client-react';
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  UnlockKeyhole,
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
  MousePointer2,
  Type,
  Square,
  Upload,
  Undo2,
  Redo2,
  Download,
  Trash2,
  ZoomIn,
  Grid2X2,
  RotateCw,
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
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
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
    { label: 'Home', icon: <LayoutDashboard size={17} /> },
    { label: 'Projects', icon: <FolderKanban size={17} /> },
    { label: 'Assets', icon: <FileBox size={17} /> },
    { label: 'Templates', icon: <Layers3 size={17} /> },
  ];
  return (
    <aside className="studio-sidebar">
      <div className="studio-brand-row">
        <Wordmark />
        <span className="studio-badge">STUDIO</span>
      </div>

      <button className="studio-new-button" data-testid="button-dashboard-new-project" onClick={() => window.location.href = `${basePath}/projects?new=image`}>
        <span><Plus size={17} /></span>
        <strong>New project</strong>
        <kbd>⌘ N</kbd>
      </button>

      <nav className="studio-nav" aria-label="Createora workspace">
        <span className="studio-nav-label">Workspace</span>
        {sidebarItems.map((item, index) => (
          <a
            className={`studio-nav-item ${index === 0 ? 'active' : ''}`}
            key={item.label}
            href={item.label === 'Assets' ? '/assets' : index === 0 ? '#top' : `#${item.label.toLowerCase()}`}
            data-testid={`link-dashboard-${item.label.toLowerCase()}`}
          >
            {item.icon}<span>{item.label}</span>
            {item.label === 'Projects' && <small>12</small>}
          </a>
        ))}

        <span className="studio-nav-label studio-nav-spaced">Create with AI</span>
        <a className="studio-nav-item studio-ai-nav" href="#ai-studio">
          <span className="studio-nav-ai-icon"><Sparkles size={16} /></span>
          <span>AI Studio</span>
          <Zap size={13} />
        </a>

        <span className="studio-nav-label studio-nav-spaced">Account</span>
        <a className="studio-nav-item" href="#billing"><CreditCard size={17} /><span>Billing</span></a>
        <a className="studio-nav-item" href="#settings"><Settings size={17} /><span>Settings</span></a>
      </nav>

      <div className="studio-sidebar-bottom">
        <div className="studio-credit-mini">
          <div><span>AI credits</span><strong>30 left</strong></div>
          <div className="studio-credit-track"><span /></div>
          <small>Starter plan · <a href="#billing">Upgrade</a></small>
        </div>
        <a className="studio-help" href="mailto:hello@createora.co"><CircleHelp size={16} /> Help center</a>
        <button className="studio-user-row" data-testid="button-dashboard-profile">
          <span className="studio-user-avatar">K</span>
          <span><strong>My workspace</strong><small>Personal</small></span>
          <MoreHorizontal size={16} />
        </button>
        <button className="studio-logout" onClick={onLogout} data-testid="button-dashboard-logout">
          <LogOut size={15} /> Log out
        </button>
      </div>
    </aside>
  );
}

type CreateoraProject = {
  id: string;
  clerkUserId: string;
  name: string;
  type: string;
  width: number | null;
  height: number | null;
  duration: number | null;
  thumbnail: string | null;
  document: unknown;
  createdAt: string;
  updatedAt: string;
};
const projectTypeLabel = (type: string) => type === 'video' ? 'VIDEO' : type === 'image' ? 'IMAGE' : 'DESIGN';
const projectClassName = (type: string) => type === 'video' ? 'project-purple' : type === 'image' ? 'project-orange' : 'project-green';

function ProjectsPage() {
  const { isLoaded, isSignedIn, user, getToken } = useAuth();
  const [, setLocation] = useLocation();
  const [projects, setProjects] = useState<CreateoraProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const loadProjects = async () => {
    const token = await getToken();

    const response = await fetch('/api/projects', {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Unable to load projects');
    }

    setProjects(data.projects ?? []);
  };

  useEffect(() => {
    if (!isSignedIn) return;
    setLoading(true);
    void loadProjects().catch((err) => setError(err instanceof Error ? err.message : 'Unable to load projects')).finally(() => setLoading(false));
  }, [isSignedIn]);

  const createProject = async (type: 'image' | 'video') => {
    if (creating) return;
    setCreating(true);
    setError('');
    try {
      const token = await getToken();
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ name: type === 'video' ? 'Untitled video' : 'Untitled design', type, width: type === 'video' ? 1920 : 1080, height: 1080 }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to create project');
      setLocation(`/editor?project=${data.project.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create project');
      setCreating(false);
    }
  };

  const deleteProject = async (project: CreateoraProject) => {
    if (!window.confirm(`Delete “${project.name}”? This cannot be undone.`)) return;
    try {
      const token = await getToken();
      const response = await fetch(`/api/projects/${project.id}`, { method: 'DELETE', headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (!response.ok) { const data = await response.json(); throw new Error(data.error || 'Unable to delete project'); }
      setProjects((current) => current.filter((item) => item.id !== project.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete project');
    }
  };

  useEffect(() => {
    const requestedType = new URLSearchParams(window.location.search).get('new');
    if (requestedType && isSignedIn && !creating) void createProject(requestedType === 'video' ? 'video' : 'image');
  }, [isSignedIn]);

  if (!isLoaded) return <main className="projects-loading">Opening Projects…</main>;
  if (!isSignedIn) return <Redirect to="/sign-in" />;

  const visibleProjects = projects.filter((project) => project.name.toLowerCase().includes(search.trim().toLowerCase()));

  return (
    <main className="projects-page">
      <header className="projects-header"><div className="projects-header-left"><button className="projects-back" onClick={() => setLocation('/dashboard')} aria-label="Back to dashboard"><ArrowRight size={16} /></button><Wordmark /><span className="projects-divider" /><div><span className="projects-kicker">WORKSPACE</span><strong>Projects</strong></div></div><div className="projects-header-actions"><span className="projects-user">{user?.firstName?.[0] ?? 'C'}</span></div></header>
      <section className="projects-main">
        <div className="projects-hero"><div><span className="eyebrow">02 · Your work</span><h1>Everything you create,<br /><span>in one place.</span></h1><p>Projects are saved to your workspace automatically. Open a project anytime and keep editing where you left off.</p></div>
          <div className="projects-create-grid"><button className="project-create-card image" onClick={() => void createProject('image')} disabled={creating}><span><ImagePlus size={20} /></span><strong>New image</strong><small>1080 × 1080 canvas</small><ArrowUpRight size={16} /></button><button className="project-create-card video" onClick={() => void createProject('video')} disabled={creating}><span><Video size={20} /></span><strong>New video</strong><small>1920 × 1080 canvas</small><ArrowUpRight size={16} /></button></div>
        </div>
        <div className="projects-toolbar"><div><span className="projects-count">{projects.length}</span> {projects.length === 1 ? 'project' : 'projects'}</div><label><Target size={14} /><input id="projects-search" name="projects-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search projects…" /></label></div>
        {error && <div className="projects-error">{error}</div>}
        {loading ? <div className="projects-grid">{Array.from({ length: 6 }).map((_, index) => <div className="project-card-skeleton" key={index} />)}</div> : visibleProjects.length ? <div className="projects-grid">{visibleProjects.map((project) => <article className="workspace-project-card" key={project.id}><button className={`workspace-project-art ${projectClassName(project.type)}`} onClick={() => setLocation(`/editor?project=${project.id}`)} aria-label={`Open ${project.name}`}><span>{projectTypeLabel(project.type)}</span><div className="workspace-art-shape" /></button><div className="workspace-project-meta"><button onClick={() => setLocation(`/editor?project=${project.id}`)}><strong>{project.name}</strong><small>{project.width ?? 1080} × {project.height ?? 1080} · {new Date(project.updatedAt).toLocaleDateString()}</small></button><button className="workspace-project-delete" onClick={() => void deleteProject(project)} aria-label={`Delete ${project.name}`}><Trash2 size={15} /></button></div></article>)}</div> : <div className="projects-empty"><div><FolderKanban size={22} /></div><strong>No projects yet</strong><span>Create your first image or video project above. Your work will stay saved in your workspace.</span><button onClick={() => void createProject('image')}><Plus size={14} /> Create project</button></div>}
      </section>
    </main>
  );
}

function DashboardPage() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();
  const [, setLocation] = useLocation();
  const profileQuery = useGetProfile({ query: { enabled: Boolean(isSignedIn), queryKey: getGetProfileQueryKey() } });

  if (!isLoaded) return <main className="studio-loading">Loading your studio…</main>;
  if (!isSignedIn) return <Redirect to="/sign-in" />;

  const firstName = user?.firstName || user?.username || 'creator';
  const credits = profileQuery.data?.credits ?? 30;
  const plan = profileQuery.data?.plan === 'studio' ? 'Studio' : 'Starter';

  const quickCreate: Array<{ title: string; description: string; icon: ReactNode; className: string; action?: () => void }> = [
    { title: 'AI Image', description: 'Generate a visual from a prompt', icon: <ImagePlus size={22} />, className: 'image' },
    { title: 'AI Video', description: 'Turn an idea into motion', icon: <Video size={22} />, className: 'video' },
    { title: 'New Design', description: 'Start with a blank canvas', icon: <PenLine size={22} />, className: 'design', action: () => setLocation('/projects?new=image') },
    { title: 'Script', description: 'Write your next story', icon: <FileText size={22} />, className: 'script' },
  ];

  const [recentProjects, setRecentProjects] = useState<CreateoraProject[]>([]);
  useEffect(() => {
    if (!isSignedIn) return;
    void (async () => {
      try {
        const token = await getToken();
        const response = await fetch('/api/projects', { headers: token ? { Authorization: `Bearer ${token}` } : {} });
        if (response.ok) { const data = await response.json(); setRecentProjects((data.projects ?? []).slice(0, 3)); }
      } catch {}
    })();
  }, [isSignedIn]);

  return (
    <main className="studio-shell">
      <DashboardSidebar onLogout={() => signOut({ redirectUrl: basePath || '/' })} />

      <section className="studio-main">
        <header className="studio-topbar">
          <div className="studio-mobile-brand"><Wordmark /></div>
          <div className="studio-search">
            <span><ArrowRight size={14} /></span>
            <input placeholder="Search projects, assets and templates" aria-label="Search workspace" />
            <kbd>/</kbd>
          </div>
          <div className="studio-top-actions">
            <button className="studio-icon-btn" aria-label="Notifications"><Clock3 size={17} /></button>
            <div className="studio-top-avatar">{user?.firstName?.[0] ?? 'C'}{user?.lastName?.[0] ?? ''}</div>
          </div>
        </header>

        <div className="studio-page">
          <section className="studio-welcome">
            <div>
              <span className="studio-eyebrow"><span className="studio-status-dot" /> YOUR CREATIVE WORKSPACE</span>
              <h1>Good morning, {firstName}.</h1>
              <p>What are you making today? Start from an idea or jump straight into a tool.</p>
            </div>
            <div className="studio-date">AUG 2026 <span>•</span> {plan.toUpperCase()}</div>
          </section>

          <section className="studio-hero-card">
            <div className="studio-hero-copy">
              <span className="studio-eyebrow light">CREATEORA AI</span>
              <h2>Start with an idea.<br /><em>We'll build from there.</em></h2>
              <p>Describe what you want to create and let Createora turn the rough idea into a first draft.</p>
            </div>
            <div className="studio-prompt-wrap">
              <div className="studio-prompt-box">
                <WandSparkles size={19} />
                <span>“Create a bold launch visual for…”</span>
                <button aria-label="Start with AI" onClick={() => setLocation('/dashboard#ai-studio')}><ArrowRight size={17} /></button>
              </div>
              <div className="studio-prompt-hints"><span>Try: product ad</span><span>Try: Instagram reel</span><span>Try: brand poster</span></div>
            </div>
            <div className="studio-orbit studio-orbit-one" />
            <div className="studio-orbit studio-orbit-two" />
          </section>

          <section className="studio-section">
            <div className="studio-section-head">
              <div><span className="studio-eyebrow">QUICK CREATE</span><h2>Choose your starting point</h2></div>
              <a href="#templates">Explore templates <ArrowRight size={14} /></a>
            </div>
            <div className="studio-quick-grid">
              {quickCreate.map((tool) => (
                <button key={tool.title} className={`studio-quick-card ${tool.className}`} onClick={tool.action}>
                  <span className="studio-quick-icon">{tool.icon}</span>
                  <span><strong>{tool.title}</strong><small>{tool.description}</small></span>
                  <ArrowUpRight className="studio-card-arrow" size={16} />
                </button>
              ))}
            </div>
          </section>

          <div className="studio-content-grid">
            <section className="studio-section studio-projects" id="projects">
              <div className="studio-section-head">
                <div><span className="studio-eyebrow">YOUR WORK</span><h2>Recent projects</h2></div>
                <a href="#projects">View all <ArrowRight size={14} /></a>
              </div>
              <div className="studio-project-grid">
                {recentProjects.length ? recentProjects.map((project) => (
                  <button className="studio-project-card" key={project.id} onClick={() => setLocation(`/editor?project=${project.id}`)}>
                    <div className={`studio-project-art ${projectClassName(project.type)}`}><span>{projectTypeLabel(project.type)}</span><div className="studio-art-shape" /></div>
                    <div className="studio-project-meta"><div><strong>{project.name}</strong><small>{project.width ?? 1080} × {project.height ?? 1080} · {new Date(project.updatedAt).toLocaleDateString()}</small></div><MoreHorizontal size={16} /></div>
                  </button>
                )) : (
                  <button className="studio-project-card studio-project-empty-card" onClick={() => setLocation('/projects?new=image')}>
                    <div className="studio-project-art project-green"><span>START</span><div className="studio-art-shape" /></div>
                    <div className="studio-project-meta"><div><strong>Create your first project</strong><small>Your saved projects will appear here.</small></div><ArrowRight size={16} /></div>
                  </button>
                )}
              </div>
            </section>

            <aside className="studio-side-stack">
              <section className="studio-panel" id="ai-studio">
                <div className="studio-panel-top"><span className="studio-panel-icon"><Sparkles size={17} /></span><span>AI Studio</span><span className="studio-live-pill">LIVE</span></div>
                <h3>One workspace.<br />Every format.</h3>
                <p>Generate images, video concepts, scripts and social content without leaving your creative flow.</p>
                <button onClick={() => setLocation('/dashboard#ai-studio')}>Open AI Studio <ArrowRight size={14} /></button>
              </section>

              <section className="studio-panel studio-usage-panel">
                <div className="studio-panel-top"><span>MONTHLY USAGE</span><Sparkles size={15} /></div>
                <div className="studio-usage-number"><strong>{credits}</strong><span>credits<br />remaining</span></div>
                <div className="studio-usage-track"><span style={{ width: `${Math.min(100, Math.max(8, (credits / 30) * 100))}%` }} /></div>
                <div className="studio-usage-footer"><span>{plan} plan</span><a href="#billing">Manage plan</a></div>
              </section>
            </aside>
          </div>

          <section className="studio-section studio-templates" id="templates">
            <div className="studio-section-head">
              <div><span className="studio-eyebrow">START FASTER</span><h2>Popular templates</h2></div>
              <a href="#templates">Browse library <ArrowRight size={14} /></a>
            </div>
            <div className="studio-template-row">
              <button className="studio-template-card"><span className="template-art template-social">NEW<br />DROP</span><strong>Product launch</strong><small>Social · 9:16</small></button>
              <button className="studio-template-card"><span className="template-art template-promo">BIG<br />SALE</span><strong>Promo campaign</strong><small>Ad · 1:1</small></button>
              <button className="studio-template-card"><span className="template-art template-reel">YOUR<br />STORY</span><strong>Story reel</strong><small>Video · 9:16</small></button>
              <button className="studio-template-card"><span className="template-art template-brand">BRAND<br />NOTE</span><strong>Brand announcement</strong><small>Post · 4:5</small></button>
            </div>
          </section>
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
  const { getToken } = useAuth();

  useEffect(() => {
    setAuthTokenGetter(getToken);

    return () => {
      setAuthTokenGetter(null);
    };
  }, [getToken]);

  useEffect(
    () =>
      addListener(({ user }) => {
        if (!user) queryClient.clear();
      }),
    [addListener],
  );

  return null;
}

type EditorElement = {
  id: string;
  type: 'text' | 'shape' | 'image' | 'video';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  startTime?: number;
  duration?: number;
  trimStart?: number;
  trimEnd?: number;
  speed?: number;
  volume?: number;
  fadeIn?: number;
  fadeOut?: number;
  text?: string;
  color?: string;
  src?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: number;
  textAlign?: 'left' | 'center' | 'right';
  italic?: boolean;
  opacity?: number;
  borderRadius?: number;
  brightness?: number;
  contrast?: number;
  saturation?: number;
  grayscale?: number;
  blur?: number;
  fit?: 'cover' | 'contain';
  flipX?: boolean;
  flipY?: boolean;
  strokeColor?: string;
  strokeWidth?: number;
};

const canvasPresets = [
  { label: 'Square post · 1080 × 1080', width: 1080, height: 1080 },
  { label: 'Portrait post · 1080 × 1350', width: 1080, height: 1350 },
  { label: 'Story / Reel · 1080 × 1920', width: 1080, height: 1920 },
  { label: 'Landscape · 1200 × 675', width: 1200, height: 675 },
  { label: 'Classic landscape · 900 × 600', width: 900, height: 600 },
];

function CreateoraEditor() {
  const { isLoaded, isSignedIn, user, getToken } = useAuth();
  const [, setLocation] = useLocation();
  const [elements, setElements] = useState<EditorElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [layersOpen, setLayersOpen] = useState(true);
  const [mobileInspectorOpen, setMobileInspectorOpen] = useState(false);
  const [hiddenLayers, setHiddenLayers] = useState<Set<string>>(() => new Set());
  const [lockedLayers, setLockedLayers] = useState<Set<string>>(() => new Set());
  const [layerNames, setLayerNames] = useState<Record<string, string>>({});
  const [tool, setTool] = useState<'select' | 'text' | 'shape' | 'image' | 'ai'>('select');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiAspectRatio, setAiAspectRatio] = useState('1:1');
  const [aiImage, setAiImage] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [zoom, setZoom] = useState(72);
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [showGuides, setShowGuides] = useState(true);
  const [snapGuides, setSnapGuides] = useState<{ x?: number; y?: number }>({});
  const [canvasWidth, setCanvasWidth] = useState(1080);
  const [canvasHeight, setCanvasHeight] = useState(1080);
  const [canvasBackground, setCanvasBackground] = useState('#ffffff');
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [history, setHistory] = useState<EditorElement[][]>([]);
  const [future, setFuture] = useState<EditorElement[][]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    id: string; mode: 'move' | 'resize'; offsetX: number; offsetY: number;
    handle?: string; startClientX?: number; startClientY?: number;
    startX?: number; startY?: number; startWidth?: number; startHeight?: number;
  } | null>(null);
  const [projectName, setProjectName] = useState('Untitled design');
  const [projectId, setProjectId] = useState<string | null>(() => new URLSearchParams(window.location.search).get('project'));
  const [projectReady, setProjectReady] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [timelineOpen, setTimelineOpen] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timelineDuration, setTimelineDuration] = useState(30);
  const playTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const selected = elements.find((element) => element.id === selectedId);
  const selectedMedia = selected?.type === 'image' || selected?.type === 'video' ? selected : null;

  const getLayerName = (element: EditorElement, index: number) =>
    layerNames[element.id] || (element.type === 'text' ? element.text || `Text ${index + 1}` : `${element.type[0].toUpperCase()}${element.type.slice(1)} ${index + 1}`);

  const toggleLayerHidden = (id: string) => {
    setHiddenLayers((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleLayerLocked = (id: string) => {
    setLockedLayers((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const renameLayer = (id: string) => {
    const current = layerNames[id] || elements.find((element) => element.id === id)?.text || 'Layer';
    const name = window.prompt('Rename layer', current);
    if (name?.trim()) setLayerNames((currentNames) => ({ ...currentNames, [id]: name.trim() }));
  };

  const moveLayer = (id: string, direction: 'up' | 'down') => {
    const index = elements.findIndex((element) => element.id === id);
    if (index < 0) return;
    const nextIndex = direction === 'up' ? index + 1 : index - 1;
    if (nextIndex < 0 || nextIndex >= elements.length) return;
    const next = [...elements];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    commit(next);
  };

  useEffect(() => {
    if (!isSignedIn) return;
    let cancelled = false;
    void (async () => {
      try {
        const token = await getToken();
        if (!token) throw new Error('Your session expired. Please sign in again.');
        const requestedId = new URLSearchParams(window.location.search).get('project');
        if (requestedId) {
          const response = await fetch(`/api/projects/${requestedId}`, { headers: { Authorization: `Bearer ${token}` } });
          const data = await response.json();
          if (!response.ok) throw new Error(data.error || 'Unable to open project');
          const documentData = data.project.document as { elements?: unknown[] } | null;
          const savedElements = Array.isArray(documentData?.elements) ? documentData.elements as EditorElement[] : [];
          if (!cancelled) {
            setProjectId(data.project.id);
            setProjectName(data.project.name);
            setElements(savedElements);
            setProjectReady(true);
          }
          return;
        }
        const response = await fetch('/api/projects', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ name: 'Untitled design', type: 'image', width: 1080, height: 1080 }) });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Unable to create project');
        if (!cancelled) {
          setProjectId(data.project.id);
          setProjectName(data.project.name);
          setProjectReady(true);
          setLocation(`/editor?project=${data.project.id}`);
        }
      } catch (error) {
        if (!cancelled) window.alert(error instanceof Error ? error.message : 'Unable to open project');
      }
    })();
    return () => { cancelled = true; };
  }, [isSignedIn]);

  useEffect(() => {
    if (!isPlaying) {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
      return;
    }
    playTimerRef.current = setInterval(() => {
      setCurrentTime((time) => {
        if (time >= timelineDuration) {
          setIsPlaying(false);
          return 0;
        }
        return Math.min(timelineDuration, time + 0.1);
      });
    }, 100);
    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, [isPlaying, timelineDuration]);

  useEffect(() => {
    const durations = elements
      .filter((element) => element.type === 'video' && element.duration)
      .map((element) => (element.startTime ?? 0) + (element.duration ?? 0));
    if (durations.length) setTimelineDuration(Math.max(30, Math.ceil(Math.max(...durations))));
  }, [elements]);

  useEffect(() => {
    if (currentTime > timelineDuration) setCurrentTime(timelineDuration);
  }, [currentTime, timelineDuration]);

  useEffect(() => {
    if (!projectReady || !projectId) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      void (async () => {
        try {
          const token = await getToken();
          if (!token) return;
          await fetch(`/api/projects/${projectId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ name: projectName, document: { version: 1, elements } }) });
        } catch {}
      })();
    }, 650);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [elements, projectName, projectId, projectReady]);



  const generateAIImage = async () => {
    if (!aiPrompt.trim() || aiLoading) return;
    setAiLoading(true);
    setAiError('');
    setAiImage(null);

    try {
      const token = await getToken();
      const response = await fetch('/api/ai/images/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          prompt: aiPrompt.trim(),
          aspectRatio: aiAspectRatio,
        }),
      });

      const raw = await response.text();
      let data: { image?: string; error?: string } = {};

      if (raw.trim()) {
        try {
          data = JSON.parse(raw);
        } catch {
          const bodyPreview = raw.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 240);
          throw new Error(
            bodyPreview
              ? `AI server returned an invalid response (HTTP ${response.status}): ${bodyPreview}`
              : `AI server returned an invalid response (HTTP ${response.status}). Check the API server terminal for the error.`,
          );
        }
      }
      if (!response.ok) {
        throw new Error(
          data.error || `AI image generation failed (HTTP ${response.status})`,
        );
      }

      if (!data.image) {
        throw new Error('The AI server returned no image data.');
      }

      setAiImage(data.image);
    } catch (error) {
      setAiError(error instanceof Error ? error.message : 'Unable to generate image');
    } finally {
      setAiLoading(false);
    }
  };

  const addGeneratedImage = () => {
    if (!aiImage) return;
    const dimensions: Record<string, { width: number; height: number }> = {
      '1:1': { width: 360, height: 360 },
      '16:9': { width: 500, height: 281 },
      '9:16': { width: 300, height: 533 },
      '4:3': { width: 480, height: 360 },
    };
    const size = dimensions[aiAspectRatio] || dimensions['1:1'];
    addElement({
      id: crypto.randomUUID(),
      type: 'image',
      x: Math.round((900 - size.width) / 2),
      y: Math.round((600 - size.height) / 2),
      width: size.width,
      height: size.height,
      rotation: 0,
      src: aiImage,
    });
    setAiImage(null);
    setAiPrompt('');
  };

  if (!isLoaded) return <main className="editor-loading">Opening editor…</main>;
  if (!isSignedIn) return <Redirect to="/sign-in" />;

  const commit = (next: EditorElement[]) => {
    setHistory((current) => [...current.slice(-19), elements]);
    setFuture([]);
    setElements(next);
  };

  const addElement = (element: EditorElement) => {
    commit([...elements, element]);
    setSelectedId(element.id);
    setTool('select');
  };

  const addText = () => addElement({
    id: crypto.randomUUID(), type: 'text', x: 240, y: 190, width: 420, height: 90,
    rotation: 0, text: 'Your headline', color: '#151915'
  });

  const addShape = () => addElement({
    id: crypto.randomUUID(), type: 'shape', x: 270, y: 240, width: 260, height: 160,
    rotation: 0, color: '#2f9e64'
  });

  const onUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      if (!file.type.startsWith('image/')) {
        throw new Error('The editor currently accepts image files only.');
      }

      const token = await getToken();
      if (!token) {
        throw new Error('Your session expired. Please sign in again.');
      }

      const image = new Image();
      const objectUrl = URL.createObjectURL(file);

      try {
        image.src = objectUrl;

        await new Promise<void>((resolve, reject) => {
          image.onload = () => resolve();
          image.onerror = () => reject(new Error('Unable to read uploaded image'));
        });

        const asset = await uploadAssetDirect(file, token, {
          width: image.naturalWidth || null,
          height: image.naturalHeight || null,
        });

        addElement({
          id: crypto.randomUUID(),
          type: 'image',
          x: 180,
          y: 140,
          width: 420,
          height: 300,
          rotation: 0,
          src: asset.url,
        });
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : 'Unable to upload image',
      );
    } finally {
      event.target.value = '';
    }
  };

  const videoElements = elements.filter((element) => element.type === 'video');
  const selectedVideo = selected?.type === 'video' ? selected : null;

  const setClipTime = (id: string, patch: Partial<EditorElement>) => {
    commit(elements.map((element) => element.id === id ? { ...element, ...patch } : element));
  };

  const duplicateSelected = () => {
    if (!selected) return;
    const copy = {
      ...selected,
      id: crypto.randomUUID(),
      x: Math.min(900 - selected.width, selected.x + 24),
      y: Math.min(600 - selected.height, selected.y + 24),
      startTime: selected.startTime != null ? selected.startTime + 1 : undefined,
    };
    addElement(copy);
  };

  const splitSelectedClip = () => {
    if (!selectedVideo) return;
    const start = selectedVideo.startTime ?? 0;
    const duration = selectedVideo.duration ?? 5;
    const splitAt = Math.max(0.5, Math.min(duration - 0.5, currentTime - start));
    if (splitAt <= 0.5 || splitAt >= duration - 0.5) return;
    const first = { ...selectedVideo, duration: splitAt, trimEnd: (selectedVideo.trimStart ?? 0) + splitAt };
    const second = {
      ...selectedVideo,
      id: crypto.randomUUID(),
      startTime: start + splitAt,
      duration: duration - splitAt,
      trimStart: (selectedVideo.trimStart ?? 0) + splitAt,
    };
    commit(elements.map((element) => element.id === selectedVideo.id ? first : element).concat(second));
    setSelectedId(second.id);
  };

  const updateSelected = (patch: Partial<EditorElement>) => {
    if (!selectedId) return;
    const next = elements.map((element) => element.id === selectedId ? { ...element, ...patch } : element);
    commit(next);
  };

  const removeLayer = (id: string) => {
    commit(elements.filter((element) => element.id !== id));
    setHiddenLayers((current) => { const next = new Set(current); next.delete(id); return next; });
    setLockedLayers((current) => { const next = new Set(current); next.delete(id); return next; });
    if (selectedId === id) setSelectedId(null);
  };

  const removeSelected = () => {
    if (!selectedId) return;
    commit(elements.filter((element) => element.id !== selectedId));
    setSelectedId(null);
  };

  const undo = () => {
    if (!history.length) return;
    const previous = history[history.length - 1];
    setFuture((current) => [elements, ...current].slice(0, 20));
    setElements(previous);
    setHistory((current) => current.slice(0, -1));
    setSelectedId(null);
  };

  const redo = () => {
    if (!future.length) return;
    const next = future[0];
    setHistory((current) => [...current, elements].slice(-20));
    setElements(next);
    setFuture((current) => current.slice(1));
    setSelectedId(null);
  };

  const handlePointerDown = (event: PointerEvent, element: EditorElement) => {
    if (tool !== 'select') return;
    event.stopPropagation();
    setSelectedId(element.id);
    const rect = (event.currentTarget as HTMLElement).parentElement?.getBoundingClientRect();
    if (!rect) return;
    dragRef.current = {
      id: element.id,
      offsetX: event.clientX - rect.left - element.x * (zoom / 100),
      offsetY: event.clientY - rect.top - element.y * (zoom / 100),
    };
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent) => {
    if (!dragRef.current) return;
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const scale = zoom / 100;
    const moving = elements.find((item) => item.id === dragRef.current?.id);
    if (!moving) return;
    let x = Math.max(0, Math.min(900 - moving.width, (event.clientX - rect.left - dragRef.current.offsetX) / scale));
    let y = Math.max(0, Math.min(600 - moving.height, (event.clientY - rect.top - dragRef.current.offsetY) / scale));
    const guides: { x?: number; y?: number } = {};
    if (snapEnabled) {
      const threshold = 10;
      const centerX = (900 - moving.width) / 2;
      const centerY = (600 - moving.height) / 2;
      if (Math.abs(x - centerX) <= threshold) { x = centerX; guides.x = 450; }
      else if (Math.abs(x) <= threshold) { x = 0; guides.x = 0; }
      else if (Math.abs(x + moving.width - 900) <= threshold) { x = 900 - moving.width; guides.x = 900; }
      if (Math.abs(y - centerY) <= threshold) { y = centerY; guides.y = 300; }
      else if (Math.abs(y) <= threshold) { y = 0; guides.y = 0; }
      else if (Math.abs(y + moving.height - 600) <= threshold) { y = 600 - moving.height; guides.y = 600; }
    }
    setSnapGuides(showGuides ? guides : {});
    setElements((current) => current.map((item) => item.id === dragRef.current?.id ? { ...item, x, y } : item));
  };

  const finishDrag = () => {
    if (!dragRef.current) return;
    const current = elements;
    setHistory((h) => [...h.slice(-19), current]);
    setFuture([]);
    dragRef.current = null;
    setSnapGuides({});
  };

  return (
    <main className="createora-editor">
      <header className="editor-topbar">
        <div className="editor-brand">
          <button className="editor-back" onClick={() => setLocation('/dashboard')}><ArrowRight size={17} /></button>
          <Wordmark />
          <span className="editor-divider" />
          <div className="editor-project-name"><strong>{projectName}</strong><small>{projectReady ? 'Saved to workspace' : 'Creating project…'}</small></div>
        </div>
        <div className="editor-top-center">
          <button onClick={undo} disabled={!history.length} aria-label="Undo"><Undo2 size={16} /></button>
          <button onClick={redo} disabled={!future.length} aria-label="Redo"><Redo2 size={16} /></button>
          <span className="editor-save-dot" /> Saved
        </div>
        <div className="editor-top-right">
          <button className="editor-icon-action"><Share2 size={16} /> Share</button>
          <button className="editor-export" onClick={() => window.print()}><Download size={15} /> Export</button>
          <div className="editor-avatar">{user?.firstName?.[0] ?? 'C'}</div>
        </div>
      </header>

      <div className="editor-body">
        <aside className="editor-toolbar">
          <button className={tool === 'select' ? 'active' : ''} onClick={() => setTool('select')}><MousePointer2 size={19} /><span>Select</span></button>
          <button className={tool === 'text' ? 'active' : ''} onClick={() => addText()}><Type size={19} /><span>Text</span></button>
          <button className={tool === 'shape' ? 'active' : ''} onClick={() => addShape()}><Square size={19} /><span>Shape</span></button>
          <button onClick={() => fileRef.current?.click()}><Upload size={19} /><span>Upload</span></button>
          <button onClick={() => setLocation('/assets')}><ImagePlus size={19} /><span>Media</span></button>
          <button className={snapEnabled ? 'active' : ''} onClick={() => setSnapEnabled((enabled) => !enabled)} title="Toggle snapping"><Target size={18} /><span>Snap</span></button>
          <button className={tool === 'ai' ? 'active' : ''} onClick={() => { setTool('ai'); setSelectedId(null); }}><Sparkles size={19} /><span>AI</span></button>
          <div className="editor-tool-spacer" />
          <button className={layersOpen ? 'active' : ''} onClick={() => setLayersOpen((open) => !open)}><Grid2X2 size={18} /><span>Layers</span></button>
        </aside>

        {layersOpen && (
          <aside className="editor-layers-panel" aria-label="Layers panel">
            <div className="editor-layers-head">
              <div><span>STACK</span><strong>Layers</strong></div>
              <span className="editor-layer-count">{elements.length}</span>
            </div>
            <div className="editor-layers-actions">
              <button onClick={() => addText()}><Type size={13} /> Text</button>
              <button onClick={() => addShape()}><Square size={13} /> Shape</button>
              <button onClick={() => fileRef.current?.click()}><Upload size={13} /> Media</button>
            </div>
            <div className="editor-layers-list">
              {[...elements].reverse().map((element, reverseIndex) => {
                const originalIndex = elements.length - 1 - reverseIndex;
                const hidden = hiddenLayers.has(element.id);
                const locked = lockedLayers.has(element.id);
                return (
                  <div key={element.id} className={`editor-layer-row ${selectedId === element.id ? 'selected' : ''} ${hidden ? 'hidden' : ''}`}>
                    <button className="editor-layer-main" onClick={() => { setSelectedId(element.id); setTool('select'); }} disabled={locked && hidden}>
                      <span className={`editor-layer-thumb type-${element.type}`}>
                        {element.type === 'text' ? <Type size={13} /> : element.type === 'shape' ? <Square size={12} /> : element.type === 'video' ? <Video size={12} /> : <ImageIcon size={12} />}
                      </span>
                      <span className="editor-layer-copy"><strong>{getLayerName(element, originalIndex)}</strong><small>{element.type.toUpperCase()}</small></span>
                    </button>
                    <div className="editor-layer-controls">
                      <button onClick={() => toggleLayerHidden(element.id)} aria-label={hidden ? 'Show layer' : 'Hide layer'} title={hidden ? 'Show' : 'Hide'}>{hidden ? <EyeOff size={13} /> : <Eye size={13} />}</button>
                      <button onClick={() => toggleLayerLocked(element.id)} aria-label={locked ? 'Unlock layer' : 'Lock layer'} title={locked ? 'Unlock' : 'Lock'}>{locked ? <LockKeyhole size={13} /> : <UnlockKeyhole size={13} />}</button>
                      <button onClick={() => renameLayer(element.id)} aria-label="Rename layer" title="Rename"><PenLine size={12} /></button>
                      <button onClick={() => moveLayer(element.id, 'up')} disabled={originalIndex === elements.length - 1} aria-label="Bring forward" title="Bring forward">↑</button>
                      <button onClick={() => moveLayer(element.id, 'down')} disabled={originalIndex === 0} aria-label="Send backward" title="Send backward">↓</button>
                      <button className="danger" onClick={() => removeLayer(element.id)} aria-label="Delete layer" title="Delete"><Trash2 size={12} /></button>
                    </div>
                  </div>
                );
              })}
              {!elements.length && <div className="editor-layers-empty"><Layers3 size={18} /><span>No layers yet</span><small>Add text, shapes, images or video.</small></div>}
            </div>
            <div className="editor-layers-foot"><span>Top layer renders in front</span><span>Drag ordering coming next</span></div>
          </aside>
        )}

        <section className="editor-stage">
          <div className="editor-stage-head">
            <div><span>DESIGN</span><strong>1080 × 1080</strong><button className="mobile-inspector-toggle" onClick={() => setMobileInspectorOpen((open) => !open)} aria-expanded={mobileInspectorOpen}>{mobileInspectorOpen ? 'Hide properties' : 'Properties'}</button></div>
            <div className="editor-zoom"><button onClick={() => setZoom(Math.max(25, zoom - 10))} aria-label="Zoom out">−</button><span>{zoom}%</span><button onClick={() => setZoom(Math.min(120, zoom + 10))} aria-label="Zoom in"><ZoomIn size={14} /></button><button className="editor-zoom-fit" onClick={() => setZoom(30)} title="Fit canvas to phone">Fit</button></div>
          </div>
          <div className="editor-canvas-wrap">
            <div
              className="editor-canvas"
              style={{ width: 900 * zoom / 100, height: 600 * zoom / 100 }}
              onPointerDown={() => setSelectedId(null)}
              onPointerMove={handlePointerMove}
              onPointerUp={finishDrag}
              onPointerLeave={finishDrag}
            >
              <div className="editor-canvas-grid" />
              <div className="editor-ruler editor-ruler-horizontal" aria-hidden="true"><span>0</span><span>225</span><span>450</span><span>675</span><span>900</span></div>
              <div className="editor-ruler editor-ruler-vertical" aria-hidden="true"><span>0</span><span>150</span><span>300</span><span>450</span><span>600</span></div>
              {showGuides && snapGuides.x !== undefined && <div className="editor-snap-guide editor-snap-guide-x" style={{ left: snapGuides.x * zoom / 100 }}><span>{snapGuides.x}</span></div>}
              {showGuides && snapGuides.y !== undefined && <div className="editor-snap-guide editor-snap-guide-y" style={{ top: snapGuides.y * zoom / 100 }}><span>{snapGuides.y}</span></div>}
              {elements.map((element) => (
                <div
                  key={element.id}
                  className={`editor-element editor-element-${element.type} ${selectedId === element.id ? 'selected' : ''} ${hiddenLayers.has(element.id) ? 'editor-layer-hidden' : ''}`}
                  style={{
                    visibility: hiddenLayers.has(element.id) ? 'hidden' : 'visible',
                    left: element.x * zoom / 100, top: element.y * zoom / 100,
                    width: element.width * zoom / 100, height: element.height * zoom / 100,
                    transform: `rotate(${element.rotation}deg)`,
                    background: element.type === 'shape' ? element.color : undefined,
                  }}
                  onPointerDown={(event) => { if (lockedLayers.has(element.id) || hiddenLayers.has(element.id)) { event.stopPropagation(); setSelectedId(element.id); return; } handlePointerDown(event, element); }}
                >
                  {element.type === 'text' && <span>{element.text}</span>}
                  {element.type === 'image' && element.src && <img src={element.src} alt="" draggable={false} />}
                  {element.type === 'video' && element.src && <video src={element.src} muted playsInline preload="metadata" draggable={false} />}
                  {selectedId === element.id && <span className="editor-selection-label">{cropMode ? 'CROP' : element.type.toUpperCase()}</span>}
                </div>
              ))}
              {!elements.length && (
                <div className="editor-empty-canvas" onClick={(event) => { event.stopPropagation(); addText(); }}>
                  <span><Sparkles size={21} /></span>
                  <strong>Start creating</strong>
                  <small>Add text, shapes or upload an image</small>
                </div>
              )}
            </div>
          </div>
          <footer className="editor-bottom-bar">
            <span>Page 1 of 1</span>
            <span>•</span>
            <span>Autosave on</span>
            <button className="timeline-toggle" onClick={() => setTimelineOpen((open) => !open)}>
              <Video size={12} /> {timelineOpen ? 'Hide timeline' : 'Show timeline'}
            </button>
          </footer>
          <div className="editor-mobile-actions" aria-label="Mobile editing tools">
            <button onClick={() => addText()}><Type size={17} /><span>Text</span></button>
            <button onClick={() => addShape()}><Square size={16} /><span>Shape</span></button>
            <button onClick={() => fileRef.current?.click()}><Upload size={17} /><span>Upload</span></button>
            <button className={layersOpen ? 'active' : ''} onClick={() => setLayersOpen((open) => !open)}><Grid2X2 size={16} /><span>Layers</span></button>
            <button className={mobileInspectorOpen ? 'active' : ''} onClick={() => setMobileInspectorOpen((open) => !open)} aria-expanded={mobileInspectorOpen}><Settings size={16} /><span>Properties</span></button>
          </div>
          {timelineOpen && (
            <section className="editor-timeline" aria-label="Video timeline">
              <div className="timeline-toolbar">
                <div className="timeline-transport">
                  <button onClick={() => setCurrentTime(0)} title="Jump to start">↤</button>
                  <button className="timeline-play" onClick={() => setIsPlaying((playing) => !playing)} title={isPlaying ? 'Pause' : 'Play'}>
                    {isPlaying ? 'Ⅱ' : <Play size={13} fill="currentColor" />}
                  </button>
                  <button onClick={() => setCurrentTime(Math.min(timelineDuration, currentTime + 5))}>+5s</button>
                  <span className="timeline-time">{currentTime.toFixed(1)}s / {timelineDuration.toFixed(1)}s</span>
                </div>
                <div className="timeline-actions">
                  <button onClick={duplicateSelected} disabled={!selected}>Duplicate</button>
                  <button onClick={splitSelectedClip} disabled={!selectedVideo}>Split</button>
                  <button onClick={() => selectedVideo && setClipTime(selectedVideo.id, { volume: Math.max(0, (selectedVideo.volume ?? 1) - 0.1) })} disabled={!selectedVideo}>− Vol</button>
                  <button onClick={() => selectedVideo && setClipTime(selectedVideo.id, { volume: Math.min(1, (selectedVideo.volume ?? 1) + 0.1) })} disabled={!selectedVideo}>+ Vol</button>
                </div>
              </div>
              <div className="timeline-ruler-wrap">
                <div className="timeline-ruler">
                  {Array.from({ length: Math.ceil(timelineDuration / 5) + 1 }, (_, index) => index * 5).map((second) => (
                    <span key={second} style={{ left: (second / timelineDuration) * 100 + '%' }}>{second}s</span>
                  ))}
                </div>
                <div
                  className="timeline-scroll"
                  onClick={(event) => {
                    const rect = event.currentTarget.getBoundingClientRect();
                    const ratio = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
                    setCurrentTime(ratio * timelineDuration);
                  }}
                >
                  <div className="timeline-playhead" style={{ left: (currentTime / timelineDuration) * 100 + '%' }}><i /></div>
                  <div className="timeline-track-labels">
                    <div className="timeline-track-label"><Layers3 size={12} /><span>Video</span></div>
                    <div className="timeline-track-label"><span className="timeline-audio-dot" /><span>Audio</span></div>
                  </div>
                  <div className="timeline-tracks">
                    <div className="timeline-track">
                      {videoElements.length ? videoElements.map((clip, index) => {
                        const start = clip.startTime ?? index * 5;
                        const duration = clip.duration ?? 5;
                        const left = (start / timelineDuration) * 100;
                        const width = Math.max(5, (duration / timelineDuration) * 100);
                        return (
                          <button key={clip.id} className={selectedId === clip.id ? 'timeline-clip selected' : 'timeline-clip'} style={{ left: left + '%', width: width + '%' }} onClick={(event) => { event.stopPropagation(); setSelectedId(clip.id); setTool('select'); }}>
                            <span className="timeline-clip-film" />
                            <strong>Clip {index + 1}</strong>
                            <small>{duration.toFixed(1)}s</small>
                          </button>
                        );
                      }) : <div className="timeline-empty-track">Add a video to start editing motion</div>}
                    </div>
                    <div className="timeline-track audio-track">
                      <div className="timeline-audio-placeholder"><span /><b>Audio track</b><small>Drop audio here</small></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="timeline-footer">
                <span>{videoElements.length} video clip{videoElements.length === 1 ? '' : 's'}</span>
                <span>Magnetic timeline</span>
                <span>30 FPS</span>
              </div>
            </section>
          )}
        </section>

        <aside className={`editor-inspector ${mobileInspectorOpen ? 'mobile-open' : ''}`}>
          {tool === 'ai' ? (
            <>
              <div className="inspector-header"><strong>AI Image</strong><span>Gemini</span><button className="mobile-inspector-close" onClick={() => setMobileInspectorOpen(false)}>Close</button></div>
              <div className="ai-inspector-hero">
                <div className="ai-inspector-icon"><Sparkles size={18} /></div>
                <strong>Generate a visual</strong>
                <span>Describe what you want to create. You can edit the result on the canvas.</span>
              </div>
              <div className="inspector-section ai-section">
                <label>Prompt</label>
                <textarea id="ai-prompt" name="ai-prompt" className="ai-prompt-input" value={aiPrompt} onChange={(event) => setAiPrompt(event.target.value)} placeholder="A cinematic product photo of a premium sneaker on a Lagos rooftop at golden hour…" />
              </div>
              <div className="inspector-section ai-section">
                <label>Aspect ratio</label>
                <div className="ai-ratio-grid">
                  {['1:1', '16:9', '9:16', '4:3'].map((ratio) => (
                    <button key={ratio} className={aiAspectRatio === ratio ? 'active' : ''} onClick={() => setAiAspectRatio(ratio)}>{ratio}</button>
                  ))}
                </div>
              </div>
              {aiError && <div className="ai-error">{aiError}</div>}
              {aiImage && (
                <div className="ai-result">
                  <img src={aiImage} alt="Generated AI preview" />
                  <div><span>Generated image</span><button onClick={addGeneratedImage}>Add to canvas <ArrowRight size={13} /></button></div>
                </div>
              )}
              <button className="ai-generate-button" disabled={!aiPrompt.trim() || aiLoading} onClick={generateAIImage}>
                {aiLoading ? <><span className="ai-spinner" /> Generating…</> : <><Sparkles size={15} /> Generate image</>}
              </button>
            </>
          ) : (
            <>
              <div className="inspector-header"><strong>Properties</strong><span>{selected ? selected.type : 'Canvas'}</span><button className="mobile-inspector-close" onClick={() => setMobileInspectorOpen(false)}>Close</button></div>
              {selected ? (
                <>
                  <div className="inspector-section">
                    <label>Content</label>
                    {selected.type === 'text' && <textarea id="selected-text-content" name="selected-text-content" value={selected.text ?? ''} onChange={(event) => setElements((current) => current.map((item) => item.id === selected.id ? { ...item, text: event.target.value } : item))} />}
                    {selected.type === 'shape' && <div className="color-row"><button className="color-swatch" style={{ background: selected.color }} /><span>{selected.color}</span></div>}
                  </div>
                  <div className="inspector-section">
                    <label>Position</label>
                    <div className="inspector-grid">
                      <label>X<input id="element-x" name="element-x" type="number" value={Math.round(selected.x)} onChange={(e) => updateSelected({ x: Number(e.target.value) })} /></label>
                      <label>Y<input id="element-y" name="element-y" type="number" value={Math.round(selected.y)} onChange={(e) => updateSelected({ y: Number(e.target.value) })} /></label>
                      <label>W<input id="element-width" name="element-width" type="number" value={Math.round(selected.width)} onChange={(e) => updateSelected({ width: Number(e.target.value) })} /></label>
                      <label>H<input id="element-height" name="element-height" type="number" value={Math.round(selected.height)} onChange={(e) => updateSelected({ height: Number(e.target.value) })} /></label>
                    </div>
                  </div>
                  {selectedMedia && (
                    <div className="inspector-section editor-transform-tools">
                      <div className="inspector-section-title"><span>Transform</span><small>{selectedMedia.type.toUpperCase()}</small></div>
                      <div className="transform-tool-grid">
                        <button className={cropMode ? 'active' : ''} onClick={() => setCropMode((mode) => !mode)}><Square size={13} /> {cropMode ? 'Exit crop' : 'Crop'}</button>
                        <button className={snapEnabled ? 'active' : ''} onClick={() => setSnapEnabled((enabled) => !enabled)}><Target size={13} /> Snap</button>
                        <button className={showGuides ? 'active' : ''} onClick={() => setShowGuides((visible) => !visible)}><Grid2X2 size={13} /> Guides</button>
                      </div>
                      {cropMode && <div className="crop-helper"><strong>Crop mode active</strong><span>Use the canvas handles to frame the media.</span></div>}
                    </div>
                  )}

                  {selected.type === 'video' && (
                    <>
                      <div className="inspector-section video-clip-controls">
                        <div className="inspector-section-title">Timeline</div>
                        <div className="clip-control-grid">
                          <label>Start<input type="number" min="0" step="0.1" value={selected.startTime ?? 0} onChange={(e) => updateSelected({ startTime: Math.max(0, Number(e.target.value)) })} /></label>
                          <label>Duration<input type="number" min="0.1" step="0.1" value={selected.duration ?? 5} onChange={(e) => updateSelected({ duration: Math.max(0.1, Number(e.target.value)) })} /></label>
                          <label>Trim in<input type="number" min="0" step="0.1" value={selected.trimStart ?? 0} onChange={(e) => updateSelected({ trimStart: Math.max(0, Number(e.target.value)) })} /></label>
                          <label>Trim out<input type="number" min="0" step="0.1" value={selected.trimEnd ?? ((selected.trimStart ?? 0) + (selected.duration ?? 5))} onChange={(e) => updateSelected({ trimEnd: Math.max(0, Number(e.target.value)) })} /></label>
                        </div>
                      </div>
                      <div className="inspector-section">
                        <label>Speed</label>
                        <div className="video-speed-grid">
                          {[0.5, 1, 1.5, 2].map((speed) => (
                            <button key={speed} className={(selected.speed ?? 1) === speed ? 'active' : ''} onClick={() => updateSelected({ speed })}>{speed}×</button>
                          ))}
                        </div>
                      </div>
                      <div className="inspector-section">
                        <label>Volume</label>
                        <div className="inspector-slider"><Video size={14} /><input id="video-volume" name="video-volume" type="range" min="0" max="1" step="0.05" value={selected.volume ?? 1} onChange={(e) => updateSelected({ volume: Number(e.target.value) })} /><span>{Math.round((selected.volume ?? 1) * 100)}%</span></div>
                      </div>
                    </>
                  )}
                  <div className="inspector-section">
                    <label>Rotation</label>
                    <div className="inspector-slider"><RotateCw size={14} /><input id="element-rotation" name="element-rotation" type="range" min="-180" max="180" value={selected.rotation} onChange={(e) => updateSelected({ rotation: Number(e.target.value) })} /><span>{selected.rotation}°</span></div>
                  </div>
                  <button className="inspector-delete" onClick={removeSelected}><Trash2 size={15} /> Delete layer</button>
                </>
              ) : (
                <div className="inspector-empty"><Sparkles size={18} /><strong>Nothing selected</strong><span>Select an element to edit its properties.</span></div>
              )}
            </>
          )}
        </aside>   </div>
      <input id="editor-upload" name="editor-upload" ref={fileRef} type="file" accept="image/*" hidden onChange={onUpload} />
    </main>
  );
}

type MediaAsset = { id: string; clerkUserId: string; name: string; type: string; mimeType: string | null; url: string; thumbnailUrl: string | null; storageKey: string | null; source: string; width: number | null; height: number | null; duration: number | null; size: number | null; createdAt: string; };
const formatAssetBytes = (bytes: number | null) => { if (!bytes) return '—'; if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`; if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`; return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`; };
const formatAssetDuration = (seconds: number | null) => { if (!seconds) return ''; const minutes = Math.floor(seconds / 60); const remainder = Math.floor(seconds % 60).toString().padStart(2, '0'); return `${minutes}:${remainder}`; };
function MediaLibraryPage() {
  const { isLoaded, isSignedIn, user, getToken } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const loadAssets = async () => { if (!user) return; setLoading(true); setError(''); try { const token = await getToken(); const params = new URLSearchParams(); if (filter !== 'all') params.set('type', filter); if (search.trim()) params.set('search', search.trim()); const response = await fetch(`/api/assets?${params.toString()}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} }); const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Unable to load media library'); setAssets(data.assets ?? []); } catch (err) { setError(err instanceof Error ? err.message : 'Unable to load media library'); } finally { setLoading(false); } };
  useEffect(() => { if (isSignedIn) void loadAssets(); }, [isSignedIn, filter, search]);
  const getMediaMetadata = async (file: File) => {
    if (file.type.startsWith('image/')) { const url = URL.createObjectURL(file); try { const image = new Image(); image.src = url; await new Promise<void>((resolve, reject) => { image.onload = () => resolve(); image.onerror = () => reject(new Error('Unable to read image metadata')); }); return { width: image.naturalWidth || null, height: image.naturalHeight || null, duration: null }; } finally { URL.revokeObjectURL(url); } }
    if (file.type.startsWith('video/') || file.type.startsWith('audio/')) { const url = URL.createObjectURL(file); try { const media = document.createElement(file.type.startsWith('video/') ? 'video' : 'audio'); media.preload = 'metadata'; media.src = url; await new Promise<void>((resolve, reject) => { media.onloadedmetadata = () => resolve(); media.onerror = () => reject(new Error('Unable to read media metadata')); }); return { width: file.type.startsWith('video/') ? media.videoWidth || null : null, height: file.type.startsWith('video/') ? media.videoHeight || null : null, duration: Number.isFinite(media.duration) ? media.duration : null }; } finally { URL.revokeObjectURL(url); } }
    return { width: null, height: null, duration: null };
  };
  const uploadFiles = async (files: File[]) => {
    if (!files.length || !user || uploading) return;

    setUploading(true);
    setError('');
    setProgress(0);

    try {
      const token = await getToken();

      if (!token) {
        throw new Error('Your session expired. Please sign in again.');
      }

      for (let index = 0; index < files.length; index += 1) {
        const file = files[index];
        const metadata = await getMediaMetadata(file);

        await uploadAssetDirect(file, token, metadata);

        setProgress(Math.round(((index + 1) / files.length) * 100));
      }

      await loadAssets();
      setProgress(100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const deleteAsset = async (asset: MediaAsset) => { if (!window.confirm(`Delete “${asset.name}” from your media library?`)) return; try { const token = await getToken(); const response = await fetch(`/api/assets/${asset.id}`, { method: 'DELETE', headers: token ? { Authorization: `Bearer ${token}` } : {} }); const data = response.status === 204 ? {} : await response.json(); if (!response.ok) throw new Error(data.error || 'Unable to delete asset'); setAssets((current) => current.filter((item) => item.id !== asset.id)); } catch (err) { setError(err instanceof Error ? err.message : 'Unable to delete asset'); } };
  if (!isLoaded) return <main className="media-loading">Opening Media Library…</main>;
  if (!isSignedIn) return <Redirect to="/sign-in" />;
  return (<main className="media-library">
    <header className="media-header"><div className="media-header-left"><a className="media-back" href="/dashboard" aria-label="Back to dashboard"><ArrowRight size={16} /></a><Wordmark /><span className="media-header-divider" /><div><span className="media-kicker">WORKSPACE</span><strong>Media Library</strong></div></div><div className="media-header-actions"><span className="media-user">{user?.firstName?.[0] ?? 'C'}</span><button className="media-upload-button" onClick={() => fileRef.current?.click()}><Upload size={15} /> Upload media</button></div></header>
    <section className="media-page"><div className="media-intro"><div><span className="eyebrow">01 · Your creative assets</span><h1>Everything you upload,<br /><span>ready to create.</span></h1><p>Keep photos, videos and audio in one persistent library. Your assets are stored separately from the editor so you can reuse them across projects.</p></div><div className="media-drop-card" onClick={() => fileRef.current?.click()}><div className="media-drop-icon"><Upload size={19} /></div><strong>{uploading ? `Uploading ${progress}%` : 'Drop files here'}</strong><span>Images · Video · Audio</span>{uploading && <div className="media-progress"><span style={{ width: `${progress}%` }} /></div>}</div></div>
      <div className="media-toolbar"><div className="media-tabs">{[['all','All'],['image','Images'],['video','Videos'],['audio','Audio']].map(([value,label]) => <button key={value} className={filter === value ? 'active' : ''} onClick={() => setFilter(value)}>{label}</button>)}</div><label className="media-search"><Target size={14} /><input id="media-search" name="media-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search assets…" /></label></div>
      {error && <div className="media-error">{error}</div>}
      {loading ? <div className="media-grid-skeleton">{Array.from({ length: 8 }).map((_, index) => <div key={index} className="media-skeleton" />)}</div> : assets.length ? <div className="media-grid">{assets.map((asset) => <article className="media-card" key={asset.id}><div className="media-preview">{asset.type === 'image' && <img src={asset.url} alt={asset.name} loading="lazy" />}{asset.type === 'video' && <video src={asset.url} preload="metadata" muted />}{asset.type === 'audio' && <div className="media-audio-art"><span><Play size={18} fill="currentColor" /></span><strong>AUDIO</strong></div>}<span className="media-type-pill">{asset.type}</span>{asset.duration && <span className="media-duration">{formatAssetDuration(asset.duration)}</span>}<button className="media-delete" onClick={() => deleteAsset(asset)} aria-label={`Delete ${asset.name}`}><Trash2 size={14} /></button></div><div className="media-card-meta"><strong title={asset.name}>{asset.name}</strong><span>{formatAssetBytes(asset.size)} · {asset.source === 'ai' ? 'AI generated' : 'Uploaded'}</span></div></article>)}</div> : <div className="media-empty"><div className="media-empty-icon"><ImagePlus size={22} /></div><strong>Your library is empty</strong><span>Upload your first photo, video or audio file. It will stay available across Createora.</span><button onClick={() => fileRef.current?.click()}><Upload size={14} /> Upload your first asset</button></div>}
    </section><input id="media-library-upload" name="media-library-upload" ref={fileRef} type="file" multiple hidden accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime,audio/mpeg,audio/wav,audio/mp4,audio/webm" onChange={(event) => void uploadFiles(Array.from(event.target.files ?? []))} /></main>);
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
        <Route path="/assets" component={MediaLibraryPage} />
        <Route path="/projects" component={ProjectsPage} />
        <Route path="/editor" component={CreateoraEditor} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

type DirectUploadMetadata = {
  width?: number | null;
  height?: number | null;
  duration?: number | null;
};

async function uploadAssetDirect(
  file: File,
  token: string,
  metadata: DirectUploadMetadata = {},
) {
  const signatureResponse = await fetch('/api/assets/cloudinary/signature', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contentType: file.type,
    }),
  });

  const signatureRaw = await signatureResponse.text();

  let signatureData: {
    cloudName?: string;
    apiKey?: string;
    publicId?: string;
    timestamp?: number;
    signature?: string;
    resourceType?: string;
    error?: string;
  } = {};

  if (signatureRaw.trim()) {
    try {
      signatureData = JSON.parse(signatureRaw);
    } catch {
      throw new Error(
        `Cloudinary signature request returned an invalid response (HTTP ${signatureResponse.status}).`,
      );
    }
  }

  if (!signatureResponse.ok) {
    throw new Error(
      signatureData.error ||
        `Unable to prepare Cloudinary upload (HTTP ${signatureResponse.status}).`,
    );
  }

  if (
    !signatureData.cloudName ||
    !signatureData.apiKey ||
    !signatureData.publicId ||
    signatureData.timestamp == null ||
    !signatureData.signature ||
    !signatureData.resourceType
  ) {
    throw new Error('Cloudinary upload configuration is incomplete.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', signatureData.apiKey);
  formData.append('timestamp', String(signatureData.timestamp));
  formData.append('signature', signatureData.signature);
  formData.append('public_id', signatureData.publicId);

  const cloudinaryResponse = await fetch(
    `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/${signatureData.resourceType}/upload`,
    {
      method: 'POST',
      body: formData,
    },
  );

  const cloudinaryRaw = await cloudinaryResponse.text();

  let cloudinaryData: {
    secure_url?: string;
    public_id?: string;
    version?: number;
    signature?: string;
    bytes?: number;
    error?: { message?: string };
  } = {};

  if (cloudinaryRaw.trim()) {
    try {
      cloudinaryData = JSON.parse(cloudinaryRaw);
    } catch {
      throw new Error(
        `Cloudinary returned an invalid response (HTTP ${cloudinaryResponse.status}).`,
      );
    }
  }

  if (!cloudinaryResponse.ok) {
    throw new Error(
      cloudinaryData.error?.message ||
        `Cloudinary upload failed (HTTP ${cloudinaryResponse.status}).`,
    );
  }

  if (
    !cloudinaryData.secure_url ||
    !cloudinaryData.public_id ||
    cloudinaryData.version == null ||
    !cloudinaryData.signature
  ) {
    throw new Error(
      'Cloudinary upload completed but returned incomplete metadata.',
    );
  }

  const finalizeResponse = await fetch('/api/assets/cloudinary/finalize', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      publicId: cloudinaryData.public_id,
      signature: cloudinaryData.signature,
      version: cloudinaryData.version,
      secureUrl: cloudinaryData.secure_url,
      resourceType: signatureData.resourceType,
      name: file.name,
      mimeType: file.type,
      width: metadata.width ?? null,
      height: metadata.height ?? null,
      duration: metadata.duration ?? null,
      bytes: cloudinaryData.bytes ?? file.size,
    }),
  });

  const finalizeRaw = await finalizeResponse.text();

  let finalizeData: {
    asset?: MediaAsset;
    error?: string;
  } = {};

  if (finalizeRaw.trim()) {
    try {
      finalizeData = JSON.parse(finalizeRaw);
    } catch {
      throw new Error(
        `Asset finalization returned an invalid response (HTTP ${finalizeResponse.status}).`,
      );
    }
  }

  if (!finalizeResponse.ok) {
    throw new Error(
      finalizeData.error ||
        `Unable to save uploaded asset (HTTP ${finalizeResponse.status}).`,
    );
  }

  if (!finalizeData.asset) {
    throw new Error('Upload completed but no asset was returned.');
  }

  return finalizeData.asset;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function ClerkApp() {
  const [, setLocation] = useLocation();

  return (
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
        routerPush={(to) => setLocation(stripBase(to))}
        routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
      >
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <ClerkQueryClientCacheInvalidator />
            <AppRoutes />
            <Toaster />
          </TooltipProvider>
        </QueryClientProvider>
      </ClerkProvider>
  );
}

function App() {
  if (!clerkPubKey) {
    throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY in environment');
  }

  return (
    <WouterRouter base={basePath}>
      <ClerkApp />
    </WouterRouter>
  );
}

export default App;
