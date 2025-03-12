module.exports = (req, res) => {
    res.status(200).json({
      message: 'Hello from API!',
      timestamp: new Date().toISOString()
    });
}