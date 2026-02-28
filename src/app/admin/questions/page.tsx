"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  MessageCircleQuestion,
  Loader2,
  Send,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";

interface Question {
  id: string;
  productId: string;
  userName: string;
  question: string;
  answer?: string;
  answeredAt?: string;
  isPublished: boolean;
  createdAt: string;
}

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"unanswered" | "answered" | "all">("unanswered");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [answeringId, setAnsweringId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/questions?filter=${filter}&page=${page}`);
      const data = await res.json();
      setQuestions(data.questions || []);
      setTotalPages(data.totalPages || 1);
    } catch {
      console.error("Failed to fetch questions");
    } finally {
      setLoading(false);
    }
  }, [filter, page]);

  useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

  const handleAnswer = async (id: string) => {
    if (!answerText.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/questions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer: answerText.trim() }),
      });
      if (res.ok) {
        setAnsweringId(null);
        setAnswerText("");
        fetchQuestions();
      }
    } catch {
      console.error("Failed to answer question");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this question?")) return;
    try {
      await fetch(`/api/admin/questions/${id}`, { method: "DELETE" });
      fetchQuestions();
    } catch {
      console.error("Failed to delete question");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-heading flex items-center gap-3">
            <MessageCircleQuestion className="w-6 h-6 text-neon-violet" />
            Product Q&A
          </h1>
          <p className="text-sm text-muted-fg mt-1">Answer customer questions about your products</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-muted-fg" />
        {(["unanswered", "answered", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => { setFilter(f); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
              filter === f
                ? "bg-neon-violet text-white"
                : "bg-[var(--overlay)] text-body hover:text-heading border border-[var(--border)]"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-neon-violet" />
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-16 text-muted-fg">
          No {filter !== "all" ? filter : ""} questions found.
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q) => (
            <div key={q.id} className="rounded-2xl border border-[var(--border)] bg-[var(--overlay)] p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-xs text-subtle-fg mb-2">
                    <span>{q.userName}</span>
                    <span>·</span>
                    <span>{new Date(q.createdAt).toLocaleDateString("en-GB")}</span>
                    <span>·</span>
                    <Link href={`/admin/products`} className="text-neon-violet hover:underline">
                      View Product
                    </Link>
                  </div>
                  <p className="text-sm text-heading font-medium mb-2">
                    <span className="text-neon-violet font-bold mr-2">Q:</span>
                    {q.question}
                  </p>
                  {q.answer && (
                    <p className="text-sm text-body mt-2 pl-4 border-l-2 border-emerald-500/30">
                      <span className="text-emerald-400 font-bold mr-2">A:</span>
                      {q.answer}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {!q.answer && (
                    <button
                      onClick={() => { setAnsweringId(answeringId === q.id ? null : q.id); setAnswerText(""); }}
                      className="p-2 rounded-lg hover:bg-neon-violet/10 text-neon-violet transition-colors"
                      title="Answer"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(q.id)}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Answer form */}
              {answeringId === q.id && (
                <div className="mt-4 pt-4 border-t border-[var(--border)] space-y-3">
                  <textarea
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    maxLength={1000}
                    rows={3}
                    placeholder="Type your answer..."
                    className="w-full px-4 py-3 rounded-xl bg-[var(--overlay)] border border-[var(--border)] text-heading text-sm focus:outline-none focus:border-neon-violet/50 focus:ring-2 focus:ring-neon-violet/20 transition-all resize-none placeholder:text-subtle-fg"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-subtle-fg">{answerText.length}/1000</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setAnsweringId(null); setAnswerText(""); }}
                        className="px-4 py-2 rounded-lg text-sm text-muted-fg hover:text-heading border border-[var(--border)] transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleAnswer(q.id)}
                        disabled={saving || !answerText.trim()}
                        className="px-4 py-2 rounded-lg bg-neon-violet text-white text-sm font-medium hover:bg-neon-violet/90 transition-all disabled:opacity-50 flex items-center gap-2"
                      >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        Send Answer
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="p-2 rounded-lg border border-[var(--border)] disabled:opacity-30">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-muted-fg">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="p-2 rounded-lg border border-[var(--border)] disabled:opacity-30">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
