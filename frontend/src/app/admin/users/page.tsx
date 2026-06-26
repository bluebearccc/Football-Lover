'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { adminUsersApi } from '@/api/admin/users';
import type { AdminUser, UserStats, UserStatus } from '@/api/admin/types';
import { ApiError } from '@/api/client';
import { session } from '@/lib/session';
import { UserStatsCards } from '@/components/admin/users/UserStatsCards';
import { UserFilters } from '@/components/admin/users/UserFilters';
import { UserTable } from '@/components/admin/users/UserTable';
import { UserPagination } from '@/components/admin/users/UserPagination';
import { BanModal } from '@/components/admin/users/BanModal';
import { ConfirmModal } from '@/components/admin/users/ConfirmModal';
import { EditUserModal } from '@/components/admin/users/EditUserModal';

type ModalState =
  | { type: 'none' }
  | { type: 'ban'; user: AdminUser }
  | { type: 'unban'; user: AdminUser }
  | { type: 'edit'; user: AdminUser }
  | { type: 'resetPassword'; user: AdminUser };

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<UserStatus | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>({ type: 'none' });
  const [modalLoading, setModalLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const pageSize = 20;
  const currentAdminId = typeof window !== 'undefined' ? session.getUser()?.id ?? null : null;

  const loadUsers = useCallback(async (params: { search?: string; status?: UserStatus | null; page?: number }) => {
    try {
      const res = await adminUsersApi.list({
        search: params.search || undefined,
        status: params.status ?? undefined,
        page: params.page ?? 1,
        pageSize,
      });
      setUsers(res.items);
      setTotal(res.total);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Không tải được danh sách người dùng');
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const s = await adminUsersApi.getStats();
      setStats(s);
    } catch {
      // stats failure is non-critical
    }
  }, []);

  useEffect(() => {
    void loadUsers({ search, status: statusFilter, page });
    void loadStats();
  }, [page, statusFilter, loadUsers, loadStats]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSearchChange(value: string) {
    setSearch(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      void loadUsers({ search: value, status: statusFilter, page: 1 });
    }, 300);
  }

  function handleStatusChange(status: UserStatus | null) {
    setStatusFilter(status);
    setPage(1);
  }

  function handlePageChange(newPage: number) {
    setPage(newPage);
  }

  function clearMessages() {
    setError(null);
    setSuccess(null);
  }

  async function handleBan(reason: string) {
    if (modal.type !== 'ban') return;
    setModalLoading(true);
    clearMessages();
    try {
      await adminUsersApi.setStatus(modal.user.id, 'LOCKED', reason);
      setSuccess(`Đã khoá tài khoản ${modal.user.displayName}`);
      setModal({ type: 'none' });
      void loadUsers({ search, status: statusFilter, page });
      void loadStats();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Khoá tài khoản thất bại');
    } finally {
      setModalLoading(false);
    }
  }

  async function handleUnban() {
    if (modal.type !== 'unban') return;
    setModalLoading(true);
    clearMessages();
    try {
      await adminUsersApi.setStatus(modal.user.id, 'ACTIVE');
      setSuccess(`Đã mở khoá tài khoản ${modal.user.displayName}`);
      setModal({ type: 'none' });
      void loadUsers({ search, status: statusFilter, page });
      void loadStats();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Mở khoá tài khoản thất bại');
    } finally {
      setModalLoading(false);
    }
  }

  async function handleEdit(data: { displayName?: string; role?: string }) {
    if (modal.type !== 'edit') return;
    setModalLoading(true);
    clearMessages();
    try {
      await adminUsersApi.editUser(modal.user.id, data as { displayName?: string; role?: 'USER' | 'ADMIN' });
      setSuccess(`Đã cập nhật thông tin ${modal.user.displayName}`);
      setModal({ type: 'none' });
      void loadUsers({ search, status: statusFilter, page });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Cập nhật thất bại');
    } finally {
      setModalLoading(false);
    }
  }

  async function handleResetPassword() {
    if (modal.type !== 'resetPassword') return;
    setModalLoading(true);
    clearMessages();
    try {
      await adminUsersApi.resetPassword(modal.user.id);
      setSuccess(`Đã gửi email đặt lại mật khẩu cho ${modal.user.displayName}`);
      setModal({ type: 'none' });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Gửi email thất bại');
    } finally {
      setModalLoading(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-2">
            Quản lý người dùng
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Giám sát người dùng, theo dõi hiệu suất và duy trì tính toàn vẹn cộng đồng.
          </p>
        </div>
      </div>

      {/* Banners */}
      {error && (
        <div role="alert" className="mb-4 rounded-xl border border-tertiary/30 bg-tertiary/10 px-4 py-3 text-body-sm text-tertiary">
          {error}
        </div>
      )}
      {success && (
        <div role="status" className="mb-4 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-body-sm text-primary">
          {success}
        </div>
      )}

      {/* Stats */}
      <UserStatsCards stats={stats} />

      {/* Filters + Table + Pagination */}
      <UserFilters
        statusFilter={statusFilter}
        onStatusChange={handleStatusChange}
        search={search}
        onSearchChange={handleSearchChange}
      />
      <UserTable
        users={users}
        onBan={(user) => { clearMessages(); setModal({ type: 'ban', user }); }}
        onUnban={(user) => { clearMessages(); setModal({ type: 'unban', user }); }}
        onEdit={(user) => { clearMessages(); setModal({ type: 'edit', user }); }}
        onResetPassword={(user) => { clearMessages(); setModal({ type: 'resetPassword', user }); }}
      />
      <UserPagination page={page} pageSize={pageSize} total={total} onPageChange={handlePageChange} />

      {/* Modals */}
      <BanModal
        open={modal.type === 'ban'}
        userName={modal.type === 'ban' ? modal.user.displayName : ''}
        loading={modalLoading}
        onConfirm={handleBan}
        onCancel={() => setModal({ type: 'none' })}
      />
      <ConfirmModal
        open={modal.type === 'unban'}
        title="Mở khoá tài khoản"
        message={modal.type === 'unban' ? `Bạn có chắc chắn muốn mở khoá tài khoản ${modal.user.displayName}?` : ''}
        confirmLabel="Mở khoá"
        loading={modalLoading}
        onConfirm={handleUnban}
        onCancel={() => setModal({ type: 'none' })}
      />
      <EditUserModal
        open={modal.type === 'edit'}
        user={modal.type === 'edit' ? modal.user : null}
        currentAdminId={currentAdminId}
        loading={modalLoading}
        onSave={handleEdit}
        onCancel={() => setModal({ type: 'none' })}
      />
      <ConfirmModal
        open={modal.type === 'resetPassword'}
        title="Đặt lại mật khẩu"
        message={
          modal.type === 'resetPassword'
            ? `Gửi email đặt lại mật khẩu cho ${modal.user.displayName}?`
            : ''
        }
        confirmLabel="Gửi email"
        loading={modalLoading}
        onConfirm={handleResetPassword}
        onCancel={() => setModal({ type: 'none' })}
      />
    </div>
  );
}
