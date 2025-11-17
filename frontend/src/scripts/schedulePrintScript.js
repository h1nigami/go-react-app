export default function scheduleDays(days) {
  const scheduleDays = {
    mon: "понедельник",
    tue: "вторник",
    wed: "среда",
    thu: "четверг",
    fri: "пятница",
    sat: "суббота",
    sun: "воскресенье",
  };
  days = days.split(",");
  for (let i = 0; i < days.length; i++) {
    days[i] = scheduleDays[days[i]];
  }
  return days.join(", ");
}
