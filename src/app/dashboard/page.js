"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/libs/supabase";
import { useRouter } from "next/navigation";

export default function Dashboard() {
    const router = useRouter();

    const [title, setTitle] = useState("");
    const [url, setUrl] = useState("");
    const [bookmarks, setBookmarks] = useState([]);
    const [user, setUser] = useState(null);

   
    useEffect(() => {
        const checkUser = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                router.push("/login");
            } else {
                setUser(user);
            }
        };

        checkUser();
    }, [router]);

   
    const fetchBookmarks = async () => {
        const { data } = await supabase
            .from("bookmarks")
            .select("*")
            .order("created_at", { ascending: false });

        setBookmarks(data || []);
    };

    useEffect(() => {
        fetchBookmarks();
    }, []);

   
    const addBookmark = async () => {
        if (!title || !url || !user) return;

        await supabase.from("bookmarks").insert({
            title,
            url,
            user_id: user.id,
        });

        setTitle("");
        setUrl("");
    };

   
    const deleteBookmark = async (id) => {
        await supabase.from("bookmarks").delete().eq("id", id);
    };

   
    useEffect(() => {
        if (!user) return;

        const channel = supabase
            .channel("bookmarks-realtime")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "bookmarks",
                    filter: `user_id=eq.${user.id}`,
                },
                (payload) => {
                    const { eventType, new: newRow, old: oldRow } = payload;

                    if (eventType === "INSERT") {
                        setBookmarks((prev) => [newRow, ...prev]);
                    }

                    if (eventType === "DELETE") {
                        setBookmarks((prev) =>
                            prev.filter((b) => b.id !== oldRow.id)
                        );
                    }

                    if (eventType === "UPDATE") {
                        setBookmarks((prev) =>
                            prev.map((b) =>
                                b.id === newRow.id ? newRow : b
                            )
                        );
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

   
    return (
        <div className="p-10 max-w-xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">Bookmarks</h1>

           
            <div className="space-y-2">
                <input
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="border p-2 w-full rounded"
                />

                <input
                    placeholder="URL"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="border p-2 w-full rounded"
                />

                <button
                    onClick={addBookmark}
                    className="bg-black text-white px-4 py-2 rounded"
                >
                    Add Bookmark
                </button>
            </div>

        
            <div className="space-y-3">
                {bookmarks.map((b) => (
                    <div
                        key={b.id}
                        className="border p-3 rounded flex justify-between items-center"
                    >
                        <div>
                            <p className="font-semibold">{b.title}</p>
                            <a
                                href={b.url}
                                target="_blank"
                                className="text-blue-600 text-sm"
                            >
                                {b.url}
                            </a>
                        </div>

                        <button
                            onClick={() => deleteBookmark(b.id)}
                            className="text-red-500"
                        >
                            Delete
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
