// In-memory record store
// Record shape: { id, userId, date, vehicleType, liters, distanceKm, totalCost, kmPerLiter }
// TODO: implement all methods

module.exports = {
  findAll(userId) {},
  findById(id, userId) {},
  create({ userId, date, vehicleType, liters, distanceKm, totalCost }) {},
  update(id, userId, data) {},
  delete(id, userId) {},
  getWeeklyStats(userId) {},
  getMonthlyStats(userId) {}
};
