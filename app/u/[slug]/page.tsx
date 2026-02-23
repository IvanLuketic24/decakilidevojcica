import { getProfileBySlug } from "@/lib/profile";
import { notFound } from "next/navigation";

export default async function PublicPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;

  const profile = await getProfileBySlug(slug);
  if (!profile) return notFound();

  return (
    <div style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>{profile.slug}</h1>

      {profile.avatarUrl ? (
        <img
          src={profile.avatarUrl}
          alt="avatar"
          style={{
            width: 120,
            height: 120,
            borderRadius: "50%",
            objectFit: "cover",
            marginTop: 16,
          }}
        />
      ) : null}

      {profile.message ? (
        <p style={{ marginTop: 16, fontSize: 18 }}>{profile.message}</p>
      ) : (
        <p style={{ marginTop: 16, opacity: 0.7 }}>Nema poruke još.</p>
      )}
    </div>
  );
}