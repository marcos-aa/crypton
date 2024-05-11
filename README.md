# Crypton

Create customizable cryptocurrency streams with your chosen pairs and track their price changes, total trade count, volume and more in realtime.

![Crypton dashboard screenshot](/assets/dashboard.png?raw=true "Crypton dashboard")

## Features

- [x]  Track multiple crypto pairs concurrently
- [x]  Modify and delete streams at will
- [x]  Compare latest prices to historical data
- [x]  Manage websocket ticker subscriptions and unsubscriptions
- [x]  Export local stream lists to cloud
- [x]  Cached ticker prices to avoid extra requests
- [x]  Batch updates and throttling to avoid performance pitfalls
- [x]  Preview app features with guest account
- [x]  Access to streams across different devices with verified account
- [x]  Keep user logged in with JWT tokens
- [x]  Update user's email and password

## How to run locally

Please be aware the the following instructions were made for those using Yarn 4 and it's PnP module management instead of the usual `node_modules` folder. If you plan to use other package manager, please modify the package.json file configurations accordingly.

1. Run the `yarn` command at the root of the repository to install all workspace dependencies.
2. Create a `.env` file within `/backend` and fill it with values according to the examples found in `/backend/.env.example`.
3. Run `yarn setup` to generate the prisma client and create the mongo db indexes present in the schema. You can modify the `setup` within `/backend` command to change the location the prisma client will be generated in.
4. Run `yarn dev` at the root of the project to run both client and servers concurrently or run the same command inside the `/frontend` and `backend` repositories to run each individually.
5. Run `yarn build` to prepare both client and server code for production.

## IDE SDKs for Typescript

If your IDE doesn't recognize Typescript is present after you've installed the dependencies, check out the [Yarn SDKs for smart code editors page](https://yarnpkg.com/getting-started/editor-sdks) for a guide on how to properly set up TS on your IDE when using PnP. Notice this is purely an IDE problem and the code will run properly regardless of the warnings.
