import { LabWorkspace } from '@/components/laboratory/LabWorkspace';
import { EXPERIMENTS_REGISTRY } from '@/data/experiments-registry';
export default function LegacyWaterPage() {
  return <><p className="p-4 bg-amber-100 text-amber-950">Legacy previews: these activities have not passed the new scientific acceptance gate.</p><LabWorkspace experiment={EXPERIMENTS_REGISTRY[0]} /></>;
}
