process.env.NODE_ENV = 'test';
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;

const app = require('../app.js');
const { 
    clearMeetingsCollection, 
    clearUserMeetingCollection, 
    clearUsersCollection 
} = require('../helpers/helpers.js');

chai.use(chaiHttp);

let token_1;
let token_2;
let meetingId;
let userId_1;
let userId_2;

describe('Meeting endpoints tests', function() {
    before(async function() {
        await clearMeetingsCollection();

        const user_1 = {
            name: 'alio',
            email: 'alio@mail.com', 
            password: 'alio'
        };

        const user_2 = {
            name: 'zura',
            email: 'zura@mail.com', 
            password: 'zura'
        };

        await chai
                .request(app)
                .post('/register')
                .send(user_1);

        await chai
                .request(app)
                .post('/register')
                .send(user_2);
        
        const response_1 = await chai
                                .request(app)
                                .post('/login')
                                .send(user_1);

        const response_2 = await chai
                                .request(app)
                                .post('/login')
                                .send(user_2);

        token_1 = response_1.body.token;
        userId_1 = response_1.body.user._id;

        token_2 = response_2.body.token;
        userId_2 = response_2.body.user._id;
    });

    after(async function() {
        await clearMeetingsCollection();
        await clearUsersCollection();
        await clearUserMeetingCollection();
    });

    describe('GET /meetings', function() {
        it('should send an array of meetings and a 200 status code', async function() {
            const response = await chai 
                                    .request(app)
                                    .get('/meetings');

            expect(response).to.have.status(200);
            expect(response.body).to.be.an('array');
        });
    });

    describe('POST /meetings', function() {
        it('should send success message and a 201 status code', async function() {
            this.timeout(5000);

            const meetingData = {
                title: 'Test Create Meeting',
                description: 'Cannot be late for this one.',
                startAt: new Date(),
                place: 'Hacktiv8 Indonesia'
            };

            const response = await chai
                                    .request(app)
                                    .post('/meetings')
                                    .set('token', token_1)
                                    .send(meetingData);

            expect(response).to.have.status(201);
            expect(response.body).to.be.an('object');
            expect(response.body).to.have.property('message');
            expect(response.body).to.have.property('meeting');
            expect(response.body.meeting).to.have.property('_id');
            expect(response.body.meeting).to.have.property('title');
            expect(response.body.meeting).to.have.property('description');
            expect(response.body.meeting).to.have.property('place');
            expect(response.body.meeting).to.have.property('startAt');
            expect(response.body.message).to.equal('Create Meeting Success');
            expect(response.body.meeting.title).to.equal(meetingData.title);
            expect(response.body.meeting.description).to.equal(meetingData.description);
            expect(response.body.meeting.place).to.equal(meetingData.place);

            meetingId = response.body.meeting._id;
        });

        it('should send an error object with a message and a 500 status code if no token is provided', async function() {
            const meetingData = {
                title: 'Test Create Meeting',
                description: 'Cannot be late for this one.',
                startAt: new Date(),
                place: 'Hacktiv8 Indonesia'
            };

            const response = await chai
                                    .request(app)
                                    .post('/meetings')
                                    .send(meetingData);

            expect(response).to.have.status(500);
            expect(response.body).to.be.an('object');
            expect(response.body).to.have.property('message');
            expect(response.body.message).to.equal('User Credential Required');
        });

        it('should send an error object with a message and a 500 status code if token provided is invalid', async function () {
            const response = await chai
                                    .request(app)
                                    .post('/meetings')
                                    .set('token', 'alio');
      
            expect(response).to.have.status(500);
            expect(response.body).to.be.an('object');
            expect(response.body).to.have.property('message');
            expect(response.body.message).to.equal('Invalid User Credential');
        });

        it('should send an error object with a message and a 500 status code if meeting title is not provided', async function() {
            const meetingData = {
                title: '',
                description: 'Cannot be late for this one.',
                startAt: new Date(),
                place: 'Hacktiv8 Indonesia'
            };

            const response = await chai
                              .request(app)
                              .post('/meetings')
                              .set('token', token_1)
                              .send(meetingData);

            expect(response).to.have.status(500);
            expect(response.body).to.be.an('object');
            expect(response.body).to.have.property('message');
            expect(response.body).to.have.property('error');
            expect(response.body.message).to.equal('Error when creating Meeting');
            expect(response.body.error.message).to.equal('Meeting validation failed: title: title is Required');
        });

        it('should send an error object with a message and a 500 status code if meeting title length is less than 10', async function () {
            const meetingData = {
                title: 'Haha',
                description: 'Cannot be late for this one.',
                startAt: new Date(),
                place: 'Hacktiv8 Indonesia'
            };

            const response = await chai
                              .request(app)
                              .post('/meetings')
                              .set('token', token_1)
                              .send(meetingData);

            expect(response).to.have.status(500);
            expect(response.body).to.be.an('object');
            expect(response.body).to.have.property('message');
            expect(response.body.message).to.equal('Error when creating Meeting');
        });

        it('should send an error object with a message and a 500 status code if meeting startAt is not provided', async function () {
            const meetingData = {
                title: 'Test Create Meeting',
                description: 'Cannot be late for this one.',
                place: 'Hacktiv8 Indonesia'
            };

            const response = await chai
                              .request(app)
                              .post('/meetings')
                              .set('token', token_1)
                              .send(meetingData);

            expect(response).to.have.status(500);
            expect(response.body).to.be.an('object');
            expect(response.body).to.have.property('message');
            expect(response.body).to.have.property('error');
            expect(response.body.message).to.equal('Error when creating Meeting');
            expect(response.body.error.message).to.equal('Meeting validation failed: startAt: start date is Required');
        });
    });

    describe('GET /meetings/:id', function() {
        it('should send an object and a 200 status code', async function() {
            const response = await chai 
                                    .request(app)
                                    .get(`/meetings/${meetingId}`);

            expect(response).to.have.status(200);
            expect(response.body).to.be.an('object');
            expect(response.body).to.have.property('_id');
            expect(response.body).to.have.property('title');
            expect(response.body).to.have.property('description');
            expect(response.body).to.have.property('startAt');
            expect(response.body).to.have.property('place');
        });

        it('should send an error object with a message and a 500 status code if meeting _id is wrong', async function () {
            const response = await chai
                                    .request(app)
                                    .get('/meetings/12345');
      
            expect(response).to.have.status(500);
            expect(response.body).to.be.an("object");
            expect(response.body).to.have.property('message');
            expect(response.body.message).to.equal('Error when getting Meeting.');
        });
    });

    describe('PUT /meetings/:id', function() {
        it('should send an updated meeting object and a 200 status code', async function() {
            this.timeout(5000);

            const updatedMeeting = {
                title: 'Test Create Meeting Update',
                description: 'Can be late for this one.',
                startAt: new Date(),
                place: 'Pondok Indah Mall'
            };

            const response = await chai
                                    .request(app)
                                    .put(`/meetings/${meetingId}`)
                                    .set('token', token_1)
                                    .send(updatedMeeting);

            expect(response).to.have.status(200);
            expect(response.body).to.be.an('object');
            expect(response.body).to.have.property('_id');
            expect(response.body).to.have.property('title');
            expect(response.body).to.have.property('description');
            expect(response.body).to.have.property('place');
            expect(response.body.title).to.equal(updatedMeeting.title);
            expect(response.body.description).to.equal(updatedMeeting.description);
            expect(response.body.place).to.equal(updatedMeeting.place);
        });

        it('should send an error object with a message and a 500 status code if no token is provided', async function() {
            const updatedMeeting = {
                title: 'Test Create Meeting Update',
                description: 'Can be late for this one.',
                startAt: new Date(),
                place: 'Pondok Indah Mall'
            };

            const response = await chai
                                    .request(app)
                                    .put(`/meetings/${meetingId}`)
                                    .send(updatedMeeting);

            expect(response).to.have.status(500);
            expect(response.body).to.be.an('object');
            expect(response.body).to.have.property('message');
            expect(response.body.message).to.equal('User Credential Required');
        });

        it('should send an error object with a message and a 500 status code if token provided is invalid', async function () {
            const response = await chai
                                    .request(app)
                                    .put(`/meetings/${meetingId}`)
                                    .set('token', 'alio');
      
            expect(response).to.have.status(500);
            expect(response.body).to.be.an('object');
            expect(response.body).to.have.property('message');
            expect(response.body.message).to.equal('Invalid User Credential');
        });

        it('should send an error object with a message and a 500 status code if meeting _id is wrong', async function () {
            const response = await chai
                                    .request(app)
                                    .put('/meetings/12345')
                                    .set('token', token_1);
      
            expect(response).to.have.status(500);
            expect(response.body).to.be.an('object');
            expect(response.body).to.have.property('message');
            expect(response.body.message).to.equal('Error when getting meeting');
        });

        it('should send an error object with a message and a 500 status code if meeting title length is less than 10', async function () {
            const updatedMeeting = {
                title: 'Haha',
                description: 'Cannot be late for this one.',
                startAt: new Date(),
                place: 'Hacktiv8 Indonesia'
            };

            const response = await chai
                              .request(app)
                              .put(`/meetings/${meetingId}`)
                              .set('token', token_1)
                              .send(updatedMeeting);

            expect(response).to.have.status(500);
            expect(response.body).to.be.an('object');
            expect(response.body).to.have.property('message');
            expect(response.body.message).to.equal('Error when updating Meeting.');
        });
    });

    describe('DELETE /meetings/:id', function() {
        it('should send a notification message and a 200 status code', async function() {
            const response = await chai
                                    .request(app)
                                    .delete(`/meetings/${meetingId}`)
                                    .set('token', token_1);
      
            expect(response).to.have.status(200);
            expect(response.body).to.be.an('object');
            expect(response.body).to.have.property('message');
            expect(response.body.message).to.equal('Successfully deleted meeting');
        });

        it('should send an error object with a message and a 500 status code if no token is provided', async function() {
            const response = await chai
                                    .request(app)
                                    .delete(`/meetings/${meetingId}`);

            expect(response).to.have.status(500);
            expect(response.body).to.be.an('object');
            expect(response.body).to.have.property('message');
            expect(response.body.message).to.equal('User Credential Required');
        });

        it('should send an error object with a message and a 500 status code if token provided is invalid', async function () {
            const response = await chai
                                    .request(app)
                                    .delete(`/meetings/${meetingId}`)
                                    .set('token', 'alio');
      
            expect(response).to.have.status(500);
            expect(response.body).to.be.an('object');
            expect(response.body).to.have.property('message');
            expect(response.body.message).to.equal('Invalid User Credential');
        });

        it('should send an error object with a message and a 500 status code if meeting _id is wrong', async function () {
            const response = await chai
                                    .request(app)
                                    .delete('/meetings/12345')
                                    .set('token', token_1);
      
            expect(response).to.have.status(500);
            expect(response.body).to.be.an('object');
            expect(response.body).to.have.property('message');
            expect(response.body.message).to.equal('Error when getting meeting');
        });
    });

    describe('GET /meetings/users/:id', function() {
        it('should return an array (assuming there are other users registered) and a 200 status code', async function() {
            const response = await chai
                                    .request(app)
                                    .get(`/meetings/users/${meetingId}`);

            expect(response).to.have.status(200);
            expect(response.body).to.be.an('array');
            expect(response.body[0]).to.have.property('participant');
            expect(response.body[0]).to.have.property('meeting');
            expect(response.body[0]).to.have.property('departTime');
            expect(response.body[0].participant).to.have.property('_id');
            expect(response.body[0].participant).to.have.property('name');
            expect(response.body[0].participant).to.have.property('email');
            expect(response.body[0].participant._id).to.equal(userId_1);
            expect(response.body[0].participant.name).to.equal('alio');
            expect(response.body[0].participant.email).to.equal('alio@mail.com');
        });

        it('should send an error object with a message and a 500 status code if meeting _id is wrong', async function () {
            const response = await chai
                                    .request(app)
                                    .get('/meetings/users/12345');
      
            expect(response).to.have.status(500);
            expect(response.body).to.be.an('object');
            expect(response.body).to.have.property('message');
            expect(response.body.message).to.equal('Error when getting UserMeeting.');
        });
    });

    describe('GET /meetings/userstoinvite/:meetingId', function() {
        it('should return an array of uninvited users and a 200 status code', async function() {
            const response = await chai
                                    .request(app)
                                    .get(`/meetings/userstoinvite/${meetingId}`)
                                    .set('token', token_1);
            
            expect(response).to.have.status(200);
            expect(response.body).to.be.an('array');
            expect(response.body[0]).to.have.property('_id');
            expect(response.body[0]).to.have.property('name');
            expect(response.body[0]).to.have.property('email');
            expect(response.body[0]._id).to.equal(userId_2);
            expect(response.body[0].name).to.equal('zura');
            expect(response.body[0].email).to.equal('zura@mail.com');
        });

        it('should send an error object with a message and a 500 status code if no token is provided', async function() {
            const response = await chai
                                    .request(app)
                                    .get(`/meetings/userstoinvite/${meetingId}`);
    
            expect(response).to.have.status(500);
            expect(response.body).to.be.an('object');
            expect(response.body).to.have.property('message');
            expect(response.body.message).to.equal('User Credential Required');
        });
    
        it('should send an error object with a message and a 500 status code if token provided is invalid', async function () {
            const response = await chai
                                    .request(app)
                                    .get(`/meetings/userstoinvite/${meetingId}`)
                                    .set('token', 'alio');
      
            expect(response).to.have.status(500);
            expect(response.body).to.be.an('object');
            expect(response.body).to.have.property('message');
            expect(response.body.message).to.equal('Invalid User Credential');
        });
    
        it('should send an error object with a message and a 500 status code if meeting _id is wrong', async function () {
            const response = await chai
                                    .request(app)
                                    .get(`/meetings/userstoinvite/12345`)
                                    .set('token', token_1);
      
            expect(response).to.have.status(500);
            expect(response.body).to.be.an('object');
            expect(response.body).to.have.property('message');
            expect(response.body.message).to.equal('Error Getting Uninvited Users');
        });
    });

    describe('GET /meetings/invite/:id/:userId', function() {
        it('should return an object with a success message and a 200 status code', async function() {
            const response_invite = await chai
                                    .request(app)
                                    .get(`/meetings/invite/${meetingId}/${userId_2}`)
                                    .set('token', token_1);

            const response_user2 = await chai
                                    .request(app)
                                    .get(`/users/${userId_2}`)
                                    .set('token', token_2);

            expect(response_invite).to.have.status(200);
            expect(response_invite).to.be.an('object');
            expect(response_invite.body).to.have.property('message');
            expect(response_invite.body.message).to.equal(`Meeting invitation send to ${response_user2.body.name}`);
        });

        it('should send an error object with a message and a 500 status code if no token is provided', async function() {
            const response = await chai
                                    .request(app)
                                    .get(`/meetings/invite/${meetingId}/${userId_2}`)
    
            expect(response).to.have.status(500);
            expect(response.body).to.be.an('object');
            expect(response.body).to.have.property('message');
            expect(response.body.message).to.equal('User Credential Required');
        });
    
        it('should send an error object with a message and a 500 status code if token provided is invalid', async function () {
            const response = await chai
                                    .request(app)
                                    .get(`/meetings/invite/${meetingId}/${userId_2}`)
                                    .set('token', 'alio');
      
            expect(response).to.have.status(500);
            expect(response.body).to.be.an('object');
            expect(response.body).to.have.property('message');
            expect(response.body.message).to.equal('Invalid User Credential');
        });
    
        it('should send an error object with a message and a 500 status code if meeting _id is wrong', async function () {
            const response = await chai
                                    .request(app)
                                    .get(`/meetings/invite/12345/${userId_2}`)
                                    .set('token', token_1);
      
            expect(response).to.have.status(500);
            expect(response.body).to.be.an('object');
            expect(response.body).to.have.property('message');
            expect(response.body.message).to.equal('Error when sending invitation.');
        });

        it('should send an error object with a message and a 500 status code if invited user _id is wrong', async function () {
            const response = await chai
                                    .request(app)
                                    .get(`/meetings/invite/${meetingId}/12345`)
                                    .set('token', token_1);
      
            expect(response).to.have.status(500);
            expect(response.body).to.be.an('object');
            expect(response.body).to.have.property('message');
            expect(response.body.message).to.equal('Error when sending invitation.');
        });
    });

    describe('GET /meetings/refuse/:id', function() {
        it('should return an object with a success message and a 200 status code', async function() {
            const response = await chai
                                    .request(app)
                                    .get(`/meetings/refuse/${meetingId}`)
                                    .set('token', token_2);

            expect(response).to.have.status(200);
            expect(response).to.be.an('object');
            expect(response.body).to.have.property('message');
            expect(response.body.message).to.equal(`Successfully refused the invitation`);
        });

        it('should send an error object with a message and a 500 status code if no token is provided', async function() {
            const response = await chai
                                    .request(app)
                                    .get(`/meetings/refuse/${meetingId}`)
    
            expect(response).to.have.status(500);
            expect(response.body).to.be.an('object');
            expect(response.body).to.have.property('message');
            expect(response.body.message).to.equal('User Credential Required');
        });
    
        it('should send an error object with a message and a 500 status code if token provided is invalid', async function () {
            const response = await chai
                                    .request(app)
                                    .get(`/meetings/refuse/${meetingId}`)
                                    .set('token', 'alio');
      
            expect(response).to.have.status(500);
            expect(response.body).to.be.an('object');
            expect(response.body).to.have.property('message');
            expect(response.body.message).to.equal('Invalid User Credential');
        });
    
        it('should send an error object with a message and a 500 status code if meeting _id is wrong', async function () {
            const response = await chai
                                    .request(app)
                                    .get(`/meetings/refuse/12345`)
                                    .set('token', token_2);
      
            expect(response).to.have.status(500);
            expect(response.body).to.be.an('object');
            expect(response.body).to.have.property('message');
            expect(response.body.message).to.equal('Error refusing invitation');
        });
    });

    // describe('GET /meetings/accept/:id', function() {
    //     it('should return an object with a success message and a 200 status code', async function() {
    //         const response = await chai
    //                                 .request(app)
    //                                 .get(`/meetings/refuse/${meetingId}`)
    //                                 .set('token', token_2);

    //         expect(response).to.have.status(200);
    //         expect(response).to.be.an('object');
    //         expect(response.body).to.have.property('message');
    //         expect(response.body.message).to.equal(`Successfully refused the invitation`);
    //     });
    // });
}); 