import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { FORMS } from "@/lib/forms-config";
import DynamicIntakeForm from "@/components/IntakeForm";
import IntakeHeader from "@/components/IntakeHeader";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const config = FORMS[category];
  if (!config) return { title: "TrustLink" };
  return { title: `${config.titleEn || config.title} — TrustLink` };
}

export default async function IntakePage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const config = FORMS[category];
  if (!config) notFound();

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-xl mx-auto">
        <IntakeHeader config={config} />
        <DynamicIntakeForm config={config} />
      </div>
    </div>
  );
}
