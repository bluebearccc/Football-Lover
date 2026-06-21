'use client';

import { useCallback, useEffect, useState } from 'react';
import { adminUsersApi } from '@/api/admin/users';
import type { AdminUser, Role, UserStatus } from '@/api/admin/types';
import { ApiError } from '@/api/client';
import { Badge, Banner, Button, Card, TextInput } from '@/components/admin/ui';
import { formatDateTime } from '@/lib/format';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await adminUsersApi.list({ search: search || undefined, pageSize: 100 });
      setUsers(res.items);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Không tải được người dùng');
    }
  }, [search]);

  useEffect(() => {
    void load();
  }, [load]);

  async function setStatus(id: string, status: UserStatus) {
    setError(null);
    try {
      await adminUsersApi.setStatus(id, status);
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Cập nhật trạng thái thất bại');
    }
  }

  async function setRole(id: string, role: Role) {
    setError(null);
    try {
      await adminUsersApi.setRole(id, role);
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Cập nhật quyền thất bại');
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Quản lý người dùng</h1>
      <Banner message={error} />

      <Card
        title={`Người dùng (${users.length})`}
        action={<TextInput placeholder="Tìm theo email/tên…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-56" />}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 text-left text-ink-700">
                <th className="py-2">Tên hiển thị</th>
                <th>Email</th>
                <th>Quyền</th>
                <th>Trạng thái</th>
                <th>Điểm</th>
                <th>Tạo lúc</th>
                <th className="text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-ink-50">
                  <td className="py-2 font-medium">{u.displayName}</td>
                  <td>{u.email}</td>
                  <td>
                    <Badge tone={u.role === 'ADMIN' ? 'gold' : 'neutral'}>{u.role}</Badge>
                  </td>
                  <td>
                    <Badge tone={u.status === 'ACTIVE' ? 'green' : 'red'}>{u.status === 'ACTIVE' ? 'Hoạt động' : 'Khoá'}</Badge>
                  </td>
                  <td>{u.totalPoints}</td>
                  <td className="text-ink-700">{formatDateTime(u.createdAt)}</td>
                  <td className="py-2 text-right">
                    <div className="flex justify-end gap-2">
                      {u.status === 'ACTIVE' ? (
                        <Button variant="secondary" onClick={() => setStatus(u.id, 'LOCKED')}>
                          Khoá
                        </Button>
                      ) : (
                        <Button variant="secondary" onClick={() => setStatus(u.id, 'ACTIVE')}>
                          Mở khoá
                        </Button>
                      )}
                      {u.role === 'USER' ? (
                        <Button variant="ghost" onClick={() => setRole(u.id, 'ADMIN')}>
                          Cấp Admin
                        </Button>
                      ) : (
                        <Button variant="ghost" onClick={() => setRole(u.id, 'USER')}>
                          Hạ quyền
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-ink-700">
                    Không có người dùng.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
