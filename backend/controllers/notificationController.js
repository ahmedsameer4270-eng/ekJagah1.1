const db = require('../config/db');

// List notifications for current user
async function listNotifications(req, res) {
    try {
        const userId = req.user.userId;
        const result = await db.query(
            `SELECT * FROM notifications 
             WHERE user_id = $1 
             ORDER BY created_at DESC 
             LIMIT 50`,
            [userId]
        );

        const unreadCount = result.rows.filter(n => !n.is_read).length;

        return res.json({
            notifications: result.rows,
            unreadCount
        });
    } catch (err) {
        console.error('Error fetching notifications:', err);
        return res.status(500).json({ error: 'Failed to fetch notifications.' });
    }
}

// Mark single notification as read
async function markAsRead(req, res) {
    try {
        const userId = req.user.userId;
        const { id } = req.params;

        await db.query(
            'UPDATE notifications SET is_read = 1 WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        return res.json({ message: 'Notification marked as read.' });
    } catch (err) {
        console.error('Error marking notification as read:', err);
        return res.status(500).json({ error: 'Failed to update notification.' });
    }
}

// Mark all as read
async function markAllAsRead(req, res) {
    try {
        const userId = req.user.userId;
        await db.query('UPDATE notifications SET is_read = 1 WHERE user_id = $1', [userId]);
        return res.json({ message: 'All notifications marked as read.' });
    } catch (err) {
        console.error('Error marking all notifications as read:', err);
        return res.status(500).json({ error: 'Failed to update notifications.' });
    }
}

module.exports = {
    listNotifications,
    markAsRead,
    markAllAsRead
};
