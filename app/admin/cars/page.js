'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Eye, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  AlertCircle,
  CheckCircle2,
  XCircle,
  Search,
  Filter
} from 'lucide-react';
import { PageHeader, Card, Button, Input, Select, Badge, Table } from '@/app/admin/components/DesignSystem';

export default function CarsManagement() {
  const router = useRouter();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search, filter, sorting, pagination states
  const [search, setSearch] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterBodyType, setFilterBodyType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortField, setSortField] = useState('detailed_name');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch all cars
  const fetchCars = async () => {
    setLoading(true);
    try {
      const { data, error: dbError } = await supabase
        .from('cars')
        .select('*')
        .order('id', { ascending: false });

      if (dbError) throw dbError;
      setCars(data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch cars');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  // Actions
  const handleTogglePublish = async (car) => {
    const nextStatus = car.status === 'published' ? 'draft' : 'published';
    try {
      const { error: updateError } = await supabase
        .from('cars')
        .update({ status: nextStatus })
        .eq('id', car.id);

      if (updateError) throw updateError;
      
      setCars(cars.map(c => c.id === car.id ? { ...c, status: nextStatus } : c));
      
      // Activity Log
      await supabase.from('activity_logs').insert({
        admin_name: (await supabase.auth.getUser()).data.user?.email || 'admin',
        action: `Car Status Changed`,
        details: `${car.brand} ${car.model_name} set to ${nextStatus}`
      });
    } catch (err) {
      alert(err.message || 'Failed to toggle status');
    }
  };

  const handleDelete = async (carId, carName) => {
    if (!confirm(`Are you sure you want to delete ${carName}?`)) return;

    try {
      const { error: deleteError } = await supabase
        .from('cars')
        .delete()
        .eq('id', carId);

      if (deleteError) throw deleteError;

      setCars(cars.filter(c => c.id !== carId));
      
      // Activity Log
      await supabase.from('activity_logs').insert({
        admin_name: (await supabase.auth.getUser()).data.user?.email || 'admin',
        action: `Car Deleted`,
        details: `${carName} was deleted`
      });
    } catch (err) {
      alert(err.message || 'Failed to delete car');
    }
  };

  const handleDuplicate = async (car) => {
    try {
      const maxSerial = Math.max(...cars.map(c => c.serial_no || 0), 0) + 1;
      
      const { id, created_at, ...duplicateData } = car;
      const newCar = {
        ...duplicateData,
        serial_no: maxSerial,
        detailed_name: `${car.detailed_name} (Copy)`,
        model_name: `${car.model_name} (Copy)`,
        slug: car.slug ? `${car.slug}-copy` : undefined,
        status: 'draft'
      };

      const { data, error: insertError } = await supabase
        .from('cars')
        .insert(newCar)
        .select()
        .single();

      if (insertError) throw insertError;

      setCars([data, ...cars]);
      
      // Activity Log
      await supabase.from('activity_logs').insert({
        admin_name: (await supabase.auth.getUser()).data.user?.email || 'admin',
        action: `Car Added`,
        details: `Duplicated ${car.brand} ${car.model_name} as ${data.model_name}`
      });
    } catch (err) {
      alert(err.message || 'Failed to duplicate car');
    }
  };

  // Sorting helper
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Unique list of brands/bodyTypes
  const brands = [...new Set(cars.map(c => c.brand).filter(Boolean))].sort();
  const bodyTypes = [...new Set(cars.map(c => c.body_type).filter(Boolean))].sort();

  // Filtered & Sorted cars
  const filteredCars = cars
    .filter(car => {
      const matchSearch = 
        (car.brand || '').toLowerCase().includes(search.toLowerCase()) ||
        (car.model_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (car.detailed_name || '').toLowerCase().includes(search.toLowerCase());
      const matchBrand = !filterBrand || car.brand === filterBrand;
      const matchBodyType = !filterBodyType || car.body_type === filterBodyType;
      const matchStatus = !filterStatus || car.status === filterStatus;
      return matchSearch && matchBrand && matchBodyType && matchStatus;
    })
    .sort((a, b) => {
      let aVal = a[sortField] || '';
      let bVal = b[sortField] || '';
      
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  // Pagination helper
  const totalPages = Math.ceil(filteredCars.length / itemsPerPage);
  const paginatedCars = filteredCars.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const headerAction = (
    <Link href="/admin/cars/new">
      <Button variant="primary" size="medium" icon={Plus}>
        Add Car
      </Button>
    </Link>
  );

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader 
        title="EV Cars" 
        description="Manage specifications, details, and features of electric vehicles."
        action={headerAction}
      />

      {/* Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-900/20 border border-slate-900/80 rounded-2xl p-4">
        {/* Search */}
        <Input
          type="text"
          placeholder="Search brand, model..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          icon={Search}
        />

        {/* Brand Filter */}
        <Select
          value={filterBrand}
          onChange={(e) => { setFilterBrand(e.target.value); setCurrentPage(1); }}
        >
          <option value="" className="bg-slate-950 text-slate-400">All Brands</option>
          {brands.map(b => (
            <option key={b} value={b} className="bg-slate-950 text-white">{b}</option>
          ))}
        </Select>

        {/* Body Type Filter */}
        <Select
          value={filterBodyType}
          onChange={(e) => { setFilterBodyType(e.target.value); setCurrentPage(1); }}
        >
          <option value="" className="bg-slate-950 text-slate-400">All Body Types</option>
          {bodyTypes.map(bt => (
            <option key={bt} value={bt} className="bg-slate-950 text-white">{bt}</option>
          ))}
        </Select>

        {/* Status Filter */}
        <Select
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
        >
          <option value="" className="bg-slate-950 text-slate-400">All Statuses</option>
          <option value="published" className="bg-slate-950 text-white">Published</option>
          <option value="draft" className="bg-slate-950 text-white">Draft</option>
        </Select>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm font-semibold">{error}</span>
        </div>
      )}

      {/* Main Table view */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 bg-slate-900/10 border border-slate-900 rounded-2xl">
            <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
            <p className="text-xs text-slate-500 font-semibold tracking-wide">Fetching cars database...</p>
          </div>
        ) : paginatedCars.length === 0 ? (
          <div className="text-center py-24 text-slate-500 text-sm bg-slate-900/10 border border-slate-900 rounded-2xl font-medium">
            No vehicles matched your search filter.
          </div>
        ) : (
          <>
            <Table>
              <thead>
                <tr className="border-b border-slate-900 bg-slate-950/40 text-xs font-bold text-slate-400 uppercase tracking-wider sticky top-0 z-10">
                  <th className="p-4 pl-6 w-16">Image</th>
                  <th className="p-4 cursor-pointer hover:text-white select-none min-w-[200px]" onClick={() => handleSort('detailed_name')}>
                    <span className="flex items-center gap-1.5">Vehicle <ArrowUpDown className="w-3.5 h-3.5" /></span>
                  </th>
                  <th className="p-4 cursor-pointer hover:text-white select-none" onClick={() => handleSort('brand')}>
                    <span className="flex items-center gap-1.5">Brand <ArrowUpDown className="w-3.5 h-3.5" /></span>
                  </th>
                  <th className="p-4 cursor-pointer hover:text-white select-none" onClick={() => handleSort('body_type')}>
                    <span className="flex items-center gap-1.5">Body Type <ArrowUpDown className="w-3.5 h-3.5" /></span>
                  </th>
                  <th className="p-4 cursor-pointer hover:text-white select-none" onClick={() => handleSort('battery_capacity')}>
                    <span className="flex items-center gap-1.5">Battery <ArrowUpDown className="w-3.5 h-3.5" /></span>
                  </th>
                  <th className="p-4 cursor-pointer hover:text-white text-center select-none" onClick={() => handleSort('status')}>
                    <span className="flex items-center justify-center gap-1.5">Status <ArrowUpDown className="w-3.5 h-3.5" /></span>
                  </th>
                  <th className="p-4 pr-6 text-right w-40">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900 bg-slate-900/10">
                {paginatedCars.map((car, index) => (
                  <tr key={car.id} className={`hover:bg-slate-900/30 transition duration-150 group ${index % 2 === 1 ? 'bg-slate-950/10' : ''}`}>
                    <td className="p-4 pl-6">
                      {car.vehicle_image ? (
                        <img 
                          src={car.vehicle_image} 
                          alt={car.detailed_name} 
                          className="w-12 h-10 object-contain rounded-lg border border-slate-800 bg-slate-900/40"
                        />
                      ) : (
                        <div className="w-12 h-10 rounded-lg border border-slate-850 bg-slate-950/30 flex items-center justify-center text-[9px] font-extrabold text-slate-500 uppercase">EV</div>
                      )}
                    </td>
                    <td className="p-4 font-semibold text-white">
                      <div>
                        {car.detailed_name}
                        {car.variant_name && <p className="text-[10px] text-slate-500 font-normal mt-0.5">{car.variant_name}</p>}
                      </div>
                    </td>
                    <td className="p-4 font-medium text-slate-300">{car.brand}</td>
                    <td className="p-4 font-medium text-slate-400">{car.body_type || 'N/A'}</td>
                    <td className="p-4 font-medium text-slate-400">{car.battery_capacity || 'N/A'}</td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => handleTogglePublish(car)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider select-none cursor-pointer border transition-all ${
                          car.status === 'published' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' 
                            : 'bg-slate-900 text-slate-450 border-slate-800 hover:text-white'
                        }`}
                      >
                        {car.status === 'published' ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" /> Published
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" /> Draft
                          </>
                        )}
                      </button>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/cars/${car.brand?.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${(car.model_name || car.detailed_name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                          target="_blank"
                        >
                          <Button variant="ghost" size="small" className="p-1 text-slate-450 hover:text-white" title="Preview vehicle">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <button 
                          onClick={() => handleDuplicate(car)}
                          className="cursor-pointer"
                        >
                          <Button variant="ghost" size="small" className="p-1 text-slate-450 hover:text-white" title="Duplicate specification">
                            <Copy className="w-4 h-4" />
                          </Button>
                        </button>
                        <Link href={`/admin/cars/${car.id}`}>
                          <Button variant="ghost" size="small" className="p-1 text-slate-450 hover:text-blue-400" title="Edit specifications">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        <button 
                          onClick={() => handleDelete(car.id, car.detailed_name)}
                          className="cursor-pointer"
                        >
                          <Button variant="ghost" size="small" className="p-1 text-slate-450 hover:text-red-400" title="Delete record">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 bg-slate-900/20 border border-slate-900 rounded-2xl">
                <span className="text-xs text-slate-500 font-semibold">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredCars.length)} of {filteredCars.length} vehicles
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="small"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-xs text-white font-bold px-2">{currentPage} / {totalPages}</span>
                  <Button
                    variant="secondary"
                    size="small"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
