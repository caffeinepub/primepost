import { UserProfile } from '../backend';

export function getDisplayName(profile: UserProfile | null): string {
  if (!profile) return 'User';
  return profile.fullName || 'User';
}

export function getProfileInitials(profile: UserProfile | null): string {
  if (!profile || !profile.fullName) return 'U';
  const names = profile.fullName.split(' ');
  if (names.length >= 2) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  }
  return profile.fullName.substring(0, 2).toUpperCase();
}
