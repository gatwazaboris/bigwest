'use client';

import { useState, type ChangeEvent } from 'react';
import { fileToDataUrl } from '@/lib/utils/images';

export function MultiImageField({
  images,
  onChange,
  label = 'Tour Images',
}: {
  images: string[];
  onChange: (images: string[]) => void;
  label?: string;
}) {
  const [manualValue, setManualValue] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    setLoading(true);
    try {
      const loaded = await Promise.all(files.map(fileToDataUrl));
      onChange([...images, ...loaded.filter(Boolean)]);
      event.target.value = '';
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ marginTop: 12 }}>
      <label style={labelStyle}>{label}</label>
      <input type="file" accept="image/*" multiple onChange={handleFileChange} />
      {loading ? <p style={subtleText}>Reading images...</p> : null}

      <textarea
        style={textareaStyle}
        placeholder="Paste one image data URL or remote URL and click add"
        value={manualValue}
        onChange={(event) => setManualValue(event.target.value)}
      />

      <button
        type="button"
        style={secondaryButton}
        onClick={() => {
          const next = manualValue.trim();
          if (!next) return;
          onChange([...images, next]);
          setManualValue('');
        }}
      >
        Add Image
      </button>

      <div style={{ display: 'grid', gap: 10, marginTop: 14 }}>
        {images.map((image, index) => (
          <div key={`${image.slice(0, 24)}-${index}`} style={rowStyle}>
            <img src={image} alt={`Tour image ${index + 1}`} style={thumbStyle} />

            <div style={{ flex: '1 1 220px', minWidth: 0 }}>
              <div style={{ fontWeight: 600 }}>Image {index + 1}</div>
              <div style={metaStyle}>
                {image.startsWith('data:') ? 'Embedded image' : 'Remote image URL'}
              </div>
            </div>

            <div style={actionsStyle}>
              <button
                type="button"
                style={secondaryButton}
                onClick={() => index > 0 && onChange(move(images, index, index - 1))}
              >
                Up
              </button>

              <button
                type="button"
                style={secondaryButton}
                onClick={() => index < images.length - 1 && onChange(move(images, index, index + 1))}
              >
                Down
              </button>

              <button
                type="button"
                style={dangerButton}
                onClick={() => onChange(images.filter((_, itemIndex) => itemIndex !== index))}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SingleImageField({
  value,
  onChange,
  label = 'Image',
}: {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}) {
  const [manualValue, setManualValue] = useState('');

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    onChange(await fileToDataUrl(file));
    event.target.value = '';
  }

  return (
    <div style={{ marginTop: 12 }}>
      <label style={labelStyle}>{label}</label>
      <input type="file" accept="image/*" onChange={handleFileChange} />

      <textarea
        style={textareaStyle}
        value={manualValue}
        onChange={(event) => setManualValue(event.target.value)}
        placeholder="Paste image data URL or remote URL"
      />

      <button
        type="button"
        style={secondaryButton}
        onClick={() => {
          const next = manualValue.trim();
          if (!next) return;
          onChange(next);
          setManualValue('');
        }}
      >
        Set Image
      </button>

      {value ? <img src={value} alt="Preview" style={previewStyle} /> : null}
    </div>
  );
}

function move<T>(items: T[], from: number, to: number) {
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: 6,
  fontWeight: 600,
};

const textareaStyle: React.CSSProperties = {
  width: '100%',
  minHeight: 80,
  marginTop: 10,
  border: '1px solid #e1d7cb',
  borderRadius: 14,
  padding: 12,
};

const subtleText: React.CSSProperties = {
  color: '#64748b',
  fontSize: 14,
};

const rowStyle: React.CSSProperties = {
  display: 'flex',
  gap: 12,
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  padding: 10,
  border: '1px solid #e2e8f0',
  borderRadius: 16,
  background: '#f8fafc',
};

const thumbStyle: React.CSSProperties = {
  width: 72,
  height: 72,
  objectFit: 'cover',
  borderRadius: 12,
};

const previewStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: 260,
  height: 180,
  objectFit: 'cover',
  borderRadius: 16,
  marginTop: 12,
};

const metaStyle: React.CSSProperties = {
  color: '#64748b',
  fontSize: 12,
  wordBreak: 'break-word',
};

const actionsStyle: React.CSSProperties = {
  display: 'flex',
  gap: 8,
  flexWrap: 'wrap',
  marginLeft: 'auto',
};

const secondaryButton: React.CSSProperties = {
  border: '1px solid #cbd5e1',
  background: 'white',
  borderRadius: 12,
  padding: '8px 12px',
  cursor: 'pointer',
};

const dangerButton: React.CSSProperties = {
  border: 0,
  background: '#dc2626',
  color: 'white',
  borderRadius: 12,
  padding: '8px 12px',
  cursor: 'pointer',
};