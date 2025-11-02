"use client";

import { closestCenter, DndContext, DragEndEvent, PointerSensor, useDroppable, useDraggable, useSensor, useSensors } from "@dnd-kit/core";
import type { Task } from "@/lib/api";

export function KanbanBoard({ tasks, onMove, onToggle, onDelete, onEdit, sortBy = "createdAt", sortOrder = "desc" }: { tasks: Task[]; onMove: (id: string, status: "todo"|"in_progress"|"done") => void | Promise<void>; onToggle: (id: string) => void; onDelete: (id: string) => void; onEdit: (task: Task) => void; sortBy?: "createdAt" | "updatedAt" | "dueDate" | "title" | "priority" | "importance" | "status" | "completed"; sortOrder?: "asc" | "desc"; }) {
  const sensors = useSensors(useSensor(PointerSensor));
  const columns: Array<{ id: "todo"|"in_progress"|"done"; title: string; color: string }> = [
    { id: "todo", title: "قائمة", color: "border-gray-200" },
    { id: "in_progress", title: "قيد التنفيذ", color: "border-amber-200" },
    { id: "done", title: "منتهية", color: "border-green-200" },
  ];

  const priorityRank: Record<NonNullable<Task["priority"]>, number> = { low: 1, medium: 2, high: 3 } as const;
  const importanceRank: Record<NonNullable<Task["importance"]>, number> = { normal: 1, important: 2, critical: 3 } as const;
  const statusRank: Record<"todo"|"in_progress"|"done", number> = { todo: 1, in_progress: 2, done: 3 };

  function valueOf(t: Task) {
    switch (sortBy) {
      case "dueDate":
        return t.dueDate ? new Date(t.dueDate).getTime() : (sortOrder === "asc" ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY);
      case "priority":
        return priorityRank[(t.priority ?? "medium") as "low"|"medium"|"high"];
      case "importance":
        return importanceRank[(t.importance ?? "normal") as "normal"|"important"|"critical"];
      case "title":
        return (t.title || "").toLowerCase();
      case "updatedAt":
        return t.updatedAt ? new Date(t.updatedAt).getTime() : 0;
      case "status":
        return statusRank[(t.status ?? (t.completed ? "done" : "todo")) as "todo"|"in_progress"|"done"];
      case "completed":
        return t.completed ? 1 : 0;
      case "createdAt":
      default:
        return t.createdAt ? new Date(t.createdAt).getTime() : 0;
    }
  }

  function sortTasks(arr: Task[]) {
    return [...arr].sort((a, b) => {
      const va = valueOf(a);
      const vb = valueOf(b);
      if (typeof va === "string" && typeof vb === "string") {
        const r = va.localeCompare(vb);
        return sortOrder === "asc" ? r : -r;
      }
      const r = (va as number) - (vb as number);
      return sortOrder === "asc" ? r : -r;
    });
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={async (event: DragEndEvent) => {
      const overId = (event.over?.id as string) || undefined;
      const activeId = (event.active?.id as string) || undefined;
      if (!overId || !activeId) return;
      if (overId === 'todo' || overId === 'in_progress' || overId === 'done') {
        await onMove(activeId, overId);
      }
    }}>
      <div className="grid gap-4 md:grid-cols-3">
        {columns.map(col => {
          const items = sortTasks(tasks.filter(t => (t.status ?? (t.completed ? 'done' : 'todo')) === col.id));
          return (
          <KanbanColumn key={col.id} id={col.id} title={col.title} color={col.color} count={items.length}>
            {items.map(t => (
              <KanbanCard key={t._id} task={t} onToggle={onToggle} onDelete={onDelete} onEdit={onEdit} />
            ))}
          </KanbanColumn>
        ); })}
      </div>
    </DndContext>
  );
}

function KanbanColumn({ id, title, color, count, children }: { id: "todo"|"in_progress"|"done"; title: string; color: string; count: number; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div className={`overflow-hidden rounded-2xl border-2 bg-white shadow ${color} ${isOver ? 'ring-2 ring-primary-300' : ''}`}>
      <div className="flex items-center justify-between bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700">
        <span>{title}</span>
        <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700">{count}</span>
      </div>
      <div ref={setNodeRef} className="min-h-[200px] space-y-3 p-4">
        {children}
      </div>
    </div>
  );
}

function KanbanCard({ task, onToggle, onDelete, onEdit }: { task: Task; onToggle: (id: string) => void; onDelete: (id: string) => void; onEdit: (task: Task) => void; }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: task._id });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;
  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className={`group relative cursor-grab rounded-xl border-2 bg-white p-4 shadow-sm active:cursor-grabbing ${
      task.completed ? 'border-green-200 bg-green-50/40' : isOverdue ? 'border-red-200 bg-red-50/40' : 'border-gray-200'
    }`}>
      <div className="flex items-start gap-3">
        <button onClick={() => onToggle(task._id)} className={`mt-1 h-5 w-5 rounded border-2 ${task.completed ? 'border-green-500 bg-green-500' : 'border-gray-300'}`}></button>
        <div className="flex-1">
          <div className={`text-sm font-semibold ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>{task.title}</div>
          {task.description ? <div className="mt-1 line-clamp-2 text-xs text-gray-600">{task.description}</div> : null}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {task.dueDate ? <span className="text-[11px] text-gray-500">{new Date(task.dueDate).toLocaleDateString('ar-EG')}</span> : null}
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] ring-1 ring-inset ${
              (task.priority ?? 'medium') === 'high' ? 'bg-red-50 text-red-700 ring-red-200' : (task.priority ?? 'medium') === 'low' ? 'bg-amber-50 text-amber-700 ring-amber-200' : 'bg-blue-50 text-blue-700 ring-blue-200'
            }`}>أولوية</span>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] ring-1 ring-inset ${
              (task.importance ?? 'normal') === 'critical' ? 'bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200' : (task.importance ?? 'normal') === 'important' ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-gray-50 text-gray-700 ring-gray-200'
            }`}>أهمية</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => onEdit(task)} className="rounded-lg bg-gray-100 px-2 py-1 text-xs text-gray-700 hover:bg-gray-200">تعديل</button>
          <button onClick={() => onDelete(task._id)} className="rounded-lg bg-red-100 px-2 py-1 text-xs text-red-600 hover:bg-red-200">حذف</button>
        </div>
      </div>
    </div>
  );
}
