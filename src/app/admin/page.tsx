import AdminDashboard from '@/components/admin/AdminDashboard';
import Navbar from '@/components/ui/Navbar';

export default function AdminPage() {
  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100 flex flex-col pb-12">
      {/* Navigation */}
      <Navbar />

      {/* Main Admin Console */}
      <main className="flex-grow">
        <AdminDashboard />
      </main>
    </div>
  );
}
export const dynamic = 'force-dynamic';
