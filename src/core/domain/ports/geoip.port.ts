export const GEOIP_PORT = Symbol('GeoIpPort');

export interface GeoIpPort {
  getCountry(indicator: string): Promise<string | undefined>;
}
