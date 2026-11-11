export type Account = { id: string; category: string; name: string; url: string; username: string; secret: string; kind: 'password' | 'api_key'; public: boolean; memo: string; updated_at: string };
export type AccessCode = { id: string; label: string; scope: 'public' | 'all'; expires_at: string; last_used_at: string | null; uses: number; created_at: string };
export type Identity = { role: 'admin' | 'viewer'; scope: 'public' | 'all'; label: string; must_change?: boolean };
