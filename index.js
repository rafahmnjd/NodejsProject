const Joi = require('joi');

const express = require('express');
const app = express();


const courses = [
    { id: 1, name: 'Mahasen code' },
    { id: 2, name: 'Physics' }
];


function validateCourse(course) {
    let schema= Joi.object({
        name: Joi.string().min(2).required().max(30)
    });
    return schema.validate(course);
}

app.get('/', (req, res) => {
    res.send("Cources NodeJs Application");
});

app.get('/api/courses', (req, res) => {
    res.send(courses);
});


app.get('/api/courses/:id', (req, res) => {
    const course = courses.find(c => c.id == req.params.id);
    // if(cource == null)
    //     res.status(404).send("course not found");
    if(!course) return res.status(404).send('The course with the given ID was not found');
    res.send(course);
});



app.post('/api/courses/create', (req, res) => {

//validation:
    const result= validateCourse(req.body)
    console.log(result);
    if(result.error) {
        res.status(400).send(result.error.details[0].message);
        return;
    }

    var course = {
    //not valid when courses array is empty
        id: courses[courses.length - 1].id + 1,
        name: req.body.name
    };
    courses.push(course);
    res.status(201);
    res.send(course);

    // res.send({ msg: "created successfully", obj: course });
});

app.put('/api/courses/:id', (req, res) => {
    const course = courses.find(c => c.id === parseInt(req.params.id));
    if(!course) return res.status(404).send('The course with the given ID was not found');
    const result = validateCourse(req.body);
    if(result.error) return res.status(400).send(result.error.details[0].message);
    course.name = req.body.name;
    res.send(course);
});


app.delete('/api/courses/:id', (req, res) => {
    const course = courses.find(c => c.id === parseInt(req.params.id));
    if(!course)
        return res.status(404).send('The course with the given ID was not found');
    const index = courses.indexOf(course);
    courses.splice(index, 1);

    res.send(course);


    // const index = courses.findIndex(c => c.id == req.params.id);
    // if(courses[index] == null)
    //     res.status(404).send("course not found");
    // var del = courses.splice(index, 1);
    // res.send({ msg: "deleted successfully", deletedObj: del });

    // for(let index = 0; index < courses.length; index++) {
    //     const course = courses[index];
    //     if(req.params.id == course.id) {
    //         var del=courses.splice(index,1);
    //         res.send({ msg: "deleted successfully",deletedObj: del });
    //     }
    // }
    // res.status(404);
    // res.end();
});
app.listen(3000, () => console.log('listening on port 3000'));
