import { Flame, MessageCircle, User, type LucideIcon } from "lucide-react";

export interface NavItem { href: string; label: string; icon: LucideIcon }

export const NAV_ITEMS: NavItem[] = [
  { href: "/discover", label: "Discover", icon: Flame },
  { href: "/matches", label: "Matches", icon: MessageCircle },
  { href: "/profile", label: "Profile", icon: User },
];
