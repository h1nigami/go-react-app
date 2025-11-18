import { useEffect, useRef, useState } from "react";
import "../styles/ScheduleComponent.css";

export default function WorkScheduleSelect({
  value,
  onChange,
  placeholder = "Выберите график",
}) {
  const [open, setOpen] = useState(false);
  const [days, setDays] = useState([]);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const ref = useRef(null);

  const dayOptions = [
    { value: "mon", label: "Пн" },
    { value: "tue", label: "Вт" },
    { value: "wed", label: "Ср" },
    { value: "thu", label: "Чт" },
    { value: "fri", label: "Пт" },
    { value: "sat", label: "Сб" },
    { value: "sun", label: "Вс" },
  ];

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDay = (day) => {
    setDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const applySchedule = () => {
    const schedule = {
      days,
      start,
      end,
    };
    onChange(schedule);
    setOpen(false);
    setDays([]);
    setStart("");
    setEnd("");
  };

  const clear = (e) => {
    e.stopPropagation();
    setDays([]);
    setStart("");
    setEnd("");
    onChange && onChange({ days: [], start: "", end: "" });
  };
  const summary =
    days.length === 0
      ? placeholder
      : `${days.length} дн | ${start || "-"}-${end || "-"}`;
  return (
    <div className="ws-wrapper" ref={ref}>
      <button
        type="button"
        className="ws-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {summary}
      </button>
      {open && (
        <div className="ws-dropdown">
          <div className="ws-days">
            {dayOptions.map((d) => (
              <label
                key={d.value}
                className={`ws-day-item ${days.includes(d.value) ? "selected" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={days.includes(d.value)}
                  onChange={(e) => {
                    e.stopPropagation();
                    toggleDay(d.value);
                  }}
                />
                <span>{d.label}</span>
              </label>
            ))}
          </div>

          <div className="ws-time">
            <div className="ws-time-item">
              <label>С</label>
              <input
                type="time"
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
            </div>
            <div className="ws-time-item">
              <label>По</label>
              <input
                type="time"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
              />
            </div>
          </div>
          <div className="ws-actions">
            <button type="button" className="ws-clear" onClick={clear}>
              Очистить
            </button>
            <button type="button" className="ws-save" onClick={applySchedule}>
              Сохранить
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
