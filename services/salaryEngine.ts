
import { 
  CalculationInputs, 
  CalculationResult 
} from '../types';
import { 
  ISR_MONTHLY_TABLE_2024, 
  UMA_2024, 
  getVacationDays 
} from '../constants';

export const calculatePayroll = (inputs: CalculationInputs): CalculationResult => {
  const { 
    grossSalary, 
    period, 
    yearsOfService, 
    aguinaldoDays, 
    statePayrollTax
  } = inputs;

  // En México, la prima vacacional mínima de ley es el 25%
  const LEGAL_VACATION_PREMIUM_RATE = 0.25;

  // Normalizar a mensual si es necesario
  let monthlyGross = grossSalary;
  if (period === 'biweekly') monthlyGross = grossSalary * 2;
  if (period === 'weekly') monthlyGross = (grossSalary / 7) * 30.4;
  
  const dailySalary = monthlyGross / 30.4;
  const annualGross = monthlyGross * 12;

  // 1. Aguinaldo y Prima Vacacional (Basado en Antigüedad)
  const aguinaldo = dailySalary * aguinaldoDays;
  const vacationDays = getVacationDays(yearsOfService);
  const vacationPremium = (dailySalary * vacationDays) * LEGAL_VACATION_PREMIUM_RATE;

  // 2. Salario Base de Cotización (SBC) para IMSS
  // Factor de integración = (365 + aguinaldoDays + (vacationDays * 0.25)) / 365
  const integrationFactor = (365 + aguinaldoDays + (vacationDays * LEGAL_VACATION_PREMIUM_RATE)) / 365;
  const sbc = dailySalary * integrationFactor;

  // 3. Cálculo de ISR Mensual
  let isr = 0;
  const tableEntry = [...ISR_MONTHLY_TABLE_2024].reverse().find(e => monthlyGross >= e.limitInferior);
  if (tableEntry) {
    const excedente = monthlyGross - tableEntry.limitInferior;
    const impuestoMarginal = excedente * (tableEntry.porcentaje / 100);
    isr = tableEntry.cuotaFija + impuestoMarginal;
  }

  // 4. Cálculo de IMSS Obrero (Simplificado)
  const imssWorkerRate = 0.027; // Aproximación estándar
  const imssWorker = Math.min(sbc * 30.4 * imssWorkerRate, (25 * UMA_2024) * 30.4 * imssWorkerRate);

  const netMonthly = monthlyGross - isr - imssWorker;
  const netAnnual = (netMonthly * 12) + aguinaldo + vacationPremium;

  // 5. Costo Patronal
  const imssPatronalRate = 0.22; // Incluye todos los ramos aprox
  const infonavitRate = 0.05;
  const isnRate = statePayrollTax / 100;

  const imssPatronal = sbc * 30.4 * imssPatronalRate;
  const infonavit = sbc * 30.4 * infonavitRate;
  const isn = monthlyGross * isnRate;

  const totalMonthlyEmployerCost = monthlyGross + imssPatronal + infonavit + isn;
  // Estimado anual incluyendo prestaciones y su carga social
  const totalAnnualEmployerCost = (totalMonthlyEmployerCost * 12) + (aguinaldo * 1.3) + (vacationPremium * 1.3);

  return {
    grossMonthly: monthlyGross,
    grossAnnual: annualGross,
    netMonthly: netMonthly,
    netAnnual: netAnnual,
    isr,
    imssWorker,
    aguinaldo,
    vacationPremium,
    employerCost: {
      imssPatronal,
      infonavit,
      isn,
      totalMonthly: totalMonthlyEmployerCost,
      totalAnnual: totalAnnualEmployerCost
    },
    breakdown: [
      { name: 'Sueldo Neto', value: netMonthly, color: '#10b981' },
      { name: 'ISR', value: isr, color: '#ef4444' },
      { name: 'IMSS (Obrero)', value: imssWorker, color: '#f59e0b' }
    ]
  };
};
