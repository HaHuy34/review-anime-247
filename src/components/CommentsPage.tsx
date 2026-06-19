"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Heart,
  MessageCircle,
  Send,
  ChevronDown,
  ChevronUp,
  Shield,
  Camera,
  Reply,
  Trash2,
} from "lucide-react";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────
export interface Comment {
  id: string;
  name: string;
  avatar?: string | null;
  content: string;
  createdAt: number;
  likes: number;
  likedBy: string[];
  reactions: Record<string, string[]>;
  replies: ReplyItem[];
  isAdmin?: boolean;
  pinned?: boolean;
}

export interface ReplyItem {
  id: string;
  name: string;
  avatar?: string | null;
  content: string;
  createdAt: number;
  likes: number;
  likedBy: string[];
  isAdmin?: boolean;
  // NEW: who/what this reply is quoting, so replies-to-replies show context like FB
  replyToId?: string | null;
  replyToName?: string | null;
  replyToContent?: string | null;
}

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────
const EMOJI_LIST = ["👍", "❤️", "👀", "😂", "😮", "😢", "🤬"];
const SESSION_KEY = "ra247_session_id";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "vừa xong";
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  const d = Math.floor(h / 24);
  return `${d} ngày trước`;
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + "…";
}

async function resizeAvatar(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const size = 80;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d")!;
      const min = Math.min(img.width, img.height);
      const sx = (img.width - min) / 2;
      const sy = (img.height - min) / 2;
      ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.7));
    };
    img.onerror = reject;
    img.src = url;
  });
}

// ─────────────────────────────────────────────
// AVATAR COMPONENT
// ─────────────────────────────────────────────
function Avatar({
  src,
  name,
  size = 36,
}: {
  src?: string | null;
  name: string;
  size?: number;
}) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const colors = [
    "bg-amber-500",
    "bg-orange-500",
    "bg-rose-500",
    "bg-violet-500",
    "bg-cyan-500",
    "bg-emerald-500",
  ];
  const color = colors[name.charCodeAt(0) % colors.length];

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className="rounded-full object-cover shrink-0 border-2 border-white/10"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className={`${color} rounded-full flex items-center justify-center shrink-0 border-2 border-white/10 font-black text-white`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials || "?"}
    </div>
  );
}

