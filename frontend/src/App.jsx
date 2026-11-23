import { useEffect, useMemo, useState } from "react";
import { createNote, deleteNote, listNotes, updateNote } from "./api.js";

const EMPTY = { title: "", content: "" };
const COLORS = ["#8b7bff", "#ff7ac6", "#5eead4", "#fbbf24", "#60a5fa", "#fb923c"];

const colorFor = (id) => COLORS[id % COLORS.length];

function timeAgo(iso) {
  const secs = Math.max(0, (Date.now() - new Date(iso)) / 1000);
  if (secs < 60) return "just now";
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function App() {
  const [notes, setNotes] = useState([]);
  const [selectedId, setSelectedId] = useState(null); // null = new note
  const [draft, setDraft] = useState(EMPTY);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  const refresh = () =>
    listNotes().then(setNotes).catch((e) => setError(e.message));

  useEffect(() => {
    refresh();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter(
      (n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
    );
  }, [notes, query]);

  const selected = notes.find((n) => n.id === selectedId);
  const words = draft.content.trim() ? draft.content.trim().split(/\s+/).length : 0;

  const select = (note) => {
    setSelectedId(note.id);
    setDraft({ title: note.title, content: note.content });
  };

  const startNew = () => {
    setSelectedId(null);
    setDraft(EMPTY);
  };

  const save = async (e) => {
    e.preventDefault();
    if (!draft.title.trim()) return;
    try {
      setError("");
      const saved =
        selectedId === null
          ? await createNote(draft)
          : await updateNote(selectedId, draft);
      setSelectedId(saved.id);
      await refresh();
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async () => {
    try {
      await deleteNote(selectedId);
      startNew();
      await refresh();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="app">
      <aside className="glass">
        <div className="brand">
          <h1>✦ Notes</h1>
          <span className="count">{notes.length}</span>
        </div>
        <button className="btn primary full" onClick={startNew}>
          + New note
        </button>
        <input
          className="search"
          placeholder="Search notes…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <ul className="list">
          {filtered.map((n) => (
            <li key={n.id}>
              <button
                className={n.id === selectedId ? "item active" : "item"}
                style={{ "--tag": colorFor(n.id) }}
                onClick={() => select(n)}
              >
                <strong>{n.title}</strong>
                <span className="preview">{n.content || "No content"}</span>
                <span className="when">{timeAgo(n.updated_at)}</span>
              </button>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="empty">
              {notes.length === 0 ? "Your first idea goes here ✨" : "Nothing matches"}
            </li>
          )}
        </ul>
      </aside>

      <main className="glass">
        <form onSubmit={save}>
          <input
            className="title-input"
            placeholder="Untitled note"
            value={draft.title}
            maxLength={200}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          />
          <textarea
            placeholder="Start writing…"
            value={draft.content}
            onChange={(e) => setDraft({ ...draft, content: e.target.value })}
          />
          {error && <p className="error">{error}</p>}
          <div className="footer">
            <span className="meta">
              {words} {words === 1 ? "word" : "words"}
              {selected && ` · edited ${timeAgo(selected.updated_at)}`}
            </span>
            <div className="actions">
              {selectedId !== null && (
                <button type="button" className="btn ghost" onClick={remove}>
                  Delete
                </button>
              )}
              <button className="btn primary" type="submit" disabled={!draft.title.trim()}>
                {selectedId === null ? "Create" : "Save"}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
