const Profile = require('../models/Profile');
const User = require('../models/User');

exports.get = async(req, res) => {
    try {
        // get profiles by req.query but add response with parent details from User model related to Profile.parent to User._id
        let profiles = await Profile.find(req.query).populate({
            path: 'parent',
            select: 'username email firstName lastName phone',
        });

        res.json(profiles);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

exports.create = async(req, res) => {
    try {
        const {
            parent,
            name,
            age,
            gender,
            bio,
            disabilities,
            likedActivities,
            disLikedActivities,
            hobbies
        } = req.body;

        // check if all required fields are present
        if (!parent || !name || !age || !gender || !disabilities) {
            return res.status(400).json({
                message: 'All fields are required'
            });
        }

        // Check if parent with the same id exists
        let user = await User.findById(parent);
        if (!user) return res.status(400).json({
            message: 'Parent not found'
        });

        const newProfile = new Profile({
            parent,
            name,
            gender,
            age,
            disabilities
        });

        if (likedActivities) newProfile.likedActivities = likedActivities;
        if (disLikedActivities) newProfile.disLikedActivities = disLikedActivities;
        if (hobbies) newProfile.hobbies = hobbies;
        if (bio) newProfile.bio = bio;

        const nProfile = await newProfile.save();
        res.json(nProfile);

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
        let profile = await Profile.findById(id);
        if (!profile) {
            return res.status(404).json({
                message: 'Profile not found'
            });
        }

        profile.set(req.body);
        let updatedProfile = await profile.save();

        res.json(updatedProfile);
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
        let profile = await Profile.findById(id);
        if (!profile) {
            return res.status(404).json({
                message: 'Profile not found'
            });
        }

        await profile.remove();
        res.json({
            message: 'Profile deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};