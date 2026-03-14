// Find this in lib/types.ts
export interface User {
    id:        string;
    name:      string;
    email:     string;
    role:      string;
    createdAt: string;
}

// ✅ Add avatarUrl
export interface User {
    id:         string;
    name:       string;
    email:      string;
    role:       string;
    avatarUrl?: string | null; // 👈 add this line
    createdAt:  string;
}
