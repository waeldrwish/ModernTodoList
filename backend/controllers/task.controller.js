import mongoose from "mongoose";
import Task from "../models/taskModel.js";

export async function getTasks(req, res) {
  try {
        const {
      q,
      status,
      priority,
      importance,
      completed,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query || {};

    const filter = { user: req.user._id };

    if (q && typeof q === "string" && q.trim()) {
      const rx = new RegExp(q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ title: rx }, { description: rx }];
    }
    if (typeof status === "string" && ["todo", "in_progress", "done"].includes(status)) {
      filter.status = status;
    }
    if (typeof priority === "string" && ["low", "medium", "high"].includes(priority)) {
      filter.priority = priority;
    }
    if (typeof importance === "string" && ["normal", "important", "critical"].includes(importance)) {
      filter.importance = importance;
    }
    if (typeof completed === "string") {
      if (completed === "true") filter.completed = true;
      else if (completed === "false") filter.completed = false;
    }

    const sortable = new Set(["createdAt", "updatedAt", "dueDate", "title", "priority", "importance", "status", "completed"]);
    const sort = {};
    sort[sortable.has(sortBy) ? sortBy : "createdAt"] = sortOrder === "asc" ? 1 : -1;

    const tasks = await Task.find(filter).sort(sort);
    return res.json(tasks);
  } catch (err) {
    return res.status(500).json({ message: "تعذر جلب المهام" });
  }
}

export async function createTask(req, res) {
  try {
    const { title, description = "", dueDate, priority, importance, status } = req.body || {};
    if (!title) return res.status(400).json({ message: "العنوان مطلوب" });

    const task = await Task.create({
      title: title.trim(),
      description: (description || "").trim(),
      dueDate: dueDate ? new Date(dueDate) : undefined,
      priority: typeof priority === "string" ? priority : undefined,
      importance: typeof importance === "string" ? importance : undefined,
      user: req.user._id,
      status: typeof status === "string" ? status : undefined,
      completed: status === "done" ? true : undefined,
    });
    return res.status(201).json(task);
  } catch (err) {
    return res.status(500).json({ message: "تعذر إنشاء المهمة" });
  }
}

export async function getTaskById(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "معرف غير صالح" });
    }
    const task = await Task.findOne({ _id: id, user: req.user._id });
    if (!task) return res.status(404).json({ message: "المهمة غير موجودة" });
    return res.json(task);
  } catch (err) {
    return res.status(500).json({ message: "تعذر جلب المهمة" });
  }
}

export async function updateTask(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "معرف غير صالح" });
    }
    const updates = {};
    if (typeof req.body.title === "string") updates.title = req.body.title.trim();
    if (typeof req.body.description === "string") updates.description = req.body.description.trim();
    if (typeof req.body.completed !== "undefined") updates.completed = !!req.body.completed;
    if (typeof req.body.dueDate !== "undefined") updates.dueDate = req.body.dueDate ? new Date(req.body.dueDate) : null;
    if (typeof req.body.priority === "string") updates.priority = req.body.priority;
    if (typeof req.body.importance === "string") updates.importance = req.body.importance;
    if (typeof req.body.status === "string") {
      updates.status = req.body.status;
      if (typeof req.body.completed === "undefined") {
        updates.completed = req.body.status === "done";
      }
    }

    const task = await Task.findOneAndUpdate(
      { _id: id, user: req.user._id },
      updates,
      { new: true, runValidators: true }
    );
    if (!task) return res.status(404).json({ message: "المهمة غير موجودة" });
    return res.json(task);
  } catch (err) {
    return res.status(500).json({ message: "تعذر تحديث المهمة" });
  }
}

export async function toggleComplete(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "معرف غير صالح" });
    }
    const task = await Task.findOne({ _id: id, user: req.user._id });
    if (!task) return res.status(404).json({ message: "المهمة غير موجودة" });
    task.completed = !task.completed;
    task.status = task.completed ? "done" : "todo";
    await task.save();
    return res.json(task);
  } catch (err) {
    return res.status(500).json({ message: "تعذر تعديل حالة المهمة" });
  }
}

export async function deleteTask(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "معرف غير صالح" });
    }
    const deleted = await Task.findOneAndDelete({ _id: id, user: req.user._id });
    if (!deleted) return res.status(404).json({ message: "المهمة غير موجودة" });
    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ message: "تعذر حذف المهمة" });
  }
}


