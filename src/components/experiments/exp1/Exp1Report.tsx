"use client";

import React, { useState } from "react";
import { generateWaterQualityReport, QualityReportItem } from "@/lib/science/water-analysis";

interface Exp1ReportProps {
  results?: {
    totalHardnessPpm: number;
    chloridePpm: number;
    tdsPpm: number;
    sulfatePpm: number;
    ph: number;
  };
  measurements?: {
    hardnessPpm: number;
    chloridePpm: number;
    tdsPpm: number;
    sulfatePpm: number;
    ph: number;
  };
}

export const Exp1Report: React.FC<Exp1ReportProps> = ({ results, measurements }) => {
  const [studentName, setStudentName] = useState<string>("B.Tech Student");
  const [regNumber, setRegNumber] = useState<string>("24BCE1001");
  const [location, setLocation] = useState<string>("VIT Chennai Campus Borewell #3");
  const [dateOfCollection, setDateOfCollection] = useState<string>("2026-11-04");

  const effectiveMeasurements = measurements || {
    hardnessPpm: results?.totalHardnessPpm ?? 420.0,
    chloridePpm: results?.chloridePpm ?? 212.7,
    tdsPpm: results?.tdsPpm ?? 455.0,
    sulfatePpm: results?.sulfatePpm ?? 175.4,
    ph: results?.ph ?? 7.84,
  };

  const reportItems: QualityReportItem[] = generateWaterQualityReport(effectiveMeasurements);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-bench-900 border border-bench-750 rounded-2xl p-6 shadow-2xl flex flex-col gap-6 text-enamel-100 print:bg-white print:text-black print:border-none print:shadow-none">
      {/* Report Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-bench-800 pb-4 gap-4 print:border-black">
        <div>
          <div className="text-xs font-mono font-bold text-instrument-amber print:text-black uppercase tracking-widest">
            DIVISION OF CHEMISTRY — SCHOOL OF ADVANCED SCIENCES — VIT CHENNAI
          </div>
          <h2 className="text-xl font-bold text-white print:text-black mt-1 font-sans">
            Comprehensive Water Quality Analysis Report
          </h2>
          <p className="text-xs text-enamel-400 print:text-gray-600 font-mono mt-0.5">
            Evaluated against Central Pollution Control Board (CPCB) & BIS 10500:2012 Drinking Water Specifications
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-instrument-amber hover:bg-amber-500 text-slate-950 rounded-xl text-xs font-bold shadow transition-all print:hidden flex items-center gap-1.5 font-mono"
        >
          🖨️ Print / Save PDF
        </button>
      </div>

      {/* Student & Sample Metadata Form */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-bench-950 p-4 rounded-xl border border-bench-800 print:bg-transparent print:border-black text-xs font-mono">
        <div>
          <label className="text-enamel-500 print:text-gray-600 block text-[10px] mb-1">STUDENT NAME:</label>
          <input
            type="text"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            className="w-full bg-bench-900 border border-bench-750 rounded-lg px-2.5 py-1 text-enamel-100 print:border-none print:bg-transparent"
          />
        </div>
        <div>
          <label className="text-enamel-500 print:text-gray-600 block text-[10px] mb-1">REGISTRATION NO:</label>
          <input
            type="text"
            value={regNumber}
            onChange={(e) => setRegNumber(e.target.value)}
            className="w-full bg-bench-900 border border-bench-750 rounded-lg px-2.5 py-1 text-enamel-100 print:border-none print:bg-transparent"
          />
        </div>
        <div>
          <label className="text-enamel-500 print:text-gray-600 block text-[10px] mb-1">SAMPLE LOCATION:</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full bg-bench-900 border border-bench-750 rounded-lg px-2.5 py-1 text-enamel-100 print:border-none print:bg-transparent"
          />
        </div>
        <div>
          <label className="text-enamel-500 print:text-gray-600 block text-[10px] mb-1">DATE OF COLLECTION:</label>
          <input
            type="date"
            value={dateOfCollection}
            onChange={(e) => setDateOfCollection(e.target.value)}
            className="w-full bg-bench-900 border border-bench-750 rounded-lg px-2.5 py-1 text-enamel-100 print:border-none print:bg-transparent"
          />
        </div>
      </div>

      {/* Master Comparison Table (Manual Page 13) */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono border border-bench-800 print:border-black border-collapse">
          <thead>
            <tr className="bg-bench-950 text-enamel-300 print:bg-gray-100 print:text-black border-b border-bench-800 print:border-black">
              <th className="p-3">Parameter</th>
              <th className="p-3">Recorded Value</th>
              <th className="p-3">Acceptable Limit (BIS)</th>
              <th className="p-3">Permissible Limit</th>
              <th className="p-3">Deviation from Standard (%)</th>
              <th className="p-3">Compliance Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-bench-800 print:divide-gray-300 text-enamel-200 print:text-black">
            {reportItems.map((item) => (
              <tr key={item.key} className="hover:bg-bench-850/50 print:hover:bg-transparent">
                <td className="p-3 font-semibold">{item.parameter}</td>
                <td className="p-3 font-bold text-instrument-sky print:text-black">
                  {item.recordedValue.toFixed(2)} {item.unit}
                </td>
                <td className="p-3 text-enamel-400 print:text-gray-700">
                  {item.recommendedValue} {item.unit}
                </td>
                <td className="p-3 text-enamel-400 print:text-gray-700">
                  {item.permissibleValue} {item.unit}
                </td>
                <td className="p-3 font-mono">
                  <span
                    className={
                      item.deviationPercent > 0
                        ? "text-rose-400 font-bold"
                        : "text-emerald-400 font-bold"
                    }
                  >
                    {item.deviationPercent > 0 ? `+${item.deviationPercent.toFixed(1)}%` : `${item.deviationPercent.toFixed(1)}%`}
                  </span>
                </td>
                <td className="p-3">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      item.complianceStatus === "acceptable"
                        ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                        : item.complianceStatus === "permissible"
                        ? "bg-amber-950 text-amber-300 border border-amber-800"
                        : "bg-rose-950 text-rose-300 border border-rose-800"
                    }`}
                  >
                    {item.complianceStatus.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
