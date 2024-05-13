# Crypton

Create customizable cryptocurrency streams with your chosen pairs and track their price changes, total trade count, volume and more in realtime.

![Crypton dashboard screenshot](/assets/dashboard.png?raw=true "Crypton dashboard")

## Features

- [x] Track multiple crypto pairs concurrently
- [x] Modify and delete streams at will
- [x] Compare latest prices to historical data
- [x] Manage websocket ticker subscriptions and unsubscriptions
- [x] Export local stream lists to cloud
- [x] Cached ticker prices to avoid extra requests
- [x] Batch updates and throttling to avoid performance pitfalls
- [x] Preview app features with guest account
- [x] Access to streams across different devices with verified account
- [x] Keep user logged in with JWT tokens
- [x] Update user's email and password

## How to run this APP locally

1. Install the project's dependencies by running `npm install` or your package manager's respective command inside the `backend` and `frontend` directories.
2. Create a `.env` file inside the `backend` directory and fill it with the necessary values in accordance with the examples provided in `./backend/.env.examples`
3. Run the `setup` script with your package manager to generate the prisma database client and create the unique database indexes within the mongodb instance you configured earlier in the `.env` file.
4. Run the `dev` script within `./backend` to launch the node js development server.
5. Run the `dev` script within `./frontend` to launch the react development server.
