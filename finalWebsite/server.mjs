// This is a framework to handle server-side content

// You have to do an 'npm install express' to get the package
// Documentation in: https://expressjs.com/en/starter/hello-world.html
import express from 'express';
import * as fs from 'fs';


import * as db from "./db_mysql.mjs";
import { resolveObjectURL } from 'buffer';

var app = express();
let port = 3001
app.set('view engine', 'ejs'); // Set EJS as the view engine

db.connect();

// Serve static HTML files in the current directory (called '.')
app.use(express.static('.'))

/*
    Handles the routing for the add/drop page
*/
app.get('/student', function(request, response){

    const CRN = request.query["crn-num"];
    const add_drop = request.query["add-drop"];
    const student_id = request.query["student-id"];
    const first_name = request.query["first-name"];
    const last_name = request.query["last-name"];
    const email = request.query["email"];
    const phone_number = request.query["phone-number"];

    db.crnCheck(CRN, (results) => {
        // If CRN is not valid, return error
        if (results.length == 0 || results == null) {
            response.render('error_2');
        }
        else {
            db.studentQueryCallback(CRN, add_drop, (results) => {
                // If no match found, update database and return
                if (results.length == 0 || results == null) {
                    db.studentCheck(student_id, (results) => {
                        // Insert the student's information into the database, if not already present
                        if (results.length == 0 || results == null) {
                            db.studentInsert(student_id, first_name, last_name, email, phone_number, (results) => {
                                if (results) {
                                    response.render('waitlist');
                                }
                                else {
                                    response.render('error');           
                                }
                            });           
                        }
        
                        // Insert add/drop information into the database
                        db.webtreeInsert(CRN, student_id, add_drop, (results) => {
                            if (results) {
                                response.render('waitlist');
                            }
                            else {
                                response.render('error');           
                            }
                        });
                    });
                    return;
                }
        
                // If match found, map the results of the query to an array of objects
                const students = results.map((result) => {
                    return {
                        first_name: result.first_name,
                        last_name: result.last_name,
                        email: result.email,
                        phone_number: result.phone_number,
                    };
                });
        
                response.render('student', { students });
        
            });
        }
    });
});
    

/*
    Handles the routing for the "delete" page
*/
app.get('/delete', function(request, response){
    const CRN = request.query["crn-num"];
    const student_id = request.query["student-id"];

    db.deleteStudent(CRN, student_id, (results) => {
        if (results) {
            response.render('delete');           
        } else {
            response.render('error_1');           
        }
    })  
});

/*
    Default error page
*/
app.get('/*', function(request, response){
    response.render('error');
    return
});

app.listen(port, () => console.log('Server is starting on PORT,', port))

process.on('exit', () => {
    db.disconnect()
})