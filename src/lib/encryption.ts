const ENCRYPTION_KEY = "cloak_secret_key_2024";

function xorEncrypt(text: string): string {
  let result = "";
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length));
  }
  return btoa(result);
}

function xorDecrypt(encrypted: string): string {
  try {
    const decoded = atob(encrypted);
    let result = "";
    for (let i = 0; i < decoded.length; i++) {
      result += String.fromCharCode(decoded.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length));
    }
    return result;
  } catch {
    return "";
  }
}

export function encryptData(data: string): string {
  return xorEncrypt(data);
}

export function decryptData(encrypted: string): string {
  return xorDecrypt(encrypted);
}

export function encryptUrl(url: string): string {
  return encodeURIComponent(encryptData(url));
}

export function decryptUrl(encryptedUrl: string): string {
  try {
    return decryptData(decodeURIComponent(encryptedUrl));
  } catch {
    return "";
  }
}
