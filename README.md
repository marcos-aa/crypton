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

## Problems with US based servers and github hosted runners
US-based servers such as the ones used by github hosted runners will encounter a 'Restricted location' error when using Binance's `.com` API endpoint due to US user access restrictions. __Use one of the following solutions to get around this problem__:
1. Change the Binance API endpoint located at [index.ts](./backend/src/utils/Stream/index.ts) from `.com` to `.us`. _Note:  this is the easiest solution, but will reduce the amount of available currency pairs from 2000+ to around 500._
2. Deploy a [self-hosted runner](https://docs.github.com/en/actions/hosting-your-own-runners/managing-self-hosted-runners/about-self-hosted-runners) located outside the US and run this repo's actions with it.
