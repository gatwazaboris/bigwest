import type { LocalizedText } from '@/types/site';

function toEnglishOnly(en: string): LocalizedText {
  return { en, fr: en };
}

export function LocalizedInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: LocalizedText;
  onChange: (value: LocalizedText) => void;
}) {
  return (
    <>
      <label style={labelStyle}>{label}</label>
      <input
        style={inputStyle}
        value={value.en}
        onChange={(event) => onChange(toEnglishOnly(event.target.value))}
      />
    </>
  );
}

export function LocalizedTextarea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: LocalizedText;
  onChange: (value: LocalizedText) => void;
}) {
  return (
    <>
      <label style={labelStyle}>{label}</label>
      <textarea
        style={textareaStyle}
        value={value.en}
        onChange={(event) => onChange(toEnglishOnly(event.target.value))}
      />
    </>
  );
}

const labelStyle: React.CSSProperties = { display: 'block', marginTop: 12, marginBottom: 6, fontWeight: 600 };
const inputStyle: React.CSSProperties = { width: '100%', border: '1px solid #cbd5e1', borderRadius: 14, padding: 12 };
const textareaStyle: React.CSSProperties = { width: '100%', minHeight: 110, border: '1px solid #cbd5e1', borderRadius: 14, padding: 12 };
