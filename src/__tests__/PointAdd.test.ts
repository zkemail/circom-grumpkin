jest.setTimeout(120000)
// import { getPublicKey, Point } from '@noble/secp256k1';
const crypto = require('crypto')
const ff = require('ffjavascript')
const stringifyBigInts = ff.utils.stringifyBigInts
// import {
//     callGenWitness as genWitness,
//     callGetSignalByName as getSignalByName,
// } from 'circom-helper'
import * as path from "path";
import { hash_to_field, map_to_curve, point_add, str_to_array } from "..";
const circom_tester = require("circom_tester");
const wasm_tester = circom_tester.wasm;


// const p = BigInt('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F')

// const sk0 = BigInt('88549154299169935420064281163296845505587953610183896504176354567359434168161')
// const pk0 = Point.fromPrivateKey(sk0)
// const sk1 = BigInt('37706893564732085918706190942542566344879680306879183356840008504374628845468')
// const pk1 = Point.fromPrivateKey(sk1)

describe('PointAdd', () => {
    it('a + b where a != b', async () => {
        const circuit = await wasm_tester(path.join(__dirname, "../../circuits/test/point_add_test.circom"));
        const msg = str_to_array("abc");
        const us = hash_to_field(msg);
        const point0 = map_to_curve(us[0]);
        const point1 = map_to_curve(us[1]);
        const circuitInputs = stringifyBigInts({
            a: [point0.x, point0.y],
            b: [point1.x, point1.y],
        });
        const witness = await circuit.calculateWitness(circuitInputs);
        await circuit.checkConstraints(witness);
        const expected_point = point_add(point0.x, point0.y, point1.x, point1.y);
        expect(witness[1]).toEqual(expected_point.x);
        expect(witness[2]).toEqual(expected_point.y);
        // // From https://www.ietf.org/archive/id/draft-irtf-cfrg-hash-to-curve-13.html#appendix-J.8.1
        // const expected_x_array = bigint_to_array(64, 4, BigInt('0xc1cae290e291aee617ebaef1be6d73861479c48b841eaba9b7b5852ddfeb1346'))
        // const expected_y_array = bigint_to_array(64, 4, BigInt('0x64fa678e07ae116126f08b022a94af6de15985c996c3a91b64c406a960e51067'))

        // const a: any[] = [
        //     bigint_to_array(64, 4, BigInt('0x74519ef88b32b425a095e4ebcc84d81b64e9e2c2675340a720bb1a1857b99f1e')),
        //     bigint_to_array(64, 4, BigInt('0xc174fa322ab7c192e11748beed45b508e9fdb1ce046dee9c2cd3a2a86b410936')),
        // ]
        // const b: any[] = [
        //     bigint_to_array(64, 4, BigInt('0x44548adb1b399263ded3510554d28b4bead34b8cf9a37b4bd0bd2ba4db87ae63')),
        //     bigint_to_array(64, 4, BigInt('0x96eb8e2faf05e368efe5957c6167001760233e6dd2487516b46ae725c4cce0c6')),
        // ]

        // const circuitInputs = stringifyBigInts({ a, b })
        // const witness = await genWitness(circuit, circuitInputs)
        // for (let i = 0; i < 4; i++) {
        //     const out0 = BigInt(await getSignalByName(circuit, witness, 'main.out[0][' + i.toString() + ']'))
        //     expect(out0).toEqual(expected_x_array[i])
        //     const out1 = BigInt(await getSignalByName(circuit, witness, 'main.out[1][' + i.toString() + ']'))
        //     expect(out1).toEqual(expected_y_array[i])
        // }
    })

    it('(a + b) + c == (b + c) + a', async () => {
        const circuit = await wasm_tester(path.join(__dirname, "../../circuits/test/point_add_test.circom"));
        const msg1 = str_to_array("abc");
        const us0 = hash_to_field(msg1);
        const point0 = map_to_curve(us0[0]);
        const point1 = map_to_curve(us0[1]);
        const msg2 = str_to_array("def");
        const us1 = hash_to_field(msg2);
        const point2 = map_to_curve(us1[0]);
        const circuitInputs0 = stringifyBigInts({
            a: [point0.x, point0.y],
            b: [point1.x, point1.y],
        });
        const witness0 = await circuit.calculateWitness(circuitInputs0);
        await circuit.checkConstraints(witness0);
        const circuitInputs1 = stringifyBigInts({
            a: [witness0[1], witness0[2]],
            b: [point2.x, point2.y],
        });
        const witness1 = await circuit.calculateWitness(circuitInputs1);
        await circuit.checkConstraints(witness1);
        let expected_point = point_add(point1.x, point1.y, point2.x, point2.y);
        expected_point = point_add(expected_point.x, expected_point.y, point0.x, point0.y);
        expect(witness1[1]).toEqual(expected_point.x);
        expect(witness1[2]).toEqual(expected_point.y);
        // // From https://www.ietf.org/archive/id/draft-irtf-cfrg-hash-to-curve-13.html#appendix-J.8.1
        // const expected_x_array = bigint_to_array(64, 4, BigInt('0xc1cae290e291aee617ebaef1be6d73861479c48b841eaba9b7b5852ddfeb1346'))
        // const expected_y_array = bigint_to_array(64, 4, BigInt('0x64fa678e07ae116126f08b022a94af6de15985c996c3a91b64c406a960e51067'))

        // const a: any[] = [
        //     bigint_to_array(64, 4, BigInt('0x74519ef88b32b425a095e4ebcc84d81b64e9e2c2675340a720bb1a1857b99f1e')),
        //     bigint_to_array(64, 4, BigInt('0xc174fa322ab7c192e11748beed45b508e9fdb1ce046dee9c2cd3a2a86b410936')),
        // ]
        // const b: any[] = [
        //     bigint_to_array(64, 4, BigInt('0x44548adb1b399263ded3510554d28b4bead34b8cf9a37b4bd0bd2ba4db87ae63')),
        //     bigint_to_array(64, 4, BigInt('0x96eb8e2faf05e368efe5957c6167001760233e6dd2487516b46ae725c4cce0c6')),
        // ]

        // const circuitInputs = stringifyBigInts({ a, b })
        // const witness = await genWitness(circuit, circuitInputs)
        // for (let i = 0; i < 4; i++) {
        //     const out0 = BigInt(await getSignalByName(circuit, witness, 'main.out[0][' + i.toString() + ']'))
        //     expect(out0).toEqual(expected_x_array[i])
        //     const out1 = BigInt(await getSignalByName(circuit, witness, 'main.out[1][' + i.toString() + ']'))
        //     expect(out1).toEqual(expected_y_array[i])
        // }
    })


    // it('Q0 and Q1 where msg = "abc"', async () => {
    //     // From https://www.ietf.org/archive/id/draft-irtf-cfrg-hash-to-curve-13.html#appendix-J.8.1
    //     const expected_x_array = bigint_to_array(64, 4, BigInt('0x3377e01eab42db296b512293120c6cee72b6ecf9f9205760bd9ff11fb3cb2c4b'))
    //     const expected_y_array = bigint_to_array(64, 4, BigInt('0x7f95890f33efebd1044d382a01b1bee0900fb6116f94688d487c6c7b9c8371f6'))

    //     const a: any[] = [
    //         bigint_to_array(64, 4, BigInt('0x07dd9432d426845fb19857d1b3a91722436604ccbbbadad8523b8fc38a5322d7')),
    //         bigint_to_array(64, 4, BigInt('0x604588ef5138cffe3277bbd590b8550bcbe0e523bbaf1bed4014a467122eb33f')),
    //     ]
    //     const b: any[] = [
    //         bigint_to_array(64, 4, BigInt('0xe9ef9794d15d4e77dde751e06c182782046b8dac05f8491eb88764fc65321f78')),
    //         bigint_to_array(64, 4, BigInt('0xcb07ce53670d5314bf236ee2c871455c562dd76314aa41f012919fe8e7f717b3')),
    //     ]

    //     const circuitInputs = stringifyBigInts({ a, b })
    //     const witness = await genWitness(circuit, circuitInputs)
    //     for (let i = 0; i < 4; i++) {
    //         const out0 = BigInt(await getSignalByName(circuit, witness, 'main.out[0][' + i.toString() + ']'))
    //         expect(out0).toEqual(expected_x_array[i])
    //         const out1 = BigInt(await getSignalByName(circuit, witness, 'main.out[1][' + i.toString() + ']'))
    //         expect(out1).toEqual(expected_y_array[i])
    //     }
    // })

    // it('a + b where a == b should not work', async () => {
    //     const expected_point = pk0.add(pk0)
    //     const expected_x_array = bigint_to_array(64, 4, expected_point.x)
    //     const expected_y_array = bigint_to_array(64, 4, expected_point.y)

    //     const a: any[] = [
    //         bigint_to_array(64, 4, pk0.x),
    //         bigint_to_array(64, 4, pk0.y),
    //     ]
    //     const b: any[] = [
    //         bigint_to_array(64, 4, pk0.x),
    //         bigint_to_array(64, 4, pk0.y),
    //     ]

    //     const circuitInputs = stringifyBigInts({ a, b })
    //     const witness = await genWitness(circuit, circuitInputs)
    //     for (let i = 0; i < 4; i++) {
    //         const out0 = BigInt(await getSignalByName(circuit, witness, 'main.out[0][' + i.toString() + ']'))
    //         expect(out0).not.toEqual(expected_x_array[i])
    //         const out1 = BigInt(await getSignalByName(circuit, witness, 'main.out[1][' + i.toString() + ']'))
    //         expect(out1).not.toEqual(expected_y_array[i])
    //     }
    // })
})
