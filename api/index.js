const Joi = require('@hapi/joi');
const express = require('express');
const app = express();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./db/chinook.db');

app.use(express.json());

const courses = [
    { id: 1, name: 'First course'}, 
    { id: 2, name: 'Second course'},
    { id: 3, name: 'Third course'}
];

app.get('/', (req, res) => {
    res.send('Hello World!!!');
});

app.get('/api/customers', (req, res) => {
    //   res.send(courses);
    db.all('SELECT * FROM customers', function(err,rows) {
        if(err){
            console.log("Error: " + err);
        }
        else{
            res.send(rows);
            // res.send('This is just a test.')
            res.status(200);
        }
    });
});

app.get('/api/customers/:id', (req, res) => {
//    const course = courses.find(c => c.id === parseInt(req.params.id));
//    if (!course) return res.status(404).send('The course with the given ID was not found.');
//    res.send(course);
    db.all('SELECT * FROM customers WHERE Customerid=' + parseInt(req.params.id), function(err,rows) {
        if(err){
            console.log("Error: " + err);
        }
        else{
            res.send(rows);
            // res.send('This is just a test.')
        }
    });
});

app.post('/api/customers', (req, res) => {
//    const { error } = validateCourse(req.body);    // Object destructuring
//    if (error) return res.status(400).send(error.details[0].message);
//    const course = {
//        id: courses.length +1,
//        name: req.body.name
//    };
//    courses.push(course);
//    res.send(course);

    db.run('INSERT INTO customers(FirstName, LastName, Email) VALUES(?, ?, ?)', ['Len','Baker', 'len.baker@technicallywriteit.com'], (err) => {
        if(err){
            console.log("Error: " + err);
        }
        else{
            // res.send(rows);
            res.send('The customer was added.')
        }
    });

});

app.put('/api/customers/:id', (req, res) => {
    // Check course exists; if not send 404 error
 //   const course = courses.find(c => c.id === parseInt(req.params.id));
 //   if (!course) return res.status(404).send('The course with the given ID was not found.');
    
    // Validate the course; if invalid return 404 error
    // const result = validateCourse(req.body);
 //   const { error } = validateCourse(req.body);    // Object destructuring notation
 //   if (error) return res.status(400).send(error.details[0].message);
    // Update the course
 //   course.name = req.body.name;
 //   res.send(course);

    db.run('UPDATE customers SET FirstName = "Leonard" WHERE Customerid=' +  parseInt(req.params.id), function (err) {
        if(err){
            console.log("Error: " + err);
        }
        else{
            // res.send(rows);
            res.send('The customer record is updated.');
        }
    });

});

app.delete('/api/customers/:id', (req, res) => {
    // Check course exists; if not send 404 error
//    const course = courses.find(c => c.id === parseInt(req.params.id));
//    if (!course) return res.status(404).send('The course with the given ID was not found.');
//    const index = courses.indexOf(course);
//    courses.splice(index, 1);
//    res.send(course);

    db.run('DELETE FROM customers WHERE Customerid=' +  parseInt(req.params.id), function (err) {
        if(err){
            console.log("Error: " + err);
        }
        else{
            // res.send(rows);
            res.send('The customer record is deleted.')
        }
    });

})

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}.... `));

function validateCourse(course){
    const schema = Joi.object({
        name: Joi.string().min(3).required()
    });
    return schema.validate(course);    
}
