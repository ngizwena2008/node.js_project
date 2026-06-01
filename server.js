const express = require('express');
const mysql = require('mysql2');

const app = express();
app.use(express.json()); // Middleware to parse JSON request bodies

// Database Connection (Byakozwe direct hano kugira ngo byvure ikibazo cya password)
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // Isige ari nsa gutya niba ukoresha XAMPP
    database: 'school_attendance'
});

db.connect((err) => {
    if (err) {
        console.error('--- IKOSA RYA DATABASE ---');
        console.error('Ubwoko bw\'ikosa (Code): ' + err.code);
        console.error('Ubutumwa (Message): ' + err.message);
        console.error('---------------------------');
        return;
    }
    console.log('Connected to MySQL Database.');
});

// ==========================================
// STUDENT ROUTES (CRUD)
// ==========================================

// 1. Add a Student
app.post('/api/students', (req, res) => {
    const { first_name, last_name, email, grade_level } = req.body;
    const query = 'INSERT INTO students (first_name, last_name, email, grade_level) VALUES (?, ?, ?, ?)';
    
    db.query(query, [first_name, last_name, email, grade_level], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Student added successfully', studentId: result.insertId });
    });
});

// 2. View All Students
app.get('/api/students', (req, res) => {
    const query = 'SELECT * FROM students';
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(results);
    });
});

// 3. Update Student Information
app.put('/api/students/:id', (req, res) => {
    const { id } = req.params;
    const { first_name, last_name, email, grade_level } = req.body;
    const query = 'UPDATE students SET first_name = ?, last_name = ?, email = ?, grade_level = ? WHERE id = ?';

    db.query(query, [first_name, last_name, email, grade_level, id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Student not found' });
        res.status(200).json({ message: 'Student updated successfully' });
    });
});

// 4. Delete Student Record
app.delete('/api/students/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM students WHERE id = ?';

    db.query(query, [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Student not found' });
        res.status(200).json({ message: 'Student and their attendance records deleted successfully' });
    });
});

// ==========================================
// ATTENDANCE ROUTES
// ==========================================

// 5. Record/Mark Attendance
app.post('/api/attendance', (req, res) => {
    const { student_id, date, status } = req.body;
    const query = `
        INSERT INTO attendance (student_id, date, status) 
        VALUES (?, ?, ?) 
        ON DUPLICATE KEY UPDATE status = ?`;

    db.query(query, [student_id, date, status, status], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({ message: 'Attendance recorded/updated successfully' });
    });
});

// 6. View Attendance Records
app.get('/api/attendance', (req, res) => {
    const { date, student_id } = req.query;
    let query = `
        SELECT a.id, s.first_name, s.last_name, s.grade_level, a.date, a.status 
        FROM attendance a 
        JOIN students s ON a.student_id = s.id WHERE 1=1`;
    
    const queryParams = [];

    if (date) {
        query += ' AND a.date = ?';
        queryParams.push(date);
    }
    if (student_id) {
        query += ' AND a.student_id = ?';
        queryParams.push(student_id);
    }

    db.query(query, queryParams, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(results);
    });
});

// Start Server (Twakoresheje Port 5000)
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});