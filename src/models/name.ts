export class Name {
    fname: string;
    mname?: string[];
    lname: string;

    constructor(fname: string, lname: string, mname?: string[]) {
        this.fname = fname;
        this.lname = lname;
        if (mname) {
            this.mname = mname;
        }
    }
    equals(other: Name): boolean {
        return (
            this.fname === other.fname &&
            this.lname === other.lname &&
            this.mname === other.mname
        );
    }

    equalityIgnoringMiddleName(other: Name): boolean {
        return this.fname === other.fname && this.lname === other.lname;
    }
    toString() {
        return `${this.fname} ${this.lname}`;
    }

    static getNameFromString(strToFormat: string, formatting: string): Name {
        // changing the string so that weird characters don't mess things up
        strToFormat = strToFormat
            .replaceAll('.', '')
            .replaceAll(' - ', '-')
            .replaceAll('`', '')
            .replaceAll('‰', '')
            .replaceAll(', ', ',')
            .replaceAll('/', ' ');

        // attempt to fix weird api name issues
        function hasMojibake(str: string) {
            // Common misinterpreted UTF-8 characters
            const mojibakePattern = /Ã±|Ã©|Ã¡|Ã³|Ãº|â€™|â€œ|â€�/;
            return mojibakePattern.test(str);
        }
        function hasBrokenChar(str: string) {
            return str.includes('\uFFFD');
        }

        if (hasMojibake(strToFormat) || hasBrokenChar(strToFormat)) {
            console.log('WARNING: GENERATING FAKE NAME');
            return new Name('Fake', 'Name');
        }
        let pattern = formatting
            .replace('{fname}', "(?<fname>[\\w\\-\\p{L}'‘]+)")
            // remove the white space around mname if it exists
            // then, on right, optionally replace with formatter that includes any amount of words with spaces
            .replace(
                /\s*\{mname\}\s*/,
                "(?:\\s+(?<mname>[\\w\\s\\p{L}'\\-‘]+))?\\s+",
            )
            .replace('{lname}', "(?<lname>[\\w\\s\\-\\p{L}‘']+)");

        let regex = new RegExp(`^${pattern}$`, 'u');
        let match = strToFormat.match(regex);

        console.log(regex)
        if (!match || !match.groups) {
            // TODO: fix this stupidity lol
            if (strToFormat.endsWith(' ')) {
                throw new Error(
                    `String '${strToFormat}' does not match format '${formatting}'`,
                );
                // if no comma present but there should be
            } else if (formatting.includes(',') && !strToFormat.includes(',')) {
                console.log('NO COMMA BUT THERE SHOULD BE');
                if (strToFormat.includes(' ')) {
                    return Name.getNameFromString(
                        strToFormat.replace(' ', ','),
                        formatting,
                    );
                    // people like prince exist i guess...
                } else {
                    return new Name(strToFormat, 'Noname');
                }
                // if comma only at the end, guess that the comma should replace the first space
            } else if (strToFormat.includes(',') && strToFormat.endsWith(',')) {
                console.log('COMMA AT THE END TRYING TO FIND A BETTER SOPT');
                return Name.getNameFromString(
                    strToFormat
                        .replace(' ', ',')
                        .substring(0, strToFormat.length - 1),
                    formatting,
                );
            } else {
                return Name.getNameFromString(strToFormat + ' ', formatting);
            }
        }

        if (match.groups.mname) {
            return new Name(
                match.groups.fname,
                match.groups.lname,
                match.groups.mname.split(' '),
            );
        }
        return new Name(match.groups.fname, match.groups.lname);
    }
}
