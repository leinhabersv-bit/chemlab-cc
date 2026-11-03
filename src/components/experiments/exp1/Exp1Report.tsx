"use client";

import React, { useState } from "react";
import { generateWaterQualityReport, QualityReportItem } from "@/lib/science/water-analysis";

interface Exp1ReportProps {
  measurements: {
    hardnessPpm: number;
    chloridePpm: number;
    tdsPpm: number;
    sulfatePpm: number;
    ph: number;
  };
}

export const Exp1Report: React.FC<Exp1ReportProps> = ({ measurements }) => {
  const [studentName, setStudentName] = useState<string>("B.Tech Student");
  const [regNumber, setRegNumber] = useState<string>("24BCE1001");
  const [location, setLocation] = useState<string>("VIT Chennai Campus Borewell #3");
  const [dateOfCollection, setDateOfCollection] = useState<string>("2026-11-04");

  const reportItems: QualityReportItem[] = generateWaterQualityReport(measurements);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl flex flex-col gap-6 text-slate-100 print:bg-white print:text-black print:border-none print:shadow-none">
      {/* Report Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 pb-4 gap-4 print:border-black">
        <div>
          <div className="text-xs font-mono font-bold text-cyan-400 print:text-black uppercase tracking-widest">
            DIVISION OF CHEMISTRY — SCHOOL OF ADVANCED SCIENCES — VIT CHENNAI
          </div>
          <h2 className="text-xl font-bold text-slate-100 print:text-black mt-1">
            Comprehensive Water Quality Analysis Report
          </h2>
          <p className="text-xs text-slate-400 print:text-gray-600 font-mono mt-0.5">
            Evaluated against Central Pollution Control Board (CPCB) & BIS 10500:2012 Drinking Water Specifications
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold shadow transition-all print:hidden flex items-center gap-1.5 font-mono"
        >
          🖨️ Print / Save PDF
        </button>
      </div>

      {/* Student & Sample Metadata Form */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-950/70 p-4 rounded-xl border border-slate-800 print:bg-transparent print:border-black text-xs font-mono">
        <div>
          <label className="text-slate-400 print:text-gray-600 block text-[10px] mb-1">STUDENT NAME:</label>
          <input
            type="text"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200 print:border-none print:bg-transparent"
          />
        </div>
        <div>
          <label className="text-slate-400 print:text-gray-600 block text-[10px] mb-1">REGISTRATION NO:</label>
          <input
            type="text"
            value={regNumber}
            onChange={(e) => setRegNumber(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200 print:border-none print:bg-transparent"
          />
        </div>
        <div>
          <label className="text-slate-400 print:text-gray-600 block text-[10px] mb-1">SAMPLE LOCATION:</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200 print:border-none print:bg-transparent"
          />
        </div>
        <div>
          <label className="text-slate-400 print:text-gray-600 block text-[10px] mb-1">DATE OF COLLECTION:</label>
          <input
            type="date"
            value={dateOfCollection}
            onChange={(e) => setDateOfCollection(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200 print:border-none print:bg-transparent"
          />
        </div>
      </div>

      {/* Master Comparison Table (Manual Page 13) */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono border border-slate-800 print:border-black border-collapse">
          <thead>
            <tr className="bg-slate-950 text-slate-300 print:bg-gray-100 print:text-black border-b border-slate-800 print:border-black">
              <th className="p-3">Parameter</th>
              <th className="p-3">Recorded Value</th>
              <th className="p-3">Acceptable Limit (BIS)</th>
              <th className="p-3">Permissible Limit</th>
              <th className="p-3">Deviation from Standard (%)</th>
              <th className="p-3">Compliance Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 print:divide-gray-300 text-slate-200 print:text-black">
            {reportItems.map((item) => (
              <tr key={item.key} className="hover:bg-slate-800/40 print:hover:bg-transparent">
                <td className="p-3 font-semibold">{item.parameter}</td>
                <td className="p-3 font-bold text-cyan-300 print:text-black">
                  {item.recordedValue.toFixed(2)} {item.unit}
                </td>
                <td className="p-3 text-slate-400 print:text-gray-700">
                  {item.recommendedValue} {item.unit}
                </td>
                <td className="p-3 text-slate-400 print:text-gray-700">
                  {item.permissibleValue} {item.unit}
                </td>
                <td className="p-3 font-mono">
                  <span
                    className={
                      item.deviationPercent > 0
                        ? "text-rose-400 font-semibold"
                        : "text-emerald-400 font-semibold"
                    }
                  >
                    {item.deviationPercent > 0 ? `+${item.deviationPercent}%` : `${item.deviationPercent}%`}
                  </span>
                </td>
                <td className="p-3">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                      item.complianceStatus === "acceptable"
                        ? "bg-emerald-950 text-emerald-300 border border-emerald-800 print:border-black"
                        : item.complianceStatus === "permissible"
                        ? "bg-amber-950 text-amber-300 border border-amber-800 print:border-black"
                        : "bg-rose-950 text-rose-300 border border-rose-800 print:border-black"
                    }`}
                  >
                    {item.complianceStatus}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Potability Assessment */}
      <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 text-xs font-mono space-y-2">
        <h4 className="font-bold text-slate-200 uppercase tracking-wide">
          Overall Potability Verdict:
        </h4>
        <p className="text-slate-300 leading-relaxed text-[11px]">
          {reportItems.every((i) => i.complianceStatus === "acceptable") ? (
            <span className="text-emerald-400 font-semibold">
              ✓ POTABLE (DRINKING WATER SUITABLE): All tested parameters fall within the primary acceptable limits specified by BIS 10500:2012.
            </span>
          ) : reportItems.some((i) => i.complianceStatus === "exceeded") ? (
            <span className="text-rose-400 font-semibold">
              ⚠️ NON-COMPLIANT / REQUIRING TREATMENT: One or more parameters exceed permissible limits. Corrective water treatment (reverse osmosis, ion-exchange demineralization) is mandated prior to human consumption.
            </span>
          ) : (
            <span className="text-amber-400 font-semibold">
              ⚠️ PERMISSIBLE IN ABSENCE OF ALTERNATE SOURCE: Water exceeds primary acceptable limits but remains within permissible limits as per BIS 10500:2012.
            </span>
          )}
        </p>
      </div>

      {/* Signature & Verification Block */}
      <div className="grid grid-cols-2 pt-6 border-t border-slate-800 text-xs font-mono text-slate-400 print:text-black">
        <div>
          <div>Student Signature: ______________________</div>
          <div className="mt-1 text-[10px] text-slate-500">Date: {dateOfCollection}</div>
        </div>
        <div className="text-right">
          <div>Faculty Attestation: ______________________</div>
          <div className="mt-1 text-[10px] text-slate-500">BCHY101P Chemistry Division</div>
        </div>
      </div>
    </div>
  );
};
