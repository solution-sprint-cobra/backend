const Event = require('../models/Event');
const User = require('../models/User');

exports.create = async(req, res) => {
    try {
        const event = new Event(req.body);
        await event.save();
        res.status(201).json(event);
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};

exports.get = async(req, res) => {
    try {
        // Initialize match condition for date filter
        let matchCondition = {};

        // Check if 'filter' query parameter exists and set match condition accordingly
        if (req.query.filter === 'past') {
            matchCondition.date = { $lt: new Date() }; // Past events
        } else if (req.query.filter === 'future') {
            matchCondition.date = { $gte: new Date() }; // Future events
        }

        // Define the aggregation pipeline
        let pipeline = [];

        // Add match stage for date filter if matchCondition is not empty
        if (Object.keys(matchCondition).length !== 0) {
            pipeline.push({ $match: matchCondition });
        }

        // Add remaining aggregation stages
        pipeline.push({
            $lookup: {
                from: 'users',
                localField: 'creator',
                foreignField: '_id',
                as: 'creatorDetails'
            }
        }, {
            $unwind: {
                path: '$creatorDetails',
                preserveNullAndEmptyArrays: true // Preserve documents that don't have creator details
            }
        }, {
            $lookup: {
                from: 'users',
                localField: 'participants',
                foreignField: '_id',
                as: 'participantDetails'
            }
        }, {
            $lookup: {
                from: 'profiles',
                localField: 'creator',
                foreignField: 'parent',
                as: 'creatorProfile'
            }
        }, {
            $lookup: {
                from: 'profiles',
                localField: 'participantDetails._id',
                foreignField: 'parent',
                as: 'participantProfiles'
            }
        }, {
            $project: {
                _id: 1,
                name: 1,
                date: 1,
                location: 1,
                description: 1,
                title: 1,
                type: 1,
                time: 1,
                status: 1,
                image: 1,
                creatorDetails: {
                    _id: '$creatorDetails._id',
                    username: '$creatorDetails.username',
                    firstName: '$creatorDetails.firstName',
                    lastName: '$creatorDetails.lastName',
                    email: '$creatorDetails.email',
                    phone: '$creatorDetails.phone',
                    profiles: '$creatorProfile'
                },
                participantDetails: {
                    $map: {
                        input: '$participantDetails',
                        as: 'participant',
                        in: {
                            _id: '$$participant._id',
                            username: '$$participant.username',
                            firstName: '$$participant.firstName',
                            lastName: '$$participant.lastName',
                            email: '$$participant.email',
                            phone: '$$participant.phone',
                            profiles: { $arrayElemAt: ['$participantProfiles', { $indexOfArray: ['$participantDetails._id', '$$participant._id'] }] }
                        }
                    }
                }
            }
        });

        // Execute the aggregation pipeline
        let events = await Event.aggregate(pipeline);

        // Send the events as the response
        res.send(events);
    } catch (error) {
        // Handle errors
        res.status(500).send(error);
    }
};

exports.update = async(req, res) => {
    try {
        // req.body can't contain creator or participants
        if (req.body.creator || req.body.participants) {
            return res.status(400).send({
                message: 'Creator or participants cannot be updated'
            });
        }

        const event = await Event.findOneAndUpdate({
            _id: req.query.id
        }, req.body, {
            new: true,
            runValidators: true
        });

        if (!event) {
            return res.status(404).send();
        }

        res.send(event);

    } catch (error) {
        res.status(400).send(error);
    }
};

exports.delete = async(req, res) => {
    try {
        const event = await Event.findOneAndDelete({
            _id: req.query.id
        });

        if (!event) {
            return res.status(404).send();
        }

        res.send(event);
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.addParticipant = async(req, res) => {
    try {

        if (!req.body.user) {
            return res.status(400).send({
                message: 'User is required'
            });
        }

        if (!req.query.id) {
            return res.status(400).send({
                message: 'Event id is required'
            });
        }

        const event = await Event.findOne({
            _id: req.query.id
        });

        if (!event) {
            return res.status(404).send({
                message: 'Event not found'
            });
        }

        const user = await User.findOne({
            _id: req.body.user
        });

        if (!user) {
            return res.status(404).send({
                message: 'User not found'
            });
        }

        if (event.participants.includes(req.body.user)) {
            return res.status(400).send({
                message: 'User already a participant'
            });
        }

        event.participants.push(req.body.user);
        await event.save();

        res.send(event);
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.removeParticipant = async(req, res) => {
    try {

        if (!req.body.user) {
            return res.status(400).send({
                message: 'User is required'
            });
        }

        if (!req.query.id) {
            return res.status(400).send({
                message: 'Event id is required'
            });
        }

        const event = await Event.findOne({
            _id: req.query.id
        });

        if (!event) {
            return res.status(404).send({
                message: 'Event not found'
            });
        }

        const user = await User.findOne({
            _id: req.body.user
        });

        if (!user) {
            return res.status(404).send({
                message: 'User not found'
            });
        }

        if (!event.participants.includes(req.body.user)) {
            return res.status(400).send({
                message: 'User not a participant'
            });
        }

        event.participants = event.participants.filter((participant) => participant != req.body.user);
        await event.save();

        res.send(event);
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.getParticipants = async(req, res) => {
    try {
        if (!req.query.id) {
            return res.status(400).send({
                message: 'Event id is required'
            });
        }

        const event = await Event.findOne({
            _id: req.query.id
        });

        if (!event) {
            return res.status(404).send({
                message: 'Event not found'
            });
        }

        let participants = [];

        if (event.participants.length > 0) {
            participants = await User.aggregate([{
                    $match: {
                        _id: { $in: event.participants }
                    }
                },
                {
                    $lookup: {
                        from: 'profiles',
                        localField: '_id',
                        foreignField: 'parent',
                        as: 'profiles'
                    }
                },
                {
                    $project: {
                        _id: 1,
                        username: 1,
                        firstName: 1,
                        lastName: 1,
                        email: 1,
                        phone: 1,
                        profiles: 1
                    }
                }
            ]);

            // Loop through participants to structure the data as desired
            participants = participants.map(participant => {
                const userDetails = {
                    _id: participant._id,
                    username: participant.username,
                    firstName: participant.firstName,
                    lastName: participant.lastName,
                    email: participant.email,
                    phone: participant.phone,
                    profiles: participant.profiles
                };
                return userDetails;
            });
        }

        res.send(participants);
    } catch (error) {
        res.status(500).send(error);
    }
};