```typescript
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
// Mocking the electron object
(window as any).electron = {
  ipcRenderer: {
    sendMessage: (channel: string, ...args: any[]) => {},
    on: (channel: string, func: (...args: any[]) => void) => {
      return () => {};
    },
    once: (channel: string, func: (...args: any[]) => void) => {},
    getConfig: (key: string) => Promise.resolve(null),
    getForwardUrl: () => Promise.resolve(''),
    openExternalLink: (url: string) => Promise.resolve(),
  },
};
```
