import {useState} from 'react';
import Router from 'next/router';
import useRequest from '../../hooks/use-request';

export default () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const {doRequest, errors} = useRequest({
        url: '/api/users/signin',
        method: 'post',
        body: {
            email,
            password
        },
        onSuccess: () => Router.push('/')
    });

    const onSubmit = async event => {
        event.preventDefault();

        await doRequest();
    };

    return (
        <div
            style={{
                width: '400px',
                display: 'grid',
                margin: '2rem auto auto auto',
                border: '1px solid gray',
                borderRadius: '0.5rem'
            }}>
            <form style={{width: '100%'}} onSubmit={onSubmit}>
                <h1 style={{margin: '1rem'}}>Sign In</h1>
                <div className="form-group" style={{margin: '1rem'}}>
                    <label>Email Address</label>
                    <input
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="form-control"
                    />
                </div>
                <div className="form-group" style={{margin: '1rem'}}>
                    <label>Password</label>
                    <input
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        type="password"
                        className="form-control"
                    />
                </div>
                {errors}
                <button className="btn btn-primary" style={{margin: '1rem'}}>Sign Up</button>
            </form>
        </div>
    );
};
