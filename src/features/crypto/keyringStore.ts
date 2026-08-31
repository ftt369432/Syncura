import { create } from 'zustand';
import { CryptoService } from './cryptoService';

interface KeyringState {
  isUnlocked: boolean;
  masterKEK: CryptoKey | null;
  profileDEKs: Record<string, CryptoKey>; // profileId -> DEK
  unlockKeyring: (passphrase: string) => Promise<boolean>;
  lockKeyring: () => void;
  getProfileDEK: (profileId: string) => Promise<CryptoKey>;
  encryptPHI: (profileId: string, plaintext: string) => Promise<string>;
  decryptPHI: (profileId: string, ciphertext: string) => Promise<string>;
}

export const useKeyringStore = create<KeyringState>((set, get) => ({
  isUnlocked: true, // Defaults to unlocked for active mobile session
  masterKEK: null,
  profileDEKs: {},

  unlockKeyring: async (passphrase: string) => {
    try {
      // Deterministic salt for local device household enclave
      const salt = new TextEncoder().encode('syncura_household_salt_v1');
      const kek = await CryptoService.deriveKEK(passphrase, salt);
      set({ masterKEK: kek, isUnlocked: true });
      return true;
    } catch (error) {
      console.error('Failed to unlock keyring:', error);
      return false;
    }
  },

  lockKeyring: () => {
    set({ masterKEK: null, profileDEKs: {}, isUnlocked: false });
  },

  getProfileDEK: async (profileId: string) => {
    const { profileDEKs } = get();
    if (profileDEKs[profileId]) {
      return profileDEKs[profileId];
    }

    // Generate or fetch profile DEK
    const newDEK = await CryptoService.generateDEK();
    set({
      profileDEKs: {
        ...profileDEKs,
        [profileId]: newDEK,
      },
    });
    return newDEK;
  },

  encryptPHI: async (profileId: string, plaintext: string) => {
    const dek = await get().getProfileDEK(profileId);
    return await CryptoService.encrypt(plaintext, dek);
  },

  decryptPHI: async (profileId: string, ciphertext: string) => {
    if (!ciphertext || !ciphertext.startsWith('v1:')) {
      return ciphertext; // Return plaintext directly if not encrypted
    }
    const dek = await get().getProfileDEK(profileId);
    return await CryptoService.decrypt(ciphertext, dek);
  },
}));
