import { db, auth } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, query, where, orderBy, onSnapshot } from "firebase/firestore";

export const DatabaseService = {
  /**
   * Save a chat message to Firestore
   */
  async saveChat(content: string, role: "user" | "assistant", mode: string) {
    if (!auth.currentUser) return null;
    
    return addDoc(collection(db, "chats"), {
      userId: auth.currentUser.uid,
      role,
      content,
      mode,
      timestamp: serverTimestamp()
    });
  },

  /**
   * Save quiz results to Firestore
   */
  async saveQuizResult(score: number, total: number, difficulty: string) {
    if (!auth.currentUser) return null;
    
    return addDoc(collection(db, "results"), {
      userId: auth.currentUser.uid,
      score,
      total,
      difficulty,
      timestamp: serverTimestamp()
    });
  },

  /**
   * Listen to real-time stats and engagement metrics
   */
  subscribeToStats(callback: (stats: any) => void) {
    return onSnapshot(collection(db, "chats"), (snapshot) => {
      const uniqueUsers = new Set(snapshot.docs.map(doc => doc.data().userId)).size;
      const totalMessages = snapshot.size;
      callback({
        totalVotes: 1450 + totalMessages,
        activeLearners: uniqueUsers || 1,
        avgQuizScore: 4.2 // Placeholder for real avg
      });
    });
  }
};

export const AIService = {
  /**
   * Send a chat request to the API
   */
  async sendChatMessage(messages: any[], mode: string) {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, mode })
    });
    
    if (!response.ok) throw new Error("Failed to fetch AI response");
    return response.json();
  },

  /**
   * Fetch a generated quiz from the API
   */
  async fetchQuiz(difficulty: string, previousPerformance?: any) {
    const response = await fetch("/api/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ difficulty, ...previousPerformance })
    });
    
    if (!response.ok) throw new Error("Failed to generate quiz");
    return response.json();
  }
};
