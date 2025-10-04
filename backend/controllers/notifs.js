
exports.sendNotification = (req, res) => {
    const payload = {
        title: "Test Notification",
        message: "This is a test push notification."
      };
    
      res.json(payload);
};
