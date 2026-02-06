"use client";

const links = [
  { label: "BringID", href: "https://bringid.org" },
  {
    label: "EIP-8004",
    href: "https://eips.ethereum.org/EIPS/eip-8004",
  },
  { label: "GitHub", href: "https://github.com/BringID" },
  { label: "X", href: "https://x.com/bring_id" },
  { label: "Telegram", href: "https://t.me/bringid_chat" },
];

export function Footer() {
  return (
    <footer className="border-t border-surface-border px-6 py-8">
      <div className="max-w-3xl mx-auto flex flex-wrap gap-x-6 gap-y-2">
        {links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-neutral-600 hover:text-neutral-400"
          >
            {link.label}
          </a>
        ))}
      </div>
    </footer>
  );
}