// ─────────────────────────────────────────────
// REPLY FORM
// ─────────────────────────────────────────────
function ReplyForm({
  theme,
  commentId,
  onSubmit,
  onCancel,
  isAdmin,
  quoteTarget,
  onClearQuote,
}: {
  theme: "dark" | "light";
  commentId: string;
  onSubmit: (commentId: string, reply: Omit<ReplyItem, "id">) => Promise<void>;
  onCancel: () => void;
  isAdmin: boolean;
  quoteTarget?: { id: string; name: string; content: string } | null;
  onClearQuote?: () => void;
}) {
  const [name, setName] = useState(isAdmin ? "Admin" : "");
  const [content, setContent] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const resized = await resizeAvatar(file);
    setAvatar(resized);
  };

  const handleSubmit = async () => {
    if (!name.trim() || !content.trim()) return;
    setLoading(true);
    await onSubmit(commentId, {
      name: name.trim(),
      avatar: avatar ?? null,
      content: content.trim(),
      createdAt: Date.now(),
      likes: 0,
      likedBy: [],
      isAdmin,
      replyToId: quoteTarget?.id ?? null,
      replyToName: quoteTarget?.name ?? null,
      replyToContent: quoteTarget?.content ?? null,
    });
    setLoading(false);
    onCancel();
  };

  return (
    <div
      className={`mt-3 ml-10 p-3 rounded-2xl border ${theme === "dark" ? "bg-[#0c0c14] border-white/5" : "bg-slate-50 border-black/5"}`}
    >
      {quoteTarget && (
        <div
          className={`flex items-start justify-between gap-2 mb-2 px-2.5 py-1.5 rounded-lg border-l-2 border-amber-500 ${theme === "dark" ? "bg-amber-500/10" : "bg-amber-50"}`}
        >
          <p className="text-[11px] leading-snug min-w-0">
            <span className="font-bold text-amber-500">
              Đang trả lời {quoteTarget.name}:{" "}
            </span>
            <span
              className={theme === "dark" ? "text-slate-400" : "text-slate-500"}
            >
              {truncate(quoteTarget.content, 70)}
            </span>
          </p>
          {onClearQuote && (
            <button
              onClick={onClearQuote}
              className="text-[11px] opacity-50 hover:opacity-100 cursor-pointer shrink-0"
              title="Bỏ trích dẫn"
            >
              ✕
            </button>
          )}
        </div>
      )}
      <div className="flex items-center gap-2 mb-2">
        <div
          className="relative cursor-pointer"
          onClick={() => fileRef.current?.click()}
        >
          <Avatar src={avatar} name={name || "?"} size={30} />
          <Camera className="w-3 h-3 absolute -bottom-0.5 -right-0.5 bg-amber-500 rounded-full p-0.5 text-white" />
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isAdmin}
          placeholder="Tên của bạn"
          maxLength={30}
          className={`flex-1 text-xs rounded-lg px-2.5 py-1.5 outline-none border ${theme === "dark" ? "bg-[#13131c] border-white/5 text-white placeholder:text-slate-500" : "bg-white border-black/10 text-slate-800 placeholder:text-slate-400"} ${isAdmin ? "opacity-60" : ""}`}
        />
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Nhập phản hồi..."
        rows={2}
        maxLength={500}
        className={`w-full text-xs rounded-xl px-3 py-2 outline-none border resize-none ${theme === "dark" ? "bg-[#13131c] border-white/5 text-white placeholder:text-slate-500" : "bg-white border-black/10 text-slate-800 placeholder:text-slate-400"}`}
      />
      <div className="flex gap-2 mt-2 justify-end">
        <button
          onClick={onCancel}
          className="text-xs px-3 py-1.5 rounded-lg opacity-60 hover:opacity-100 cursor-pointer transition-opacity"
        >
          Huỷ
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading || !name.trim() || !content.trim()}
          className="text-xs px-4 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold disabled:opacity-40 cursor-pointer hover:bg-amber-400 transition-colors flex items-center gap-1"
        >
          <Send className="w-3 h-3" />
          {loading ? "Đang gửi..." : "Gửi"}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// COMMENT CARD
