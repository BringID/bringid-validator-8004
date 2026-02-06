"use client";

const links = [
  { label: "BringID", href: "https://bringid.org" },
  { label: "EIP-8004", href: "https://eips.ethereum.org/EIPS/eip-8004" },
  { label: "GitHub", href: "https://github.com/BringID/bringid-validator-8004" },
  { label: "X", href: "https://x.com/bring_id" },
  { label: "Telegram", href: "https://t.me/bringid_chat" },
];

export function Footer() {
  return (
    <footer className="landing-footer">
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
        >
          {link.label}
        </a>
      ))}
    </footer>
  );
}
