
import { ISRTableEntry } from './types';

// Tablas de ISR Mensual 2024 (Simplificadas para cálculo aproximado)
export const ISR_MONTHLY_TABLE_2024: ISRTableEntry[] = [
  { limitInferior: 0.01, cuotaFija: 0, porcentaje: 1.92 },
  { limitInferior: 746.05, cuotaFija: 14.32, porcentaje: 6.40 },
  { limitInferior: 6332.06, cuotaFija: 371.83, porcentaje: 10.88 },
  { limitInferior: 11128.02, cuotaFija: 893.63, porcentaje: 16.00 },
  { limitInferior: 12935.83, cuotaFija: 1182.88, porcentaje: 17.92 },
  { limitInferior: 15487.72, cuotaFija: 1640.18, porcentaje: 21.36 },
  { limitInferior: 31236.50, cuotaFija: 5004.12, porcentaje: 23.52 },
  { limitInferior: 49233.01, cuotaFija: 9236.89, porcentaje: 30.00 },
  { limitInferior: 93993.91, cuotaFija: 22665.17, porcentaje: 32.00 },
  { limitInferior: 125325.46, cuotaFija: 32691.18, porcentaje: 34.00 },
  { limitInferior: 375976.30, cuotaFija: 117912.43, porcentaje: 35.00 },
];

export const UMA_2024 = 108.57;
export const SALARIO_MINIMO_2024 = 248.93;
export const SALARIO_MINIMO_ZONA_LIBRE_2024 = 374.89;

// Vacaciones Dignas 2024
export const getVacationDays = (years: number): number => {
  if (years <= 1) return 12;
  if (years === 2) return 14;
  if (years === 3) return 16;
  if (years === 4) return 18;
  if (years === 5) return 20;
  if (years <= 10) return 22;
  if (years <= 15) return 24;
  if (years <= 20) return 26;
  if (years <= 25) return 28;
  return 30;
};
