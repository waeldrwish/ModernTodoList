"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import NavBar from "@/components/NavBar";
import { KanbanBoard } from "@/components/Kanban";
import {
  createTask,
  deleteTask,
  listTasks,
  me,
  Task,
  toggleTask,
  updateTask,
  getStoredToken,
} from "@/lib/api";

export default function TasksPage() {
  const router = useRouter();
  const [userName, setUserName] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);

  // Create form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<string>("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [importance, setImportance] = useState<"normal" | "important" | "critical">("normal");

  // Filters and view state
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "completed">("all");
  const [priorityFilter, setPriorityFilter] = useState<"all" | "low" | "medium" | "high">("all");
  const [importanceFilter, setImportanceFilter] = useState<"all" | "normal" | "important" | "critical">("all");
  const [sortBy, setSortBy] = useState<
    "createdAt" | "updatedAt" | "dueDate" | "title" | "priority" | "importance" | "status" | "completed"
  >("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<"list" | "board">("list");
  const [editing, setEditing] = useState<Task | null>(null);

  // Initial auth + first load
  useEffect(() => {
    async function init() {
      const token = getStoredToken();
      let user = null;
      try {
        user = await me();
      } catch {}
      if (!token && !user) {
        router.replace("/login");
        return;
      }
      setUserName(user?.name);
      await refreshTasks();
      setLoading(false);
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  // Load saved filters/view
  useEffect(() => {
    try {
      const saved = typeof window !== "undefined" ? window.localStorage.getItem("todo_filters") : null;
      if (saved) {
        const obj = JSON.parse(saved);
        if (typeof obj.q === "string") setQuery(obj.q);
        if (obj.statusFilter) setStatusFilter(obj.statusFilter);
        if (obj.priorityFilter) setPriorityFilter(obj.priorityFilter);
        if (obj.importanceFilter) setImportanceFilter(obj.importanceFilter);
        if (obj.sortBy) setSortBy(obj.sortBy);
        if (obj.sortOrder) setSortOrder(obj.sortOrder);
        if (obj.viewMode) setViewMode(obj.viewMode);
      }
    } catch {}
  }, []);

  // Persist filters
  useEffect(() => {
    try {
      const obj = { q: query, statusFilter, priorityFilter, importanceFilter, sortBy, sortOrder, viewMode };
      if (typeof window !== "undefined")
        window.localStorage.setItem("todo_filters", JSON.stringify(obj));
    } catch {}
  }, [query, statusFilter, priorityFilter, importanceFilter, sortBy, sortOrder, viewMode]);

  async function refreshTasks() {
    try {
      const opts: any = { q: query || undefined, sortBy, sortOrder };
      if (statusFilter === "pending") opts.completed = false;
      else if (statusFilter === "completed") opts.completed = true;
      if (priorityFilter !== "all") opts.priority = priorityFilter;
      if (importanceFilter !== "all") opts.importance = importanceFilter;
      const data = await listTasks(opts);
      setTasks(data);
    } catch (err: any) {
      setError(err?.message || "تعذر تحميل المهام");
    }
  }

  // Refetch when filters change (after first load)
  useEffect(() => {
    if (!userName) return;
    refreshTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, statusFilter, priorityFilter, importanceFilter, sortBy, sortOrder]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      const t = await createTask({
        title: title.trim(),
        description: description.trim(),
        dueDate: dueDate || undefined,
        priority,
        importance,
      });
      setTasks((prev) => [t, ...prev]);
      setTitle("");
      setDescription("");
      setDueDate("");
      setPriority("medium");
      setImportance("normal");
    } catch (err: any) {
      setError(err?.message || "تعذر إضافة المهمة");
    }
  }

  async function handleToggle(id: string) {
    try {
      const updated = await toggleTask(id);
      setTasks((prev) => prev.map((t) => (t._id === id ? updated : t)));
    } catch (err: any) {
      setError(err?.message || "تعذر تحديث المهمة");
    }
  }

  async function handleDelete(id: string) {
    const ok = confirm("حذف المهمة؟");
    if (!ok) return;
    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => t._id !== id));
    } catch (err: any) {
      setError(err?.message || "تعذر حذف المهمة");
    }
  }

  const completedCount = useMemo(() => tasks.filter((t) => t.completed).length, [tasks]);
  const pendingCount = useMemo(() => tasks.filter((t) => !t.completed).length, [tasks]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/30 pb-12">
      <NavBar userName={userName} />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Cards summary */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 p-6 shadow-lg shadow-primary-600/20">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10"></div>
            <div className="relative">
              <div className="text-sm font-medium text-primary-100">إجمالي المهام</div>
              <div className="mt-2 text-3xl font-bold text-white">{tasks.length}</div>
            </div>
          </div>
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 p-6 shadow-lg shadow-amber-600/20">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10"></div>
            <div className="relative">
              <div className="text-sm font-medium text-amber-100">قيد العمل</div>
              <div className="mt-2 text-3xl font-bold text-white">{pendingCount}</div>
            </div>
          </div>
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 to-green-600 p-6 shadow-lg shadow-green-600/20">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10"></div>
            <div className="relative">
              <div className="text-sm font-medium text-green-100">منتهية</div>
              <div className="mt-2 text-3xl font-bold text-white">{completedCount}</div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl bg-gradient-to-r from-red-50 to-red-100/50 p-4 ring-1 ring-red-200/50">
            <svg className="h-5 w-5 flex-shrink-0 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1"><p className="text-sm font-medium text-red-800">{error}</p></div>
            <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Create task */}
        <section className="mb-8 overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-gray-200">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
            <h2 className="flex items-center gap-2 text-xl font-bold text-white">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              إضافة مهمة جديدة
            </h2>
          </div>
          <form onSubmit={handleCreate} className="grid gap-5 p-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">عنوان المهمة</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: مراجعة كود"
                required
                className="block w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-100"
              />
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">الأولوية</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="block w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-100"
                >
                  <option value="low">منخفضة</option>
                  <option value="medium">متوسطة</option>
                  <option value="high">مرتفعة</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">الأهمية</label>
                <select
                  value={importance}
                  onChange={(e) => setImportance(e.target.value as any)}
                  className="block w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-100"
                >
                  <option value="normal">عادي</option>
                  <option value="important">مهم</option>
                  <option value="critical">حرِج</option>
                </select>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">الوصف</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="تفاصيل إضافية (اختياري)"
                className="block w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-100"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">تاريخ الاستحقاق</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="block w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-100"
              />
            </div>
            <div className="flex items-center justify-end">
              <button
                type="submit"
                className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-3 font-semibold text-white shadow-lg shadow-primary-600/30 transition-all hover:shadow-xl hover:shadow-primary-600/40 focus:outline-none focus:ring-4 focus:ring-primary-300"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                إضافة المهمة
              </button>
            </div>
          </form>
        </section>

        {/* Filters and results bar */}
        {tasks.length > 0 && (
          <>
            <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <div className="sm:col-span-2">
                <div className="relative">
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="ابحث بالعنوان أو الوصف..."
                    className="block w-full rounded-xl border-2 border-gray-200 bg-gray-50 py-3 pr-11 pl-4 text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-100"
                  />
                  <svg className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="rounded-xl border-2 border-gray-200 bg-gray-50 py-3 px-3 text-sm text-gray-900 focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-100"
              >
                <option value="all">كل الحالات</option>
                <option value="pending">قيد العمل</option>
                <option value="completed">منتهية</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as any)}
                className="rounded-xl border-2 border-gray-200 bg-gray-50 py-3 px-3 text-sm text-gray-900 focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-100"
              >
                <option value="all">كل الأولويات</option>
                <option value="low">منخفضة</option>
                <option value="medium">متوسطة</option>
                <option value="high">مرتفعة</option>
              </select>
              <select
                value={importanceFilter}
                onChange={(e) => setImportanceFilter(e.target.value as any)}
                className="rounded-xl border-2 border-gray-200 bg-gray-50 py-3 px-3 text-sm text-gray-900 focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-100"
              >
                <option value="all">كل الأهميات</option>
                <option value="normal">عادية</option>
                <option value="important">مهمة</option>
                <option value="critical">حرِجة</option>
              </select>
            </div>

            <div className="mb-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700">ترتيب حسب</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="rounded-xl border-2 border-gray-200 bg-gray-50 py-2 px-3 text-sm text-gray-900 focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-100"
                >
                  <option value="createdAt">الأحدث</option>
                  <option value="updatedAt">آخر تعديل</option>
                  <option value="dueDate">تاريخ الاستحقاق</option>
                  <option value="title">العنوان</option>
                  <option value="priority">الأولوية</option>
                  <option value="importance">الأهمية</option>
                  <option value="status">الحالة</option>
                </select>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as any)}
                  className="rounded-xl border-2 border-gray-200 bg-gray-50 py-2 px-3 text-sm text-gray-900 focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-100"
                >
                  <option value="desc">تنازلي</option>
                  <option value="asc">تصاعدي</option>
                </select>
              </div>
              <div className="flex items-center justify-end lg:justify-start">
                <div className="inline-flex overflow-hidden rounded-xl ring-1 ring-gray-200">
                  <button
                    onClick={() => setViewMode("list")}
                    className={`px-3 py-2 text-sm ${
                      viewMode === "list" ? "bg-primary-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    قائمة
                  </button>
                  <button
                    onClick={() => setViewMode("board")}
                    className={`px-3 py-2 text-sm ${
                      viewMode === "board" ? "bg-primary-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    كانبان
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-end text-sm text-gray-600">
                <button
                  onClick={() => {
                    setQuery("");
                    setStatusFilter("all");
                    setPriorityFilter("all");
                    setImportanceFilter("all");
                  }}
                  className="rounded-lg px-3 py-1 text-primary-700 ring-1 ring-primary-200 hover:bg-primary-50"
                >
                  مسح الفلاتر
                </button>
              </div>
            </div>
          </>
        )}

        {/* List or Board */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 animate-spin text-primary-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="mt-4 text-sm text-gray-600">جار التحميل...</p>
            </div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-300 bg-gray-50/50 py-16">
            <svg className="h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="mt-4 text-lg font-medium text-gray-900">لا توجد مهام بعد</p>
            <p className="mt-1 text-sm text-gray-500">ابدأ بإضافة أول مهمة لك</p>
          </div>
        ) : viewMode === "board" ? (
          <KanbanBoard
            tasks={tasks}
            onMove={async (id, newStatus) => {
              const updated = await updateTask(id, { status: newStatus, completed: newStatus === "done" });
              setTasks((prev) => prev.map((x) => (x._id === updated._id ? updated : x)));
            }}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onEdit={(task) => setEditing(task)}
            sortBy={sortBy}
            sortOrder={sortOrder}
          />
        ) : (
          <div className="grid gap-4">
            {tasks.map((t) => (
              <div
                key={t._id}
                className={`group relative overflow-hidden rounded-2xl border-2 bg-white p-5 shadow-md transition-all hover:shadow-xl ${
                  t.completed ? "border-green-200 bg-green-50/30" : "border-gray-200 hover:border-primary-300"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className={`text-base font-semibold ${t.completed ? "line-through text-gray-500" : "text-gray-900"}`}>{t.title}</div>
                    {t.description ? <div className="mt-1 text-sm text-gray-600">{t.description}</div> : null}
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {t.dueDate ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700">
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(t.dueDate).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })}
                        </span>
                      ) : null}
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
                        (t.priority ?? "medium") === "high"
                          ? "bg-red-50 text-red-700 ring-red-200"
                          : (t.priority ?? "medium") === "low"
                          ? "bg-amber-50 text-amber-800 ring-amber-200"
                          : "bg-blue-50 text-blue-700 ring-blue-200"
                      }`}
                      >
                        أولوية: {(t.priority ?? "medium") === "high" ? "مرتفعة" : (t.priority ?? "medium") === "low" ? "منخفضة" : "متوسطة"}
                      </span>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
                        (t.importance ?? "normal") === "critical"
                          ? "bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200"
                          : (t.importance ?? "normal") === "important"
                          ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                          : "bg-gray-50 text-gray-700 ring-gray-200"
                      }`}
                      >
                        أهمية: {(t.importance ?? "normal") === "critical" ? "حرِجة" : (t.importance ?? "normal") === "important" ? "مهمة" : "عادية"}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      onClick={() => handleToggle(t._id)}
                      className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-medium text-primary-700 ring-1 ring-inset ring-primary-200 hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-400"
                    >
                      {t.completed ? "إلغاء الإكمال" : "إكمال"}
                    </button>
                    <button
                      onClick={() => setEditing(t)}
                      className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-400"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => handleDelete(t._id)}
                      className="inline-flex items-center justify-center rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {editing && (
          <EditModal
            task={editing}
            onClose={() => setEditing(null)}
            onSaved={(updated) => {
              setTasks((prev) => prev.map((x) => (x._id === updated._id ? updated : x)));
              setEditing(null);
            }}
          />
        )}
      </div>
    </main>
  );
}

function EditModal({ task, onClose, onSaved }: { task: Task; onClose: () => void; onSaved: (t: Task) => void }) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [dueDate, setDueDate] = useState<string>(task.dueDate ? task.dueDate.substring(0, 10) : "");
  const [priority, setPriority] = useState<"low" | "medium" | "high">((task.priority ?? "medium") as any);
  const [importance, setImportance] = useState<"normal" | "important" | "critical">((task.importance ?? "normal") as any);
  const [status, setStatus] = useState<"todo" | "in_progress" | "done">((task.status ?? (task.completed ? "done" : "todo")) as any);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const updated = await updateTask(task._id, {
        title: title.trim(),
        description: description.trim(),
        dueDate: dueDate || null,
        priority,
        importance,
        status,
        completed: status === "done" ? true : undefined,
      });
      onSaved(updated);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-gray-200">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
          <h3 className="text-lg font-semibold text-white">تعديل المهمة</h3>
        </div>
        <div className="space-y-4 p-6">
          <div>
            <label className="mb-1 block text-sm text-gray-700">العنوان</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="block w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-3 py-2 text-gray-900 focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-100" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-700">الوصف</label>
            <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="block w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-3 py-2 text-gray-900 focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-100" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-gray-700">الأولوية</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value as any)} className="block w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-3 py-2 text-gray-900 focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-100">
                <option value="low">منخفضة</option>
                <option value="medium">متوسطة</option>
                <option value="high">مرتفعة</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-700">الأهمية</label>
              <select value={importance} onChange={(e) => setImportance(e.target.value as any)} className="block w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-3 py-2 text-gray-900 focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-100">
                <option value="normal">عادي</option>
                <option value="important">مهم</option>
                <option value="critical">حرِج</option>
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-700">تاريخ الاستحقاق</label>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="block w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-3 py-2 text-gray-900 focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-100" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-700">الحالة</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="block w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-3 py-2 text-gray-900 focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-100">
              <option value="todo">قائمة</option>
              <option value="in_progress">قيد التنفيذ</option>
              <option value="done">منتهية</option>
            </select>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 bg-gray-50 px-6 py-4">
          <button onClick={onClose} className="rounded-xl bg-white px-5 py-2 text-sm font-medium text-gray-700 ring-1 ring-gray-300 hover:bg-gray-100">إلغاء</button>
          <button disabled={saving || !title.trim()} onClick={save} className="rounded-xl bg-primary-600 px-6 py-2 text-sm font-medium text-white shadow-md hover:bg-primary-700 disabled:opacity-50">{saving ? "..." : "حفظ"}</button>
        </div>
      </div>
    </div>
  );
}
