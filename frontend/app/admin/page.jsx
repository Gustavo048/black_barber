'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AdminGuard from '@/components/admin/AdminGuard';
import FiltersBar from '@/components/admin/FiltersBar';
import SummaryCards from '@/components/admin/SummaryCards';
import ReportTables from '@/components/admin/ReportTables';
import BookingsTable from '@/components/admin/BookingsTable';
import { clearToken, fetchAdminBookings, fetchReportSummary, updateBookingStatus } from '@/lib/adminApi';
import { fetchServices, fetchBarbers } from '@/lib/api';
import { SERVICES as FALLBACK_SERVICES } from '@/data/services';
import { BARBERS as FALLBACK_BARBERS } from '@/data/barbers';

const INITIAL_FILTERS = { startDate: '', endDate: '', barberId: '', serviceId: '', status: '' };

function AdminDashboard() {
  const router = useRouter();

  const [services, setServices] = useState(FALLBACK_SERVICES);
  const [barbers, setBarbers] = useState(FALLBACK_BARBERS);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [bookings, setBookings] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchServices().then((d) => d.services?.length && setServices(d.services)).catch(() => {});
    fetchBarbers().then((d) => d.barbers?.length && setBarbers(d.barbers)).catch(() => {});
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [bookingsRes, summaryRes] = await Promise.all([
        fetchAdminBookings(filters),
        fetchReportSummary(filters),
      ]);
      setBookings(bookingsRes.bookings);
      setSummary(summaryRes);
    } catch (err) {
      if (err.message === 'SESSION_EXPIRED') {
        router.replace('/admin/login');
        return;
      }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters, router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleChangeStatus(id, status) {
    try {
      await updateBookingStatus(id, status);
      await loadData();
    } catch (err) {
      if (err.message === 'SESSION_EXPIRED') {
        router.replace('/admin/login');
        return;
      }
      setError(err.message);
    }
  }

  function handleLogout() {
    clearToken();
    router.replace('/admin/login');
  }

  return (
    <main className="min-h-screen bg-void px-6 md:px-10 py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl text-bone">Painel administrativo</h1>
            <p className="text-sm text-muted mt-1">Agendamentos, status e faturamento da Blackline Barbershop.</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="text-sm text-muted hover:text-cyan transition-colors border border-white/10 rounded-sm px-4 py-2"
          >
            Sair
          </button>
        </div>

        <FiltersBar filters={filters} onChange={setFilters} services={services} barbers={barbers} />

        {error && (
          <div className="rounded-sm border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-300">{error}</div>
        )}

        {loading ? (
          <p className="text-sm text-muted">Carregando...</p>
        ) : (
          <>
            <SummaryCards summary={summary} />
            <ReportTables summary={summary} />
            <BookingsTable bookings={bookings} onChangeStatus={handleChangeStatus} />
          </>
        )}
      </div>
    </main>
  );
}

export default function AdminPage() {
  return (
    <AdminGuard>
      <AdminDashboard />
    </AdminGuard>
  );
}
