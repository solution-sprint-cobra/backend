const User = require('../models/User');
const { genPassword, validPassword } = require('../libs/password');

exports.get = async(req, res) => {
    try {
        let users = await User.aggregate([{
                $lookup: {
                    from: 'profiles',
                    let: { userId: '$_id' },
                    pipeline: [{
                            $match: {
                                $expr: {
                                    $eq: ['$parent', '$$userId']
                                }
                            }
                        },
                        {
                            $project: {
                                name: 1,
                                age: 1,
                                gender: 1,
                                disabilities: 1,
                                likedActivities: 1,
                                disLikedActivities: 1,
                                hobbies: 1
                            }
                        }
                    ],
                    as: 'profiles'
                }
            },
            {
                $addFields: {
                    profiles: {
                        $cond: {
                            if: { $isArray: '$profiles' },
                            then: '$profiles',
                            else: [] // If there are no profiles, return an empty array
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: 'events',
                    localField: '_id',
                    foreignField: 'creator',
                    as: 'userOrganizedEvents'
                }
            },
            {
                $lookup: {
                    from: 'events',
                    let: { userId: '$_id' },
                    pipeline: [{
                        $match: {
                            $expr: { $in: ['$$userId', '$participants'] }
                        }
                    }],
                    as: 'attendedEvents'
                }
            },
            {
                $lookup: {
                    from: 'events',
                    let: { userId: '$_id' },
                    pipeline: [{
                        $match: {
                            $expr: { $eq: ['$$userId', '$creator'] }, // Include events created by the user
                            date: { $gte: new Date() } // Filter for future events
                        }
                    }],
                    as: 'futureEvents'
                }
            },
            {
                $project: {
                    username: 1,
                    firstName: 1,
                    lastName: 1,
                    email: 1,
                    phone: 1,
                    status: 1,
                    location: 1,
                    role: 1,
                    profiles: 1,
                    userOrganizedEvents: 1,
                    attendedEvents: 1,
                    futureEvents: {
                        $filter: {
                            input: '$futureEvents',
                            as: 'event',
                            cond: { $ne: ['$$event.mandatory', true] } // Consider only events with no mandatory attendance
                        }
                    }
                }
            },
            {
                $unset: 'hash' // Remove the hash field
            }
        ]);

        res.json(users);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

exports.update = async(req, res) => {
    try {
        const {
            id
        } = req.query;
        let user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        if (req.body.password) {
            // Check current password is sent
            if (!req.body.currentPassword) {
                return res.status(400).json({
                    message: 'Current password is required'
                });
            }

            // Check if current password is valid
            if (!validPassword(req.body.currentPassword, user.hash, user.salt)) {
                return res.status(400).json({
                    message: 'Current password is invalid'
                });
            }

            let saltHash = genPassword(req.body.password);
            req.body.hash = saltHash.hash;
            delete req.body.password;
            delete req.body.currentPassword;
        }

        user.set(req.body);
        let updatedUser = await user.save();
        updatedUser = updatedUser.toObject();

        delete updatedUser.hash;

        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

exports.delete = async(req, res) => {
    try {
        const {
            id
        } = req.params;
        let user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        // remove connected profiles
        await Profile.deleteMany({
            parent: user._id
        });

        await user.remove();

        res.json({
            message: 'User removed successfully'
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};