import Predicate from './predicate';





type NormalisedPredicate = Predicate & { __normalisedPredicateBrand: any }
export default NormalisedPredicate;
