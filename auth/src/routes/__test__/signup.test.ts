import request from 'supertest';
import {app} from '../../app'

it('returns a 201 on successful signup', async () => {
    return request(app)
        .post('/api/users/signup')
        .send({
            email: 'neo@xeon.net',
            password: 'TheOne'
        })
        .expect(201)
});

it('returns 400 with an invalid email', async () => {
    return request(app)
        .post('/api/users/signup')
        .send({
            email: 'morpheus.xeon.net',
            password: 'RedPill'
        })
        .expect(400)
});

it('returns 400 with an invalid password', async () => {
    return request(app)
        .post('/api/users/signup')
        .send({
            email: 'morpheus@xeon.net',
            password: 'Red'
        })
        .expect(400)
});

it('returns 400 with missing email and password', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'morpheus@xeon.net',
            password: ''
        })
        .expect(400)

    await request(app)
        .post('/api/users/signup')
        .send({
            email: '',
            password: 'TheOne'
        })
        .expect(400)
});

it('disallows duplicate emails', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'neo@xeon.net',
            password: 'TheOne'
        })
        .expect(201)

    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'neo@xeon.net',
            password: 'TheOne'
        })
        .expect(400)
});

it('sets a cookie after successful signup', async () => {

    const response = await request(app)
        .post('/api/users/signup')
        .send({
            email: 'neo@xeon.net',
            password: 'TheOne'
        })
        expect(response.get('Set-Cookie')).toBeDefined()
})