import { siteConfig } from "@/config/site";
import MaskedGridBackground from "../component-x/masked-grid-background";

const LoadingFallback = () => {
  return (
    <div className="h-screen w-full overflow-hidden flex flex-col items-center justify-center relative px-4 bg-background dark">
      <MaskedGridBackground />

      <div className="relative z-10 flex flex-col items-center gap-6 animate-in fade-in duration-200">
        <div className="flex flex-col items-center gap-3 text-center">
          <h1 className="text-4xl md:text-6xl tracking-tight font-semibold text-foreground/90 text-balance">
            {siteConfig.name}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground/60 max-w-150 text-pretty">
            {siteConfig.description}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-foreground/20 animate-pulse" />
          <div className="h-1.5 w-1.5 rounded-full bg-foreground/40 animate-pulse delay-75" />
          <div className="h-1.5 w-1.5 rounded-full bg-foreground/60 animate-pulse delay-150" />
        </div>
      </div>

      <div className="absolute bottom-8 left-0 right-0 flex justify-center z-10">
        <div className="text-xs font-mono text-muted-foreground/30 tracking-widest uppercase">
          Initializing Environment
        </div>
      </div>
    </div>
  );
};

export default LoadingFallback;
