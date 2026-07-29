export type AccountRole = "buyer" | "seller";

export type DemoSession = {
  id: string;
  role: AccountRole;
  company: string;
  contact: string;
  phone: string;
  signedInAt: string;
};

export const SESSION_KEY = "jz-cnc-demo-session-v1";

const fallbackProfile = (role: AccountRole) =>
  role === "seller"
    ? {
        id: "seller:13902607662",
        role,
        company: "东莞市杰帜数控刀具有限公司",
        contact: "杰帜卖家管理员",
        phone: "13902607662",
      }
    : {
        id: "buyer:13812345678",
        role,
        company: "精工机械制造有限公司",
        contact: "采购专员",
        phone: "13812345678",
      };

export function readDemoSession(): DemoSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as DemoSession;
    return session?.id && (session.role === "buyer" || session.role === "seller")
      ? session
      : null;
  } catch {
    return null;
  }
}

export function createDemoSession(input: {
  role: AccountRole;
  company?: string;
  phone?: string;
}): DemoSession {
  const fallback = fallbackProfile(input.role);
  const phone = input.phone?.replace(/\s/g, "") || fallback.phone;
  const company = input.company?.trim() || fallback.company;

  return {
    ...fallback,
    id: `${input.role}:${phone}`,
    company,
    phone,
    contact: input.role === "seller" ? "杰帜卖家管理员" : "采购专员",
    signedInAt: new Date().toISOString(),
  };
}

export function writeDemoSession(session: DemoSession | null) {
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  else localStorage.removeItem(SESSION_KEY);
}
