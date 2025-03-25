const Reservation = require('../models/Reservation');

exports.getBookingForm = (req, res) => {
  const selectedDate = req.query.date || new Date().toISOString().split('T')[0]; // Поточна дата або вибрана
  console.log('Selected Date:', selectedDate); // Отладочный вывод

  Reservation.findAll({
    where: { date: selectedDate }
  })
  .then((reservations) => {
    const occupiedTables = reservations.map(reservation => ({
      time: reservation.time,
      customerName: reservation.customerName,
      people: reservation.people
    }));

    console.log('Rendering booking.ejs with:', { occupiedTables, selectedDate }); // Отладочный вывод
    res.render('booking', { occupiedTables, selectedDate });
  })
  .catch((err) => {
    res.status(500).send('Error fetching reservations');
  });
};

exports.reserveTable = (req, res) => {
  const { customerName, date, time, people, tableNumber, preOrder } = req.body;
  
  // Перевірка, чи вже є бронювання на цей час і дату
  Reservation.findOne({
    where: { date, time, tableNumber }
})
  .then((existingReservation) => {
    if (existingReservation) {
      return res.status(400).send('This time slot is already booked.');
    }

    // Створення нового резервування
    Reservation.create({ customerName, date, time, people, tableNumber, preOrder })
      .then(() => res.redirect('/'))
      .catch((err) => res.status(500).send('Error saving reservation'));
  })
  .catch((err) => res.status(500).send('Error checking reservations'));
};
