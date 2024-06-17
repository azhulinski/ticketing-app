import request from 'supertest';
import {app} from '../../app'

it('clears the cookie after singing out', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'neo@xeon.net',
            password: 'TheOne'
        })
        .expect(201)

    const responseSignIn = await request(app)
        .post('/api/users/signin')
        .send({
            email: 'neo@xeon.net',
            password: 'TheOne'
        })
        .expect(200)
    expect(responseSignIn.get('Set-Cookie')).toBeDefined()

    const responseSignOut = await request(app)
        .post('/api/users/signout')
        .send({
        })
        .expect(200)
    expect((responseSignOut.get('Set-Cookie') as Array<string>)[0]).toEqual('session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly')
});