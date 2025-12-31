
import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  TrendingUp, 
  Building2, 
  ChevronRight,
  Umbrella,
  Copy,
  Check,
  FileSpreadsheet
} from 'lucide-react';
import { CalculationInputs } from './types';
import { calculatePayroll } from './services/salaryEngine';
import { GoogleGenAI } from '@google/genai';
import { getVacationDays } from './constants';

const App: React.FC = () => {
  const [inputs, setInputs] = useState<CalculationInputs>({
    grossSalary: 5000, 
    period: 'weekly',
    yearsOfService: 1,
    aguinaldoDays: 15,
    vacationPremiumPercentage: 25, 
    statePayrollTax: 3 
  });

  const [aiInsight, setAiInsight] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [copied, setCopied] = useState(false);

  const results = useMemo(() => calculatePayroll(inputs), [inputs]);
  const currentVacationDays = useMemo(() => getVacationDays(inputs.yearsOfService), [inputs.yearsOfService]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({
      ...prev,
      [name]: name === 'period' ? value : parseFloat(value) || 0
    }));
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val);

  const getAiInsight = async () => {
    setLoadingAi(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Analiza este sueldo en México: 
      Bruto Mensual: ${results.grossMonthly} MXN. 
      Neto Mensual: ${results.netMonthly} MXN. 
      Costo Total Empresa: ${results.employerCost.totalMonthly} MXN.
      Prestaciones de Ley: ${inputs.aguinaldoDays} días de aguinaldo, ${currentVacationDays} días de vacaciones.
      ¿Es competitivo? Da 3 consejos breves.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      setAiInsight(response.text || 'No se pudo obtener el análisis.');
    } catch (error) {
      setAiInsight('Error al conectar con el asesor financiero AI.');
    } finally {
      setLoadingAi(false);
    }
  };

  const periodLabel = inputs.period === 'weekly' ? 'Semanal' : inputs.period === 'biweekly' ? 'Quincenal' : 'Mensual';
  const periodShort = inputs.period === 'weekly' ? 'Sem.' : inputs.period === 'biweekly' ? 'Quin.' : 'Mes.';

  const periodValues = useMemo(() => {
    const divisor = inputs.period === 'weekly' ? (30.4 / 7) : inputs.period === 'biweekly' ? 2 : 1;
    return {
      gross: (results.grossMonthly / divisor),
      net: (results.netMonthly / divisor),
      isr: (results.isr / divisor),
      imssW: (results.imssWorker / divisor),
      imssP: (results.employerCost.imssPatronal / divisor),
      infonavit: (results.employerCost.infonavit / divisor),
      isn: (results.employerCost.isn / divisor),
      totalCost: (results.employerCost.totalMonthly / divisor)
    };
  }, [results, inputs.period]);

  const excelHeader = useMemo(() => {
    const headers = [
      `Trabajador Bruto (${periodLabel})`, `Trabajador Neto (${periodLabel})`, `ISR (${periodLabel})`, `IMSS Obrero (${periodLabel})`,
      "Trabajador Bruto (Mensual)", "Trabajador Neto (Mensual)", "ISR (Mensual)", "IMSS Obrero (Mensual)",
      `Empresa IMSS Pat. (${periodLabel})`, `Empresa INFONAVIT (${periodLabel})`, `Empresa ISN (${periodLabel})`, `Empresa Costo Total (${periodLabel})`,
      "Empresa IMSS Pat. (Mensual)", "Empresa INFONAVIT (Mensual)", "Empresa ISN (Mensual)", "Empresa Costo Total (Mensual)",
      "Anual Aguinaldo", "Anual Prima Vacacional", "Anual Neto Total", "Anual Costo Patronal"
    ];
    return headers.join('\t');
  }, [periodLabel]);

  const excelDataLine = useMemo(() => {
    const values = [
      periodValues.gross.toFixed(2), periodValues.net.toFixed(2), periodValues.isr.toFixed(2), periodValues.imssW.toFixed(2),
      results.grossMonthly.toFixed(2), results.netMonthly.toFixed(2), results.isr.toFixed(2), results.imssWorker.toFixed(2),
      periodValues.imssP.toFixed(2), periodValues.infonavit.toFixed(2), periodValues.isn.toFixed(2), periodValues.totalCost.toFixed(2),
      results.employerCost.imssPatronal.toFixed(2), results.employerCost.infonavit.toFixed(2), results.employerCost.isn.toFixed(2), results.employerCost.totalMonthly.toFixed(2),
      results.aguinaldo.toFixed(2), results.vacationPremium.toFixed(2), results.netAnnual.toFixed(2), results.employerCost.totalAnnual.toFixed(2)
    ];
    return values.join('\t');
  }, [results, periodValues]);

  const copyToClipboard = () => {
    const fullContent = `${excelHeader}\n${excelDataLine}`;
    navigator.clipboard.writeText(fullContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen pb-12 bg-slate-50 font-sans">
      <header className="bg-slate-900 text-white py-8 px-4 shadow-lg mb-8 border-b border-emerald-500/30">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500 p-2 rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.4)]">
              <Calculator className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight uppercase">NóminaMX <span className="text-emerald-400">Master</span></h1>
              <p className="text-slate-400 text-xs font-bold tracking-widest uppercase opacity-70">Desglose Integral por Periodo y Mensual</p>
            </div>
          </div>
          <div className="hidden md:flex gap-4">
            <div className="px-4 py-2 bg-slate-800 rounded-xl border border-slate-700 text-right">
              <div className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">TABLAS VIGENTES</div>
              <div className="text-emerald-400 font-bold">AÑO 2024</div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <section className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-200">
            <h2 className="text-sm font-black mb-6 flex items-center gap-2 text-slate-800 uppercase tracking-widest">
              <TrendingUp className="w-4 h-4 text-emerald-600" /> Configuración de Pago
            </h2>
            
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  Sueldo Bruto {periodShort}
                </label>
                <div className="relative">
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-xl">$</span>
                  <input 
                    type="number" 
                    name="grossSalary"
                    value={inputs.grossSalary}
                    onChange={handleInputChange}
                    className="w-full pl-6 bg-transparent border-none text-2xl font-black text-slate-900 focus:ring-0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Frecuencia</label>
                  <select name="period" value={inputs.period} onChange={handleInputChange} className="w-full bg-transparent border-none text-xs font-bold text-slate-800 p-0 focus:ring-0 cursor-pointer">
                    <option value="weekly">Semanal</option>
                    <option value="biweekly">Quincenal</option>
                    <option value="monthly">Mensual</option>
                  </select>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Años Servicio</label>
                  <input type="number" name="yearsOfService" value={inputs.yearsOfService} onChange={handleInputChange} className="w-full bg-transparent border-none text-xs font-bold text-slate-800 p-0 focus:ring-0" />
                </div>
              </div>

              <div className="pt-4 mt-2 border-t border-slate-100">
                <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-100 shadow-inner">
                  <div className="flex items-center gap-2">
                    <Umbrella className="w-5 h-5 text-emerald-600" />
                    <span className="text-[10px] text-emerald-800 font-black uppercase">Vacaciones</span>
                  </div>
                  <span className="text-xl font-black text-emerald-900">{currentVacationDays} DÍAS</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-3xl text-white shadow-2xl relative overflow-hidden group border border-slate-800">
            <h3 className="font-black text-xs uppercase tracking-widest text-emerald-400 mb-2">Asesoría AI Gemini</h3>
            <p className="text-[11px] text-slate-400 mb-5 leading-relaxed">Genera un análisis rápido sobre competitividad y costos.</p>
            <button 
              onClick={getAiInsight}
              disabled={loadingAi}
              className="w-full bg-emerald-600 text-white py-3 rounded-2xl font-black hover:bg-emerald-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-xs shadow-xl active:scale-95"
            >
              {loadingAi ? 'CALCULANDO...' : 'ANÁLISIS INTELIGENTE'}
            </button>
            {aiInsight && (
              <div className="mt-4 p-4 bg-white/5 backdrop-blur-xl rounded-2xl text-[10px] text-slate-200 leading-relaxed border border-white/10 italic">
                "{aiInsight}"
              </div>
            )}
          </div>
        </section>

        <section className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl shadow-xl border-l-8 border-l-emerald-500 border border-slate-200">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Cobro Neto ({periodShort})</span>
              <div className="text-4xl font-black text-slate-900">{formatCurrency(periodValues.net)}</div>
              <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1 font-bold">
                <ChevronRight className="w-3 h-3 text-emerald-500" /> Mensual: {formatCurrency(results.netMonthly)}
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-xl border-l-8 border-l-blue-600 border border-slate-200">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Costo Empresa ({periodShort})</span>
              <div className="text-4xl font-black text-slate-900">{formatCurrency(periodValues.totalCost)}</div>
              <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1 font-bold">
                <ChevronRight className="w-3 h-3 text-blue-600" /> Mensual: {formatCurrency(results.employerCost.totalMonthly)}
              </div>
            </div>
          </div>

          <div className="bg-emerald-800 p-8 rounded-[2rem] shadow-2xl text-white relative overflow-hidden border border-emerald-700/50">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
              <div className="flex items-center gap-5">
                <div className="p-4 bg-white/10 rounded-2xl border border-white/20 shadow-inner backdrop-blur-md">
                  <FileSpreadsheet className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-2xl leading-tight uppercase">Excel Multi-Bloque</h3>
                  <p className="text-emerald-100 text-[10px] uppercase font-bold tracking-[0.2em] mt-1 opacity-70">Copia encabezados + datos detallados</p>
                </div>
              </div>
              <button 
                onClick={copyToClipboard}
                className={`flex items-center gap-2 px-10 py-5 rounded-2xl font-black transition-all shadow-2xl uppercase text-sm active:scale-95 ${copied ? 'bg-white text-emerald-800' : 'bg-slate-900 text-white hover:bg-slate-800 hover:-translate-y-1'}`}
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                {copied ? '¡FILAS COPIADAS!' : 'COPIAR TABLA COMPLETA'}
              </button>
            </div>
            
            <div className="mt-8 bg-black/30 backdrop-blur-2xl rounded-3xl p-6 border border-white/10 overflow-x-auto shadow-inner">
              <div className="flex gap-4 mb-4 border-b border-white/10 pb-4 overflow-x-auto min-w-[1200px]">
                <div className="flex-1 text-center bg-emerald-500/20 py-2 rounded-lg border border-emerald-400/20 min-w-[200px]">
                    <div className="text-[10px] font-black uppercase text-emerald-300 tracking-widest">TRABAJADOR ({periodShort})</div>
                </div>
                <div className="flex-1 text-center bg-emerald-500/10 py-2 rounded-lg border border-emerald-400/10 min-w-[200px]">
                    <div className="text-[10px] font-black uppercase text-emerald-300 tracking-widest">TRABAJADOR (MES)</div>
                </div>
                <div className="flex-1 text-center bg-blue-500/20 py-2 rounded-lg border border-blue-400/20 min-w-[200px]">
                    <div className="text-[10px] font-black uppercase text-blue-300 tracking-widest">EMPRESA ({periodShort})</div>
                </div>
                <div className="flex-1 text-center bg-blue-500/10 py-2 rounded-lg border border-blue-400/10 min-w-[200px]">
                    <div className="text-[10px] font-black uppercase text-blue-300 tracking-widest">EMPRESA (MES)</div>
                </div>
                <div className="flex-1 text-center bg-amber-500/20 py-2 rounded-lg border border-amber-400/20 min-w-[200px]">
                    <div className="text-[10px] font-black uppercase text-amber-300 tracking-widest">TOTALES ANUALES</div>
                </div>
              </div>

              <div className="font-mono text-[9px] text-emerald-200/50 mb-2 border-b border-white/5 pb-2 min-w-[1200px]">
                {excelHeader}
              </div>
              <div className="font-mono text-[11px] text-white text-center py-4 bg-black/40 rounded-2xl select-all cursor-text font-black tracking-tight px-4 border border-white/10 min-w-[1200px]">
                {excelDataLine}
              </div>
            </div>
            
            <p className="mt-4 text-center text-[9px] text-emerald-200/40 font-black uppercase tracking-widest">
              PEGA EN EXCEL PARA OBTENER DOS FILAS: UNA DE ENCABEZADOS Y OTRA DE VALORES
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-200">
              <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest flex items-center gap-2 mb-6 border-b border-slate-50 pb-4">
                <Umbrella className="w-5 h-5 text-emerald-500" /> Beneficios Proyectados
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm p-4 bg-slate-50 rounded-2xl">
                  <span className="text-slate-500 font-black text-[9px] uppercase tracking-wider">Aguinaldo</span>
                  <span className="font-black text-slate-900">{formatCurrency(results.aguinaldo)}</span>
                </div>
                <div className="flex justify-between items-center text-sm p-4 bg-slate-50 rounded-2xl">
                  <span className="text-slate-500 font-black text-[9px] uppercase tracking-wider">Prima Vacacional</span>
                  <span className="font-black text-slate-900">{formatCurrency(results.vacationPremium)}</span>
                </div>
                <div className="pt-6 border-t border-slate-100">
                  <span className="text-slate-400 font-black uppercase text-[9px] block mb-1">Neto Anual Estimado</span>
                  <span className="font-black text-emerald-600 text-3xl">{formatCurrency(results.netAnnual)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-200">
              <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest flex items-center gap-2 mb-6 border-b border-slate-50 pb-4">
                <Building2 className="w-5 h-5 text-blue-600" /> Detalle de Costo Empresa
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm p-4 bg-slate-50 rounded-2xl">
                  <span className="text-slate-500 font-black text-[9px] uppercase tracking-wider">Carga Social (Mes)</span>
                  <span className="font-black text-slate-900">{formatCurrency(results.employerCost.imssPatronal + results.employerCost.infonavit)}</span>
                </div>
                <div className="flex justify-between items-center text-sm p-4 bg-slate-50 rounded-2xl">
                  <span className="text-slate-500 font-black text-[9px] uppercase tracking-wider">ISN (Mes)</span>
                  <span className="font-black text-slate-900">{formatCurrency(results.employerCost.isn)}</span>
                </div>
                <div className="pt-6 border-t border-slate-100">
                  <span className="text-slate-400 font-black uppercase text-[9px] block mb-1">Presupuesto Anual Total</span>
                  <span className="font-black text-blue-600 text-3xl">{formatCurrency(results.employerCost.totalAnnual)}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="max-w-6xl mx-auto px-4 mt-16 text-center pb-12">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl inline-block max-w-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-emerald-500"></div>
          <p className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.5em] mb-4">NóminaMX Professional v5.0</p>
          <p className="text-slate-400 text-[11px] leading-relaxed font-medium">
            Basado en la <span className="text-white font-bold">Ley Federal del Trabajo y Ley del Seguro Social 2024</span>. 
            Utiliza el factor de integración anual para cálculos precisos de impuestos y cuotas patronales.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
