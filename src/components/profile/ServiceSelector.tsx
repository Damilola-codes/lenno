"use client";

import { useMemo, useState } from "react";

const SERVICE_CATALOG = [
  "UI/UX Design",
  "Web Development",
  "Mobile App Development",
  "Frontend Development",
  "Backend Development",
  "Full Stack Development",
  "DevOps",
  "QA Testing",
  "Product Management",
  "Graphic Design",
  "Brand Identity",
  "Content Writing",
  "Technical Writing",
  "SEO",
  "Digital Marketing",
  "Social Media Management",
  "Video Editing",
  "Animation",
  "3D Modeling",
  "Data Analysis",
  "Data Science",
  "Machine Learning",
  "AI Integration",
  "Cybersecurity",
  "Cloud Architecture",
  "WordPress Development",
  "E-commerce Development",
  "Customer Support",
  "Virtual Assistance",
  "Translation",
  "Accounting",
  "Business Consulting",
  "Sales Strategy",
  "Email Marketing",
  "API Development",
  "Automation",
];

interface ServiceSelectorProps {
  selected: string[];
  onChange: (next: string[]) => void;
  maxServices?: number;
}

export default function ServiceSelector({
  selected,
  onChange,
  maxServices = 10,
}: ServiceSelectorProps) {
  const [query, setQuery] = useState("");

  const filteredServices = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return SERVICE_CATALOG;
    return SERVICE_CATALOG.filter((item) =>
      item.toLowerCase().includes(normalized),
    );
  }, [query]);

  const toggleService = (service: string) => {
    const isSelected = selected.includes(service);
    if (isSelected) {
      onChange(selected.filter((item) => item !== service));
      return;
    }

    if (selected.length >= maxServices) return;
    onChange([...selected, service]);
  };

  return (
    <div className="space-y-2">
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search services"
        className="w-full rounded-xl border border-primary-200 px-3 py-2 text-sm text-primary-900 outline-none focus:border-primary-400"
      />

      <p className="text-xs text-primary-600">
        Selected {selected.length}/{maxServices}
      </p>

      <div className="max-h-40 overflow-y-auto rounded-xl border border-primary-200 p-2">
        <div className="flex flex-wrap gap-2">
          {filteredServices.map((service) => {
            const isSelected = selected.includes(service);
            const limitReached = !isSelected && selected.length >= maxServices;
            return (
              <button
                key={service}
                type="button"
                onClick={() => toggleService(service)}
                disabled={limitReached}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                  isSelected
                    ? "border-[#abff31] bg-[#f5ffe5] text-primary-900"
                    : "border-primary-200 text-primary-700 hover:border-primary-300"
                } ${limitReached ? "opacity-45 cursor-not-allowed" : ""}`}
              >
                {service}
              </button>
            );
          })}
        </div>
      </div>

      {selected.length >= maxServices && (
        <p className="text-xs text-primary-600">
          Maximum of {maxServices} services reached.
        </p>
      )}
    </div>
  );
}
