import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@clerk/react";
import { ArrowLeft, ArrowRight, Film, Image as ImageIcon, LayoutTemplate, MoreHorizontal, Plus, Sparkles, Trash2, WandSparkles } from "lucide-react";
import { Link, useLocation } from "wouter";

type ProjectType = "image" | "video" | "design" | "ai-generation";
type Project = {
  id: string;
  name: string;
  type: ProjectType;
  width: number;
  height: number;
  duration: number | null;
  thumbnail: string | null;
  createdAt: string;
  updatedAt: string;
};

const typeMeta: Record<ProjectType, { label: string; icon: typeof ImageIcon; size: string }> = {
  image: { label: "Image", icon: ImageIcon, size: "1080 × 1080" },
  video: { label: "Video", icon: Film, size: "1080 × 1920" },
  design: { label: "Design", icon: LayoutTemplate, size: "1080 × 1080" },
  "ai-generation": { label: "AI generation", icon: Sparkles, size: "Custom" },
};

async function readJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, { ...init, credentials: "include", headers: { "content-type": "application/json", ...(init?.headers ?? {}) } });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error ?? "Something went wrong");
  }
  return response.status === 204 ? (undefined as T) : response.json();
}

function CreateProjectDialog({ onClose, onCreated }: { onClose: () => void; onCreated: (project: Project) => void }) {
  const [name, setName] = useState("Untitled project");
  const [type, setType] = useState<ProjectType>("image");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const presets = useMemo(() => ({
    image: { width: 1080, height: 1080 },
    video: { width: 1080, height: 1920, duration: 30 },
    design: { width: 1200, height: 1200 },
    "ai-generation": { width: 1024, height: 1024 },
  } as const), []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setCreating(true);
    setError("");
    try {
      const project = await readJson<{ project: Project }>("/api/projects", {
        method: "POST",
        body: JSON.stringify({ name: name.trim(), type, ...presets[type] }),
      });
      onCreated(project.project);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create project");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="project-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <form className="project-modal" onSubmit={submit}>
        <div className="project-modal-head">
          <div><span className="eyebrow">Createora / New project</span><h2>Start making.</h2></div>
          <button type="button" className="project-modal-close" onClick={onClose}>×</button>
        </div>
        <label className="project-field">Project name<input value={name} onChange={(e) => setName(e.target.value)} maxLength={120} autoFocus /></label>
        <div className="project-field"><span>Choose a canvas</span><div className="project-type-grid">
          {(Object.entries(typeMeta) as [ProjectType, typeof typeMeta[ProjectType]][]).map(([key, meta]) => {
            const Icon = meta.icon;
            return <button type="button" key={key} className={`project-type-card ${type === key ? "selected" : ""}`} onClick={() => setType(key)}><Icon size={18} /><strong>{meta.label}</strong><small>{meta.size}</small></button>;
          })}
        </div></div>
        {error && <p className="project-error">{error}</p>}
        <button className="btn btn-primary project-create-btn" disabled={creating || !name.trim()}>{creating ? "Creating…" : "Create project"} <ArrowRight size={15} /></button>
      </form>
    </div>
  );
}

function projectAge(value: string) {
  const date = new Date(value);
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function ProjectsPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const [, setLocation] = useLocation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    readJson<{ projects: Project[] }>("/api/projects")
      .then((data) => setProjects(data.projects))
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load projects"))
      .finally(() => setLoading(false));
  }, [isLoaded, isSignedIn]);

  async function deleteProject(id: string) {
    if (!window.confirm("Delete this project?")) return;
    try {
      await readJson<void>(`/api/projects/${id}`, { method: "DELETE" });
      setProjects((current) => current.filter((project) => project.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete project");
    }
  }

  if (!isLoaded) return <main className="dashboard-loading">Loading workspace…</main>;
  if (!isSignedIn) {
    setLocation("/sign-in");
    return null;
  }

  return (
    <main className="projects-page">
      <header className="projects-topbar">
        <Link href="/dashboard" className="projects-back"><ArrowLeft size={15} /> Dashboard</Link>
        <div className="projects-brand">Createora <span>/ Projects</span></div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}><Plus size={15} /> New project</button>
      </header>
      <section className="projects-shell">
        <div className="projects-heading">
          <div><span className="eyebrow">Your creative workspace</span><h1>Projects.</h1><p>Every image, video, design, and AI creation starts here.</p></div>
          <div className="projects-count"><strong>{projects.length}</strong><span>Total projects</span></div>
        </div>
        {error && <div className="projects-alert">{error}</div>}
        {loading ? <div className="projects-empty">Loading your projects…</div> : projects.length === 0 ? (
          <div className="projects-empty projects-empty-card"><div className="projects-empty-icon"><WandSparkles size={23} /></div><h2>Your canvas is waiting.</h2><p>Create your first project and this becomes the home for your finished work.</p><button className="btn btn-primary" onClick={() => setShowCreate(true)}>Create first project <ArrowRight size={15} /></button></div>
        ) : (
          <div className="projects-grid">
            {projects.map((project) => {
              const meta = typeMeta[project.type];
              const Icon = meta.icon;
              return <article className="project-card" key={project.id}>
                <div className={`project-preview project-preview-${project.type}`}>{project.thumbnail ? <img src={project.thumbnail} alt="" /> : <Icon size={28} />}</div>
                <div className="project-card-body"><div><span className="project-type"><Icon size={12} /> {meta.label}</span><h3>{project.name}</h3><small>{project.width} × {project.height} · Updated {projectAge(project.updatedAt)}</small></div><button className="project-more" aria-label="Project options" onClick={() => deleteProject(project.id)} title="Delete project"><Trash2 size={15} /></button></div>
                <button className="project-open" onClick={() => setLocation(`/projects/${project.id}`)}>Open project <ArrowRight size={14} /></button>
              </article>;
            })}
          </div>
        )}
      </section>
      {showCreate && <CreateProjectDialog onClose={() => setShowCreate(false)} onCreated={(project) => { setProjects((current) => [project, ...current]); setShowCreate(false); }} />}
    </main>
  );
}
