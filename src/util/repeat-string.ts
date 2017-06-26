




// TODO: doc... ES5 equivalent to ES6 String#repeat
export default function repeatString(str: string, count: number) {
    return Array(count + 1).join(str);
}
