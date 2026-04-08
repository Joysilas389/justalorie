/**
 * Simple encryption for localStorage API key storage.
 * Uses Web Crypto API with a device-derived key.
 * Not military-grade, but prevents casual snooping of the raw key.
 */

const SALT = 'justalorie-2026-salt';

// Derive a crypto key from a passphrase
async function deriveKey() {
  const encoder = new TextEncoder();
  // Use a combination of origin + user agent as a device-specific passphrase
  const passphrase = `${window.location.origin}-${navigator.userAgent.slice(0, 30)}-${SALT}`;
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: encoder.encode(SALT), iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptApiKey(plaintext) {
  try {
    const key = await deriveKey();
    const encoder = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoder.encode(plaintext)
    );
    // Combine IV + ciphertext and encode as base64
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);
    return btoa(String.fromCharCode(...combined));
  } catch {
    // Fallback: simple obfuscation if Web Crypto not available
    return btoa(plaintext.split('').reverse().join(''));
  }
}

export async function decryptApiKey(ciphertext) {
  try {
    const key = await deriveKey();
    const combined = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );
    return new TextDecoder().decode(decrypted);
  } catch {
    // Fallback: reverse the simple obfuscation
    try {
      return atob(ciphertext).split('').reverse().join('');
    } catch {
      return '';
    }
  }
}

// Helper to save encrypted key
export async function saveApiKey(apiKey) {
  if (!apiKey) {
    localStorage.removeItem('justalorie-anthropic-key');
    return;
  }
  const encrypted = await encryptApiKey(apiKey);
  localStorage.setItem('justalorie-anthropic-key', encrypted);
}

// Helper to load and decrypt key
export async function loadApiKey() {
  const stored = localStorage.getItem('justalorie-anthropic-key');
  if (!stored) return '';
  // Check if it's already a plain key (from before encryption was added)
  if (stored.startsWith('sk-')) {
    // Migrate: encrypt it
    await saveApiKey(stored);
    return stored;
  }
  return await decryptApiKey(stored);
}
