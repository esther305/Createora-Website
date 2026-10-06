import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@clerk/react";
import { ArrowLeft, Download, Image as ImageIcon, Layers3, MousePointer2, Redo2, RotateCw, Save, Sparkles, Square, Trash2, Type, Undo2, Upload, Video } from "lucide-react";
import { Link, useLocation, useRoute } from "wouter";

type ElementKind = "image" | "text" | "shape";
type CanvasElement = { id: string; kind: ElementKind; x: number; y: number; width: number; height: number; rotation: number; opacity: number; text?: string; src?: string };
type Project = { id: string; name: string; type: "image" | "video" | "design" | "ai-generation"; width: number; height: number; duration: number | null; document?: { version: number; elements: CanvasElement[] } };

const makeId = () => crypto.randomUUID();
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export default function ProjectWorkspacePage() {
  const { isLoaded, isSignedIn } = useAuth();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/projects/:id");
  const [project, setProject] = useState<Project | null>(null);
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tool, setTool] = useState<"select" | "text" | "shape">("select");
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState<CanvasElement[][]>([]);
  const [future, setFuture] = useState<CanvasElement[][]>([]);
  const fileInput = useRef<HTMLInputElement>(null);
  const drag = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !params?.id) return;
    fetch("/api/projects", { credentials: "include" })
      .then((response) => response.json())
      .then((data) => {
        const found = data.projects?.find((item: Project) => item.id === params.id) as Project | undefined;
        if (!found) return;
        setProject(found);
        setElements(found.document?.elements ?? []);
      });
  }, [isLoaded, isSignedIn, params?.id]);

  const selected = useMemo(() => elements.find((item) => item.id === selectedId) ?? null, [elements, selectedId]);

  function commit(next: CanvasElement[]) {
    setHistory((current) => [...current.slice(-19), elements]);
    setFuture([]);
    setElements(next);
  }

  function addText() {
    const item: CanvasElement = { id: makeId(), kind: "text", x: 260, y: 250, width: 520, height: 90, rotation: 0, opacity: 1, text: "Your headline" };
    commit([...elements, item]);
    setSelectedId(item.id);
    setTool("select");
  }

  function addShape() {
    const item: CanvasElement = { id: makeId(), kind: "shape", x: 330, y: 330, width: 420, height: 240, rotation: 0, opacity: 1 };
    commit([...elements, item]);
    setSelectedId(item.id);
    setTool("select");
  }

  function undo() {
    const previous = history.at(-1);
    if (!previous) return;
    setFuture((current) => [elements, ...current]);
    setElements(previous);
    setHistory((current) => current.slice(0, -1));
  }

  function redo() {
    const next = future[0];
    if (!next) return;
    setHistory((current) => [...current, elements]);
    setElements(next);
    setFuture((current) => current.slice(1));
  }

  function removeSelected() {
    if (!selectedId) return;
    commit(elements.filter((item) => item.id !== selectedId));
    setSelectedId(null);
  }

  function updateSelected(patch: Partial<CanvasElement>) {
    if (!selectedId) return;
    commit(elements.map((item) => item.id === selectedId ? { ...item, ...patch } : item));
  }

  async function save() {
    if (!project) return;
    setSaving(true);
    try {
      const response = await fetch("/api/projects/" + project.id, {
        method: "PATCH",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ document: { version: 1, elements } }),
      });
      if (!response.ok) throw new Error("Unable to save project");
      setProject((current) => current ? { ...current, document: { version: 1, elements } } : current);
    } finally {
      setSaving(false);
    }
  }

  function onCanvasPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (tool !== "select" || event.target !== event.currentTarget) return;
    setSelectedId(null);
  }

  function onElementPointerDown(event: React.PointerEvent, item: CanvasElement) {
    event.stopPropagation();
    setSelectedId(item.id);
    if (tool !== "select") return;
    const rect = (event.currentTarget as HTMLElement).parentElement?.getBoundingClientRect();
    if (!rect) return;
    drag.current = { id: item.id, offsetX: event.clientX - rect.left - item.x, offsetY: event.clientY - rect.top - item.y };
    (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);
  }

  function onCanvasPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!drag.current) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const { id, offsetX, offsetY } = drag.current;
    const item = elements.find((entry) => entry.id === id);
    if (!item) return;
    setElements(elements.map((entry) => entry.id === id ? { ...entry, x: clamp(event.clientX - rect.left - offsetX, 0, project ? project.width - entry.width : 10000), y: clamp(event.clientY - rect.top - offsetY, 0, project ? project.height - entry.height : 10000) } : entry));
  }

  function onCanvasPointerUp() { drag.current = null; }

  function upload() {
    fileInput.current?.click();
  }

  function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const item: CanvasElement = { id: makeId(), kind: "image", x: 120, y: 120, width: 600, height: 420, rotation: 0, opacity: 1, src: String(reader.result) };
      commit([...elements, item]);
      setSelectedId(item.id);
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  }

  function exportImage() {
    const canvas = document.createElement("canvas");
    canvas.width = project?.width ?? 1080;
    canvas.height = project?.height ?? 1080;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const scaleX = canvas.width / (project?.width ?? 1080);
    const scaleY = canvas.height / (project?.height ?? 1080);
    elements.forEach((item) => {
      ctx.save();
      ctx.globalAlpha = item.opacity;
      ctx.translate(item.x * scaleX, item.y * scaleY);
      ctx.rotate((item.rotation * Math.PI) / 180);
      if (item.kind === "shape") {
        ctx.fillStyle = "#10b981";
        ctx.fillRect(0, 0, item.width * scaleX, item.height * scaleY);
      } else if (item.kind === "text") {
        ctx.fillStyle = "#111827";
        ctx.font = "700 " + Math.max(18, 42 * scaleX) + "px Arial";
        ctx.fillText(item.text ?? "", 0, Math.min(item.height * scaleY, 58 * scaleY));
      } else if (item.src) {
        const image = new Image();
        image.onload = () => { ctx.drawImage(image, 0, 0, item.width * scaleX, item.height * scaleY); };
        image.src = item.src;
      }
      ctx.restore();
    });
    const link = document.createElement("a");
    link.download = (project?.name || "createora-project") + ".png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  if (!isLoaded) return <main className="dashboard-loading">Loading workspace…</main>;
  if (!isSignedIn) { setLocation("/sign-in"); return null; }
  if (!project) return <main className="dashboard-loading">Loading project…</main>;

  const isVideo = project.type === "video";
  return (
    <main className="editor-shell">
      <header className="editor-topbar">
        <Link href="/projects" className="editor-back"><ArrowLeft size={15} /> Projects</Link>
        <div className="editor-project-name"><span>{project.name}</span><small>{saving ? "Saving…" : "Saved"}</small></div>
        <div className="editor-actions">
          <button onClick={undo} disabled={!history.length}><Undo2 size={14} /> Undo</button>
          <button onClick={redo} disabled={!future.length}><Redo2 size={14} /> Redo</button>
          <button onClick={save}><Save size={14} /> {saving ? "Saving" : "Save"}</button>
          {!isVideo && <button onClick={exportImage}><Download size={14} /> Export PNG</button>}
        </div>
      </header>
      <div className="editor-body">
        <aside className="editor-left">
          <button className={"editor-tool " + (tool === "select" ? "active" : "")} onClick={() => setTool("select")}><MousePointer2 size={18} /><span>Select</span></button>
          <button className="editor-tool" onClick={upload}><Upload size={18} /><span>Upload</span></button>
          <button className={"editor-tool " + (tool === "text" ? "active" : "")} onClick={addText}><Type size={18} /><span>Text</span></button>
          <button className={"editor-tool " + (tool === "shape" ? "active" : "")} onClick={addShape}><Square size={18} /><span>Shape</span></button>
          <button className="editor-tool"><Sparkles size={18} /><span>AI</span></button>
          <button className="editor-tool"><Layers3 size={18} /><span>Layers</span></button>
          {isVideo && <button className="editor-tool"><Video size={18} /><span>Video</span></button>}
          <input ref={fileInput} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFile} hidden />
        </aside>
        <section className="editor-main">
          <div className="editor-toolbar"><span>{project.width} × {project.height}</span><span>{isVideo ? ((project.duration ?? 30) + "s") : "Image Studio"}</span></div>
          <div className="editor-canvas" onPointerDown={onCanvasPointerDown} onPointerMove={onCanvasPointerMove} onPointerUp={onCanvasPointerUp}>
            <div className={"editor-artboard " + (isVideo ? "editor-artboard-video" : "")} style={{ aspectRatio: project.width + " / " + project.height }}>
              {elements.map((item) => <div key={item.id} className={"canvas-element " + item.kind + (selectedId === item.id ? " selected" : "")} style={{ left: item.x, top: item.y, width: item.width, height: item.height, opacity: item.opacity, transform: "rotate(" + item.rotation + "deg)" }} onPointerDown={(event) => onElementPointerDown(event, item)}>
                {item.kind === "image" && item.src ? <img src={item.src} alt="" draggable={false} /> : item.kind === "text" ? <span>{item.text}</span> : null}
              </div>)}
              {elements.length === 0 && <div className="editor-artboard-empty"><Sparkles size={28} /><strong>Start creating</strong><span>Upload an image, add text, or create a shape.</span></div>}
            </div>
          </div>
          {isVideo && <div className="editor-timeline"><span className="timeline-label">TIMELINE</span><div className="timeline-track"><i /><i /><i /></div></div>}
        </section>
        <aside className="editor-inspector">
          <span className="eyebrow">Inspector</span>
          {selected ? <div className="inspector-controls">
            <h2>{selected.kind === "image" ? "Image" : selected.kind === "text" ? "Text" : "Shape"}</h2>
            {selected.kind === "text" && <label>Text<textarea value={selected.text ?? ""} onChange={(event) => updateSelected({ text: event.target.value })} /></label>}
            <div className="inspector-grid">
              <label>X<input type="number" value={Math.round(selected.x)} onChange={(event) => updateSelected({ x: Number(event.target.value) })} /></label>
              <label>Y<input type="number" value={Math.round(selected.y)} onChange={(event) => updateSelected({ y: Number(event.target.value) })} /></label>
              <label>W<input type="number" value={Math.round(selected.width)} onChange={(event) => updateSelected({ width: Math.max(20, Number(event.target.value)) })} /></label>
              <label>H<input type="number" value={Math.round(selected.height)} onChange={(event) => updateSelected({ height: Math.max(20, Number(event.target.value)) })} /></label>
            </div>
            <label>Rotation<input type="range" min="-180" max="180" value={selected.rotation} onChange={(event) => updateSelected({ rotation: Number(event.target.value) })} /></label>
            <label>Opacity<input type="range" min="0.1" max="1" step="0.05" value={selected.opacity} onChange={(event) => updateSelected({ opacity: Number(event.target.value) })} /></label>
            <button className="inspector-delete" onClick={removeSelected}><Trash2 size={14} /> Delete layer</button>
          </div> : <div className="inspector-empty"><MousePointer2 size={20} /><p>Select an element to edit its properties.</p></div>}
        </aside>
      </div>
    </main>
  );
}
