/**
 * Storage Service
 * Handles all Firestore read/write operations with structured schema mapping.
 */

import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, setDoc } from "firebase/firestore";

export const storageService = {
  /**
   * Saves a chat interaction to the user's personal history
   */
  async saveChatSession(userId: string, userMessage: string, aiResponse: string, mode: string) {
    const chatRef = collection(db, "users", userId, "chat_history");
    return addDoc(chatRef, {
      userMessage,
      aiResponse,
      mode,
      timestamp: serverTimestamp(),
    });
  },

  /**
   * Saves a quiz result with performance metrics
   */
  async saveQuizResult(userId: string, result: {
    score: number;
    total: number;
    difficulty: string;
    accuracy: number;
  }) {
    const resultsRef = collection(db, "users", userId, "quiz_results");
    return addDoc(resultsRef, {
      ...result,
      timestamp: serverTimestamp(),
    });
  },

  /**
   * Updates or creates a user profile
   */
  async syncUserProfile(userId: string, profile: any) {
    const userRef = doc(db, "users", userId);
    return setDoc(userRef, {
      ...profile,
      lastActive: serverTimestamp(),
    }, { merge: true });
  }
};
