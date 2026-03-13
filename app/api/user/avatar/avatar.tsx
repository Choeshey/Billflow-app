"use client";

import { useRef, useState } from "react";
import { Camera } from "lucide-react";

interface AvatarProps {
    name:       string;
    imageUrl?:  string | null;
    size?:      "sm" | "md" | "lg" | "xl";
    editable?:  boolean;
    onUpload?:  (url: string) => void;
}

const SIZES = {
    sm: { container: "w-8 h-8",   text: "text-xs",  icon: "w-3 h-3" },
    md: { container: "w-10 h-10", text: "text-sm",  icon: "w-3.5 h-3.5" },
    lg: { container: "w-16 h-16", text: "text-xl",  icon: "w-4 h-4" },
    xl: { container: "w-24 h-24", text: "text-3xl", icon: "w-5 h-5" },
};

function getColor(name: string): string {
    const colors = [
        "bg-violet-500", "bg-blue-500", "bg-emerald-500",
        "bg-amber-500",  "bg-rose-500", "bg-indigo-500",
        "bg-teal-500",   "bg-orange-500",
    ];
    return colors[name.charCodeAt(0) % colors.length];
}

function getInitials(name: string): string {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

export function Avatar({ name, imageUrl, size = "md", editable = false, onUpload }: AvatarProps) {
    const [uploading, setUploading] = useState(false);
    const [preview,   setPreview]   = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const { container, text, icon } = SIZES[size];
    const color    = getColor(name);
    const initials = getInitials(name);
    const src      = preview ?? imageUrl;

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = ev => setPreview(ev.target?.result as string);
        reader.readAsDataURL(file);

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const res  = await fetch("/api/user/avatar", { method: "POST", body: formData });
            const json = await res.json();
            if (json.success && json.data?.url) {
                onUpload?.(json.data.url);
            } else {
                setPreview(null);
                alert(json.error ?? "Upload failed.");
            }
        } catch {
            setPreview(null);
            alert("Upload failed. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="relative inline-flex shrink-0">
            <div className={`${container} rounded-full overflow-hidden flex items-center justify-center ${src ? "" : color}`}>
                {src
                    ? <img src={src} alt={name} className="w-full h-full object-cover" />
                    : <span className={`${text} font-bold text-white select-none`}>{initials}</span>
                }
            </div>
            {editable && (
                <>
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        disabled={uploading}
                        className="absolute inset-0 rounded-full bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                        {uploading
                            ? <div className={`${icon} border-2 border-white border-t-transparent rounded-full animate-spin`} />
                            : <Camera className={`${icon} text-white`} />
                        }
                    </button>
                    <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileChange} />
                </>
            )}
        </div>
    );
}