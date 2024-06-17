import express from 'express';
import 'express-async-errors';
import {json} from 'body-parser';
import cookieSession from 'cookie-session';
import {indexOrderRouter} from "./routes/index";
import {deleteOrderRouter} from "./routes/delete";
import {createOrderRouter} from "./routes/new";
import {showOrderRouter} from "./routes/show";
import {currentUser, errorHandler, NotFoundError} from '@zhulinski/gittix-common';

const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(
    cookieSession({
        signed: false,
        secure: process.env.NODE_ENV !== 'test'
    })
);
app.use(currentUser)
app.use(indexOrderRouter);
app.use(deleteOrderRouter);
app.use(createOrderRouter);
app.use(showOrderRouter);
app.all('*', async (req, res) => {
    throw new NotFoundError();
});

app.use(errorHandler);

export {app};
