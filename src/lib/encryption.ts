/**
 * Simple client-side encryption utility using Web Crypto API.
 * In a real E2E environment, keys would be managed via user passwords
 * and stored separately from the encrypted data.
 */

export async function encryptData(text: string, secretKey: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  
  // For demo: hashing the secretKey to get a valid length
  const keyBuffer = encoder.encode(secretKey.padEnd(32, '0')).slice(0, 32);
  const cryptoKey = await window.crypto.subtle.importKey(
    'raw', 
    keyBuffer, 
    { name: 'AES-GCM' }, 
    false, 
    ['encrypt']
  );
  
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    data
  );
  
  return {
    encrypted: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
    iv: btoa(String.fromCharCode(...iv))
  };
}

export async function decryptData(encryptedB64: string, ivB64: string, secretKey: string) {
  const encoder = new TextEncoder();
  const encrypted = new Uint8Array(atob(encryptedB64).split('').map(c => c.charCodeAt(0)));
  const iv = new Uint8Array(atob(ivB64).split('').map(c => c.charCodeAt(0)));
  
  const keyBuffer = encoder.encode(secretKey.padEnd(32, '0')).slice(0, 32);
  const cryptoKey = await window.crypto.subtle.importKey(
    'raw', 
    keyBuffer, 
    { name: 'AES-GCM' }, 
    false, 
    ['decrypt']
  );
  
  const decrypted = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    encrypted
  );
  
  return new TextDecoder().decode(decrypted);
}
