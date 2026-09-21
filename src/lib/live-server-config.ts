// Server-only: keeps the VM's address out of the browser. The Live Demo
// backend (backend/app in this repo) runs there, never on Vercel; every
// browser request goes through the app/api/live-demo/* proxy routes below,
// which are the only code that reads this.
// 8010, not 8000, matching backend/run.sh's port -- 8000 is a common default
// for unrelated local services, so 8000 as a "default" here was a real
// footgun. Override with LIVE_DEMO_VM_URL for a different backend address.
export const LIVE_DEMO_VM_URL = process.env.LIVE_DEMO_VM_URL ?? "http://127.0.0.1:8010";
