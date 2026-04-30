const recordModel = require('../models/recordModel');

const VEHICLE_TYPES = ['Car', 'Motorcycle'];

function recordToForm(record) {
  return {
    date: new Date(record.date).toISOString().split('T')[0],
    vehicleType: record.vehicleType,
    liters: String(record.liters),
    distanceKm: String(record.distanceKm),
    totalCost: String(record.totalCost),
  };
}

function validateBody(body) {
  const { date, vehicleType, liters, distanceKm, totalCost } = body;
  if (!date || vehicleType == null || liters === '' || distanceKm === '' || totalCost === '') {
    throw new Error('All fields are required.');
  }
  if (!VEHICLE_TYPES.includes(vehicleType)) {
    throw new Error('Vehicle type must be Car or Motorcycle.');
  }
  return {
    date,
    vehicleType,
    liters,
    distanceKm,
    totalCost,
  };
}

exports.getDashboard = (req, res) => {
  const records = recordModel.findAll(req.session.user.id).slice().sort((a, b) => new Date(b.date) - new Date(a.date));
  res.render('dashboard', {
    title: 'Dashboard',
    records,
  });
};

exports.getAddRecord = (req, res) => {
  res.render('add-record', {
    title: 'Add record',
    error: null,
    form: {},
  });
};

exports.postAddRecord = (req, res) => {
  try {
    const payload = validateBody(req.body);
    recordModel.create({
      userId: req.session.user.id,
      ...payload,
    });
    res.redirect('/dashboard');
  } catch (err) {
    res.status(400).render('add-record', {
      title: 'Add record',
      error: err.message || 'Could not save record.',
      form: req.body || {},
    });
  }
};

exports.getEditRecord = (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.redirect('/dashboard');
  const record = recordModel.findById(id, req.session.user.id);
  if (!record) return res.redirect('/dashboard');
  res.render('edit-record', {
    title: 'Edit record',
    record,
    f: recordToForm(record),
    error: null,
  });
};

exports.postUpdateRecord = (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.redirect('/dashboard');
  const existing = recordModel.findById(id, req.session.user.id);
  if (!existing) return res.redirect('/dashboard');
  const fallbackF = {
    date: req.body.date || '',
    vehicleType: req.body.vehicleType || '',
    liters: req.body.liters ?? '',
    distanceKm: req.body.distanceKm ?? '',
    totalCost: req.body.totalCost ?? '',
  };
  try {
    const payload = validateBody(req.body);
    const updated = recordModel.update(id, req.session.user.id, payload);
    if (!updated) return res.redirect('/dashboard');
    res.redirect('/dashboard');
  } catch (err) {
    res.status(400).render('edit-record', {
      title: 'Edit record',
      record: existing,
      f: fallbackF,
      error: err.message || 'Could not update record.',
    });
  }
};

exports.deleteRecord = (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!Number.isNaN(id)) {
    recordModel.delete(id, req.session.user.id);
  }
  res.redirect('/dashboard');
};

exports.getStats = (req, res) => {
  const userId = req.session.user.id;
  res.render('stats', {
    title: 'Statistics',
    weekly: recordModel.getWeeklyStats(userId),
    monthly: recordModel.getMonthlyStats(userId),
  });
};
