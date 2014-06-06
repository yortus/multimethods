///<reference path="typings/bluebird/bluebird.d.ts" />


declare module Multimethods {

    // Synchronous API
    export interface Multimethod {
        (...args): any;
        override(types: any[], impl: (...args) => any): void;
    }

    export interface Options {
        name?: string;
        params: {
            name?: string;
            typeFamily: TypeFamily;
        }[];
        notFound?: (...args) => any;
    }

    export interface TypeFamily {
        name?: string;
        typeof: (value: any) => any;
        isa: (specialType: any, generalType: any) => boolean;
    }

    // Asynchronous API
    export interface AsyncMultimethod {
        (...args): Promise.Thenable<any>;
        override(types: any[], impl: (...args) => Promise.Thenable<any>): void;
    }

    export interface AsyncOptions {
        name?: string;
        params: {
            name?: string;
            typeFamily: AsyncTypeFamily;
        }[];
        notFound?: (...args) => Promise.Thenable<any>;
    }

    export interface AsyncTypeFamily {
        name?: string;
        typeof: (value: any) => Promise.Thenable<any>;
        isa: (specialType: any, generalType: any) => Promise.Thenable<boolean>;
    }
}


declare module "multimethods" {
    export function create(options: Multimethods.Options): Multimethods.Multimethod;
    export function createAsync(options: Multimethods.AsyncOptions): Multimethods.AsyncMultimethod;
}
