import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { cors } from 'hono/cors';
import summary from './summary';
import accounts from './accounts';
import categories from './categories';
import transactions from './transactions';
import goals from './goals';
import recurring from './recurring';
import profile from './profile';
import budgets from './budgets';
import emergencyFund from './emergency-fund';
import cpf from './cpf';
import netWorth from './net-worth';
import investments from './investments';
import forecast from './forecast';

export const runtime = 'edge';

const app = new Hono().basePath('/api')

app.use('*', cors())

const routes = app
    .route("/summary", summary)
    .route("/accounts", accounts)
    .route("/categories", categories)
    .route("/transactions", transactions)
    .route("/goals", goals)
    .route("/recurring", recurring)
    .route("/profile", profile)
    .route("/budgets", budgets)
    .route("/emergency-fund", emergencyFund)
    .route("/cpf", cpf)
    .route("/net-worth", netWorth)
    .route("/investments", investments)
    .route("/forecast", forecast);

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
export const OPTIONS = handle(app);

export type AppType = typeof routes;