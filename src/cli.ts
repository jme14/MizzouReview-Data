import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import inquirer from 'inquirer';

import { writeOptions } from './main.js';

interface WriteOptionsArgs {
    mucatalog: boolean;
    mucourses: boolean;
    wikipedia: boolean;
    rmp: boolean;
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
    .help()
    .alias('help', 'h')
    .parseSync() as WriteOptionsArgs;

async function main() {
    const options = {
        mucatalog: argv.mucatalog,
        mucourses: argv.mucourses,
        wikipedia: argv.wikipedia,
        rmp: argv.rmp,
    };

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
