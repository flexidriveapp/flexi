'use client';
import { useState, useEffect } from 'react';
import { Plus, X, Tag } from 'lucide-react';
import { createClient } from '@/lib/supabase';

type CategoryMap = Record<string, { id: string, value: string }[]>;

const CategorySection = ({ title, desc, catKey, categories, newItems, setNewItems, handleAddItem, handleRemoveItem }: { title: string, desc: string, catKey: string, categories: CategoryMap, newItems: Record<string, string>, setNewItems: (val: Record<string, string>) => void, handleAddItem: (e: React.FormEvent, key: string) => void, handleRemoveItem: (key: string, id: string) => void }) => (
  <div className="card" style={{ padding: 24, marginBottom: 24 }}>
    <div style={{ marginBottom: 16 }}>
      <h3 style={{ fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Tag size={18} color="var(--primary)" /> {title}
      </h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>{desc}</p>
    </div>

    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
      {categories[catKey]?.map(item => (
        <div key={item.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f8fafc', border: '1px solid var(--border-light)', padding: '6px 12px', borderRadius: 999, fontSize: 13, fontWeight: 600 }}>
          {item.value}
          <button 
            type="button"
            onClick={() => handleRemoveItem(catKey, item.id)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'var(--text-secondary)' }}
          >
            <X size={14} />
          </button>
        </div>
      ))}
      {(!categories[catKey] || categories[catKey].length === 0) && (
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontStyle: 'italic' }}>No options defined yet.</div>
      )}
    </div>

    <form onSubmit={(e) => handleAddItem(e, catKey)} style={{ display: 'flex', gap: 12, maxWidth: 400 }}>
      <input 
        type="text" 
        placeholder={`Add new ${title.toLowerCase().slice(0, -1)}...`} 
        value={newItems[catKey]}
        onChange={e => setNewItems({...newItems, [catKey]: e.target.value})}
        style={{ flex: 1, padding: '10px 14px', border: '1px solid var(--border-light)', borderRadius: 8, fontSize: 14 }}
      />
      <button type="submit" className="btn" style={{ padding: '0 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
        <Plus size={16} /> Add
      </button>
    </form>
  </div>
);

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryMap | null>(null);
  const [newItems, setNewItems] = useState<Record<string, string>>({
    make: '', model: '', fuel: '', transmission: '', body_type: ''
  });

  const loadCategories = async () => {
    const supabase = createClient();
    const { data } = await supabase.from('vehicle_categories').select('*').eq('is_active', true);
    if (data) {
      const map: CategoryMap = { make: [], model: [], fuel: [], transmission: [], body_type: [] };
      data.forEach(c => {
        if (!map[c.type]) map[c.type] = [];
        map[c.type].push({ id: c.id, value: c.value });
      });
      setCategories(map);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleAddItem = async (e: React.FormEvent, key: string) => {
    e.preventDefault();
    if (!categories || !newItems[key].trim()) return;

    const val = newItems[key].trim();
    if (categories[key]?.some(i => i.value.toLowerCase() === val.toLowerCase())) return;

    const supabase = createClient();
    await supabase.from('vehicle_categories').insert({ type: key, value: val, is_active: true });
    
    setNewItems({ ...newItems, [key]: '' });
    loadCategories();
  };

  const handleRemoveItem = async (key: string, id: string) => {
    if (!categories) return;
    const supabase = createClient();
    await supabase.from('vehicle_categories').delete().eq('id', id);
    loadCategories();
  };

  if (!categories) return null;

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>Vehicle Categories</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage the dropdown options available when adding new vehicles</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
        <div>
          <CategorySection title="Car Makes" desc="The manufacturer brands available on the platform." catKey="make" categories={categories} newItems={newItems} setNewItems={setNewItems} handleAddItem={handleAddItem} handleRemoveItem={handleRemoveItem} />
          <CategorySection title="Car Models" desc="The specific models of cars available." catKey="model" categories={categories} newItems={newItems} setNewItems={setNewItems} handleAddItem={handleAddItem} handleRemoveItem={handleRemoveItem} />
        </div>
        <div>
          <CategorySection title="Fuel Types" desc="Available energy sources for the vehicles." catKey="fuel" categories={categories} newItems={newItems} setNewItems={setNewItems} handleAddItem={handleAddItem} handleRemoveItem={handleRemoveItem} />
          <CategorySection title="Transmissions" desc="Gearbox types available." catKey="transmission" categories={categories} newItems={newItems} setNewItems={setNewItems} handleAddItem={handleAddItem} handleRemoveItem={handleRemoveItem} />
          <CategorySection title="Car Types" desc="Body styles of the vehicles." catKey="body_type" categories={categories} newItems={newItems} setNewItems={setNewItems} handleAddItem={handleAddItem} handleRemoveItem={handleRemoveItem} />
        </div>
      </div>
    </div>
  );
}
