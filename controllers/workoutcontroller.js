const Express = require('express');
const { RowDescriptionMessage } = require('pg-protocol/dist/messages');
const router = Express.Router();
let validateJWT = require("../middleware/validate-jwt");
const { WorkoutModel } = require('../models');

//!============================================================================================
//! Check security issues===============================================


//!====================
//! Create Workout Log
//!====================
router.post('/create', validateJWT, async(req, res) => {
    const { description, definition, result } = req.body.workout;
    const { id } = req.user;
    const workoutEntry = {
        description,
        definition,
        result,
        owner: id
    }

    try {
        const newWorkout = await WorkoutModel.create(workoutEntry);
        res.status(200).json({ newWorkout });
    } catch (err) {
        res.status(500).json({ error: err });
    }

});

//!====================
//! Get All Workout Log
//!====================
router.get("/mine/", validateJWT, async(req, res) => {
    let { id } = req.user;
    try {
        const userWorkout = await WorkoutModel.findAll({
            where: {
                owner: id
            }
        });
        res.status(200).json(userWorkout);
    } catch (err) {
        res.status(500).json({ error: err });
    }
});

//!=======================
//! Get Workout Log by ID  
//!=======================
router.get("/mine/:id", validateJWT, async(req, res) => {

    const { id } = req.params;

    try {

        const locatedWorkout = await WorkoutModel.findAll({
            where: { id: req.params.id },
        });
        res
            .status(200)
            .json({ message: "Workout successfully retrieved", locatedWorkout });
    } catch (err) {
        res.status(500).json({ message: `Failed to retrieve workout: ${err}` });
    }
});


//!====================
//! Update Workout Log    //! security issue - able to update another user's log
//!====================
router.put("/update/:id", validateJWT, async(req, res) => {
    const { description, definition, result } = req.body.workout;
    const userId = req.user.id;
    const workoutId = req.params.id;



    try {

        const query = {
            where: {
                id: workoutId,
                owner: userId
            }
        };

        const updatedJournal = {
            description: description,
            definition: definition,
            result: result
        };

        await WorkoutModel.update({ description, definition, result }, { where: { id: req.params.id }, returning: true })
            .then((result) => {
                res.status(200).json({
                    message: "Workout log successfully updated",
                    updatedWorkout: result
                });
            });

    } catch (err) {
        res.status(500).json({
            message: `Failed to update workout log: ${err}`
        });
    }
});

//!====================
//! Delete Workout Log
//!====================
router.delete("/delete/:id", validateJWT, async(req, res) => {
    const userId = req.user.id;
    const workoutId = req.params.id;

    try {

        const query = {
            where: {
                id: workoutId,
                owner: userId
            }
        };
        await WorkoutModel.destroy(query);
        res.status(200).json({ message: "Workout deleted" });
    } catch (err) {
        res.status(500).json({
            message: "Failed to delete"
        });
    }
});



module.exports = router;