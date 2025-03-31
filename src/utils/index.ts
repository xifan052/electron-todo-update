export function getGreeting() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const currentTime = hours * 60 + minutes; // 当前时间的分钟数

  const timeSlots = [
    { start: [6, 0], end: [9, 0], greeting: "Good Morning!" },
    { start: [9, 0], end: [12, 0], greeting: "Good Morning!" },
    { start: [12, 0], end: [13, 30], greeting: "Good Afternoo!" },
    { start: [13, 30], end: [18, 0], greeting: "Good Afternoon!" },
  ];

  // 查找匹配的时间段
  const matched = timeSlots.find(
    ({ start, end }) =>
      start[0] * 60 + start[1] <= currentTime &&
      currentTime < end[0] * 60 + end[1]
  );

  return matched ? matched.greeting : "Good Evening!"; // 返回对应的问候语
}
