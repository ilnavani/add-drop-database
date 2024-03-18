DROP SCHEMA IF EXISTS finalProject;
CREATE SCHEMA finalProject;
USE finalProject;

CREATE TABLE courses
(  CRN NUMERIC(5),
	course_title VARCHAR(100),
	crs_sec VARCHAR(10),
	days VARCHAR(40),
	class_time VARCHAR(40),
	instructor VARCHAR(30),
	PRIMARY KEY(CRN)
);

CREATE TABLE student 
( 	student_id NUMERIC(10),
	first_name VARCHAR(50),
	last_name VARCHAR(50),
	email VARCHAR(50),
	phone_number NUMERIC(15),
	PRIMARY KEY(student_id)
);

CREATE TABLE webtree
(
	CRN NUMERIC(5),
	student_id  NUMERIC(10),
	add_drop VARCHAR(5),
	FOREIGN KEY (CRN) REFERENCES courses (CRN), 
	FOREIGN KEY (student_id) REFERENCES student (student_id)
);

