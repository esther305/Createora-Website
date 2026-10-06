import { useEffect, useState } from "react";
import { useAuth } from "@clerk/react";
import { ArrowLeft, Download, Image as ImageIcon, Layers3, Play, Save, Sparkles, Upload, Video } from "lucide-react";
import { Link, useLocation, useRoute } from "wouter";

type Project = { id: string; name: string; type: "image" | "video" | "design" | "ai-generation"; width: number; height: number; duration: number | null; updatedAt: string };

export default function ProjectWorkspacePage() {
  const { isLoaded, isSignedIn } = useAuth();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/projects/:id");
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !params?.id) return;
    fetch("/api/projects", { credentials: "include" })
      .then((response) => response.json())
      .then((data) => setProject(data.projects?.find((item: Project) => item.id === params.id) ?? null));
  }, [isLoaded, isSignedIn, params?.id]);

  if (!isLoaded) return <main className="dashboard-loading">Loading workspace…</main>;
  if (!isSignedIn) { setLocation("/sign-in"); return null; }
  if (!project) return <main className="dashboard-loading">Loading project…</main>;

  const isVideo = project.type === "video";
  return (
    <main className="editor-shell">
      <header className="editor-topbar">
        <Link href="/projects" className="editor-back"><ArrowLeft size={15} /> Projects</Link>
        <div className="editor-project-name"><span>{project.name}</span><small>Saved</small></div>
        <div className="editor-actions"><button><Save size={14} /> Save</button><button><Download size={14} /> Export</button></div>
      </header>
      <div className="editor-body">
        <aside className="editor-left">
          <button className="editor-tool active"><Sparkles size={18} /><span>AI</span></button>
          <button className="editor-tool"><Upload size={18} /><span>Media</span></button>
          <button className="editor-tool"><ImageIcon size={18} /><span>Images</span></button>
          <button className="editor-tool"><Layers3 size={18} /><span>Layers</span></button>
          {isVideo && <button className="editor-tool"><Video size={18} /><span>Video</span></button>}
        </aside>
        <section className="editor-main">
          <div className="editor-toolbar"><span>{project.width} × {project.height}</span><span>{isVideo ? (project.duration ?? 30) + "s" : "Still canvas"}</span></div>
          <div className={"editor-canvas " + (isVideo ? "editor-canvas-video" : "")}>
            <div className="editor-canvas-inner">{isVideo ? <Play size={34} /> : <Sparkles size={34} />}<strong>{isVideo ? "Video Studio" : "Image Studio"}</strong><span>The editing canvas is the next Createora build phase.</span></div>
          </div>
          {isVideo && <div className="editor-timeline"><span className="timeline-label">TIMELINE</span><div className="timeline-track"><i /><i /><i /></div></div>}
        </section>
        <aside className="editor-inspector"><span className="eyebrow">Project</span><h2>{project.name}</h2><p>{isVideo ? "A persistent video project ready for the timeline." : "A persistent canvas ready for layers, text, media, and AI."}</p><div className="inspector-divider" /><span className="eyebrow">Next tools</span><div className="next-tool-list"><span>AI generation</span><span>Layers & transforms</span><span>Text & shapes</span><span>Export pipeline</span></div></aside>
      </div>
    </main>
  );
}
