#!/usr/bin/env node
/**
 * Generate VAPID keys for Web Push API
 * These keys are required for sending push notifications
 * 
 * Run: npm run generate-vapid
 */

import webpush from "web-push";

console.log("🔐 Generating VAPID keys for Web Push API...\n");

const vapidKeys = webpush.generateVAPIDKeys();

console.log("Add the following environment variables to your .env file:\n");
console.log(`VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}\n`);

console.log("⚠️  IMPORTANT:");
console.log("  - Keep VAPID_PRIVATE_KEY secure and never share it");
console.log("  - VAPID_PUBLIC_KEY is shared with clients for subscription");
console.log("  - If you regenerate these keys, existing subscriptions will be invalid\n");
