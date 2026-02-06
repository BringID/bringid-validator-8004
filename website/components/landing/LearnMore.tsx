"use client";

const links = [
  {
    author: "@a16zcrypto",
    text: "AI needs blockchains \u2014 the internet has no native way to separate humans from machines",
    href: "https://x.com/a16zcrypto/status/2019119378537832763",
  },
  {
    author: "@galnagli",
    text: "Agent networks are vulnerable to sybil attacks \u2014 we need proof there\u2019s a human behind each agent",
    href: "https://x.com/galnagli/status/2017585025475092585",
  },
];

export function LearnMore() {
  return (
    <div className="learn-more">
      {links.map((link) => (
        <a
          key={link.author}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="learn-link"
        >
          <span className="learn-author">{link.author}</span>
          <span className="learn-text">{link.text}</span>
          <span className="learn-arrow">&#x2197;</span>
        </a>
      ))}
    </div>
  );
}
