"use client";

import { useMemo, useState } from "react";
import {
  groupTimeZones,
  ianaTimeZones,
  timezoneOptionLabel,
} from "@/lib/i18n/timezones";
import {
  whatsappLanguageOptions,
} from "@/lib/i18n/whatsappLanguages";

type SelectProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  id?: string;
  name?: string;
};

export function TimezoneSelect({
  value,
  onChange,
  className,
  id,
  name,
}: SelectProps) {
  const [query, setQuery] = useState("");
  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const zones = ianaTimeZones().filter((zone) => {
      if (!q) return true;
      return (
        zone.toLowerCase().includes(q) ||
        timezoneOptionLabel(zone).toLowerCase().includes(q)
      );
    });
    const listed = zones.includes(value) || !value ? zones : [value, ...zones];
    return groupTimeZones(listed);
  }, [query, value]);

  return (
    <div className="space-y-2">
      <input
        type="search"
        className={className}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search cities or regions — Dubai, New York, Tokyo…"
        autoComplete="off"
      />
      <select
        id={id}
        name={name}
        className={className}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {groups.map((group) => (
          <optgroup key={group.region} label={group.region}>
            {group.zones.map((zone) => (
              <option key={zone} value={zone}>
                {timezoneOptionLabel(zone)}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
}

export function WhatsAppLanguageSelect({
  value,
  onChange,
  className,
  id,
  name,
}: SelectProps) {
  const [query, setQuery] = useState("");
  const options = useMemo(() => {
    const list = whatsappLanguageOptions(value);
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (row) =>
        row.code.toLowerCase().includes(q) ||
        row.label.toLowerCase().includes(q),
    );
  }, [query, value]);

  return (
    <div className="space-y-2">
      <input
        type="search"
        className={className}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search languages — Arabic, Spanish, Japanese…"
        autoComplete="off"
      />
      <select
        id={id}
        name={name}
        className={className}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {value && !options.some((row) => row.code === value) ? (
          <option value={value}>{value}</option>
        ) : null}
        {options.map((row) => (
          <option key={row.code} value={row.code}>
            {row.label} · {row.code}
          </option>
        ))}
      </select>
    </div>
  );
}
