// Demo data lets you click through the whole dashboard before the Spring
// Boot backend is even running — useful for showing your mentor the UI
// today, independent of backend setup progress.

export const demoWards = [
  { id: 1, name: 'General Ward A', floorNumber: 2 },
  { id: 2, name: 'ICU', floorNumber: 3 },
];

export const demoUser = {
  fullName: 'Priya Sharma',
  role: 'NURSE',
  wardId: 1,
};

let demoAlertIdCounter = 100;

export function makeDemoBeds() {
  return [
    {
      deviceCode: 'ESP32-A101',
      bedNumber: 'A-101',
      wardName: 'General Ward A',
      currentVolumeMl: 340,
      flowRateMlPerHr: 62,
      estimatedMinutesRemaining: 329,
      status: 'ACTIVE',
      openAlertCount: 0,
    },
    {
      deviceCode: 'ESP32-A102',
      bedNumber: 'A-102',
      wardName: 'General Ward A',
      currentVolumeMl: 38,
      flowRateMlPerHr: 58,
      estimatedMinutesRemaining: 39,
      status: 'ACTIVE',
      openAlertCount: 1,
    },
    {
      deviceCode: 'ESP32-A103',
      bedNumber: 'A-103',
      wardName: 'General Ward A',
      currentVolumeMl: 210,
      flowRateMlPerHr: 4,
      estimatedMinutesRemaining: null,
      status: 'ACTIVE',
      openAlertCount: 1,
    },
    {
      deviceCode: 'ESP32-A104',
      bedNumber: 'A-104',
      wardName: 'General Ward A',
      currentVolumeMl: 455,
      flowRateMlPerHr: 60,
      estimatedMinutesRemaining: 455,
      status: 'ACTIVE',
      openAlertCount: 0,
    },
  ];
}

export function makeDemoAlerts() {
  return [
    {
      id: demoAlertIdCounter++,
      deviceCode: 'ESP32-A102',
      bedNumber: 'A-102',
      wardName: 'General Ward A',
      alertType: 'LOW_FLUID',
      severity: 'CRITICAL',
      status: 'OPEN',
      message: 'Only ~38 mL remaining on ESP32-A102 — below safe threshold.',
      createdAt: new Date(Date.now() - 3 * 60000).toISOString(),
      acknowledgedByName: null,
    },
    {
      id: demoAlertIdCounter++,
      deviceCode: 'ESP32-A103',
      bedNumber: 'A-103',
      wardName: 'General Ward A',
      alertType: 'OCCLUSION_SUSPECTED',
      severity: 'CRITICAL',
      status: 'OPEN',
      message: 'Flow rate dropped to ~0 mL/hr while bag weight is stable on ESP32-A103 — possible line occlusion/kink.',
      createdAt: new Date(Date.now() - 8 * 60000).toISOString(),
      acknowledgedByName: null,
    },
    {
      id: demoAlertIdCounter++,
      deviceCode: 'ESP32-A101',
      bedNumber: 'A-101',
      wardName: 'General Ward A',
      alertType: 'PREDICTED_EMPTY',
      severity: 'WARNING',
      status: 'RESOLVED',
      message: 'ESP32-A101 projected to run empty in ~9 minutes at current rate.',
      createdAt: new Date(Date.now() - 55 * 60000).toISOString(),
      acknowledgedByName: 'Priya Sharma',
    },
  ];
}

export const demoAlertFrequency = [
  { deviceCode: 'ESP32-A102', alertCount: 6 },
  { deviceCode: 'ESP32-A103', alertCount: 4 },
  { deviceCode: 'ESP32-A101', alertCount: 2 },
  { deviceCode: 'ESP32-A104', alertCount: 0 },
];
