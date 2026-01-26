// Mock Redis for local development without Upstash
class MockRedis {
  private store = new Map<string, number>();

  constructor() {
      console.log("Using MockRedis");
  }

  pipeline() {
    const ops: (() => any)[] = [];
    const self = this;

    return {
      incr(key: string) {
        ops.push(() => {
          const current = self.store.get(key) || 0;
          const next = current + 1;
          self.store.set(key, next);
          return next;
        });
        return this;
      },
      expire(key: string, seconds: number) {
        ops.push(() => {
            // clear after timeout
            setTimeout(() => {
                self.store.delete(key);
            }, seconds * 1000);
            return 1; // 1 means set successfully
        });
        return this;
      },
      async exec() {
        return ops.map(op => op());
      }
    };
  }
}

export const redis = new MockRedis() as any;
