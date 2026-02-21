import { redis } from "./redis";

export type Profile = {
  userId: string;
  slug: string;
  message: string;
  avatarUrl: string;
};

const profileKey = (userId: string) => `profile:${userId}`;
const slugKey = (slug: string) => `slug:${slug}`;

export async function getProfile(userId: string) {
  return await redis.get<Profile>(profileKey(userId));
}

export async function getUserIdBySlug(slug: string) {
  return await redis.get<string>(slugKey(slug));
}

export async function saveProfile(profile: Profile) {
  // proveri da li je slug zauzet
  const taken = await getUserIdBySlug(profile.slug);

  if (taken && taken !== profile.userId) {
    return { ok: false, error: "Slug je zauzet" };
  }

  await redis.set(profileKey(profile.userId), profile);
  await redis.set(slugKey(profile.slug), profile.userId);

  return { ok: true };
}
