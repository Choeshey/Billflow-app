// Find this in lib/types.ts
export interface User {
    id:        string;
    name:      string;
    email:     string;
    role:      UserRole;
    createdAt: string;
}

// ✅ Add avatarUrl
export interface User {
    id:         string;
    name:       string;
    email:      string;
    role:       UserRole;
    avatarUrl?: string | null; // 👈 add this line
    createdAt:  string;
}