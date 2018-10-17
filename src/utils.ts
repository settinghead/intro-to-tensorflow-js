export function throttle<R>(f: () => R, millsecs: number): () => Promise<R> {
  let p: Promise<R> | null = null;
  let probationTill: number | null = null;

  const getRAndUpdateTimer = () => {
    const r = f();
    probationTill = now() + millsecs;
    p = null;
    return r;
  };

  return () => {
    if (probationTill === null || now() > probationTill) {
      return Promise.resolve(getRAndUpdateTimer());
    } else {
      if (!p) {
        p = new Promise(resolve => {
          setTimeout(
            () => resolve(getRAndUpdateTimer()),
            (probationTill as number) - now()
          );
        });
      }
      return p;
    }
  };
}

function now() {
  return new Date().getTime();
}
