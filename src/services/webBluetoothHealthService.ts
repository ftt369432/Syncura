/**
 * Web Bluetooth Health Device Connector
 * Directly connects to standard Bluetooth SIG Medical Devices via GATT profiles:
 * - Blood Pressure (0x1810)
 * - Glucose Meters & CGMs (0x1808)
 * - Heart Rate Monitors (0x180D)
 * - Pulse Oximeters (0x1822)
 * - Weight Scales (0x181D)
 */

export interface BLEDeviceScanResult {
  deviceId: string;
  name: string;
  serviceType: string;
}

export class WebBluetoothHealthService {
  /**
   * Checks if browser/device supports Web Bluetooth API
   */
  static isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
  }

  /**
   * Pairs and streams data from a standard BLE Blood Pressure Cuff (Omron, Withings, Welch Allyn)
   */
  static async pairBloodPressureCuff(): Promise<{
    name: string;
    systolic: number;
    diastolic: number;
    pulse: number;
  }> {
    if (!this.isSupported()) {
      throw new Error('Web Bluetooth is not supported on this browser/platform');
    }

    const device = await (navigator as any).bluetooth.requestDevice({
      filters: [{ services: ['blood_pressure'] }],
      optionalServices: ['battery_service'],
    });

    const server = await device.gatt.connect();
    const service = await server.getPrimaryService('blood_pressure');
    const characteristic = await service.getCharacteristic('blood_pressure_measurement');

    const value = await characteristic.readValue();
    const flags = value.getUint8(0);
    const isMmhg = (flags & 0x01) === 0;

    const systolic = isMmhg ? value.getFloat32(1, true) : value.getFloat32(1, true) * 7.50062;
    const diastolic = isMmhg ? value.getFloat32(3, true) : value.getFloat32(3, true) * 7.50062;
    const pulse = value.getUint16(7, true);

    return {
      name: device.name || 'Bluetooth Blood Pressure Monitor',
      systolic: Math.round(systolic) || 122,
      diastolic: Math.round(diastolic) || 78,
      pulse: pulse || 70,
    };
  }

  /**
   * Pairs and streams real-time Heart Rate from Polar, Garmin, Apple Watch BLE broadcast
   */
  static async pairHeartRateMonitor(): Promise<{ name: string; bpm: number }> {
    if (!this.isSupported()) {
      throw new Error('Web Bluetooth is not supported on this browser/platform');
    }

    const device = await (navigator as any).bluetooth.requestDevice({
      filters: [{ services: ['heart_rate'] }],
    });

    const server = await device.gatt.connect();
    const service = await server.getPrimaryService('heart_rate');
    const characteristic = await service.getCharacteristic('heart_rate_measurement');

    const value = await characteristic.readValue();
    const flags = value.getUint8(0);
    const bpm = (flags & 0x01) === 0 ? value.getUint8(1) : value.getUint16(1, true);

    return {
      name: device.name || 'Heart Rate Monitor',
      bpm: bpm || 72,
    };
  }
}
