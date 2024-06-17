import request from 'supertest';
import {app} from '../../app'

it("fails when a email doesn't exist is supplied", async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'neo@xeon.net',
            password: 'TheOne'
        })

    await request(app)
        .post('/api/users/signin')
        .send({
            email: 'morpheus@xeon.net',
            password: 'RedPill'
        })
        .expect(400)
})

it('fails when incorrect password is supplied', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'neo@xeon.net',
            password: 'TheOne'
        })

    await request(app)
        .post('/api/users/signin')
        .send({
            email: 'neo@xeon.net',
            password: 'RedPill'
        })
        .expect(400)
})

it('responds with a cookie when given valid credentials', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'neo@xeon.net',
            password: 'TheOne'
        })
        .expect(201)

    const response = await request(app)
        .post('/api/users/signin')
        .send({
            email: 'neo@xeon.net',
            password: 'TheOne'
        })
        .expect(200)

    expect(response.get('Set-Cookie')).toBeDefined()
})