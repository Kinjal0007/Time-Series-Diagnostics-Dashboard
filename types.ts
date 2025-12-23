
export interface DataPoint {
  [key: string]: number | string;
}

export interface CalculationResults {
  dailyMean: number;
  dailyStdDev: number;
  sampleSize: number;
  conventions: {
    name: string;
    days: number;
    annualMean: number;
    annualStdDev: number;
    meanPercent: string;
    stdDevPercent: string;
  }[];
}

export enum CalculationMode {
  DECIMAL = 'decimal',
  PERCENT = 'percent'
}
