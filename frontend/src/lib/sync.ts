/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { api } from "./api";

// Save a custom registered user
export function saveLocalUser(user: any, passwordPlain: string) {
  try {
    const customAccounts = JSON.parse(localStorage.getItem("cl_custom_accounts") || "[]");
    const exists = customAccounts.some((acc: any) => acc.email.toLowerCase() === user.email.toLowerCase());
    if (!exists) {
      customAccounts.push({
        ...user,
        passwordPlain
      });
      localStorage.setItem("cl_custom_accounts", JSON.stringify(customAccounts));
    }
  } catch (e) {
    console.error("Failed to save local user", e);
  }
}

// Retrieve custom registered users
export function getLocalUsers() {
  try {
    return JSON.parse(localStorage.getItem("cl_custom_accounts") || "[]");
  } catch {
    return [];
  }
}

// Save custom requests
export function saveLocalRequest(request: any) {
  try {
    const customRequests = JSON.parse(localStorage.getItem("cl_custom_requests") || "[]");
    const filtered = customRequests.filter((r: any) => r.id !== request.id);
    filtered.push(request);
    localStorage.setItem("cl_custom_requests", JSON.stringify(filtered));
  } catch (e) {
    console.error("Failed to save local request", e);
  }
}

// Save list of requests
export function saveLocalRequests(requests: any[]) {
  try {
    const customRequests = JSON.parse(localStorage.getItem("cl_custom_requests") || "[]");
    // Merge
    const merged = [...customRequests];
    requests.forEach(req => {
      const idx = merged.findIndex((r: any) => r.id === req.id);
      if (idx !== -1) {
        merged[idx] = { ...merged[idx], ...req };
      } else {
        merged.push(req);
      }
    });
    localStorage.setItem("cl_custom_requests", JSON.stringify(merged));
  } catch (e) {
    console.error("Failed to save local requests", e);
  }
}

// Retrieve custom requests
export function getLocalRequests() {
  try {
    return JSON.parse(localStorage.getItem("cl_custom_requests") || "[]");
  } catch {
    return [];
  }
}

// Save notifications
export function saveLocalNotification(notif: any) {
  try {
    const customNotifs = JSON.parse(localStorage.getItem("cl_custom_notifications") || "[]");
    const filtered = customNotifs.filter((n: any) => n.id !== notif.id);
    filtered.push(notif);
    localStorage.setItem("cl_custom_notifications", JSON.stringify(filtered));
  } catch (e) {
    console.error("Failed to save local notification", e);
  }
}

// Keep track of multiple notifications
export function saveLocalNotifications(notifs: any[]) {
  try {
    const customNotifs = JSON.parse(localStorage.getItem("cl_custom_notifications") || "[]");
    const merged = [...customNotifs];
    notifs.forEach(notification => {
      const idx = merged.findIndex((n: any) => n.id === notification.id);
      if (idx !== -1) {
        merged[idx] = { ...merged[idx], ...notification };
      } else {
        merged.push(notification);
      }
    });
    localStorage.setItem("cl_custom_notifications", JSON.stringify(merged));
  } catch (e) {
    console.error("Failed to save local notifications", e);
  }
}

export function getLocalNotifications() {
  try {
    return JSON.parse(localStorage.getItem("cl_custom_notifications") || "[]");
  } catch {
    return [];
  }
}

// Synchronize all offline client-side state to the backend
let isSyncing = false;
export async function syncLocalStorageWithServer() {
  if (isSyncing) return;
  isSyncing = true;
  
  try {
    const users = getLocalUsers();
    const requests = getLocalRequests();
    const notifications = getLocalNotifications();
    
    if (users.length === 0 && requests.length === 0 && notifications.length === 0) {
      isSyncing = false;
      return;
    }
    
    // Call server to safely merge entries that might have been lost in container reload
    await api.post("/auth/sync", {
      users,
      requests,
      notifications
    });
  } catch (err) {
    console.warn("Database reload sync executed:", err);
  } finally {
    isSyncing = false;
  }
}
