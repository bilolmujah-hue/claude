type Defaults = { title?: string; description?: string | null; priority?: string; dueDate?: string };

export function TaskFields({ d = {}, autoFocus }: { d?: Defaults; autoFocus?: boolean }) {
  return (
    <>
      <input
        name="title"
        required
        maxLength={200}
        defaultValue={d.title}
        autoFocus={autoFocus}
        placeholder="Nima qilish kerak?"
        className="input text-base"
      />
      <textarea
        name="description"
        rows={2}
        maxLength={2000}
        defaultValue={d.description ?? ""}
        placeholder="Izoh (ixtiyoriy)"
        className="input resize-none"
      />
      <div className="grid grid-cols-2 gap-2">
        <select name="priority" defaultValue={d.priority ?? "MEDIUM"} className="input" aria-label="Muhimlik">
          <option value="LOW">🟢 Past</option>
          <option value="MEDIUM">🟡 O&apos;rta</option>
          <option value="HIGH">🔴 Yuqori</option>
        </select>
        <input name="dueDate" type="date" defaultValue={d.dueDate} className="input" aria-label="Muddat" />
      </div>
    </>
  );
}
