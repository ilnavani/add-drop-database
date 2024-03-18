// You have to do an 'npm install mysql2' to get the package
// Documentation in: https://www.npmjs.com/package/mysql2

import { createConnection } from 'mysql2';

// Establish a connection to the database
var connection = createConnection({
	host: 'localhost',
	user: 'root',
	password: '',
	database: 'finalProject',
});

function connect() {
	connection.connect();
}

/*
    Retrieves the student information from the table in the case of a match
*/
function studentQueryCallback(CRN, add_drop, callback) {
	connection.query("SELECT s.first_name, s.last_name, s.email, s.phone_number FROM webtree AS w JOIN student AS s ON w.student_id = s.student_id WHERE w.CRN = ? AND w.add_drop != ?", [CRN, add_drop], (error, results, fields) => {
		if (error) {
			print(error);
			callback(null);
			return;
		};
		callback(results);
	});
}

/*
    Checks whether a CRN is valid
*/
function crnCheck(CRN, callback) { 
	connection.query("SELECT CRN FROM courses WHERE CRN = ?", [CRN], (error, results, fields) => {
		if (error) {
			print(error);
			callback(null);
			return;
		};
		callback(results);
	});
}

/*
    Checks whether a student's contact information is already in the database
*/
function studentCheck(student_id, callback) { 
	connection.query("SELECT student_id FROM student WHERE student_id = ?", [student_id], (error, results, fields) => {
		if (error) {
			print(error);
			callback(null);
			return;
		};
		callback(results);
	});
}

/*
    Inserts a student's contact information into the database 
*/
function studentInsert(student_id, first_name, last_name, email, phone_number, callback) { 
	connection.query("INSERT INTO student VALUES ('" + student_id + "', '" + first_name + "', '" + last_name + "', '" + email  + "', '" + phone_number + "')", [student_id, first_name, last_name, email, phone_number],(error, results, fields) => {
		if (error) {
			print(error);
			callback(null);
			return;
		};
		const rowsAffected = results.affectedRows;
		callback(rowsAffected>0); // insertion was successful 
	});
}

/*
    Inserts add/drop information into the database
*/
function webtreeInsert(CRN, student_id, add_drop, callback) {
	connection.query("INSERT INTO webtree VALUES ('" + CRN + "', '" + student_id + "', '" + add_drop + "')", [CRN, student_id, add_drop],(error, results, fields) => {
		if (error) {
			print(error);
			callback(null);
			return;
		};
		const rowsAffected = results.affectedRows;
        callback(rowsAffected>0); // insertion was successful 
	});
}

/*
    Deletes from database once a match is found
*/
function deleteStudent(CRN, student_id, callback) {
    connection.query("DELETE FROM webtree WHERE CRN = ? AND student_id = ?", [CRN, student_id], (error, results, fields) => {
        if (error) {
            print(error)
            callback(false); // failure to callback
            return;
        };
		const rowsAffected = results.affectedRows;
        callback(rowsAffected>0); // deletion was successful
    });
}

function disconnect() {
	connection.end();
}

// Setup exports to include the external variables/functions
export {
	connection,
	connect,
	studentQueryCallback,
	crnCheck,
	studentCheck,
	studentInsert,
	webtreeInsert,
	deleteStudent,
	disconnect
}