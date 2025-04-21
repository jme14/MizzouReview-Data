import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import inquirer from 'inquirer';

import { writeOptions } from './main.js';

import { initializeDatabase } from './database/initializer.js';
import { getDatabaseMetrics } from './database/reader.js';
import { Firestore } from 'firebase-admin/firestore';
interface WriteOptionsArgs {
    mucatalog: boolean;
    mucourses: boolean;
    wikipedia: boolean;
    rmp: boolean;
    rmpOverwrite: boolean;
    databaseMetrics: boolean;
}
// Parse CLI arguments
const argv = yargs(hideBin(process.argv))
    .option('mucatalog', {
        type: 'boolean',
        description: 'Include MU Catalog scraping',
        default: false,
    })
    .option('mucourses', {
        type: 'boolean',
        description: 'Include MU Courses scraping',
        default: false,
    })
    .option('wikipedia', {
        type: 'boolean',
        description: 'Include Wikipedia scraping',
        default: false,
    })
    .option('rmp', {
        type: 'boolean',
        description: 'Include RateMyProfessors scraping',
        default: false,
    })
    .option('rmpOverwrite', {
        type: 'boolean',
        description: 'Include RateMyProfessors scraping and overwrite data',
        default: false,
    })
    .option('databaseMetrics', {
        type: 'boolean',
        description: 'Read database and get data from it',
        default: false,
    })
    .help()
    .alias('help', 'h')
    .parseSync() as WriteOptionsArgs;

async function main() {
    const options = {
        mucatalog: argv.mucatalog,
        mucourses: argv.mucourses,
        wikipedia: argv.wikipedia,
        rmp: argv.rmp,
        rmpOverwrite: argv.rmpOverwrite,
        databaseMetrics: argv.databaseMetrics,
    };

    if (options.rmp && options.rmpOverwrite) {
        console.log('Choose between rmp and rmpOverwrite');
        process.exit(1);
    }
    const selected =
        Object.entries(options)
            .filter(([_, value]) => value)
            .map(([key]) => key)
            .join(', ') || 'None';

    const { confirm } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'confirm',
            message: `Proceed with options: ${selected}?`,
            default: false,
        },
    ]);

    if (!confirm) {
        console.log('Cancelled.');
        process.exit(0);
    }

    if (options.databaseMetrics) {
        const db: Firestore = initializeDatabase();
        console.log('\n');
        await getDatabaseMetrics(db);
        process.exit(0);
    }
    try {
        const result = await writeOptions(options);
        console.log('✔ Success:', result);
        process.exit(0);
    } catch (err) {
        console.error('❌ Failed:', err);
        process.exit(1);
    }
}

main();
