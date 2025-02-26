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

    equalityIgnoringMiddleName(other: Name): boolean{
        return (
            this.fname === other.fname &&
            this.lname === other.lname 
        );
    } 

    static getNameFromString(strToFormat: string, formatting: string): Name {
        let pattern = formatting
            .replace('{fname}', '(?<fname>[\\w\-]+)')
            // remove the white space around mname if it exists
            // then, on right, optionally replace with formatter that includes any amount of words with spaces
            .replace(/\s*\{mname\}\s*/, '(?:\\s+(?<mname>[\\w\\s]+))?\\s+')
            .replace('{lname}', '(?<lname>[\\w\\s\-]+)');

        let regex = new RegExp(`^${pattern}$`);
        let match = strToFormat.match(regex);

        if (!match || !match.groups) {
            // TODO: fix this stupidity lol
            if (strToFormat.endsWith(' ')) {
                throw new Error(
                    `String '${strToFormat}' does not match format '${formatting}'`,
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
