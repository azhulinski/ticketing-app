import {Ticket} from '../ticket';

it('implements optimistic concurrency control', async () => {
    const ticket = Ticket.build({
        title: 'Test Ticket',
        price: 5,
        userId: '123'
    })
    await ticket.save();

    const firstInstance = await Ticket.findById(ticket.id);
    const secondInstance = await Ticket.findById(ticket.id);

    firstInstance!.set({price: 10})
    firstInstance!.set({price: 15})

    await firstInstance!.save()

    try {
        await secondInstance!.save()
    } catch (error) {
        console.log(error)
        return;
    }
});

it('increments the version number on multiple saves', async () => {
    const ticket = Ticket.build({
        title: 'Test Ticket',
        price: 5,
        userId: '123'
    });
    await ticket.save();
    expect(ticket.version).toEqual(0);

    await ticket.save();
    expect(ticket.version).toEqual(1);
})