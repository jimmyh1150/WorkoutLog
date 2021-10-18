const Express = require('express');
const { RowDescriptionMessage } = require('pg-protocol/dist/messages');
const router = Express.Router();
let validateJWT = require("../middleware/validate-jwt");
const { WorkoutModel } = require('../models');




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
//! Get Workout Log by ID     !!!!wrong response but only returns for active user logged in
//!=======================
router.get("/mine/:id", validateJWT, async(req, res) => {

    const { id } = req.params;

    try {

        const locatedWorkout = await WorkoutModel.findAll({
            where: {
                id: req.params.id,
                owner: req.user.id
            },
        });
        res
            .status(200)
            .json({ message: "Workout successfully retrieved", locatedWorkout });
    } catch (err) {
        res.status(500).json({ message: `Failed to retrieve workout: ${err}` });
    }
});


//!====================
//! Update Workout Log    //! wrong response but only updates for active user logged in
//!====================


router.put("/update/:id", validateJWT, async(req, res) => {
    const { description, definition, result } = req.body.workout;

    try {
        const updateWorkout = Workout = await WorkoutModel.update({ description, definition, result }, { where: { id: req.params.id, owner: req.user.id } })
        res.status(200).json({ message: "updated successfully", updateWorkout })

    } catch (error) {
        res.status(500).json({ message: "update failed", updateWorkout })

    }
});
//!====================
//! Delete Workout Log //! wrong response but only deletes active user logged in
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