
export interface CalculationInputs {
  grossSalary: number;
  period: 'monthly' | 'biweekly' | 'weekly';
  yearsOfService: number;
  aguinaldoDays: number;
  vacationPremiumPercentage: number;
  statePayrollTax: number;
}

export interface CalculationResult {
  grossMonthly: number;
  grossAnnual: number;
  netMonthly: number;
  netAnnual: number;
  isr: number;
  imssWorker: number;
  aguinaldo: number;
  vacationPremium: number;
  employerCost: {
    imssPatronal: number;
    infonavit: number;
    isn: number;
    totalMonthly: number;
    totalAnnual: number;
  };
  breakdown: {
    name: string;
    value: number;
    color: string;
  }[];
}

export interface ISRTableEntry {
  limitInferior: number;
  cuotaFija: number;
  porcentaje: number;
}
