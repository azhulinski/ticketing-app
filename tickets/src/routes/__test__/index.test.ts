import request from 'supertest';
import {app} from '../../app';

const createTickets = (i: number) => {
    return request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: `some title #${i}`,
            price: i * 2
        })
}

it('should fetch a list of tickets', async () => {

    for (let i = 1; i <= 5; i++) {
        await createTickets(i);
    }

    const response = await request(app)
        .get('/api/tickets')
        .set('Cookie', global.signin())
        .send()
        .expect(200)

    expect(response.body.length).toEqual(5)
});