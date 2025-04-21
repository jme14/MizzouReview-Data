# TMNH Capstone Project

### Step 1: Install Dependencies

`npm install`

This is how the dependencies listed in "package.json" are installed

### Step 2: Environment Variables

a) Firebase > Project Settings > Service Accounts > Firebase Admin SDK >
Generate New Private Key
b) Create and move content to .env in the following format:

```
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=mizzoureview-5ca78
...
```

c) add the following lines to .env
TESTING=true
PROF_READ_LIMIT=20
RMP_ARRAY_LIMIT=10

### Step 3: Run!

`npm run write -- {args}`

#### What can you write?

To run all the data collection, run the following command:
`npm run write -- --mucatalog --mucourses --wikipedia --rmp`
To update information for a given module, simply run the command only with the arguments desired
