/**
 * Generates a download link for a specific quality from an encrypted media URL
 * @param {string} encryptedMediaUrl - Base64 encoded encrypted media URL
 * @param {string} quality - Desired quality (12kbps, 48kbps, 96kbps, 160kbps, 320kbps)
 * @returns {string} Direct URL for the requested quality
 */
function getMediaLink(encryptedMediaUrl, quality) {
  if (!encryptedMediaUrl) {
    throw new Error("No encrypted URL provided");
  }
  
  // Define quality mapping
  const qualityMap = {
    '12kbps': '_12',
    '48kbps': '_48',
    '96kbps': '_96',
    '160kbps': '_160',
    '320kbps': '_320'
  };
  
  // Make sure requested quality exists
  if (!qualityMap[quality]) {
    throw new Error("Invalid quality. Use: 12kbps, 48kbps, 96kbps, 160kbps, or 320kbps");
  }
  
  try {
    // Encryption key
    const key = '38346591';
    
    // Decode base64
    const encrypted = CryptoJS.enc.Base64.parse(encryptedMediaUrl);
    
    // Create key WordArray
    const keyHex = CryptoJS.enc.Utf8.parse(key);
    
    // Decrypt using DES in ECB mode
    const decrypted = CryptoJS.DES.decrypt(
      { ciphertext: encrypted },
      keyHex,
      { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 }
    );
    
    // Convert to string
    const decryptedLink = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!decryptedLink) {
      throw new Error("Decryption failed");
    }
    
    // Replace the quality identifier
    return decryptedLink.replace('_96', qualityMap[quality]);
  } catch (error) {
    console.error("Error generating media link:", error);
    throw error;
  }
}