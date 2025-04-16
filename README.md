# TMNH Capstone Project

### Step 1: Install Dependencies
``` npm install ```

This is how the dependencies listed in "package.json" are installed

### Step 2: Obtain admin.json

a) Firebase > Project Settings > Service Accounts > Firebase Admin SDK > 
Generate New Private Key 
b) Move this downloaded json file to keys/ directory
c) Rename to admin.json

### Step 3: Run! 
```npm run write -- {args}```

#### What can you write? 
To run all the data collection, run the following command:
```npm run write -- --mucatalog --mucourses --wikipedia --rmp```
To update information for a given module, simply run the command only with the arguments desired 