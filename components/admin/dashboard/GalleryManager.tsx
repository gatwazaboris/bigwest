'use client';

import { LocalizedInput } from '@/components/admin/forms/LocalizedFields';
import { SingleImageField } from '@/components/admin/forms/ImageField';
import { toEditableGalleryItem } from '@/lib/utils/site-normalizers';
import type { GalleryItem } from '@/types/site';

export default function GalleryManager({
  items,
  form,
  editingId,
  saving,
  onFormChange,
  onEdit,
  onReset,
  onSave,
  onDelete,
}: {
  items: GalleryItem[];
  form: ReturnType<typeof toEditableGalleryItem>;
  editingId: string | null;
  saving: boolean;
  onFormChange: (value: ReturnType<typeof toEditableGalleryItem>) => void;
  onEdit: (item: GalleryItem) => void;
  onReset: () => void;
  onSave: () => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div style={gridStyle}>
      <section style={cardStyle}>
        <h2>{editingId ? 'Edit Gallery Item' : 'Create Gallery Item'}</h2>
        <LocalizedInput label="Title" value={form.title} onChange={(value) => onFormChange({ ...form, title: value })} />
        <SingleImageField value={form.imageData} onChange={(imageData) => onFormChange({ ...form, imageData })} />
        <label style={labelStyle}>Sort Order</label>
        <input style={inputStyle} type="number" value={form.sortOrder} onChange={(event) => onFormChange({ ...form, sortOrder: Number(event.target.value) || 0 })} />
        <label style={checkboxStyle}><input type="checkbox" checked={form.featured} onChange={(event) => onFormChange({ ...form, featured: event.target.checked })} /> Featured</label>
        <div style={actionRow}>
          <button style={primaryButton} disabled={saving} onClick={onSave}>{editingId ? 'Update Gallery Item' : 'Create Gallery Item'}</button>
          {editingId ? <button style={secondaryButton} onClick={onReset}>Cancel</button> : null}
        </div>
      </section>

      <section style={cardStyle}>
        <h2>Gallery Items</h2>
        <div style={{ display: 'grid', gap: 12 }}>
          {items.map((item) => (
            <article key={item.id} style={itemStyle}>
              <div style={{ display: 'flex', gap: 12, minWidth: 0 }}>
                {item.imageData ? <img src={item.imageData} alt={item.title.en} style={thumbStyle} /> : null}
                <div>
                  <strong>{item.title.en}</strong>
                  <div style={subtleStyle}>Sort {item.sortOrder} • {item.featured ? 'Featured' : 'Standard'}</div>
                </div>
              </div>
              <div style={actionColumn}>
                <button style={secondaryButton} onClick={() => onEdit(item)}>Edit</button>
                <button style={dangerButton} onClick={() => onDelete(item.id)}>Delete</button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

const gridStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 };
const cardStyle: React.CSSProperties = { background: 'white', borderRadius: 24, padding: 22, boxShadow: '0 12px 32px rgba(15,23,42,0.08)' };
const itemStyle: React.CSSProperties = { display: 'flex', gap: 12, justifyContent: 'space-between', padding: 14, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 18 };
const actionColumn: React.CSSProperties = { display: 'grid', gap: 8, alignContent: 'start' };
const actionRow: React.CSSProperties = { display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' };
const labelStyle: React.CSSProperties = { display: 'block', marginTop: 12, marginBottom: 6, fontWeight: 600 };
const inputStyle: React.CSSProperties = { width: '100%', border: '1px solid #cbd5e1', borderRadius: 14, padding: 12 };
const checkboxStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 };
const subtleStyle: React.CSSProperties = { color: '#64748b', fontSize: 14, marginTop: 4 };
const thumbStyle: React.CSSProperties = { width: 72, height: 72, objectFit: 'cover', borderRadius: 14 };
const primaryButton: React.CSSProperties = { border: 0, background: '#2563eb', color: 'white', borderRadius: 14, padding: '12px 16px', cursor: 'pointer' };
const secondaryButton: React.CSSProperties = { border: '1px solid #cbd5e1', background: 'white', borderRadius: 14, padding: '10px 14px', cursor: 'pointer' };
const dangerButton: React.CSSProperties = { border: 0, background: '#dc2626', color: 'white', borderRadius: 14, padding: '10px 14px', cursor: 'pointer' };
