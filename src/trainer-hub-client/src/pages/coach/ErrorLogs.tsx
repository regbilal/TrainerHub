import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AlertTriangle,
  Search,
  Loader2,
  ChevronDown,
  ChevronUp,
  Trash2,
  Filter,
  X,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Clock,
  Globe,
  FileCode,
} from 'lucide-react';
import api from '../../lib/api';
import type { ErrorLog, ErrorLogResponse } from '../../types';

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
const STATUS_CODES = [400, 401, 403, 404, 500];

export default function ErrorLogs() {
  const { t } = useTranslation();
  const [data, setData] = useState<ErrorLogResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const [search, setSearch] = useState('');
  const [exceptionType, setExceptionType] = useState('');
  const [statusCode, setStatusCode] = useState('');
  const [httpMethod, setHttpMethod] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, pageSize: 20 };
      if (search.trim()) params.search = search.trim();
      if (exceptionType.trim()) params.exceptionType = exceptionType.trim();
      if (statusCode) params.statusCode = Number(statusCode);
      if (httpMethod) params.httpMethod = httpMethod;
      if (dateFrom) params.from = new Date(dateFrom).toISOString();
      if (dateTo) params.to = new Date(dateTo + 'T23:59:59').toISOString();

      const res = await api.get<ErrorLogResponse>('/errorlogs', { params });
      setData(res.data);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [search, exceptionType, statusCode, httpMethod, dateFrom, dateTo, page]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  }

  function clearFilters() {
    setSearch('');
    setExceptionType('');
    setStatusCode('');
    setHttpMethod('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  }

  async function handleDelete(id: string) {
    try {
      await api.delete(`/errorlogs/${id}`);
      fetchLogs();
    } catch { /* ignore */ }
  }

  async function handleDeleteAll() {
    if (!confirm('Delete all error logs?')) return;
    try {
      await api.delete('/errorlogs');
      fetchLogs();
    } catch { /* ignore */ }
  }

  const totalPages = data ? Math.ceil(data.totalCount / data.pageSize) : 0;
  const hasActiveFilters = exceptionType || statusCode || httpMethod || dateFrom || dateTo;

  function methodColor(method?: string) {
    switch (method) {
      case 'GET': return 'bg-blue-50 text-blue-700';
      case 'POST': return 'bg-green-50 text-green-700';
      case 'PUT': return 'bg-amber-50 text-amber-700';
      case 'DELETE': return 'bg-red-50 text-red-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  }

  function statusColor(code?: number) {
    if (!code) return 'bg-gray-100 text-gray-600';
    if (code >= 500) return 'bg-red-100 text-red-700';
    if (code >= 400) return 'bg-amber-100 text-amber-700';
    return 'bg-gray-100 text-gray-600';
  }

  function shortType(type?: string) {
    if (!type) return '';
    const parts = type.split('.');
    return parts[parts.length - 1];
  }

  function formatDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
  }

  function timeSince(iso: string) {
    const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <h1 className="text-xl font-bold text-gray-900">Error Logs</h1>
          {data && (
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
              {data.totalCount} total
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchLogs()}
            className="p-2 text-gray-400 hover:text-teal-600 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          {data && data.totalCount > 0 && (
            <button
              onClick={handleDeleteAll}
              className="inline-flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="Search by message, path, or request body..."
          />
        </div>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={`inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
            hasActiveFilters
              ? 'border-teal-300 bg-teal-50 text-teal-700'
              : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Filter className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="bg-teal-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              {[exceptionType, statusCode, httpMethod, dateFrom, dateTo].filter(Boolean).length}
            </span>
          )}
        </button>
        <button
          type="submit"
          className="bg-teal-500 text-white px-4 rounded-xl font-medium text-sm hover:bg-teal-600 transition-colors"
        >
          Search
        </button>
      </form>

      {/* Filters panel */}
      {showFilters && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Filters</span>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-red-500 hover:text-red-700 inline-flex items-center gap-1"
              >
                <X className="h-3 w-3" />
                Clear all
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">HTTP Method</label>
              <select
                value={httpMethod}
                onChange={(e) => { setHttpMethod(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">All</option>
                {HTTP_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Status Code</label>
              <select
                value={statusCode}
                onChange={(e) => { setStatusCode(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">All</option>
                {STATUS_CODES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Exception Type</label>
              <input
                type="text"
                value={exceptionType}
                onChange={(e) => { setExceptionType(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="e.g. NullReference"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Date From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Date To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
        </div>
      )}

      {/* Empty state */}
      {!loading && data && data.items.length === 0 && (
        <div className="text-center py-16">
          <AlertTriangle className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            {hasActiveFilters || search ? 'No errors match your filters' : 'No errors logged'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {hasActiveFilters || search
              ? 'Try adjusting your search or filters.'
              : 'Errors will appear here when they occur.'}
          </p>
        </div>
      )}

      {/* Error list */}
      {!loading && data && data.items.length > 0 && (
        <div className="space-y-2">
          {data.items.map((log) => (
            <div
              key={log.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            >
              {/* Summary row */}
              <button
                type="button"
                onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                className="w-full text-left p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="shrink-0 mt-0.5">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${statusColor(log.statusCode)}`}>
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {log.httpMethod && (
                        <span className={`text-xs font-mono font-medium px-1.5 py-0.5 rounded ${methodColor(log.httpMethod)}`}>
                          {log.httpMethod}
                        </span>
                      )}
                      {log.requestPath && (
                        <span className="text-sm font-mono text-gray-700 truncate">
                          {log.requestPath}
                        </span>
                      )}
                      {log.statusCode && (
                        <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${statusColor(log.statusCode)}`}>
                          {log.statusCode}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate">{log.message}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {timeSince(log.occurredAt)}
                      </span>
                      {log.exceptionType && (
                        <span className="inline-flex items-center gap-1">
                          <FileCode className="h-3 w-3" />
                          {shortType(log.exceptionType)}
                        </span>
                      )}
                      {log.clientIpAddress && (
                        <span className="inline-flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          {log.clientIpAddress}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleDelete(log.id); }}
                      className="p-1.5 text-gray-300 hover:text-red-500 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    {expandedId === log.id ? (
                      <ChevronUp className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </div>
              </button>

              {/* Expanded detail */}
              {expandedId === log.id && (
                <div className="border-t border-gray-100 bg-gray-50 p-4 space-y-4">
                  <DetailSection title="Timestamp" value={formatDate(log.occurredAt)} />
                  <DetailSection title="Exception Type" value={log.exceptionType} mono />
                  <DetailSection title="Message" value={log.message} />
                  {log.innerExceptionMessage && (
                    <DetailSection title="Inner Exception" value={log.innerExceptionMessage} />
                  )}
                  {log.queryString && (
                    <DetailSection title="Query String" value={log.queryString} mono />
                  )}
                  {log.requestBody && (
                    <div>
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Request Body</span>
                      <pre className="mt-1 text-xs bg-white border border-gray-200 rounded-lg p-3 overflow-x-auto font-mono text-gray-700 max-h-48">
                        {tryFormatJson(log.requestBody)}
                      </pre>
                    </div>
                  )}
                  {log.stackTrace && (
                    <div>
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Stack Trace</span>
                      <pre className="mt-1 text-xs bg-gray-900 text-green-400 rounded-lg p-3 overflow-x-auto font-mono max-h-64 leading-relaxed">
                        {log.stackTrace}
                      </pre>
                    </div>
                  )}
                  {log.userId && <DetailSection title="User ID" value={log.userId} mono />}
                  {log.clientIpAddress && <DetailSection title="Client IP" value={log.clientIpAddress} mono />}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && data && totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-sm text-gray-500">
            Page {data.page} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailSection({ title, value, mono }: { title: string; value?: string | null; mono?: boolean }) {
  if (!value) return null;
  return (
    <div>
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{title}</span>
      <p className={`mt-0.5 text-sm text-gray-700 break-all ${mono ? 'font-mono' : ''}`}>{value}</p>
    </div>
  );
}

function tryFormatJson(str: string): string {
  try {
    return JSON.stringify(JSON.parse(str), null, 2);
  } catch {
    return str;
  }
}
