export default function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-[#E7E5E4] bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] transition duration-200 ease-out hover:-translate-y-0.5">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-[#E7E5E4] bg-[#F5F5F4]">
        <span className="text-xs font-semibold text-[#78716C]">•</span>
      </div>
      <h3 className="text-lg font-semibold text-[#0F172A]">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-[#78716C]">
        {description}
      </p>
    </div>
  );
}
