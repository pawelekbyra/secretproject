
export interface AuthorProfile {
    id: string;
    username: string;
    avatarUrl: string;
    bio: string;
    role?: string;
    slides: { id: string; thumbnailUrl: string; title: string; }[];
}
