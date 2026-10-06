"use client";
import { useSyncExternalStore } from "react";
export const DEMO_KEY = "shiftledger-demo-v1";
export const MAX_EVENTS = 200;
export type ClockAction = "Clock in" | "Start break" | "End break" | "Clock out";
export type ClockState = "Out" | "Working" | "Break";
type Demo = { version: 1; decision: "Pending" | "Approved" | "Rejected"; reason: string; events: { action: ClockAction; timestamp: string }[]; clock: ClockState };
const seed = (): Demo => ({ version: 1, decision: "Pending", reason: "", events: [], clock: "Out" });
const serverSnapshot = { ready: false, data: seed(), message: "" };
let snapshot = serverSnapshot;
const listeners = new Set<() => void>();
function transition(state: ClockState, action: ClockAction): ClockState | null {
  if (state === "Out" && action === "Clock in") return "Working";
  if (state === "Working" && action === "Start break") return "Break";
  if (state === "Break" && action === "End break") return "Working";
  if (state === "Working" && action === "Clock out") return "Out";
  return null;
}
function parse(raw: string | null): Demo {
  if (raw === null) return seed();
  if (raw.length > 64000) throw new Error("Oversized demo");
  const value = JSON.parse(raw);
  if (value?.version !== 1 || !["Pending", "Approved", "Rejected"].includes(value.decision) || typeof value.reason !== "string" || value.reason.length > 500 || !Array.isArray(value.events) || value.events.length > MAX_EVENTS || (value.decision !== "Pending" && !value.reason.trim())) throw new Error("Invalid demo");
  let clock: ClockState = "Out";
  const events: Demo["events"] = [];
  for (const event of value.events) {
    if (typeof event?.timestamp !== "string" || event.timestamp.length > 30 || !Number.isFinite(Date.parse(event.timestamp))) throw new Error("Invalid timestamp");
    const next = transition(clock, event.action);
    if (next === null) throw new Error("Invalid clock sequence");
    clock = next; events.push({ action: event.action, timestamp: event.timestamp });
  }
  if (value.clock !== clock) throw new Error("Invalid clock state");
  return { version: 1, decision: value.decision, reason: value.reason, events, clock };
}
function emit() { listeners.forEach(listener => listener()); }
function load() {
  try {
    const raw = localStorage.getItem(DEMO_KEY);
    try { snapshot = { ready: true, data: parse(raw), message: "" }; }
    catch { snapshot = { ready: true, data: seed(), message: "Saved demo data could not be read. A fresh sample has been loaded; reset the demo to replace the saved copy." }; }
  } catch { snapshot = { ready: true, data: seed(), message: "Browser storage is unavailable. Changes will last only for this visit." }; }
  emit();
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!snapshot.ready) load();
  const sync = (event: StorageEvent) => { if (event.key === DEMO_KEY || event.key === null) load(); };
  window.addEventListener("storage", sync);
  return () => { listeners.delete(listener); window.removeEventListener("storage", sync); };
}
function save(data: Demo) {
  let message = "";
  try { localStorage.setItem(DEMO_KEY, JSON.stringify(data)); }
  catch { message = "Changes work for this visit, but could not be saved. Browser storage may be full or disabled."; }
  snapshot = { ready: true, data, message }; emit();
}
export function useDemoStore() {
  const current = useSyncExternalStore(subscribe, () => snapshot, () => serverSnapshot);
  return {
    ...current,
    setReason(reason: string) { if (snapshot.ready && snapshot.data.decision === "Pending") save({ ...snapshot.data, reason: reason.slice(0, 500) }); },
    review(approve: boolean) { if (snapshot.ready && snapshot.data.decision === "Pending" && snapshot.data.reason.trim()) save({ ...snapshot.data, decision: approve ? "Approved" : "Rejected" }); },
    clockAction(action: ClockAction) {
      if (!snapshot.ready || snapshot.data.events.length >= MAX_EVENTS) return;
      const clock = transition(snapshot.data.clock, action); if (clock === null) return;
      save({ ...snapshot.data, clock, events: [...snapshot.data.events, { action, timestamp: new Date().toISOString() }] });
    },
    reset() { save(seed()); },
  };
}
