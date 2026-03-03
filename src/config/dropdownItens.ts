import { BadgeCheck, Bell, Settings, LogOut } from "lucide-react";

export const dropdownItems = [
  {
    id: "account",
    navigation: "/account",
    text: "Conta",
    icon: BadgeCheck,
  },
  {
    id: "settings",
    navigation: "/settings",
    text: "Configurações",
    icon: Settings,
  },
  {
    id: "notifications",
    navigation: "/notifications",
    text: "Notificações",
    icon: Bell,
  },
  {
    id: "logout",
    navigation: "/auth/sign-in",
    text: "Sair",
    icon: LogOut,
    isLogout: true,
  },
];
