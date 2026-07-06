"use client";

import { useEffect, useRef, useState } from "react";
import { OwnerGate, OwnerLayout, ownerHeaders, glass, CopyButton, OWNER_PASS_KEY } from "./shared";

const AUDIO_EXT = /\.(mp3|wav|ogg|m4a)$/i;
const IMAGE_EXT = /\.(png|jpe?g|webp|gif|avif|svg)$/i;

function fmtSize(bytes) {
  if (!bytes) return "—";
  if (bytes > 1048576) return (bytes / 1048576).toFixed(1) + " Mo";
  return Math.round(bytes / 1024) + " Ko";
}

/**
 * kind = "images" | "audio" — the media library and the music library
 * share this component (same Supabase Storage bucket underneath).
 */
export default function MediaLibrary({ kind }) {
  const [granted, setGranted] = useState(false);
  const [files, setFiles] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const replaceTarget = useRef(null);

  const isAudio = kind === "audio";
  const accept = isAudio ? "audio/*" : "image/*";

  async function load() {
    const res = await fetch("/api/owner/media", { headers: ownerHeaders() });
    if (!res.ok) {
      if (res.status === 401) return setGranted(false);
      setGranted(true);
      setError((await res.json().catch(() => ({}))).error || "erreur");
      setFiles([]);
      return;
    }
    setGranted(true);
    const all = (await res.json()).files;
    setFiles(all.filter((f) => (isAudio ? AUDIO_EXT.test(f.name) : IMAGE_EXT.test(f.name))));
  }

  useEffect(() => {
    if (sessionStorage.getItem(OWNER_PASS_KEY)) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind]);

  async function upload(fileList, replaceName, replaceBucket) {
    setBusy(true);
    setError("");
    try {
      for (const file of fileList) {
        const fd = new FormData();
        fd.append("file", file);
        if (replaceName) fd.append("replace", replaceName);
        if (replaceBucket) fd.append("bucket", replaceBucket);
        const res = await fetch("/api/owner/media", {
          method: "POST",
          headers: ownerHeaders(),
          body: fd,
        });
        if (!res.ok) throw new Error((await res.json()).error || "upload failed");
      }
      load();
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setBusy(false);
      replaceTarget.current = null;
    }
  }

  async function remove(name, bucket) {
    if (!window.confirm(`Supprimer ${name} ?`)) return;
    await fetch("/api/owner/media", {
      method: "DELETE",
      headers: { ...ownerHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ name, bucket }),
    });
    load();
  }

  if (!granted) return <OwnerGate onGranted={() => load()} />;

  return (
    <OwnerLayout
      active={isAudio ? "/owner/music" : "/owner/media"}
      title={isAudio ? "Musiques" : "Médiathèque"}
      actions={
        <label className="cursor-pointer rounded-xl border border-gold/50 px-3.5 py-2 text-sm text-gold-dark transition-colors hover:bg-ivory-dark">
          {busy ? "Envoi…" : "⇪ Uploader"}
          <input
            type="file"
            accept={accept}
            multiple
            className="hidden"
            onChange={(e) => e.target.files?.length && upload([...e.target.files])}
          />
        </label>
      }
    >
      {error && <p className="mb-3 text-sm text-burgundy">{error}</p>}
      {!files && <p className="py-10 text-center text-ink/55">Chargement…</p>}
      {files && files.length === 0 && (
        <div className={`p-10 text-center text-ink/55 ${glass}`}>
          {isAudio ? "Aucune musique" : "Aucune image"} — utilisez « Uploader » en haut à droite.
          <br />
          <span className="text-xs">
            Les fichiers sont stockés sur Supabase Storage et utilisables dans n'importe quel mariage.
          </span>
        </div>
      )}

      <div className={isAudio ? "space-y-2" : "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"}>
        {(files || []).map((f) =>
          isAudio ? (
            <div key={f.bucket + "/" + f.name} className={`flex flex-wrap items-center gap-3 p-3 ${glass}`}>
              <span className="text-xl">🎵</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-ink">{f.name}</span>
                <span className="text-xs text-ink/45">{fmtSize(f.size)}</span>
              </span>
              <audio controls preload="none" src={f.url} className="h-8 max-w-[220px]" />
              <span className="flex items-center gap-1.5">
                <CopyButton text={f.url} label="lien" />
                <label className="cursor-pointer rounded-md border border-gold/50 px-2 py-0.5 text-xs text-gold-dark hover:bg-ivory-dark">
                  remplacer
                  <input
                    type="file"
                    accept={accept}
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && upload([e.target.files[0]], f.name, f.bucket)}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => remove(f.name, f.bucket)}
                  className="rounded-md border border-burgundy/40 px-2 py-0.5 text-xs text-burgundy hover:bg-burgundy hover:text-white"
                >
                  supprimer
                </button>
              </span>
            </div>
          ) : (
            <div key={f.bucket + "/" + f.name} className={`overflow-hidden ${glass}`}>
              <a href={f.url} target="_blank" rel="noreferrer" title="Prévisualiser">
                <img src={f.url} alt={f.name} className="aspect-[4/3] w-full object-cover" loading="lazy" />
              </a>
              <div className="p-2">
                <p className="truncate text-xs font-medium text-ink" title={f.name}>
                  {f.name}
                </p>
                <p className="text-[0.65rem] text-ink/45">{fmtSize(f.size)}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-1">
                  <CopyButton text={f.url} label="lien" />
                  <label className="cursor-pointer rounded-md border border-gold/50 px-2 py-0.5 text-xs text-gold-dark hover:bg-ivory-dark">
                    remplacer
                    <input
                      type="file"
                      accept={accept}
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && upload([e.target.files[0]], f.name, f.bucket)}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => remove(f.name, f.bucket)}
                    className="rounded-md border border-burgundy/40 px-2 py-0.5 text-xs text-burgundy hover:bg-burgundy hover:text-white"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </OwnerLayout>
  );
}
