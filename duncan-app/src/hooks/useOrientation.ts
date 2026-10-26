//src/hooks/useOrientation.ts

import { useEffect, useState } from "react";

export function useOrientation() {
  const [isLandscape, setIsLandscape] = useState<boolean>(() => {
    return window.innerWidth > window.innerHeight;
  });

  useEffect(() => {
    const update = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };

    update();

    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);

    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  return {
    isLandscape,
    isPortrait: !isLandscape,
  };
}
