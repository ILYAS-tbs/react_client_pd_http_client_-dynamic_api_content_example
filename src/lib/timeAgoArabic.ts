export function timeAgoArabic(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  const units = [
    { name: 'سنة', value: 31536000 },
    { name: 'شهر', value: 2592000 },
    { name: 'أسبوع', value: 604800 },
    { name: 'يوم', value: 86400 },
    { name: 'ساعة', value: 3600 },
    { name: 'دقيقة', value: 60 },
    { name: 'ثانية', value: 1 },
  ];

  for (const unit of units) {
    const count = Math.floor(seconds / unit.value);
    if (count >= 1) {
      return `منذ ${count} ${unit.name}`;
    }
  }

  return 'الآن';
}

// Example
// console.log(timeAgoArabic("2025-10-31T10:11:07.117936Z"));

//?: example output ::
/*
الآن
منذ 2 دقيقة
منذ 1 ساعة
منذ 3 يوم
منذ 1 أسبوع

*/