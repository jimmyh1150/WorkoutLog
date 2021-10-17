const Express = require('express');
const { RowDescriptionMessage } = require('pg-protocol/dist/messages');
const router = Express.Router();
let validateJWT = require("../middleware/validate-jwt");
const { WorkoutModel } = require('../models');

//!============================================================================================
//! Check security issues, screenshots needed, and refer to addition info  on assignment page
//!============================================================================================


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
router.get("/", validateJWT, async(req, res) => {
    try {
        const entries = await WorkoutModel.findAll();
        res.status(200).json(entries);
    } catch (err) {
        res.status(500).json({ error: err });
    }
});

//!=======================
//! Get Workout Log by ID  //! security issue - able to get another user's log
//!=======================
router.get("/:id", validateJWT, async(req, res) => {
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
    const { description, definition, result } = req.body;

    try {
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
router.delete("/:id", validateJWT, async(req, res) => { //! security issue - able to delete another user's log
    try {
        const query = {
            where: {
                id: req.params.id
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