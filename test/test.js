var chai = require('chai'),
    expect = chai.expect,
    request = require('supertest'),
    server = require('../server/server.js');

describe('unit tests', () => {

    it('should work', function() {
        expect(true).to.be.true;
    });

});

describe('api tests', () => {

    it('should work', function(done) {
        request(server)
            .get('/test')
            .set('Accept', 'application/json')
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);
                done();
            });
    });

});