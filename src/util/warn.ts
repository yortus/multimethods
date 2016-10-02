




// TODO: doc...
export default function warn(message: string) {
    if (!behaviour) return;
    behaviour(message);
}





// TODO: doc...
export function setWarnBehaviour(value: (message: string) => void) {
    behaviour = value;
}





// TODO: doc...
let behaviour: (message: string) => void;
