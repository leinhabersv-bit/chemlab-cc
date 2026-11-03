import React from "react";
import { notFound } from "next/navigation";
import { EXPERIMENTS_REGISTRY } from "@/data/experiments-registry";
import { LabWorkspace } from "@/components/laboratory/LabWorkspace";
import { ExperimentShell } from "@/components/experiment/ExperimentShell";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return EXPERIMENTS_REGISTRY.map((exp) => ({
    id: exp.id,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const experiment = EXPERIMENTS_REGISTRY.find((e) => e.id === id);
  if (!experiment) {
    return { title: "Experiment Not Found — CHEMLAB CC" };
  }
  return {
    title: `Exp ${experiment.number}: ${experiment.shortTitle} — CHEMLAB CC Digital Laboratory`,
    description: experiment.aim,
  };
}

export default async function ExperimentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const experiment = EXPERIMENTS_REGISTRY.find((e) => e.id === id);

  if (!experiment) {
    notFound();
  }

  // Purpose-built digital laboratory workspace for Experiment 1
  if (experiment.id === "exp-1") {
    return <LabWorkspace experiment={experiment} />;
  }

  return <ExperimentShell experiment={experiment} />;
}
