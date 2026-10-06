import React from "react";

export const BackgroundGradients: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[720px] h-[400px] bg-gradient-to-b from-sky-500/10 via-cyan-400/5 to-transparent blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[400px] bg-blue-600/5 blur-[140px]" />
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:32px_32px] opacity-25" />
    </div>
  );
};
