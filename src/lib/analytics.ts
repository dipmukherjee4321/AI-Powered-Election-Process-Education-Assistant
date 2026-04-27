import { logEvent } from "firebase/analytics";
import { analytics } from "./firebase";

/**
 * Utility to track custom events in Firebase Analytics
 */
export async function trackEvent(eventName: string, eventParams?: any) {
  try {
    const instance = await analytics;
    if (instance) {
      logEvent(instance, eventName, eventParams);
      console.log(`[Analytics] Tracked: ${eventName}`, eventParams);
    }
  } catch (error) {
    console.error("[Analytics] Error tracking event:", error);
  }
}

/**
 * Standard events for ElectAI
 */
export const AnalyticsEvents = {
  CHAT_MESSAGE_SENT: "chat_message_sent",
  QUIZ_STARTED: "quiz_started",
  QUIZ_COMPLETED: "quiz_completed",
  VOTE_SIMULATED: "vote_simulated",
  LEARNING_MODULE_VIEWED: "learning_module_viewed",
  AUTH_SUCCESS: "auth_success",
};
