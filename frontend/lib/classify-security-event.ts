export type SecurityClassification = {
  category: "normal" | "warning" | "suspicious" | "critical";
  severity: "low" | "medium" | "high" | "critical";
  shouldAlert: boolean;
  title: string;
  description: string;
};

type SecurityEventInput = {
  deviceName: string;
  deviceType?: string | null;
  eventType: string;
  securityArmed: boolean;
};

export function classifySecurityEvent({
  deviceName,
  deviceType,
  eventType,
  securityArmed,
}: SecurityEventInput): SecurityClassification {
  const event = eventType.toLowerCase();
  const device = `${deviceName} ${deviceType ?? ""}`.toLowerCase();

  /*
   * Door/window events
   */
  if (
    securityArmed &&
    (event === "door_opened" || event === "window_opened")
  ) {
    return {
      category: "suspicious",
      severity: "high",
      shouldAlert: true,
      title: `${deviceName} Opened`,
      description:
        `${deviceName} detected an opening while the security system was armed.`,
    };
  }

  /*
   * Smoke/fire events
   */
  if (
    event.includes("smoke") ||
    event.includes("fire") ||
    event.includes("heat")
  ) {
    return {
      category: "critical",
      severity: "critical",
      shouldAlert: true,
      title: "Possible Fire Hazard Detected",
      description:
        `${deviceName} reported a possible smoke, fire, or heat-related event.`,
    };
  }

  /*
   * Camera/person detection
   */
  if (
    (event.includes("person") ||
      event.includes("visitor") ||
      event.includes("motion")) &&
    device.includes("camera")
  ) {
    if (securityArmed) {
      return {
        category: "suspicious",
        severity: "high",
        shouldAlert: true,
        title: "Person Detected",
        description:
          `${deviceName} detected activity while the security system was armed.`,
      };
    }

    return {
      category: "warning",
      severity: "medium",
      shouldAlert: false,
      title: "Person Detected",
      description:
        `${deviceName} detected activity while the security system was disarmed.`,
    };
  }

  /*
   * Device offline
   */
  if (
    event === "device_offline" ||
    event === "offline"
  ) {
    return {
      category: "warning",
      severity: "medium",
      shouldAlert: true,
      title: `${deviceName} Offline`,
      description:
        `${deviceName} is no longer reporting as online.`,
    };
  }

  /*
   * Tamper detection
   */
  if (
    event.includes("tamper") ||
    event.includes("removed") ||
    event.includes("disabled")
  ) {
    return {
      category: "critical",
      severity: "critical",
      shouldAlert: true,
      title: `Security Device Tampering Detected`,
      description:
        `${deviceName} reported a possible tampering or disabling event.`,
    };
  }

  /*
   * Unknown events are recorded but don't automatically
   * generate a security alert.
   */
  return {
    category: "normal",
    severity: "low",
    shouldAlert: false,
    title: `${deviceName} Event`,
    description:
      `${deviceName} reported a ${eventType} event.`,
  };
}
