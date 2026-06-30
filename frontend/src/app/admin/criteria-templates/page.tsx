'use client';

import { useCallback, useEffect, useState } from 'react';
import { adminCriterionTemplatesApi } from '@/api/admin/criterionTemplates';
import type { CriterionTemplate } from '@/api/admin/types';
import { ApiError } from '@/api/client';
import { Badge, Banner, Button, Card, TextInput } from '@/components/admin/ui';

export default function AdminCriteriaTemplatesPage() {
  const [items, setItems] = useState<CriterionTemplate[]>([]);
  const [form, setForm] = useState({ name: '', description: '' });
  const [editing, setEditing] = useState<{ id: string; name: string; description: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await adminCriterionTemplatesApi.list();
      setItems(res.items);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Không tải được danh sách tiêu chí mặc định');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function addTemplate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.name.trim()) return;
    try {
      await adminCriterionTemplatesApi.create({
        name: form.name.trim(),
        description: form.description.trim() || undefined,
      });
      setForm({ name: '', description: '' });
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Thêm tiêu chí mặc định thất bại');
    }
  }

  async function saveEdit() {
    if (!editing) return;
    setError(null);
    try {
      await adminCriterionTemplatesApi.update(editing.id, {
        name: editing.name.trim(),
        description: editing.description.trim() || undefined,
      });
      setEditing(null);
      setNotice('Đã cập nhật tiêu chí mặc định');
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Cập nhật thất bại');
    }
  }

  async function remove(id: string) {
    setError(null);
    try {
      await adminCriterionTemplatesApi.remove(id);
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Xoá thất bại');
    }
  }

  async function toggleActive(t: CriterionTemplate) {
    setError(null);
    try {
      if (t.isActive) {
        await adminCriterionTemplatesApi.deactivate(t.id);
      } else {
        await adminCriterionTemplatesApi.reactivate(t.id);
      }
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Cập nhật trạng thái thất bại');
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-on-surface">Tiêu chí mặc định</h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Quản lý bộ tiêu chí dự đoán dùng lại được. Khi tạo trận mới, vào trang chi tiết trận và bấm
          “Áp dụng tiêu chí mặc định” để thêm nhanh các tiêu chí đang hoạt động ở đây, thay vì nhập tay từng trận.
        </p>
      </div>

      <Banner message={error} />
      <Banner message={notice} tone="success" />

      <Card title="Thêm tiêu chí mặc định">
        <form onSubmit={addTemplate} className="flex flex-wrap items-end gap-2">
          <TextInput
            label="Tên tiêu chí"
            placeholder="vd: Đội ghi bàn trước"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="min-w-[220px] flex-1"
          />
          <TextInput
            label="Mô tả (tuỳ chọn)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="min-w-[220px] flex-1"
          />
          <Button type="submit">Thêm</Button>
        </form>
      </Card>

      <Card title="Danh sách">
        {items.length === 0 ? (
          <p className="text-sm text-on-surface-variant">Chưa có tiêu chí mặc định nào.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {items.map((t) => (
              <li
                key={t.id}
                className={`flex flex-wrap items-center justify-between gap-2 rounded-lg border border-outline-variant/30 px-3 py-2 text-sm${!t.isActive ? ' opacity-50' : ''}`}
              >
                {editing?.id === t.id ? (
                  <div className="flex flex-1 flex-wrap items-center gap-2">
                    <TextInput
                      placeholder="Tên tiêu chí"
                      value={editing.name}
                      onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                      className="flex-1"
                    />
                    <TextInput
                      placeholder="Mô tả (tuỳ chọn)"
                      value={editing.description}
                      onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                      className="flex-1"
                    />
                    <Button onClick={saveEdit}>Lưu</Button>
                    <Button variant="secondary" onClick={() => setEditing(null)}>Huỷ</Button>
                  </div>
                ) : (
                  <>
                    <span className="font-medium">
                      {t.name}
                      {t.description && <span className="ml-2 font-normal text-on-surface-variant">— {t.description}</span>}
                      {!t.isActive && <> <Badge tone="neutral">Đã ẩn</Badge></>}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => setEditing({ id: t.id, name: t.name, description: t.description ?? '' })}
                      >
                        Sửa
                      </Button>
                      <Button variant="secondary" onClick={() => toggleActive(t)}>
                        {t.isActive ? 'Ẩn' : 'Hiện lại'}
                      </Button>
                      <Button variant="danger" onClick={() => remove(t.id)}>
                        Xoá
                      </Button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
