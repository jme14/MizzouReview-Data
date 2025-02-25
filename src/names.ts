
// TODO: move name handling to a different module
export function someMiddleInitial(
    fname: string,
    lname: string,
    str: string,
): boolean {
    const lastInitial = new RegExp(
        `${lname.toUpperCase()},${fname.toUpperCase()} [A-Z]`,
    );
    return lastInitial.test(str.trim());
}

export function someMiddleName(
    fname: string,
    lname: string,
    str: string,
): boolean {
    const lastInitial = new RegExp(
        `${lname.toUpperCase()},${fname.toUpperCase()} [A-Z]*`,
    );
    return lastInitial.test(str.trim());
}