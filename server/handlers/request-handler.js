function test(req,res) {
    res.status(200).json({ name: 'tobi' });
}

module.exports = {
    test
};