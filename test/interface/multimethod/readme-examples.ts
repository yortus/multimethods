import {expect} from 'chai';
import {Multimethod} from 'multimethods';




describe('Wikipedia multimethod example', () => {

    interface SpaceObject { type: string; }
    interface Asteroid extends SpaceObject { type: 'asteroid', /* ...more props */ }
    interface Spaceship extends SpaceObject { type: 'spaceship', /* ...more props */ }

    const collideWith = Multimethod((x: SpaceObject, y: SpaceObject) => `${x.type}/${y.type}`).extend({
        'asteroid/asteroid': (_, _x: Asteroid, _y: Asteroid) => 'bounce',
        'asteroid/spaceship': (_, _x: Asteroid, _y: Spaceship) => 'boom',
        'spaceship/asteroid': (_, _x: Spaceship, _y: Asteroid) => 'boom',
        'spaceship/spaceship': (_, _x: Spaceship, _y: Spaceship) => 'board',
        '{type1}/{type2}': ({type1, type2}) => { throw new Error(`Don't know how to collide ${type1} with ${type2}`); },
    });

    it('Collides known object types correctly', () => {
        let asteroid = {type: 'asteroid'};
        let spaceship = {type: 'spaceship'};
        expect(collideWith(asteroid, asteroid)).to.equal('bounce');
        expect(collideWith(asteroid, spaceship)).to.equal('boom');
        expect(collideWith(spaceship, asteroid)).to.equal('boom');
        expect(collideWith(spaceship, spaceship)).to.equal('board');
    });

    it('Collides unknown object types correctly', () => {
        let asteroid = {type: 'asteroid'};
        let spaceJunk = {type: 'spaceJunk'};
        let getResult = () => collideWith(asteroid, spaceJunk);
        expect(getResult).to.throw();
    });
});
