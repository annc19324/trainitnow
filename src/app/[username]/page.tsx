import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { User } from "lucide-react";

export default async function UserProfilePage(props: { params: Promise<{ username: string }> }) {
  const params = await props.params;
  const usernameOrName = decodeURIComponent(params.username);
  
  // Try to find by username first, then by name if needed
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { username: usernameOrName },
        { name: usernameOrName }
      ]
    }
  });

  if (!user) notFound();

  return (
    <div className="animate-fade-in" style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem 0" }}>
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem', textAlign: 'center' }}>
        <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: 'white' }}>
          <User size={48} />
        </div>
        <h1 className="gradient-text" style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>{user.name}</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1.125rem", marginBottom: "0.5rem" }}>
          @{user.username || user.name?.toLowerCase().replace(/\s+/g, '')}
        </p>
        <span style={{ 
          padding: "0.25rem 1rem", 
          borderRadius: "999px", 
          fontSize: "0.8rem", 
          fontWeight: "600",
          background: user.role === "ADMIN" ? "var(--warning)" : "var(--success)",
          color: "white",
          marginTop: "1rem"
        }}>
          {user.role}
        </span>
      </div>
    </div>
  );
}
