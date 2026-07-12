"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

type Post = {
  id: string;
  content: string;
  postType: string;
  likes: number;
  createdAt: string;
  author: { name: string; role: string; xp: number };
  department: { name: string; code: string } | null;
};

type Leader = {
  id: string;
  name: string;
  xp: number;
  rewardPoints: number;
  department: { name: string } | null;
};

export function SocialFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/social", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message ?? "Unable to load feed.");
      setPosts(result.posts ?? []);
      setLeaders(result.leaderboard ?? []);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load feed.");
    }
  }, []);

  useEffect(() => void load(), [load]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    const form = event.currentTarget;
    const data = new FormData(form);

    try {
      const response = await fetch("/api/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: data.get("content"), postType: data.get("postType") }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message ?? "Unable to publish.");
      setMessage(result.message);
      form.reset();
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to publish.");
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <section className="space-y-5">
        <form className="rounded-2xl border bg-white p-6 shadow-sm" onSubmit={submit}>
          <h2 className="text-xl font-semibold text-slate-950">Organization sustainability feed</h2>
          <select className="mt-4 w-full rounded-xl border px-4 py-3" name="postType" defaultValue="UPDATE">
            <option value="UPDATE">Update</option>
            <option value="ACHIEVEMENT">Achievement</option>
            <option value="CHALLENGE">Challenge</option>
            <option value="ANNOUNCEMENT">Announcement</option>
          </select>
          <textarea className="mt-4 min-h-28 w-full rounded-xl border px-4 py-3" name="content" maxLength={1000} placeholder="Share a sustainability update..." required />
          <button className="mt-4 rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white">Publish · earn 5 XP</button>
          {message ? <p className="mt-3 text-sm text-emerald-700">{message}</p> : null}
          {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
        </form>

        {posts.map((post) => (
          <article className="rounded-2xl border bg-white p-6 shadow-sm" key={post.id}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-slate-950">{post.author.name}</p>
                <p className="text-xs text-slate-500">{post.department?.name ?? "Organization"} · {post.postType}</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">{post.author.xp} XP</span>
            </div>
            <p className="mt-4 whitespace-pre-wrap leading-7 text-slate-700">{post.content}</p>
            <p className="mt-4 text-xs text-slate-400">{new Date(post.createdAt).toLocaleString()}</p>
          </article>
        ))}
      </section>

      <aside className="h-fit rounded-2xl border bg-white p-6 shadow-sm lg:sticky lg:top-6" id="leaderboard">
        <h2 className="text-xl font-semibold text-slate-950">Eco leaderboard</h2>
        <p className="mt-2 text-sm text-slate-600">Top contributors by XP.</p>
        <div className="mt-5 space-y-3">
          {leaders.map((leader, index) => (
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4" key={leader.id}>
              <div>
                <p className="font-semibold text-slate-950">#{index + 1} {leader.name}</p>
                <p className="text-xs text-slate-500">{leader.department?.name ?? "Organization"}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-emerald-700">{leader.xp} XP</p>
                <p className="text-xs text-slate-500">{leader.rewardPoints} points</p>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
