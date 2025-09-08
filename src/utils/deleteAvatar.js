import fs from 'fs';

async function deleteOldAvatar(oldAvatarPath) {
    const defaultAvatar = 'public/uploads/avatars/default-avatar.png';

    if (oldAvatarPath && oldAvatarPath !== defaultAvatar) {
        try {
            await fs.access(oldAvatarPath);  // Check if file exists
            await fs.unlink(oldAvatarPath);
            console.log('Old avatar deleted successfully');
        } catch (err) {
            console.error('Error deleting old avatar:', err);
        }
    }
}

export { deleteOldAvatar };



// Usage in Controller

import { deleteOldAvatar } from './utils/deleteOldAvatar.js';

const changeAvatar = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!req.file) {
            return res.status(400).json({ message: 'No avatar uploaded' });
        }

        const newAvatarPath = req.file.path;

        // Delete old avatar
        deleteOldAvatar(user.avatar);

        // Save new avatar path to DB
        user.avatar = newAvatarPath;
        await user.save();

        res.status(200).json({ message: 'Avatar updated successfully', avatar: user.avatar });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
