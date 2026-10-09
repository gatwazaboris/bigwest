'use client';

import { LocalizedInput, LocalizedTextarea } from '@/components/admin/forms/LocalizedFields';
import { MultiImageField } from '@/components/admin/forms/ImageField';
import { toEditableTour } from '@/lib/utils/site-normalizers';
import type { Tour, TourCategory } from '@/types/site';

export default function ToursManager({
  tours,
  form,
  editingId,
  saving,
  onFormChange,
  onEdit,
  onReset,
  onSave,
  onDelete,
}: {
  tours: Tour[];
  form: ReturnType<typeof toEditableTour>;
  editingId: string | null;
  saving: boolean;
  onFormChange: (value: ReturnType<typeof toEditableTour>) => void;
  onEdit: (tour: Tour) => void;
  onReset: () => void;
  onSave: () => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div style={gridStyle}>
      <section style={cardStyle}>
        <h2>{editingId ? 'Edit Tour' : 'Create Tour'}</h2>
        <LocalizedInput label="Name" value={form.name} onChange={(value) => onFormChange({ ...form, name: value })} />
        <LocalizedTextarea label="Description" value={form.description} onChange={(value) => onFormChange({ ...form, description: value })} />
        <LocalizedInput label="Duration" value={form.duration} onChange={(value) => onFormChange({ ...form, duration: value })} />
        <label style={labelStyle}>Category</label>
        <select style={inputStyle} value={form.category} onChange={(event) => onFormChange({ ...form, category: event.target.value as TourCategory })}>
          <option value="boat">Boat Tours</option>
          <option value="island">Island Visits</option>
          <option value="hiking">Hiking &amp; Walking</option>
          <option value="water">Water Activities</option>
        </select>
        <label style={labelStyle}>Price (USD)</label>
        <input style={inputStyle} type="number" min={0} value={form.priceUsd} onChange={(event) => onFormChange({ ...form, priceUsd: Number(event.target.value) || 0 })} />
        <label style={labelStyle}>Status</label>
        <select style={inputStyle} value={form.status} onChange={(event) => onFormChange({ ...form, status: event.target.value as Tour['status'] })}>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
        <label style={checkboxStyle}><input type="checkbox" checked={form.featured} onChange={(event) => onFormChange({ ...form, featured: event.target.checked })} /> Featured</label>
        <MultiImageField images={form.images} onChange={(images) => onFormChange({ ...form, images })} />
        <div style={actionRow}>
          <button style={primaryButton} disabled={saving} onClick={onSave}>{editingId ? 'Update Tour' : 'Create Tour'}</button>
          {editingId ? <button style={secondaryButton} onClick={onReset}>Cancel</button> : null}
        </div>
      </section>

      <section style={cardStyle}>
        <h2>All Tours</h2>
        <div style={{ display: 'grid', gap: 12 }}>
          {tours.map((tour) => (
            <article key={tour.id} style={itemStyle}>
              <div style={{ flex: 1 }}>
                <strong>{tour.name.en}</strong>
                <div style={subtleStyle}>{tour.category} • ${tour.priceUsd} • {tour.status}</div>
                <div style={subtleStyle}>{tour.images.length} images</div>
                {tour.images[0] ? <img src={tour.images[0]} alt={tour.name.en} style={previewStyle} /> : null}
              </div>
              <div style={actionColumn}>
                <button style={secondaryButton} onClick={() => onEdit(tour)}>Edit</button>
                <button style={dangerButton} onClick={() => onDelete(tour.id)}>Delete</button>
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
const previewStyle: React.CSSProperties = { width: 96, height: 96, objectFit: 'cover', borderRadius: 14, marginTop: 10 };
const primaryButton: React.CSSProperties = { border: 0, background: '#2563eb', color: 'white', borderRadius: 14, padding: '12px 16px', cursor: 'pointer' };
const secondaryButton: React.CSSProperties = { border: '1px solid #cbd5e1', background: 'white', borderRadius: 14, padding: '10px 14px', cursor: 'pointer' };
const dangerButton: React.CSSProperties = { border: 0, background: '#dc2626', color: 'white', borderRadius: 14, padding: '10px 14px', cursor: 'pointer' };
