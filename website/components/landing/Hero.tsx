"use client";

export function Hero() {
  return (
    <section className="text-center py-16 px-4">
      <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
        Verify Your Agent&apos;s Humanity
      </h1>
      <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-8">
        Prove you&apos;re a real human behind your EIP-8004 agent using
        BringID&apos;s privacy-preserving verification. Build trust with other
        agents and apps.
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        <a
          href="https://eips.ethereum.org/EIPS/eip-8004"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 rounded-lg border border-gray-700 hover:border-gray-500 transition-colors text-sm"
        >
          EIP-8004 Spec
        </a>
        <a
          href="https://bringid.org"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 rounded-lg border border-gray-700 hover:border-gray-500 transition-colors text-sm"
        >
          BringID Docs
        </a>
      </div>
    </section>
  );
}
