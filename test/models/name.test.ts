import { expect, test, describe } from 'vitest';
import { Name } from '../../src/models/name';

describe('Testing name creation', () => {
    test('testing name creation', () => {
        const myName = new Name('Trey', 'Williams');
    });
});
describe('Testing static name creation', () => {
    test('{fname} {lname}', () => {
        const exampleName = 'Jim Ries';
        const myName = Name.getNameFromString(exampleName, '{fname} {lname}');
        expect(myName).toStrictEqual(new Name("Jim", "Ries"))
    });
    test('{fname} {mname} {lname}', () => {
        const exampleName = 'Jim E Ries';
        const myName = Name.getNameFromString(exampleName, '{fname} {mname} {lname}');
        expect(myName).toStrictEqual(new Name("Jim", "Ries", ["E"]))
    });
    test('{fname} {mname} {lname} with no middle name ', () => {
        const exampleName = 'Jim Ries';
        const myName = Name.getNameFromString(exampleName, '{fname} {mname} {lname}');
        expect(myName).toStrictEqual(new Name("Jim", "Ries"))
    });
    test('{lname}, {fname}', () => {
        const exampleName = 'Ries, Jim';
        const myName = Name.getNameFromString(exampleName, '{lname}, {fname}');
        expect(myName).toStrictEqual(new Name("Jim", "Ries"))
    });
    test('{lname}, {fname} {mname}', () => {
        const exampleName = 'Ries, Jim E';
        const myName = Name.getNameFromString(exampleName, '{lname}, {fname} {mname}');
        expect(myName).toStrictEqual(new Name("Jim", "Ries", ["E"]))
    });
    test('{lname}, {fname} {mname} with more than 1 middle name', () => {
        const exampleName = 'Ries, Jim Edward Smitty';
        const myName = Name.getNameFromString(exampleName, '{lname}, {fname} {mname}');
        expect(myName).toStrictEqual(new Name("Jim", "Ries", ["Edward", "Smitty"]))
    });
    test('{lname}, {fname} {mname} with no middle names', () => {
        const exampleName = 'Ries, Jim';
        const myName = Name.getNameFromString(exampleName, '{lname}, {fname} {mname}');
        expect(myName).toStrictEqual(new Name("Jim", "Ries"))
    });
    test('{lname}, {fname} {mname} with last name with spaces', () => {
        const exampleName = 'Ries Piece, Jim';
        const myName = Name.getNameFromString(exampleName, '{lname}, {fname} {mname}');
        expect(myName).toStrictEqual(new Name("Jim", "Ries Piece"))
    });
    test('{lname}, {fname} {mname} with last name having a dash', () => {
        const exampleName = 'Ries-Piece, Jim';
        const myName = Name.getNameFromString(exampleName, '{lname}, {fname} {mname}');
        expect(myName).toStrictEqual(new Name("Jim", "Ries-Piece"))
    });
    test('{lname}, {fname} {mname} with first name having a dash', () => {
        const exampleName = 'Ries, Jim-R';
        const myName = Name.getNameFromString(exampleName, '{lname}, {fname} {mname}');
        expect(myName).toStrictEqual(new Name("Jim-R", "Ries"))
    });

});
