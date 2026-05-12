"use client";

import { useState, useRef, useEffect } from "react";

type Panel = {
  image: string;
  chapter: string;
};

type Manga = {
  id: number;
  title: string;
  cover: string;
  panels: Panel[];
};

export default function Home() {
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [selectedManga, setSelectedManga] = useState<Manga | null>(null);
  const [showModal, setShowModal] = useState(false);

  const [mangaTitle, setMangaTitle] = useState("");
  const [mangaCover, setMangaCover] = useState("");

  const [chapter, setChapter] = useState("");
  const [panelImage, setPanelImage] = useState("");

  const coverInputRef = useRef<HTMLInputElement>(null);
  const panelInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handlePaste(e: ClipboardEvent) {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (!file) return;
          const url = URL.createObjectURL(file);
          if (showModal) {
            setMangaCover(url);
          } else if (selectedManga) {
            setPanelImage(url);
          }
          return;
        }
      }
    }
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [showModal, selectedManga]);

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setMangaCover(URL.createObjectURL(file));
  }

  function handlePanelImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPanelImage(URL.createObjectURL(file));
  }

  function handleAddManga() {
    if (!mangaTitle) return;
    const newManga: Manga = {
      id: Date.now(),
      title: mangaTitle,
      cover: mangaCover,
      panels: [],
    };
    setMangas([...mangas, newManga].sort((a, b) => a.title.localeCompare(b.title)));
    setMangaTitle("");
    setMangaCover("");
    setShowModal(false);
  }

  function handleAddPanel() {
    if (!selectedManga || !panelImage) return;
    const updatedManga = {
      ...selectedManga,
      panels: [...selectedManga.panels, { image: panelImage, chapter }],
    };
    setMangas(mangas.map((m) => (m.id === selectedManga.id ? updatedManga : m)));
    setSelectedManga(updatedManga);
    setChapter("");
    setPanelImage("");
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">

        {/* LIBRARY VIEW */}
        {!selectedManga && (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-semibold text-gray-800">Manga Reaction Library</h1>
                <p className="text-sm text-gray-400 mt-1">A collection of reaction panels.</p>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="bg-gray-800 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                + Add manga
              </button>
            </div>

            {mangas.length === 0 ? (
              <div className="text-center py-24 text-gray-300 text-sm">
                No manga yet. Add one to get started.
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {mangas.map((manga) => (
                  <div
                    key={manga.id}
                    onClick={() => setSelectedManga(manga)}
                    className="relative overflow-hidden rounded-lg cursor-pointer hover:shadow-md transition-shadow"
                    style={{ width: 280, height: 420 }}
                  >
                    {manga.cover ? (
                      <img src={manga.cover} alt={manga.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-300 text-5xl">📖</span>
                      </div>
                    )}

                    <div className="absolute top-2 left-2 bg-white text-black text-xs font-semibold px-2 py-1 rounded-md leading-none">
                      {manga.panels.length}
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-4">
                      <p className="text-white text-base font-medium line-clamp-2">{manga.title}</p>
                    </div>

                  </div>
                ))}
            </div>
            )}
          </>
        )}

        {/* DETAIL VIEW */}
        {selectedManga && (
          <>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSelectedManga(null)}
                  className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ← Library
                </button>
                <h1 className="text-2xl font-semibold text-gray-800">{selectedManga.title}</h1>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="bg-gray-800 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                + Add panel
              </button>
            </div>

            {selectedManga.panels.length === 0 ? (
              <div className="text-center py-24 text-gray-300 text-sm">
                No panels yet. Add one to get started.
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-4">
                {selectedManga.panels.map((panel, index) => (
                  <div key={index} className="bg-white border border-gray-100 rounded-lg overflow-hidden">
                    <div className="h-40 bg-gray-50 overflow-hidden">
                      {panel.image && (
                        <img src={panel.image} alt={`Panel ${index + 1}`} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="p-2">
                      <p className="text-xs text-gray-400">Ch. {panel.chapter}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* MODAL */}
        {showModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-lg">

              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-semibold text-gray-800">Add manga</h2>
                <button
                  onClick={() => { setShowModal(false); setMangaTitle(""); setMangaCover(""); }}
                  className="text-gray-300 hover:text-gray-500 text-xl leading-none"
                >
                  ×
                </button>
              </div>

              <div className="flex gap-3 mb-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverChange}
                  ref={coverInputRef}
                  className="hidden"
                />
                <div
                  onClick={() => coverInputRef.current?.click()}
                  className="w-32 h-48 min-w-32 border border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-300 transition-colors overflow-hidden"
                >
                  {mangaCover ? (
                    <img src={mangaCover} alt="Cover" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-300 text-xs text-center leading-tight">Cover<br/>image</span>
                  )}
                </div>

                <div className="flex flex-col justify-center flex-1">
                  <input
                    type="text"
                    placeholder="Manga title"
                    value={mangaTitle}
                    onChange={(e) => setMangaTitle(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-300"
                  />
                  <p className="text-xs text-gray-300 mt-2">Cover image is optional.</p>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => { setShowModal(false); setMangaTitle(""); setMangaCover(""); }}
                  className="text-sm px-4 py-2 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddManga}
                  className="text-sm px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition-colors"
                >
                  Save
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </main>
  );
}