// ─────────────────────────────────────────────
function CommentCard({
  comment,
  theme,
  sessionId,
  isAdmin,
  onLike,
  onReact,
  onReply,
  onDelete,
  onLikeReply,
}: {
  comment: Comment;
  theme: "dark" | "light";
  sessionId: string;
  isAdmin: boolean;
  onLike: (id: string) => void;
  onReact: (id: string, emoji: string) => void;
  onReply: (commentId: string, reply: Omit<ReplyItem, "id">) => Promise<void>;
  onDelete: (id: string) => void;
  onLikeReply: (commentId: string, replyId: string) => void;
}) {
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  // NEW: which reply (if any) the open reply-form is quoting. null = replying to the root comment.
  const [quoteTarget, setQuoteTarget] = useState<{
    id: string;
    name: string;
    content: string;
  } | null>(null);
  const hasLiked = comment.likedBy.includes(sessionId);
  const replyCount = comment.replies?.length ?? 0;
  const totalReactions = Object.values(comment.reactions ?? {}).flat().length;

  const openReplyForm = (
    target: { id: string; name: string; content: string } | null,
  ) => {
    setQuoteTarget(target);
    setShowReplyForm(true);
    setShowReplies(true);
  };

  return (
    <div
      className={`rounded-2xl border p-4 transition-all ${
        comment.pinned
          ? theme === "dark"
            ? "border-amber-500/40 bg-amber-500/5"
            : "border-amber-400/40 bg-amber-50"
          : theme === "dark"
            ? "border-white/5 bg-[#0c0c14]"
            : "border-black/5 bg-white"
      }`}
    >
      {comment.pinned && (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-500 mb-2">
          📌 Được ghim
        </span>
      )}

      <div className="flex gap-3">
        <Avatar src={comment.avatar} name={comment.name} size={38} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap gap-1.5 mb-1">
            <span className="font-bold text-sm">{comment.name}</span>
            {comment.isAdmin && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold bg-red-500 text-white px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                <Shield className="w-2.5 h-2.5" /> ADMIN
              </span>
            )}
            <span
              className={`text-[11px] ${theme === "dark" ? "text-slate-500" : "text-slate-400"}`}
            >
              {timeAgo(comment.createdAt)}
            </span>
            {isAdmin && (
              <button
                onClick={() => onDelete(comment.id)}
                className="ml-auto text-red-400 hover:text-red-300 cursor-pointer transition-colors"
                title="Xoá bình luận"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <p
            className={`text-sm leading-relaxed whitespace-pre-wrap break-words ${theme === "dark" ? "text-slate-200" : "text-slate-700"}`}
          >
            {comment.content}
          </p>

          {/* Reactions bar */}
          {totalReactions > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {EMOJI_LIST.map((emoji) => {
                const users = comment.reactions?.[emoji] ?? [];
                if (users.length === 0) return null;
                const reacted = users.includes(sessionId);
                return (
                  <button
                    key={emoji}
                    onClick={() => onReact(comment.id, emoji)}
                    className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border cursor-pointer transition-all
                      ${reacted ? "border-amber-500 bg-amber-500/10 text-amber-400" : theme === "dark" ? "border-white/10 bg-white/5 hover:border-white/20" : "border-black/10 bg-black/5 hover:border-black/20"}`}
                  >
                    {emoji} <span className="font-bold">{users.length}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Action row */}
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <button
              onClick={() => onLike(comment.id)}
              className={`flex items-center gap-1 text-xs font-semibold cursor-pointer transition-colors ${hasLiked ? "text-rose-400" : theme === "dark" ? "text-slate-400 hover:text-rose-400" : "text-slate-500 hover:text-rose-500"}`}
            >
              <Heart
                className={`w-3.5 h-3.5 ${hasLiked ? "fill-current" : ""}`}
              />
              {comment.likes > 0 && <span>{comment.likes}</span>}
            </button>

            <div className="relative">
              <button
                onClick={() => setShowEmojiPicker((v) => !v)}
                className={`text-xs cursor-pointer transition-colors ${theme === "dark" ? "text-slate-400 hover:text-amber-400" : "text-slate-500 hover:text-amber-500"}`}
              >
                😊
              </button>
              {showEmojiPicker && (
                <div
                  className={`absolute bottom-7 left-0 flex gap-1 p-2 rounded-2xl border shadow-xl z-10 ${theme === "dark" ? "bg-[#13131c] border-white/10" : "bg-white border-black/10"}`}
                >
                  {EMOJI_LIST.map((e) => (
                    <button
                      key={e}
                      onClick={() => {
                        onReact(comment.id, e);
                        setShowEmojiPicker(false);
                      }}
                      className="text-lg hover:scale-125 transition-transform cursor-pointer"
                    >
                      {e}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => openReplyForm(null)}
              className={`flex items-center gap-1 text-xs font-semibold cursor-pointer transition-colors ${theme === "dark" ? "text-slate-400 hover:text-amber-400" : "text-slate-500 hover:text-amber-500"}`}
            >
              <Reply className="w-3.5 h-3.5" />
              Trả lời
            </button>

            {replyCount > 0 && (
              <button
                onClick={() => setShowReplies((v) => !v)}
                className="flex items-center gap-1 text-xs font-semibold text-amber-500 cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                {replyCount} phản hồi
                {showReplies ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </button>
            )}
          </div>

          {/* Reply form */}
          {showReplyForm && (
            <ReplyForm
              theme={theme}
              commentId={comment.id}
              onSubmit={onReply}
              onCancel={() => {
                setShowReplyForm(false);
                setQuoteTarget(null);
              }}
              isAdmin={isAdmin}
              quoteTarget={quoteTarget}
              onClearQuote={() => setQuoteTarget(null)}
            />
          )}

          {/* Replies list */}
          {showReplies && replyCount > 0 && (
            <div className="mt-3 ml-2 space-y-3 border-l-2 border-amber-500/20 pl-4">
              {comment.replies.map((reply) => {
                const hasLikedReply = reply.likedBy.includes(sessionId);
                return (
                  <div
                    key={reply.id}
                    id={`reply-${reply.id}`}
                    className="flex gap-2.5"
                  >
                    <Avatar src={reply.avatar} name={reply.name} size={28} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-1.5 mb-0.5">
                        <span className="font-bold text-xs">{reply.name}</span>
                        {reply.isAdmin && (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold bg-red-500 text-white px-1.5 py-0.5 rounded-full tracking-wide">
                            <Shield className="w-2 h-2" /> Admin
                          </span>
                        )}
                        <span
                          className={`text-[10px] ${theme === "dark" ? "text-slate-500" : "text-slate-400"}`}
                        >
                          {timeAgo(reply.createdAt)}
                        </span>
                      </div>

                      {/* Quoted parent, like FB's "replying to" preview */}
                      {reply.replyToId && reply.replyToName && (
                        <button
                          onClick={() => {
                            const el = document.getElementById(
                              `reply-${reply.replyToId}`,
                            );
                            el?.scrollIntoView({
                              behavior: "smooth",
                              block: "center",
                            });
                          }}
                          className={`block w-full text-left mb-1 px-2 py-1 rounded-lg border-l-2 border-amber-500/50 cursor-pointer ${theme === "dark" ? "bg-white/[0.03] hover:bg-white/[0.06]" : "bg-black/[0.03] hover:bg-black/[0.06]"}`}
                        >
                          <p className="text-[10px] leading-snug">
                            <span className="font-bold text-amber-500/90">
                              ↪ {reply.replyToName}:{" "}
                            </span>
                            <span
                              className={
                                theme === "dark"
                                  ? "text-slate-500"
                                  : "text-slate-400"
                              }
                            >
                              {truncate(reply.replyToContent ?? "", 60)}
                            </span>
                          </p>
                        </button>
                      )}

                      <p
                        className={`text-xs leading-relaxed whitespace-pre-wrap break-words ${theme === "dark" ? "text-slate-300" : "text-slate-600"}`}
                      >
                        {reply.content}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <button
                          onClick={() => onLikeReply(comment.id, reply.id)}
                          className={`flex items-center gap-1 text-[11px] font-semibold cursor-pointer transition-colors ${hasLikedReply ? "text-rose-400" : theme === "dark" ? "text-slate-500 hover:text-rose-400" : "text-slate-400 hover:text-rose-500"}`}
                        >
                          <Heart
                            className={`w-3 h-3 ${hasLikedReply ? "fill-current" : ""}`}
                          />
                          {reply.likes > 0 && <span>{reply.likes}</span>}
                        </button>
                        <button
                          onClick={() =>
                            openReplyForm({
                              id: reply.id,
                              name: reply.name,
                              content: reply.content,
                            })
                          }
                          className={`flex items-center gap-1 text-[11px] font-semibold cursor-pointer transition-colors ${theme === "dark" ? "text-slate-500 hover:text-amber-400" : "text-slate-400 hover:text-amber-500"}`}
                        >
                          <Reply className="w-3 h-3" />
                          Trả lời
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN COMMENTS PAGE
// ─────────────────────────────────────────────
export default function CommentsPage({ theme }: { theme: "dark" | "light" }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPw, setAdminPw] = useState("");
  const [adminError, setAdminError] = useState("");
  const [sessionId] = useState(getSessionId);
  const fileRef = useRef<HTMLInputElement>(null);
  const unsubRef = useRef<(() => void) | null>(null);

  // ── Load Firestore realtime ──
  useEffect(() => {
    import("firebase/firestore").then(
      ({ collection, query, orderBy, onSnapshot }) => {
        import("@/src/firebase/config")
          .then(({ db }) => {
            const q = query(
              collection(db, "comments"),
              orderBy("pinned", "desc"),
              orderBy("createdAt", "desc"),
            );
            const unsub = onSnapshot(q, (snap) => {
              const data = snap.docs.map((d) => ({
                id: d.id,
                ...d.data(),
              })) as Comment[];
              setComments(data);
              setLoading(false);
            });
            unsubRef.current = unsub;
          })
          .catch(() => setLoading(false));
      },
    );
    return () => {
      unsubRef.current?.();
    };
  }, []);

  // ── Persist admin state ──
  useEffect(() => {
    const saved = sessionStorage.getItem("ra247_admin");
    if (saved === "true") setIsAdmin(true);
  }, []);

  // ── Avatar upload ──
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const resized = await resizeAvatar(file);
    setAvatar(resized);
  };

  // ── Submit new comment ──
  const handleSubmit = async () => {
    if (!name.trim() || !content.trim()) return;
    setSubmitting(true);
    try {
      const { collection, addDoc } = await import("firebase/firestore");
      const { db } = await import("@/src/firebase/config");
      await addDoc(collection(db, "comments"), {
        name: name.trim(),
        avatar: avatar ?? null,
        content: content.trim(),
        createdAt: Date.now(),
        likes: 0,
        likedBy: [],
        reactions: {},
        replies: [],
        isAdmin,
        pinned: false,
      });
      setContent("");
    } catch (err) {
      console.error(err);
    }
    setSubmitting(false);
  };

  // ── Like comment ──
  const handleLike = async (id: string) => {
    const { doc, updateDoc, arrayUnion, arrayRemove } =
      await import("firebase/firestore");
    const { db } = await import("@/src/firebase/config");
    const comment = comments.find((c) => c.id === id);
    if (!comment) return;
    const hasLiked = comment.likedBy.includes(sessionId);
    await updateDoc(doc(db, "comments", id), {
      likes: hasLiked ? Math.max(0, comment.likes - 1) : comment.likes + 1,
      likedBy: hasLiked ? arrayRemove(sessionId) : arrayUnion(sessionId),
    });
  };

  // ── React emoji ──
  const handleReact = async (id: string, emoji: string) => {
    const { doc, updateDoc, arrayUnion, arrayRemove } =
      await import("firebase/firestore");
    const { db } = await import("@/src/firebase/config");
    const comment = comments.find((c) => c.id === id);
    if (!comment) return;
    const users = comment.reactions?.[emoji] ?? [];
    const hasReacted = users.includes(sessionId);
    await updateDoc(doc(db, "comments", id), {
      [`reactions.${emoji}`]: hasReacted
        ? arrayRemove(sessionId)
        : arrayUnion(sessionId),
    });
  };

  // ── Reply ──
  const handleReply = async (
    commentId: string,
    reply: Omit<ReplyItem, "id">,
  ) => {
    const { doc, updateDoc, arrayUnion } = await import("firebase/firestore");
    const { db } = await import("@/src/firebase/config");
    const newReply: ReplyItem = {
      ...reply,
      id: Math.random().toString(36).slice(2),
      avatar: reply.avatar ?? null,
    };
    await updateDoc(doc(db, "comments", commentId), {
      replies: arrayUnion(newReply),
    });
  };

  // ── Like reply ──
  const handleLikeReply = async (commentId: string, replyId: string) => {
    const { doc, updateDoc } = await import("firebase/firestore");
    const { db } = await import("@/src/firebase/config");
    const comment = comments.find((c) => c.id === commentId);
    if (!comment) return;
    const updatedReplies = comment.replies.map((r) => {
      if (r.id !== replyId) return r;
      const hasLiked = r.likedBy.includes(sessionId);
      return {
        ...r,
        likes: hasLiked ? Math.max(0, r.likes - 1) : r.likes + 1,
        likedBy: hasLiked
          ? r.likedBy.filter((s) => s !== sessionId)
          : [...r.likedBy, sessionId],
      };
    });
    await updateDoc(doc(db, "comments", commentId), {
      replies: updatedReplies,
    });
  };

  // ── Delete comment (admin) ──
  const handleDelete = async (id: string) => {
    if (!isAdmin) return;
    if (!confirm("Xoá bình luận này?")) return;
    const { doc, deleteDoc } = await import("firebase/firestore");
    const { db } = await import("@/src/firebase/config");
    await deleteDoc(doc(db, "comments", id));
  };

  // ── Admin login ──
  const handleAdminLogin = async () => {
    const res = await fetch("/api/admin-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: adminPw }),
    });
    if (res.ok) {
      setIsAdmin(true);
      sessionStorage.setItem("ra247_admin", "true");
      setShowAdminLogin(false);
      setAdminPw("");
      setAdminError("");
      setName("Admin");
    } else {
      setAdminError("Sai mật khẩu!");
    }
  };

  const charCount = content.length;
  const MAX_CHARS = 500;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-black flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-amber-500" />
          Bình luận
          {!loading && (
            <span
              className={`text-sm font-normal ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}
            >
              ({comments.length})
            </span>
          )}
        </h2>

        {/* Admin toggle */}
        {isAdmin ? (
          <button
            onClick={() => {
              setIsAdmin(false);
              sessionStorage.removeItem("ra247_admin");
              setName("");
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-red-400 border border-red-400/30 px-3 py-1.5 rounded-full hover:bg-red-400/10 cursor-pointer transition-colors"
          >
            <Shield className="w-3.5 h-3.5" /> Admin mode
          </button>
        ) : (
          <button
            onClick={() => setShowAdminLogin((v) => !v)}
            className={`hidden text-xs cursor-pointer transition-colors ${theme === "dark" ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-600"}`}
          >
            🔐
          </button>
        )}
      </div>

      {/* Admin login form */}
      {showAdminLogin && !isAdmin && (
        <div
          className={`p-4 rounded-2xl border ${theme === "dark" ? "bg-[#0c0c14] border-white/5" : "bg-white border-black/5"}`}
        >
          <p className="text-xs font-bold mb-2 text-amber-500">
            Đăng nhập Admin
          </p>
          <div className="flex gap-2">
            <input
              type="password"
              value={adminPw}
              onChange={(e) => setAdminPw(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()}
              placeholder="Mật khẩu admin"
              className={`flex-1 text-xs rounded-xl px-3 py-2 outline-none border ${theme === "dark" ? "bg-[#13131c] border-white/5 text-white placeholder:text-slate-500" : "bg-slate-50 border-black/10 text-slate-800"}`}
            />
            <button
              onClick={handleAdminLogin}
              className="text-xs px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold cursor-pointer hover:bg-amber-400 transition-colors"
            >
              Vào
            </button>
          </div>
          {adminError && (
            <p className="text-xs text-red-400 mt-1">{adminError}</p>
          )}
        </div>
      )}

      {/* Comment input */}
      <div
        className={`p-4 rounded-3xl border ${theme === "dark" ? "bg-[#0c0c14] border-white/5" : "bg-white border-black/5 shadow-sm"}`}
      >
        <div className="flex gap-3 mb-3">
          <div
            className="relative cursor-pointer shrink-0"
            onClick={() => fileRef.current?.click()}
          >
            <Avatar src={avatar} name={name || "?"} size={40} />
            <Camera className="w-3.5 h-3.5 absolute -bottom-0.5 -right-0.5 bg-amber-500 rounded-full p-0.5 text-white" />
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          <div className="flex-1 space-y-2">
            <input
              value={isAdmin ? "Admin" : name}
              onChange={(e) => !isAdmin && setName(e.target.value)}
              disabled={isAdmin}
              placeholder="Tên của bạn *"
              maxLength={30}
              className={`w-full text-sm rounded-xl px-3 py-2 outline-none border transition-colors ${theme === "dark" ? "bg-[#13131c] border-white/5 focus:border-amber-500/40 text-white placeholder:text-slate-500" : "bg-slate-50 border-black/5 focus:border-amber-400/40 text-slate-800 placeholder:text-slate-400"} ${isAdmin ? "opacity-60" : ""}`}
            />
          </div>
        </div>

        <div className="relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, MAX_CHARS))}
            placeholder="Chia sẻ cảm nghĩ của bạn về Dragon Ball... 🐉"
            rows={3}
            className={`w-full text-sm rounded-xl px-3 py-2.5 outline-none border resize-none transition-colors ${theme === "dark" ? "bg-[#13131c] border-white/5 focus:border-amber-500/40 text-white placeholder:text-slate-500" : "bg-slate-50 border-black/5 focus:border-amber-400/40 text-slate-800 placeholder:text-slate-400"}`}
          />
          <span
            className={`absolute bottom-2 right-3 text-[10px] ${charCount > MAX_CHARS * 0.9 ? "text-rose-400" : theme === "dark" ? "text-slate-600" : "text-slate-400"}`}
          >
            {charCount}/{MAX_CHARS}
          </span>
        </div>

        <div className="flex justify-end items-center mt-3">
          {/* <p
            className={`text-[11px] ${theme === "dark" ? "text-slate-600" : "text-slate-400"}`}
          >
            💡 Click ảnh đại diện để đổi avatar
          </p> */}
          <button
            onClick={handleSubmit}
            disabled={submitting || !name.trim() || !content.trim()}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-amber-500 text-slate-950 text-sm font-black disabled:opacity-40 cursor-pointer hover:bg-amber-400 active:scale-95 transition-all"
          >
            <Send className="w-4 h-4" />
            {submitting ? "Đang gửi..." : "Gửi"}
          </button>
        </div>
      </div>

      {/* Comments list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`rounded-2xl border p-4 animate-pulse ${theme === "dark" ? "bg-[#0c0c14] border-white/5" : "bg-white border-black/5"}`}
            >
              <div className="flex gap-3">
                <div
                  className={`w-10 h-10 rounded-full ${theme === "dark" ? "bg-slate-800" : "bg-slate-200"}`}
                />
                <div className="flex-1 space-y-2">
                  <div
                    className={`h-3 w-24 rounded ${theme === "dark" ? "bg-slate-800" : "bg-slate-200"}`}
                  />
                  <div
                    className={`h-3 w-full rounded ${theme === "dark" ? "bg-slate-800" : "bg-slate-200"}`}
                  />
                  <div
                    className={`h-3 w-3/4 rounded ${theme === "dark" ? "bg-slate-800" : "bg-slate-200"}`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div
          className={`text-center py-16 rounded-3xl border ${theme === "dark" ? "border-white/5 bg-[#0c0c14]" : "border-black/5 bg-white"}`}
        >
          <p className="text-4xl mb-3">🐉</p>
          <p
            className={`font-bold ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}
          >
            Chưa có bình luận nào
          </p>
          <p
            className={`text-sm mt-1 ${theme === "dark" ? "text-slate-600" : "text-slate-400"}`}
          >
            Hãy là người đầu tiên chia sẻ!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <CommentCard
              key={c.id}
              comment={c}
              theme={theme}
              sessionId={sessionId}
              isAdmin={isAdmin}
              onLike={handleLike}
              onReact={handleReact}
              onReply={handleReply}
              onDelete={handleDelete}
              onLikeReply={handleLikeReply}
            />
          ))}
        </div>
      )}
    </div>
  );
}
