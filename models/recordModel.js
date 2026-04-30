let records = [];
let nextId = 1;

function weekLabel(date) {
  const d = new Date(date);
  const startOfYear = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

function monthLabel(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function groupBy(userRecords, type) {
  const map = {};
  for (const r of userRecords) {
    const key = type === 'week' ? weekLabel(r.date) : monthLabel(r.date);
    if (!map[key]) map[key] = { period: key, totalCost: 0, totalLiters: 0 };
    map[key].totalCost += r.totalCost;
    map[key].totalLiters += r.liters;
  }
  return Object.values(map).sort((a, b) => b.period.localeCompare(a.period));
}

module.exports = {
  findAll(userId) {
    return records.filter(r => r.userId === userId);
  },

  findById(id, userId) {
    return records.find(r => r.id === id && r.userId === userId) || null;
  },

  create({ userId, date, vehicleType, liters, distanceKm, totalCost }) {
    const l = parseFloat(liters);
    const d = parseFloat(distanceKm);
    const record = {
      id: nextId++,
      userId,
      date: new Date(date),
      vehicleType,
      liters: l,
      distanceKm: d,
      totalCost: parseFloat(totalCost),
      kmPerLiter: l > 0 ? d / l : 0
    };
    records.push(record);
    return record;
  },

  update(id, userId, { date, vehicleType, liters, distanceKm, totalCost }) {
    const idx = records.findIndex(r => r.id === id && r.userId === userId);
    if (idx === -1) return null;
    const l = parseFloat(liters);
    const d = parseFloat(distanceKm);
    records[idx] = {
      ...records[idx],
      date: new Date(date),
      vehicleType,
      liters: l,
      distanceKm: d,
      totalCost: parseFloat(totalCost),
      kmPerLiter: l > 0 ? d / l : 0
    };
    return records[idx];
  },

  delete(id, userId) {
    const idx = records.findIndex(r => r.id === id && r.userId === userId);
    if (idx === -1) return false;
    records.splice(idx, 1);
    return true;
  },

  getWeeklyStats(userId) {
    return groupBy(this.findAll(userId), 'week');
  },

  getMonthlyStats(userId) {
    return groupBy(this.findAll(userId), 'month');
  }
};
